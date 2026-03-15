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

router.post("/ai/podcast-script", async (req, res) => {
  const { topic, format, targetLength, episodeTitle, brandGuide } = req.body;

  const brandContext = brandGuide
    ? `Brand guide context:\n${brandGuide}`
    : `Brand voice: Professional yet approachable, authoritative but not stuffy. Think "smart friend who happens to be a marketing expert."`;

  const wordsPerMinute = 150;
  const lengthMinutes = parseInt(targetLength) || 30;
  const totalWords = lengthMinutes * wordsPerMinute;

  const formatInstructions: Record<string, string> = {
    solo: "Single host explainer format. Use speaker tag [HOST] throughout.",
    duo: "Two-host conversational format (NotebookLM style). Use speaker tags [HOST A] and [HOST B]. They should have natural back-and-forth dialogue, building on each other's points, occasionally disagreeing or adding nuance.",
    interview: "Interview format with host and guest. Use speaker tags [HOST] and [GUEST]. The host asks questions and the guest provides expert answers.",
    debate: "Debate format with two speakers taking different perspectives. Use [SPEAKER 1] and [SPEAKER 2]. They should present contrasting viewpoints respectfully.",
    narrative: "Narrative storytelling format. Use [NARRATOR] as the primary speaker with occasional [VOICE] for quotes or dialogue.",
  };

  const formatGuide = formatInstructions[format] || formatInstructions.solo;

  const systemPrompt = `You are a world-class podcast scriptwriter. Write a complete, broadcast-ready podcast episode script.

${brandContext}

Format: ${formatGuide}
Target length: ~${lengthMinutes} minutes (~${totalWords} words total)
Pacing: ${wordsPerMinute} words per minute

Write the script using ear-friendly, conversational language. Avoid jargon unless explained. Use short sentences. Include natural transitions, pauses noted as [PAUSE], and emphasis noted as [EMPHASIS].

Return a JSON object with:
- "cold_open": string - A compelling 30-second hook that grabs attention (about 75 words)
- "setup": string - Introduction of the topic and what listeners will learn (about 150 words)
- "segments": array of 3-5 objects, each with:
  - "title": string - segment name
  - "hook": string - one-line teaser for the segment
  - "content": string - full scripted content with speaker tags
  - "duration_minutes": number - estimated duration
- "takeaways": string - Key takeaways section summarizing main points
- "outro": string - Sign-off with call to action`;

  const response = await openai.chat.completions.create({
    model: "gpt-5.2",
    max_completion_tokens: 16384,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Write a ${format} podcast episode titled "${episodeTitle}" about: ${topic}` },
    ],
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content ?? '{"cold_open":"","setup":"","segments":[],"takeaways":"","outro":""}';
  try {
    const parsed = JSON.parse(content);
    res.json({
      cold_open: parsed.cold_open || "",
      setup: parsed.setup || "",
      segments: parsed.segments || [],
      takeaways: parsed.takeaways || "",
      outro: parsed.outro || "",
    });
  } catch {
    res.json({ cold_open: content, setup: "", segments: [], takeaways: "", outro: "" });
  }
});

router.post("/ai/interview-prep", async (req, res) => {
  const { guestName, guestBio, interviewTopic, episodeLength, brandGuide } = req.body;

  const brandContext = brandGuide
    ? `Brand guide context:\n${brandGuide}`
    : `Brand voice: Professional yet approachable, authoritative but not stuffy. Think "smart friend who happens to be a marketing expert."`;

  const lengthMinutes = parseInt(episodeLength) || 45;

  const systemPrompt = `You are an expert podcast producer and interview strategist. Prepare a comprehensive interview preparation package.

${brandContext}

Episode length: ~${lengthMinutes} minutes

Return a JSON object with:
- "guest_brief": string - A detailed research brief about the guest (2-3 paragraphs covering their background, notable achievements, areas of expertise, recent work, and any relevant context)
- "questions": array of 15-20 objects, each with:
  - "segment": string - one of "opening", "core_topic", "deep_dive", "rapid_fire", "close"
  - "question": string - the interview question
  - "follow_ups": array of 2-3 follow-up question strings
  - "notes": string - brief interviewer notes on why this question matters or what to listen for
- "run_of_show": array of objects representing the show timeline, each with:
  - "time": string - timestamp like "00:00", "02:00", etc.
  - "duration_minutes": number
  - "section": string - section name
  - "description": string - what happens in this section
  - "notes": string - production notes or talking points`;

  const response = await openai.chat.completions.create({
    model: "gpt-5.2",
    max_completion_tokens: 16384,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Prepare an interview about "${interviewTopic}" with guest: ${guestName}\n\nGuest bio/background: ${guestBio}` },
    ],
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content ?? '{"guest_brief":"","questions":[],"run_of_show":[]}';
  try {
    const parsed = JSON.parse(content);
    res.json({
      guest_brief: parsed.guest_brief || "",
      questions: parsed.questions || [],
      run_of_show: parsed.run_of_show || [],
    });
  } catch {
    res.json({ guest_brief: content, questions: [], run_of_show: [] });
  }
});

export default router;
