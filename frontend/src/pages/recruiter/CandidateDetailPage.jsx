import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jobApi } from '../../api/job.api';
import { interviewApi } from '../../api/interview.api';
import ParsedResumeCard from '../../components/ParsedResumeCard';

const STATUS_OPTIONS = ['applied', 'reviewed', 'interviewed', 'hired', 'rejected'];

const StatusButton = ({ status, current, onClick }) => {
    const isActive = status === current;
    const colors = {
        applied: isActive ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100',
        reviewed: isActive ? 'bg-yellow-500 text-white' : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100',
        interviewed: isActive ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-700 hover:bg-purple-100',
        hired: isActive ? 'bg-green-600 text-white' : 'bg-green-50 text-green-700 hover:bg-green-100',
        rejected: isActive ? 'bg-red-600 text-white' : 'bg-red-50 text-red-700 hover:bg-red-100',
    };
    return (
        <button
            onClick={() => !isActive && onClick(status)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${colors[status]} ${isActive ? 'cursor-default ring-2 ring-offset-1 ring-current' : 'cursor-pointer'}`}
        >
            {isActive ? '✓ ' : ''}{status}
        </button>
    );
};

const RecommendationBadge = ({ recommendation }) => {
    const styles = {
        hire: 'bg-green-100 text-green-800 border-green-200',
        maybe: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        reject: 'bg-red-100 text-red-800 border-red-200',
    };
    const labels = { hire: '✓ Recommend Hire', maybe: '~ Maybe', reject: '✗ Reject' };
    return (
        <span className={`px-3 py-1.5 rounded-full border text-sm font-semibold ${styles[recommendation]}`}>
            {labels[recommendation] || recommendation}
        </span>
    );
};

const CandidateDetailPage = () => {
    const { applicationId } = useParams();
    const navigate = useNavigate();
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [interviewGenerated, setInterviewGenerated] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const res = await jobApi.getApplicationDetail(applicationId);
                setApplication(res.data.data.application);
                // If status is already 'interviewed', interview was previously generated
                if (res.data.data.application.status === 'interviewed' ||
                    res.data.data.application.status === 'hired' ||
                    res.data.data.application.status === 'rejected') {
                    setInterviewGenerated(true);
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load candidate');
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [applicationId]);

    const handleStatusUpdate = async (newStatus) => {
        setUpdating(true);
        try {
            await jobApi.updateStatus(applicationId, newStatus);
            setApplication(prev => ({ ...prev, status: newStatus }));
        } catch {
            setError('Failed to update status');
        } finally {
            setUpdating(false);
        }
    };

    const handleGenerateInterview = async () => {
        setGenerating(true);
        setError('');
        try {
            await interviewApi.generate(applicationId);
            setInterviewGenerated(true);
            setApplication(prev => ({ ...prev, status: 'interviewed' }));
            setSuccessMsg('Interview questions generated! The candidate can now see and answer them.');
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to generate interview';
            // If already generated, treat as success
            if (msg.includes('already')) {
                setInterviewGenerated(true);
                setSuccessMsg('Interview was already generated for this candidate.');
            } else {
                setError(msg);
            }
        } finally {
            setGenerating(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-gray-400 text-sm">Loading candidate profile...</p>
            </div>
        );
    }

    if (error && !application) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-500 text-sm">{error}</p>
                    <button onClick={() => navigate(-1)} className="mt-3 text-blue-600 text-sm hover:underline">Go back</button>
                </div>
            </div>
        );
    }

    const parsedResume = application.parsed_resume;
    const matchDetails = parsedResume?.match_details;

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                    ← Back to candidates
                </button>
            </nav>

            <div className="max-w-2xl mx-auto px-4 py-10">

                {/* Candidate header */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 shadow-sm">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{application.candidate_name}</h2>
                            <p className="text-sm text-gray-500">{application.candidate_email}</p>
                            <p className="text-xs text-gray-400 mt-1">
                                Applied for: <span className="font-medium text-gray-600">{application.job_title}</span>
                            </p>
                        </div>
                        {application.match_score !== null && (
                            <div className="text-center">
                                <p className="text-3xl font-bold text-blue-600">{application.match_score}%</p>
                                <p className="text-xs text-gray-400">match score</p>
                            </div>
                        )}
                    </div>

                    {/* Status updater */}
                    <div className="mb-5">
                        <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
                            Status {updating && '(saving...)'}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {STATUS_OPTIONS.map((s) => (
                                <StatusButton key={s} status={s} current={application.status} onClick={handleStatusUpdate} />
                            ))}
                        </div>
                    </div>

                    {/* Generate interview button */}
                    <div className="border-t border-gray-100 pt-5">
                        <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">AI Interview</p>
                        {successMsg && (
                            <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                                {successMsg}
                            </div>
                        )}
                        {error && (
                            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                {error}
                            </div>
                        )}
                        {interviewGenerated ? (
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-green-600 font-medium">✓ Interview generated</span>
                                <button
                                    onClick={() => navigate(`/recruiter/interviews/${applicationId}/result`)}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                                >
                                    View AI Evaluation →
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={handleGenerateInterview}
                                disabled={generating}
                                className="px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                            >
                                {generating ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Generating questions with AI...
                                    </>
                                ) : (
                                    '✦ Generate AI Interview'
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* Parsed resume + match details */}
                <ParsedResumeCard
                    parsedResume={parsedResume}
                    matchResult={matchDetails}
                    resumeUrl={application.resume_url}
                />
            </div>
        </div>
    );
};

export default CandidateDetailPage;