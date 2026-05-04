import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, ImagePlus, X } from 'lucide-react';
import { chatWithVideo } from '../services/geminiService';

const ChatWithVideo = ({ file, messages, setMessages, isLoading, setIsLoading }) => {
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      alert("Image is too large. Maximum size is 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result).split(',')[1];
      setSelectedImage({
        file,
        base64,
        type: file.type,
        previewUrl: URL.createObjectURL(file)
      });
    };
    reader.readAsDataURL(file);
  };

  const removeSelectedImage = () => {
    if (selectedImage?.previewUrl) {
      URL.revokeObjectURL(selectedImage.previewUrl);
    }
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if ((!input.trim() && !selectedImage) || isLoading) return;

    const userMessage = {
      role: 'user',
      text: input,
      timestamp: new Date(),
      ...(selectedImage && {
        image: {
          base64: selectedImage.base64,
          mimeType: selectedImage.type,
          previewUrl: selectedImage.previewUrl
        }
      })
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    const imageToSend = selectedImage;
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setIsLoading(true);

    try {
      const history = messages.map(m => ({ 
        role: m.role, 
        text: m.text,
        ...(m.image && { image: { base64: m.image.base64, mimeType: m.image.mimeType } })
      }));
      
      const response = await chatWithVideo(
        file.base64, 
        file.type, 
        history, 
        input,
        imageToSend ? { base64: imageToSend.base64, mimeType: imageToSend.type } : undefined
      );
      
      const modelMessage = {
        role: 'model',
        text: response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage = {
        role: 'model',
        text: "I encountered an error processing your request. Please check the API key or video format.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
      <div className="p-4 border-b border-white/5 bg-slate-900/60 backdrop-blur-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg">
            <Bot className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <h3 className="font-bold text-white leading-none">Inspector Chat</h3>
            <span className="text-[10px] text-emerald-500 uppercase font-bold tracking-widest flex items-center gap-1 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Neural Core Active
            </span>
          </div>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth pb-20 md:pb-4"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
            <Bot className="w-12 h-12 mb-4" />
            <p className="text-sm">Ask me anything about the uploaded footage.<br/>"What car arrived at 2:00 PM?" or "Is anyone wearing a red hat?"</p>
          </div>
        )}
        
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                m.role === 'user' ? 'bg-indigo-600' : 'bg-slate-800'
              }`}>
                {m.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-indigo-400" />}
              </div>
              <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
                m.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-slate-800 text-slate-200 rounded-tl-none'
              }`}>
                {m.image && (
                  <img 
                    src={m.image.previewUrl} 
                    alt="Uploaded reference" 
                    className="max-w-[200px] rounded-lg mb-2 border border-white/10"
                    referrerPolicy="no-referrer"
                  />
                )}
                {m.text}
                <div className="mt-1 text-[10px] opacity-40 text-right">
                  {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[85%] flex gap-3">
              <div className="shrink-0 w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
                <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
              </div>
              <div className="p-3 rounded-2xl bg-slate-800 text-slate-400 text-sm flex items-center gap-2">
                Synthesizing response...
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-4 bg-slate-950/50 backdrop-blur-xl border-t border-white/5 flex flex-col gap-2">
        {selectedImage && (
          <div className="relative inline-block self-start">
            <img 
              src={selectedImage.previewUrl} 
              alt="Preview" 
              className="h-16 w-16 object-cover rounded-lg border border-white/10"
              referrerPolicy="no-referrer"
            />
            <button
              type="button"
              onClick={removeSelectedImage}
              className="absolute -top-2 -right-2 p-1 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 rounded-full border border-white/10 shadow-lg"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
        <div className="relative flex items-center gap-2">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageUpload}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-3 bg-slate-900/50 hover:bg-slate-800 border border-white/10 rounded-xl text-slate-400 hover:text-indigo-400 transition-all"
            title="Upload image to find in video"
          >
            <ImagePlus className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Query scene context or ask about the image..."
            className="flex-1 bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 focus:bg-slate-900/80 placeholder:text-slate-500 transition-all shadow-inner"
          />
          <button
            type="submit"
            disabled={(!input.trim() && !selectedImage) || isLoading}
            className="p-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800/50 disabled:text-slate-600 text-white rounded-xl transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)] disabled:shadow-none"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWithVideo;
