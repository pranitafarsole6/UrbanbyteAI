import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../Button';
import { ArrowRight } from 'lucide-react';

export default function CTASection() {
    return (
        <section className="bg-eco-text text-white py-24 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-eco-primary/20 to-ai-accent/20 opacity-50"></div>

            <div className="max-w-4xl mx-auto px-6 relative z-10">
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                    Ready to clear your digital footprint?
                </h2>
                <p className="text-gray-300 text-lg mb-10 max-w-2xl mx-auto">
                    Join thousands of users optimizing their storage and reducing unnecessary carbon emissions with UrbanByte AI.
                </p>

                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Link to="/sources">
                        <Button variant="primary" size="lg" className="w-full sm:w-auto" icon={ArrowRight}>
                            Start Cleaning Free
                        </Button>
                    </Link>
                    <Button variant="outline" size="lg" className="w-full sm:w-auto mt-4 sm:mt-0 text-white border-gray-600 hover:bg-gray-800 focus:ring-gray-600">
                        View Live Demo
                    </Button>
                </div>
            </div>
        </section>
    );
}
