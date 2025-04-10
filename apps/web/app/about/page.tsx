"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Github,
  Linkedin,
  Mail,
  Award,
  BookOpen,
  Users,
  Brain,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

const teamMembers = [
  {
    name: "Dr. Sarah Chen",
    role: "Project Lead",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
    bio: "Ph.D. in Computer Vision from MIT. Leading expert in deep learning and computer vision with over 10 years of research experience.",
    social: {
      linkedin: "#",
      github: "#",
      email: "sarah@example.com",
    },
  },
  {
    name: "Alex Rodriguez",
    role: "AI Engineer",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
    bio: "MS in Machine Learning from Stanford. Specializes in neural network architecture and optimization algorithms.",
    social: {
      linkedin: "#",
      github: "#",
      email: "alex@example.com",
    },
  },
  {
    name: "Emily Wang",
    role: "Research Assistant",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
    bio: "Computer Science senior at Berkeley. Focus on data preprocessing and model validation techniques.",
    social: {
      linkedin: "#",
      github: "#",
      email: "emily@example.com",
    },
  },
];

const achievements = [
  {
    icon: Award,
    title: "Recognition",
    description: "Best Paper Award at IEEE Computer Vision Conference 2024",
  },
  {
    icon: BookOpen,
    title: "Publications",
    description: "15+ research papers in top-tier academic journals",
  },
  {
    icon: Users,
    title: "Impact",
    description: "Used by 50,000+ professionals worldwide",
  },
  {
    icon: Brain,
    title: "Accuracy",
    description: "95%+ detection accuracy on benchmark datasets",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <div className="container mx-auto py-16 px-4">
        {/* Hero Section */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
            About DeepDetect
          </h1>
          <p className="text-xl text-muted-foreground">
            Pioneering the future of digital authenticity through advanced AI
            technology
          </p>
        </div>

        {/* Achievements Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-24">
          {achievements.map((achievement) => (
            <Card
              key={achievement.title}
              className="border-primary/10 hover:border-primary/20 transition-colors"
            >
              <CardContent className="p-6">
                <achievement.icon className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {achievement.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {achievement.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Project Overview */}
        <div className="grid md:grid-cols-2 gap-12 mb-24">
          <Card className="p-8 border-primary/10">
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              At DeepDetect, we're committed to developing cutting-edge AI
              technology that helps maintain digital truth in an era of
              advancing synthetic media. Our research focuses on creating robust
              detection systems that can identify manipulated content with
              unprecedented accuracy.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 mt-2 rounded-full bg-primary" />
                <p className="text-muted-foreground">
                  Real-time analysis of videos and images
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 mt-2 rounded-full bg-primary" />
                <p className="text-muted-foreground">
                  Multi-modal detection approach
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 mt-2 rounded-full bg-primary" />
                <p className="text-muted-foreground">
                  Advanced neural network architecture
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-8 border-primary/10">
            <h2 className="text-3xl font-bold mb-6">Research Impact</h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Our groundbreaking research has been recognized by leading
              academic institutions and has been featured in numerous
              international conferences on AI and cybersecurity.
            </p>
            <div className="space-y-4">
              <div className="p-4 bg-primary/5 rounded-lg">
                <h3 className="font-semibold mb-2">Latest Publication</h3>
                <p className="text-sm text-muted-foreground">
                  "Advanced Deepfake Detection Using Multi-Modal Analysis"
                  <br />
                  IEEE Conference on Computer Vision 2024
                </p>
              </div>
              <div className="p-4 bg-primary/5 rounded-lg">
                <h3 className="font-semibold mb-2">Industry Recognition</h3>
                <p className="text-sm text-muted-foreground">
                  Featured in MIT Technology Review
                  <br />
                  Best Paper Award at CVPR 2023
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Team Section */}
        <h2 className="text-4xl font-bold text-center mb-12">Meet Our Team</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {teamMembers.map((member) => (
            <Card
              key={member.name}
              className="overflow-hidden border-primary/10 hover:border-primary/20 transition-colors"
            >
              <CardContent className="p-0">
                <div className="relative w-full h-64">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold">{member.name}</h3>
                  <p className="text-primary mb-3">{member.role}</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    {member.bio}
                  </p>
                  <div className="flex gap-4">
                    <Button variant="ghost" size="icon" asChild>
                      <a
                        href={member.social.github}
                        className="text-muted-foreground hover:text-primary"
                      >
                        <Github className="w-5 h-5" />
                      </a>
                    </Button>
                    <Button variant="ghost" size="icon" asChild>
                      <a
                        href={member.social.linkedin}
                        className="text-muted-foreground hover:text-primary"
                      >
                        <Linkedin className="w-5 h-5" />
                      </a>
                    </Button>
                    <Button variant="ghost" size="icon" asChild>
                      <a
                        href={`mailto:${member.social.email}`}
                        className="text-muted-foreground hover:text-primary"
                      >
                        <Mail className="w-5 h-5" />
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
