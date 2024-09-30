"use client";

import * as React from "react";
import { NextUIProvider } from "@nextui-org/system";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ThemeProviderProps } from "next-themes/dist/types";

import { AuthProvider } from "@/providers/auth-provider";
import {
  DocumentProvider,
  ElectionProvider,
  FeedbackProvider,
  MeetingProvider,
  PromotionProvider,
  UserProvider,
} from "@/providers/models";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

export function Providers({ children, themeProps }: ProvidersProps) {
  const router = useRouter();

  return (
    <NextUIProvider navigate={router.push}>
      <NextThemesProvider {...themeProps}>
        <UserProvider>
          <AuthProvider>
            <FeedbackProvider>
              <DocumentProvider>
                <MeetingProvider>
                  <PromotionProvider>
                    <FeedbackProvider>
                      <ElectionProvider>{children}</ElectionProvider>
                    </FeedbackProvider>
                  </PromotionProvider>
                </MeetingProvider>
              </DocumentProvider>
            </FeedbackProvider>
          </AuthProvider>
        </UserProvider>
      </NextThemesProvider>
    </NextUIProvider>
  );
}
