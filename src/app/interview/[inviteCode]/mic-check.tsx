"use client";

import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mic, MicOff, Volume2, CheckCircle2, XCircle } from "lucide-react";

export function MicCheck() {
  const [permission, setPermission] = useState<
    "pending" | "granted" | "denied"
  >("pending");
  const [audioLevel, setAudioLevel] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);

  const requestMicPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      setPermission("granted");
      setIsListening(true);

      // Set up audio analysis
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);

      analyser.fftSize = 256;
      microphone.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      // Start monitoring audio levels
      monitorAudioLevel();
    } catch (err) {
      console.error("Microphone permission denied:", err);
      setPermission("denied");
    }
  };

  const monitorAudioLevel = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

    const updateLevel = () => {
      if (!analyserRef.current) return;

      analyserRef.current.getByteFrequencyData(dataArray);

      // Calculate average volume
      const average =
        dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
      const normalized = Math.min(100, (average / 255) * 100);

      setAudioLevel(normalized);
      animationRef.current = requestAnimationFrame(updateLevel);
    };

    updateLevel();
  };

  const stopListening = () => {
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    setIsListening(false);
    setAudioLevel(0);
  };

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Mic className="h-5 w-5 text-indigo-600" />
          <CardTitle>Microphone Check</CardTitle>
        </div>
        <CardDescription>
          Test your microphone before starting the interview
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {permission === "pending" && (
          <Alert>
            <Volume2 className="h-4 w-4" />
            <AlertDescription>
              We need access to your microphone to conduct the interview. Click
              the button below to grant permission.
            </AlertDescription>
          </Alert>
        )}

        {permission === "denied" && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              Microphone access was denied. Please enable microphone permissions
              in your browser settings and refresh the page.
            </AlertDescription>
          </Alert>
        )}

        {permission === "granted" && (
          <>
            {/* Audio Level Visualizer */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Audio Level</span>
                <span className="text-muted-foreground">
                  {audioLevel > 10 ? (
                    <span className="flex items-center gap-1 text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      Working
                    </span>
                  ) : (
                    "Speak to test..."
                  )}
                </span>
              </div>

              {/* Level Meter */}
              <div className="h-8 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-100"
                  style={{ width: `${audioLevel}%` }}
                />
              </div>

              <p className="text-xs text-muted-foreground">
                💡 Tip: Speak normally and watch the meter move. The green bar
                should move when you talk.
              </p>
            </div>

            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Microphone is working! You're all set to begin the interview.
              </AlertDescription>
            </Alert>
          </>
        )}

        {/* Permission Button */}
        {permission === "pending" && (
          <Button
            className="w-full"
            size="lg"
            onClick={requestMicPermission}
            variant="outline"
          >
            <Mic className="mr-2 h-4 w-4" />
            Test Microphone
          </Button>
        )}

        {permission === "granted" && isListening && (
          <Button
            className="w-full"
            size="lg"
            onClick={stopListening}
            variant="outline"
          >
            <MicOff className="mr-2 h-4 w-4" />
            Stop Test
          </Button>
        )}

        {permission === "granted" && !isListening && (
          <Button
            className="w-full"
            size="lg"
            onClick={requestMicPermission}
            variant="outline"
          >
            <Mic className="mr-2 h-4 w-4" />
            Test Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
