import React from 'react';
import { Cloud, Sparkles, Leaf } from 'lucide-react';
import Card from '../Card';

export default function ProcessSection() {
  const steps = [
    {
      icon: Cloud,
      title: "1. Connect Storage",
      desc: "Securely link your Google Drive, Dropbox, or upload files directly for deep analysis.",
      color: "text-blue-500",
      bgColor: "bg-blue-50"
    },
    {
      icon: Sparkles,
      title: "2. AI Analysis",
      desc: "Our AI engine scans for duplicates, visually similar images, and unnecessary junk files.",
      color: "text-ai-accent",
      bgColor: "bg-ai-accent/10"
    },
    {
      icon: Leaf,
      title: "3. Optimize & Save",
      desc: "Review suggestions, clean up your storage, and see your immediate carbon footprint reduction.",
      color: "text-eco-primary",
      bgColor: "bg-eco-primary/10"
    }
  ];

  return (
    <section className="py-24 bg-eco-section">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-sm font-bold tracking-widest text-eco-primary uppercase mb-3">How UrbanByte Works</h2>
          <h3 className="text-3xl md:text-4xl font-bold text-eco-text">Streamlined Storage Management</h3>
          <p className="mt-4 text-eco-muted text-lg">
            A simple three-step process to a cleaner digital life and a healthier planet.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connecting line for desktop */}
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-blue-200 via-ai-accent/30 to-eco-primary/30 z-0"></div>

          {steps.map((step, i) => (
            <Card key={i} className="relative z-10 hover:-translate-y-1 transition-transform duration-300">
              <div className={`w-14 h-14 rounded-2xl ${step.bgColor} ${step.color} flex items-center justify-center mb-6`}>
                <step.icon size={28} />
              </div>
              <h4 className="text-xl font-bold text-eco-text mb-3">{step.title}</h4>
              <p className="text-eco-muted leading-relaxed">
                {step.desc}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
