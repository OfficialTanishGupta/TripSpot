import { useState, useMemo } from "react";
import { Search, Compass } from "lucide-react";
import DestinationGallery from "../components/DestinationGallery";
import { DESTINATION_GALLERY } from "../data/sampleData";

export default function ExplorePage() {
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState("All");

  const tags = useMemo(() => {
    const unique = [...new Set(DESTINATION_GALLERY.map((d) => d.tag))];
    return ["All", ...unique];
  }, []);

  const filtered = useMemo(() => {
    return DESTINATION_GALLERY.filter((d) => {
      const matchesTag = activeTag === "All" || d.tag === activeTag;
      const matchesQuery = d.name.toLowerCase().includes(query.toLowerCase());
      return matchesTag && matchesQuery;
    });
  }, [query, activeTag]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-7">
        <div className="flex items-center gap-2 text-emerald text-xs font-semibold uppercase tracking-wide mb-2">
          <Compass size={14} /> Explore
        </div>
        <h1 className="text-2xl font-bold text-ink">Where to next?</h1>
        <p className="text-mist text-sm mt-1.5">
          Curated destinations across India, picked to match how you like to
          travel.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mist-soft"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search destinations…"
            className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-line bg-surface text-ink text-sm outline-none focus:border-emerald transition-colors"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`shrink-0 px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTag === tag
                  ? "bg-emerald text-white"
                  : "bg-surface border border-line text-mist hover:text-ink"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="p-14 text-center text-mist-soft border border-dashed border-line rounded-2xl">
          No destinations match "{query}".
        </div>
      ) : (
        <DestinationGallery destinations={filtered} />
      )}
    </div>
  );
}
