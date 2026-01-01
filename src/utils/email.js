import nodemailer from 'nodemailer'

const getTransporter = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) return null

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465, // true for 465, false for other ports
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  })
}

export async function sendEmail({ to, subject, text, html }) {
  const transporter = getTransporter()
  if (!transporter) {
    // fallback for dev: log the message
    console.log('sendEmail (skipped - no SMTP configured):', { to, subject, text, html })
    return { ok: true, info: null }
  }

  const from = process.env.EMAIL_FROM || process.env.SMTP_USER

  const info = await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  })

  return { ok: true, info }
}

export async function sendVerificationEmail(toEmail, token) {
  const base = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || ''
  const verifyLink = `${base}/auth/verify?token=${encodeURIComponent(token)}`
  const subject = 'Verify your email'
  const text = `Please verify your email by visiting: ${verifyLink}`
  const html = `
    <div style="font-family: Arial, sans-serif; color: #111;">
      <h2>Verify your email</h2>
      <p>Click the link below to verify your email address:</p>
      <p><a href="${verifyLink}" target="_blank" rel="noopener">Verify Email</a></p>
      <p>If the above link doesn't work, copy-paste this token into the app: ${token}</p>
    </div>
  `
  try {
    return await sendEmail({ to: toEmail, subject, text, html })
  } catch (e) {
    console.error('sendVerificationEmail error', e)
    return { ok: false, error: e }
  }
}

export function buildInviteHtml({ inviterName, storeName, inviteLink, role, note }) {
  return `
    <div style="font-family: Arial, sans-serif; color: #111;">
      <h2>${inviterName} invited you to join ${storeName}</h2>
      <p>Role: <strong>${role}</strong></p>
      ${note ? `<p>Note: ${note}</p>` : ''}
      <p><a href="${inviteLink}" target="_blank" rel="noopener">Accept invite</a></p>
      <p>If the link doesn't work, copy-paste this token into the app: ${inviteLink}</p>
    </div>
  `
}

export function buildInviteText({ inviterName, storeName, inviteLink, role, note }) {
  return `${inviterName} invited you to join ${storeName}\nRole: ${role}\n${note ? note + '\n' : ''}Accept using: ${inviteLink}`
}

export default { sendEmail, buildInviteHtml, buildInviteText }
