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

// ─── Generate Interview Questions ─────────────────────────────────────────────
// Takes job context + candidate resume → returns 5 targeted questions.
// Mix of technical and behavioral questions tailored to the specific role.
const generateInterviewQuestions = async (jobTitle, jobDescription, requiredSkills, parsedResume) => {
    const prompt = `
You are a senior technical interviewer. Generate exactly 5 interview questions for a candidate
applying for the role below. Mix technical and behavioral questions based on their background.

Job Title: ${jobTitle}
Job Description: ${jobDescription}
Required Skills: ${requiredSkills}

Candidate Profile:
- Skills: ${parsedResume.skills?.join(', ')}
- Experience: ${parsedResume.experience?.map(e => `${e.role} at ${e.company}`).join(', ')}
- Education: ${parsedResume.education?.map(e => `${e.degree} from ${e.institution}`).join(', ')}

Rules:
- Questions 1-3: technical, specific to the required skills and candidate's background
- Questions 4-5: behavioral, using STAR method situations relevant to this role
- Each question should be specific, not generic
- Do not ask questions the resume already answers

Return ONLY a valid JSON array, no explanation, no markdown:
[
  {
    "id": 1,
    "type": "technical",
    "question": "question text here"
  },
  {
    "id": 2,
    "type": "technical",
    "question": "question text here"
  },
  {
    "id": 3,
    "type": "technical",
    "question": "question text here"
  },
  {
    "id": 4,
    "type": "behavioral",
    "question": "question text here"
  },
  {
    "id": 5,
    "type": "behavioral",
    "question": "question text here"
  }
]
`.trim();

    const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7, // Higher temperature = more varied, creative questions
        max_tokens: 1500,
    });

    const content = response.choices[0].message.content.trim();

    try {
        return JSON.parse(content);
    } catch {
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) return JSON.parse(jsonMatch[0]);
        throw new Error('AI returned invalid JSON for question generation');
    }
};

// ─── Evaluate Interview Answers ────────────────────────────────────────────────
// Takes questions + candidate answers + job context.
// Returns per-answer feedback, overall score, and hire recommendation.
const evaluateAnswers = async (questions, answers, jobTitle, requiredSkills) => {
    // Build a readable Q&A block to send to Groq
    const qaBlock = questions.map((q) => {
        const answer = answers.find((a) => a.questionId === q.id);
        return `Q${q.id} [${q.type}]: ${q.question}\nAnswer: ${answer?.answer || '(no answer provided)'}`;
    }).join('\n\n');

    const prompt = `
You are a senior technical interviewer evaluating a candidate's interview answers.

Role: ${jobTitle}
Required Skills: ${requiredSkills}

Interview Questions and Answers:
${qaBlock}

Evaluate each answer and provide an overall assessment.

Return ONLY a valid JSON object, no explanation, no markdown:
{
  "overall_score": <integer 0-100>,
  "recommendation": "<one of: hire, maybe, reject>",
  "recommendation_reason": "2-3 sentence summary of why you recommend this decision",
  "per_answer_feedback": [
    {
      "question_id": 1,
      "score": <integer 0-10>,
      "feedback": "specific feedback on this answer — what was good and what was missing"
    }
  ],
  "strengths": ["key strength observed across the interview"],
  "areas_for_improvement": ["specific area the candidate should work on"],
  "overall_feedback": "3-4 sentence comprehensive evaluation of the candidate"
}

Scoring guide:
- 0-40: Poor answers, missing core concepts
- 41-60: Basic understanding, needs improvement
- 61-75: Good candidate, some gaps
- 76-90: Strong candidate, recommend hire
- 91-100: Exceptional, fast-track hire
`.trim();

    const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 2000,
    });

    const content = response.choices[0].message.content.trim();

    try {
        return JSON.parse(content);
    } catch {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) return JSON.parse(jsonMatch[0]);
        throw new Error('AI returned invalid JSON for answer evaluation');
    }
};

module.exports = { parseResume, scoreResumeMatch, generateInterviewQuestions, evaluateAnswers };