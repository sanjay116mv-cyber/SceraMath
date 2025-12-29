
import React, { useEffect, useRef, useState } from 'react';

interface MathRendererProps {
  latex: string;
  displayMode?: boolean;
  className?: string;
}

const MathRenderer: React.FC<MathRendererProps> = ({ latex, displayMode = false, className = "" }) => {
  const containerRef = useRef<HTMLSpanElement>(null);
  const [renderStatus, setRenderStatus] = useState<'loading' | 'success' | 'fallback'>('loading');

  useEffect(() => {
    let isMounted = true;
    
    const tryRender = () => {
      const katex = (window as any).katex;
      if (!katex || !containerRef.current) {
        if (isMounted) setRenderStatus('fallback');
        return;
      }

      try {
        // Clean the input string from common LLM artifacts
        const cleaned = (latex || '')
          .replace(/\\\[|\\\]|\\\(|\\\)|\\begin\{equation\}|\\end\{equation\}|\$|\$\$/g, '')
          .trim();

        if (!cleaned) {
          if (isMounted) setRenderStatus('success');
          return;
        }

        katex.render(cleaned, containerRef.current, {
          throwOnError: true, // We want it to throw so we can trigger fallback
          displayMode: displayMode,
          output: 'html',
          trust: true,
          strict: false
        });
        
        if (isMounted) setRenderStatus('success');
      } catch (err) {
        console.warn("KaTeX rendering failed, using readable fallback:", err);
        if (isMounted) setRenderStatus('fallback');
      }
    };

    tryRender();
    return () => { isMounted = false; };
  }, [latex, displayMode]);

  if (renderStatus === 'fallback') {
    // A beautiful "Common Way" fallback for math
    const readableText = latex
      .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '($1/$2)')
      .replace(/\\sqrt\{([^}]*)\}/g, '√($1)')
      .replace(/\\cdot/g, '·')
      .replace(/\\times/g, '×')
      .replace(/\\pm/g, '±')
      .replace(/[\{\}]/g, '')
      .replace(/\\/g, '');

    return (
      <span className={`${className} font-mono text-indigo-300/90 bg-white/5 px-2 py-0.5 rounded border border-white/5`}>
        {readableText}
      </span>
    );
  }

  return (
    <span 
      className={`${className} transition-opacity duration-500 ${renderStatus === 'success' ? 'opacity-100' : 'opacity-0'}`}
    >
      <span ref={containerRef} />
    </span>
  );
};

export default MathRenderer;
