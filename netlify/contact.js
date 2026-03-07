import fetch from "node-fetch";
import { Resend } from "resend";

export async function handler(event, context) {
  try {
    const body = JSON.parse(event.body);

    const {
      name,
      email,
      subject,
      message,
      turnstileToken
    } = body;

    // 1. Verify Turnstile token
    const verifyRes = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret: process.env.TURNSTILE_SECRET_KEY,
          response: turnstileToken,
        }),
      }
    );

    const verifyData = await verifyRes.json();

    if (!verifyData.success) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid Turnstile token" }),
      };
    }

    // 2. Send email via Resend
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: process.env.CONTACT_FORM_TO,
      subject: `Nytt kontaktformulärsmeddelande: ${subject}`,
      html: `
        <h1>Nytt kontaktmeddelande</h1>
        <p><strong>Namn:</strong> ${name}</p>
        <p><strong>E-post:</strong> ${email}</p>
        <p><strong>Ämne:</strong> ${subject}</p>
        <p><strong>Meddelande:</strong><br>${message}</p>
      `,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };

  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server error" }),
    };
  }
}
