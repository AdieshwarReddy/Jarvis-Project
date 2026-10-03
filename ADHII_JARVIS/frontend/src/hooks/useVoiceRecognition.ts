import { useState, useRef, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';

export function useVoiceRecognition(conversationId?: string) {
  const { setAssistantState, sendAudioChunk, finishVoiceRecording } = useSocket();
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const speechRecognitionRef = useRef<any>(null);

  const startRecording = useCallback(async () => {
    setError(null);
    try {
      setAssistantState('LISTENING');
      setIsRecording(true);

      // Check if browser SpeechRecognition is available as instant fallback
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      let recognizedTranscript = '';
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let current = '';
          for (let i = 0; i < event.results.length; i++) {
            current += event.results[i][0].transcript;
          }
          recognizedTranscript = current;
        };

        recognition.onerror = (e: any) => {
          console.warn('SpeechRecognition error:', e);
        };

        speechRecognitionRef.current = recognition;
        try {
          recognition.start();
        } catch (_) {}
      }

      // Record audio stream with MediaRecorder
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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
          finishVoiceRecording(conversationId, recognizedTranscript);
        };

        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start(250); // Emit 250ms chunks
      }
    } catch (err: any) {
      console.error('Microphone access denied:', err);
      setError('Microphone access denied or unavailable.');
      setAssistantState('ERROR');
      setIsRecording(false);
    }
  }, [conversationId, finishVoiceRecording, sendAudioChunk, setAssistantState]);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch (_) {}
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    } else {
      finishVoiceRecording(conversationId);
    }
  }, [conversationId, finishVoiceRecording]);

  return {
    isRecording,
    startRecording,
    stopRecording,
    error,
  };
}
