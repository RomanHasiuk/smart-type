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
      
      const fetchDevices = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach(track => track.stop());

          const deviceInfos = await navigator.mediaDevices.enumerateDevices();
          const audioInputs = deviceInfos.filter(d => d.kind === 'audioinput');
          setDevices(audioInputs);
          if (audioInputs.length > 0) {
            setSelectedDeviceId(audioInputs[0].deviceId);
          }
        } catch (err) {
          console.error("Error accessing microphones:", err);
        }
      };

      fetchDevices();
    }
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
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
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      const constraints = selectedDeviceId ? { audio: { deviceId: { exact: selectedDeviceId } } } : { audio: true };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
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

      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
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

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        if (audioContextRef.current) {
          audioContextRef.current.close();
          audioContextRef.current = null;
        }
        setVolume(0);

        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        setIsMonitoring(false);
        setState((prev) => ({ ...prev, isCapturing: false }));
        resolve(audioBlob);
      };

      mediaRecorderRef.current.stop();
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