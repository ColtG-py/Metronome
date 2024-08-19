'use client';

import { useEffect, useState, useRef } from 'react';
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import TrackGroup from "@/components/TrackGroup";
import { trackConfigs } from "@/config/trackConfig";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider"; // Assuming you have a Slider component
import { TypeAnimation } from "react-type-animation";
import { FaSpotify } from 'react-icons/fa'; // Import Spotify icon
import Snowfall from 'react-snowfall'

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
  const [volume, setVolume] = useState(80); // State to track the volume

  const beatIntervalRef = useRef();
  const sourcesRef = useRef({});

  const [audioContextInitialized, setAudioContextInitialized] = useState(false);
  const [reverbGain, setReverbGain] = useState(null); // State to hold the reverb gain node

  const createImpulseResponse = (context, duration, decay) => {
    const rate = context.sampleRate;
    const length = rate * duration;
    const impulse = context.createBuffer(2, length, rate);
    const impulseL = impulse.getChannelData(0);
    const impulseR = impulse.getChannelData(1);
  
    for (let i = 0; i < length; i++) {
      const n = decay ? Math.pow(1 - i / length, decay) : 1;
      impulseL[i] = (Math.random() * 2 - 1) * n;
      impulseR[i] = (Math.random() * 2 - 1) * n;
    }
  
    return impulse;
  };
  
  const initializeAudioContext = () => {
    if (!audioContextInitialized) {
      console.log("initializing audio context...");
      const context = new (window.AudioContext || window.webkitAudioContext)();
      const gainNode = context.createGain();
      const filterNode = context.createBiquadFilter();
      filterNode.type = 'lowpass';
      filterNode.frequency.value = 1000;
  
      const convolverNode = context.createConvolver();
      const reverbGainNode = context.createGain();
      const dryGainNode = context.createGain();
  
      const impulseResponse = createImpulseResponse(context, 2, 2.0); // 2 seconds duration, decay of 2.0
      convolverNode.buffer = impulseResponse;
  
      gainNode.connect(filterNode);
      filterNode.connect(dryGainNode);
      filterNode.connect(convolverNode);
      convolverNode.connect(reverbGainNode);
  
      dryGainNode.connect(context.destination);
      reverbGainNode.connect(context.destination);
  
      setAudioContext(context);
      setGainNode(gainNode);
      setFilterNode(filterNode);
      setReverbGain(reverbGainNode);
  
      const loadSceneBuffers = async () => {
        const loadedBuffers = {};
  
        for (const [trackType, trackData] of Object.entries(scene)) {
          if (trackData.tracks) {
            loadedBuffers[trackType] = await loadBuffers(context, trackData.tracks);
          }
        }
  
        setBuffers(loadedBuffers);
        setActiveIndices({});
      };
  
      loadSceneBuffers();
    }
    setAudioContextInitialized(true);
  };
  
  
  
  const handleReverbChange = (value) => {
    if (reverbGain) {
      reverbGain.gain.value = (value / 100) * 4; // Adjust the gain of the reverb effect
    }
  };
  
  useEffect(() => {
    if (!audioContextInitialized) {
      // Initialize the audio context and nodes
      const context = new (window.AudioContext || window.webkitAudioContext)();
      const gainNode = context.createGain();
      const filterNode = context.createBiquadFilter();
      filterNode.type = 'lowpass';
      filterNode.frequency.value = 1000;
  
      const convolverNode = context.createConvolver();
      const reverbGainNode = context.createGain();
      const dryGainNode = context.createGain();
  
      const impulseResponse = createImpulseResponse(context, 2, 2.0); // 2 seconds duration, decay of 2.0
      convolverNode.buffer = impulseResponse;
  
      // Connect the nodes
      gainNode.connect(filterNode);
      filterNode.connect(dryGainNode);
      filterNode.connect(convolverNode);
      convolverNode.connect(reverbGainNode);
  
      dryGainNode.connect(context.destination);
      reverbGainNode.connect(context.destination);
  
      // Set the nodes and context to state
      setAudioContext(context);
      setGainNode(gainNode);
      setFilterNode(filterNode);
      setReverbGain(reverbGainNode);
      setAudioContextInitialized(true);
  
      // Load the scene buffers
      const loadSceneBuffers = async () => {
        const loadedBuffers = {};
  
        for (const [trackType, trackData] of Object.entries(scene)) {
          if (trackData.tracks) {
            loadedBuffers[trackType] = await loadBuffers(context, trackData.tracks);
          }
        }
  
        setBuffers(loadedBuffers);
        setActiveIndices({});
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
    }
  }, [scene, audioContextInitialized]);
  
  

  useEffect(() => {
    if (audioContext) {
      document.body.style.backgroundColor = scene.backgroundColor;
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
  
    // Reset the audio context and reinitialize the nodes
    if (audioContext) {
      audioContext.close(); // Close the old audio context
      setAudioContextInitialized(false); // Mark the context as uninitialized
    }
  
    // Set the new selected scene
    setSelectedSceneIndex(index);
  };
  
  const handleVolumeChange = (value) => {
    setVolume(value); // Update the volume state
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
      <Snowfall
        // Changes the snowflake color
        color="red"
        // Controls the number of snowflakes that are created based on volume (max 200)
        snowflakeCount={Math.floor((volume / 100) * 200)}
      />
      <Header />
      {!audioContextInitialized ? (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Button onClick={initializeAudioContext} className="p-4 bg-blue-500 text-white rounded">
          <TypeAnimation 
              sequence={[
                  "tap to start",
                  3000,
                  "tap to create",
                  3000,
                  "tap to play"
              ]}
              repeat={0}
          />
        </Button>
      </div>
    ) : (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-white">band select</p>
        <div className="flex space-x-12 mb-16 mt-4">
          {sceneKeys.map((sceneKey, index) => (
            <Button
              variant="ghost"
              key={index}
              className={`${index === selectedSceneIndex ? 'bg-gray-400 p-0' : 'bg-transparent p-0'}`}
              onClick={() => handleSceneChange(index)}
            >
              <img 
                src={`/img/scene${index + 1}.png`} 
                alt={`Scene ${index + 1}`} 
                className="h-8 w-8 object-contain"
              />
            </Button>
          ))}
        </div>

        <div className="justify-center space-y-6">
          {Object.entries(scene).map(([trackType, trackData], rowIndex) => (
            trackData.tracks && (
              <TrackGroup
                key={trackType}
                trackNames={trackData.tracks}
                imagePrefix={trackData.imagePrefix}
                buffers={buffers[trackType]}
                activeIndex={activeIndices[trackType]}
                toggleTrack={(index) => toggleTrack(trackType, index)}
                rowIndex={rowIndex + 1}  // Pass the global row index here (1-based)
              />
            )
          ))}
        </div>
        <div className="w-1/4 mt-8">
          <p className="text-white">vol.</p>
          <Slider defaultValue={[80]} max={100} step={1} onValueChange={handleVolumeChange} />
        </div>
        <div className="w-1/4 mt-4">
        <p className="text-white">fil.</p>
          <Slider defaultValue={[1000]} max={5000} step={10} onValueChange={handleFilterChange} />
        </div>
        <div className="w-1/4 mt-4">
          <p className="text-white">rev.</p>
          <Slider defaultValue={[10]} max={100} step={1} onValueChange={handleReverbChange} />
        </div>
        {scene.featuredArtist && (
          <div className="mt-8 mb-8 flex items-center text-white">
            <a 
              href={scene.featuredArtist.spotifyLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center space-x-2 hover:underline"
            >
              <FaSpotify size={24} /> {/* Spotify icon */}
              <span>{scene.featuredArtist.name}</span>
            </a>
          </div>
        )}
      </div>
    )}
      <Footer />
    </>
  );
}
