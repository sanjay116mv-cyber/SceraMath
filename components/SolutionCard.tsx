
import React, { useState } from 'react';
import { MathSolution } from '../types';
import MathRenderer from './MathRenderer';
import { ChevronDown, ChevronUp, Copy, Check, Info, Binary, Lightbulb } from 'lucide-react';

interface SolutionCardProps {
  solution: MathSolution;
}

const SolutionCard: React.FC<SolutionCardProps> = ({ solution }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = `${solution.problemSummary}\n\nFinal Result: ${solution.finalAnswer}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-10 animate-in">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Inquiry Resolved</span>
        </div>
        <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white leading-tight max-w-3xl">
          {solution.problemSummary}
        </h2>
      </div>

      {/* Logical Steps */}
      <div className="space-y-6">
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/10 transition-all"
        >
          {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          {isExpanded ? 'Hide Derivation' : 'Show Full Derivation'}
        </button>

        {isExpanded && (
          <div className="space-y-12 relative py-4">
            <div className="absolute left-3 top-0 bottom-0 w-px bg-gradient-to-b from-indigo-500/20 via-white/5 to-transparent" />
            
            {solution.steps.map((step, idx) => (
              <div key={idx} className="relative pl-10 group">
                <div className="absolute left-[9px] top-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 ring-4 ring-black z-10" />
                <div className="space-y-3">
                  <h4 className="text-sm font-black uppercase tracking-widest text-indigo-400/80">Step {idx + 1}: {step.title}</h4>
                  <p className="text-base text-gray-400 leading-relaxed max-w-2xl font-medium">
                    {step.description}
                  </p>
                  <div className="mt-4 p-6 bg-white/[0.02] border border-white/[0.05] rounded-2xl inline-block min-w-[240px] shadow-inner group-hover:border-white/10 transition-colors">
                    <MathRenderer latex={step.latex} displayMode />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Result Section */}
      <div className="pt-6">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-[2.5rem] opacity-20 blur-xl group-hover:opacity-30 transition-opacity" />
          <div className="relative p-8 md:p-12 bg-[#080808] border border-white/10 rounded-[2.5rem] flex flex-col md:flex-row md:items-center justify-between gap-10">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-indigo-400">
                <Binary size={16} />
                <span className="text-[11px] font-black uppercase tracking-[0.4em]">Definitive Result</span>
              </div>
              <div className="text-3xl md:text-5xl font-black text-white tracking-tighter">
                <MathRenderer latex={solution.finalAnswer} displayMode />
              </div>
            </div>
            <button 
              onClick={handleCopy}
              className="px-8 py-4 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition-all flex items-center justify-center gap-2 shadow-2xl active:scale-95 self-start md:self-center"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
              {copied ? 'Copied' : 'Capture Result'}
            </button>
          </div>
        </div>
      </div>

      {/* Concepts & Context */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-white/5">
        <div className="md:col-span-2 space-y-4 p-8 bg-white/[0.01] border border-white/5 rounded-[2rem]">
          <div className="flex items-center gap-2 text-gray-500">
            <Lightbulb size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Mathematical Insight</span>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed italic">
            "{solution.conceptExplanation}"
          </p>
        </div>
        
        <div className="space-y-4 p-8 bg-white/[0.01] border border-white/5 rounded-[2rem]">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 block">Related Core</span>
          <div className="flex flex-wrap gap-2">
            {solution.relatedFormulas.map((f, i) => (
              <div key={i} className="px-3 py-1.5 bg-white/5 rounded-lg border border-white/5 text-xs text-indigo-300/70 font-mono">
                <MathRenderer latex={f} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolutionCard;
