"use client";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import {
  LoginLink,
  LogoutLink,
  RegisterLink,
} from "@kinde-oss/kinde-auth-nextjs/components";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { Profile } from "./profile";

export function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated } = useKindeBrowserClient();

  const navigation = [
    { name: "Home", href: "/", protected: false },
    { name: "Analyze", href: "/analyze", protected: true },
    { name: "History", href: "/history", protected: true },
    { name: "About", href: "/about", protected: false },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-primary">
              DeepDetect
            </Link>
            <div className="hidden md:flex items-center space-x-1 ml-8">
              {navigation.map((item) =>
                (item.protected && isAuthenticated) || !item.protected ? (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      pathname === item.href
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                    )}
                  >
                    {item.name}
                  </Link>
                ) : null
              )}
            </div>
          </div>
          {!isAuthenticated && (
            <div className="flex items-center gap-4">
              <LoginLink className={buttonVariants({ variant: "ghost" })}>
                Sign in
              </LoginLink>
              <RegisterLink className={buttonVariants()}>
                Get Started
              </RegisterLink>
            </div>
          )}
          {isAuthenticated && (
            <div className="flex items-center gap-4">
              <Profile />
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
