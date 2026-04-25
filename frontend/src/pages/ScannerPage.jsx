import React, { useState } from 'react';
import { UploadCloud, File, AlertCircle, X, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/Card';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

export default function ScannerPage() {
    const [isDragging, setIsDragging] = useState(false);
    const [files, setFiles] = useState([]);
    const [isScanning, setIsScanning] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);
    const [scanStatus, setScanStatus] = useState('');
    const [folderPath, setFolderPath] = useState('');
    const { user, fetchWithAuth } = useAuth();
    const [isDriveConnected, setIsDriveConnected] = useState(user?.google_drive_connected || false);
    const [driveFiles, setDriveFiles] = useState([]);
    const [showingDriveFiles, setShowingDriveFiles] = useState(false);

    // Auto-fetch if user is already connected
    React.useEffect(() => {
        if (user?.google_drive_connected && !isDriveConnected) {
            setIsDriveConnected(true);
        }
    }, [user]);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        const droppedFiles = Array.from(e.dataTransfer?.files || []);
        if (droppedFiles.length > 0) {
            setFiles([...files, ...droppedFiles]);
        }
    };

    const removeFile = (index) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    const handleFileSelect = (e) => {
        const selected = Array.from(e.target.files || []);
        setFiles([...files, ...selected]);
    };

    const pollScanStatus = (jobId) => {
        const interval = setInterval(async () => {
            try {
                const statusRes = await fetchWithAuth(`${API_BASE_URL}/api/scan/status/${jobId}`);
                const statusData = await statusRes.json();
                
                setScanProgress(statusData.progress || 0);
                setScanStatus(statusData.status || 'running');
                
                if (statusData.status === 'completed' || statusData.status === 'failed') {
                    clearInterval(interval);
                    if (statusData.status === 'completed') {
                        setScanProgress(100);
                        localStorage.setItem('lastScanJobId', jobId);
                    }
                }
            } catch (err) {
                console.error("Polling error:", err);
                clearInterval(interval);
                setIsScanning(false);
            }
        }, 800);
    };

    const startScan = async () => {
        setIsScanning(true);
        setScanProgress(0);

        try {
            let response;
            if (files.length > 0) {
                const formData = new FormData();
                files.forEach(file => formData.append('files', file));
                
                response = await fetchWithAuth(`${API_BASE_URL}/api/scan/upload`, {
                    method: 'POST',
                    body: formData
                });
            } else if (showingDriveFiles && driveFiles.length > 0) {
                // Cloud scan
                response = await fetchWithAuth(`${API_BASE_URL}/api/scan/cloud`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ files: driveFiles })
                });
            } else {
                response = await fetchWithAuth(`${API_BASE_URL}/api/scan/start`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        directory: folderPath || "C:\\Users\\sharkon\\Downloads"
                    })
                });
            }
            
            const data = await response.json();
            if (data.jobId) {
                pollScanStatus(data.jobId);
            } else {
                setIsScanning(false);
                alert(data.detail || data.error || data.message || "Failed to start scan");
            }
            
        } catch (error) {
            console.error("Failed to start scan:", error);
            setIsScanning(false);
            alert("Connection to backend failed.");
        }
    };

    const fetchDriveFiles = async () => {
        try {
            const res = await fetchWithAuth(`${API_BASE_URL}/api/cloud/files`);
            const data = await res.json();
            if (data.files) {
                setDriveFiles(data.files);
                setShowingDriveFiles(true);
            } else {
                alert(data.detail || data.error || data.message || "Failed to fetch Drive files");
            }
        } catch (error) {
            alert("Failed to fetch Drive files. Please ensure backend is running.");
        }
    };

    const connectCloud = async (provider) => {
        try {
            if (provider === 'google' && (isDriveConnected || user?.google_drive_connected)) {
                await fetchDriveFiles();
                return;
            }

            const endpoint = provider === 'google' 
                ? `${API_BASE_URL}/api/cloud/connect` 
                : `${API_BASE_URL}/api/cloud/dropbox/connect`;
                
            const res = await fetchWithAuth(endpoint);
            const data = await res.json();
            
            if (data.message && provider === 'google') {
                setIsDriveConnected(true);
                alert("Google Drive connected! You can now scan your storage.");
            } else {
                alert(data.detail || data.message || data.error || "Connection failed. Please check browser for authorization.");
            }
        } catch (error) {
            alert(`Failed to connect to ${provider}`);
        }
    };

    return (
        <DashboardLayout title="Storage Scanner">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-eco-text">Upload & Scan</h1>
                    <p className="text-eco-muted mt-2">Upload files or connect your storage to analyze digital waste.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <Card className="flex flex-col items-center justify-center p-8 text-center" onClick={() => connectCloud('google')}>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${isDriveConnected ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                            {isDriveConnected ? <CheckCircle2 size={24} /> : 'GD'}
                        </div>
                        <h3 className="font-bold text-eco-text">Google Drive</h3>
                        <p className="text-sm text-eco-muted mt-1">{isDriveConnected ? 'Workspace Connected' : 'Connect your workspace'}</p>
                        <Button variant={isDriveConnected ? 'primary' : 'outline'} size="sm" className="mt-4">
                            {isDriveConnected ? 'Scan Storage' : 'Connect'}
                        </Button>
                    </Card>
                    <Card className="flex flex-col items-center justify-center p-8 text-center" onClick={() => connectCloud('dropbox')}>
                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-4">
                            DB
                        </div>
                        <h3 className="font-bold text-eco-text">Dropbox</h3>
                        <p className="text-sm text-eco-muted mt-1">Scan shared folders</p>
                        <Button variant="outline" size="sm" className="mt-4">Connect</Button>
                    </Card>
                </div>

                {showingDriveFiles && driveFiles.length > 0 && !isScanning && (
                    <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-eco-text text-lg">Drive Storage ({driveFiles.length} files found)</h3>
                            <button 
                                onClick={() => setShowingDriveFiles(false)}
                                className="text-sm text-eco-primary hover:underline"
                            >
                                Hide List
                            </button>
                        </div>
                        <Card noPadding className="max-h-[400px] overflow-y-auto">
                            <ul className="divide-y divide-eco-border">
                                {driveFiles.map((file, i) => (
                                    <li key={i} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-50 text-blue-500 rounded-lg">
                                                <File size={20} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-eco-text truncate max-w-xs sm:max-w-md">{file.name}</p>
                                                <p className="text-xs text-eco-muted">{(parseInt(file.size || 0) / (1024 * 1024)).toFixed(2)} MB</p>
                                            </div>
                                        </div>
                                        <div className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-1 rounded">
                                            ID: {file.id?.substring(0, 8)}...
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </Card>
                        <div className="mt-6 flex justify-end">
                            <Button variant="primary" size="lg" onClick={startScan}>
                                Start Drive AI Analysis
                            </Button>
                        </div>
                    </div>
                )}

                {!showingDriveFiles && (
                    <Card className="mb-8">
                        <div className="mb-6">
                            <label className="block text-sm font-bold text-eco-text mb-2">Scan Local Directory</label>
                            <input 
                                type="text" 
                                placeholder="e.g. C:\Users\Documents" 
                                className="w-full px-4 py-2 rounded-lg border border-eco-border focus:ring-2 focus:ring-eco-primary outline-none transition-all"
                                value={folderPath}
                                onChange={(e) => setFolderPath(e.target.value)}
                            />
                        </div>

                        <div
                            className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors duration-200 ${isDragging
                                    ? 'border-eco-primary bg-eco-primary/5'
                                    : 'border-eco-border hover:border-eco-muted/50 bg-eco-section/50'
                                }`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm text-eco-primary">
                                <UploadCloud size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-eco-text mb-2">Drag & drop files here</h3>
                            <p className="text-eco-muted mb-6">or click to browse from your computer</p>
                            <input 
                                type="file" 
                                id="fileInput" 
                                multiple 
                                className="hidden" 
                                onChange={handleFileSelect}
                            />
                            <Button variant="outline" onClick={() => document.getElementById('fileInput').click()}>Browse Files</Button>
                        </div>
                    </Card>
                )}

                {files.length > 0 && !isScanning && !showingDriveFiles && (
                    <div className="mb-8">
                        <h3 className="font-semibold text-eco-text mb-4">Selected Files ({files.length})</h3>
                        <Card noPadding>
                            <ul className="divide-y divide-eco-border">
                                {files.map((file, i) => (
                                    <li key={i} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-eco-section rounded-lg text-eco-muted">
                                                <File size={20} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-eco-text truncate max-w-xs sm:max-w-md">{file.name}</p>
                                                <p className="text-xs text-eco-muted">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeFile(i)}
                                            className="text-gray-400 hover:text-red-500 transition-colors p-2"
                                        >
                                            <X size={18} />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </Card>
                        <div className="mt-6 flex justify-end">
                            <Button variant="primary" size="lg" onClick={startScan}>
                                Start AI Analysis
                            </Button>
                        </div>
                    </div>
                )}

                {folderPath && files.length === 0 && !isScanning && (
                    <div className="mt-6 flex justify-end">
                        <Button variant="primary" size="lg" onClick={startScan}>
                            Scan Local Folder
                        </Button>
                    </div>
                )}

                {isScanning && (
                    <Card className="mb-8 text-center py-12">
                        <div className="max-w-md mx-auto relative">
                            {scanProgress < 100 ? (
                                <div className="w-16 h-16 border-4 border-eco-section border-t-eco-primary rounded-full animate-spin mx-auto mb-6"></div>
                            ) : (
                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle2 size={32} />
                                </div>
                            )}

                            <h3 className="text-xl font-bold text-eco-text mb-2">
                                {scanProgress < 100 ? (scanStatus === 'counting' ? 'Counting Files...' : 'Analyzing Storage...') : 'Analysis Complete'}
                            </h3>
                            <p className="text-eco-muted mb-8">
                                {scanProgress < 100 ? (scanStatus === 'counting' ? 'Preparing the scan environment.' : 'Our AI is scanning for duplicates and junk.') : 'Redirecting to results...'}
                            </p>

                            <div className="w-full bg-eco-section h-3 rounded-full overflow-hidden mb-2">
                                <div
                                    className="bg-eco-primary h-full rounded-full transition-all duration-300 ease-out"
                                    style={{ width: `${scanProgress}%` }}
                                ></div>
                            </div>
                            <p className="text-sm font-medium text-eco-text text-right">{scanProgress}%</p>

                            {scanProgress === 100 && (
                                <div className="mt-8">
                                    <Link to="/dashboard">
                                        <Button variant="primary">View Results</Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </Card>
                )}

                <div className="flex items-start gap-4 p-4 rounded-xl bg-ai-accent/10 border border-ai-accent/20">
                    <AlertCircle className="w-5 h-5 text-ai-accent shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-sm font-bold text-ai-accent mb-1">Important Notice regarding your data</h4>
                        <p className="text-sm text-ai-accent text-opacity-80">
                            Files uploaded here are analyzed temporarily to generate your sustainability report and detect digital waste.
                            <strong> They are not stored permanently on our servers </strong>
                            and are immediately discarded after analysis.
                        </p>
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
}
