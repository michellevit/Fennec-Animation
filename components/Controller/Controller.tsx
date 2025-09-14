"use client";

import React, { useRef, useState, useEffect } from "react";
import { FaPlay, FaPause, FaRedo } from "react-icons/fa";
import "./Controller.css";
import Canvas from "@/components/Canvas/Canvas";

export default function Controller() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const FALLBACK_DURATION = 90; // seconds
  const [duration, setDuration] = useState<number>(FALLBACK_DURATION);
  const VISUAL_DELAY = 0.5;

  const reset = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    setIsPlaying(false);
    setCurrentTime(0);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const setRealDuration = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
    };
    const onEnded = () => reset();

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", setRealDuration);
    audio.addEventListener("durationchange", setRealDuration);
    audio.addEventListener("canplaythrough", setRealDuration);
    audio.addEventListener("ended", onEnded);

    audio.load();
    const durationCheck = setTimeout(setRealDuration, 800);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", setRealDuration);
      audio.removeEventListener("durationchange", setRealDuration);
      audio.removeEventListener("canplaythrough", setRealDuration);
      audio.removeEventListener("ended", onEnded);
      clearTimeout(durationCheck);
    };
  }, []);

  const formatTime = (seconds: number): string => {
    const mm = Math.floor(seconds / 60);
    const ss = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
    return `${mm}:${ss}`;
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audio.currentTime = Math.max(0, Math.min(duration, percent * duration));
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="controller">
      <audio ref={audioRef} preload="auto" style={{ display: "none" }}>
        <source src="/music/song.mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>

      <div className="animation-wrapper">
        <Canvas
          isPlaying={isPlaying}
          currentTime={Math.max(0, currentTime - VISUAL_DELAY)}
          duration={duration}
        />
      </div>

      <div className="controller-controls">
        <div className="controller-bar">
          <div className="controller-buttons">
            <button
              onClick={togglePlay}
              onMouseUp={(e) => (e.currentTarget as HTMLButtonElement).blur()}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <FaPause aria-hidden="true" />
              ) : (
                <FaPlay aria-hidden="true" />
              )}
            </button>
            <button
              onClick={reset}
              onMouseUp={(e) => (e.currentTarget as HTMLButtonElement).blur()}
              aria-label="Restart"
            >
              <FaRedo aria-hidden="true" />
            </button>
          </div>

          <div className="controller-track" onClick={handleProgressClick}>
            <div className="progress" style={{ width: `${progress}%` }} />
          </div>

          <div className="controller-time">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>
      </div>
    </div>
  );
}
