// app/routes/contact.jsx
import { json } from "@remix-run/server-runtime";
import { Form, useLoaderData, useActionData, useNavigation } from "@remix-run/react";
import { Resend } from 'resend';
import { useTheme } from '~/components/PageLayout';
import {Turnstile} from '@marsidev/react-turnstile';
import { z } from "zod";

export const meta = () => [{title: 'Ljud & Bild Hörnan | Kontakt'}];

export async function loader({context}) {
  return json({ turnstileSiteKey: context.env.VITE_TURNSTILE_SITE_KEY });
}

export async function action({ request, context }) {
  const formData = await request.formData();
  const formValues = Object.fromEntries(formData);

  const contactSchema = z.object({
    name: z.string().trim().min(2, "Ange ditt namn."),
    email: z.string().trim().email("Ange en giltig e-postadress."),
    phone: z.string().trim().optional(),
    subject: z.string().trim().min(2, "Ange ett ämne."),
    message: z.string().trim().min(2, "Ange ett meddelande."),
  })

  const validationResult = contactSchema.safeParse(formValues);

  if( !validationResult.success ) {
    return json({ errors: validationResult.error.flatten() }, { status: 400 });
  }

  const { name, email, phone, subject, message } = validationResult.data;

  const token = formValues['cf-turnstile-response'];

  const verifyRes = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret: context.env.VITE_TURNSTILE_SECRET_KEY,
        response: token,
      }),
    }
  );

  const verifyData = await verifyRes.json();

  if (!verifyData.success) {
    return json({ error: 'Ogiltig captcha.' }, { status: 400 });
  }

  const resend = new Resend(context.env.RESEND_API_KEY);

  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: context.env.CONTACT_FORM_TO,
    subject: `Nytt kontaktformulärsmeddelande: ${subject}`,
    html: `
      <!DOCTYPE html>
      <html lang="sv">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Nytt meddelande</title>
      </head>
      <body style="margin:0;padding:0;background:#111111;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">

        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#111111;padding:48px 24px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">

                <!-- Header -->
                <tr>
                  <td style="padding-bottom:32px;border-bottom:1px solid #222222;">
                    <p style="margin:0 0 12px 0;font-size:10px;font-weight:600;letter-spacing:0.22em;text-transform:uppercase;color:#7AC9EF;">
                      Ljud &amp; Bild Hörnan
                    </p>
                    <h1 style="margin:0;font-size:28px;font-weight:300;color:#ffffff;line-height:1.2;letter-spacing:-0.01em;">
                      Nytt kontaktmeddelande
                    </h1>
                  </td>
                </tr>

                <!-- Fields -->
                <tr>
                  <td style="padding:32px 0;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">

                      <!-- Name -->
                      <tr>
                        <td style="padding-bottom:24px;">
                          <p style="margin:0 0 6px 0;font-size:9px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:#7AC9EF;">
                            Namn
                          </p>
                          <p style="margin:0;font-size:15px;font-weight:300;color:#ffffff;line-height:1.5;">
                            ${name}
                          </p>
                        </td>
                      </tr>

                      <tr><td style="padding-bottom:24px;border-bottom:1px solid #222222;"></td></tr>
                      <tr><td style="padding-bottom:24px;"></td></tr>

                      <!-- Email -->
                      <tr>
                        <td style="padding-bottom:24px;">
                          <p style="margin:0 0 6px 0;font-size:9px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:#7AC9EF;">
                            E-post
                          </p>
                          <p style="margin:0;font-size:15px;font-weight:300;line-height:1.5;">
                            <a href="mailto:${email}" style="color:#7AC9EF;text-decoration:none;">${email}</a>
                          </p>
                        </td>
                      </tr>

                      <tr><td style="padding-bottom:24px;border-bottom:1px solid #222222;"></td></tr>
                      <tr><td style="padding-bottom:24px;"></td></tr>

                      <!-- Phone -->
                      <tr>
                        <td style="padding-bottom:24px;">
                          <p style="margin:0 0 6px 0;font-size:9px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:#7AC9EF;">
                            Telefon
                          </p>
                          <p style="margin:0;font-size:15px;font-weight:300;color:#ffffff;line-height:1.5;">
                            ${phone || "Ej angivet"}
                          </p>
                        </td>
                      </tr>

                      <tr><td style="padding-bottom:24px;border-bottom:1px solid #222222;"></td></tr>
                      <tr><td style="padding-bottom:24px;"></td></tr>

                      <!-- Subject -->
                      <tr>
                        <td style="padding-bottom:24px;">
                          <p style="margin:0 0 6px 0;font-size:9px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:#7AC9EF;">
                            Ämne
                          </p>
                          <p style="margin:0;font-size:15px;font-weight:300;color:#ffffff;line-height:1.5;">
                            ${subject}
                          </p>
                        </td>
                      </tr>

                      <tr><td style="padding-bottom:24px;border-bottom:1px solid #222222;"></td></tr>
                      <tr><td style="padding-bottom:24px;"></td></tr>

                      <!-- Message -->
                      <tr>
                        <td>
                          <p style="margin:0 0 6px 0;font-size:9px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:#7AC9EF;">
                            Meddelande
                          </p>
                          <p style="margin:0;font-size:15px;font-weight:300;color:#ffffff;line-height:1.75;white-space:pre-wrap;">
                            ${message}
                          </p>
                        </td>
                      </tr>

                    </table>
                  </td>
                </tr>

                <!-- Reply CTA -->
                <tr>
                  <td style="padding-top:8px;border-top:1px solid #222222;">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding-top:24px;">
                          <a href="mailto:${email}"
                             style="display:inline-block;padding:12px 28px;background:#7AC9EF;color:#111111;font-size:10px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;text-decoration:none;border-radius:3px;">
                            Svara på meddelandet →
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding-top:40px;">
                    <p style="margin:0;font-size:11px;font-weight:300;color:#444444;line-height:1.7;">
                      Detta e-postmeddelande skickades automatiskt via kontaktformuläret på
                      <a href="https://ljudochbildhornan.se" style="color:#555555;text-decoration:none;">ljudochbildhornan.se</a>.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>

      </body>
      </html>
    `
  });

  return json({ success: true });
}

export default function ContactPage() {
  const actionData = useActionData();
  const { theme } = useTheme();
  const { turnstileSiteKey } = useLoaderData();

  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <>
      <style>{`
        /* ── Theme variables ── */
        .cp[data-theme="dark"] {
          --cp-bg:                #111;
          --cp-bg-header:         #0d0d0d;
          --cp-text:              rgba(255,255,255,0.75);
          --cp-heading:           #fff;
          --cp-heading-em:        rgba(255,255,255,0.65);
          --cp-subtitle:          rgba(255,255,255,0.4);
          --cp-border:            rgba(255,255,255,0.05);
          --cp-accent:            #7AC9EF;
          --cp-accent-hover:      #558da7;
          --cp-accent-btn-text:   #111;
          --cp-info-value:        rgba(255,255,255,0.85);
          --cp-info-note:         rgba(255,255,255,0.35);
          --cp-divider:           rgba(122,201,239,0.3);
          --cp-label:             rgba(255,255,255,0.35);
          --cp-label-focus:       #7AC9EF;
          --cp-input-color:       rgba(255,255,255,0.85);
          --cp-input-placeholder: rgba(255,255,255,0.18);
          --cp-input-border:      rgba(255,255,255,0.12);
          --cp-input-border-focus:#7AC9EF;
          --cp-select-option-bg:  #1a1a1a;
          --cp-select-arrow:      rgba(255,255,255,0.2);
          --cp-sent-title:        #fff;
          --cp-sent-sub:          rgba(255,255,255,0.4);
        }

        .cp[data-theme="light"] {
          --cp-bg:                #f5f5f3;
          --cp-bg-header:         #ebebea;
          --cp-text:              rgba(30,30,30,0.8);
          --cp-heading:           #111;
          --cp-heading-em:        rgba(30,30,30,0.5);
          --cp-subtitle:          rgba(30,30,30,0.45);
          --cp-border:            rgba(0,0,0,0.07);
          --cp-accent:            #2a8ab5;
          --cp-accent-hover:      #1d6a8a;
          --cp-accent-btn-text:   #fff;
          --cp-info-value:        rgba(30,30,30,0.85);
          --cp-info-note:         rgba(30,30,30,0.6);
          --cp-divider:           rgba(42,138,181,0.25);
          --cp-label:             rgba(30,30,30,0.4);
          --cp-label-focus:       #2a8ab5;
          --cp-input-color:       rgba(30,30,30,0.85);
          --cp-input-placeholder: rgba(30,30,30,0.5);
          --cp-input-border:      rgba(0,0,0,0.15);
          --cp-input-border-focus:#2a8ab5;
          --cp-select-option-bg:  #fff;
          --cp-select-arrow:      rgba(30,30,30,0.25);
          --cp-sent-title:        #111;
          --cp-sent-sub:          rgba(30,30,30,0.45);
        }

        /* ── Base ── */
        .cp {
          font-family: 'Montserrat', sans-serif;
          background: var(--cp-bg);
          color: var(--cp-text);
          min-height: 80vh;
          transition: background 0.3s ease, color 0.3s ease;
        }

        /* ── Page header banner ── */
        .cp-header {
          background: var(--cp-bg-header);
          border-bottom: 1px solid var(--cp-border);
          padding: 72px 48px 64px;
          text-align: center;
        }

        @media (max-width: 768px) {
          .cp-header { padding: 56px 24px 48px; }
        }

        .cp-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.26em;
          text-transform: uppercase;
          color: var(--cp-accent);
          margin-bottom: 20px;
        }

        .cp-eyebrow::before,
        .cp-eyebrow::after {
          content: '';
          display: inline-block;
          width: 24px;
          height: 1px;
          background: var(--cp-accent);
        }

        .cp-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(36px, 5vw, 64px);
          font-weight: 300;
          line-height: 1.1;
          color: var(--cp-heading);
          margin: 0 0 20px;
          letter-spacing: -0.01em;
        }

        .cp-title em {
          font-style: italic;
          color: var(--cp-heading-em);
        }

        .cp-subtitle {
          font-size: 13px;
          font-weight: 300;
          line-height: 1.75;
          color: var(--cp-subtitle);
          max-width: 420px;
          margin: 0 auto;
        }

        /* ── Body layout ── */
        .cp-body {
          max-width: 1280px;
          margin: 0 auto;
          padding: 80px 48px;
          display: grid;
          grid-template-columns: 1fr 1.6fr;
          gap: 96px;
          align-items: start;
        }

        @media (max-width: 900px) {
          .cp-body {
            grid-template-columns: 1fr;
            gap: 56px;
            padding: 56px 24px;
          }
        }

        /* ── Left: info column ── */
        .cp-info {
          display: flex;
          flex-direction: column;
          gap: 40px;
          top: 32px;
        }

        .cp-info-block {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .cp-info-label {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.26em;
          text-transform: uppercase;
          color: var(--cp-accent);
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 4px;
        }

        .cp-info-label::before {
          content: '';
          display: inline-block;
          width: 20px;
          height: 1px;
          background: var(--cp-accent);
        }

        .cp-info-value {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px;
          font-weight: 300;
          color: var(--cp-info-value);
          line-height: 1.4;
        }

        .cp-info-note {
          font-size: 11px;
          font-weight: 300;
          color: var(--cp-info-note);
          line-height: 1.7;
        }

        .cp-divider {
          width: 40px;
          height: 1px;
          background: var(--cp-divider);
        }

        /* ── Right: form ── */
        .cp-form {
          display: flex;
          flex-direction: column;
          gap: 36px;
        }

        .cp-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
        }

        @media (max-width: 600px) {
          .cp-row { grid-template-columns: 1fr; gap: 28px; }
        }

        .cp-field {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .cp-label {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--cp-label);
          transition: color 0.2s;
        }

        .cp-field:focus-within .cp-label {
          color: var(--cp-label-focus);
        }

        .cp-input,
        .cp-select,
        .cp-textarea {
          width: 100%;
          padding: 12px 0;
          font-family: 'Montserrat', sans-serif;
          font-size: 13px;
          font-weight: 300;
          color: var(--cp-input-color);
          background: transparent;
          border: none;
          border-bottom: 1px solid var(--cp-input-border);
          border-radius: 0;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.2s;
          caret-color: var(--cp-accent);
        }

        .cp-input::placeholder,
        .cp-textarea::placeholder {
          color: var(--cp-input-placeholder);
          font-weight: 300;
        }

        .cp-input:focus,
        .cp-select:focus,
        .cp-textarea:focus {
          border-bottom-color: var(--cp-input-border-focus);
        }

        .cp-select {
          appearance: none;
          cursor: pointer;
        }

        .cp-select option {
          background: var(--cp-select-option-bg);
          color: var(--cp-input-color);
        }

        .cp-select-wrap {
          position: relative;
        }

        .cp-select-arrow {
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          color: var(--cp-select-arrow);
          font-size: 9px;
        }

        .cp-textarea {
          resize: none;
          min-height: 140px;
          line-height: 1.75;
        }

        /* ── Submit row ── */
        .cp-footer {
          display: flex;
          align-items: center;
          gap: 24px;
          flex-wrap: wrap;
          padding-top: 8px;
          border-top: 1px solid var(--cp-border);
        }

        .cp-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 36px;
          background: var(--cp-accent);
          color: var(--cp-accent-btn-text);
          font-family: 'Montserrat', sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          border: none;
          border-radius: 3px;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s;
        }

        .cp-btn:hover {
          background: var(--cp-accent-hover);
          transform: translateY(-1px);
        }

        /* ── Success state ── */
        .cp-sent {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 16px;
          animation: cpFadeIn 0.5s ease;
        }

        .cp-sent-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--cp-accent);
        }

        .cp-sent-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(28px, 4vw, 40px);
          font-weight: 300;
          color: var(--cp-sent-title);
          margin: 0;
          line-height: 1.2;
        }

        .cp-sent-sub {
          font-size: 13px;
          font-weight: 300;
          color: var(--cp-sent-sub);
          margin: 0;
          line-height: 1.75;
        }

        @keyframes cpFadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="cp" data-theme={theme}>

        {/* ── Page header ── */}
        <div className="cp-header">
          <div className="cp-eyebrow">Kontakta oss</div>
          <h1 className="cp-title">
            Hur kan vi<br /><em>hjälpa dig?</em>
          </h1>
          <p className="cp-subtitle">
            Fyll i formuläret så återkommer vi till dig inom 1–2 arbetsdagar.
          </p>
        </div>

        {/* ── Body: info + form ── */}
        <div className="cp-body">

          {/* Left: contact info */}
          <div className="cp-info">
            <div className="cp-info-block">
              <div className="cp-info-label">E-post</div>
              <div className="cp-info-value">info@butiken.se</div>
              <div className="cp-info-note">Vi svarar inom 1–2 arbetsdagar.</div>
            </div>
            <div className="cp-divider" />
            <div className="cp-info-block">
              <div className="cp-info-label">Telefon</div>
              <div className="cp-info-value">08-123 456 78</div>
              <div className="cp-info-note">Mån–fre, 09:00–17:00</div>
            </div>
            <div className="cp-divider" />
            <div className="cp-info-block">
              <div className="cp-info-label">Besöksadress</div>
              <div className="cp-info-value">Exempelgatan 12<br />123 45 Stockholm</div>
              <div className="cp-info-note">Öppet mån–lör, 10:00–18:00</div>
            </div>
          </div>

          {/* Right: success message or form */}
          {actionData?.success ? (
            <div className="cp-sent">
              <div className="cp-sent-dot" />
              <p className="cp-sent-title">Tack! Vi återkommer snart.</p>
              <p className="cp-sent-sub">Ditt meddelande har skickats. Vi svarar inom 1–2 arbetsdagar.</p>
            </div>
          ) : (
            <Form method="post" className="cp-form">

              <div className="cp-row">
                <div className="cp-field">
                  <label className="cp-label" htmlFor="name">Namn</label>
                  <input
                    id="name"
                    className="cp-input"
                    name="name"
                    type="text"
                    placeholder="Ditt namn"
                    autoComplete="name"
                    required
                  />
                </div>
                <div className="cp-field">
                  <label className="cp-label" htmlFor="email">E-post</label>
                  <input
                    id="email"
                    className="cp-input"
                    name="email"
                    type="email"
                    placeholder="din@email.se"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="cp-field">
                <label className="cp-label" htmlFor="phone">Telefon (valfritt)</label>
                <input
                  id="phone"
                  className="cp-input"
                  name="phone"
                  type="tel"
                  placeholder="08-123 456 78"
                  autoComplete="tel"
                />
              </div>

              <div className="cp-field">
                <label className="cp-label" htmlFor="subject">Ämne</label>
                <div className="cp-select-wrap">
                  <select
                    id="subject"
                    className="cp-select"
                    name="subject"
                    required
                    defaultValue=""
                  >
                    <option value="" disabled>Välj ett ämne…</option>
                    <option value="order">Beställning / Order</option>
                    <option value="return">Retur / Byte</option>
                    <option value="product">Produktfråga</option>
                    <option value="shipping">Leverans</option>
                    <option value="installation">Installation</option>
                    <option value="other">Övrigt</option>
                  </select>
                  <span className="cp-select-arrow">▼</span>
                </div>
              </div>

              <div className="cp-field">
                <label className="cp-label" htmlFor="message">Meddelande</label>
                <textarea
                  id="message"
                  className="cp-textarea"
                  name="message"
                  placeholder="Beskriv ditt ärende…"
                  required
                />
              </div>

              <Turnstile
                siteKey={turnstileSiteKey}
              />

              <div className="cp-footer">
                <button type="submit" className="cp-btn" disabled={isSubmitting}>
                  {isSubmitting ? "Skickar..." : "Skicka meddelande →"}
                </button>
              </div>

            </Form>
          )}

        </div>
      </div>
    </>
  );
}