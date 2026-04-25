import { Shield, Lock, FileText } from "lucide-react";

export default function Security() {
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Privacy Control Center
      </h1>

      {/* Section: Security & Privacy */}
      <div className="bg-white shadow-md rounded-lg p-6 space-y-6">
        <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          Security & Privacy
        </h2>
        <p className="text-gray-600">
          Manage your data safety, monitor access logs, and configure transparency settings for your UrbanByte AI workspace.
        </p>

        {/* Encryption Status */}
        <div className="border rounded-lg p-4 flex items-start gap-4 bg-blue-50">
          <Lock className="w-6 h-6 text-blue-600 mt-1" />
          <div>
            <h3 className="font-semibold text-gray-800">AES-256 Bit Encryption Active</h3>
            <span className="inline-block bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-full mt-1">
              LIVE
            </span>
            <p className="text-gray-600 mt-2">
              Your data is currently protected with industry-leading encryption standards. All communication between your device and our servers is tunneled through TLS 1.3.
            </p>
            <ul className="list-disc list-inside text-gray-600 mt-2">
              <li>End-to-end Encrypted</li>
              <li>Zero-Knowledge Protocol</li>
            </ul>
          </div>
        </div>

        {/* File Privacy */}
        <div className="border rounded-lg p-4 flex items-start gap-4 bg-gray-50">
          <FileText className="w-6 h-6 text-purple-600 mt-1" />
          <div>
            <h3 className="font-semibold text-gray-800">File Privacy</h3>
            <p className="text-gray-600 mt-2">
              Files uploaded for AI analysis are held in RAM and deleted permanently after 15 minutes of inactivity.
            </p>
            <div className="flex items-center mt-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-purple-600 transition"></div>
                <span className="ml-3 text-sm text-gray-700">Temporary Mode</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
