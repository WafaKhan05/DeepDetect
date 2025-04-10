"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Video, History, Award } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <main className="flex-grow">
        <div className="relative min-h-[calc(100vh-4rem)]">
          <div className="absolute inset-0 hero-gradient" />
          <div className="relative container mx-auto px-4 py-20 min-h-[calc(100vh-4rem)] flex items-center">
            <div className="max-w-3xl">
              <h1 className="text-6xl font-bold tracking-tight mb-6">
                Detect Deepfakes with
                <span className="text-primary"> AI Precision</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Our advanced AI technology helps you identify manipulated videos and images
                with industry-leading accuracy. Protect yourself from digital deception.
              </p>
              <div className="flex gap-4">
                <Link href="/analyze">
                  <Button size="lg" className="gap-2">
                    Start Analyzing <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/about">
                  <Button size="lg" variant="outline">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <section className="py-32 bg-secondary/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-16">
              Advanced Detection Features
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-background p-8 rounded-xl shadow-lg border border-primary/10 hover:border-primary/20 transition-colors">
                <Shield className="w-12 h-12 text-primary mb-6" />
                <h3 className="text-xl font-semibold mb-3">Real-time Analysis</h3>
                <p className="text-muted-foreground">
                  Get instant results with our powerful AI engine that processes media in seconds.
                </p>
              </div>
              <div className="bg-background p-8 rounded-xl shadow-lg border border-primary/10 hover:border-primary/20 transition-colors">
                <Video className="w-12 h-12 text-primary mb-6" />
                <h3 className="text-xl font-semibold mb-3">Multi-format Support</h3>
                <p className="text-muted-foreground">
                  Analyze both videos and images in various formats with high accuracy.
                </p>
              </div>
              <div className="bg-background p-8 rounded-xl shadow-lg border border-primary/10 hover:border-primary/20 transition-colors">
                <History className="w-12 h-12 text-primary mb-6" />
                <h3 className="text-xl font-semibold mb-3">Detailed Reports</h3>
                <p className="text-muted-foreground">
                  Access comprehensive analysis reports with visual indicators and confidence scores.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 bg-primary/5">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-2xl mx-auto">
              <Award className="w-16 h-16 text-primary mx-auto mb-8" />
              <h2 className="text-4xl font-bold mb-6">
                Ready to Detect Deepfakes?
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Join thousands of users who trust our platform for deepfake detection.
              </p>
              <Link href="/auth?tab=register">
                <Button size="lg" className="gap-2">
                  Get Started Free <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}