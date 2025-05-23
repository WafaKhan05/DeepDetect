"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, AlertCircle, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import axios from "axios";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { notFound, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default function AnalyzePage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUplaoding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const { user, isLoading } = useKindeBrowserClient();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<{
    analysis_completed_on: string;
    confidence: string;
    id: string;
    prediction: string;
    result: string;
    status: string;
    userId: string;
  } | null>(null);
  const [error, setError] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!user) {
      notFound();
    }

    if (user.id) {
      const WebSocketUrl = process.env.NEXT_PUBLIC_WEBSOCKET_ENDPOINT;

      const ws = new WebSocket(`${WebSocketUrl}/${user.id}`);

      ws.onmessage = function (event) {
        console.log("WebSocket Message:", event.data);

        const data = JSON.parse(event.data);

        if (data.event === "update_status") {
          setIsAnalyzing(false);
          setResult(data.data);
        }
      };
    }
  }, [user, isLoading]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!file || !user) return;
    setUplaoding(true);
    setIsAnalyzing(true);
    // Simulate analysis progress

    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", user.id);

    const uploadUrl = process.env.NEXT_PUBLIC_API_ENDPOINT + "/upload";

    try {
      const response = await axios.post(uploadUrl, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percent);
          }
        },
      });

      setMessage(response.data.message);

      setError(response.data.status === "error");

      router.refresh();
    } catch (err) {
      setMessage("Upload failed!");
      setError(true);
    }
    setUplaoding(false);
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-8">Analyze Media</h1>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardContent className="p-6">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
              {!file ? (
                <div className="space-y-4">
                  <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                  <div>
                    <p className="text-lg font-medium">
                      Drop your file here or
                    </p>
                    <label className="text-primary hover:underline cursor-pointer">
                      browse
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*,video/*"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Supports images and videos up to 100MB
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-lg font-medium">{file.name}</p>
                  <Button
                    onClick={() => {
                      setFile(null);
                      setResult(null);
                      setMessage("");
                      setProgress(0);
                    }}
                    variant="outline"
                  >
                    Remove
                  </Button>
                </div>
              )}
            </div>

            {file && !uploading && (
              <Button className="w-full mt-4" onClick={handleAnalyze}>
                Start Analysis
              </Button>
            )}

            {uploading && (
              <div className="mt-4 space-y-2">
                <Progress value={progress} />
                <p className="text-sm text-center text-muted-foreground">
                  Uploading... {progress}%
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Analysis Results</h2>
            {!uploading && progress === 100 ? (
              <div className="space-y-4">
                {result == null && message && (
                  <div
                    className={cn("flex items-center gap-2", {
                      "text-destructive": error,
                      "text-primary": !error,
                    })}
                  >
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-medium">{message}</span>
                  </div>
                )}
                <div>
                  <h6 className="text-xl font-semibold mb-4">
                    Deepfake Result
                  </h6>
                  {isAnalyzing && (
                    <div className="flex gap-2">
                      <Loader2 className="animate-spin" /> <p>Analyzing...</p>
                    </div>
                  )}

                  {!isAnalyzing && result != null && (
                    <div>
                      <h6 className="font-semibold mb-2">Prediction</h6>
                      {result.prediction ? (
                        <>
                          <Badge
                            variant={
                              result.prediction?.toLowerCase() === "fake"
                                ? "destructive"
                                : "success"
                            }
                            className="flex justify-center items-center gap-4 h-6"
                          >
                            {result.prediction?.toUpperCase() ?? "-"}
                          </Badge>
                          <p className="py-2">
                            Confidence: {result.confidence}
                          </p>
                          <p>
                            Analysis Completed At:{" "}
                            {result.analysis_completed_on.split(".")[0]}
                          </p>
                        </>
                      ) : (
                        "-"
                      )}
                    </div>
                  )}
                </div>
                {/* <div className="space-y-2">
                  <p className="text-sm font-medium">Confidence Score: 89%</p>
                  <p className="text-sm text-muted-foreground">
                    Our AI has detected signs of manipulation in the following
                    areas:
                  </p>
                  <ul className="list-disc list-inside text-sm text-muted-foreground">
                    <li>Facial inconsistencies</li>
                    <li>Unnatural movement patterns</li>
                    <li>Audio-visual synchronization issues</li>
                  </ul>
                </div> */}
              </div>
            ) : (
              <p className="text-muted-foreground">
                Upload a file to see analysis results
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
