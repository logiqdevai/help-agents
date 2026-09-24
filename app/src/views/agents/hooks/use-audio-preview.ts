import { useCallback, useEffect, useRef, useState } from "react";
import { notify } from "@/lib/notify";

/** Plays one audio sample at a time (voice previews); starting another one stops the first. */
export function useAudioPreview() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingUrl, setPlayingUrl] = useState<string | null>(null);

  const stop = useCallback(() => {
    audioRef.current?.pause();
    audioRef.current = null;
    setPlayingUrl(null);
  }, []);

  const toggle = useCallback(
    (url: string) => {
      if (audioRef.current && playingUrl === url) {
        stop();
        return;
      }
      stop();
      const audio = new Audio(url);
      audio.addEventListener("ended", () => setPlayingUrl(null));
      audioRef.current = audio;
      setPlayingUrl(url);
      audio.play().catch(() => {
        stop();
        notify.error("Could not play the preview", "Check your connection and try again.");
      });
    },
    [playingUrl, stop],
  );

  useEffect(() => stop, [stop]);

  return { playingUrl, toggle };
}
