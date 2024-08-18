'use client';

import { useEffect, useState, useRef } from 'react';
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import TrackGroup from "@/components/TrackGroup";
import { trackConfigs } from "@/config/trackConfig";
import { Button } from "@/components/ui/button";


const loadBuffers = async (audioContext, tracks) => {
  const buffers = await Promise.all(
    tracks.map(track => 
      fetch(track)
        .then(response => response.arrayBuffer())
        .then(data => audioContext.decodeAudioData(data))
    )
  );
  return buffers;
};

export default function Home() {
  const [selectedSceneIndex, setSelectedSceneIndex] = useState(0); // State to track selected scene
  const sceneKeys = Object.keys(trackConfigs); // Get scene keys dynamically
  const scene = trackConfigs[sceneKeys[selectedSceneIndex]]; // Select the current scene based on the index

  const [audioContext, setAudioContext] = useState(null);
  const [buffers, setBuffers] = useState({});
  const [activeIndices, setActiveIndices] = useState({});
  const [nextBarTime, setNextBarTime] = useState(0);
  const [beat, setBeat] = useState(0);

  const beatIntervalRef = useRef();
  const sourcesRef = useRef({});

  useEffect(() => {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    setAudioContext(context);

    const loadSceneBuffers = async () => {
      const loadedBuffers = {};

      for (const [trackType, trackData] of Object.entries(scene)) {
        if (trackData.tracks) {
          loadedBuffers[trackType] = await loadBuffers(context, trackData.tracks);
        }
      }

      setBuffers(loadedBuffers);
      setActiveIndices({}); // Reset active indices when the scene changes
    };

    loadSceneBuffers();

    return () => {
      clearInterval(beatIntervalRef.current);
      Object.values(sourcesRef.current).forEach(source => source && source.stop());
    };
  }, [scene]);

  const { bpm, beatsPerBar, secondsPerBeat } = scene;

  // Sync the metronome with the audio context's current time
  useEffect(() => {
    if (audioContext && !beatIntervalRef.current) {
      setNextBarTime(audioContext.currentTime + (secondsPerBeat * beatsPerBar));
      beatIntervalRef.current = setInterval(() => {
        const now = audioContext.currentTime;
        setBeat(prevBeat => (prevBeat + 1) % beatsPerBar);
        if (now >= nextBarTime) {
          setNextBarTime(now + (secondsPerBeat * beatsPerBar));
        }
      }, secondsPerBeat * 1000);
    }
    return () => clearInterval(beatIntervalRef.current);
  }, [audioContext, beatsPerBar, secondsPerBeat]);

  const playSound = (buffer, sourceKey, startTime) => {
    if (!buffer) return;

    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.loop = true;

    source.start(startTime);
    sourcesRef.current[sourceKey] = source;
  };

  const toggleTrack = (trackType, index) => {
    const currentTime = audioContext.currentTime;

    if (activeIndices[trackType] === index) {
      sourcesRef.current[`${trackType}${index}`]?.stop(nextBarTime);
      sourcesRef.current[`${trackType}${index}`] = null;
      setActiveIndices(prev => ({ ...prev, [trackType]: null }));
    } else {
      if (activeIndices[trackType] !== null) {
        sourcesRef.current[`${trackType}${activeIndices[trackType]}`]?.stop(nextBarTime);
        sourcesRef.current[`${trackType}${activeIndices[trackType]}`] = null;
      }

      playSound(buffers[trackType][index], `${trackType}${index}`, nextBarTime);
      setActiveIndices(prev => ({ ...prev, [trackType]: index }));
    }
  };

  return (
    <>
      <Header />
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="flex space-x-4 mb-4">
          {sceneKeys.map((sceneKey, index) => (
            <Button
              variant="ghost"
              key={index}
              className={`${index === selectedSceneIndex ? 'bg-gray-400' : 'bg-transparent'}`} // Gray background when selected
              onClick={() => setSelectedSceneIndex(index)}
            >
              <img 
                src={`/img/scene${index + 1}.png`} 
                alt={`Scene ${index + 1}`} 
                className="h-12 w-12 object-contain"
              />
            </Button>
          ))}
        </div>
        {Object.entries(scene).map(([trackType, trackData]) => (
          trackData.tracks && (
            <TrackGroup
              key={trackType}
              trackNames={trackData.tracks}
              imagePrefix={trackData.imagePrefix}
              buffers={buffers[trackType]}
              activeIndex={activeIndices[trackType]}
              toggleTrack={(index) => toggleTrack(trackType, index)}
            />
          )
        ))}
      </div>
      <Footer />
    </>
  );
}