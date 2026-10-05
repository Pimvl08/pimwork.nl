"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import type { VideoAsset } from "@/content/media";
import type { Locale } from "@/i18n/config";
import { mediaCopy } from "./copy";
import { clamp, formatTime, playerKeyAction, sliderKeyTarget, timeFromPointer } from "./logic";
import styles from "./media.module.css";

interface VideoPlayerProps {
  lang: Locale;
  video: VideoAsset;
}

type WebkitVideo = HTMLVideoElement & { webkitEnterFullscreen?: () => void; webkitDisplayingFullscreen?: boolean };
type WebkitDocument = Document & { webkitFullscreenElement?: Element | null; webkitExitFullscreen?: () => void };
type WebkitElement = HTMLElement & { webkitRequestFullscreen?: () => void };

const SEEK = 5;

/**
 * Custom player for the silent screen recordings: arched play button, a real
 * slider for the position, time, mute and fullscreen, plus keyboard control.
 * Muted, inline and metadata-only until the visitor presses play.
 */
export function VideoPlayer({ lang, video }: VideoPlayerProps) {
  const t = mediaCopy[lang].player;
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<WebkitVideo>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const playRef = useRef<HTMLButtonElement>(null);
  const idleTimer = useRef<number | undefined>(undefined);
  const [paused, setPaused] = useState(true);
  const [muted, setMuted] = useState(true);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(video.durationSeconds);
  const [failed, setFailed] = useState(video.sources.length === 0);
  const [fullscreen, setFullscreen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [active, setActive] = useState(false);
  const title = video.title[lang];

  const toggle = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused || el.ended) void el.play().catch(() => setPaused(true));
    else el.pause();
  }, []);

  const seekTo = useCallback((time: number) => {
    const el = videoRef.current;
    if (!el) return;
    const max = Number.isFinite(el.duration) && el.duration > 0 ? el.duration : duration;
    el.currentTime = clamp(time, 0, max);
    setCurrent(el.currentTime);
  }, [duration]);

  const toggleMute = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = !el.muted;
    setMuted(el.muted);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const doc = document as WebkitDocument;
    const root = rootRef.current as WebkitElement | null;
    const el = videoRef.current;
    if (doc.fullscreenElement || doc.webkitFullscreenElement) {
      if (doc.exitFullscreen) void doc.exitFullscreen();
      else doc.webkitExitFullscreen?.();
      return;
    }
    if (root?.requestFullscreen) void root.requestFullscreen().catch(() => el?.webkitEnterFullscreen?.());
    else if (root?.webkitRequestFullscreen) root.webkitRequestFullscreen();
    // iOS Safari: only the video element itself can go fullscreen.
    else el?.webkitEnterFullscreen?.();
  }, []);

  useEffect(() => {
    const onChange = () => {
      const doc = document as WebkitDocument;
      setFullscreen(Boolean(doc.fullscreenElement ?? doc.webkitFullscreenElement));
    };
    document.addEventListener("fullscreenchange", onChange);
    document.addEventListener("webkitfullscreenchange", onChange);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      document.removeEventListener("webkitfullscreenchange", onChange);
      window.clearTimeout(idleTimer.current);
    };
  }, []);

  // Pause when the player scrolls out of view or the tab is hidden.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.every((entry) => !entry.isIntersecting)) videoRef.current?.pause();
    });
    observer.observe(root);
    const onVisibility = () => {
      if (document.hidden) videoRef.current?.pause();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const wake = () => {
    setActive(true);
    window.clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => setActive(false), 2400);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const target = event.target as HTMLElement;
    // Let buttons and links handle Space and Enter themselves.
    if ((event.key === " " || event.key === "Enter") && target.closest("button, a")) return;
    const action = playerKeyAction(event.key);
    if (!action) return;
    event.preventDefault();
    wake();
    if (action === "toggle") toggle();
    else if (action === "mute") toggleMute();
    else if (action === "fullscreen") toggleFullscreen();
    else if (action === "back") seekTo(current - SEEK);
    else seekTo(current + SEEK);
  };

  const pointerSeek = (clientX: number) => {
    const track = trackRef.current;
    if (!track) return;
    const box = track.getBoundingClientRect();
    seekTo(timeFromPointer(clientX, box.left, box.width, duration));
  };

  if (failed) {
    return (
      <div className={`${styles.player} relative`} style={{ aspectRatio: `${video.width} / ${video.height}` }}>
        <Image src={video.poster} alt="" fill sizes="(min-width: 56rem) 60vw, 100vw" className="object-cover opacity-40" />
        <div className="absolute inset-0 grid place-items-center p-6 text-center">
          <div className="flex flex-col items-center gap-3 bg-paper px-6 py-5">
            <p className="text-[length:var(--step-1)] italic text-ink">{t.unavailable}</p>
          </div>
        </div>
      </div>
    );
  }

  const progress = duration > 0 ? clamp(current / duration, 0, 1) : 0;

  return (
    <div
      ref={rootRef}
      className={styles.player}
      style={{ aspectRatio: `${video.width} / ${video.height}` }}
      role="group"
      aria-label={t.region(title)}
      data-paused={paused}
      data-active={active}
      onKeyDown={onKeyDown}
      onPointerMove={wake}
    >
      <video
        ref={videoRef}
        className={styles.video}
        poster={video.poster}
        width={video.width}
        height={video.height}
        preload="metadata"
        playsInline
        muted
        aria-label={title}
        onClick={toggle}
        onPlay={() => setPaused(false)}
        onPause={() => setPaused(true)}
        onEnded={() => setPaused(true)}
        onTimeUpdate={(event) => setCurrent(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => {
          const d = event.currentTarget.duration;
          if (Number.isFinite(d) && d > 0) setDuration(d);
        }}
        onVolumeChange={(event) => setMuted(event.currentTarget.muted)}
        onError={() => setFailed(true)}
      >
        {video.sources.map((source, i) => (
          <source
            key={source.src}
            src={source.src}
            type={source.type}
            // The last source failing means nothing could be played.
            onError={i === video.sources.length - 1 ? () => setFailed(true) : undefined}
          />
        ))}
      </video>

      {paused ? (
        <button
          type="button"
          className={styles.playArch}
          onClick={() => {
            toggle();
            // The arch disappears while playing: keep focus on the bar's play button.
            playRef.current?.focus({ preventScroll: true });
          }}
          aria-label={`${t.play}: ${title}`}>
          <Icon name="play" size={28} />
        </button>
      ) : null}

      <div className={styles.controls}>
        <button ref={playRef} type="button" className={styles.ctrl} onClick={toggle} aria-label={paused ? t.play : t.pause}>
          <Icon name={paused ? "play" : "pause"} size={20} />
        </button>
        <div
          ref={trackRef}
          className={styles.slider}
          role="slider"
          tabIndex={0}
          aria-label={t.position}
          aria-valuemin={0}
          aria-valuemax={Math.round(duration)}
          aria-valuenow={Math.round(current)}
          aria-valuetext={t.valueText(formatTime(current), formatTime(duration))}
          data-dragging={dragging}
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            setDragging(true);
            pointerSeek(event.clientX);
          }}
          onPointerMove={(event) => {
            if (dragging) pointerSeek(event.clientX);
          }}
          onPointerUp={(event) => {
            event.currentTarget.releasePointerCapture(event.pointerId);
            setDragging(false);
          }}
          onPointerCancel={() => setDragging(false)}
          onKeyDown={(event) => {
            const target = sliderKeyTarget(event.key, current, duration, SEEK);
            if (target === null) return;
            event.preventDefault();
            event.stopPropagation();
            seekTo(target);
          }}
        >
          <span className={styles.track} aria-hidden="true">
            <span className={styles.fill} style={{ transform: `scaleX(${progress})` }} />
          </span>
          <span className={styles.thumb} style={{ left: `${progress * 100}%` }} aria-hidden="true" />
        </div>
        <span className="data shrink-0 px-1 text-[length:var(--step--1)] text-ink-soft" aria-hidden="true">
          {formatTime(current)} / {formatTime(duration)}
        </span>
        <button type="button" className={styles.ctrl} onClick={toggleMute} aria-label={muted ? t.unmute : t.mute}>
          <Icon name={muted ? "mute" : "volume"} size={20} />
        </button>
        <button type="button" className={styles.ctrl} onClick={toggleFullscreen} aria-label={fullscreen ? t.exitFullscreen : t.fullscreen}>
          <Icon name={fullscreen ? "exitFullscreen" : "fullscreen"} size={20} />
        </button>
      </div>
    </div>
  );
}
