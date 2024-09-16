'use client';

import { useEffect, useState, useRef } from 'react';
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import TrackGroup from "@/components/TrackGroup";
import { trackConfigs } from "@/config/trackConfig";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { TypeAnimation } from "react-type-animation";
import { FaSpotify } from 'react-icons/fa';
import Snowfall from 'react-snowfall';

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
  const [selectedSceneIndex, setSelectedSceneIndex] = useState(0);
  const sceneKeys = Object.keys(trackConfigs);
  const scene = trackConfigs[sceneKeys[selectedSceneIndex]];

  const [audioContext, setAudioContext] = useState(null);
  const [gainNode, setGainNode] = useState(null);
  const [filterNode, setFilterNode] = useState(null);
  const [buffers, setBuffers] = useState({});
  const [activeIndices, setActiveIndices] = useState({});
  const [nextBarTime, setNextBarTime] = useState(0);
  const nextBarTimeRef = useRef(0);
  const [beat, setBeat] = useState(0);
  const [volume, setVolume] = useState(80);
  const [playbackRate, setPlaybackRate] = useState(1); // New state for playback speed

  const sourcesRef = useRef({});
  const animationFrameRef = useRef(null); // Ref for managing requestAnimationFrame

  const [audioContextInitialized, setAudioContextInitialized] = useState(false);
  const [reverbGain, setReverbGain] = useState(null);

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
  
      const impulseResponse = createImpulseResponse(context, 2, 2.0);
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
      reverbGain.gain.value = (value / 100) * 4;
    }
  };

  useEffect(() => {
    if (!audioContextInitialized) {
      const context = new (window.AudioContext || window.webkitAudioContext)();
      const gainNode = context.createGain();
      const filterNode = context.createBiquadFilter();
      filterNode.type = 'lowpass';
      filterNode.frequency.value = 1000;
  
      const convolverNode = context.createConvolver();
      const reverbGainNode = context.createGain();
      const dryGainNode = context.createGain();
  
      const impulseResponse = createImpulseResponse(context, 2, 2.0);
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
      setAudioContextInitialized(true);
  
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
        cancelAnimationFrame(animationFrameRef.current);
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
  
      nextBarTimeRef.current = audioContext.currentTime + (scene.secondsPerBeat * scene.beatsPerBar) / playbackRate;
      const metronome = () => {
        const now = audioContext.currentTime;
        if (now >= nextBarTimeRef.current) {
          nextBarTimeRef.current += (scene.secondsPerBeat * scene.beatsPerBar) / playbackRate;
          console.log(`Next bar time updated to: ${nextBarTimeRef.current}`);
        }
        animationFrameRef.current = requestAnimationFrame(metronome);
      };
      animationFrameRef.current = requestAnimationFrame(metronome);
  
      return () => {
        cancelAnimationFrame(animationFrameRef.current);
      };
    }
  }, [audioContext, scene, playbackRate]);

  const playSound = (buffer, sourceKey, startTime, fadeTime = 0.05) => {
    if (!buffer) return;
  
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    const gain = audioContext.createGain();
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(1, startTime + fadeTime);
    source.connect(gain);
    gain.connect(gainNode);
    source.loop = true;
    source.playbackRate.setValueAtTime(playbackRate, startTime); // Set playback rate
  
    source.start(startTime);
    console.log(`Playing sound: ${sourceKey} at time: ${startTime}`);
    sourcesRef.current[sourceKey] = source;
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
            gain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.05);
          }
          source.stop(audioContext.currentTime + 0.1);
          console.log(`Stopping sound: ${sourceKey} at time: ${audioContext.currentTime}`);
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
      const gain = sourcesRef.current[`${trackType}${index}-gain`];
      if (gain) {
        gain.gain.setValueAtTime(gain.gain.value, currentTime);
        gain.gain.linearRampToValueAtTime(0, nextBarTimeRef.current);
      }
      sourcesRef.current[`${trackType}${index}`]?.stop(nextBarTimeRef.current + 0.05);
      sourcesRef.current[`${trackType}${index}`] = null;
      setActiveIndices(prev => ({ ...prev, [trackType]: null }));
    } else {
      if (activeIndices[trackType] !== null) {
        const previousGain = sourcesRef.current[`${trackType}${activeIndices[trackType]}-gain`];
        if (previousGain) {
          previousGain.gain.setValueAtTime(previousGain.gain.value, currentTime);
          previousGain.gain.linearRampToValueAtTime(0, nextBarTimeRef.current);
        }
        sourcesRef.current[`${trackType}${activeIndices[trackType]}`]?.stop(nextBarTimeRef.current + 0.05);
        sourcesRef.current[`${trackType}${activeIndices[trackType]}`] = null;
      }
  
      playSound(buffers[trackType][index], `${trackType}${index}`, nextBarTimeRef.current);
      setActiveIndices(prev => ({ ...prev, [trackType]: index }));
    }
  };

  const handleSceneChange = (index) => {
    stopAllTracks();
    if (audioContext) {
      audioContext.close();
      setAudioContextInitialized(false);
    }
    setSelectedSceneIndex(index);
  };

  const handleVolumeChange = (value) => {
    setVolume(value);
    if (gainNode) {
      gainNode.gain.value = value / 100;
    }
  };

  const handleFilterChange = (value) => {
    if (filterNode) {
      filterNode.frequency.value = value;
    }
  };

  const handlePlaybackRateChange = (value) => {
    setPlaybackRate(value);
    // Update the playback rate of currently playing tracks
    Object.keys(sourcesRef.current).forEach(sourceKey => {
      const source = sourcesRef.current[sourceKey];
      if (source && source.playbackRate) {
        try {
          source.playbackRate.setValueAtTime(value, audioContext.currentTime);
          console.log(`[PlaybackRateChange] Track: ${sourceKey}, New Rate: ${value}`);
        } catch (error) {
          console.warn(`Failed to update playback rate for ${sourceKey}: ${error.message}`);
        }
      }
    });
  };

  return (
    <>
      <Snowfall
        color="red"
        snowflakeCount={Math.floor((volume / 100) * 200)}
        speed={[Math.max(0.1, 0.5 * playbackRate), Math.min(15.0, 3.0 * playbackRate)]}
        wind={
          reverbGain 
            ? [Math.max(-1.5, 0.5 * reverbGain.gain.value), Math.min(15.0, 3.0 * reverbGain.gain.value)] 
            : [0, 0]  // Default or fallback values if reverbGain is not initialized
        }
        radius={
          filterNode 
            ? [Math.max(1.0, 0.001 * filterNode.frequency.value), Math.min(1.25, 0.003 * filterNode.frequency.value)] 
            : [1, 1]  // Default or fallback values if filterNode is not initialized
        }
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
          <p className="text-white ">band select</p>
          <div className="flex justify-center mt-4 mb-8">
            <div className="w-full max-w-screen-md p-4 border-2 border-white rounded-lg bg-red-500 bg-opacity-10">
              <div className="flex space-x-12">
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
            </div>
          </div>
          <p className="text-white">track select</p>
          <div className="flex justify-center mt-4">
            <div className="w-full p-4 border-2 border-white rounded-lg bg-white bg-opacity-10">
              <div className="justify-center space-y-4">
                {Object.entries(scene).map(([trackType, trackData], rowIndex) => (
                  trackData.tracks && (
                    <TrackGroup
                      key={trackType}
                      trackNames={trackData.tracks}
                      imagePrefix={trackData.imagePrefix}
                      buffers={buffers[trackType]}
                      activeIndex={activeIndices[trackType]}
                      toggleTrack={(index) => toggleTrack(trackType, index)}
                      rowIndex={rowIndex + 1}
                    />
                  )
                ))}
              </div>
            </div>
          </div>

          <p className="text-white mt-8">f/x</p>
          <div className="w-11/12 sm:w-1/4 mt-4 p-4 border-2 border-white rounded-lg bg-white bg-opacity-10">
            <div className="mb-4">
              <p className="text-white">vol.</p>
              <Slider defaultValue={[40]} max={100} step={1} onValueChange={handleVolumeChange} />
            </div>
            <div className="mb-4">
              <p className="text-white">fil.</p>
              <Slider defaultValue={[2500]} max={5000} step={10} onValueChange={handleFilterChange} />
            </div>
            <div className="mb-4">
              <p className="text-white">rev.</p>
              <Slider defaultValue={[15]} max={100} step={1} onValueChange={handleReverbChange} />
            </div>
            <div>
              <p className="text-white">s/p.</p>
              <Slider defaultValue={[1]} min={0.5} max={2} step={0.01} onValueChange={handlePlaybackRateChange} />
            </div>
          </div>



          {scene.featuredArtist && (
            <div className="mt-8 mb-8 flex items-center text-white">
              <a 
                href={scene.featuredArtist.spotifyLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-2 hover:underline"
              >
                <FaSpotify size={24} />
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
