// Displays the AI-parsed resume data in a clean, readable format.
// Also shows the match score and matched/missing skills.

const ScoreBadge = ({ score }) => {
    const color =
        score >= 75 ? 'bg-green-100 text-green-800 border-green-200' :
            score >= 50 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                'bg-red-100 text-red-800 border-red-200';

    return (
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border font-semibold text-lg ${color}`}>
            <span>Match Score</span>
            <span className="text-2xl font-bold">{score}%</span>
        </div>
    );
};

const Section = ({ title, children }) => (
    <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{title}</h3>
        {children}
    </div>
);

const SkillTag = ({ skill, variant = 'default' }) => {
    const styles = {
        default: 'bg-blue-50 text-blue-700 border-blue-200',
        matched: 'bg-green-50 text-green-700 border-green-200',
        missing: 'bg-red-50 text-red-700 border-red-200',
    };
    return (
        <span className={`inline-block px-2.5 py-1 rounded-md border text-xs font-medium mr-2 mb-2 ${styles[variant]}`}>
            {skill}
        </span>
    );
};

const ParsedResumeCard = ({ parsedResume, matchResult, resumeUrl }) => {
    if (!parsedResume) return null;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">

            {/* Header — name + score */}
            <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">
                        {parsedResume.full_name || 'Candidate'}
                    </h2>
                    {parsedResume.email && (
                        <p className="text-sm text-gray-500 mt-1">{parsedResume.email}</p>
                    )}
                </div>
                {matchResult?.score !== undefined && (
                    <ScoreBadge score={matchResult.score} />
                )}
            </div>

            {/* AI Summary */}
            {parsedResume.summary && (
                <Section title="Summary">
                    <p className="text-gray-600 text-sm leading-relaxed">{parsedResume.summary}</p>
                </Section>
            )}

            {/* Match analysis */}
            {matchResult && (
                <Section title="Match Analysis">
                    <p className="text-sm text-gray-600 mb-3 leading-relaxed">{matchResult.reasoning}</p>

                    {matchResult.matched_skills?.length > 0 && (
                        <div className="mb-3">
                            <p className="text-xs font-medium text-gray-500 mb-2">✓ Matched skills</p>
                            {matchResult.matched_skills.map((s) => <SkillTag key={s} skill={s} variant="matched" />)}
                        </div>
                    )}

                    {matchResult.missing_skills?.length > 0 && (
                        <div>
                            <p className="text-xs font-medium text-gray-500 mb-2">✗ Missing skills</p>
                            {matchResult.missing_skills.map((s) => <SkillTag key={s} skill={s} variant="missing" />)}
                        </div>
                    )}
                </Section>
            )}

            {/* All skills */}
            {parsedResume.skills?.length > 0 && (
                <Section title="Skills">
                    {parsedResume.skills.map((s) => <SkillTag key={s} skill={s} />)}
                </Section>
            )}

            {/* Experience */}
            {parsedResume.experience?.length > 0 && (
                <Section title="Experience">
                    <div className="space-y-3">
                        {parsedResume.experience.map((exp, i) => (
                            <div key={i} className="pl-3 border-l-2 border-blue-100">
                                <p className="font-medium text-gray-800 text-sm">{exp.role}</p>
                                <p className="text-gray-500 text-xs">{exp.company} · {exp.duration}</p>
                                {exp.description && (
                                    <p className="text-gray-600 text-xs mt-1 leading-relaxed">{exp.description}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </Section>
            )}

            {/* Education */}
            {parsedResume.education?.length > 0 && (
                <Section title="Education">
                    <div className="space-y-2">
                        {parsedResume.education.map((edu, i) => (
                            <div key={i} className="pl-3 border-l-2 border-purple-100">
                                <p className="font-medium text-gray-800 text-sm">{edu.degree}</p>
                                <p className="text-gray-500 text-xs">{edu.institution} · {edu.year}</p>
                            </div>
                        ))}
                    </div>
                </Section>
            )}

            {/* Resume PDF link */}
            {resumeUrl && (
                <a
                    href={resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
                >
                    View uploaded resume PDF →
                </a>
            )}
        </div>
    );
};

export default ParsedResumeCard;