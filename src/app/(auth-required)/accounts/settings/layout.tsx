import { ReactNode } from "react";

export default function UserSettingsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <main className="w-full max-w-4xl mx-auto shadow-lg rounded-md">
      <h1 className="text-2xl font-semibold text-center text-primary mb-4">
        User Settings
      </h1>
      {children}
    </main>
  );
}
