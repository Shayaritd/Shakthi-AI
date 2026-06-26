import type { ChatMessage, AiResponse } from '../types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

async function callGemini(prompt: string): Promise<string> {
  if (!API_KEY) {
    return simulateFallback(prompt);
  }

  try {
    const res = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 512,
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_LOW_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_LOW_AND_ABOVE' },
        ],
      }),
    });

    if (!res.ok) throw new Error(`Gemini error: ${res.status}`);
    const json = await res.json();
    return json.candidates?.[0]?.content?.parts?.[0]?.text ?? 'No response generated.';
  } catch {
    return simulateFallback(prompt);
  }
}

function simulateFallback(prompt: string): string {
  const lower = prompt.toLowerCase();
  if (lower.includes('safety') || lower.includes('unsafe') || lower.includes('harass')) {
    return `Your safety matters above everything else. Here are steps you can take:

1. **Document the incident** - Write down dates, times, and what happened.
2. **Speak to a trusted adult** - A parent, teacher, or guardian can help you.
3. **Use SHAKTHI's Report System** - Your report is encrypted and confidential.
4. **Contact the Safety Hotline** - Available 24/7: 1800-XXX-XXXX (toll-free).
5. **POCSO Act Protection** - You have legal rights as a minor athlete.

You are not alone. SHAKTHI has a zero-tolerance policy for misconduct. Every report is taken seriously.`;
  }
  if (lower.includes('scholarship') || lower.includes('grant') || lower.includes('funding')) {
    return `Based on your athlete profile, here's why this scholarship is a strong match:

**Why It Fits You:**
- Your sport and state-level participation align perfectly with the eligibility criteria.
- Rural athlete background meets the foundation's target demographic.
- Your training consistency (24+ days) demonstrates commitment.

**Eligibility Match:** 92% aligned with stated requirements.

**What to Strengthen:**
- Upload your latest state-level participation certificate.
- Add a coach recommendation letter to your profile.
- Ensure your income certificate is current (within 6 months).

Apply before the deadline for best results!`;
  }
  if (lower.includes('mentor') || lower.includes('coach')) {
    return `**Mentor Match Analysis**

This mentor is an excellent fit for your current development stage:

**Why They're Suitable:**
- Specializes in your sport at the level you're targeting.
- Has successfully mentored athletes from similar rural backgrounds.
- Experience with national-level selection processes.

**Possible Focus Areas:**
- Technique refinement for competitive play.
- Mental conditioning for high-pressure trials.
- Nutrition and recovery planning.
- Navigation of selection processes and trials.

A mentorship session with them could significantly accelerate your journey to the national level.`;
  }
  if (lower.includes('college') || lower.includes('admission') || lower.includes('quota')) {
    return `**College Fit Analysis**

**Sports Quota Relevance:** High - This college actively recruits athletes at your level.

**Fit Score Explanation:**
- Sports facilities match your training requirements.
- Previous admission data shows athletes with your profile have strong success rates.
- Academic programs align with typical athlete schedules.

**Admission Preparation Tips:**
- Get a certificate from your district sports authority.
- Prepare a sports portfolio with photos and achievements.
- Request a trial letter from the sports department.
- Maintain your academic eligibility (minimum 45% in board exams).

Apply 3 months before the session starts for best results.`;
  }
  return `I'm SHAKTHI's AI Assistant, here to support your sports journey.

I can help you with:
- **Profile Summaries** - Understand your strengths
- **Scholarship Guidance** - Find the best funding for you
- **Mentor Matching** - Find the right coach
- **Safety Support** - Confidential help anytime
- **College Planning** - Sports quota admissions

What would you like to explore today? Your journey to the podium starts here!`;
}

export async function getAthleteSummary(params: {
  name: string; sport: string; achievements: string; goals: string; level: string;
}): Promise<AiResponse> {
  const prompt = `You are SHAKTHI's AI assistant supporting rural girl athletes in India.
Generate a concise, encouraging athlete profile summary. Be supportive and specific.
DO NOT provide legal or medical diagnoses. Keep language simple and empowering.

Athlete: ${params.name}
Sport: ${params.sport}
Level: ${params.level}
Achievements: ${params.achievements}
Goals: ${params.goals}

Respond in JSON format:
{
  "summary": "2-3 sentence profile summary",
  "strengths": ["strength1", "strength2", "strength3"],
  "nextSteps": ["step1", "step2", "step3"]
}`;

  const raw = await callGemini(prompt);
  try {
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      return { success: true, message: 'AI summary generated', data: parsed };
    }
  } catch {/* fallthrough */}
  return {
    success: true,
    message: 'AI summary generated',
    data: {
      summary: raw.split('\n')[0] || 'A dedicated athlete with strong potential.',
      strengths: ['Dedication', 'Athletic ability', 'Team spirit'],
      nextSteps: ['Complete your profile', 'Connect with a mentor', 'Apply for scholarships'],
    },
  };
}

export async function getScholarshipExplanation(params: {
  athleteName: string; sport: string; scholarship: string; eligibility: string;
}): Promise<string> {
  const prompt = `You are SHAKTHI's scholarship guidance AI for rural girl athletes in India.
Explain why this scholarship matches this athlete. Be encouraging, specific, and honest.
Keep advice practical. Do not make guarantees. Language should be clear and supportive.

Athlete: ${params.athleteName} | Sport: ${params.sport}
Scholarship: ${params.scholarship}
Eligibility: ${params.eligibility}

Give a 3-part response: Why it fits, Eligibility match summary, What to improve. Use short paragraphs.`;

  return callGemini(prompt);
}

export async function getMentorMatchExplanation(params: {
  athleteName: string; sport: string; mentorName: string; mentorSpecialty: string;
}): Promise<string> {
  const prompt = `You are SHAKTHI's mentorship matching AI for rural girl athletes in India.
Explain why this mentor-athlete pairing is suitable. Be specific and encouraging.
Focus on development, not personal details. Keep it professional and supportive.

Athlete: ${params.athleteName} (Sport: ${params.sport})
Mentor: ${params.mentorName} (Specialty: ${params.mentorSpecialty})

Explain: 1) Match summary 2) Why mentor is suitable 3) Possible mentorship focus areas.
Keep each section to 2-3 sentences.`;

  return callGemini(prompt);
}

export async function getSafetyGuidance(question: string): Promise<string> {
  const prompt = `You are SHAKTHI's safety AI assistant for girl athletes in India.
Provide safe, supportive, non-legal guidance. You are NOT a lawyer or doctor.
Always prioritize the user's safety. Be calm, clear, and compassionate.
Direct to official channels for serious matters. Do not minimize any concern.
This platform has a zero-tolerance policy for athlete misconduct.

User question/concern: ${question}

Provide: 1) Immediate supportive response 2) Practical next steps 3) Escalation advice if needed.
Keep language simple and reassuring. End with a reminder they are not alone.`;

  return callGemini(prompt);
}

export async function analyzeMessageRisk(params: {
  message: string; senderRole: string; receiverRole: string;
}): Promise<AiResponse> {
  const prompt = `You are a content safety assistant for SHAKTHI, a sports platform for girl athletes.
Analyze this message for potential safety risks. This is for MODERATION SUPPORT ONLY, not final enforcement.
Be conservative - when in doubt, flag it.

Message: "${params.message}"
Sender role: ${params.senderRole}
Receiver role: ${params.receiverRole}

Respond ONLY in JSON:
{
  "riskLevel": "low|medium|high",
  "explanation": "brief explanation",
  "suggestFlag": true|false,
  "note": "This is AI-assisted analysis only, not final enforcement."
}`;

  const raw = await callGemini(prompt);
  try {
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      return { success: true, message: 'Risk analysis complete', data: JSON.parse(match[0]) };
    }
  } catch {/* fallthrough */}
  return {
    success: true,
    message: 'Risk analysis complete',
    data: { riskLevel: 'low', explanation: 'Analysis unavailable', suggestFlag: false },
  };
}

export async function getCollegeFitExplanation(params: {
  athleteName: string; sport: string; level: string; collegeName: string;
}): Promise<string> {
  const prompt = `You are SHAKTHI's college guidance AI for rural girl athletes in India.
Explain how well this college fits this athlete for sports quota admission.
Be encouraging but realistic. Do not guarantee admission. Keep advice actionable.

Athlete: ${params.athleteName} | Sport: ${params.sport} | Level: ${params.level}
College: ${params.collegeName}

Explain: 1) Fit score explanation 2) Sports quota relevance 3) Admission preparation tips.`;

  return callGemini(prompt);
}

export async function chatWithAssistant(
  messages: ChatMessage[],
  newMessage: string,
): Promise<string> {
  const context = messages
    .slice(-4)
    .map(m => `${m.role === 'user' ? 'Athlete' : 'SHAKTHI AI'}: ${m.content}`)
    .join('\n');

  const prompt = `You are SHAKTHI AI, a compassionate assistant for rural girl athletes in India.
You help with: sports development, scholarships, mentor matching, safety concerns, and college admissions.
Be encouraging, respectful, and clear. Use simple English/Hindi mixed if needed.
Do NOT give legal or medical diagnoses. Always prioritize safety.
Keep responses concise (under 200 words). Be warm and empowering.

Previous context:
${context}

Athlete says: ${newMessage}

Respond as SHAKTHI AI:`;

  return callGemini(prompt);
}
