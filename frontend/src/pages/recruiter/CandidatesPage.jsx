import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jobApi } from '../../api/job.api';

const ScoreRing = ({ score }) => {
    const color =
        score >= 75 ? '#22c55e' :
            score >= 50 ? '#f59e0b' : '#ef4444';

    return (
        <div className="relative w-14 h-14 flex-shrink-0">
            <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f3f4f6" strokeWidth="3" />
                <circle
                    cx="18" cy="18" r="15.9" fill="none"
                    stroke={color} strokeWidth="3"
                    strokeDasharray={`${score} 100`}
                    strokeLinecap="round"
                />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-800">
                {score}%
            </span>
        </div>
    );
};

const StatusBadge = ({ status }) => {
    const styles = {
        applied: 'bg-blue-50 text-blue-700',
        reviewed: 'bg-yellow-50 text-yellow-700',
        interviewed: 'bg-purple-50 text-purple-700',
        hired: 'bg-green-50 text-green-700',
        rejected: 'bg-red-50 text-red-700',
    };
    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${styles[status] || 'bg-gray-50 text-gray-500'}`}>
            {status}
        </span>
    );
};

const CandidatesPage = () => {
    const { jobId } = useParams(); // from URL: /recruiter/jobs/:jobId/candidates
    const navigate = useNavigate();
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [jobTitle, setJobTitle] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCandidates = async () => {
            try {
                const res = await jobApi.getCandidates(jobId);
                setCandidates(res.data.data.candidates);
                // Get job title from first candidate if available
                if (res.data.data.candidates.length > 0) {
                    setJobTitle(res.data.data.candidates[0].job_title || 'Job');
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load candidates');
            } finally {
                setLoading(false);
            }
        };
        fetchCandidates();
    }, [jobId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-gray-400 text-sm">Loading candidates...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3">
                <button
                    onClick={() => navigate('/recruiter/dashboard')}
                    className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                    ← Back
                </button>
                <span className="text-gray-300">|</span>
                <h1 className="text-lg font-bold text-gray-900">Candidates</h1>
            </nav>

            <div className="max-w-3xl mx-auto px-4 py-10">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">{jobTitle || 'Applicants'}</h2>
                    <p className="text-gray-500 text-sm mt-1">
                        {candidates.length} candidate{candidates.length !== 1 ? 's' : ''} · ranked by AI match score
                    </p>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm mb-6">
                        {error}
                    </div>
                )}

                {candidates.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                        <p className="text-gray-500 text-sm">No candidates have applied to this job yet.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {candidates.map((c, index) => (
                            <div
                                key={c.application_id}
                                onClick={() => navigate(`/recruiter/applications/${c.application_id}`)}
                                className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:border-blue-100 transition-all cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    {/* Rank badge */}
                                    <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">
                                        {index + 1}
                                    </div>

                                    {/* Score ring */}
                                    <ScoreRing score={c.match_score || 0} />

                                    {/* Candidate info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-gray-900">{c.candidate_name}</h3>
                                            <StatusBadge status={c.status} />
                                        </div>
                                        <p className="text-xs text-gray-400">{c.candidate_email}</p>

                                        {/* Top skills */}
                                        {c.parsed_resume?.skills?.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mt-2">
                                                {c.parsed_resume.skills.slice(0, 4).map((skill) => (
                                                    <span key={skill} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md">
                                                        {skill}
                                                    </span>
                                                ))}
                                                {c.parsed_resume.skills.length > 4 && (
                                                    <span className="text-xs text-gray-400">+{c.parsed_resume.skills.length - 4} more</span>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <span className="text-gray-300 text-lg flex-shrink-0">→</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CandidatesPage;