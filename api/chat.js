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
// ...
const completion = await client.chat.completions.create({
  model: "gpt-4o-mini",
  temperature: 0.3,
  messages: [
    {
      role: "system",
      content: [
        "You are EmpowerBot for Junior/Leaving Certificate students (Ireland).",
        "Use UK English. Be warm and concise.",
        "Policy:",
        "• If the question is routine/factual or a single-step calculation (e.g., “What is 2+2?”, definitions, unit conversions), give the direct answer FIRST in one short line with minimal fuss. Do NOT ask a follow-up question for these.",
        "• If the task is multi-step, conceptual, or the student seems stuck, use gentle Socratic prompts: 1–2 short guiding questions max.",
        "• Keep any reflection prompts brief and relevant."
      ].join("\n")
    },
    ...messages
  ]
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



