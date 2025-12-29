
import React, { useState, useRef, useEffect } from 'react';
import { Camera, Image as ImageIcon, Send, X, Loader2, History, LogIn, UserCircle, ShieldCheck } from 'lucide-react';
import { solveMathProblem } from './services/gemini';
import { ChatMessage } from './types';
import SolutionCard from './components/SolutionCard';
import Logo from './components/Logo';

const BackgroundElements = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 40,
        y: (e.clientY / window.innerHeight - 0.5) * 40,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="bg-canvas">
      <div 
        className="floating-gradient bg-indigo-500/10" 
        style={{ top: '-10%', left: '-10%', transform: `translate(${mousePos.x}px, ${mousePos.y}px)` }} 
      />
      <div 
        className="floating-gradient bg-blue-600/5" 
        style={{ bottom: '10%', right: '-10%', transform: `translate(${mousePos.x * -0.5}px, ${mousePos.y * -0.5}px)` }} 
      />
    </div>
  );
};

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; picture?: string } | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleGoogleLogin = () => {
    // Simulated Google Login sequence
    setIsLoading(true);
    setTimeout(() => {
      setUser({ 
        name: "Alex Thompson", 
        email: "alex.t@gmail.com",
        picture: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" 
      });
      setShowLoginModal(false);
      setIsLoading(false);
    }, 800);
  };

  const handleLogout = () => {
    setUser(null);
  };

  const requireAuth = (action: () => void) => {
    if (!user) {
      setShowLoginModal(true);
    } else {
      action();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setSelectedImage(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      setShowCamera(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Camera access error", err);
      setShowCamera(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(videoRef.current, 0, 0);
      setSelectedImage(canvas.toDataURL('image/jpeg'));
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
    }
    setShowCamera(false);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!inputValue.trim() && !selectedImage) || isLoading) return;

    // Enforce login for image analysis if not already checked by requireAuth on the buttons
    if (selectedImage && !user) {
      setShowLoginModal(true);
      return;
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      image: selectedImage || undefined,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    const currentInput = inputValue;
    const currentImage = selectedImage;
    
    setInputValue('');
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const solution = await solveMathProblem(currentInput || "Synthesize mathematical derivation.", currentImage || undefined);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Analysis complete.`,
        solution,
        timestamp: Date.now(),
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Synthesis failed: The computational engine encountered an error.`,
        timestamp: Date.now(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col selection:bg-indigo-500/30 selection:text-white">
      <BackgroundElements />

      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-50 glass-panel px-6 h-14 flex items-center justify-between border-b border-white/[0.03]">
        <div className="flex items-center gap-2 select-none">
          <Logo className="w-5 h-5" />
          <h1 className="text-xs font-bold tracking-tight">
            <span className="brand-scera">Scera</span>
            <span className="brand-math ml-0.5 opacity-50">Math</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setMessages([])} 
            className="text-[9px] font-bold uppercase tracking-[0.1em] text-gray-500 hover:text-white transition-all flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-white/5"
          >
            <History size={11} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          
          {user ? (
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 pl-1 pr-3 py-1 bg-white/5 border border-white/5 rounded-full hover:bg-white/10 transition-all group"
            >
              <img src={user.picture} alt={user.name} className="w-6 h-6 rounded-full border border-white/10" />
              <span className="text-[10px] font-bold text-gray-400 group-hover:text-white">{user.name.split(' ')[0]}</span>
            </button>
          ) : (
            <button 
              onClick={() => setShowLoginModal(true)} 
              className="text-[9px] font-bold uppercase tracking-[0.1em] px-3 py-1.5 bg-white text-black rounded-lg hover:bg-gray-200 transition-all flex items-center gap-2 shadow-lg shadow-white/5"
            >
              <LogIn size={11} /> Sign In
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="chat-container flex-grow px-4 md:px-0 pt-20 pb-32">
        {messages.length === 0 ? (
          <div className="h-[55vh] flex flex-col items-center justify-center text-center space-y-10 animate-in">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500/10 blur-3xl rounded-full scale-150" />
              <Logo className="w-14 h-14 relative" />
            </div>
            <div className="space-y-4 max-w-sm">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tighter text-white">
                Deep logic. <span className="text-gray-500 italic font-medium">Pure math.</span>
              </h1>
              <p className="text-gray-500 text-sm leading-relaxed">
                Experience precision problem solving. <br/>
                <span className="opacity-60">Login required for visual analysis features.</span>
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-20">
            {messages.map((msg) => (
              <div key={msg.id} className="animate-in">
                {msg.role === 'user' ? (
                  <div className="flex flex-col items-end">
                    <div className="bg-[#0c0c0c] p-5 md:p-6 rounded-[1.5rem] border border-white/[0.04] max-w-[92%] shadow-2xl">
                      {msg.image && (
                        <div className="mb-4 rounded-xl overflow-hidden border border-white/5 bg-black">
                          <img src={msg.image} className="max-w-full max-h-72 object-contain mx-auto" alt="Problem snapshot" />
                        </div>
                      )}
                      <p className="text-base text-white font-medium tracking-tight leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="flex items-center gap-2 opacity-30 select-none">
                      <Logo className="w-3.5 h-3.5" />
                      <span className="text-[8px] font-black uppercase tracking-[0.4em]">Synthesis Resolution</span>
                    </div>
                    {msg.solution ? <SolutionCard solution={msg.solution} /> : (
                      <div className="p-6 bg-white/[0.01] border border-white/5 rounded-2xl text-gray-400 text-sm italic">{msg.content}</div>
                    )}
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="space-y-6 animate-pulse">
                <div className="flex items-center gap-2 opacity-30">
                  <Loader2 size={12} className="animate-spin" />
                  <span className="text-[8px] font-black uppercase tracking-[0.4em]">Deriving...</span>
                </div>
                <div className="h-48 bg-white/[0.01] border border-white/[0.03] rounded-3xl" />
              </div>
            )}
            <div ref={scrollEndRef} />
          </div>
        )}
      </main>

      {/* Footer Interface */}
      <div className="fixed bottom-0 inset-x-0 z-[60] flex flex-col items-center pointer-events-none">
        <div className="w-full max-w-2xl px-6 pb-2 pt-20 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-auto">
          
          {selectedImage && (
            <div className="flex justify-center mb-3">
              <div className="px-3 py-1.5 glass-panel rounded-xl flex items-center gap-3 border-white/10 shadow-2xl animate-in">
                <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-white/10 bg-black">
                  <img src={selectedImage} className="w-full h-full object-cover" alt="Preview" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[7px] font-black uppercase tracking-widest text-indigo-400">Snapshot Ready</span>
                  <span className="text-[9px] font-bold text-gray-400">Analysis Pending...</span>
                </div>
                <button onClick={() => setSelectedImage(null)} className="ml-2 p-1 text-gray-500 hover:text-white transition-colors">
                  <X size={14} />
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="glass-panel p-1.5 rounded-[2rem] flex items-center border-white/[0.06] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)] focus-within:border-white/10 transition-all">
            <div className="flex items-center gap-0.5 pr-1">
              <button 
                type="button" 
                onClick={() => requireAuth(() => fileInputRef.current?.click())} 
                className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-white transition-all rounded-full hover:bg-white/5"
                title="Upload Problem"
              >
                <ImageIcon size={18} />
              </button>
              <button 
                type="button" 
                onClick={() => requireAuth(startCamera)} 
                className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-white transition-all rounded-full hover:bg-white/5"
                title="Camera Capture"
              >
                <Camera size={18} />
              </button>
            </div>
            
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSubmit())}
              placeholder="Query logical derivation..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder:text-gray-700 px-3 py-3 text-sm resize-none max-h-32"
              rows={1}
            />
            
            <button 
              type="submit" 
              disabled={isLoading || (!inputValue.trim() && !selectedImage)} 
              className="w-10 h-10 rounded-full flex items-center justify-center bg-white text-black transition-all active:scale-95 disabled:opacity-5 shadow-xl shadow-white/5"
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </form>
          
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
          
          {/* Ultra Minimal Footer */}
          <footer className="mt-6 mb-3 flex items-center justify-center gap-4 opacity-15 select-none border-t border-white/[0.03] pt-2">
            <span className="text-[6px] font-black uppercase tracking-[0.6em] text-white">SceraEngine v1.2</span>
            <span className="text-[6px] font-black uppercase tracking-[0.6em] text-white">Silicon: Gemini-3</span>
            <span className="text-[6px] font-black uppercase tracking-[0.6em] text-white">Precision Built</span>
          </footer>
        </div>
      </div>

      {/* Login Modal Overlay */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-sm flex items-center justify-center p-6 animate-in">
          <div className="max-w-md w-full glass-panel p-10 rounded-[2.5rem] border-white/10 text-center relative shadow-[0_0_100px_rgba(99,102,241,0.1)]">
            <button onClick={() => setShowLoginModal(false)} className="absolute top-8 right-8 text-gray-600 hover:text-white transition-colors">
              <X size={20} />
            </button>
            
            <div className="flex flex-col items-center gap-6 mb-10">
              <div className="relative group">
                <div className="absolute inset-0 bg-white/5 blur-2xl rounded-full scale-150 group-hover:bg-white/10 transition-all duration-700" />
                <Logo className="w-12 h-12 relative" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-white tracking-tight">Advanced Analysis Access</h2>
                <p className="text-[13px] text-gray-500 max-w-[240px] mx-auto leading-relaxed">Sign in with Google to enable visual problem solving and camera OCR features.</p>
              </div>
            </div>

            <div className="space-y-4">
              <button 
                onClick={handleGoogleLogin} 
                disabled={isLoading}
                className="w-full py-3.5 bg-white text-black rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-gray-200 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {!isLoading ? (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continue with Google
                  </>
                ) : (
                  <Loader2 size={20} className="animate-spin" />
                )}
              </button>
              
              <p className="text-[10px] text-gray-700 uppercase tracking-widest font-black flex items-center justify-center gap-2">
                <ShieldCheck size={10} /> Secure Integrated Auth
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Camera Capture Interface */}
      {showCamera && (
        <div className="fixed inset-0 z-[120] bg-black flex flex-col items-center justify-center animate-in">
          <div className="absolute top-0 inset-x-0 p-8 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
            <div className="flex items-center gap-3">
              <Logo className="w-6 h-6" />
              <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">Capture Core</span>
            </div>
            <button onClick={stopCamera} className="w-12 h-12 flex items-center justify-center bg-white/5 border border-white/10 rounded-full text-white hover:bg-white/10 transition-all">
              <X size={24} />
            </button>
          </div>
          
          <div className="relative w-full max-w-2xl px-6">
            <div className="relative rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl bg-gray-900 aspect-[4/3]">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <div className="absolute inset-0 pointer-events-none border-[32px] border-black/20" />
              <div className="absolute inset-16 border border-white/20 border-dashed rounded-[2rem] opacity-30 pointer-events-none" />
            </div>
            
            <div className="mt-10 flex justify-center">
              <button 
                onClick={capturePhoto} 
                className="group relative w-20 h-20 flex items-center justify-center"
              >
                <div className="absolute inset-0 bg-white/20 rounded-full scale-125 blur-xl group-active:scale-100 transition-transform" />
                <div className="relative w-full h-full bg-white rounded-full flex items-center justify-center text-black shadow-2xl active:scale-90 transition-transform">
                  <Camera size={32} />
                </div>
              </button>
            </div>
          </div>
          <p className="absolute bottom-12 text-gray-500 text-[11px] font-bold uppercase tracking-widest">Align mathematical notation within frame</p>
        </div>
      )}

      <style>{`
        .chat-container { scroll-behavior: smooth; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-in { animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
};

export default App;
