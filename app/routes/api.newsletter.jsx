import { json } from "@remix-run/node";

export async function action({ request }) {
  const { email } = await request.json();

  if (!email) {
    return json({ error: "Email required" }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": process.env.SHOPIFY_ADMIN_API_TOKEN,
        },
        body: JSON.stringify({
          query: `
            mutation customerCreate($input: CustomerInput!) {
              customerCreate(input: $input) {
                customer {
                  id
                  email
                }
                userErrors {
                  field
                  message
                }
              }
            }
          `,
          variables: {
            input: {
              email,
              emailMarketingConsent: {
                marketingState: "SUBSCRIBED",
                marketingOptInLevel: "SINGLE_OPT_IN"
              },
              tags: ["newsletter"]
            }
          }
        }),
      }
    );

    const result = await response.json();

    if (result.errors || result.data.customerCreate.userErrors.length) {
      return json({ error: "Subscription failed" }, { status: 400 });
    }

    return json({ success: true });

  } catch (error) {
    return json({ error: "Server error" }, { status: 500 });
  }
}