"use client";

import { useState, useImperativeHandle, forwardRef } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface ChatListProps {
    selectedChatId: number | null;
    onChatSelect: (chatId: number) => void;
    onNewChat: () => void;
    userId: number;
    className?: string;
}

export interface ChatListRef {
    refetch: () => void;
}

export const ChatList = forwardRef<ChatListRef, ChatListProps>(({
    selectedChatId,
    onChatSelect,
    onNewChat,
    userId,
    className = "",
}, ref) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [chatName, setChatName] = useState("");
    const [chatDescription, setChatDescription] = useState("");

    const { data: chats, refetch } = api.chat.getAll.useQuery({ userId });

    // Expose refetch function to parent component
    useImperativeHandle(ref, () => ({
        refetch
    }));

    const createChat = api.chat.create.useMutation({
        onSuccess: () => {
            refetch();
            setIsDialogOpen(false);
            setChatName("");
            setChatDescription("");
        },
    });

    const handleCreateChat = async (e: React.FormEvent) => {
        e.preventDefault();
        if (chatName.trim() && chatDescription.trim()) {
            await createChat.mutateAsync({
                name: chatName.trim(),
                description: chatDescription.trim(),
                userId: userId,
            });
        }
    };

    const truncateDescription = (description: string) => {
        return description.length > 20 ? description.substring(0, 20) + "..." : description;
    };

    return (
        <div className={`w-full md:w-64 bg-stone-950 h-full md:h-screen p-4 border-r border-stone-800 md:fixed md:left-0 md:top-0 md:z-10 flex flex-col ${className}`}>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-stone-100">Chats</h2>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-xs md:text-sm"
                        >
                            New Chat
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-stone-900 border-stone-700 text-stone-100 mx-4 max-w-[calc(100vw-2rem)] md:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-stone-100">Create New Chat</DialogTitle>
                            <DialogDescription className="text-stone-400">
                                Create a new conversation for your AI training dataset. Give it a descriptive name and specify the tone or mood.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateChat} className="space-y-4">
                            <div>
                                <label htmlFor="chatName" className="block text-sm font-medium text-stone-200 mb-1">
                                    Chat Name
                                </label>
                                <Input
                                    id="chatName"
                                    type="text"
                                    placeholder="e.g., casual_friends, romantic_date, job_interview"
                                    value={chatName}
                                    onChange={(e) => setChatName(e.target.value)}
                                    className="bg-stone-800 border-stone-700 text-stone-100 placeholder-stone-500"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="chatDescription" className="block text-sm font-medium text-stone-200 mb-1">
                                    Description
                                </label>
                                <Textarea
                                    id="chatDescription"
                                    placeholder="Describe the tone, mood, or context of this conversation..."
                                    value={chatDescription}
                                    onChange={(e) => setChatDescription(e.target.value)}
                                    className="bg-stone-800 border-stone-700 text-stone-100 placeholder-stone-500 resize-none"
                                    rows={3}
                                    required
                                />
                            </div>
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setIsDialogOpen(false)}
                                    className="bg-stone-700 hover:bg-stone-600 text-stone-100"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-green-600 hover:bg-green-700"
                                    disabled={createChat.isPending}
                                >
                                    {createChat.isPending ? "Creating..." : "Create Chat"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto">
                {chats?.map((chat) => (
                    <Card
                        key={chat.id}
                        className={`cursor-pointer transition-colors ${selectedChatId === chat.id
                            ? "bg-blue-600 border-blue-500"
                            : "bg-stone-900 border-stone-800 hover:bg-stone-800"
                            }`}
                        onClick={() => onChatSelect(chat.id)}
                    >
                        <CardContent className="p-3">
                            <div className="font-semibold text-sm text-stone-100 break-words">{chat.name}</div>
                            <div className="text-xs text-stone-400 break-words">
                                {truncateDescription(chat.description)}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}); 