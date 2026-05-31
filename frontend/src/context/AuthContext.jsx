import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/auth.api';

// WHY Context?
// We need user info (name, role, token) available in EVERY component.
// Passing it as props through every component would be messy (prop drilling).
// Context = a global store that any component can read.

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('hiremind_token'));
    const [loading, setLoading] = useState(true);

    // On app load: if a token exists in localStorage, fetch user info
    // This keeps the user "logged in" across page refreshes
    useEffect(() => {
        const initAuth = async () => {
            const storedToken = localStorage.getItem('hiremind_token');
            if (storedToken) {
                try {
                    const res = await authApi.getMe();
                    setUser(res.data.data.user);
                } catch {
                    // Token is invalid/expired — clear it
                    localStorage.removeItem('hiremind_token');
                    localStorage.removeItem('hiremind_user');
                    setToken(null);
                }
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const login = async (credentials) => {
        const res = await authApi.login(credentials);
        const { user, token } = res.data.data;

        localStorage.setItem('hiremind_token', token);
        localStorage.setItem('hiremind_user', JSON.stringify(user));
        setUser(user);
        setToken(token);

        return user; // Return user so caller knows the role (for redirect)
    };

    const register = async (userData) => {
        const res = await authApi.register(userData);
        const { user, token } = res.data.data;

        localStorage.setItem('hiremind_token', token);
        setUser(user);
        setToken(token);

        return user;
    };

    const logout = () => {
        localStorage.removeItem('hiremind_token');
        localStorage.removeItem('hiremind_user');
        setUser(null);
        setToken(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook — components call useAuth() instead of useContext(AuthContext)
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used inside AuthProvider');
    return context;
};