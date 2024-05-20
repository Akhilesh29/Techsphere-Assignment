import React, { useState, useEffect } from "react";
import {
  FaPlay,
  FaPause,
  FaForward,
  FaBackward,
  FaVolumeUp,
  FaVolumeMute,
  FaEllipsisH,
} from "react-icons/fa";

const AudioControls = ({
  currentSong,
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  onVolumeChange,
  audioRef,
}) => {
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener("timeupdate", handleTimeUpdate);
    }
  }, [audioRef]);

  useEffect(() => {
    setProgress(0); // Reset progress when currentSong changes
  }, [currentSong]);

  const handleTimeUpdate = () => {
    const currentTime = audioRef.current.currentTime;
    const duration = audioRef.current.duration;
    const progress = (currentTime / duration) * 100;
    setProgress(progress);
  };

  const handleProgressClick = (e) => {
    const progressBar = e.currentTarget;
    const clickPosition = e.nativeEvent.offsetX;
    const progressBarWidth = progressBar.offsetWidth;
    const clickProgress = (clickPosition / progressBarWidth) * 100;
    const newTime = (clickProgress / 100) * audioRef.current.duration;
    audioRef.current.currentTime = newTime;
    setProgress(clickProgress);
  };

  const handleVolumeToggle = () => {
    setIsMuted(!isMuted);
    const newVolume = isMuted ? 1 : 0; // If muted, set volume to 1 (unmuted), otherwise set volume to 0 (muted)
    onVolumeChange(newVolume);
  };

  const handleDownload = () => {
    const anchor = document.createElement("a");
    anchor.href = currentSong?.downloadUrl[2].url; // Provide the URL to the song file
    anchor.download = `${currentSong.name}.mp3`; // Set the filename for the downloaded file
    anchor.click();
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto p-4 bg-transparent rounded-lg ">
      <div
        className="relative w-full h-1 bg-gray-600 rounded-full cursor-pointer"
        onClick={handleProgressClick}
      >
        <div
          className="absolute top-0 left-0 h-1 bg-white rounded-full"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className="flex items-center justify-between w-full mt-4">
        <button className="text-xl text-white" onClick={handleDownload}>
          <FaEllipsisH />
        </button>
        <button onClick={onPrevious} className="text-2xl text-white">
          <FaBackward />
        </button>
        <button onClick={onPlayPause} className="text-4xl text-white mx-4">
          {isPlaying ? <FaPause /> : <FaPlay />}
        </button>
        <button onClick={onNext} className="text-2xl text-white">
          <FaForward />
        </button>
        <button onClick={handleVolumeToggle} className="text-2xl text-white">
          {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
        </button>
      </div>
    </div>
  );
};

export default AudioControls;
