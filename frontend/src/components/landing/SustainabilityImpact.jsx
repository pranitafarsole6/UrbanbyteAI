import React from 'react';
import { Trees, Zap, HardDrive, Globe2 } from 'lucide-react';
import Card from '../Card';

export default function SustainabilityImpact() {
  const stats = [
    { label: "Storage Cleaned", value: "8.4 PB", icon: HardDrive },
    { label: "Energy Saved (kWh)", value: "12M+", icon: Zap },
    { label: "Trees Equivalent", value: "450k", icon: Trees },
    { label: "Countries Reached", value: "140+", icon: Globe2 },
  ];

  return (
    <section className="py-24 bg-white border-t border-eco-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row gap-12 items-center mb-16">
          <div className="flex-1">
            <h2 className="text-3xl md:text-4xl font-bold text-eco-text mb-4">
              Real-World Sustainability Impact
            </h2>
            <p className="text-eco-muted text-lg max-w-xl">
              Every gigabyte of unnecessary data requires energy to store and cool. By optimizing your digital storage, you directly contribute to reducing the internet's carbon footprint.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <Card key={i} className="text-center group hover:border-eco-primary transition-colors duration-300">
              <div className="inline-flex w-12 h-12 rounded-full bg-eco-primary/10 text-eco-primary items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <s.icon size={24} />
              </div>
              <p className="text-3xl md:text-4xl font-extrabold text-eco-text mb-2">
                {s.value}
              </p>
              <p className="text-eco-muted font-medium text-sm">
                {s.label}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
