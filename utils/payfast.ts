import * as Crypto from 'expo-crypto';

export interface PayFastData {
  merchant_id: string;
  merchant_key: string;
  amount: string;
  item_name: string;
  item_description?: string;
  name_first: string;
  name_last: string;
  email_address: string;
  m_payment_id: string;
  custom_str1?: string;
  custom_str2?: string;
  custom_str3?: string;
  custom_int1?: string;
  custom_int2?: string;
  custom_int3?: string;
  custom_int4?: string;
  custom_int5?: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
}

export const PAYFAST_URLS = {
  sandbox: 'https://sandbox.payfast.co.za/eng/process',
  live: 'https://www.payfast.co.za/eng/process',
};

export async function generateSignature(data: PayFastData, passphrase?: string): Promise<string> {
  // PayFast signature generation per official documentation
  // Reference: https://developers.payfast.co.za/docs
  // IMPORTANT: Use NATURAL ORDER, not alphabetical (that's for API, not forms)
  
  const params: string[] = [];
  
  // Define the correct order as per PayFast documentation
  const fieldOrder = [
    'merchant_id',
    'merchant_key', 
    'return_url',
    'cancel_url',
    'notify_url',
    'name_first',
    'name_last',
    'email_address',
    'm_payment_id',
    'amount',
    'item_name',
    'item_description',
    'custom_str1',
    'custom_str2', 
    'custom_str3',
    'custom_int1',
    'custom_int2',
    'custom_int3',
    'custom_int4',
    'custom_int5'
  ];
  
  // Process fields in the correct order, exclude empty values
  fieldOrder.forEach(key => {
    const value = data[key as keyof PayFastData];
    // Only include non-empty values (PayFast requirement)
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      // URL encode the value as per PayFast requirements
      // PayFast requires spaces as '+' and uppercase hex encoding
      const encodedValue = encodeURIComponent(String(value).trim())
        .replace(/%20/g, '+')  // Replace %20 with + for spaces
        .replace(/%([0-9A-F]{2})/g, (match, hex) => `%${hex.toUpperCase()}`); // Uppercase hex
      params.push(`${key}=${encodedValue}`);
    }
  });

  // Create parameter string
  let paramString = params.join('&');
  
  // Add passphrase at the end if provided (URL encoded)
  if (passphrase && passphrase.trim() !== '') {
    const encodedPassphrase = encodeURIComponent(passphrase.trim())
      .replace(/%20/g, '+')  // Replace %20 with + for spaces
      .replace(/%([0-9A-F]{2})/g, (match, hex) => `%${hex.toUpperCase()}`); // Uppercase hex
    paramString += `&passphrase=${encodedPassphrase}`;
  }
  
  console.log('PayFast signature string:', paramString);
  console.log('PayFast signature string length:', paramString.length);
  
  // Generate MD5 hash (PayFast uses MD5)
  const signature = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.MD5,
    paramString
  );

  console.log('Generated signature:', signature);
  return signature;
}

export async function generatePayFastForm(paymentData: PayFastData, passphrase: string): Promise<string> {
  try {
    console.log('=== PayFast Payment Generation ===');
    console.log('Payment data:', paymentData);
    
    // Generate signature
    const signature = await generateSignature(paymentData, passphrase);
    
    // Add signature to payment data
    const dataWithSignature = {
      ...paymentData,
      signature,
    };
    
    // Determine URL based on sandbox mode
    const isSandbox = process.env.EXPO_PUBLIC_PAYFAST_SANDBOX === 'true';
    const baseUrl = isSandbox ? PAYFAST_URLS.sandbox : PAYFAST_URLS.live;
    console.log('Using PayFast URL:', baseUrl);

    // Create query string with PayFast-specific URL encoding
    const queryString = Object.keys(dataWithSignature)
      .map(key => {
        const value = dataWithSignature[key as keyof typeof dataWithSignature];
        // Use PayFast-specific encoding (spaces as +, uppercase hex)
        const encodedValue = encodeURIComponent(value as string)
          .replace(/%20/g, '+')  // Replace %20 with + for spaces
          .replace(/%([0-9A-F]{2})/g, (match, hex) => `%${hex.toUpperCase()}`); // Uppercase hex
        return `${key}=${encodedValue}`;
      })
      .join('&');

    const finalUrl = `${baseUrl}?${queryString}`;
    console.log('Final PayFast URL length:', finalUrl.length);
    
    return finalUrl;
  } catch (error) {
    console.error('Error generating PayFast form:', error);
    throw error;
  }
}

export function createPayFastData(
  amount: number,
  categoryTitle: string,
  categoryDescription: string,
  userFirstName: string,
  userLastName: string,
  userEmail: string,
  categoryId: string,
  userId: string,
  isRecurring: boolean = false
): PayFastData {
  const isSandbox = process.env.EXPO_PUBLIC_PAYFAST_SANDBOX === 'true';
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;

  // Get credentials based on mode
  const merchantId = isSandbox 
    ? process.env.EXPO_PUBLIC_PAYFAST_SANDBOX_MERCHANT_ID || '10000100'
    : process.env.EXPO_PUBLIC_PAYFAST_LIVE_MERCHANT_ID || '12341478';
    
  const merchantKey = isSandbox 
    ? process.env.EXPO_PUBLIC_PAYFAST_SANDBOX_MERCHANT_KEY || '46f0cd694581a'
    : process.env.EXPO_PUBLIC_PAYFAST_LIVE_MERCHANT_KEY || 'dvjwszxop9v3h';

  if (!merchantId || !merchantKey || !supabaseUrl) {
    throw new Error('PayFast configuration is missing. Please check your environment variables.');
  }

  console.log('PayFast Mode:', isSandbox ? 'SANDBOX' : 'LIVE');
  console.log('Using Merchant ID:', merchantId);

  return {
    merchant_id: merchantId,
    merchant_key: merchantKey,
    amount: amount.toFixed(2),
    item_name: `Donation to ${categoryTitle}`,
    item_description: categoryDescription,
    name_first: userFirstName,
    name_last: userLastName,
    email_address: userEmail,
    m_payment_id: `donation_${Date.now()}_${userId}`,
    custom_str1: categoryId,
    custom_str2: userId,
    custom_str3: isRecurring ? 'monthly' : 'once-off',
    return_url: 'https://destinyworshipcentre.co.za/donation-success',
    cancel_url: 'https://destinyworshipcentre.co.za/donation-cancelled',
    notify_url: `${supabaseUrl}/functions/v1/payfast-webhook`,
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 0,
  }).format(amount);
}

export async function validateSignature(
  data: Record<string, string>,
  signature: string,
  passphrase: string
): Promise<boolean> {
  try {
    const generatedSignature = await generateSignature(data as unknown as PayFastData, passphrase);
    return generatedSignature === signature;
  } catch (error) {
    console.error('Error validating signature:', error);
    return false;
  }
}

export function validateWebhookData(data: Record<string, any>): boolean {
  const requiredFields = [
    'm_payment_id',
    'pf_payment_id',
    'payment_status',
    'amount_gross',
    'signature'
  ];

  return requiredFields.every(field => data[field] !== undefined && data[field] !== '');
}