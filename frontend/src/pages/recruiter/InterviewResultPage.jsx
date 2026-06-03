import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { interviewApi } from '../../api/interview.api';

const RecommendationBanner = ({ recommendation, score }) => {
    const styles = {
        hire: { bg: 'bg-green-50 border-green-200', text: 'text-green-800', label: '✓ AI Recommends: Hire', bar: 'bg-green-500' },
        maybe: { bg: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-800', label: '~ AI Recommends: Maybe', bar: 'bg-yellow-500' },
        reject: { bg: 'bg-red-50 border-red-200', text: 'text-red-800', label: '✗ AI Recommends: Reject', bar: 'bg-red-400' },
    };
    const s = styles[recommendation] || styles.maybe;

    return (
        <div className={`rounded-xl border p-5 mb-6 ${s.bg}`}>
            <div className="flex items-center justify-between mb-3">
                <span className={`text-lg font-bold ${s.text}`}>{s.label}</span>
                <span className={`text-3xl font-bold ${s.text}`}>{score}%</span>
            </div>
            <div className="w-full bg-white bg-opacity-60 rounded-full h-2">
                <div className={`h-2 rounded-full ${s.bar}`} style={{ width: `${score}%` }} />
            </div>
        </div>
    );
};

const InterviewResultPage = () => {
    const { applicationId } = useParams();
    const navigate = useNavigate();
    const [result, setResult] = useState(null);
    const [evaluation, setEvaluation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchResult = async () => {
            try {
                const res = await interviewApi.getResult(applicationId);
                const data = res.data.data.result;
                setResult(data);
                // ai_feedback is stored as JSON string in DB
                if (data.ai_feedback) {
                    setEvaluation(typeof data.ai_feedback === 'string'
                        ? JSON.parse(data.ai_feedback)
                        : data.ai_feedback
                    );
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load interview result');
            } finally {
                setLoading(false);
            }
        };
        fetchResult();
    }, [applicationId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-gray-400 text-sm">Loading interview evaluation...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-500 text-sm">{error}</p>
                    <p className="text-gray-400 text-xs mt-1">The candidate may not have submitted their answers yet.</p>
                    <button onClick={() => navigate(-1)} className="mt-3 text-blue-600 text-sm hover:underline">
                        Go back
                    </button>
                </div>
            </div>
        );
    }

    const questions = result.questions || [];
    const answers = result.answers || [];

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                    ← Back
                </button>
                <span className="text-gray-300">|</span>
                <h1 className="text-lg font-bold text-gray-900">Interview Evaluation</h1>
            </nav>

            <div className="max-w-2xl mx-auto px-4 py-10">

                {/* Candidate info */}
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">{result.candidate_name}</h2>
                    <p className="text-gray-500 text-sm">{result.candidate_email} · {result.job_title}</p>
                    <p className="text-xs text-gray-400 mt-1">
                        Resume match: <span className="font-semibold text-blue-600">{result.match_score}%</span>
                        {result.score && (
                            <> · Interview score: <span className="font-semibold text-purple-600">{result.score}%</span></>
                        )}
                    </p>
                </div>

                {/* No evaluation yet */}
                {!evaluation ? (
                    <div className="bg-white rounded-xl border border-gray-100 p-8 text-center shadow-sm">
                        <p className="text-gray-500 text-sm">The candidate hasn't submitted their answers yet.</p>
                        <p className="text-gray-400 text-xs mt-1">Check back once they complete the interview.</p>
                    </div>
                ) : (
                    <>
                        {/* AI Recommendation banner */}
                        <RecommendationBanner
                            recommendation={evaluation.recommendation}
                            score={evaluation.overall_score}
                        />

                        {/* Overall feedback */}
                        <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6 shadow-sm">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                                AI Overall Feedback
                            </h3>
                            <p className="text-gray-700 text-sm leading-relaxed mb-3">{evaluation.overall_feedback}</p>
                            <p className="text-gray-600 text-sm italic">{evaluation.recommendation_reason}</p>

                            <div className="grid grid-cols-2 gap-4 mt-4">
                                {evaluation.strengths?.length > 0 && (
                                    <div>
                                        <p className="text-xs font-semibold text-green-700 mb-2">Strengths</p>
                                        <ul className="space-y-1">
                                            {evaluation.strengths.map((s, i) => (
                                                <li key={i} className="text-xs text-gray-600 flex items-start gap-1">
                                                    <span className="text-green-500 mt-0.5">✓</span> {s}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {evaluation.areas_for_improvement?.length > 0 && (
                                    <div>
                                        <p className="text-xs font-semibold text-red-700 mb-2">Areas to Improve</p>
                                        <ul className="space-y-1">
                                            {evaluation.areas_for_improvement.map((a, i) => (
                                                <li key={i} className="text-xs text-gray-600 flex items-start gap-1">
                                                    <span className="text-red-400 mt-0.5">✗</span> {a}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Per-question breakdown */}
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Question-by-Question Breakdown</h3>
                        <div className="space-y-4">
                            {questions.map((q, index) => {
                                const ans = answers.find(a => a.questionId === q.id);
                                const fb = evaluation.per_answer_feedback?.find(f => f.question_id === q.id);
                                const scoreColor = fb?.score >= 7 ? 'text-green-600' : fb?.score >= 5 ? 'text-yellow-600' : 'text-red-500';

                                return (
                                    <div key={q.id} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="w-6 h-6 bg-gray-100 text-gray-600 rounded-full text-xs font-bold flex items-center justify-center">
                                                    {index + 1}
                                                </span>
                                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${q.type === 'technical' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
                                                    }`}>
                                                    {q.type}
                                                </span>
                                            </div>
                                            {fb && (
                                                <span className={`text-sm font-bold ${scoreColor}`}>{fb.score}/10</span>
                                            )}
                                        </div>

                                        <p className="font-medium text-gray-800 text-sm mb-3 leading-relaxed">{q.question}</p>

                                        <div className="bg-gray-50 rounded-lg p-3 mb-3">
                                            <p className="text-xs font-medium text-gray-400 mb-1">Candidate's Answer</p>
                                            <p className="text-sm text-gray-600 leading-relaxed">
                                                {ans?.answer || <span className="italic text-gray-400">No answer provided</span>}
                                            </p>
                                        </div>

                                        {fb && (
                                            <div className="border-l-2 border-blue-200 pl-3">
                                                <p className="text-xs font-medium text-blue-600 mb-1">AI Feedback</p>
                                                <p className="text-sm text-gray-600 leading-relaxed">{fb.feedback}</p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default InterviewResultPage;