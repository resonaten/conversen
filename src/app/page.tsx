"use client";

import { useState, useEffect, useRef } from "react";
import { ChatList, type ChatListRef } from "@/app/_components/chat-list";
import { ChatView } from "@/app/_components/chat-view";
import { SignIn } from "@/app/_components/sign-in";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function Home() {
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: number; username: string } | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const chatListRef = useRef<ChatListRef>(null);

  // Check localStorage for existing session
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  const handleSignIn = (user: { id: number; username: string }) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    setSelectedChatId(null);
    localStorage.removeItem('currentUser');
  };

  const handleChatDeleted = () => {
    setSelectedChatId(null);
    // Trigger refetch of chat list to update the UI
    chatListRef.current?.refetch();
  };

  const handleChatUpdated = () => {
    // Trigger refetch of chat list to update the UI
    chatListRef.current?.refetch();
  };

  const handleChatSelect = (chatId: number) => {
    setSelectedChatId(chatId);
    // Close mobile menu when a chat is selected
    setIsMobileMenuOpen(false);
  };

  // Show sign-in page if not authenticated
  if (!currentUser) {
    return <SignIn onSignIn={handleSignIn} />;
  }

  return (
    <div className="h-screen bg-stone-950">
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden md:block">
        <ChatList
          ref={chatListRef}
          selectedChatId={selectedChatId}
          onChatSelect={handleChatSelect}
          onNewChat={() => { }}
          userId={currentUser.id}
        />
      </div>

      {/* Mobile Header */}
      <div className="md:hidden bg-stone-950 border-b border-stone-800 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="text-stone-400 hover:text-stone-100">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 bg-stone-950 border-stone-800 p-0">
              <ChatList
                ref={chatListRef}
                selectedChatId={selectedChatId}
                onChatSelect={handleChatSelect}
                onNewChat={() => { }}
                userId={currentUser.id}
              />
            </SheetContent>
          </Sheet>
          <h1 className="text-lg font-semibold text-stone-100">conversen</h1>
        </div>
        <div className="flex items-center gap-2 text-stone-400 text-sm">
          <span className="hidden sm:inline">{currentUser.username}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="text-stone-400 hover:text-stone-100 hover:bg-stone-800 p-1"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="md:ml-64 h-[calc(100vh-65px)] md:h-screen flex flex-col">
        {selectedChatId ? (
          <ChatView
            chatId={selectedChatId}
            userId={currentUser.id}
            onChatDeleted={handleChatDeleted}
            onChatUpdated={handleChatUpdated}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-stone-950 p-4 md:p-8">
            <Card className="bg-stone-900 border-stone-800 max-w-md w-full">
              <CardHeader>
                <CardTitle className="text-xl text-stone-100 text-center">
                  conversen
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-stone-300 mb-4">
                  Create realistic conversations for your AI training dataset
                </p>
                <p className="text-stone-500 text-sm mb-6">
                  Select a chat from the sidebar or create a new one to start building your conversational dataset
                </p>
                <div className="hidden md:flex items-center justify-center gap-2 text-stone-400 text-sm">
                  <span>Signed in as: {currentUser.username}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="text-stone-400 hover:text-stone-100 hover:bg-stone-800 p-1"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
