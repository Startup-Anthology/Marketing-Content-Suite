const getBaseUrl = () => {
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  if (domain) return `https://${domain}/api`;
  return "/api";
};

async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${getBaseUrl()}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export async function fetchContent() {
  return apiFetch("/content");
}

export async function createContent(data: {
  type: string;
  platform: string;
  title: string;
  body: string;
  status?: string;
}) {
  return apiFetch("/content", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateContent(id: number, data: Record<string, unknown>) {
  return apiFetch(`/content/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteContent(id: number) {
  return apiFetch(`/content/${id}`, { method: "DELETE" });
}

export async function fetchStoryboards() {
  return apiFetch("/storyboards");
}

export async function createStoryboard(data: {
  title: string;
  type: string;
  scenes?: string;
}) {
  return apiFetch("/storyboards", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateStoryboard(id: number, data: Record<string, unknown>) {
  return apiFetch(`/storyboards/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteStoryboard(id: number) {
  return apiFetch(`/storyboards/${id}`, { method: "DELETE" });
}

export async function fetchResearchNotes() {
  return apiFetch("/research-notes");
}

export async function createResearchNote(
  category: string,
  topic: string,
  content: string
) {
  return apiFetch("/research-notes", {
    method: "POST",
    body: JSON.stringify({ category, topic, content }),
  });
}

export async function fetchScheduledPosts() {
  return apiFetch("/scheduled-posts");
}

export async function createScheduledPost(data: {
  platform: string;
  content: string;
  scheduledAt: string;
  status?: string;
}) {
  return apiFetch("/scheduled-posts", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateScheduledPost(id: number, data: Record<string, unknown>) {
  return apiFetch(`/scheduled-posts/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteScheduledPost(id: number) {
  return apiFetch(`/scheduled-posts/${id}`, { method: "DELETE" });
}

export async function aiGenerateDraft(data: {
  type: string;
  platform: string;
  topic: string;
  tone?: string;
  additionalContext?: string;
}) {
  return apiFetch("/ai/generate-draft", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function aiGenerateStoryboard(data: {
  topic: string;
  sceneCount?: number;
  mood?: string;
}) {
  return apiFetch("/ai/generate-storyboard", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function aiGenerateAdCreative(data: {
  description: string;
  platform?: string;
  targetAudience?: string;
}) {
  return apiFetch("/ai/generate-ad-creative", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function aiSeoResearch(topic: string, targetAudience?: string) {
  return apiFetch("/ai/seo-research", {
    method: "POST",
    body: JSON.stringify({ topic, targetAudience }),
  });
}

export async function fetchBrandGuide() {
  return apiFetch("/brand-guide");
}

export async function saveBrandGuide(data: {
  brandName?: string;
  voiceDescriptors?: string;
  tone?: string;
  colorPalette?: string;
  fonts?: string;
  logoUrl?: string;
  tagline?: string;
  brandStory?: string;
}) {
  return apiFetch("/brand-guide", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function aiGeneratePodcastScript(data: {
  topic: string;
  format: string;
  targetLength: string;
  episodeTitle: string;
  brandGuide?: string;
}) {
  return apiFetch("/ai/podcast-script", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function aiGenerateInterviewPrep(data: {
  guestName: string;
  guestBio: string;
  interviewTopic: string;
  episodeLength: string;
  brandGuide?: string;
}) {
  return apiFetch("/ai/interview-prep", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function fetchPodcastScripts() {
  return apiFetch("/podcast-scripts");
}

export async function createPodcastScript(data: {
  episodeTitle: string;
  topic: string;
  format: string;
  targetLength: string;
  script: string;
  status?: string;
}) {
  return apiFetch("/podcast-scripts", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function deletePodcastScript(id: number) {
  return apiFetch(`/podcast-scripts/${id}`, { method: "DELETE" });
}

export async function fetchInterviewPreps() {
  return apiFetch("/interview-preps");
}

export async function createInterviewPrep(data: {
  guestName: string;
  guestBio: string;
  interviewTopic: string;
  episodeLength: string;
  content: string;
  status?: string;
}) {
  return apiFetch("/interview-preps", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function deleteInterviewPrep(id: number) {
  return apiFetch(`/interview-preps/${id}`, { method: "DELETE" });
}
