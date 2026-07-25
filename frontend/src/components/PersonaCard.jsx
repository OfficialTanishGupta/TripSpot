import { Sparkles } from 'lucide-react';

export default function PersonaCard({ persona, confidence, insight }) {
  return (
    <div className="rounded-2xl border border-violet/30 bg-gradient-to-br from-violet-soft to-surface p-5 flex items-start gap-4">
      <div className="w-11 h-11 rounded-xl bg-violet/20 text-violet flex items-center justify-center shrink-0">
        <Sparkles size={20} />
      </div>
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[0.65rem] font-bold tracking-wide text-violet uppercase">AI Traveler Insight</span>
          <span className="text-[0.65rem] text-mist-soft font-mono">{Math.round(confidence * 100)}% confidence</span>
        </div>
        <h4 className="text-white font-semibold text-sm mb-1">{persona}</h4>
        <p className="text-mist text-sm leading-relaxed">{insight}</p>
      </div>
    </div>
  );
}
