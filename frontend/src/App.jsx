import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Placeholder dashboards — will be built Day 2 onwards
const CandidateDashboard = () => (
    <div className="min-h-screen bg-gray-50 p-8">
        <h1 className="text-2xl font-bold text-gray-900">Candidate Dashboard</h1>
        <p className="text-gray-500 mt-2">Day 2: Resume upload coming here.</p>
    </div>
);

const RecruiterDashboard = () => (
    <div className="min-h-screen bg-gray-50 p-8">
        <h1 className="text-2xl font-bold text-gray-900">Recruiter Dashboard</h1>
        <p className="text-gray-500 mt-2">Day 3: Job management coming here.</p>
    </div>
);

function App() {
    return (
        // AuthProvider wraps everything — any component can call useAuth()
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Public routes */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    {/* Protected: candidate only */}
                    <Route
                        path="/candidate/dashboard"
                        element={
                            <ProtectedRoute requiredRole="candidate">
                                <CandidateDashboard />
                            </ProtectedRoute>
                        }
                    />

                    {/* Protected: recruiter only */}
                    <Route
                        path="/recruiter/dashboard"
                        element={
                            <ProtectedRoute requiredRole="recruiter">
                                <RecruiterDashboard />
                            </ProtectedRoute>
                        }
                    />

                    {/* Default redirect */}
                    <Route path="/" element={<Navigate to="/login" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;