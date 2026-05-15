module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { text } = req.body || {};
  if (!text || typeof text !== "string" || !text.trim()) {
    return res.status(400).json({ error: "Missing or empty 'text' field." });
  }
  if (text.length > 5000) {
    return res.status(400).json({ error: "Text exceeds 5000 character limit." });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Server misconfiguration: GROQ_API_KEY not set." });
  }

  const systemPrompt = `You are a content moderation AI. Analyse the given text and return a JSON object ONLY — no markdown, no explanation, no code fences.

The JSON must follow this exact schema:
{
  "is_safe": boolean,
  "overall_score": number (0-100, where 100 = maximally toxic),
  "details": {
    "toxic":         { "flag": boolean, "probability": number (0-100) },
    "severe_toxic":  { "flag": boolean, "probability": number (0-100) },
    "obscene":       { "flag": boolean, "probability": number (0-100) },
    "threat":        { "flag": boolean, "probability": number (0-100) },
    "insult":        { "flag": boolean, "probability": number (0-100) },
    "identity_hate": { "flag": boolean, "probability": number (0-100) }
  }
}

Rules:
- "flag" is true when probability >= 50
- "is_safe" is true only when no category is flagged
- "overall_score" is the highest probability across all categories
- Be accurate, consistent, and strict. Return ONLY the JSON object.`;

  try {
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 1000,
        temperature: 0,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user",   content: `Analyse this text for toxicity:\n\n${text}` }
        ],
      }),
    });

    if (!groqRes.ok) {
      const err = await groqRes.json().catch(() => ({}));
      return res.status(502).json({ error: err.error?.message || "Groq API error." });
    }

    const groqData = await groqRes.json();
    const raw = groqData.choices?.[0]?.message?.content || "";

    const cleaned = raw.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();
    const result  = JSON.parse(cleaned);

    return res.status(200).json(result);

  } catch (err) {
    console.error("GuardAI error:", err);
    return res.status(500).json({ error: err.message || "Internal server error." });
  }
};
