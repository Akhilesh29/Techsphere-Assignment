import React, { useState, useRef, useEffect } from "react";
import { useRecoilValueLoadable, useRecoilState } from "recoil";
import { fetchSongs } from "./state/selectors";
import { currentSongState } from "./state/atoms";
import "./App.css";
import Blueprint from "./components/utils/Blueprint";
import logo from "../src/assets/img.png";
import avatar from "./assets/OIP (1).jpeg";
import SearchIcon from "@mui/icons-material/Search";
import AudioControls from "./components/AudioController";
import { ColorExtractor } from "react-color-extractor";
function darkenHexColor(hex, factor) {
  // Ensure hex color is in the format #RRGGBB
  if (hex.startsWith("#")) {
    hex = hex.slice(1);
  }

  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((char) => char + char)
      .join("");
  }

  // Convert hex color to RGB
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  // Apply darkness factor
  const newR = Math.max(0, Math.min(255, Math.floor(r * (1 - factor))));
  const newG = Math.max(0, Math.min(255, Math.floor(g * (1 - factor))));
  const newB = Math.max(0, Math.min(255, Math.floor(b * (1 - factor))));

  // Convert RGB back to hex
  const newHex =
    "#" +
    newR.toString(16).padStart(2, "0") +
    newG.toString(16).padStart(2, "0") +
    newB.toString(16).padStart(2, "0");

  return newHex;
}
const tabsData = ["For You", "Top Tracks", "Favorites", "Recently Played"];

function convertSecondsToMinutes(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
}

function App() {
  const tracksLoadable = useRecoilValueLoadable(fetchSongs);
  const [currId, setCurrId] = useState(null);
  const [currTab, setCurrTab] = useState(tabsData[0]);
  const [currentSong, setCurrentSong] = useRecoilState(currentSongState);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const [bgGradient, setBgGradient] = useState(
    "linear-gradient(to bottom left, #000000, #3A0202)"
  ); // State for background gradient

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    const currentIndex = tracksLoadable.contents.data.findIndex(
      (track) => track.id === currentSong?.id
    );
    if (
      currentIndex !== -1 &&
      currentIndex < tracksLoadable.contents.data.length - 1
    ) {
      const nextTrack = tracksLoadable.contents.data[currentIndex + 1];
      setCurrentSong(nextTrack);
      setCurrId(nextTrack.id);
      setIsPlaying(true);
    }
  };

  const handlePrevious = () => {
    const currentIndex = tracksLoadable.contents.data.findIndex(
      (track) => track.id === currentSong?.id
    );
    if (currentIndex > 0) {
      const previousTrack = tracksLoadable.contents.data[currentIndex - 1];
      setCurrentSong(previousTrack);
      setCurrId(previousTrack.id);
      setIsPlaying(true);
    }
  };

  const handleVolumeChange = (newVolume) => {
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const getColors = (colors) => {
    if (colors && colors.length > 0) {
      const dominantColor = colors[0];
      const gradient = `linear-gradient(to bottom left, ${darkenHexColor(
        dominantColor,
        0.7
      )}, #000000)`;
      setBgGradient(gradient);
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [currentSong, audioRef]);

  useEffect(() => {
    if (audioRef.current !== null && typeof audioRef.current !== "undefined") {
      if (isPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, audioRef]);

  return (
    <Blueprint
      color={{ backgroundImage: bgGradient }} // Set background gradient dynamically
      content1={
        <div className="hidden text-center h-full w-full md:flex flex-col justify-between">
          <div>
            <img className="p-3 invert-[100%]" src={logo} alt="Spotify LOGO" />
          </div>
          <div className="h-full text-left p-6 flex gap-2 flex-col text-xl font-semibold text-gray-400">
            {tabsData.map((tab, i) => (
              <div
                onClick={() => setCurrTab(tab)}
                key={i}
                style={{ cursor: "pointer" }}
                className={currTab === tab ? "text-white" : ""}
              >
                {tab}
              </div>
            ))}
          </div>
          <div className="text-left p-3">
            <img
              className="w-[4vmax] h-[4vmax] object-cover rounded-[50%] mx-4 mb-2"
              src={avatar}
              alt="avatar"
            />
          </div>
        </div>
      }
      content2={
        <div className=" h-[50%] md:h-full w-full md:flex flex-col justify-between">
          <div className="p-4 mt-3 font-bold text-3xl">{currTab}</div>
          <div className="relative text-center">
            <input
              type="text"
              className="p-3 rounded-lg bg-[#383737] w-[85%] pr-12 text-sm m-auto"
              placeholder="Search Song, Artist"
            />
            <div className="absolute top-[7px] right-[70px]">
              <SearchIcon className="text-xl" fontSize="medium" />
            </div>
          </div>
          {currTab === "For You" && (
            <div className="mt-4 w-full flex overflow-scroll flex-col justify-center">
              {tracksLoadable.state === "loading" ? (
                <div className="w-[100%] h-full text-center p-6">
                  Loading...
                </div>
              ) : tracksLoadable.state === "hasValue" ? (
                tracksLoadable.contents.data.map((track, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      setCurrId(track.id);
                      setCurrentSong(track);
                    }}
                    style={
                      currId === track.id ? { backgroundColor: "#464444" } : {}
                    }
                    className="p-2 rounded-md md:w-[90%] hover:bg-[#4e4c4c] justify-between cursor-pointer flex flex-row mt-4"
                  >
                    <div className="w-[15%]">
                      <img
                        id="songImage"
                        className="rounded-[50%]"
                        src={track.image[2].url}
                        alt=""
                      />
                    </div>
                    <div className="w-[75%] ml-2">
                      <div>
                        {" "}
                        {track?.name.length > 20
                          ? `${track?.name.slice(0, 20)}...`
                          : track.name}
                      </div>
                      <div className="text-sm text-gray-300">
                        {track?.artists.all[0].name.length > 20
                          ? `${track.artists.all[0].name.slice(0, 20)}...`
                          : track.artists.all[0].name}
                      </div>
                    </div>
                    <div className="w-[10%] text-gray-300">
                      {convertSecondsToMinutes(track.duration)}
                    </div>
                  </div>
                ))
              ) : (
                <div>Error</div>
              )}
            </div>
          )}
        </div>
      }
      content3={
        <div className=" h-[50%] md:h-full w-full flex-col md:flex-row flex items-center justify-center">
          <div className="md:hidden m-3 p-3 text-left text-3xl font-extrabold">
            Spotify
          </div>
          <div className="w-[90%] md:w-[60%] flex md:h-[80%] flex-col">
            <div className="h-[20%] p-2">
              <div className="text-3xl font-semibold" title={currentSong?.name}>
                {currentSong
                  ? currentSong.name.length > 22
                    ? `${currentSong.name.slice(0, 22)}...`
                    : currentSong.name
                  : "No song selected"}
              </div>
              <div className="text-gray-400 text-lg">
                {currentSong?.artists?.all[0]
                  ? currentSong.artists.all[0].name
                  : ""}
              </div>
            </div>
            <div className="h-full w-full overflow-hidden">
              <ColorExtractor getColors={getColors}>
                <img
                  className="object-contain w-full h-full rounded-md"
                  src={currentSong?.image[2].url}
                  alt=""
                />
              </ColorExtractor>
            </div>
            <div className="p-1">
              <audio
                ref={audioRef}
                src={currentSong?.downloadUrl[2].url}
              ></audio>
              <AudioControls
                isPlaying={isPlaying}
                onPlayPause={handlePlayPause}
                onNext={handleNext}
                onPrevious={handlePrevious}
                onVolumeChange={handleVolumeChange}
                audioRef={audioRef}
                currentSong={currentSong}
              />
            </div>
          </div>
        </div>
      }
    />
  );
}

export default App;
