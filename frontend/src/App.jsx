import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Public
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Candidate
import CandidateDashboard from './pages/candidate/DashboardPage';
import UploadResumePage from './pages/candidate/UploadResumePage';
import InterviewPage from './pages/candidate/InterviewPage';

// Recruiter
import RecruiterDashboard from './pages/recruiter/DashboardPage';
import CandidatesPage from './pages/recruiter/CandidatesPage';
import CandidateDetailPage from './pages/recruiter/CandidateDetailPage';
import InterviewResultPage from './pages/recruiter/InterviewResultPage';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Public — landing page is now the root */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    {/* Candidate */}
                    <Route path="/candidate/dashboard" element={
                        <ProtectedRoute requiredRole="candidate"><CandidateDashboard /></ProtectedRoute>
                    } />
                    <Route path="/candidate/upload" element={
                        <ProtectedRoute requiredRole="candidate"><UploadResumePage /></ProtectedRoute>
                    } />
                    <Route path="/candidate/interviews" element={
                        <ProtectedRoute requiredRole="candidate"><InterviewPage /></ProtectedRoute>
                    } />

                    {/* Recruiter */}
                    <Route path="/recruiter/dashboard" element={
                        <ProtectedRoute requiredRole="recruiter"><RecruiterDashboard /></ProtectedRoute>
                    } />
                    <Route path="/recruiter/jobs/:jobId/candidates" element={
                        <ProtectedRoute requiredRole="recruiter"><CandidatesPage /></ProtectedRoute>
                    } />
                    <Route path="/recruiter/applications/:applicationId" element={
                        <ProtectedRoute requiredRole="recruiter"><CandidateDetailPage /></ProtectedRoute>
                    } />
                    <Route path="/recruiter/interviews/:applicationId/result" element={
                        <ProtectedRoute requiredRole="recruiter"><InterviewResultPage /></ProtectedRoute>
                    } />

                    {/* Catch-all */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;