"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import axios from "axios";
import { Send, UploadCloud, Loader2, Cpu, Stethoscope, FileText, Sparkles, Trash2, ShieldCheck } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";

// Load 3D Scene dynamically
const Scene3D = dynamic(() => import("./Scene3D"), { 
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-[#050505]" /> 
});

type Mode = "document" | "aiml" | "medical";

export default function Home() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [activeMode, setActiveMode] = useState<Mode>("document");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // 🎨 FULL PAGE DYNAMIC COLORS
  const modeThemes = {
    document: { 
      color: "#00ffff", 
      cssVar: "0, 255, 255", 
      label: "RAG CORE",
      desc: "DOCUMENT INTELLIGENCE ACTIVE"
    },
    aiml: { 
      color: "#b026ff", 
      cssVar: "176, 38, 255", 
      label: "AI/ML NODE",
      desc: "NEURAL NETWORK OPERATIONAL"
    },
    medical: { 
      color: "#00ff66", 
      cssVar: "0, 255, 102", 
      label: "BIO-MED",
      desc: "BIO-TECH SYSTEMS ONLINE"
    }


  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadStatus("Indexing...");
    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post("http://127.0.0.1:8000/upload", formData);
      const shortName = file.name.length > 15 ? file.name.substring(0, 15) + "..." : file.name;
      setUploadStatus(`✅ ${shortName} Ready`);
    } catch (error) {
      setUploadStatus("❌ Upload failed");
    } finally {
      e.target.value = ""; 
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setIsLoading(true);
    try {
      const response = await axios.post("http://127.0.0.1:8000/ask", { question: userMsg, mode: activeMode });
      setMessages((prev) => [...prev, { role: "ai", content: response.data.answer }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: "ai", content: "Sync failed. Check connection." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div 
      className="relative flex flex-col h-screen overflow-hidden transition-all duration-1000"
      style={{ 
        backgroundColor: `rgba(${modeThemes[activeMode].cssVar}, 0.03)`,
        boxShadow: `inset 0 0 200px rgba(${modeThemes[activeMode].cssVar}, 0.05)`
      } as any}
    >
      {/* 🌌 FULL PAGE MESH BACKGROUND */}
      <div className="mesh-bg" style={{ '--active-glow': modeThemes[activeMode].color } as any}>
        <div className="aurora-layer" />
      </div>

      {/* 🤖 3D ROBOT LAYER */}
      <Scene3D mode={activeMode} />

      {/* 🎭 BACKGROUND FLOATING TITLE */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.h1 
            key={activeMode}
            initial={{ opacity: 0, scale: 1.2, y: 100 }}
            animate={{ opacity: 0.05, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -100 }}
            transition={{ duration: 1.5, ease: "anticipate" }}
            className="text-[25vw] font-black tracking-tighter uppercase whitespace-nowrap"
            style={{ color: modeThemes[activeMode].color }}
          >
            {activeMode === 'document' ? 'RAG' : activeMode}
          </motion.h1>
        </AnimatePresence>
      </div>

      <div className="relative z-10 flex flex-col h-full pointer-events-none">
        
        {/* TOP BAR (Updated with Status Indicator) */}
        <header className="flex justify-between items-center p-6 md:p-8 backdrop-blur-md border-b border-white/5 pointer-events-auto">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4">
            <div className="p-3 rounded-2xl ultra-glass border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)]">
               <ShieldCheck className="w-6 h-6" style={{ color: modeThemes[activeMode].color }} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-widest uppercase text-white flex items-center gap-3">
                Cortex.OS
                {/* ✨ NEW CLEAN STATUS INDICATOR ✨ */}
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                  <span className="flex h-1.5 w-1.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                  </span>
                  <span className="text-[9px] font-bold tracking-widest text-green-500/80">ONLINE</span>
                </div>
              </h1>
              <p className="text-[10px] tracking-[0.5em] font-bold opacity-60 uppercase" style={{ color: modeThemes[activeMode].color }}>
                {modeThemes[activeMode].desc}
              </p>
            </div>
          </motion.div>
          
          <div className="flex items-center gap-4">
            {uploadStatus && (
              <span className={`text-[10px] font-bold tracking-widest uppercase px-4 py-2 rounded-full ultra-glass ${uploadStatus.includes("✅") ? "text-cyan-400" : "text-yellow-400"}`}>
                {uploadStatus}
              </span>
            )}
            <label className="cursor-pointer ultra-glass p-3.5 rounded-full hover:scale-110 transition-all group border-white/10 shadow-xl">
              <UploadCloud className="w-5 h-5 text-gray-400 group-hover:text-white" />
              <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.txt,.docx" />
            </label>
          </div>
        </header>

        {/* 🌊 CHAT INTERFACE */}
        <main className="flex-1 overflow-y-auto px-6 md:px-24 pb-[25rem] pointer-events-auto custom-scrollbar scroll-smooth">
          <div className="max-w-4xl mx-auto space-y-10 mt-10">
            <AnimatePresence mode="popLayout">
              {messages.map((msg, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 30, scale: 0.95, filter: "blur(10px)" }}
                    animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                    transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {/* 🧊 LIGHT FROSTED GLASS BUBBLES */}
                    <div className={`p-7 rounded-[2.5rem] max-w-[85%] text-[15px] leading-relaxed backdrop-blur-2xl transition-all duration-700 border ${
                      msg.role === "user" 
                      ? "rounded-tr-none bg-white/70 border-white/50 shadow-lg" 
                      : "rounded-tl-none bg-white/80 border-white/80 shadow-2xl"
                    }`}
                    style={msg.role === "ai" ? { boxShadow: `0 10px 40px -10px ${modeThemes[activeMode].color}88` } : {}}
                    >
                      {/* ✅ FIX: Removed 'prose-invert' to make text naturally DARK, forced black headings/bold text */}
                      <div className="prose prose-sm max-w-none text-gray-900 prose-headings:text-black prose-strong:text-black prose-p:font-medium">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    </div>
                  </motion.div>
                ))
              }
            </AnimatePresence>

            {isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="px-6 py-4 rounded-full ultra-glass flex items-center gap-3">
                  <Loader2 className="w-4 h-4 animate-spin" style={{ color: modeThemes[activeMode].color }} />
                  <span className="text-[10px] tracking-widest text-gray-400 uppercase">Processing...</span>
                </div>
              </motion.div>
            )}

            {/* ⚓ SCROLL ANCHOR */}
            <div ref={messagesEndRef} className="h-40 w-full" />
          </div>
        </main>

        {/* 🛠️ NAVIGATION & CONTROL POD */}
        <div className="absolute bottom-10 w-full px-8 pointer-events-auto">
          <div className="max-w-4xl mx-auto flex flex-col gap-6">
            
            {/* Mode Switcher */}
            <div className="flex justify-between items-center bg-black/40 backdrop-blur-2xl p-2 rounded-[3rem] border border-white/5 shadow-2xl">
              <div className="flex gap-2">
                {(["document", "aiml", "medical"] as Mode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setActiveMode(m)}
                    className={`px-8 py-3.5 rounded-full text-[10px] font-black tracking-[0.2em] uppercase transition-all duration-700 ${
                      activeMode === m 
                      ? "bg-white text-black scale-105 shadow-xl" 
                      : "text-gray-500 hover:text-white"
                    }`}
                  >
                    {modeThemes[m].label}
                  </button>
                ))}
              </div>

              {messages.length > 0 && (
                <button onClick={clearChat} className="mr-2 p-3.5 rounded-full hover:bg-red-500/20 text-red-500 transition-all border border-transparent hover:border-red-500/30">
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Input Engine */}
            <form onSubmit={handleSendMessage} className="relative group">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="EXECUTE SYSTEM COMMAND..."
                className="w-full bg-black/30 border border-white/10 text-white placeholder-gray-600 px-10 py-7 rounded-[3rem] focus:outline-none focus:border-white/30 transition-all backdrop-blur-3xl shadow-2xl text-lg tracking-wide"
                disabled={isLoading}
              />
              <button 
                type="submit" 
                disabled={isLoading || !input.trim()} 
                className="absolute right-4 top-3 p-4 rounded-3xl transition-all duration-500 shadow-2xl disabled:opacity-20 hover:scale-105"
                style={{ backgroundColor: modeThemes[activeMode].color, color: '#000' }}
              >
                <Send className="w-6 h-6" />
              </button>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
}