import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { interviewApi } from '../../api/interview.api';

// ── Per-answer feedback card (shown after submission) ─────────────────────────
const AnswerFeedbackCard = ({ question, answer, feedback }) => (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${question.type === 'technical'
                    ? 'bg-blue-50 text-blue-700'
                    : 'bg-purple-50 text-purple-700'
                }`}>
                {question.type}
            </span>
            {feedback && (
                <span className="text-xs font-semibold text-gray-500">
                    Score: {feedback.score}/10
                </span>
            )}
        </div>
        <p className="font-medium text-gray-800 text-sm mb-2">{question.question}</p>
        <div className="bg-gray-50 rounded-lg p-3 mb-3">
            <p className="text-sm text-gray-600 italic">"{answer}"</p>
        </div>
        {feedback && (
            <p className="text-sm text-gray-600 leading-relaxed">
                <span className="font-medium text-gray-700">Feedback: </span>
                {feedback.feedback}
            </p>
        )}
    </div>
);

// ── Evaluation summary (shown after submission) ───────────────────────────────
const EvaluationSummary = ({ evaluation }) => {
    const recStyles = {
        hire: { bg: 'bg-green-50 border-green-200', text: 'text-green-800', label: '✓ Recommended for Hire' },
        maybe: { bg: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-800', label: '~ Maybe — Further Review Needed' },
        reject: { bg: 'bg-red-50 border-red-200', text: 'text-red-800', label: '✗ Not Recommended' },
    };
    const rec = recStyles[evaluation.recommendation] || recStyles.maybe;

    return (
        <div className={`rounded-xl border p-5 mb-6 ${rec.bg}`}>
            <div className="flex items-center justify-between mb-3">
                <span className={`font-semibold ${rec.text}`}>{rec.label}</span>
                <span className={`text-2xl font-bold ${rec.text}`}>{evaluation.overall_score}%</span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed mb-3">{evaluation.overall_feedback}</p>
            <p className="text-sm text-gray-600 italic">{evaluation.recommendation_reason}</p>

            {evaluation.strengths?.length > 0 && (
                <div className="mt-4">
                    <p className="text-xs font-semibold text-gray-500 mb-1">Strengths</p>
                    <ul className="list-disc list-inside space-y-0.5">
                        {evaluation.strengths.map((s, i) => (
                            <li key={i} className="text-sm text-gray-600">{s}</li>
                        ))}
                    </ul>
                </div>
            )}

            {evaluation.areas_for_improvement?.length > 0 && (
                <div className="mt-3">
                    <p className="text-xs font-semibold text-gray-500 mb-1">Areas to Improve</p>
                    <ul className="list-disc list-inside space-y-0.5">
                        {evaluation.areas_for_improvement.map((a, i) => (
                            <li key={i} className="text-sm text-gray-600">{a}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

// ── Main Interview Page ───────────────────────────────────────────────────────
const InterviewPage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [interviews, setInterviews] = useState([]);
    const [selectedInterview, setSelectedInterview] = useState(null);
    const [answers, setAnswers] = useState({}); // { questionId: answerText }
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [evaluation, setEvaluation] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchInterviews = async () => {
            try {
                const res = await interviewApi.getMyInterviews();
                const all = res.data.data.interviews;
                setInterviews(all);

                // Auto-select first pending (unanswered) interview
                const pending = all.find(i => !i.answers);
                if (pending) setSelectedInterview(pending);
                else if (all.length > 0) {
                    setSelectedInterview(all[0]);
                    // If already submitted, parse evaluation
                    if (all[0].ai_feedback) {
                        setEvaluation(JSON.parse(all[0].ai_feedback));
                    }
                }
            } catch (err) {
                setError('Failed to load interviews');
            } finally {
                setLoading(false);
            }
        };
        fetchInterviews();
    }, []);

    const handleAnswerChange = (questionId, value) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const handleSubmit = async () => {
        // Validate all questions are answered
        const unanswered = selectedInterview.questions.filter(
            q => !answers[q.id] || answers[q.id].trim().length < 10
        );
        if (unanswered.length > 0) {
            setError(`Please answer all questions (minimum 10 characters each). ${unanswered.length} unanswered.`);
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            // Format answers for the API
            const formattedAnswers = selectedInterview.questions.map(q => ({
                questionId: q.id,
                answer: answers[q.id],
            }));

            const res = await interviewApi.submitAnswers(
                selectedInterview.session_id,
                formattedAnswers
            );

            setEvaluation(res.data.data.evaluation);
        } catch (err) {
            setError(err.response?.data?.message || 'Submission failed. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-gray-400 text-sm">Loading your interviews...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <h1 className="text-lg font-bold text-gray-900">HireMind AI</h1>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/candidate/dashboard')}
                        className="text-sm text-gray-500 hover:text-gray-900"
                    >
                        Dashboard
                    </button>
                    <span className="text-sm text-gray-500">Hi, {user?.name}</span>
                    <button onClick={logout} className="text-sm text-gray-500 hover:text-gray-900">Logout</button>
                </div>
            </nav>

            <div className="max-w-2xl mx-auto px-4 py-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">My Interviews</h2>
                <p className="text-gray-500 text-sm mb-8">Answer the questions below. AI will evaluate your responses.</p>

                {interviews.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                        <p className="text-gray-500 text-sm">No interviews assigned yet.</p>
                        <p className="text-gray-400 text-xs mt-1">A recruiter needs to generate an interview for your application first.</p>
                        <button
                            onClick={() => navigate('/candidate/dashboard')}
                            className="mt-4 text-blue-600 text-sm hover:underline"
                        >
                            Back to dashboard
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Interview selector (if multiple) */}
                        {interviews.length > 1 && (
                            <div className="mb-6 flex gap-2 flex-wrap">
                                {interviews.map((iv) => (
                                    <button
                                        key={iv.session_id}
                                        onClick={() => {
                                            setSelectedInterview(iv);
                                            setEvaluation(iv.ai_feedback ? JSON.parse(iv.ai_feedback) : null);
                                            setAnswers({});
                                        }}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${selectedInterview?.session_id === iv.session_id
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'
                                            }`}
                                    >
                                        {iv.job_title}
                                    </button>
                                ))}
                            </div>
                        )}

                        {selectedInterview && (
                            <>
                                <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6 shadow-sm">
                                    <p className="text-sm font-semibold text-gray-700">
                                        Role: <span className="text-blue-600">{selectedInterview.job_title}</span>
                                    </p>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        {selectedInterview.answers ? 'Completed' : 'Pending your answers'}
                                    </p>
                                </div>

                                {/* Show evaluation if already submitted */}
                                {evaluation && (
                                    <>
                                        <EvaluationSummary evaluation={evaluation} />
                                        <h3 className="text-lg font-bold text-gray-900 mb-4">Your Answers & Feedback</h3>
                                        <div className="space-y-4">
                                            {selectedInterview.questions.map((q) => {
                                                const submittedAnswers = selectedInterview.answers || [];
                                                const ans = submittedAnswers.find(a => a.questionId === q.id);
                                                const fb = evaluation.per_answer_feedback?.find(f => f.question_id === q.id);
                                                return (
                                                    <AnswerFeedbackCard
                                                        key={q.id}
                                                        question={q}
                                                        answer={ans?.answer || ''}
                                                        feedback={fb}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </>
                                )}

                                {/* Show questions form if not yet submitted */}
                                {!evaluation && (
                                    <>
                                        {error && (
                                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                                {error}
                                            </div>
                                        )}

                                        <div className="space-y-6">
                                            {selectedInterview.questions.map((q, index) => (
                                                <div key={q.id} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <span className="w-6 h-6 bg-blue-600 text-white rounded-full text-xs font-bold flex items-center justify-center">
                                                            {index + 1}
                                                        </span>
                                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${q.type === 'technical'
                                                                ? 'bg-blue-50 text-blue-700'
                                                                : 'bg-purple-50 text-purple-700'
                                                            }`}>
                                                            {q.type}
                                                        </span>
                                                    </div>
                                                    <p className="font-medium text-gray-800 text-sm mb-3 leading-relaxed">
                                                        {q.question}
                                                    </p>
                                                    <textarea
                                                        value={answers[q.id] || ''}
                                                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                                        rows={4}
                                                        placeholder="Type your answer here..."
                                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                                    />
                                                    <p className="text-xs text-gray-400 mt-1 text-right">
                                                        {(answers[q.id] || '').length} chars
                                                    </p>
                                                </div>
                                            ))}
                                        </div>

                                        <button
                                            onClick={handleSubmit}
                                            disabled={submitting}
                                            className="mt-6 w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                                        >
                                            {submitting ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    AI is evaluating your answers...
                                                </>
                                            ) : (
                                                'Submit Interview →'
                                            )}
                                        </button>
                                    </>
                                )}
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default InterviewPage;