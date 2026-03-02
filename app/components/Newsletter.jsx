import { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();

    const res = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (data.success) {
      setMessage("You're subscribed!");
      setEmail("");
    } else {
      setMessage("Subscription failed.");
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        required
        placeholder="Enter email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button type="submit">Subscribe</button>
      {message && <p>{message}</p>}
    </form>
  );
}