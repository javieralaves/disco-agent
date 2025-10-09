"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  Loader2,
  MessageSquare,
  X,
  ArrowDown,
} from "lucide-react";

interface Turn {
  speaker: "user" | "ai";
  text: string;
  timestamp: Date;
}

interface InterviewClientProps {
  inviteCode: string;
}

export function InterviewClient({ inviteCode }: InterviewClientProps) {
  const router = useRouter();
  const [status, setStatus] = useState<
    "initializing" | "connecting" | "connected" | "error" | "ended"
  >("initializing");
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<Turn[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [currentAITranscript, setCurrentAITranscript] = useState<string>("");
  const [showJumpToBottom, setShowJumpToBottom] = useState(false);

  const sessionIdRef = useRef<string | null>(null);
  const transcriptRef = useRef<HTMLDivElement | null>(null);
  const isUserScrolledUpRef = useRef<boolean>(false);
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const initializedRef = useRef<boolean>(false);
  const aiSpeakingRef = useRef<boolean>(false);

  // Separate audio context for AI playback
  const playbackContextRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<AudioBuffer[]>([]);
  const isPlayingRef = useRef<boolean>(false);
  const nextPlayTimeRef = useRef<number>(0);

  // Turn save queue to ensure sequential saving
  const turnSaveQueueRef = useRef<
    Array<{ speaker: "user" | "ai"; text: string }>
  >([]);
  const isSavingTurnRef = useRef<boolean>(false);

  useEffect(() => {
    // Get session ID from localStorage
    const sessionId = localStorage.getItem("disco_session_id");
    if (!sessionId) {
      router.push(`/interview/${inviteCode}`);
      return;
    }

    sessionIdRef.current = sessionId;

    // Prevent double initialization using ref
    if (!initializedRef.current) {
      initializedRef.current = true;
      initializeInterview(sessionId);
    }

    return () => {
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Auto-scroll to bottom when transcript updates (unless user scrolled up)
  useEffect(() => {
    if (transcriptRef.current && !isUserScrolledUpRef.current) {
      transcriptRef.current.scrollTo({
        top: transcriptRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [transcript]);

  // Handle scroll to detect if user scrolled up
  const handleScroll = () => {
    if (!transcriptRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = transcriptRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50; // 50px threshold

    isUserScrolledUpRef.current = !isAtBottom;
    setShowJumpToBottom(!isAtBottom);
  };

  // Jump to bottom function
  const jumpToBottom = () => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTo({
        top: transcriptRef.current.scrollHeight,
        behavior: "smooth",
      });
      isUserScrolledUpRef.current = false;
      setShowJumpToBottom(false);
    }
  };

  const initializeInterview = async (sessionId: string) => {
    try {
      setStatus("connecting");

      console.log("🔄 Initializing interview session:", sessionId);

      // Get ephemeral token from server
      const response = await fetch("/api/realtime/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      if (!response.ok) {
        throw new Error("Failed to start interview session");
      }

      const { client_secret } = await response.json();

      console.log(
        "🔑 Got ephemeral token:",
        client_secret ? "present" : "MISSING"
      );

      if (!client_secret) {
        throw new Error("No ephemeral token received from server");
      }

      // Connect to OpenAI Realtime API
      await connectToRealtime(client_secret);
    } catch (err) {
      console.error("❌ Error initializing interview:", err);
      setError(
        "Failed to start the interview. Please refresh the page and try again."
      );
      setStatus("error");
    }
  };

  const connectToRealtime = async (ephemeralKey: string) => {
    try {
      console.log("🎤 Requesting microphone access...");

      // Get microphone access with echo cancellation
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      micStreamRef.current = stream;

      console.log("✅ Microphone access granted");
      console.log("🔌 Connecting to OpenAI Realtime API...");

      // Connect to OpenAI Realtime API via WebSocket
      const ws = new WebSocket(
        `wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17`,
        [
          "realtime",
          `openai-insecure-api-key.${ephemeralKey}`,
          "openai-beta.realtime-v1",
        ]
      );

      wsRef.current = ws;

      ws.onopen = () => {
        console.log("✅ Connected to OpenAI Realtime API");
        setStatus("connected");

        // Start audio streaming immediately
        startAudioStreaming(ws, stream);

        console.log("🎤 Audio streaming started, microphone active");
      };

      ws.onmessage = (event) => {
        handleRealtimeEvent(JSON.parse(event.data));
      };

      ws.onerror = (error) => {
        console.error("❌ WebSocket error:", error);
        setError("Connection error. Please refresh and try again.");
        setStatus("error");
      };

      ws.onclose = (event) => {
        console.log("🔌 WebSocket closed:", event.code, event.reason);
        if (status === "connected") {
          setStatus("ended");
        }
      };
    } catch (err) {
      console.error("Error connecting to realtime API:", err);
      setError("Failed to connect. Please check your microphone permissions.");
      setStatus("error");
    }
  };

  const startAudioStreaming = (ws: WebSocket, stream: MediaStream) => {
    const audioContext = new AudioContext({ sampleRate: 24000 });
    audioContextRef.current = audioContext;

    const source = audioContext.createMediaStreamSource(stream);
    const processor = audioContext.createScriptProcessor(4096, 1, 1);

    // Create a gain node set to 0 to mute the mic feedback
    const gainNode = audioContext.createGain();
    gainNode.gain.value = 0; // Mute completely to prevent echo

    let audioChunksSent = 0;

    processor.onaudioprocess = (e) => {
      // Don't send audio while AI is speaking (prevents echo)
      const shouldSendAudio =
        ws.readyState === WebSocket.OPEN && !isMuted && !aiSpeakingRef.current;

      if (!shouldSendAudio && audioChunksSent > 0) {
        // Log when we're blocking audio due to AI speaking
        if (aiSpeakingRef.current && audioChunksSent % 50 === 0) {
          console.log("🔇 Mic muted - AI is speaking");
        }
        return;
      }

      if (shouldSendAudio) {
        const inputData = e.inputBuffer.getChannelData(0);

        // Convert Float32Array to PCM16
        const pcm16 = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]));
          pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }

        // Send audio data to OpenAI
        const base64Audio = btoa(
          String.fromCharCode.apply(
            null,
            Array.from(new Uint8Array(pcm16.buffer))
          )
        );

        ws.send(
          JSON.stringify({
            type: "input_audio_buffer.append",
            audio: base64Audio,
          })
        );

        audioChunksSent++;
        if (audioChunksSent === 1 || audioChunksSent % 50 === 0) {
          console.log(`🎤 Sent ${audioChunksSent} audio chunks to OpenAI`);
        }
      }
    };

    // Connect the chain: source → processor → gainNode (muted) → destination
    // This allows the processor to work without echoing your voice back
    source.connect(processor);
    processor.connect(gainNode);
    gainNode.connect(audioContext.destination);
  };

  const processTurnQueue = async () => {
    if (isSavingTurnRef.current || turnSaveQueueRef.current.length === 0) {
      return;
    }

    isSavingTurnRef.current = true;

    while (turnSaveQueueRef.current.length > 0) {
      const turn = turnSaveQueueRef.current.shift();
      if (!turn || !sessionIdRef.current) continue;

      try {
        const response = await fetch("/api/interview/turn", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: sessionIdRef.current,
            speaker: turn.speaker,
            text: turn.text,
          }),
        });

        if (!response.ok) {
          console.error("Failed to save turn");
        }
      } catch (err) {
        console.error("Error saving turn:", err);
      }
    }

    isSavingTurnRef.current = false;
  };

  const saveTurn = (speaker: "user" | "ai", text: string) => {
    // Add to queue
    turnSaveQueueRef.current.push({ speaker, text });

    // Process queue
    processTurnQueue();
  };

  const playAudioChunk = (base64Audio: string) => {
    try {
      // Initialize playback context if needed (separate from mic context to avoid interference)
      if (!playbackContextRef.current) {
        playbackContextRef.current = new AudioContext({ sampleRate: 24000 });
        nextPlayTimeRef.current = playbackContextRef.current.currentTime;
      }

      // Decode base64 to PCM16
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const pcm16 = new Int16Array(bytes.buffer);

      // Convert PCM16 to Float32 for Web Audio API
      const playbackContext = playbackContextRef.current;
      const audioBuffer = playbackContext.createBuffer(1, pcm16.length, 24000);
      const channelData = audioBuffer.getChannelData(0);

      for (let i = 0; i < pcm16.length; i++) {
        channelData[i] = pcm16[i] / (pcm16[i] < 0 ? 0x8000 : 0x7fff);
      }

      // Schedule this chunk to play AFTER the previous chunk finishes
      const source = playbackContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(playbackContext.destination);

      // Calculate when this chunk should start
      const now = playbackContext.currentTime;
      const startTime = Math.max(now, nextPlayTimeRef.current);

      source.start(startTime);

      // Update the next play time to be after this chunk finishes
      nextPlayTimeRef.current = startTime + audioBuffer.duration;
    } catch (err) {
      console.error("Error playing audio chunk:", err);
    }
  };

  const handleRealtimeEvent = (event: any) => {
    console.log("📡 Realtime event:", event.type, event);

    switch (event.type) {
      case "response.audio_transcript.delta":
        // AI is speaking - accumulate the transcript
        if (event.delta) {
          setCurrentAITranscript((prev) => prev + event.delta);
        }
        break;

      case "response.audio_transcript.done":
        // AI finished speaking - save complete transcript
        if (event.transcript) {
          console.log("📝 AI complete transcript:", event.transcript);
          setTranscript((prev) => [
            ...prev,
            {
              speaker: "ai",
              text: event.transcript,
              timestamp: new Date(),
            },
          ]);
          setCurrentAITranscript(""); // Reset for next response

          // Save to database
          saveTurn("ai", event.transcript);
        }
        break;

      case "response.created":
        // AI is about to start responding - mute mic immediately
        console.log("🤖 AI starting response - muting mic");
        setAiSpeaking(true);
        aiSpeakingRef.current = true;

        // Reset audio playback timing for the new response
        if (playbackContextRef.current) {
          nextPlayTimeRef.current = playbackContextRef.current.currentTime;
        }
        break;

      case "response.audio.delta":
        // AI is speaking (audio chunk received)
        setAiSpeaking(true);
        aiSpeakingRef.current = true;

        // Decode and play audio
        if (event.delta) {
          playAudioChunk(event.delta);
        }
        break;

      case "response.audio.done":
        // AI finished speaking - wait a bit before allowing mic again
        console.log("🤖 AI finished speaking - unmuting mic in 500ms");
        setTimeout(() => {
          setAiSpeaking(false);
          aiSpeakingRef.current = false;
        }, 500); // 500ms buffer to ensure echo doesn't get picked up
        break;

      case "response.done":
        // Full response complete
        console.log("Response complete");
        break;

      case "input_audio_buffer.speech_started":
        // User started speaking
        console.log("User started speaking");
        break;

      case "input_audio_buffer.speech_stopped":
        // User stopped speaking
        console.log("User stopped speaking");
        break;

      case "conversation.item.input_audio_transcription.completed":
        // User speech transcription
        if (event.transcript) {
          setTranscript((prev) => [
            ...prev,
            {
              speaker: "user",
              text: event.transcript,
              timestamp: new Date(),
            },
          ]);

          // Save to database
          saveTurn("user", event.transcript);
        }
        break;

      case "error":
        console.error("Realtime API error:", event);
        setError(event.error?.message || "An error occurred");
        break;
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const endInterview = async () => {
    try {
      // Complete the session in the database
      if (sessionIdRef.current) {
        await fetch("/api/interview/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: sessionIdRef.current }),
        });
      }
    } catch (err) {
      console.error("Error completing session:", err);
    } finally {
      cleanup();
      setStatus("ended");

      // Navigate to thank you page
      router.push(`/interview/${inviteCode}/complete`);
    }
  };

  const cleanup = () => {
    // Close WebSocket
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    // Stop microphone
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }

    // Close audio contexts
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (playbackContextRef.current) {
      playbackContextRef.current.close();
      playbackContextRef.current = null;
    }
  };

  if (status === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Connection Error</CardTitle>
            <CardDescription>
              We couldn't start the interview session
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button
              className="mt-4 w-full"
              onClick={() => router.push(`/interview/${inviteCode}`)}
            >
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "initializing" || status === "connecting") {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
            <p className="text-center text-lg font-medium">
              {status === "initializing"
                ? "Preparing your interview..."
                : "Connecting to AI interviewer..."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-indigo-600" />
            <span className="text-lg font-semibold">Interview in Progress</span>
          </div>
          <Button variant="outline" size="sm" onClick={endInterview}>
            <X className="mr-2 h-4 w-4" />
            End Interview
          </Button>
        </div>
      </header>

      {/* Main Interview Area */}
      <main className="container flex-1 py-6">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* AI Status Indicator */}
          <div className="flex items-center justify-center">
            <div
              className={`flex items-center gap-3 rounded-full px-6 py-3 ${
                aiSpeaking
                  ? "bg-indigo-100 text-indigo-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {aiSpeaking ? (
                <>
                  <Volume2 className="h-5 w-5 animate-pulse" />
                  <span className="font-medium">AI is speaking...</span>
                </>
              ) : (
                <>
                  <MessageSquare className="h-5 w-5" />
                  <span className="font-medium">Listening...</span>
                </>
              )}
            </div>
          </div>

          {/* Transcript */}
          <Card>
            <CardHeader>
              <CardTitle>Conversation</CardTitle>
              <CardDescription>
                Real-time transcript of your interview
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <div
                ref={transcriptRef}
                onScroll={handleScroll}
                className="max-h-96 space-y-4 overflow-y-auto"
              >
                {transcript.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground">
                    Start speaking to begin the interview...
                  </p>
                ) : (
                  transcript.map((turn, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        turn.speaker === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-2 ${
                          turn.speaker === "user"
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <p className="text-sm">{turn.text}</p>
                        <p
                          className={`mt-1 text-xs ${
                            turn.speaker === "user"
                              ? "text-indigo-200"
                              : "text-gray-500"
                          }`}
                        >
                          {turn.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Jump to Bottom Button */}
              {showJumpToBottom && (
                <Button
                  size="sm"
                  onClick={jumpToBottom}
                  className="absolute bottom-4 right-4 rounded-full shadow-lg"
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Mic Controls */}
          <div className="flex justify-center">
            <Button
              size="lg"
              variant={isMuted ? "outline" : "default"}
              onClick={toggleMute}
              className="h-16 w-16 rounded-full"
            >
              {isMuted ? (
                <MicOff className="h-6 w-6" />
              ) : (
                <Mic className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
