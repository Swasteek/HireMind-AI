import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CandidateDashboard from './pages/candidate/DashboardPage';
import UploadResumePage from './pages/candidate/UploadResumePage';

// Recruiter dashboard placeholder — Day 3
const RecruiterDashboard = () => (
    <div className="min-h-screen bg-gray-50 p-8">
        <h1 className="text-2xl font-bold text-gray-900">Recruiter Dashboard</h1>
        <p className="text-gray-500 mt-2">Day 3: Job management and candidate ranking coming here.</p>
    </div>
);

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Public */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    {/* Candidate */}
                    <Route
                        path="/candidate/dashboard"
                        element={
                            <ProtectedRoute requiredRole="candidate">
                                <CandidateDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/candidate/upload"
                        element={
                            <ProtectedRoute requiredRole="candidate">
                                <UploadResumePage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Recruiter */}
                    <Route
                        path="/recruiter/dashboard"
                        element={
                            <ProtectedRoute requiredRole="recruiter">
                                <RecruiterDashboard />
                            </ProtectedRoute>
                        }
                    />

                    <Route path="/" element={<Navigate to="/login" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;