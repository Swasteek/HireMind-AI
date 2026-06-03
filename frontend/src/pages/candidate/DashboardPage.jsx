import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { resumeApi } from '../../api/resume.api';

const StatusBadge = ({ status }) => {
    const styles = {
        applied: 'bg-blue-50 text-blue-700',
        reviewed: 'bg-yellow-50 text-yellow-700',
        interviewed: 'bg-purple-50 text-purple-700',
        hired: 'bg-green-50 text-green-700',
        rejected: 'bg-red-50 text-red-700',
    };
    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${styles[status] || 'bg-gray-50 text-gray-600'}`}>
            {status}
        </span>
    );
};

const ScoreBar = ({ score }) => {
    const color = score >= 75 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-400';
    return (
        <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${score}%` }} />
            </div>
            <span className="text-xs font-semibold text-gray-700 w-8">{score}%</span>
        </div>
    );
};

const CandidateDashboard = () => {
    const { user, logout } = useAuth();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const res = await resumeApi.getMyApplications();
                setApplications(res.data.data.applications);
            } catch (err) {
                console.error('Failed to load applications', err);
            } finally {
                setLoading(false);
            }
        };
        fetchApplications();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <h1 className="text-lg font-bold text-gray-900">HireMind AI</h1>
                <div className="flex items-center gap-4">
                    <Link
                        to="/candidate/interviews"
                        className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                    >
                        Interviews
                    </Link>

                    <span className="text-sm text-gray-500">Hi, {user?.name}</span>
                    <button
                        onClick={logout}
                        className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                    >
                        Logout
                    </button>
                </div>
            </nav>

            <div className="max-w-3xl mx-auto px-4 py-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">My Applications</h2>
                        <p className="text-gray-500 text-sm mt-1">Track your job applications and AI scores</p>
                    </div>
                    <Link
                        to="/candidate/upload"
                        className="px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                        + Apply to a Job
                    </Link>
                </div>

                {/* Applications list */}
                {loading ? (
                    <div className="text-center py-16 text-gray-400 text-sm">Loading your applications...</div>
                ) : applications.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                        <p className="text-gray-500 text-sm">You haven't applied to any jobs yet.</p>
                        <Link to="/candidate/upload" className="mt-4 inline-block text-blue-600 text-sm hover:underline">
                            Apply to your first job →
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {applications.map((app) => (
                            <div key={app.id} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{app.job_title}</h3>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            Applied {new Date(app.applied_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <StatusBadge status={app.status} />
                                </div>

                                {app.match_score !== null && (
                                    <div className="mt-3">
                                        <p className="text-xs text-gray-500 mb-1">Match score</p>
                                        <ScoreBar score={app.match_score} />
                                    </div>
                                )}

                                {app.parsed_resume?.skills?.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-1.5">
                                        {app.parsed_resume.skills.slice(0, 5).map((skill) => (
                                            <span key={skill} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md">
                                                {skill}
                                            </span>
                                        ))}
                                        {app.parsed_resume.skills.length > 5 && (
                                            <span className="text-xs text-gray-400">+{app.parsed_resume.skills.length - 5} more</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CandidateDashboard;