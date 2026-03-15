import { Router } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { getBrandContextBlock } from "../lib/brand-context";

const router = Router();

router.post("/ai/generate-draft", async (req, res) => {
  const { type, platform, topic, tone, additionalContext } = req.body;

  const brandContext = await getBrandContextBlock();

  const systemPrompt = `You are a marketing content expert. Generate polished, ready-to-use ${type} content for ${platform}.
${brandContext ? `\n${brandContext}\n` : `Brand voice: Professional yet approachable, authoritative but not stuffy. Think "smart friend who happens to be a marketing expert."`}
${tone ? `Tone: ${tone}` : ""}
${additionalContext ? `Additional context: ${additionalContext}` : ""}

Return a JSON object with:
- "draft": the complete content piece (string)
- "suggestions": array of 3 improvement tips (strings)`;

  const response = await openai.chat.completions.create({
    model: "gpt-5.2",
    max_completion_tokens: 8192,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Write a ${type} about: ${topic}` },
    ],
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content ?? '{"draft":"","suggestions":[]}';
  try {
    const parsed = JSON.parse(content);
    res.json({
      draft: parsed.draft || "",
      suggestions: parsed.suggestions || [],
    });
  } catch {
    res.json({ draft: content, suggestions: [] });
  }
});

router.post("/ai/seo-research", async (req, res) => {
  const { topic, targetAudience } = req.body;

  const brandContext = await getBrandContextBlock();

  const systemPrompt = `You are an SEO and Answer Engine Optimization (AEO) research expert. Analyze the given topic and provide comprehensive research results.
${brandContext ? `\n${brandContext}\n` : ""}
${targetAudience ? `Target audience: ${targetAudience}` : "Target audience: startup founders and entrepreneurs"}

Return a JSON object with:
- "keywords": array of 10-15 relevant SEO keywords (strings)
- "questions": array of 8-10 "People Also Ask" style questions (strings)
- "talkingPoints": array of 5-7 key talking points for content creation (strings)
- "aeoSummary": a 2-3 paragraph summary optimized for answer engines like Perplexity, ChatGPT search, etc.`;

  const response = await openai.chat.completions.create({
    model: "gpt-5.2",
    max_completion_tokens: 8192,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Research this topic: ${topic}` },
    ],
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content ?? '{"keywords":[],"questions":[],"talkingPoints":[],"aeoSummary":""}';
  try {
    const parsed = JSON.parse(content);
    res.json({
      keywords: parsed.keywords || [],
      questions: parsed.questions || [],
      talkingPoints: parsed.talkingPoints || [],
      aeoSummary: parsed.aeoSummary || "",
    });
  } catch {
    res.json({ keywords: [], questions: [], talkingPoints: [], aeoSummary: content });
  }
});

export default router;
