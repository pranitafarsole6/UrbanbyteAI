import { Link } from "react-router-dom";
import { LayoutDashboard, Database, Cloud, Shield, Settings } from "lucide-react";

const Sidebar = () => {
  return (
    <div className="w-64 bg-white border-r h-screen flex flex-col">

      {/* Logo */}
      <Link to="/"><div className="p-6 border-b">
        <h1 className="text-xl font-bold text-green-600">
          UrbanByte AI
        </h1>
        <p className="text-xs text-gray-400">Premium Manager</p>
      </div></Link>
      

      {/* Navigation */}
      <nav className="flex flex-col p-4 gap-3">

        <Link to="/dashboard" className="flex items-center gap-3 p-2 rounded hover:bg-gray-100">
          <LayoutDashboard size={18} />
          Dashboard
        </Link>

        <Link to="/storage-insights" className="flex items-center gap-3 p-2 rounded hover:bg-gray-100">
          <Database size={18} />
          Storage Insights
        </Link>

        <Link to="/cloud-sync" className="flex items-center gap-3 p-2 rounded hover:bg-gray-100">
          <Cloud size={18} />
          Cloud Sync
        </Link>

        <Link to="/security" className="flex items-center gap-3 p-2 rounded hover:bg-gray-100">
          <Shield size={18} />
          Security
        </Link>

        <Link to="/settings" className="flex items-center gap-3 p-2 rounded hover:bg-gray-100">
          <Settings size={18} />
          Settings
        </Link>

      </nav>

      {/* Storage Usage */}
      <div className="mt-auto p-4 border-t">
        <p className="text-xs text-gray-500 mb-2">Storage Usage</p>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-green-500 h-2 rounded-full w-2/3"></div>
        </div>

        <p className="text-xs text-gray-500 mt-2">
          72.4 GB of 100 GB used
        </p>
      </div>

    </div>
  );
};

export default Sidebar;
