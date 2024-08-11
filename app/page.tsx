'use client';

import { useEffect, useState, useRef } from 'react';
import { Progress } from "@/components/ui/progress"
import { Toggle } from "@/components/ui/toggle"


export default function Home() {
  const [audioContext, setAudioContext] = useState(null);
  const [soundBuffer1, setSoundBuffer1] = useState(null);
  const [soundBuffer2, setSoundBuffer2] = useState(null);
  const [soundBuffer3, setSoundBuffer3] = useState(null);
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

    return () => {
      clearInterval(beatIntervalRef.current);
      Object.values(sourcesRef.current).forEach(source => source && source.stop());
    };
  }, []);

  const bpm = 80; // Beats per minute
  const beatsPerBar = 4;
  const secondsPerBeat = 60 / bpm;

  // any audio update
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

  const playSound = (buffer, sourceKey) => {
    if (!buffer) return;
  
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.loop = true;
  
    // Calculate the correct start time
    let startTime;
    if (beat === 0) {
      // If currently at beat 1, start immediately at the next bar time
      startTime = nextBarTime;
    } else {
      // Calculate the time to the next bar's first beat
      const timeToNextBar = nextBarTime - audioContext.currentTime;
      const beatsLeftInBar = beatsPerBar - beat;
      const additionalTime = beatsLeftInBar * secondsPerBeat;
      startTime = audioContext.currentTime + timeToNextBar + additionalTime;
    }
  
    console.log('Starting at: ', startTime, 'Current Time: ', audioContext.currentTime);
    source.start(startTime);
    sourcesRef.current[sourceKey] = source;
  };
  

  const toggleSound = (buffer, sourceKey) => {
    const currentlyPlaying = sourcesRef.current[sourceKey];
    if (currentlyPlaying) {
      currentlyPlaying.stop();
      sourcesRef.current[sourceKey] = null;
    } else {
      if (audioContext.currentTime >= nextBarTime - secondsPerBeat) {
        setNextBarTime(audioContext.currentTime + secondsPerBeat);
      }
      playSound(buffer, sourceKey);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
       <div className="flex items-center justify-center w-[60%] space-x-16 mb-2">
        <Toggle className="text-4xl" onClick={() => toggleSound(soundBuffer1, 'sound1')} >🎹</Toggle>
        <Toggle className="text-4xl" onClick={() => toggleSound(soundBuffer2, 'sound2')} >🎻</Toggle>
        <Toggle className="text-4xl" onClick={() => toggleSound(soundBuffer3, 'sound3')} >🥁</Toggle>
      </div>
      <Progress value={25 + beat * 25} className="w-[60%] mt-2"/>
    </div>
  );
  
}
