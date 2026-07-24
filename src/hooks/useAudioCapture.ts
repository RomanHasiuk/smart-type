import { useEffect, useRef, useState } from "react";

export type AudioCaptureState = {
  isCapturing: boolean;
  isSupported: boolean;
};

export const useAudioCapture = () => {
  const [state, setState] = useState<AudioCaptureState>({
    isCapturing: false,
    isSupported: false,
  });

  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [volume, setVolume] = useState<number>(0);
  const [isMonitoring, setIsMonitoring] = useState<boolean>(false);

  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof MediaRecorder !== "undefined") {
      setState((prev) => ({ ...prev, isSupported: true }));
      
      const fetchDevices = async (isInitial: boolean = false) => {
        try {
          if (isInitial) {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
          }

          const deviceInfos = await navigator.mediaDevices.enumerateDevices();
          const audioInputs = deviceInfos.filter(d => d.kind === 'audioinput');
          
          const cleanInputs = audioInputs.filter(device => {
            const isVirtualAlias = device.deviceId === 'default' || device.deviceId === 'communications';
            if (isVirtualAlias) {
              const hasPhysicalDevices = audioInputs.some(d => d.deviceId !== 'default' && d.deviceId !== 'communications');
              return !hasPhysicalDevices;
            }
            return true;
          });

          setDevices(cleanInputs);
          if (cleanInputs.length > 0) {
            setSelectedDeviceId((prev) => {
              if (cleanInputs.some(d => d.deviceId === prev)) return prev;
              return cleanInputs[0].deviceId;
            });
          }
        } catch (err) {
          console.error("Error accessing microphones:", err);
        }
      };

      fetchDevices(true);

      const handleDeviceChange = () => {
        fetchDevices(false);
      };

      if (navigator.mediaDevices && navigator.mediaDevices.addEventListener) {
        navigator.mediaDevices.addEventListener("devicechange", handleDeviceChange);
      }

      return () => {
        if (navigator.mediaDevices && navigator.mediaDevices.removeEventListener) {
          navigator.mediaDevices.removeEventListener("devicechange", handleDeviceChange);
        }
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        if (audioContextRef.current) audioContextRef.current.close();
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
          mediaRecorderRef.current.stop();
        }
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };
    }
  }, []);

  const updateVolume = () => {
    if (analyserRef.current) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
      setVolume(average);
      animationFrameRef.current = requestAnimationFrame(updateVolume);
    }
  };

  const startMonitoring = async () => {
    try {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      if (audioContextRef.current) {
        await audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }

      const constraints = selectedDeviceId ? { audio: { deviceId: { exact: selectedDeviceId } } } : { audio: true };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioCtx();
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);
      updateVolume();
      setIsMonitoring(true);
    } catch (error) {
      console.error("Error monitoring microphone:", error);
    }
  };

  const stopMonitoring = () => {
    if (!state.isCapturing) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      setVolume(0);
      setIsMonitoring(false);
    }
  };

  const startCapture = async (): Promise<boolean> => {
    if (!state.isSupported) return false;
    
    try {
      if (!isMonitoring || !streamRef.current) {
        await startMonitoring();
      }
      
      const stream = streamRef.current!;
      audioChunksRef.current = [];

      const activeMic = devices.find((d) => d.deviceId === selectedDeviceId);
      const micName = activeMic?.label || selectedDeviceId || "Default System Mic";
      console.log(`🎙️ [Audio Capture] Started recording using mic: "${micName}" (ID: ${selectedDeviceId || "default"})`);

      const options: MediaRecorderOptions = {};
      if (typeof MediaRecorder.isTypeSupported === "function") {
        if (MediaRecorder.isTypeSupported("audio/webm")) {
          options.mimeType = "audio/webm";
        } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
          options.mimeType = "audio/mp4";
        } else if (MediaRecorder.isTypeSupported("audio/aac")) {
          options.mimeType = "audio/aac";
        }
      }

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.start();
      setState((prev) => ({ ...prev, isCapturing: true }));
      return true;
    } catch (error) {
      console.error("Microphone error:", error);
      return false;
    }
  };

  const stopCapture = (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current || mediaRecorderRef.current.state === "inactive") {
        resolve(null);
        return;
      }

      let isResolved = false;

      const cleanupAndResolve = (blob: Blob | null) => {
        if (isResolved) return;
        isResolved = true;

        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        if (audioContextRef.current) {
          audioContextRef.current.close().catch(() => {});
          audioContextRef.current = null;
        }
        setVolume(0);

        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        setIsMonitoring(false);
        setState((prev) => ({ ...prev, isCapturing: false }));
        resolve(blob);
      };

      // Safety timeout: resolve if onstop doesn't fire within 2.5s
      const safetyTimer = setTimeout(() => {
        const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
        const audioBlob = audioChunksRef.current.length > 0
          ? new Blob(audioChunksRef.current, { type: mimeType })
          : null;
        cleanupAndResolve(audioBlob);
      }, 2500);

      mediaRecorderRef.current.onstop = () => {
        clearTimeout(safetyTimer);
        const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        cleanupAndResolve(audioBlob);
      };

      try {
        mediaRecorderRef.current.stop();
      } catch (err) {
        console.error("Error stopping MediaRecorder:", err);
        clearTimeout(safetyTimer);
        cleanupAndResolve(null);
      }
    });
  };

  return {
    ...state,
    devices,
    selectedDeviceId,
    setSelectedDeviceId,
    volume,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    startCapture,
    stopCapture,
  };
};