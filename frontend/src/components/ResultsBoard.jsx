import { Sparkles } from 'lucide-react';

const MODE_META = {
  CAB: { code: 'CAB', color: '#FFB84D' },
  TRAIN: { code: 'TRN', color: '#34E0A1' },
  BUS: { code: 'BUS', color: '#FF6FA5' },
  FLIGHT: { code: 'FLT', color: '#4F9DFF' },
};

export default function ResultsBoard({ options, onBook, personalized = false }) {
  if (!options || options.length === 0) {
    return (
      <div className="border border-dashed border-line rounded-2xl p-12 text-center text-mist-soft">
        <p>No fares on the board yet.</p>
        <p className="font-mono text-xs mt-1">Run a search above to populate it.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-line bg-surface overflow-hidden">
      <div className="grid grid-cols-[64px_1.6fr_90px_90px_90px_110px_100px_80px] gap-3 px-5 py-3 bg-surface-raised text-[0.68rem] tracking-wide text-mist-soft border-b border-line max-md:hidden">
        <span>MODE</span><span>OPERATOR</span><span>DEPARTS</span><span>ARRIVES</span>
        <span>DURATION</span><span>FARE</span><span>{personalized ? 'AI FIT' : ''}</span><span></span>
      </div>
      <div className="max-h-[560px] overflow-y-auto">
        {options.map((opt, i) => {
          const meta = MODE_META[opt.mode] || { code: opt.mode, color: '#8E97B8' };
          return (
            <div
              key={opt.id}
              className="grid grid-cols-[64px_1.6fr_90px_90px_90px_110px_100px_80px] gap-3 px-5 py-3.5 items-center border-b border-line last:border-0 hover:bg-white/[0.03] animate-fade-up max-md:grid-cols-1 max-md:gap-1"
              style={{ animationDelay: `${i * 35}ms` }}
            >
              <span>
                <span
                  className="inline-block text-[0.68rem] font-bold px-2 py-0.5 rounded-full text-white"
                  style={{ background: meta.color }}
                >
                  {meta.code}
                </span>
              </span>
              <span className="flex items-center gap-2 text-white font-medium">
                {opt.providerName}
                {opt.badge && (
                  <span className="text-[0.64rem] font-semibold text-ink bg-emerald px-2 py-0.5 rounded-full whitespace-nowrap">
                    {opt.badge}
                  </span>
                )}
              </span>
              <span className="font-mono text-sm text-mist">{opt.departureTime}</span>
              <span className="font-mono text-sm text-mist">{opt.arrivalTime}</span>
              <span className="font-mono text-sm text-mist-soft">{opt.durationLabel}</span>
              <span className="font-mono font-bold text-white">₹{opt.price.toLocaleString('en-IN')}</span>
              <span>
                {personalized && typeof opt.personalizedScore === 'number' && (
                  <span className="flex items-center gap-1.5 text-xs text-violet font-semibold">
                    <Sparkles size={13} />
                    {Math.round(opt.personalizedScore * 100)}%
                  </span>
                )}
              </span>
              <span>
                <button
                  onClick={() => onBook(opt)}
                  className="text-xs font-semibold border border-blue text-blue px-3 py-1.5 rounded-lg hover:bg-blue hover:text-ink transition-colors"
                >
                  Book
                </button>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
