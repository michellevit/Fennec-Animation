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

  useEffect(() => {
    console.log("Controller mounted");

    const audio = audioRef.current;
    if (!audio) {
      console.log("Audio element not found");
      return;
    }

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
    };

    const setAudioDuration = () => {
      if (audio.duration && !duration) {
        setDuration(audio.duration);
      }
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", setAudioDuration);

    // Fallback if loadedmetadata doesn’t fire
    const durationCheck = setTimeout(setAudioDuration, 1500);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", setAudioDuration);
      clearTimeout(durationCheck);
    };
  }, [duration]);

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

  const reset = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;
    setIsPlaying(false);
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
