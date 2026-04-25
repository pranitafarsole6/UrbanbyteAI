import React from 'react';
import { Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="bg-eco-bg py-12 border-t border-eco-border">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
                <div className="flex items-center gap-2 font-semibold text-eco-text mb-4 md:mb-0">
                    <Leaf className="text-eco-primary" size={20} />
                    UrbanByte AI
                </div>

                <div className="flex gap-6 text-sm text-eco-muted mb-4 md:mb-0">
                    <Link to="/privacy" className="hover:text-eco-primary transition-colors">Privacy Policy</Link>
                    <Link to="/terms" className="hover:text-eco-primary transition-colors">Terms of Service</Link>
                    <Link to="/contact" className="hover:text-eco-primary transition-colors">Contact</Link>
                </div>

                <p className="text-sm text-eco-muted">
                    © 2026 UrbanByte AI. All rights reserved.
                </p>
            </div>
        </footer>
    );
}
