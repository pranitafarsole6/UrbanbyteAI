import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  HardDrive,
  BarChart3,
  Leaf,
  LogOut,
  Settings,
  Activity,
  Trophy,
  Trash2
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'New Scan', path: '/scanner', icon: Search },
    { name: 'Drive Scanner', path: '/sources', icon: HardDrive },
    { name: 'Storage Insights', path: '/insights', icon: BarChart3 },
    { name: 'AI Analytics', path: '/analytics', icon: Activity },
    { name: 'Sustainability', path: '/sustainability', icon: Leaf },
    { name: 'Achievements', path: '/milestones', icon: Trophy },
    { name: 'Trash Bin', path: '/trash', icon: Trash2 }, // Added Trash Bin item
  ];

  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  return (
    <div className="w-64 bg-white border-r border-slate-200/60 h-full flex flex-col min-h-screen">
      <div className="p-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-eco-primary rounded-lg flex items-center justify-center">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-eco-text">UrbanByte AI</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive(item.path)
              ? 'bg-eco-primary text-white shadow-md shadow-eco-primary/20'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
          >
            <item.icon className={`w-5 h-5 ${isActive(item.path) ? 'text-white' : 'text-slate-400'}`} />
            {item.name}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-200/60 space-y-1">
        {user && (
          <div className="px-3 py-4 mb-2 bg-slate-50 rounded-2xl border border-slate-200/60">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-eco-primary/20 flex items-center justify-center text-eco-primary font-bold text-xs">
                {user.full_name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-eco-text truncate">{user.full_name || 'User'}</p>
                <p className="text-[10px] text-eco-primary font-medium">{user.points || 0} Eco Points</p>
              </div>
            </div>
            <div className="w-full bg-eco-bg h-1.5 rounded-full overflow-hidden">
               <div className="bg-eco-primary h-full rounded-full" style={{ width: `${user.eco_score || 0}%` }}></div>
            </div>
          </div>
        )}
        <Link
          to="/settings"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium w-full transition-all duration-200 ${isActive('/settings') ? 'bg-eco-primary text-white shadow-md shadow-eco-primary/20' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
        >
          <Settings className={`w-5 h-5 ${isActive('/settings') ? 'text-white' : 'text-slate-400'}`} />
          Settings
        </Link>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-700 w-full transition-all duration-200"
        >
          <LogOut className="w-5 h-5 text-slate-400 group-hover:text-red-600" />
          Log out
        </button>
      </div>
    </div>
  );
}
