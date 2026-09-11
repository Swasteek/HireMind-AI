import { useState, useEffect } from 'react';
import { resumeApi, jobsApi } from '../../api/resume.api';
import ParsedResumeCard from '../../components/ParsedResumeCard';

const UploadResumePage = () => {
    const [jobs, setJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState('');
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);  // AI parse result
    const [error, setError] = useState('');
    const [step, setStep] = useState('idle'); // idle | uploading | parsing | done

    // Load available jobs when the page opens
    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const res = await jobsApi.getAll();
                setJobs(res.data.data.jobs);
            } catch {
                setError('Failed to load jobs. Make sure a recruiter has created some jobs first.');
            }
        };
        fetchJobs();
    }, []);

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected && selected.type !== 'application/pdf') {
            setError('Please select a PDF file');
            return;
        }
        setError('');
        setFile(selected);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const dropped = e.dataTransfer.files[0];
        if (dropped?.type === 'application/pdf') {
            setFile(dropped);
            setError('');
        } else {
            setError('Only PDF files are accepted');
        }
    };

    const handleSubmit = async () => {
        if (!file) { setError('Please select a PDF resume'); return; }
        if (!selectedJob) { setError('Please select a job to apply for'); return; }

        setError('');
        setLoading(true);
        setStep('uploading');

        try {
            // FormData is required for file uploads — JSON cannot carry binary data
            const formData = new FormData();
            formData.append('resume', file);      // field name must match upload.single('resume')
            formData.append('jobId', selectedJob);

            setStep('parsing'); // In reality both happen server-side; this is just UX feedback
            const res = await resumeApi.upload(formData);
            setResult(res.data.data);
            setStep('done');
        } catch (err) {
            setError(err.response?.data?.message || 'Upload failed. Please try again.');
            setStep('idle');
        } finally {
            setLoading(false);
        }
    };

    const stepMessages = {
        uploading: 'Uploading your resume...',
        parsing: 'AI is reading your resume and scoring it against the job...',
        done: 'Done!',
    };

    return (
        <div className="max-w-2xl mx-auto py-10 px-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Apply for a Job</h1>
            <p className="text-gray-500 text-sm mb-8">Upload your resume and our AI will parse it and score your match.</p>

            {/* Step 1: Select Job */}
            {/* Step 1: Select Job */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    1. Select a job to apply for
                </label>
                <select
                    value={selectedJob}
                    onChange={(e) => setSelectedJob(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">— Choose a job —</option>
                    {jobs.map((job) => (
                        <option key={job.id} value={job.id}>
                            {job.title}
                        </option>
                    ))}
                </select>

                {/* Job detail panel — shows when a job is selected */}
                {selectedJob && (() => {
                    const job = jobs.find(j => j.id === selectedJob);
                    if (!job) return null;
                    return (
                        <div className="mt-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                            <h3 className="font-semibold text-gray-900 text-sm mb-1">{job.title}</h3>
                            <p className="text-gray-600 text-sm leading-relaxed mb-3">{job.description}</p>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                                    Required Skills
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {job.required_skills.split(',').map((skill) => (
                                        <span
                                            key={skill.trim()}
                                            className="text-xs bg-white border border-blue-200 text-blue-700 px-2.5 py-1 rounded-md font-medium"
                                        >
                                            {skill.trim()}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })()}

                {jobs.length === 0 && (
                    <p className="text-xs text-amber-600 mt-1">No jobs available yet. A recruiter needs to post one first.</p>
                )}
            </div>

            {/* Step 2: Upload PDF */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    2. Upload your resume (PDF only, max 5MB)
                </label>

                {/* Drag and drop zone */}
                <div
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => document.getElementById('resume-input').click()}
                    className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                >
                    {file ? (
                        <div>
                            <p className="text-blue-700 font-medium text-sm">📄 {file.name}</p>
                            <p className="text-gray-400 text-xs mt-1">{(file.size / 1024).toFixed(0)} KB</p>
                        </div>
                    ) : (
                        <div>
                            <p className="text-gray-500 text-sm">Drag and drop your PDF here</p>
                            <p className="text-gray-400 text-xs mt-1">or click to browse</p>
                        </div>
                    )}
                </div>
                <input
                    id="resume-input"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                />
            </div>

            {/* Error */}
            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                </div>
            )}

            {/* Loading state */}
            {loading && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <p className="text-blue-700 text-sm font-medium">{stepMessages[step]}</p>
                    </div>
                </div>
            )}

            {/* Submit button */}
            {step !== 'done' && (
                <button
                    onClick={handleSubmit}
                    disabled={loading || !file || !selectedJob}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {loading ? 'Processing...' : 'Upload & Analyze Resume'}
                </button>
            )}

            {/* Results */}
            {result && step === 'done' && (
                <div className="mt-8">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-green-600 text-lg">✓</span>
                        <h2 className="text-lg font-semibold text-gray-900">Application submitted! Here's what AI found:</h2>
                    </div>
                    <ParsedResumeCard
                        parsedResume={result.parsedResume}
                        matchResult={result.matchResult}
                        resumeUrl={result.resumeUrl}
                    />
                    <button
                        onClick={() => { setStep('idle'); setResult(null); setFile(null); setSelectedJob(''); }}
                        className="mt-4 w-full py-2.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                        Apply to another job
                    </button>
                </div>
            )}
        </div>
    );
};

export default UploadResumePage;