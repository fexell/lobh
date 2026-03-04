// app/routes/contact.jsx
import { json } from "@remix-run/server-runtime";
import { Form, useActionData } from "@remix-run/react";
import { Resend } from 'resend';

export const meta = () => [{title: 'Ljud & Bild Hörnan | Kontakt'}];

export async function action({ request, context }) {
  const formData = await request.formData();
  const name = formData.get("name");
  const email = formData.get("email");
  const subject = formData.get("subject");
  const message = formData.get("message");

  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
  from: 'onboarding@resend.dev',
  to: process.env.CONTACT_FORM_TO,
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

                    <!-- Divider -->
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

                    <!-- Divider -->
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

                    <!-- Divider -->
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

  return (
    <>
      <style>{`
        .cp {
          font-family: 'Montserrat', sans-serif;
          background: #111;
          color: rgba(255,255,255,0.75);
          min-height: 80vh;
        }

        /* ── Page header banner ── */
        .cp-header {
          background: #0d0d0d;
          border-bottom: 1px solid rgba(255,255,255,0.05);
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
          color: #7AC9EF;
          margin-bottom: 20px;
        }

        .cp-eyebrow::before,
        .cp-eyebrow::after {
          content: '';
          display: inline-block;
          width: 24px;
          height: 1px;
          background: #7AC9EF;
        }

        .cp-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(36px, 5vw, 64px);
          font-weight: 300;
          line-height: 1.1;
          color: #fff;
          margin: 0 0 20px;
          letter-spacing: -0.01em;
        }

        .cp-title em {
          font-style: italic;
          color: rgba(255,255,255,0.65);
        }

        .cp-subtitle {
          font-size: 13px;
          font-weight: 300;
          line-height: 1.75;
          color: rgba(255,255,255,0.4);
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
          position: sticky;
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
          color: #7AC9EF;
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
          background: #7AC9EF;
        }

        .cp-info-value {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px;
          font-weight: 300;
          color: rgba(255,255,255,0.85);
          line-height: 1.4;
        }

        .cp-info-note {
          font-size: 11px;
          font-weight: 300;
          color: rgba(255,255,255,0.35);
          line-height: 1.7;
        }

        .cp-divider {
          width: 40px;
          height: 1px;
          background: rgba(122, 201, 239, 0.3);
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
          color: rgba(255,255,255,0.35);
          transition: color 0.2s;
        }

        .cp-field:focus-within .cp-label {
          color: #7AC9EF;
        }

        .cp-input,
        .cp-select,
        .cp-textarea {
          width: 100%;
          padding: 12px 0;
          font-family: 'Montserrat', sans-serif;
          font-size: 13px;
          font-weight: 300;
          color: rgba(255,255,255,0.85);
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(255,255,255,0.12);
          border-radius: 0;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.2s;
          caret-color: #7AC9EF;
        }

        .cp-input::placeholder,
        .cp-textarea::placeholder {
          color: rgba(255,255,255,0.18);
          font-weight: 300;
        }

        .cp-input:focus,
        .cp-select:focus,
        .cp-textarea:focus {
          border-bottom-color: #7AC9EF;
        }

        .cp-select {
          appearance: none;
          cursor: pointer;
        }

        .cp-select option {
          background: #1a1a1a;
          color: rgba(255,255,255,0.85);
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
          color: rgba(255,255,255,0.2);
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
          border-top: 1px solid rgba(255,255,255,0.05);
        }

        .cp-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 36px;
          background: #7AC9EF;
          color: #111;
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
          background: #558da7;
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
          background: #7AC9EF;
        }

        .cp-sent-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(28px, 4vw, 40px);
          font-weight: 300;
          color: #fff;
          margin: 0;
          line-height: 1.2;
        }

        .cp-sent-sub {
          font-size: 13px;
          font-weight: 300;
          color: rgba(255,255,255,0.4);
          margin: 0;
          line-height: 1.75;
        }

        @keyframes cpFadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="cp">

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

          {/* Left: contact info — always visible */}
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
                    required
                  />
                </div>
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

              <div className="cp-footer">
                <button type="submit" className="cp-btn">
                  Skicka meddelande →
                </button>
              </div>

            </Form>
          )}

        </div>
      </div>
    </>
  );
}
