// api/chat.js
import OpenAI from "openai";
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { messages } = req.body || {};
  if (!Array.isArray(messages)) return res.status(400).json({ error: "Invalid request body" });

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4",               // if needed, try "gpt-4o" or "gpt-4o-mini"
      messages: [
        { role: "system", content: "You are EmpowerBot, a warm and patient STEM tutor for Junior and Leaving Certificate students in Ireland. Use the Socratic method. Always respond in UK English." },
        ...messages
      ],
      temperature: 0.7
    });
    res.status(200).json({ reply: completion.choices[0].message });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong", details: err?.message });
  }
}


