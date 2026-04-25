import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import { useLocation } from 'react-router-dom';
import { Pencil, Cloud, HardDrive, Plus } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';

export default function Settings() {
  const { user, fetchWithAuth } = useAuth();
  const [autoScan, setAutoScan] = useState(true);
  const [freq, setFreq] = useState('Weekly Digest');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetchWithAuth(`${API_BASE_URL}/api/auth/profile`);
        if (response.ok) {
            const data = await response.json();
            setProfile(data);
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [fetchWithAuth]);

  const userData = profile || user || {};

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-eco-text">Account Settings</h1>
        <p className="text-sm text-eco-muted mt-1">Manage your profile, integrations, and preferences.</p>
      </div>

      {/* Profile Card */}
      <Card className="p-0 overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start sm:items-center flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-eco-primary/20 border-2 border-white shadow-sm flex items-center justify-center text-xl font-bold text-eco-primary">
                  {userData.full_name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <button className="absolute bottom-0 right-0 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm text-gray-500 hover:text-eco-primary transition-colors">
                  <Pencil size={12} />
                </button>
              </div>
              <div>
                <h3 className="text-xl font-bold text-eco-text">{userData.full_name || 'Eco Warrior'}</h3>
                <p className="text-sm text-eco-muted mt-0.5">{userData.email || 'user@example.com'} • Joined Just Now</p>
              </div>
            </div>
            <Button variant="outline" className="text-eco-primary border-eco-primary/20 bg-eco-primary/5 hover:bg-eco-primary/10 font-semibold px-4">
              Edit Profile
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mt-8 pt-6 border-t border-eco-border">
            <div className="p-4 rounded-xl bg-gray-50 border border-eco-border flex justify-between items-center">
              <div>
                <p className="text-[10px] font-bold text-eco-muted uppercase tracking-wider mb-1">Eco Points</p>
                <p className="font-bold text-eco-primary text-lg">{userData.points || 0} Points</p>
              </div>
              <span className="text-[10px] font-bold bg-eco-primary/20 text-eco-primary px-2 py-0.5 rounded-full uppercase tracking-widest">Level 1</span>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 border border-eco-border">
              <p className="text-[10px] font-bold text-eco-muted uppercase tracking-wider mb-1">Eco Score</p>
              <div className="flex items-center gap-3">
                <p className="font-bold text-eco-text text-lg">{userData.eco_score || 0}/100</p>
                <div className="flex-1 max-w-[100px] h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="bg-eco-primary h-full transition-all" style={{ width: `${userData.eco_score || 0}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Connected Sources */}
      <Card>
        <div className="mb-6">
          <h3 className="text-lg font-bold text-eco-text">Connected Sources</h3>
          <p className="text-sm text-eco-muted mt-1">Manage where UrbanByte AI scans for digital waste.</p>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-eco-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg border border-gray-100 flex items-center justify-center shrink-0">
                <Cloud size={20} className="text-blue-500" />
              </div>
              <div>
                <h4 className="font-semibold text-eco-text text-sm">Google Drive</h4>
                <p className="text-xs text-eco-muted mt-0.5">Last scan: 2 hours ago</p>
              </div>
            </div>
            <button className="text-sm font-semibold text-eco-muted hover:text-eco-text transition-colors">
              Disconnect
            </button>
          </div>

          <div className="p-4 rounded-xl border border-eco-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg border border-gray-100 flex items-center justify-center shrink-0">
                <HardDrive size={20} className="text-indigo-500" />
              </div>
              <div>
                <h4 className="font-semibold text-eco-text text-sm">Dropbox</h4>
                <p className="text-xs text-eco-muted mt-0.5">Syncing active</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" className="bg-gray-50 text-eco-text border-eco-border">Manage</Button>
              <button className="text-sm font-semibold text-eco-muted hover:text-eco-text transition-colors">
                Disconnect
              </button>
            </div>
          </div>

          <button className="w-full p-4 rounded-xl border border-dashed border-gray-300 text-eco-muted hover:border-gray-400 hover:text-eco-text flex items-center justify-center gap-2 transition-colors font-medium text-sm mt-2">
            <Plus size={16} className="text-gray-400" />
            Add New Integration
          </button>
        </div>
      </Card>

      {/* Preferences */}
      <Card>
        <div className="mb-6">
          <h3 className="text-lg font-bold text-eco-text">Preferences</h3>
          <p className="text-sm text-eco-muted mt-1">Customize how UrbanByte AI works for you.</p>
        </div>

        <div className="space-y-8">
          <div className="flex justify-between items-start gap-4">
            <div>
              <h4 className="font-bold text-eco-text text-sm">Auto-Scanning</h4>
              <p className="text-sm text-eco-muted mt-1 block">Automatically scan cloud storage once per week</p>
            </div>
            <button
              onClick={() => setAutoScan(!autoScan)}
              className={`w-11 h-6 rounded-full transition-colors relative flex items-center ${autoScan ? 'bg-eco-primary' : 'bg-gray-300'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white absolute transition-transform ${autoScan ? 'translate-x-[22px]' : 'translate-x-1'}`}></div>
            </button>
          </div>

          <div>
            <h4 className="font-bold text-eco-text text-sm mb-3">Notification Frequency</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {['Weekly Digest', 'Monthly Digest', 'Real-time'].map(option => (
                <button
                  key={option}
                  onClick={() => setFreq(option)}
                  className={`p-3 rounded-lg border text-sm font-medium transition-colors ${freq === option
                      ? 'border-eco-primary bg-eco-primary/5 text-eco-text'
                      : 'border-eco-border text-eco-muted hover:border-gray-300'
                    }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-eco-border flex justify-end items-center gap-6">
          <button className="text-sm font-semibold text-eco-muted hover:text-eco-text transition-colors">
            Reset
          </button>
          <Button variant="primary">
            Save Changes
          </Button>
        </div>
      </Card>
    </div>
  );
}
