import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PayFastNotification {
  m_payment_id: string
  pf_payment_id: string
  payment_status: string
  item_name: string
  item_description: string
  amount_gross: string
  amount_fee: string
  amount_net: string
  custom_str1?: string
  custom_str2?: string
  custom_str3?: string
  custom_str4?: string
  custom_str5?: string
  name_first: string
  name_last: string
  email_address: string
  merchant_id: string
  signature: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Parse the form data from PayFast
    const formData = await req.formData()
    const notification: Partial<PayFastNotification> = {}
    
    for (const [key, value] of formData.entries()) {
      notification[key as keyof PayFastNotification] = value as string
    }

    console.log('PayFast notification received:', notification)

    // Validate the merchant ID based on environment
    const isSandbox = Deno.env.get('EXPO_PUBLIC_PAYFAST_SANDBOX') === 'true'
    const expectedMerchantId = '12341478' // Production merchant ID
    
    console.log('Expected merchant ID:', expectedMerchantId);
    console.log('Received merchant ID:', notification.merchant_id);
    
    if (notification.merchant_id !== expectedMerchantId) {
      throw new Error(`Invalid merchant ID. Expected: ${expectedMerchantId}, Received: ${notification.merchant_id}`);
    }

    // Extract donation information from m_payment_id
    const paymentId = notification.m_payment_id
    if (!paymentId) {
      throw new Error('Missing payment ID')
    }

    // Update donation status in database
    const { data: donation, error: fetchError } = await supabase
      .from('donations')
      .select('*')
      .eq('payment_reference', paymentId)
      .single()

    if (fetchError) {
      console.error('Error fetching donation:', fetchError)
      // Create new donation record if not found
      const { error: insertError } = await supabase
        .from('donations')
        .insert({
          payment_reference: paymentId,
          pf_payment_id: notification.pf_payment_id,
          amount: parseFloat(notification.amount_gross || '0'),
          payment_method: 'payfast',
          status: notification.payment_status?.toLowerCase() || 'pending',
          donor_name: `${notification.name_first} ${notification.name_last}`,
          donor_email: notification.email_address,
          item_name: notification.item_name,
          item_description: notification.item_description,
          amount_fee: parseFloat(notification.amount_fee || '0'),
          amount_net: parseFloat(notification.amount_net || '0'),
          processed_at: new Date().toISOString(),
        })

      if (insertError) {
        throw insertError
      }
    } else {
      // Update existing donation
      const { error: updateError } = await supabase
        .from('donations')
        .update({
          pf_payment_id: notification.pf_payment_id,
          status: notification.payment_status?.toLowerCase() || 'pending',
          amount_fee: parseFloat(notification.amount_fee || '0'),
          amount_net: parseFloat(notification.amount_net || '0'),
          processed_at: new Date().toISOString(),
        })
        .eq('id', donation.id)

      if (updateError) {
        throw updateError
      }
    }

    // If payment is complete, update giving category raised amount
    if (notification.payment_status === 'COMPLETE') {
      // Extract category from item_name or custom fields
      const amount = parseFloat(notification.amount_gross || '0')
      
      // You might want to store category_id in custom_str1 for better tracking
      if (notification.custom_str1) {
        const { error: categoryError } = await supabase.rpc(
          'update_category_raised_amount',
          {
            category_id: notification.custom_str1,
            donation_amount: amount,
          }
        )

        if (categoryError) {
          console.error('Error updating category amount:', categoryError)
        }
      }

      // Send thank you notification (optional)
      try {
        await supabase.functions.invoke('send-notification', {
          body: {
            title: 'Thank You for Your Donation!',
            body: `Your donation of R${amount} has been received. God bless you!`,
            userIds: donation?.user_id ? [donation.user_id] : undefined,
            category: 'giving',
          },
        })
      } catch (notificationError) {
        console.error('Error sending thank you notification:', notificationError)
      }
    }

    return new Response('OK', {
      status: 200,
      headers: corsHeaders,
    })

  } catch (error) {
    console.error('PayFast webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})