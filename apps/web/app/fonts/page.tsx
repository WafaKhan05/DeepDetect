"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function AnalyzePage() {
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setAnalyzing(true);
    // Simulate analysis progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setProgress(i);
    }
    setAnalyzing(false);
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
                  <Button onClick={() => setFile(null)} variant="outline">
                    Remove
                  </Button>
                </div>
              )}
            </div>

            {file && !analyzing && (
              <Button className="w-full mt-4" onClick={handleAnalyze}>
                Start Analysis
              </Button>
            )}

            {analyzing && (
              <div className="mt-4 space-y-2">
                <Progress value={progress} />
                <p className="text-sm text-center text-muted-foreground">
                  Analyzing... {progress}%
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Analysis Results</h2>
            {!analyzing && progress === 100 ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">
                    Potential Deepfake Detected
                  </span>
                </div>
                <div className="space-y-2">
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
                </div>
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
