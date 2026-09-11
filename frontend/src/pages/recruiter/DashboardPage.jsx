import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { jobApi } from '../../api/job.api';

// ── Small reusable pieces ─────────────────────────────────────────────────────

const StatCard = ({ label, value, color = 'text-gray-900' }) => (
    <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
        <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
);

const JobCard = ({ job, onClick, onToggle }) => (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
            <div className="flex-1 cursor-pointer" onClick={onClick}>
                <h3 className="font-semibold text-gray-900">{job.title}</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                    Posted {new Date(job.created_at).toLocaleDateString()}
                </p>
            </div>
            <span
                className={`ml-3 px-2.5 py-1 rounded-full text-xs font-medium ${job.is_active
                    ? 'bg-green-50 text-green-700'
                    : 'bg-gray-100 text-gray-500'
                    }`}
            >
                {job.is_active ? 'Active' : 'Closed'}
            </span>
        </div>

        <p className="text-sm text-gray-500 line-clamp-2 mb-4">{job.description}</p>

        <div className="flex items-center justify-between">
            <div className="flex gap-4">
                <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">{job.application_count || 0}</p>
                    <p className="text-xs text-gray-400">Applicants</p>
                </div>
                {job.avg_match_score && (
                    <div className="text-center">
                        <p className="text-lg font-bold text-blue-600">{job.avg_match_score}%</p>
                        <p className="text-xs text-gray-400">Avg score</p>
                    </div>
                )}
            </div>

            <div className="flex gap-2">
                <button
                    onClick={onClick}
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors"
                >
                    View candidates
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onToggle(job.id); }}
                    className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-100 transition-colors"
                >
                    {job.is_active ? 'Close' : 'Reopen'}
                </button>
            </div>
        </div>
    </div>
);

// ── Create Job Modal ──────────────────────────────────────────────────────────
const CreateJobModal = ({ onClose, onCreated }) => {
    const [form, setForm] = useState({ title: '', description: '', required_skills: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!form.title || !form.description || !form.required_skills) {
            setError('All fields are required');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const res = await jobApi.create(form);
            onCreated(res.data.data.job);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create job');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl">
                <h2 className="text-lg font-bold text-gray-900 mb-5">Post a New Job</h2>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
                            placeholder="e.g. Senior Frontend Developer"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
                        <textarea
                            value={form.description}
                            onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
                            placeholder="Describe the role, responsibilities, team..."
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Required Skills</label>
                        <input
                            type="text"
                            value={form.required_skills}
                            onChange={(e) => setForm(p => ({ ...p, required_skills: e.target.value }))}
                            placeholder="e.g. React, Node.js, PostgreSQL, AWS"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-400 mt-1">Comma-separated list of skills</p>
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        {loading ? 'Posting...' : 'Post Job'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── Main Dashboard ────────────────────────────────────────────────────────────
const RecruiterDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const res = await jobApi.getMyJobs();
            setJobs(res.data.data.jobs);
        } catch (err) {
            console.error('Failed to load jobs', err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (jobId) => {
        try {
            const res = await jobApi.toggleJob(jobId);
            setJobs(prev => prev.map(j => j.id === jobId ? { ...j, is_active: res.data.data.job.is_active } : j));
        } catch (err) {
            console.error('Toggle failed', err);
        }
    };

    const handleJobCreated = (newJob) => {
        setJobs(prev => [{ ...newJob, application_count: 0 }, ...prev]);
    };

    const totalApplicants = jobs.reduce((sum, j) => sum + Number(j.application_count || 0), 0);
    const activeJobs = jobs.filter(j => j.is_active).length;

    return (

        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <h1 className="text-lg font-bold text-gray-900">HireMind AI</h1>

                <div className="flex items-center gap-4">
                    <span className="text-gray-200">|</span>
                    <button
                        onClick={() => navigate('/recruiter/scoring')}
                        className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                    >
                        Scoring Dashboard
                    </button>
                    <span className="text-sm text-gray-500">Hi, {user?.name}</span>
                    <button onClick={logout} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                        Logout
                    </button>
                </div>
            </nav>

            <div className="max-w-4xl mx-auto px-4 py-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Recruiter Dashboard</h2>
                        <p className="text-gray-500 text-sm mt-1">Manage your job postings and review candidates</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                        + Post a Job
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <StatCard label="Total Jobs" value={jobs.length} />
                    <StatCard label="Active Jobs" value={activeJobs} color="text-green-600" />
                    <StatCard label="Total Applicants" value={totalApplicants} color="text-blue-600" />
                </div>

                {/* Job list */}
                {loading ? (
                    <div className="text-center py-16 text-gray-400 text-sm">Loading your jobs...</div>
                ) : jobs.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                        <p className="text-gray-500 text-sm">You haven't posted any jobs yet.</p>
                        <button
                            onClick={() => setShowModal(true)}
                            className="mt-4 text-blue-600 text-sm hover:underline"
                        >
                            Post your first job →
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {jobs.map((job) => (
                            <JobCard
                                key={job.id}
                                job={job}
                                onClick={() => navigate(`/recruiter/jobs/${job.id}/candidates`)}
                                onToggle={handleToggle}
                            />
                        ))}
                    </div>
                )}
            </div>

            {showModal && (
                <CreateJobModal
                    onClose={() => setShowModal(false)}
                    onCreated={handleJobCreated}
                />
            )}
        </div>
    );
};

export default RecruiterDashboard;