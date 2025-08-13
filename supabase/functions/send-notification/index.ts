import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationRequest {
  title: string
  body: string
  data?: any
  userIds?: string[]
  category?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { title, body, data, userIds, category }: NotificationRequest = await req.json()

    // Get push tokens from database
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    let query = supabase
      .from('push_tokens')
      .select('token, user_id')
      .eq('is_active', true)

    // Filter by user IDs if provided
    if (userIds && userIds.length > 0) {
      query = query.in('user_id', userIds)
    }

    const { data: tokens, error } = await query

    if (error) {
      throw error
    }

    if (!tokens || tokens.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No active push tokens found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Prepare notification messages
    const messages = tokens.map(({ token }) => ({
      to: token,
      sound: 'default',
      title,
      body,
      data: {
        ...data,
        category,
      },
    }))

    // Send notifications to Expo Push API
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    })

    const result = await response.json()

    // Log notification in database
    await supabase.from('notification_logs').insert({
      title,
      body,
      category,
      recipient_count: tokens.length,
      sent_at: new Date().toISOString(),
    })

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: tokens.length,
        result 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})