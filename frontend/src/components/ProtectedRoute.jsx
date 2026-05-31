import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ProtectedRoute wraps any page that requires authentication.
// If not logged in → redirect to /login
// If wrong role → redirect to their own dashboard

const ProtectedRoute = ({ children, requiredRole }) => {
    const { user, loading } = useAuth();

    // While checking auth state, show nothing (avoid flash of wrong content)
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-500">Loading...</div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && user.role !== requiredRole) {
        // Candidate tries to access recruiter page → send them to their dashboard
        return <Navigate to={`/${user.role}/dashboard`} replace />;
    }

    return children;
};

export default ProtectedRoute;