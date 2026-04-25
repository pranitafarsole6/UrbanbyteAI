import React from 'react';
import { Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../Button';

export default function Navbar() {
  return (
    <nav className="w-full bg-white/80 backdrop-blur-md border-b border-eco-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-eco-primary rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-eco-text">UrbanByte AI</span>
        </Link>

        <div className="hidden md:flex gap-8 text-sm font-medium text-eco-muted">
          <Link to="/features" className="hover:text-eco-primary transition-colors">Features</Link>
          <Link to="/pricing" className="hover:text-eco-primary transition-colors">Pricing</Link>
          <Link to="/about" className="hover:text-eco-primary transition-colors">About</Link>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/sources">
            <Button variant="primary">Get Started</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
