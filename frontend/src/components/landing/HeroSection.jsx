import React from 'react';
import { HardDrive, Cloud, FileText, UploadCloud } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../Button';

export default function HeroSection() {
  return (
    <section className="bg-white py-24 relative overflow-hidden">
      {/* Decorative background gradients */}
      <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 rounded-full bg-eco-primary/5 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 rounded-full bg-ai-accent/5 blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center relative z-10">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-eco-primary/10 border border-eco-primary/20 text-eco-primary text-sm font-semibold mb-8 tracking-wide">
            <span className="w-2 h-2 rounded-full bg-eco-primary animate-pulse"></span>
            AI-Powered Storage Optimization
          </div>

          <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight text-eco-text leading-[1.15]">
            Clean Your Digital Storage.<br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-eco-primary to-emerald-600">
              Reduce Your Carbon Footprint.
            </span>
          </h1>

          <p className="text-eco-muted text-lg mt-6 leading-relaxed max-w-lg">
            UrbanByte AI analyzes your files to detect digital waste, visually similar images, and junk downloads, providing AI-powered insights to optimize your storage.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-10">
            <Link to="/sources">
              <Button variant="primary" size="lg" icon={Cloud} className="w-full sm:w-auto">
                Connect Drive
              </Button>
            </Link>
            <Link to="/sources">
              <Button variant="outline" size="lg" icon={UploadCloud} className="w-full sm:w-auto">
                Upload Files
              </Button>
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-eco-primary to-ai-accent rounded-2xl blur opacity-20"></div>
          <div className="bg-white border border-eco-border shadow-2xl rounded-2xl p-8 relative flex flex-col">
            <div className="flex justify-between items-center mb-8 pb-6 border-b border-eco-border">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-eco-section rounded-xl text-eco-primary">
                  <HardDrive size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-eco-text">Storage Analysis</h3>
                  <p className="text-xs text-eco-muted">Scanning for digital waste...</p>
                </div>
              </div>
              <span className="bg-ai-accent/10 text-ai-accent text-xs font-bold px-2.5 py-1 rounded-full">AI Active</span>
            </div>

            <div className="space-y-6">
              {[
                { label: 'Duplicates Detected', value: '4.2 GB', color: 'bg-eco-warning', width: 'w-[45%]' },
                { label: 'Similar Images', value: '1.8 GB', color: 'bg-ai-accent', width: 'w-[25%]' },
                { label: 'Junk Files', value: '2.5 GB', color: 'bg-eco-critical', width: 'w-[30%]' },
              ].map((stat, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-eco-text">{stat.label}</span>
                    <span className="text-eco-muted">{stat.value}</span>
                  </div>
                  <div className="w-full bg-eco-section h-2.5 rounded-full overflow-hidden">
                    <div className={`${stat.color} h-full rounded-full transition-all duration-1000 ${stat.width}`}></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-eco-border bg-eco-primary/5 -mx-8 -mb-8 p-8 rounded-b-2xl flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-eco-primary">
                <FileText size={20} />
              </div>
              <div>
                <p className="text-sm text-eco-muted mb-1">Potential Impact</p>
                <p className="font-bold text-eco-text">8.5 GB <span className="text-eco-primary font-normal text-sm">≈ 1.2kg CO2 saved</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
