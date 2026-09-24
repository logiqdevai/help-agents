"use client";

import { useRef, useState, type FC } from "react";
import { DownloadIcon, PauseIcon, PlayIcon } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { useGetCallRecording } from "@/features/calls/hooks/use-calls";
import type { CallDetail } from "@/features/calls/interfaces/calls.interfaces";
import { formatClock, formatDate } from "@/lib/format";
import { notify } from "@/lib/notify";

interface RecordingPlayerProps {
  call: CallDetail;
}

const cardClass = "flex flex-wrap items-center gap-4 rounded-2xl bg-card px-5 py-4 ring-1 ring-foreground/10";

export const RecordingPlayer: FC<RecordingPlayerProps> = ({ call }) => {
  const { recording } = call;
  const recordingUrl = useGetCallRecording(call.id, recording.available);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState<number | null>(null);
  const [playbackFailed, setPlaybackFailed] = useState(false);

  if (!recording.available) {
    return (
      <div className={cardClass}>
        <p className="text-sm text-muted-foreground">
          {call.has_recording
            ? "The recording was removed after your retention period."
            : "There is no recording for this call."}
        </p>
      </div>
    );
  }

  if (recordingUrl.isPending) {
    return (
      <div className={cardClass} aria-busy="true">
        <Skeleton className="size-9 rounded-full" />
        <Skeleton className="h-6 flex-1" />
        <Skeleton className="h-7 w-24 rounded-full" />
      </div>
    );
  }

  if (recordingUrl.isError || playbackFailed) {
    return (
      <div className={cardClass}>
        <p className="flex-1 text-sm text-muted-foreground">
          {recordingUrl.isError ? recordingUrl.error.message : "The recording could not be played."}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setPlaybackFailed(false);
            recordingUrl.refetch();
          }}
        >
          Try again
        </Button>
      </div>
    );
  }

  const duration = audioDuration ?? recordingUrl.data.duration_seconds ?? recording.duration_seconds ?? 0;

  const togglePlayback = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch(() => notify.error("Could not play the recording"));
    } else {
      audio.pause();
    }
  };

  const seek = (value: number | readonly number[]) => {
    const audio = audioRef.current;
    const time = Array.isArray(value) ? value[0] : (value as number);
    if (!audio) return;
    audio.currentTime = time;
    setCurrentTime(time);
  };

  return (
    <div className={cardClass}>
      <audio
        ref={audioRef}
        src={recordingUrl.data.url}
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => {
          if (Number.isFinite(event.currentTarget.duration)) setAudioDuration(event.currentTarget.duration);
        }}
        onError={() => setPlaybackFailed(true)}
      />
      <Button
        size="icon-lg"
        onClick={togglePlayback}
        aria-label={isPlaying ? "Pause recording" : "Play recording"}
      >
        {isPlaying ? <PauseIcon /> : <PlayIcon />}
      </Button>
      <div className="order-3 min-w-0 basis-full sm:order-none sm:basis-0 sm:flex-1">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-x-3 text-sm">
          <span className="font-medium">Recording ({formatClock(recording.duration_seconds ?? duration)})</span>
          <span className="text-xs text-muted-foreground">
            {recording.expires_at ? `Kept until ${formatDate(recording.expires_at)}` : null}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-10 text-xs text-muted-foreground tabular-nums">{formatClock(currentTime)}</span>
          <Slider
            aria-label="Recording position"
            value={[Math.min(currentTime, duration)]}
            max={duration || 1}
            step={0.1}
            onValueChange={seek}
          />
          <span className="w-10 text-right text-xs text-muted-foreground tabular-nums">{formatClock(duration)}</span>
        </div>
      </div>
      <a
        href={recordingUrl.data.url}
        download={`call-${call.call_number}`}
        rel="noopener"
        className={buttonVariants({ variant: "outline", size: "sm" })}
      >
        <DownloadIcon data-icon="inline-start" /> Download
      </a>
    </div>
  );
};
