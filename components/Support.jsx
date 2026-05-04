import React from 'react';
import { HelpCircle, MessageCircle, Shield, FileVideo, Zap } from 'lucide-react';

const faqs = [
  {
    icon: <FileVideo className="w-5 h-5 text-indigo-400" />,
    question: "What video formats and sizes are supported?",
    answer: "We support standard formats like MP4, MOV, and AVI. You can upload files up to 1000MB in size, with a maximum duration of 1 hour per video."
  },
  {
    icon: <Zap className="w-5 h-5 text-amber-400" />,
    question: "How long does the deep scan take?",
    answer: "Processing time depends on the length and complexity of the video. Typically, a 10-minute video takes about 1-2 minutes to fully analyze and transcribe."
  },
  {
    icon: <Shield className="w-5 h-5 text-emerald-400" />,
    question: "Is my video data stored securely?",
    answer: "Yes. Videos are processed entirely in-memory during your session. We do not permanently store your footage or use it to train our models."
  },
  {
    icon: <MessageCircle className="w-5 h-5 text-cyan-400" />,
    question: "How does the Contextual Query Console work?",
    answer: "Once a video is scanned, you can ask natural language questions like 'Did a red car pass by?' or 'What time did the person leave?'. The AI uses the extracted metadata to give you precise answers."
  }
];

const Support = () => {
  return (
    <div className="h-full overflow-y-auto p-2">
      <div className="max-w-3xl mx-auto space-y-8 pb-8">
        <div className="text-center space-y-4 mb-12">
          <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto border border-indigo-500/30 shadow-[0_0_30px_rgba(79,70,229,0.15)]">
            <HelpCircle className="w-8 h-8 text-indigo-400" />
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">How can we help?</h2>
          <p className="text-slate-400">Frequently asked questions and support resources.</p>
        </div>

        <div className="grid gap-4">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 hover:bg-slate-800/40 transition-colors shadow-lg">
              <div className="flex gap-4">
                <div className="shrink-0 mt-1">
                  {faq.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-200 mb-2">{faq.question}</h3>
                  <p className="text-slate-400 leading-relaxed text-sm">{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl p-8 text-center backdrop-blur-xl transition-all">
          <h3 className="text-xl font-semibold text-white mb-2">Still need help?</h3>
          <p className="text-slate-400 mb-6 text-sm">Our engineering team is available 24/7 to assist with enterprise deployments and custom model integrations.</p>
          <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)]">
            Contact Support Team
          </button>
        </div>
      </div>
    </div>
  );
};

export default Support;
