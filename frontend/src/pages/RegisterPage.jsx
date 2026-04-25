import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Card from '../components/Card';
import { UserPlus, Mail, Lock, User, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: ''
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        
        const result = await register(formData.email, formData.password, formData.fullName);
        if (result.success) {
            navigate('/login');
        } else {
            setError(result.error || 'Failed to register account');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-eco-bg flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-eco-primary/10 via-transparent to-transparent">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-xl shadow-eco-primary/10 mb-6 text-eco-primary">
                        <UserPlus size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-eco-text">Join UrbanByte</h1>
                    <p className="text-eco-muted mt-2 text-lg">Start measuring your digital carbon footprint</p>
                </div>

                <Card className="p-8 shadow-2xl shadow-eco-primary/5 backdrop-blur-sm bg-white/90">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-eco-text ml-1" htmlFor="fullName">Full Name</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-eco-muted group-focus-within:text-eco-primary transition-colors">
                                    <User size={18} />
                                </div>
                                <input
                                    id="fullName"
                                    type="text"
                                    required
                                    className="w-full pl-11 pr-4 py-3 bg-eco-bg border border-eco-border rounded-xl focus:ring-2 focus:ring-eco-primary/50 focus:border-eco-primary outline-none transition-all placeholder:text-eco-muted/50"
                                    placeholder="Alex Johnson"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

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
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-eco-text ml-1" htmlFor="password">Password</label>
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
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 bg-eco-section/50 rounded-xl border border-eco-border">
                            <ShieldCheck className="text-eco-primary shrink-0" size={18} />
                            <p className="text-[10px] text-eco-muted leading-tight">
                                By signing up, you agree to our <a href="#" className="font-bold underline">Terms of Service</a> and <a href="#" className="font-bold underline">Privacy Policy</a>. We never store your scanned files.
                            </p>
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
                                    Creating account...
                                </>
                            ) : (
                                <>
                                    Create Account <ArrowRight className="ml-2" size={20} />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="mt-8 text-center border-t border-eco-border pt-6">
                        <p className="text-eco-muted text-sm">
                            Already have an account?{' '}
                            <Link to="/login" className="text-eco-primary font-bold hover:underline">Sign in here</Link>
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    );
}
