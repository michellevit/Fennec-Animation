"use client";

// components/Controller.tsx
import React, { useRef, useState, useEffect } from "react";
import "./Controller.css";
import Canvas from "@/components/Canvas/Canvas";

export default function Controller() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Reset handler: pause, rewind, update state
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
    const onLoaded = () => {
      if (audio.duration && duration === 0) {
        setDuration(audio.duration);
      }
    };
    const onEnded = () => reset();

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("ended", onEnded);

    // Fallback for browsers that don't fire loadedmetadata reliably
    const durationCheck = setTimeout(onLoaded, 1500);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("ended", onEnded);
      clearTimeout(durationCheck);
    };
  }, [duration]);

  // Reset exactly at 90 seconds
  useEffect(() => {
    if (currentTime >= 90) {
      reset();
    }
  }, [currentTime]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      audio.play();
      setIsPlaying(true);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = clickX / rect.width;

    audio.currentTime = percent * duration;
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="controller">
      <audio ref={audioRef} preload="auto" style={{ display: "none" }}>
        <source src="/music/song.mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>

      {/* Animation */}
      <div className="animation-wrapper">
        <Canvas isPlaying={isPlaying} currentTime={currentTime} />
      </div>

      {/* Controls */}
      <div className="controller-controls">
        <div className="controller-bar">
          <div className="controller-buttons">
            <button onClick={togglePlay} title={isPlaying ? "Pause" : "Play"}>
              {isPlaying ? "⏸️" : "▶️"}
            </button>
            <button onClick={reset} title="Restart">
              🔄
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
