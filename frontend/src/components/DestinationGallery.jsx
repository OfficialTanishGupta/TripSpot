export default function DestinationGallery({ destinations }) {
  return (
    <div className="grid grid-cols-3 gap-3 max-md:grid-cols-2">
      {destinations.map((d, i) => (
        <div
          key={d.name}
          className="group relative rounded-2xl overflow-hidden aspect-[4/3] cursor-pointer animate-fade-up"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <img
            src={d.photo}
            alt={d.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
          <span className="absolute top-3 left-3 text-[0.65rem] font-semibold text-white bg-white/20 backdrop-blur px-2.5 py-1 rounded-full">
            {d.tag}
          </span>
          <span className="absolute bottom-3 left-3.5 right-3 text-white font-display font-semibold text-sm">
            {d.name}
          </span>
        </div>
      ))}
    </div>
  );
}
