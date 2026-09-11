import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dashboardApi } from '../../api/dashboard.api';
import { CardListSkeleton } from '../../components/LoadingSkeleton';

// ── Score ring ────────────────────────────────────────────────────────────────
const ScoreRing = ({ score, size = 'md', label, color }) => {
    const ringColor = color || (
        score >= 75 ? '#22c55e' :
            score >= 50 ? '#f59e0b' : '#ef4444'
    );
    const dim = size === 'lg' ? 'w-20 h-20' : 'w-14 h-14';
    const textSize = size === 'lg' ? 'text-sm' : 'text-xs';

    return (
        <div className={`relative ${dim} flex-shrink-0`}>
            <svg viewBox="0 0 36 36" className={`${dim} -rotate-90`}>
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f3f4f6" strokeWidth="3" />
                <circle
                    cx="18" cy="18" r="15.9" fill="none"
                    stroke={score ? ringColor : '#e5e7eb'} strokeWidth="3"
                    strokeDasharray={`${score || 0} 100`}
                    strokeLinecap="round"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`font-bold text-gray-800 ${textSize}`}>
                    {score !== null && score !== undefined ? `${score}%` : '—'}
                </span>
                {label && <span className="text-gray-400" style={{ fontSize: '7px' }}>{label}</span>}
            </div>
        </div>
    );
};

// ── Recommendation banner ─────────────────────────────────────────────────────
const RecommendationBanner = ({ recommendation }) => {
    if (!recommendation) return null;
    const styles = {
        hire: { bg: 'bg-green-50 border-green-200', text: 'text-green-800', label: '✓ AI recommends you for hire', emoji: '🎉' },
        maybe: { bg: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-800', label: 'AI suggests further review', emoji: '🤔' },
        reject: { bg: 'bg-red-50 border-red-200', text: 'text-red-800', label: 'Keep improving — not selected this time', emoji: '💪' },
    };
    const s = styles[recommendation];
    return (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${s.bg} mb-4`}>
            <span className="text-xl">{s.emoji}</span>
            <p className={`text-sm font-semibold ${s.text}`}>{s.label}</p>
        </div>
    );
};

// ── Application score card ────────────────────────────────────────────────────
const ApplicationScoreCard = ({ app }) => {
    const [expanded, setExpanded] = useState(false);
    const evaluation = app.ai_feedback
        ? (typeof app.ai_feedback === 'string' ? JSON.parse(app.ai_feedback) : app.ai_feedback)
        : null;

    const hasInterview = app.interview_score !== null;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Card header */}
            <div className="p-5">
                <div className="flex items-start gap-4">
                    {/* Score rings */}
                    <div className="flex items-center gap-3">
                        <div className="text-center">
                            <ScoreRing score={app.match_score} label="Resume" color="#3b82f6" />
                        </div>
                        {hasInterview && (
                            <>
                                <span className="text-gray-300 text-lg font-light">+</span>
                                <div className="text-center">
                                    <ScoreRing score={app.interview_score} label="Interview" color="#a855f7" />
                                </div>
                                <span className="text-gray-300 text-lg font-light">=</span>
                                <div className="text-center">
                                    <ScoreRing score={app.combined_score} size="lg" label="Combined" />
                                </div>
                            </>
                        )}
                    </div>

                    {/* Job info */}
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900">{app.job_title}</h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                            Applied {new Date(app.applied_at).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 capitalize">
                            Status: <span className="font-medium">{app.status}</span>
                        </p>

                        {/* Interview pending notice */}
                        {!hasInterview && (
                            <div className="mt-2 inline-flex items-center gap-1.5 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-full">
                                <span className="text-amber-600 text-xs">⏳ Interview not assigned yet</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recommendation */}
                {app.recommendation && (
                    <div className="mt-4">
                        <RecommendationBanner recommendation={app.recommendation} />
                    </div>
                )}

                {/* Expand button */}
                {evaluation && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="mt-3 text-sm text-blue-600 hover:underline font-medium"
                    >
                        {expanded ? 'Hide feedback ↑' : 'View detailed feedback ↓'}
                    </button>
                )}
            </div>

            {/* Expanded feedback */}
            {expanded && evaluation && (
                <div className="border-t border-gray-50 p-5 bg-gray-50 space-y-4">

                    {/* Overall feedback */}
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">AI Overall Feedback</p>
                        <p className="text-sm text-gray-600 leading-relaxed">{evaluation.overall_feedback}</p>
                    </div>

                    {/* Strengths & improvements */}
                    <div className="grid grid-cols-2 gap-4">
                        {evaluation.strengths?.length > 0 && (
                            <div>
                                <p className="text-xs font-semibold text-green-700 mb-2">Your Strengths</p>
                                <ul className="space-y-1">
                                    {evaluation.strengths.map((s, i) => (
                                        <li key={i} className="text-xs text-gray-600 flex items-start gap-1">
                                            <span className="text-green-500">✓</span> {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {evaluation.areas_for_improvement?.length > 0 && (
                            <div>
                                <p className="text-xs font-semibold text-amber-700 mb-2">Areas to Improve</p>
                                <ul className="space-y-1">
                                    {evaluation.areas_for_improvement.map((a, i) => (
                                        <li key={i} className="text-xs text-gray-600 flex items-start gap-1">
                                            <span className="text-amber-500">→</span> {a}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Per-answer scores */}
                    {evaluation.per_answer_feedback?.length > 0 && (
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                Per-Question Scores
                            </p>
                            <div className="space-y-2">
                                {evaluation.per_answer_feedback.map((fb) => {
                                    const q = app.questions?.find(q => q.id === fb.question_id);
                                    const scoreColor = fb.score >= 7 ? 'text-green-600' : fb.score >= 5 ? 'text-yellow-600' : 'text-red-500';
                                    return (
                                        <div key={fb.question_id} className="bg-white rounded-lg p-3 border border-gray-100">
                                            {q && (
                                                <p className="text-xs text-gray-500 mb-1 line-clamp-1">Q{fb.question_id}: {q.question}</p>
                                            )}
                                            <div className="flex items-center justify-between">
                                                <p className="text-xs text-gray-600 leading-relaxed flex-1 pr-3">{fb.feedback}</p>
                                                <span className={`text-sm font-bold flex-shrink-0 ${scoreColor}`}>{fb.score}/10</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Go to interview page link */}
                    <Link
                        to="/candidate/interviews"
                        className="inline-block text-sm text-blue-600 hover:underline"
                    >
                        View full interview answers →
                    </Link>
                </div>
            )}
        </div>
    );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const ScoreCardPage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [scores, setScores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await dashboardApi.getCandidateDashboard();
                setScores(res.data.data.scores);
            } catch {
                setError('Failed to load your scores');
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    // Best application by combined score
    const best = scores.length > 0 ? scores[0] : null;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h1 className="text-lg font-bold text-gray-900">HireMind AI</h1>
                    <span className="text-gray-200">|</span>
                    <button onClick={() => navigate('/candidate/dashboard')} className="text-sm text-gray-500 hover:text-gray-900">
                        Applications
                    </button>
                    <button onClick={() => navigate('/candidate/interviews')} className="text-sm text-gray-500 hover:text-gray-900">
                        Interviews
                    </button>
                    <span className="text-sm text-blue-600 font-medium">My Scores</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">Hi, {user?.name}</span>
                    <button onClick={logout} className="text-sm text-gray-500 hover:text-gray-900">Logout</button>
                </div>
            </nav>

            <div className="max-w-2xl mx-auto px-4 py-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">My Scores</h2>
                <p className="text-gray-500 text-sm mb-8">
                    Combined score = Resume match (40%) + Interview score (60%)
                </p>

                {loading ? (
                    <CardListSkeleton count={2} />
                ) : error ? (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
                ) : scores.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                        <p className="text-gray-500 text-sm">No scores yet.</p>
                        <Link to="/candidate/upload" className="mt-3 inline-block text-blue-600 text-sm hover:underline">
                            Apply to a job to get started →
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {scores.map((app) => (
                            <ApplicationScoreCard key={app.application_id} app={app} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScoreCardPage;