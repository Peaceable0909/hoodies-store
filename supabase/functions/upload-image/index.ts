// Supabase Edge Function — upload-image
// Runs on Supabase servers. Service key never touches the browser.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Verify the caller is a logged-in admin
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Use anon client to verify the JWT token
    const anonClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
    )
    const { data: { user }, error: authError } = await anonClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid session' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 2. Parse the uploaded file from FormData
    const formData  = await req.formData()
    const file      = formData.get('file') as File
    const bucket    = (formData.get('bucket')  as string) || 'product-images'
    const folder    = (formData.get('folder')  as string) || 'uploads'

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 3. Upload using the service role key (only exists server-side)
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const ext         = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const fileName    = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const arrayBuffer = await file.arrayBuffer()

    const { error: uploadError } = await adminClient.storage
      .from(bucket)
      .upload(fileName, arrayBuffer, {
        contentType: file.type || 'image/jpeg',
        upsert: true,
      })

    if (uploadError) throw uploadError

    // 4. Return the public URL
    const { data: { publicUrl } } = adminClient.storage
      .from(bucket)
      .getPublicUrl(fileName)

    return new Response(JSON.stringify({ url: publicUrl }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
