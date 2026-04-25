import React from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/Card';
import Button from '../components/Button';
import { HardDrive, Cloud, FileUp, FolderUp } from 'lucide-react';

export default function SourcesPage() {
  const sources = [
    {
      id: 'google-drive',
      name: 'Google Drive',
      description: 'Connect securely to scan your Google Drive for digital waste.',
      icon: Cloud,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      actionText: 'Connect Drive',
      link: '/scanner'
    },
    {
      id: 'dropbox',
      name: 'Dropbox',
      description: 'Analyze your Dropbox files to find duplicates and optimize space.',
      icon: HardDrive,
      color: 'text-ai-accent',
      bgColor: 'bg-ai-accent/10',
      actionText: 'Connect Dropbox',
      link: '/scanner'
    },
    {
      id: 'upload-files',
      name: 'Upload Files',
      description: 'Select specific files from your device for a quick AI analysis.',
      icon: FileUp,
      color: 'text-eco-primary',
      bgColor: 'bg-eco-primary/10',
      actionText: 'Select Files',
      link: '/scanner'
    },
    {
      id: 'upload-folder',
      name: 'Upload Folder',
      description: 'Scan an entire local folder to detect bulk duplicates and junk.',
      icon: FolderUp,
      color: 'text-eco-warning',
      bgColor: 'bg-eco-warning/10',
      actionText: 'Select Folder',
      link: '/scanner'
    }
  ];

  return (
    <DashboardLayout title="Select File Source">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-eco-text">Choose a Source</h1>
          <p className="text-eco-muted mt-2 text-lg">
            Select how you want to scan your storage. Files are analyzed temporarily and not stored permanently.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {sources.map((source) => (
            <Card key={source.id} className="flex flex-col h-full hover:border-eco-primary/50 transition-colors">
              <div className="flex items-start gap-4 mb-4 flex-1">
                <div className={`p-3 rounded-xl ${source.bgColor} ${source.color}`}>
                  <source.icon size={28} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-eco-text">{source.name}</h3>
                  <p className="text-eco-muted text-sm mt-1 leading-relaxed">
                    {source.description}
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-eco-border">
                <Link to={source.link} className="block w-full">
                  <Button variant="outline" className="w-full justify-center">
                    {source.actionText}
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center text-sm text-eco-muted/70 flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-eco-primary"></span>
          UrbanByte AI uses carbon-neutral infrastructure. No user authentication required.
        </div>
      </div>
    </DashboardLayout>
  );
}
