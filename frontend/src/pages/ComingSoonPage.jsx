export default function ComingSoonPage({
  icon: Icon,
  title,
  description,
  accentColor = "#7C6FFF",
  accentBg = "#EEECFF",
}) {
  return (
    <div className="max-w-2xl mx-auto flex flex-col items-center text-center py-20 px-4">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
        style={{ background: accentBg, color: accentColor }}
      >
        <Icon size={28} />
      </div>
      <h1 className="text-2xl font-bold text-ink mb-2">{title}</h1>
      <p className="text-mist text-sm leading-relaxed max-w-sm">
        {description}
      </p>
      <span
        className="mt-6 text-xs font-semibold uppercase tracking-wide px-3 py-1.5 rounded-full"
        style={{ background: accentBg, color: accentColor }}
      >
        Coming soon
      </span>
    </div>
  );
}
