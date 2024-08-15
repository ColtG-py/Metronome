'use client';

import { useEffect, useState, useRef } from 'react';
import { Progress } from "@/components/ui/progress";
import { Toggle } from "@/components/ui/toggle";
import { Button } from "@/components/ui/button"


export default function Home() {
  const [audioContext, setAudioContext] = useState(null);
  const [soundBuffer1, setSoundBuffer1] = useState(null);
  const [soundBuffer2, setSoundBuffer2] = useState(null);
  const [soundBuffer3, setSoundBuffer3] = useState(null);
  const [nutmegBuffers, setNutmegBuffers] = useState([]);
  const [pianoBuffers, setPianoBuffers] = useState([]);
  const [activeNutmegIndex, setActiveNutmegIndex] = useState(null);
  const [activePianoIndex, setActivePianoIndex] = useState(null);
  const [nextBarTime, setNextBarTime] = useState(0);
  const [beat, setBeat] = useState(0);

  const beatIntervalRef = useRef();
  const sourcesRef = useRef({});

  // Page load
  useEffect(() => {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    setAudioContext(context);

    fetch('/piano_80.wav')
      .then(response => response.arrayBuffer())
      .then(data => context.decodeAudioData(data))
      .then(buffer => setSoundBuffer1(buffer));

    fetch('/upright_80.wav')
      .then(response => response.arrayBuffer())
      .then(data => context.decodeAudioData(data))
      .then(buffer => setSoundBuffer2(buffer));

    fetch('/drums_80.wav')
      .then(response => response.arrayBuffer())
      .then(data => context.decodeAudioData(data))
      .then(buffer => setSoundBuffer3(buffer));

    const nutmegTracks = [
      '/nutmeg/nutmeg_a_80.wav',
      '/nutmeg/nutmeg_aM3_80.wav',
      '/nutmeg/nutmeg_aMT_80.wav',
      '/nutmeg/nutmeg_fs_80.wav',
      '/nutmeg/nutmeg_fsm3_80.wav'
    ];

    const pianoTracks = [
      '/piano/piano_dM_80.wav',
      '/piano/piano_dM7oFs_80.wav',
      '/piano/piano_dM9oFs_80.wav'
    ];

    Promise.all(
      nutmegTracks.map(track => 
        fetch(track)
          .then(response => response.arrayBuffer())
          .then(data => context.decodeAudioData(data))
      )
    ).then(buffers => setNutmegBuffers(buffers));

    Promise.all(
      pianoTracks.map(track => 
        fetch(track)
          .then(response => response.arrayBuffer())
          .then(data => context.decodeAudioData(data))
      )
    ).then(buffers => setPianoBuffers(buffers));

    return () => {
      clearInterval(beatIntervalRef.current);
      Object.values(sourcesRef.current).forEach(source => source && source.stop());
    };
  }, []);

  const bpm = 80; // Beats per minute
  const beatsPerBar = 4;
  const secondsPerBeat = 60 / bpm;

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

  const toggleNutmegTrack = (index) => {
    const currentTime = audioContext.currentTime;
    const timeToNextBar = nextBarTime - currentTime;

    if (activeNutmegIndex === index) {
      // Stop the currently playing track at the next bar
      sourcesRef.current[`nutmeg${index}`]?.stop(nextBarTime);
      sourcesRef.current[`nutmeg${index}`] = null;
      setActiveNutmegIndex(null);
    } else {
      // Stop any currently playing nutmeg track at the next bar
      if (activeNutmegIndex !== null) {
        sourcesRef.current[`nutmeg${activeNutmegIndex}`]?.stop(nextBarTime);
        sourcesRef.current[`nutmeg${activeNutmegIndex}`] = null;
      }

      // Schedule the new track to start at the next bar
      playSound(nutmegBuffers[index], `nutmeg${index}`, nextBarTime);
      setActiveNutmegIndex(index);
    }
  };

  const togglePianoTrack = (index) => {
    const currentTime = audioContext.currentTime;
    const timeToNextBar = nextBarTime - currentTime;

    if (activePianoIndex === index) {
      // Stop the currently playing track at the next bar
      sourcesRef.current[`piano${index}`]?.stop(nextBarTime);
      sourcesRef.current[`piano${index}`] = null;
      setActivePianoIndex(null);
    } else {
      // Stop any currently playing nutmeg track at the next bar
      if (activePianoIndex !== null) {
        sourcesRef.current[`piano${activePianoIndex}`]?.stop(nextBarTime);
        sourcesRef.current[`piano${activePianoIndex}`] = null;
      }

      // Schedule the new track to start at the next bar
      playSound(pianoBuffers[index], `piano${index}`, nextBarTime);
      setActivePianoIndex(index);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="flex flex-row items-center">
      {['instr_2_a', 'instr_2_b', 'instr_2_c', 'instr_2_d', 'instr_2_e'].map((imageName, index) => (
          <Button
            variant="ghost"
            key={index}
            className={`${activeNutmegIndex === index ? 'ring-2 ' : ''}`}
            onClick={() => toggleNutmegTrack(index)}
          >
            <img src={`/img/${imageName}.png`} alt={imageName} className="h-10 w-10 object-contain" />
          </Button>
        ))}
      </div>
      <div className="flex flex-row items-center">
      {['instr_1_a', 'instr_1_b', 'instr_1_c'].map((imageName, index) => (
          <Button
            variant="ghost"
            key={index}
            className={`${activePianoIndex === index ? 'ring-2 ' : ''}`}
            onClick={() => togglePianoTrack(index)}
          >
            <img src={`/img/${imageName}.png`} alt={imageName} className="h-10 w-10 object-contain" />
          </Button>
        ))}
      </div>
      <Progress value={25 + beat * 25} className="w-[60%] mt-4" />
    </div>
  );
}
