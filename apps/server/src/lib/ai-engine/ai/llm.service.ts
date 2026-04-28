import Groq from "groq-sdk";

// Reads GROQ_API_KEY from process.env (set in your .env file)
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function generateAIText(prompt: string): Promise<string> {
  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            "You are a JSON-only home inspection expert for Indian households. " +
            "Always respond with a single valid JSON object and absolutely nothing else. " +
            "No markdown, no code fences, no explanations.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 800,
      response_format: { type: "json_object" }, // forces valid JSON output
    });

    return response.choices[0]?.message?.content ?? "";
  } catch (error) {
    console.error("Groq AI Error:", error);

    // Fallback — always valid JSON so the parser in ai.service.ts never fails
    return JSON.stringify({
      summary: {
        en: "Your home has been inspected. Please address the highlighted risks promptly.",
        hi: "आपके घर का निरीक्षण किया गया है। कृपया बताए गए जोखिमों पर तुरंत ध्यान दें।",
      },
      recommendations: [
        "Schedule a follow-up inspection within 30 days",
        "Address all high priority issues immediately",
        "Keep all maintenance records up to date",
      ],
    });
  }
}
