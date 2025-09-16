// api/chat.js
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  try {
    if (req.method === "OPTIONS") {
      res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
      return res.status(204).end();
    }
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    // Parse JSON body safely (works even if req.body isn't auto-parsed)
    let body = {};
    if (req.body && typeof req.body === "object") {
      body = req.body;
    } else {
      const raw = await new Promise((resolve, reject) => {
        let data = "";
        req.on("data", (c) => (data += c));
        req.on("end", () => resolve(data));
        req.on("error", reject);
      });
      body = raw ? JSON.parse(raw) : {};
    }

    const { messages } = body || {};
    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid request body" });
    }

    // Use a widely-available model
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are EmpowerBot, a warm and patient STEM tutor for Junior and Leaving Certificate students in Ireland. Use the Socratic method. Always respond in UK English."
        },
        ...messages
      ],
      temperature: 0.7
    });

    return res.status(200).json({ reply: completion.choices[0].message });
  } catch (err) {
    // Surface real error details to the client for debugging
    console.error("API error:", err);
    const details =
      err?.response?.data?.error?.message ||
      err?.message ||
      "Unknown error";
    return res.status(500).json({ error: "Something went wrong", details });
  }
}



