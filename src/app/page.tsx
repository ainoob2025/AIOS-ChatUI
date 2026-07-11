"use client";

import ChatInterface from "@/components/chat/ChatInterface";
import ScaleProvider from "@/components/ScaleProvider";

export default function Home() {
  return (
    <ScaleProvider>
      <main className="h-screen flex flex-col overflow-hidden">
        <ChatInterface />
      </main>
    </ScaleProvider>
  );
}
