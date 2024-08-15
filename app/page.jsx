'use client';

import { useEffect, useState, useRef } from 'react';
import { Progress } from "@/components/ui/progress";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import TrackGroup from "@/components/TrackGroup";
import { trackConfigs } from "@/config/trackConfig";

export default function Home() {
  const scene = trackConfigs.scene_1; // Select the scene to use

  const [audioContext, setAudioContext] = useState(null);
  const [nutmegBuffers, setNutmegBuffers] = useState([]);
  const [pianoBuffers, setPianoBuffers] = useState([]);
  const [violaBuffers, setViolaBuffers] = useState([]);
  const [reeseBuffers, setReeseBuffers] = useState([]);
  const [activeNutmegIndex, setActiveNutmegIndex] = useState(null);
  const [activePianoIndex, setActivePianoIndex] = useState(null);
  const [activeViolaIndex, setActiveViolaIndex] = useState(null);
  const [activeReeseIndex, setActiveReeseIndex] = useState(null);
  const [nextBarTime, setNextBarTime] = useState(0);
  const [beat, setBeat] = useState(0);

  const beatIntervalRef = useRef();
  const sourcesRef = useRef({});

  // Page load
  useEffect(() => {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    setAudioContext(context);

    Promise.all(
      scene.nutmeg.tracks.map(track => 
        fetch(track)
          .then(response => response.arrayBuffer())
          .then(data => context.decodeAudioData(data))
      )
    ).then(buffers => setNutmegBuffers(buffers));

    Promise.all(
      scene.piano.tracks.map(track => 
        fetch(track)
          .then(response => response.arrayBuffer())
          .then(data => context.decodeAudioData(data))
      )
    ).then(buffers => setPianoBuffers(buffers));

    Promise.all(
      scene.viola.tracks.map(track => 
        fetch(track)
          .then(response => response.arrayBuffer())
          .then(data => context.decodeAudioData(data))
      )
    ).then(buffers => setViolaBuffers(buffers));

    Promise.all(
      scene.reese.tracks.map(track => 
        fetch(track)
          .then(response => response.arrayBuffer())
          .then(data => context.decodeAudioData(data))
      )
    ).then(buffers => setReeseBuffers(buffers));


    return () => {
      clearInterval(beatIntervalRef.current);
      Object.values(sourcesRef.current).forEach(source => source && source.stop());
    };
  }, [scene]);

  const { bpm, beatsPerBar, secondsPerBeat } = scene;

  // Sync the metronome with the audio context's current time
  useEffect(() => {
    if (audioContext && !beatIntervalRef.current) {
      // Initially set the next bar time
      setNextBarTime(audioContext.currentTime + (secondsPerBeat * beatsPerBar));
      beatIntervalRef.current = setInterval(() => {
        const now = audioContext.currentTime;
        setBeat(prevBeat => (prevBeat + 1) % beatsPerBar);
        if (now >= nextBarTime) {
          setNextBarTime(now + (secondsPerBeat * beatsPerBar));
        }
      }, secondsPerBeat * 1000); // Frequent checks to maintain accurate sync
    }
    return () => clearInterval(beatIntervalRef.current);
  }, [audioContext, beatsPerBar, secondsPerBeat]);

  const playSound = (buffer, sourceKey, startTime) => {
    if (!buffer) return;

    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.loop = true;

    // Start the sound at the specified time
    source.start(startTime);
    sourcesRef.current[sourceKey] = source;
  };

  const toggleTrack = (index, buffers, activeIndex, setActiveIndex, trackKeyPrefix) => {
    const currentTime = audioContext.currentTime;
    const timeToNextBar = nextBarTime - currentTime;

    if (activeIndex === index) {
      // Stop the currently playing track at the next bar
      sourcesRef.current[`${trackKeyPrefix}${index}`]?.stop(nextBarTime);
      sourcesRef.current[`${trackKeyPrefix}${index}`] = null;
      setActiveIndex(null);
    } else {
      // Stop any currently playing track at the next bar
      if (activeIndex !== null) {
        sourcesRef.current[`${trackKeyPrefix}${activeIndex}`]?.stop(nextBarTime);
        sourcesRef.current[`${trackKeyPrefix}${activeIndex}`] = null;
      }

      // Schedule the new track to start at the next bar
      playSound(buffers[index], `${trackKeyPrefix}${index}`, nextBarTime);
      setActiveIndex(index);
    }
  };

  return (
    <>
    <Header />
    <div className="flex flex-col items-center justify-center min-h-screen">
      <TrackGroup
        trackNames={scene.nutmeg.tracks}
        imagePrefix={scene.nutmeg.imagePrefix}
        buffers={nutmegBuffers}
        activeIndex={activeNutmegIndex}
        toggleTrack={(index) => toggleTrack(index, nutmegBuffers, activeNutmegIndex, setActiveNutmegIndex, 'nutmeg')}
      />
      <TrackGroup
        trackNames={scene.piano.tracks}
        imagePrefix={scene.piano.imagePrefix}
        buffers={pianoBuffers}
        activeIndex={activePianoIndex}
        toggleTrack={(index) => toggleTrack(index, pianoBuffers, activePianoIndex, setActivePianoIndex, 'piano')}
      />
      <TrackGroup
        trackNames={scene.viola.tracks}
        imagePrefix={scene.viola.imagePrefix}
        buffers={violaBuffers}
        activeIndex={activeViolaIndex}
        toggleTrack={(index) => toggleTrack(index, violaBuffers, activeViolaIndex, setActiveViolaIndex, 'viola')}
      />
      <TrackGroup
        trackNames={scene.reese.tracks}
        imagePrefix={scene.reese.imagePrefix}
        buffers={reeseBuffers}
        activeIndex={activeReeseIndex}
        toggleTrack={(index) => toggleTrack(index, reeseBuffers, activeReeseIndex, setActiveReeseIndex, 'reese')}
      />
    </div>
    <Footer />
    </>
  );
}
