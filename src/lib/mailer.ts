import nodemailer, { Transporter } from 'nodemailer';

let cachedTransporter: Transporter | null = null;

function required(name: string, value: string | undefined) {
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export function getMailer(): Transporter {
  if (cachedTransporter) return cachedTransporter;

  const host = required('MAIL_HOST', process.env.MAIL_HOST);
  const portStr = required('MAIL_PORT', process.env.MAIL_PORT);
  const user = required('MAIL_USER', process.env.MAIL_USER);
  const pass = required('MAIL_PASS', process.env.MAIL_PASS);

  const port = Number(portStr);

  const transporter = nodemailer.createTransport({
    host,
    secure: false,
    port,
    auth: { user, pass },
    tls: {
      rejectUnauthorized: false, // for mkcert self-signed cert
    },
  });

  // Optionally verify on startup in dev to catch config errors early
  if (process.env.NODE_ENV !== 'production') {
    transporter.verify().catch((err: unknown) => {
      const message = err instanceof Error ? err.message : String(err);
      console.warn('[mailer] Transporter verification failed:', message);
    });
  }

  cachedTransporter = transporter;
  return cachedTransporter;
}

export function getMailFrom() {
  const email = process.env.MAIL_FROM_EMAIL || 'no-reply@example.com';
  const name = process.env.MAIL_FROM_NAME || 'RankStage';
  return { name, address: email };
}
