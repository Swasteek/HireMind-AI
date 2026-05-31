const groq = require('../config/groq');

// WHY a dedicated ai.service.js?
// Every AI feature (resume parsing, question generation, answer evaluation)
// lives here. If we switch from Groq to OpenAI tomorrow, we change ONE file.

// ─── Resume Parsing ───────────────────────────────────────────────────────────
// Takes raw text extracted from a PDF resume.
// Returns structured JSON: skills, experience, education, summary.
const parseResume = async (resumeText) => {
    const prompt = `
You are an expert resume parser. Extract structured information from the resume text below.

Return ONLY a valid JSON object with this exact structure — no explanation, no markdown, no code blocks:
{
  "full_name": "candidate's full name or empty string",
  "email": "email address or empty string",
  "phone": "phone number or empty string",
  "skills": ["skill1", "skill2", "skill3"],
  "experience": [
    {
      "company": "company name",
      "role": "job title",
      "duration": "e.g. Jan 2022 - Dec 2023",
      "description": "brief description of responsibilities"
    }
  ],
  "education": [
    {
      "institution": "university or college name",
      "degree": "degree name",
      "year": "graduation year or expected year"
    }
  ],
  "summary": "2-3 sentence professional summary based on the resume"
}

Resume text:
${resumeText}
`.trim();

    const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1, // Low temperature = consistent, structured output
        max_tokens: 2000,
    });

    const content = response.choices[0].message.content.trim();

    // Parse the JSON response from Groq
    // WHY try/catch? AI can sometimes return slightly malformed JSON
    try {
        return JSON.parse(content);
    } catch {
        // Try to extract JSON if there's any extra text around it
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        throw new Error('AI returned invalid JSON for resume parsing');
    }
};

// ─── Resume vs Job Match Scoring ──────────────────────────────────────────────
// Compares parsed resume against job description.
// Returns a score 0-100 and reasoning.
const scoreResumeMatch = async (parsedResume, jobDescription, requiredSkills) => {
    const prompt = `
You are a technical recruiter evaluating a candidate's resume against a job description.

Job Title and Description:
${jobDescription}

Required Skills:
${requiredSkills}

Candidate's Profile:
- Skills: ${parsedResume.skills?.join(', ')}
- Experience: ${parsedResume.experience?.map(e => `${e.role} at ${e.company}`).join(', ')}
- Education: ${parsedResume.education?.map(e => `${e.degree} from ${e.institution}`).join(', ')}
- Summary: ${parsedResume.summary}

Return ONLY a valid JSON object, no explanation, no markdown:
{
  "score": <integer 0-100>,
  "matched_skills": ["skills that match the job requirements"],
  "missing_skills": ["important skills from job requirements that candidate lacks"],
  "strengths": ["2-3 key strengths relevant to this role"],
  "reasoning": "2-3 sentence explanation of the score"
}
`.trim();

    const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 1000,
    });

    const content = response.choices[0].message.content.trim();

    try {
        return JSON.parse(content);
    } catch {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) return JSON.parse(jsonMatch[0]);
        throw new Error('AI returned invalid JSON for match scoring');
    }
};

module.exports = { parseResume, scoreResumeMatch };