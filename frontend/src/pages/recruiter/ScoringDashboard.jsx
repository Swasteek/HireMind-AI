import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dashboardApi } from '../../api/dashboard.api';
import { StatsSkeleton, CardListSkeleton } from '../../components/LoadingSkeleton';

// ── Small reusable pieces ─────────────────────────────────────────────────────

const ScoreCell = ({ score, color = 'text-gray-900' }) => {
    if (score === null || score === undefined) {
        return <span className="text-gray-300 text-sm">—</span>;
    }
    return <span className={`font-bold text-sm ${color}`}>{score}%</span>;
};

const ScoreBar = ({ score, color = 'bg-blue-500' }) => {
    if (!score) return <div className="h-1.5 bg-gray-100 rounded-full w-full" />;
    return (
        <div className="h-1.5 bg-gray-100 rounded-full w-full">
            <div
                className={`h-1.5 rounded-full ${color}`}
                style={{ width: `${score}%` }}
            />
        </div>
    );
};

const RecommendationBadge = ({ recommendation }) => {
    if (!recommendation) return <span className="text-gray-300 text-xs">—</span>;
    const styles = {
        hire: 'bg-green-50 text-green-700',
        maybe: 'bg-yellow-50 text-yellow-700',
        reject: 'bg-red-50 text-red-700',
    };
    const labels = { hire: '✓ Hire', maybe: '~ Maybe', reject: '✗ Reject' };
    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[recommendation]}`}>
            {labels[recommendation]}
        </span>
    );
};

const StatCard = ({ label, value, sub, color = 'text-gray-900' }) => (
    <div className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
);

// ── Filter bar ────────────────────────────────────────────────────────────────
const FilterBar = ({ jobs, selectedJob, onJobChange, filter, onFilterChange }) => (
    <div className="flex items-center gap-3 mb-6 flex-wrap">
        <select
            value={selectedJob}
            onChange={(e) => onJobChange(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
            <option value="all">All jobs</option>
            {jobs.map(j => (
                <option key={j.jobId} value={j.jobId}>{j.jobTitle}</option>
            ))}
        </select>

        <select
            value={filter}
            onChange={(e) => onFilterChange(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
            <option value="all">All candidates</option>
            <option value="hire">Recommended: Hire</option>
            <option value="maybe">Recommended: Maybe</option>
            <option value="reject">Recommended: Reject</option>
            <option value="interviewed">Interviewed</option>
            <option value="pending">Pending interview</option>
        </select>
    </div>
);

// ── Main Dashboard ────────────────────────────────────────────────────────────
const ScoringDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedJob, setSelectedJob] = useState('all');
    const [filter, setFilter] = useState('all');
    const [error, setError] = useState('');

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await dashboardApi.getRecruiterDashboard();
                setData(res.data.data);
            } catch (err) {
                setError('Failed to load dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    // ── Filter candidates ───────────────────────────────────────────────────────
    const filtered = (() => {
        if (!data) return [];
        let rows = data.all;

        // Filter by job
        if (selectedJob !== 'all') {
            rows = rows.filter(r => r.job_id === selectedJob);
        }

        // Filter by recommendation/status
        if (filter === 'hire') rows = rows.filter(r => r.recommendation === 'hire');
        else if (filter === 'maybe') rows = rows.filter(r => r.recommendation === 'maybe');
        else if (filter === 'reject') rows = rows.filter(r => r.recommendation === 'reject');
        else if (filter === 'interviewed') rows = rows.filter(r => r.interview_score !== null);
        else if (filter === 'pending') rows = rows.filter(r => r.interview_score === null);

        return rows;
    })();

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Navbar */}
            <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h1 className="text-lg font-bold text-gray-900">HireMind AI</h1>
                    <span className="text-gray-200">|</span>
                    <button
                        onClick={() => navigate('/recruiter/dashboard')}
                        className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                    >
                        Jobs
                    </button>
                    <span className="text-sm text-blue-600 font-medium">Scoring</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">Hi, {user?.name}</span>
                    <button onClick={logout} className="text-sm text-gray-500 hover:text-gray-900">Logout</button>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto px-4 py-10">

                {/* Header */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Scoring Dashboard</h2>
                    <p className="text-gray-500 text-sm mt-1">
                        Combined score = Resume match (40%) + Interview score (60%)
                    </p>
                </div>

                {loading ? (
                    <><StatsSkeleton /><CardListSkeleton count={5} /></>
                ) : error ? (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
                ) : (
                    <>
                        {/* Stats row */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            <StatCard label="Total Candidates" value={data.stats.total} />
                            <StatCard label="Interviewed" value={data.stats.interviewed} color="text-purple-600" />
                            <StatCard label="Hire Recommendations" value={data.stats.hired} color="text-green-600" />
                            <StatCard label="Avg Combined Score" value={`${data.stats.avgCombined}%`} color="text-blue-600" />
                        </div>

                        {/* Filters */}
                        <FilterBar
                            jobs={data.byJob}
                            selectedJob={selectedJob}
                            onJobChange={setSelectedJob}
                            filter={filter}
                            onFilterChange={setFilter}
                        />

                        {/* Table */}
                        {filtered.length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                                <p className="text-gray-500 text-sm">No candidates match this filter.</p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                {/* Table header */}
                                <div className="grid grid-cols-12 gap-2 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                    <div className="col-span-1">#</div>
                                    <div className="col-span-3">Candidate</div>
                                    <div className="col-span-2">Job</div>
                                    <div className="col-span-2">Resume</div>
                                    <div className="col-span-2">Interview</div>
                                    <div className="col-span-1">Combined</div>
                                    <div className="col-span-1">AI Verdict</div>
                                </div>

                                {/* Table rows */}
                                <div className="divide-y divide-gray-50">
                                    {filtered.map((c, index) => (
                                        <div
                                            key={c.application_id}
                                            onClick={() => navigate(`/recruiter/applications/${c.application_id}`)}
                                            className="grid grid-cols-12 gap-2 px-5 py-4 hover:bg-gray-50 cursor-pointer transition-colors items-center"
                                        >
                                            {/* Rank */}
                                            <div className="col-span-1">
                                                <span className="text-xs font-bold text-gray-400">#{index + 1}</span>
                                            </div>

                                            {/* Candidate */}
                                            <div className="col-span-3">
                                                <p className="font-medium text-gray-900 text-sm truncate">{c.candidate_name}</p>
                                                <p className="text-xs text-gray-400 truncate">{c.candidate_email}</p>
                                            </div>

                                            {/* Job */}
                                            <div className="col-span-2">
                                                <p className="text-xs text-gray-600 truncate">{c.job_title}</p>
                                            </div>

                                            {/* Resume score */}
                                            <div className="col-span-2">
                                                <ScoreCell score={c.match_score} color="text-blue-600" />
                                                <ScoreBar score={c.match_score} color="bg-blue-400" />
                                            </div>

                                            {/* Interview score */}
                                            <div className="col-span-2">
                                                <ScoreCell score={c.interview_score} color="text-purple-600" />
                                                {c.interview_score && (
                                                    <ScoreBar score={c.interview_score} color="bg-purple-400" />
                                                )}
                                            </div>

                                            {/* Combined score */}
                                            <div className="col-span-1">
                                                {c.combined_score ? (
                                                    <span className={`text-sm font-bold ${c.combined_score >= 75 ? 'text-green-600' :
                                                        c.combined_score >= 50 ? 'text-yellow-600' : 'text-red-500'
                                                        }`}>
                                                        {c.combined_score}%
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-300 text-sm">—</span>
                                                )}
                                            </div>

                                            {/* AI verdict */}
                                            <div className="col-span-1">
                                                <RecommendationBadge recommendation={c.recommendation} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Legend */}
                        <div className="mt-4 flex items-center gap-6 text-xs text-gray-400">
                            <span>Click any row to view full candidate profile</span>
                            <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" /> Resume (40%)
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-purple-400 inline-block" /> Interview (60%)
                            </span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ScoringDashboard;