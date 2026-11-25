"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  Maximize,
  Minimize,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const SKIP_SECONDS = 5;
const VOLUME_STEP = 0.05;
const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  const minutes = Math.floor(total / 60);
  const secs = total % 60;
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

export interface AppVideoPlayerProps {
  src: string;
  poster?: string | null;
  title: string;
  className?: string;
  videoClassName?: string;
  /** Large overlay play button before the first play (gallery lightbox). */
  overlayPlay?: boolean;
  overlayPlayLabel?: string;
  autoPlay?: boolean;
  playsInline?: boolean;
  preload?: "metadata" | "none" | "auto";
  /** When false, pause and reset (e.g. lightbox closed). */
  active?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
}

export function AppVideoPlayer({
  src,
  poster,
  title,
  className,
  videoClassName,
  overlayPlay = false,
  overlayPlayLabel,
  autoPlay = false,
  playsInline = true,
  preload = "metadata",
  active,
  onPlay,
  onPause,
  onEnded,
}: AppVideoPlayerProps) {
  const t = useTranslations("videoPlayer");
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const speedMenuRef = useRef<HTMLDivElement>(null);

  const [hasStarted, setHasStarted] = useState(autoPlay);
  const [playing, setPlaying] = useState(autoPlay);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [speedOpen, setSpeedOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const showOverlay = overlayPlay && !hasStarted;
  const showControls = !overlayPlay || hasStarted;

  useEffect(() => {
    if (active === undefined || active) return;
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.currentTime = 0;
    setHasStarted(false);
    setPlaying(false);
    setCurrentTime(0);
    setSpeedOpen(false);
  }, [active]);

  useEffect(() => {
    if (!autoPlay) return;
    const video = videoRef.current;
    if (!video) return;
    setHasStarted(true);
    void video.play().catch(() => {
      setPlaying(false);
    });
  }, [autoPlay, src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    const onLoadedMetadata = () => setDuration(video.duration);
    const onDurationChange = () => setDuration(video.duration);
    const onPlay = () => {
      setPlaying(true);
      setHasStarted(true);
    };
    const onPause = () => setPlaying(false);
    const onVolumeChange = () => {
      setVolume(video.muted ? 0 : video.volume);
      setMuted(video.muted);
    };

    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("durationchange", onDurationChange);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("volumechange", onVolumeChange);

    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("durationchange", onDurationChange);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("volumechange", onVolumeChange);
    };
  }, [src]);

  useEffect(() => {
    function onFullscreenChange() {
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    }
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  useEffect(() => {
    if (!speedOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (!speedMenuRef.current?.contains(event.target as Node)) {
        setSpeedOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [speedOpen]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function onKeyDown(event: KeyboardEvent) {
      if (overlayPlay && !hasStarted) return;
      if (!containerRef.current?.contains(document.activeElement)) return;

      const target = event.target as HTMLElement;
      const video = videoRef.current;
      if (!video) return;

      if (event.key === " " || event.code === "Space") {
        if (target instanceof HTMLButtonElement) return;
        event.preventDefault();
        event.stopPropagation();
        if (video.paused) {
          void video.play();
          focusPlayer();
        } else {
          video.pause();
        }
        return;
      }

      if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        event.preventDefault();
        event.stopPropagation();
        const current = video.muted ? 0 : video.volume;
        const delta = event.key === "ArrowUp" ? VOLUME_STEP : -VOLUME_STEP;
        const next = Math.min(1, Math.max(0, current + delta));
        video.volume = next;
        video.muted = next === 0;
        setVolume(next);
        setMuted(next === 0);
        return;
      }

      if (target instanceof HTMLInputElement && target.type === "range") return;

      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

      event.preventDefault();
      event.stopPropagation();

      const max = Number.isFinite(video.duration) ? video.duration : 0;
      const delta = event.key === "ArrowLeft" ? -SKIP_SECONDS : SKIP_SECONDS;
      const next = Math.min(max, Math.max(0, video.currentTime + delta));
      video.currentTime = next;
      setCurrentTime(next);
    }

    container.addEventListener("keydown", onKeyDown);
    return () => container.removeEventListener("keydown", onKeyDown);
  }, [overlayPlay, hasStarted]);

  function togglePlay() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play();
      focusPlayer();
    } else {
      video.pause();
    }
  }

  function handleOverlayPlay() {
    const video = videoRef.current;
    if (!video) return;
    setHasStarted(true);
    void video.play();
    focusPlayer();
  }

  function handleSeek(value: number) {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = value;
    setCurrentTime(value);
  }

  function skipBy(seconds: number) {
    const video = videoRef.current;
    if (!video) return;
    const max = Number.isFinite(video.duration) ? video.duration : 0;
    const next = Math.min(max, Math.max(0, video.currentTime + seconds));
    video.currentTime = next;
    setCurrentTime(next);
  }

  function focusPlayer() {
    videoRef.current?.focus({ preventScroll: true });
  }

  function handleVolumeChange(value: number) {
    const video = videoRef.current;
    if (!video) return;
    const nextVolume = Math.min(1, Math.max(0, value));
    video.volume = nextVolume;
    video.muted = nextVolume === 0;
    setVolume(nextVolume);
    setMuted(nextVolume === 0);
  }

  function toggleMute() {
    const video = videoRef.current;
    if (!video) return;
    if (video.muted || video.volume === 0) {
      video.muted = false;
      video.volume = volume > 0 ? volume : 0.5;
    } else {
      video.muted = true;
    }
    setMuted(video.muted);
    setVolume(video.muted ? 0 : video.volume);
  }

  function selectSpeed(rate: number) {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = rate;
    setPlaybackRate(rate);
    setSpeedOpen(false);
  }

  async function toggleFullscreen() {
    const container = containerRef.current;
    if (!container) return;
    if (document.fullscreenElement === container) {
      await document.exitFullscreen();
      return;
    }
    await container.requestFullscreen();
  }

  const progressMax = duration > 0 ? duration : 0;
  const progressFill =
    progressMax > 0 ? `${(Math.min(currentTime, progressMax) / progressMax) * 100}%` : "0%";
  const volumeFill = `${(muted ? 0 : volume) * 100}%`;
  const overlayLabel = overlayPlayLabel ?? t("play");

  function handleVideoClick() {
    if (showOverlay || !playing) return;
    videoRef.current?.pause();
  }

  return (
    <div
      ref={containerRef}
      className={cn("app-video-player group bg-pishnam-navy-900 relative", className)}
    >
      {/* Hosted / gallery videos do not ship with caption tracks yet. */}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        ref={videoRef}
        src={src}
        poster={poster ?? undefined}
        playsInline={playsInline}
        preload={preload}
        tabIndex={0}
        className={cn(
          "block w-full",
          showOverlay && "pointer-events-none",
          playing && "cursor-pointer",
          videoClassName,
        )}
        aria-label={title}
        onClick={handleVideoClick}
        onPlay={() => {
          setPlaying(true);
          setHasStarted(true);
          focusPlayer();
          onPlay?.();
        }}
        onPause={() => {
          setPlaying(false);
          onPause?.();
        }}
        onEnded={() => {
          setPlaying(false);
          onEnded?.();
        }}
      />

      {showOverlay && (
        <button
          type="button"
          onClick={handleOverlayPlay}
          className={cn(
            "absolute inset-0 z-[2] flex items-center justify-center",
            "focus-visible:outline-pishnam-gold-500 focus-visible:outline-2 focus-visible:outline-offset-2",
          )}
          aria-label={overlayLabel}
        >
          <span className="bg-pishnam-gold-500 text-pishnam-navy-900 flex size-16 items-center justify-center rounded-full shadow-xl ring-4 ring-black/20 transition-transform duration-200 hover:scale-105 sm:size-20">
            <Play className="size-7 fill-current sm:size-8" aria-hidden="true" />
          </span>
        </button>
      )}

      {showControls && (
        <div
          dir="ltr"
          className={cn(
            "absolute inset-x-0 bottom-0 z-[3]",
            "from-pishnam-navy-900/95 via-pishnam-navy-900/85 bg-gradient-to-t to-transparent",
            "px-3 pt-6 pb-2.5 sm:px-4",
          )}
        >
          <input
            type="range"
            min={0}
            max={progressMax}
            step={0.1}
            value={Math.min(currentTime, progressMax)}
            onChange={(event) => handleSeek(Number(event.target.value))}
            style={{ "--range-fill": progressFill } as CSSProperties}
            className="app-video-range w-full"
            aria-label={t("seek")}
            aria-valuemin={0}
            aria-valuemax={progressMax}
            aria-valuenow={currentTime}
            aria-valuetext={formatTime(currentTime)}
          />

          <div className="mt-2 flex items-center gap-1 sm:gap-2">
            <ControlButton label={playing ? t("pause") : t("play")} onClick={togglePlay}>
              {playing ? (
                <Pause className="size-4 fill-current" aria-hidden="true" />
              ) : (
                <Play className="size-4 fill-current" aria-hidden="true" />
              )}
            </ControlButton>

            <ControlButton label={t("skipBack")} onClick={() => skipBy(-SKIP_SECONDS)}>
              <SkipBack className="size-4" aria-hidden="true" />
            </ControlButton>

            <ControlButton label={t("skipForward")} onClick={() => skipBy(SKIP_SECONDS)}>
              <SkipForward className="size-4" aria-hidden="true" />
            </ControlButton>

            <span
              className="text-pishnam-off-white/80 min-w-[4.5rem] text-xs tabular-nums sm:text-sm"
              aria-live="off"
            >
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
              <ControlButton
                label={muted || volume === 0 ? t("unmute") : t("mute")}
                onClick={toggleMute}
              >
                {muted || volume === 0 ? (
                  <VolumeX className="size-4" aria-hidden="true" />
                ) : (
                  <Volume2 className="size-4" aria-hidden="true" />
                )}
              </ControlButton>

              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={muted ? 0 : volume}
                onChange={(event) => handleVolumeChange(Number(event.target.value))}
                style={{ "--range-fill": volumeFill } as CSSProperties}
                className="app-video-range app-video-range--volume hidden w-16 sm:block sm:w-20"
                aria-label={t("volume")}
              />

              <div ref={speedMenuRef} className="relative">
                <ControlButton
                  label={t("playbackSpeed")}
                  onClick={() => setSpeedOpen((open) => !open)}
                  className="min-w-9 px-2 text-xs font-semibold tabular-nums sm:text-sm"
                >
                  {t("speed", { rate: playbackRate })}
                </ControlButton>

                {speedOpen && (
                  <div
                    className="border-border/30 bg-pishnam-navy-900/95 absolute right-0 bottom-full mb-2 min-w-[5.5rem] rounded-lg border py-1 shadow-lg ring-1 ring-white/10 backdrop-blur-sm"
                    role="menu"
                  >
                    {PLAYBACK_SPEEDS.map((rate) => (
                      <button
                        key={rate}
                        type="button"
                        role="menuitem"
                        onClick={() => selectSpeed(rate)}
                        className={cn(
                          "text-pishnam-off-white hover:bg-pishnam-gold-500/15 hover:text-pishnam-gold-500",
                          "flex w-full cursor-pointer items-center justify-between px-3 py-1.5 text-sm tabular-nums transition-colors",
                          "focus-visible:outline-pishnam-gold-500 focus-visible:outline-2 focus-visible:-outline-offset-2",
                          rate === playbackRate && "text-pishnam-gold-500 font-semibold",
                        )}
                      >
                        {t("speed", { rate })}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <ControlButton
                label={isFullscreen ? t("exitFullscreen") : t("fullscreen")}
                onClick={() => void toggleFullscreen()}
              >
                {isFullscreen ? (
                  <Minimize className="size-4" aria-hidden="true" />
                ) : (
                  <Maximize className="size-4" aria-hidden="true" />
                )}
              </ControlButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ControlButton({
  label,
  onClick,
  children,
  className,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "text-pishnam-off-white/90 hover:text-pishnam-gold-500",
        "flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md transition-colors duration-200",
        "focus-visible:outline-pishnam-gold-500 focus-visible:outline-2 focus-visible:outline-offset-2",
        className,
      )}
    >
      {children}
    </button>
  );
}
