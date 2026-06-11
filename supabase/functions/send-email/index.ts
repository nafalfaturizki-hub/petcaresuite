import { createTransport } from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be defined');
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false }
});

interface SendEmailPayload {
  to: string;
  subject: string;
  html: string;
  userId: string;
}

async function loadSmtpConfig() {
  const { data, error } = await supabase.from('settings').select('key, value').eq('key', 'smtp_config').single();

  if (error) {
    throw new Error(error.message);
  }

  return data?.value;
}

async function insertNotificationLog(payload: {
  userId: string;
  channel: string;
  recipient: string;
  templateKey: string;
  status: string;
  errorMessage?: string | null;
}) {
  const { error } = await supabase.from('notifications_log').insert([
    {
      user_id: payload.userId,
      channel: payload.channel,
      recipient: payload.recipient,
      template_key: payload.templateKey,
      payload: { subject: payload.templateKey === 'send_email' ? payload.recipient : null },
      status: payload.status,
      error_message: payload.errorMessage || null,
      sent_at: new Date().toISOString()
    }
  ]);

  if (error) {
    console.error('Failed to insert notification log:', error.message);
  }
}

async function sendViaRelay(config: any, payload: SendEmailPayload) {
  if (!config?.relay_url) {
    throw new Error('SMTP relay configuration is incomplete');
  }

  const response = await fetch(config.relay_url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(config.api_key ? { Authorization: config.api_key } : {})
    },
    body: JSON.stringify({
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      from: config.from
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`SMTP relay error: ${response.status} ${body}`);
  }

  return response.json();
}

async function sendViaNodemailer(config: any, payload: SendEmailPayload) {
  if (!config?.host || !config?.port || !config?.user || !config?.password) {
    throw new Error('SMTP configuration is incomplete');
  }

  const transporter = createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure ?? false,
    auth: {
      user: config.user,
      pass: config.password
    }
  });

  return transporter.sendMail({
    from: config.from || config.user,
    to: payload.to,
    subject: payload.subject,
    html: payload.html
  });
}

export async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const payload = (await request.json()) as SendEmailPayload;

  if (!payload?.to || !payload?.subject || !payload?.html || !payload?.userId) {
    return new Response(JSON.stringify({ success: false, message: 'Missing required payload' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const smtpConfig = await loadSmtpConfig();
  if (!smtpConfig) {
    return new Response(JSON.stringify({ success: false, message: 'SMTP configuration not found' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const result = smtpConfig.relay_url
      ? await sendViaRelay(smtpConfig, payload)
      : await sendViaNodemailer(smtpConfig, payload);

    await insertNotificationLog({
      userId: payload.userId,
      channel: 'email',
      recipient: payload.to,
      templateKey: 'send_email',
      status: 'sent'
    });

    return new Response(JSON.stringify({ success: true, message: 'Email sent', result }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Email send failed';

    await insertNotificationLog({
      userId: payload.userId,
      channel: 'email',
      recipient: payload.to,
      templateKey: 'send_email',
      status: 'failed',
      errorMessage: message
    });

    return new Response(JSON.stringify({ success: false, message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
