'use client';

import { useEffect, useState, useRef } from 'react';
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import TrackGroup from "@/components/TrackGroup";
import { trackConfigs } from "@/config/trackConfig";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider"; // Assuming you have a Slider component

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
  const [gainNode, setGainNode] = useState(null); // State to hold the gain node
  const [filterNode, setFilterNode] = useState(null); // State to hold the filter node
  const [buffers, setBuffers] = useState({});
  const [activeIndices, setActiveIndices] = useState({});
  const [nextBarTime, setNextBarTime] = useState(0);
  const [beat, setBeat] = useState(0);

  const beatIntervalRef = useRef();
  const sourcesRef = useRef({});

  useEffect(() => {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    const gainNode = context.createGain();
    const filterNode = context.createBiquadFilter(); // Create the filter node
    filterNode.type = 'lowpass'; // Set to low-pass filter
    filterNode.frequency.value = 1000; // Default cutoff frequency
  
    gainNode.connect(filterNode); // Connect gain node to filter node
    filterNode.connect(context.destination); // Connect filter node to destination
  
    setAudioContext(context);
    setGainNode(gainNode);
    setFilterNode(filterNode);
  
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
  
      Object.values(sourcesRef.current).forEach(source => {
        if (source && typeof source.stop === 'function') {
          try {
            source.stop();
          } catch (e) {
            console.warn(`Failed to stop source: ${e.message}`);
          }
        }
      });
    };
  }, [scene]);
  

  useEffect(() => {
    if (audioContext) {
      // Clear any existing intervals
      if (beatIntervalRef.current) {
        clearInterval(beatIntervalRef.current);
      }

      // Initialize nextBarTime and start the metronome
      const initializeMetronome = () => {
        setNextBarTime(audioContext.currentTime + (scene.secondsPerBeat * scene.beatsPerBar));
        beatIntervalRef.current = setInterval(() => {
          const now = audioContext.currentTime;
          setBeat(prevBeat => (prevBeat + 1) % scene.beatsPerBar);
          if (now >= nextBarTime) {
            setNextBarTime(now + (scene.secondsPerBeat * scene.beatsPerBar));
          }
        }, scene.secondsPerBeat * 1000);
      };

      initializeMetronome();

      return () => {
        clearInterval(beatIntervalRef.current);
      };
    }
  }, [audioContext, scene, nextBarTime]);

  const playSound = (buffer, sourceKey, startTime, fadeTime = 0.05) => {
    if (!buffer) return;
  
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    const gain = audioContext.createGain();
    gain.gain.setValueAtTime(0, startTime); // Ensure the track starts with volume at 0
    gain.gain.linearRampToValueAtTime(1, startTime + fadeTime); // Smoothly ramp up the volume
    source.connect(gain);
    gain.connect(gainNode); // Connect to global gain control
    source.loop = true;
  
    source.start(startTime); // Start playing at the next bar
    sourcesRef.current[sourceKey] = source;
  
    // Store gain for possible future fade out
    sourcesRef.current[`${sourceKey}-gain`] = gain;
  };
  
  
  const stopAllTracks = () => {
    Object.keys(sourcesRef.current).forEach(sourceKey => {
      const source = sourcesRef.current[sourceKey];
      if (source) {
        try {
          const gain = sourcesRef.current[`${sourceKey}-gain`];
          if (gain) {
            gain.gain.setValueAtTime(gain.gain.value, audioContext.currentTime);
            gain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.05); // Fade out before stopping
          }
          source.stop(audioContext.currentTime + 0.1); // Stop slightly after the fade-out
          sourcesRef.current[sourceKey] = null;
        } catch (e) {
          console.warn(`Failed to stop track ${sourceKey}: ${e.message}`);
        }
      }
    });
    setActiveIndices({});
  };
  

  const toggleTrack = (trackType, index) => {
    const currentTime = audioContext.currentTime;
  
    if (activeIndices[trackType] === index) {
      // If the selected track is already playing, fade it out and stop it at the next bar
      const gain = sourcesRef.current[`${trackType}${index}-gain`];
      if (gain) {
        gain.gain.setValueAtTime(gain.gain.value, currentTime);
        gain.gain.linearRampToValueAtTime(0, nextBarTime); // Fade out to zero at the next bar
      }
      sourcesRef.current[`${trackType}${index}`]?.stop(nextBarTime + 0.05); // Stop after fade out completes
      sourcesRef.current[`${trackType}${index}`] = null;
      setActiveIndices(prev => ({ ...prev, [trackType]: null }));
    } else {
      if (activeIndices[trackType] !== null) {
        // Fade out the currently playing track at the next bar
        const previousGain = sourcesRef.current[`${trackType}${activeIndices[trackType]}-gain`];
        if (previousGain) {
          previousGain.gain.setValueAtTime(previousGain.gain.value, currentTime);
          previousGain.gain.linearRampToValueAtTime(0, nextBarTime); // Fade out the old track at the next bar
        }
        sourcesRef.current[`${trackType}${activeIndices[trackType]}`]?.stop(nextBarTime + 0.05); // Stop after fade out
        sourcesRef.current[`${trackType}${activeIndices[trackType]}`] = null;
      }
  
      // Ensure the new track starts exactly at the next bar and fades in smoothly
      playSound(buffers[trackType][index], `${trackType}${index}`, nextBarTime);
      setActiveIndices(prev => ({ ...prev, [trackType]: index }));
    }
  };
  
  

  const handleSceneChange = (index) => {
    stopAllTracks(); // Stop all tracks before switching scenes
    setSelectedSceneIndex(index);
  };

  const handleVolumeChange = (value) => {
    if (gainNode) {
      gainNode.gain.value = value / 100; // Set the gain node's value based on the slider's position
    }
  };

  const handleFilterChange = (value) => {
    if (filterNode) {
      filterNode.frequency.value = value; // Set the cutoff frequency for the low-pass filter
    }
  };

  return (
    <>
      <Header />
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="flex space-x-12 mb-16">
          {sceneKeys.map((sceneKey, index) => (
            <Button
              variant="ghost"
              key={index}
              className={`${index === selectedSceneIndex ? 'bg-gray-400 p-0' : 'bg-transparent p-0'}`} // Gray background when selected
              onClick={() => handleSceneChange(index)}
            >
              <img 
                src={`/img/scene${index + 1}.png`} 
                alt={`Scene ${index + 1}`} 
                className="h-12 w-12 object-contain"
              />
            </Button>
          ))}
        </div>
        <div className="justify-center space-y-6">
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
        <div className="w-1/2 mt-8">
          <Slider defaultValue={[50]} max={100} step={1} onValueChange={handleVolumeChange} />
        </div>
        <div className="w-1/2 mt-4">
          <Slider defaultValue={[1000]} max={5000} step={10} onValueChange={handleFilterChange} /> {/* Low-pass filter */}
        </div>
      </div>
      <Footer />
    </>
  );
}
