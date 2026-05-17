import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, FileText, ImageIcon, MoreHorizontal, CheckCircle2, 
  AlertCircle, Loader2, FolderOpen, ChevronRight,
  ShieldCheck, LogOut, Library, ExternalLink, Shield, Info
} from 'lucide-react';
import { initAuth, googleSignIn, logout as googleLogout } from '@/src/lib/googleAuth';
import { cn } from '@/src/lib/utils';
import { User } from 'firebase/auth';

const DRIVE_FOLDERS = {
  'Program Brochures': '1X2UgIAbhzmy7zxWPVRHjJb22QrWibpqj',
  'Program Reports': '1fRrkFbUkJKAYNHWyRniYRVG7mtMYL8vb',
  'Program Photos': '17Vg7hiNBlIxLCnFPGRajgVaR59jCveqN',
  'Invoices/Bills': '1SQRCGgWuAoLkXgJ5zchR8Avo5aEv6IiF', // Using one of the provided IDs, can be updated later
  'Other 01': '1jL4drFpAsI76FyRZw0lbPPfJBb_MJoRZ',
  'Other 02': '1qE8DIrxcsHftpTdRTCFtDFmJ5VNzKDY5',
  'Other 03': '1ptfh0UD2t-E4utQj6Q5bNYo_Lm7xT9Ng',
  'Other 04': '1SQRCGgWuAoLkXgJ5zchR8Avo5aEv6IiF',
};

export default function Resources() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState<keyof typeof DRIVE_FOLDERS | ''>('');
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  useEffect(() => {
    const unsubscribe = initAuth(
      (u, t) => {
        setUser(u);
        setToken(t);
        setNeedsAuth(false);
      },
      () => setNeedsAuth(true)
    );
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setStatus(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        setNeedsAuth(false);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/popup-closed-by-user') {
        setStatus({ type: 'error', msg: 'Login window was closed before completion. Please try again.' });
      } else if (err.code === 'auth/access-denied' || err.message?.includes('403')) {
        setStatus({ type: 'error', msg: 'Access Denied: This app is in testing mode. Your email must be added as a test user in Google Console.' });
      } else {
        setStatus({ type: 'error', msg: 'Connection failed. Please check your internet or try again later.' });
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await googleLogout();
    setUser(null);
    setToken(null);
    setNeedsAuth(true);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !category || !token) return;

    setUploading(true);
    setStatus(null);

    try {
      // Direct client-side upload to Google Drive for static hosting support (GitHub Pages)
      const metadata = {
        name: file.name,
        parents: [DRIVE_FOLDERS[category]],
      };

      const formData = new FormData();
      formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      formData.append('file', file);

      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.message || 'Upload failed');

      setStatus({ type: 'success', msg: `Successfully uploaded "${file.name}" to ${category}` });
      setFile(null);
      const fileInput = document.getElementById('material-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (err: any) {
      console.error("Upload error:", err);
      setStatus({ type: 'error', msg: err.message || "Upload failed. Check your connection." });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full mb-4 border border-indigo-200 shadow-sm">
              <Library size={16} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Digital Repository</span>
            </div>
            <h1 className="text-4xl md:text-7xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-6">
              NSS <span className="text-indigo-600">Resources</span>
            </h1>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px] max-w-xl mx-auto leading-relaxed">
              Official manuals, policy documents, and training resources stored on Google Drive. 
              Contribution and sharing made easy for all volunteers.
            </p>
          </motion.div>
        </div>

        {needsAuth ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white border border-slate-100 rounded-[3rem] shadow-sm space-y-6">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center">
              <FolderOpen size={40} className="text-blue-600" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-slate-900 uppercase italic">Drive Integration Required</h2>
              <p className="text-slate-500 max-w-sm px-4">Sign in with Google to view and upload materials to the NSS Library.</p>
            </div>
            <button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="px-8 h-14 bg-white border border-slate-200 rounded-2xl flex items-center gap-3 font-bold hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
            >
              {isLoggingIn ? (
                <Loader2 className="animate-spin text-blue-600" size={20} />
              ) : (
                <img src="https://www.google.com/favicon.ico" className="w-5 h-5" />
              )}
              <span>Connect Google Account</span>
            </button>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header with User Info */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-white border border-slate-100 rounded-3xl shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
                  {user?.photoURL ? (
                    <img src={user.photoURL} className="w-full h-full rounded-2xl" />
                  ) : (
                    <Library size={24} className="text-indigo-600" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-black uppercase text-indigo-600 tracking-widest">Active Session</div>
                  <div className="text-sm font-bold text-slate-900">{user?.displayName || user?.email}</div>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all text-[10px] font-black uppercase tracking-widest"
              >
                <LogOut size={16} /> Disconnect
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Upload Panel */}
              <section className="lg:col-span-1">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm sticky top-32">
                  <div className="flex items-center gap-3 text-indigo-600 mb-8">
                    <Upload size={20} />
                    <h3 className="font-black uppercase tracking-widest text-xs">Upload Material</h3>
                  </div>

                  <form onSubmit={handleUpload} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Destination</label>
                      <div className="relative">
                        <select
                          required
                          value={category}
                          onChange={(e) => setCategory(e.target.value as any)}
                          className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-5 outline-none focus:ring-2 focus:ring-indigo-600 transition-all font-bold text-slate-700 appearance-none"
                        >
                          <option value="">Select Folder</option>
                          {Object.keys(DRIVE_FOLDERS).map(f => (
                            <option key={f} value={f}>{f}</option>
                          ))}
                        </select>
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                          <ChevronRight size={18} className="rotate-90" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">File Source</label>
                      <input
                        id="material-file"
                        type="file"
                        required
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="w-full text-xs font-bold text-slate-500
                          file:mr-4 file:py-3 file:px-6
                          file:rounded-xl file:border-0
                          file:text-xs file:font-black
                          file:bg-indigo-50 file:text-indigo-700
                          hover:file:bg-indigo-100
                          file:transition-all cursor-pointer"
                      />
                    </div>

                    <AnimatePresence>
                      {status && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className={cn(
                            "p-4 rounded-2xl text-xs font-bold flex items-center gap-3 overflow-hidden",
                            status.type === 'success' ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                          )}
                        >
                          {status.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                          {status.msg}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <button
                      type="submit"
                      disabled={uploading || !file || !category}
                      className="w-full h-14 bg-slate-900 text-white font-black uppercase tracking-widest rounded-2xl shadow-lg hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="animate-spin" size={20} />
                          <span>Syncing...</span>
                        </>
                      ) : (
                        <>
                          <Upload size={20} />
                          <span>Post Resource</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </section>

              {/* Browse Folders */}
              <section className="lg:col-span-2 space-y-6">
                <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl shadow-slate-900/10">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3 text-indigo-400">
                      <FolderOpen size={20} />
                      <h3 className="font-black uppercase tracking-widest text-xs">Drive Directory</h3>
                    </div>
                    <ShieldCheck size={20} className="text-emerald-400" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(DRIVE_FOLDERS).map(([name, id]) => (
                      <motion.a
                        key={id}
                        href={`https://drive.google.com/drive/folders/${id}`}
                        target="_blank"
                        rel="noreferrer"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="p-6 bg-white/5 border border-white/10 rounded-3xl group hover:bg-white/10 transition-all flex items-center justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-indigo-500/20 transition-all">
                            {name.includes('Photos') ? <ImageIcon size={22} className="text-indigo-400" /> : <FileText size={22} className="text-indigo-400" />}
                          </div>
                          <div>
                            <div className="text-sm font-bold tracking-tight">{name}</div>
                            <div className="text-[10px] font-black uppercase opacity-40 tracking-widest">Open in Drive</div>
                          </div>
                        </div>
                        <ExternalLink size={14} className="opacity-40 group-hover:opacity-100 transition-all" />
                      </motion.a>
                    ))}
                  </div>
                </div>

                <div className="p-8 bg-white border border-slate-100 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-6 shadow-sm">
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                    <Shield size={28} />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight italic mb-1">Upload Policy</h4>
                    <p className="text-[11px] font-medium text-slate-500 leading-relaxed max-w-xl">
                      By uploading, you agree to store files in the designated public folders. 
                      Ensure filenames are clear and content is relevant to unit activities. 
                      Admins monitor the Drive regularly for security.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
