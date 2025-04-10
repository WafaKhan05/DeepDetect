"use client";
import { PropsWithChildren } from "react";
import { KindeProvider } from "@kinde-oss/kinde-auth-nextjs";

export const AuthProvider = ({ children }: PropsWithChildren) => {
  return <KindeProvider>{children}</KindeProvider>;
};
