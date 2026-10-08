import { useState, useRef, useCallback, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';

export interface VoiceOptions {
  autoSilenceTimeoutMs?: number;
  handsFree?: boolean;
}

export function useVoiceRecognition(conversationId?: string, options: VoiceOptions = {}) {
  const { autoSilenceTimeoutMs = 1300, handsFree = true } = options;
  const { setAssistantState, sendAudioChunk, finishVoiceRecording } = useSocket();
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const speechRecognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<any>(null);
  const latestTranscriptRef = useRef<string>('');

  const stopRecording = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    setIsRecording(false);
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch (_) {}
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    } else {
      finishVoiceRecording(conversationId, latestTranscriptRef.current);
    }
  }, [conversationId, finishVoiceRecording]);

  const startRecording = useCallback(async () => {
    setError(null);
    setInterimTranscript('');
    latestTranscriptRef.current = '';
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    try {
      setAssistantState('LISTENING');
      setIsRecording(true);

      // Check if browser SpeechRecognition is available as instant fallback
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let current = '';
          for (let i = 0; i < event.results.length; i++) {
            current += event.results[i][0].transcript;
          }
          latestTranscriptRef.current = current;
          setInterimTranscript(current);

          // Hands-free VAD: If speech is recognized, wait for silence then auto-dispatch
          if (handsFree && current.trim().length > 0) {
            if (silenceTimerRef.current) {
              clearTimeout(silenceTimerRef.current);
            }
            silenceTimerRef.current = setTimeout(() => {
              stopRecording();
            }, autoSilenceTimeoutMs);
          }
        };

        recognition.onspeechend = () => {
          if (handsFree && latestTranscriptRef.current.trim().length > 0) {
            if (silenceTimerRef.current) {
              clearTimeout(silenceTimerRef.current);
            }
            silenceTimerRef.current = setTimeout(() => {
              stopRecording();
            }, 800);
          }
        };

        recognition.onerror = (e: any) => {
          console.warn('SpeechRecognition error:', e);
        };

        speechRecognitionRef.current = recognition;
        try {
          recognition.start();
        } catch (_) {}
      }

      let audioStreamStarted = false;

      // Record audio stream with MediaRecorder if available
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          audioStreamStarted = true;
          const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });

          mediaRecorder.ondataavailable = async (event) => {
            if (event.data.size > 0) {
              const reader = new FileReader();
              reader.onloadend = () => {
                const base64 = (reader.result as string)?.split(',')[1];
                if (base64) {
                  sendAudioChunk(base64);
                }
              };
              reader.readAsDataURL(event.data);
            }
          };

          mediaRecorder.onstop = () => {
            stream.getTracks().forEach((track) => track.stop());
            finishVoiceRecording(conversationId, latestTranscriptRef.current);
          };

          mediaRecorderRef.current = mediaRecorder;
          mediaRecorder.start(250); // Emit 250ms chunks
        } catch (mediaErr) {
          console.warn('MediaRecorder getUserMedia unavailable or denied:', mediaErr);
        }
      }

      // If neither audio stream nor speech recognition could start, trigger error
      if (!audioStreamStarted && !speechRecognitionRef.current) {
        throw new Error('Microphone access denied or unavailable.');
      }
    } catch (err: any) {
      console.warn('Voice input notice:', err);
      setError('Microphone permission required. Tap again or type in terminal below.');
      setAssistantState('ERROR');
      setIsRecording(false);
      // Auto-recover after 3.5s so Jarvis UI does not stay permanently stuck in ERROR
      setTimeout(() => {
        setAssistantState('IDLE');
      }, 3500);
    }
  }, [conversationId, finishVoiceRecording, sendAudioChunk, setAssistantState, handsFree, autoSilenceTimeoutMs, stopRecording]);

  useEffect(() => {
    return () => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    };
  }, []);

  return {
    isRecording,
    startRecording,
    stopRecording,
    interimTranscript,
    error,
  };
}
