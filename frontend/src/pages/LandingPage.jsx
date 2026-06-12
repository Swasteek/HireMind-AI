import { Link } from 'react-router-dom';

const FeatureCard = ({ icon, title, description }) => (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="text-3xl mb-4">{icon}</div>
        <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
    </div>
);

const Step = ({ number, title, description, role }) => (
    <div className="flex gap-4">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5 ${role === 'candidate' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
            }`}>
            {number}
        </div>
        <div>
            <h4 className="font-medium text-gray-900 text-sm">{title}</h4>
            <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{description}</p>
        </div>
    </div>
);

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-gray-50">

            {/* Navbar */}
            <nav className="bg-white border-b border-gray-100 px-6 py-4">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-1">
                        <span className="text-xl font-bold text-gray-900">HireMind</span>
                        <span className="text-xl font-bold text-blue-600">AI</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link to="/login" className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors">
                            Sign in
                        </Link>
                        <Link to="/register" className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                            Get started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="max-w-5xl mx-auto px-6 py-20 text-center">
                <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 mb-6">
                    <span className="text-blue-600 text-xs font-semibold">Powered by Groq + Llama 3.3-70b</span>
                </div>
                <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
                    Hire smarter with{' '}
                    <span className="text-blue-600">AI-powered</span>{' '}
                    candidate evaluation
                </h1>
                <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
                    Upload resumes, get instant AI scoring, generate tailored interview questions,
                    and receive detailed hiring recommendations — all in minutes.
                </p>
                <div className="flex items-center justify-center gap-4">
                    <Link to="/register" className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
                        Start for free →
                    </Link>
                    <Link to="/login" className="px-6 py-3 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
                        Sign in
                    </Link>
                </div>
            </section>

            {/* Features */}
            <section className="max-w-5xl mx-auto px-6 pb-20">
                <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">Everything you need to hire better</h2>
                <p className="text-gray-500 text-center mb-12 text-sm">From resume upload to hiring decision — AI handles the heavy lifting.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FeatureCard icon="📄" title="AI Resume Parsing"
                        description="Upload any PDF resume. Our AI extracts skills, experience, and education into structured data instantly." />
                    <FeatureCard icon="🎯" title="Smart Match Scoring"
                        description="Each resume is scored 0-100 against the job description. See matched skills, missing skills, and reasoning." />
                    <FeatureCard icon="💬" title="Tailored Interview Questions"
                        description="AI generates 5 role-specific questions — 3 technical, 2 behavioral — based on the candidate's actual background." />
                    <FeatureCard icon="📊" title="Answer Evaluation"
                        description="Candidates submit answers. AI scores each response and provides detailed per-question feedback." />
                    <FeatureCard icon="🏆" title="Candidate Ranking"
                        description="All applicants are automatically ranked by match score. Recruiters see the best fits first." />
                    <FeatureCard icon="✅" title="Hire Recommendation"
                        description="AI gives a final verdict: Hire, Maybe, or Reject — with a full explanation recruiters can trust." />
                </div>
            </section>

            {/* How it works */}
            <section className="bg-white border-t border-gray-100 py-20">
                <div className="max-w-4xl mx-auto px-6">
                    <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">How it works</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full mb-6">
                                <span className="text-blue-700 text-xs font-semibold">For Candidates</span>
                            </div>
                            <div className="space-y-5">
                                <Step number="1" role="candidate" title="Create an account" description="Register as a candidate in seconds. No credit card required." />
                                <Step number="2" role="candidate" title="Upload your resume" description="Upload a PDF resume and select the job you're applying for." />
                                <Step number="3" role="candidate" title="Get your match score" description="AI instantly scores your resume against the job requirements." />
                                <Step number="4" role="candidate" title="Complete the interview" description="Answer 5 AI-generated questions tailored to your background and the role." />
                                <Step number="5" role="candidate" title="Receive feedback" description="Get detailed AI feedback on every answer with areas to improve." />
                            </div>
                        </div>
                        <div>
                            <div className="inline-flex items-center gap-2 bg-purple-50 px-3 py-1 rounded-full mb-6">
                                <span className="text-purple-700 text-xs font-semibold">For Recruiters</span>
                            </div>
                            <div className="space-y-5">
                                <Step number="1" role="recruiter" title="Post a job" description="Add job title, description, and required skills. Takes under 2 minutes." />
                                <Step number="2" role="recruiter" title="Review ranked candidates" description="All applicants are ranked by AI match score. Best fits appear first." />
                                <Step number="3" role="recruiter" title="Generate interviews" description="One click generates a personalized interview for any candidate." />
                                <Step number="4" role="recruiter" title="Read AI evaluations" description="See per-answer scores, strengths, weaknesses, and a hire recommendation." />
                                <Step number="5" role="recruiter" title="Make the decision" description="Update candidate status and move the best talent through your pipeline." />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="max-w-5xl mx-auto px-6 py-20 text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to hire smarter?</h2>
                <p className="text-gray-500 mb-8">Join as a candidate or recruiter and experience AI-powered hiring today.</p>
                <Link to="/register" className="inline-block px-8 py-3.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
                    Get started for free →
                </Link>
            </section>

            {/* Footer */}
            <footer className="border-t border-gray-100 bg-white py-8 px-6">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <p className="text-sm text-gray-400">© 2025 HireMind AI. Built with React, Node.js, PostgreSQL, and Groq.</p>
                    <div className="flex items-center gap-4">
                        <Link to="/login" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">Login</Link>
                        <Link to="/register" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">Register</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;