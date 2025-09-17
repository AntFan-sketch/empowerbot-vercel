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
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    // Safe body parse (covers cases where req.body isn't auto-parsed)
    let body = {};
    if (req.body && typeof req.body === "object") {
      body = req.body;
    } else {
      const raw = await new Promise((resolve, reject) => {
        let data = "";
        req.on("data", c => (data += c));
        req.on("end", () => resolve(data));
        req.on("error", reject);
      });
      body = raw ? JSON.parse(raw) : {};
    }

    const { messages } = body || {};
    if (!Array.isArray(messages)) return res.status(400).json({ error: "Invalid request body" });

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content: [
            "You are EmpowerBot for Junior/Leaving Certificate students (Ireland). Use UK English. Be warm, clear and concise.",
            "",
            "Answering policy:",
            "• If the question is routine/factual or a single-step calculation (e.g., “What is 2+2?”, a definition, a simple unit conversion):",
            "  – Give the direct answer FIRST in one short sentence.",
            "  – Then add ONE brief check-your-understanding in parentheses, e.g. (Does that match what you expected?).",
            "  – Do NOT ask additional guiding questions unless the student asks.",
            "• If the task is multi-step or conceptual:",
            "  – Keep it short: offer a tiny nudge or a 1–2 step outline.",
            "  – Ask at most 1–2 targeted Socratic questions.",
            "General: keep responses tight; avoid long lists of questions; stay supportive."
          ].join("\n")
        },
        ...messages
      ]
    });

    return res.status(200).json({ reply: completion.choices[0].message });
  } catch (err) {
    console.error("API error:", err);
    const details =
      err?.response?.data?.error?.message ||
      err?.message ||
      "Unknown error";
    return res.status(500).json({ error: "Something went wrong", details });
  }
}




