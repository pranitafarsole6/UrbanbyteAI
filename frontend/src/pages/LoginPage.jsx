import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Card from '../components/Card';
import { LogIn, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        const result = await login(email, password);
        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.error || 'Invalid email or password');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-eco-bg flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-eco-primary/10 via-transparent to-transparent">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-xl shadow-eco-primary/10 mb-6 text-eco-primary">
                        <LogIn size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-eco-text">Welcome Back</h1>
                    <p className="text-eco-muted mt-2 text-lg">Sign in to continue your eco-journey</p>
                </div>

                <Card className="p-8 shadow-2xl shadow-eco-primary/5 backdrop-blur-sm bg-white/90">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100 animate-in fade-in slide-in-from-top-2">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-eco-text ml-1" htmlFor="email">Email Address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-eco-muted group-focus-within:text-eco-primary transition-colors">
                                    <Mail size={18} />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    className="w-full pl-11 pr-4 py-3 bg-eco-bg border border-eco-border rounded-xl focus:ring-2 focus:ring-eco-primary/50 focus:border-eco-primary outline-none transition-all placeholder:text-eco-muted/50"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-sm font-bold text-eco-text" htmlFor="password">Password</label>
                                <a href="#" className="text-xs font-semibold text-eco-primary hover:underline">Forgot password?</a>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-eco-muted group-focus-within:text-eco-primary transition-colors">
                                    <Lock size={18} />
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    required
                                    className="w-full pl-11 pr-4 py-3 bg-eco-bg border border-eco-border rounded-xl focus:ring-2 focus:ring-eco-primary/50 focus:border-eco-primary outline-none transition-all placeholder:text-eco-muted/50"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full justify-center h-12 text-lg font-bold shadow-lg shadow-eco-primary/20"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="animate-spin mr-2" size={20} />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign In <ArrowRight className="ml-2" size={20} />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-eco-muted text-sm">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-eco-primary font-bold hover:underline">Create one for free</Link>
                        </p>
                    </div>
                </Card>

                <div className="mt-12 text-center text-xs text-eco-muted/60">
                    &copy; 2026 UrbanByte AI. Reducing digital footprints together.
                </div>
            </div>
        </div>
    );
}
