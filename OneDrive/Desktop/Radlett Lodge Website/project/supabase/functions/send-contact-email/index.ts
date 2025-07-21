// Define CORS headers directly in this file
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  interested: boolean;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Contact form function called!");
    
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse the request body
    const formData: ContactFormData = await req.json();
    console.log('Form data received:', { name: formData.name, email: formData.email, subject: formData.subject });

    // Validate required fields
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Email configuration - try environment variables first, then fallback to hardcoded
    const emailServiceApiKey = Deno.env.get('EMAIL_SERVICE_API_KEY') || 're_6DGfYf7Q_Cn2vVDJqdtLt3rep24GkMXxX';
    const senderAddress = Deno.env.get('EMAIL_SENDER_ADDRESS') || 'onboarding@resend.dev';
    const recipientAddress = Deno.env.get('EMAIL_RECIPIENT_ADDRESS') || 'radlettlodge6652@gmail.com';

    console.log('Email config:', {
      hasApiKey: !!emailServiceApiKey,
      sender: senderAddress,
      recipient: recipientAddress
    });

    // Construct email content
    const emailSubject = `Contact Form: ${formData.subject}`;
    const emailBody = `
New contact form submission from Radlett Lodge website:

Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone || 'Not provided'}
Subject: ${formData.subject}

Message:
${formData.message}

${formData.interested ? '✓ Interested in becoming a Freemason' : '✗ Not interested in membership at this time'}

---
This message was sent via the Radlett Lodge No. 6652 website contact form.
    `.trim();

    console.log('Sending email via Resend...');

    // Send email using Resend API
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${emailServiceApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `Radlett Lodge Website <${senderAddress}>`,
        to: [recipientAddress],
        reply_to: formData.email,
        subject: emailSubject,
        text: emailBody,
      }),
    });

    console.log('Resend API response status:', emailResponse.status);

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('Resend API error:', {
        status: emailResponse.status,
        statusText: emailResponse.statusText,
        body: errorText
      });
      
      return new Response(
        JSON.stringify({ 
          error: 'Failed to send email',
          details: `Resend API returned ${emailResponse.status}: ${errorText}`
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const emailResult = await emailResponse.json();
    console.log('Email sent successfully:', emailResult);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully',
        id: emailResult.id || 'unknown'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});