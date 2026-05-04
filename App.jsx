import React, { useState, useCallback } from 'react';
import { Shield, Upload, FileVideo, FileImage, X, Search, Settings, Info, Menu } from 'lucide-react';
import VideoInspector from './components/VideoInspector';
import ChatWithVideo from './components/ChatWithVideo';
import Support from './components/Support';
import { analyzeVideo } from './services/geminiService';

const App = () => {
  const [file, setFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('inspect');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleFileUpload = async (event) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > 1000 * 1024 * 1024) { 
      alert("File is too large. Maximum supported size is 1000 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result).split(',')[1];
      setFile({
        file: selectedFile,
        base64,
        type: selectedFile.type,
        previewUrl: URL.createObjectURL(selectedFile)
      });
      setAnalysis(null);
      setChatMessages([]);
      setIsChatLoading(false);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleDeepScan = useCallback(async () => {
    if (!file) return;
    setIsAnalyzing(true);
    try {
      const results = await analyzeVideo(file.base64, file.type, 'deep');
      setAnalysis(results);
    } catch (error) {
      alert("Analysis failed. Ensure your API key is correct and valid.");
    } finally {
      setIsAnalyzing(false);
    }
  }, [file]);

  const handleFastScan = useCallback(async () => {
    if (!file) return;
    setIsAnalyzing(true);
    try {
      const results = await analyzeVideo(file.base64, file.type, 'fast');
      setAnalysis(results);
    } catch (error) {
      alert("Analysis failed. Ensure your API key is correct and valid.");
    } finally {
      setIsAnalyzing(false);
    }
  }, [file]);

  const removeFile = () => {
    if (file?.previewUrl) URL.revokeObjectURL(file.previewUrl);
    setFile(null);
    setAnalysis(null);
    setChatMessages([]);
    setIsChatLoading(false);
  };

  const handleMouseMove = (e) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  return (
    <div 
      className="flex h-screen bg-[#030712] text-slate-100 overflow-hidden font-sans relative selection:bg-indigo-500/30"
      onMouseMove={handleMouseMove}
    >
      <div 
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300 ease-out"
        style={{
          background: `radial-gradient(800px circle at ${mousePos.x}px ${mousePos.y}px, rgba(99, 102, 241, 0.15), transparent 80%)`
        }}
      />
      <div className="pointer-events-none absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/20 blur-[120px] rounded-full mix-blend-screen" />
      <div className="pointer-events-none absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-fuchsia-900/20 blur-[120px] rounded-full mix-blend-screen" />

      <div className="relative z-10 flex w-full h-full">
        {isSidebarOpen && (
          <div 
            className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30" 
            onClick={() => setSidebarOpen(false)} 
          />
        )}
        
        <aside className={`absolute md:relative z-40 h-full bg-slate-950/95 md:bg-slate-950/40 backdrop-blur-2xl border-r border-white/5 transition-all duration-300 ${isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64 md:translate-x-0 md:w-20'} flex flex-col`}>
        <div className="p-6 flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-xl shadow-[0_0_15px_rgba(79,70,229,0.5)]">
            <Shield className="w-6 h-6 text-white" />
          </div>
          {isSidebarOpen && <span className="font-black text-sm tracking-tight text-white uppercase italic leading-tight">AI CCTV<br/>Video Inspector</span>}
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <button 
            onClick={() => setActiveTab('inspect')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'inspect' ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 shadow-[0_0_15px_rgba(79,70,229,0.1)]' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
            }`}
          >
            <Search className="w-5 h-5" />
            {isSidebarOpen && <span className="font-semibold">Inspector</span>}
          </button>
          <button 
             onClick={() => setActiveTab('chat')}
             disabled={!file}
             className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
               activeTab === 'chat' ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 shadow-[0_0_15px_rgba(79,70,229,0.1)]' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 disabled:opacity-30'
             }`}
          >
            <FileVideo className="w-5 h-5" />
            {isSidebarOpen && <span className="font-semibold">Query Video</span>}
          </button>
        </nav>

        <div className="p-4 mt-auto space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-all">
            <Settings className="w-5 h-5" />
            {isSidebarOpen && <span className="font-medium">Settings</span>}
          </button>
          <button 
            onClick={() => setActiveTab('support')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'support' ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 shadow-[0_0_15px_rgba(79,70,229,0.1)]' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
            }`}
          >
            <Info className="w-5 h-5" />
            {isSidebarOpen && <span className="font-medium">Support</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 border-b border-white/5 bg-slate-950/30 backdrop-blur-2xl flex items-center justify-between px-8 z-20">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400">
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                {activeTab === 'inspect' ? 'Intelligence Dashboard' : activeTab === 'chat' ? 'Contextual Query Console' : 'Support Center'}
              </h1>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-hidden p-6">
          {activeTab === 'support' ? (
            <Support />
          ) : !file ? (
            <div className="h-full flex items-center justify-center">
              <div className="max-w-xl w-full">
                <label className="group relative flex flex-col items-center justify-center w-full h-80 border-2 border-dashed border-white/10 rounded-3xl cursor-pointer bg-slate-900/20 backdrop-blur-xl hover:bg-slate-900/40 hover:border-indigo-500/50 hover:shadow-[0_0_30px_rgba(79,70,229,0.15)] transition-all duration-500">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-8">
                    <div className="p-5 bg-slate-800/50 rounded-2xl mb-4 group-hover:scale-110 group-hover:bg-indigo-500 transition-all duration-500 shadow-xl border border-white/5">
                      <Upload className="w-10 h-10 text-indigo-400 group-hover:text-white" />
                    </div>
                    <p className="mb-2 text-xl font-bold text-slate-200">Ingest Surveillance Stream</p>
                    <p className="text-sm text-slate-400 max-w-xs">Drop your MP4, MOV, or security footage (up to 1 hour / 1000MB) here to begin neural interrogation.</p>
                  </div>
                  <input type="file" className="hidden" accept="video/*,image/*" onChange={handleFileUpload} />
                  <div className="absolute bottom-4 right-4 flex gap-2">
                    <div className="p-2 bg-slate-800/50 backdrop-blur-md rounded-lg border border-white/5">
                      <FileVideo className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="p-2 bg-slate-800/50 backdrop-blur-md rounded-lg border border-white/5">
                      <FileImage className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                </label>
                <div className="mt-8 grid grid-cols-3 gap-4">
                  {[
                    { title: 'Multimodal', desc: 'Senses visual & audio' },
                    { title: 'Semantic', desc: 'Understands complex acts' },
                    { title: 'Real-time', desc: 'Rapid inference engine' }
                  ].map((item, i) => (
                    <div key={i} className="p-4 bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-white/5 hover:bg-slate-800/50 transition-colors">
                      <h4 className="text-xs font-bold text-indigo-300 uppercase mb-1">{item.title}</h4>
                      <p className="text-[10px] text-slate-400">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-4 px-2">
                 <div className="flex items-center gap-3">
                   <div className="p-2 bg-indigo-600/20 rounded-lg">
                     <FileVideo className="w-5 h-5 text-indigo-500" />
                   </div>
                   <div>
                     <span className="text-sm font-bold text-slate-200 block">{file.file.name}</span>
                     <span className="text-[10px] text-slate-500 uppercase mono">{(file.file.size / (1024*1024)).toFixed(2)} MB • {file.file.type}</span>
                   </div>
                 </div>
                 <button 
                  onClick={removeFile}
                  className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                 >
                   <X className="w-5 h-5" />
                 </button>
              </div>

              {activeTab === 'inspect' ? (
                <VideoInspector 
                  file={file} 
                  analysis={analysis} 
                  isAnalyzing={isAnalyzing} 
                  onAnalyze={handleDeepScan}
                  onFastAnalyze={handleFastScan}
                />
              ) : (
                <ChatWithVideo 
                  file={file} 
                  messages={chatMessages} 
                  setMessages={setChatMessages} 
                  isLoading={isChatLoading}
                  setIsLoading={setIsChatLoading}
                />
              )}
            </div>
          )}
        </div>
      </main>
      </div>

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(250%); }
        }
      `}</style>
    </div>
  );
};

export default App;
