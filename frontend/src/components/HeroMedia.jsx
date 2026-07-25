import { useState, useEffect, useRef } from 'react';

/**
 * Looks for /hero-video.mp4 in the public folder. If it exists and can play,
 * it's used as a real cinematic video background. If it's missing (which it
 * will be until you add one - see README), this silently falls back to a
 * slow-zooming, cross-fading photo carousel instead, so the app never shows
 * a broken video icon.
 */
export function HeroMedia({ photos, className = '' }) {
  const [videoAvailable, setVideoAvailable] = useState(null); // null = checking
  const [index, setIndex] = useState(0);
  const videoRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/hero-video.mp4', { method: 'HEAD' })
      .then((res) => { if (!cancelled) setVideoAvailable(res.ok); })
      .catch(() => { if (!cancelled) setVideoAvailable(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (videoAvailable) return undefined;
    const id = setInterval(() => setIndex((i) => (i + 1) % photos.length), 6000);
    return () => clearInterval(id);
  }, [videoAvailable, photos.length]);

  if (videoAvailable) {
    return (
      <video
        ref={videoRef}
        className={`absolute inset-0 w-full h-full object-cover ${className}`}
        src="/hero-video.mp4"
        autoPlay
        muted
        loop
        playsInline
        onError={() => setVideoAvailable(false)}
      />
    );
  }

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {photos.map((src, i) => (
        <div
          key={src}
          className="absolute inset-0 transition-opacity duration-[1400ms]"
          style={{ opacity: i === index ? 1 : 0 }}
        >
          <img
            src={src}
            alt=""
            className="w-full h-full object-cover animate-kenburns"
            loading={i === 0 ? 'eager' : 'lazy'}
          />
        </div>
      ))}
    </div>
  );
}
