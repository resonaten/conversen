"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { ChatForm } from "@/components/ui/chat";
import { MessageInput } from "@/components/ui/message-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type Message } from "@/components/ui/chat-message";
import { CustomMessage } from "./custom-message";
import { ChatSettings } from "./chat-settings";

interface ChatViewProps {
    chatId: number;
    userId: number;
    onChatDeleted: () => void;
    onChatUpdated: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({ chatId, userId, onChatDeleted, onChatUpdated }) => {
    const [input, setInput] = useState("");
    const [selectedSender, setSelectedSender] = useState<"boy" | "girl">("boy");

    const { data: messages, refetch } = api.chat.getMessages.useQuery({ chatId });
    const { data: currentChat, refetch: refetchChat } = api.chat.getById.useQuery({ chatId, userId });
    const createMessage = api.chat.createMessage.useMutation({
        onSuccess: () => {
            refetch();
            setInput("");
        },
    });

    // Transform our database messages to match the Chat component's Message interface
    const transformedMessages: (Message & { originalId: number; originalSender: "boy" | "girl" })[] =
        messages?.map((message) => ({
            id: message.id.toString(),
            role: message.sender === "boy" ? "user" : "assistant",
            content: message.content,
            createdAt: message.timestamp,
            originalId: message.id,
            originalSender: message.sender as "boy" | "girl",
        })) || [];

    const handleSubmit = async (event?: { preventDefault?: () => void }) => {
        event?.preventDefault?.();
        if (input.trim()) {
            try {
                await createMessage.mutateAsync({
                    chatId,
                    sender: selectedSender,
                    content: input.trim(),
                });
            } catch (error) {
                console.error("Failed to send message:", error);
            }
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
    };

    const isEmpty = transformedMessages.length === 0;
    const isLoading = createMessage.isPending;

    return (
        <div className="flex-1 flex flex-col bg-stone-950 h-full">
            {/* Sender selection header */}
            <div className="border-b border-stone-800 bg-stone-950 p-3 md:p-4 flex-shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-stone-100 text-sm font-medium">Send as:</span>
                        <Select value={selectedSender} onValueChange={(value: "boy" | "girl") => setSelectedSender(value)}>
                            <SelectTrigger className="w-20 md:w-24 bg-stone-800 border-stone-700 text-stone-100 text-sm">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-stone-800 border-stone-700">
                                <SelectItem value="boy" className="text-stone-100">
                                    <span className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                        Boy
                                    </span>
                                </SelectItem>
                                <SelectItem value="girl" className="text-stone-100">
                                    <span className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                                        Girl
                                    </span>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {currentChat && (
                        <ChatSettings
                            chatId={chatId}
                            userId={userId}
                            currentName={currentChat.name}
                            currentDescription={currentChat.description}
                            onUpdate={() => {
                                refetchChat();
                                onChatUpdated();
                            }}
                            onDelete={onChatDeleted}
                        />
                    )}
                </div>
            </div>

            {/* Messages area - this will be scrollable */}
            <div className="flex-1 overflow-y-auto">
                <div className="chat-conversation-container h-full">
                    {!isEmpty && (
                        <div className="p-3 md:p-4 space-y-4">
                            {transformedMessages.map((message) => (
                                <CustomMessage
                                    key={message.id}
                                    message={message}
                                    chatId={chatId}
                                    onUpdate={refetch}
                                />
                            ))}
                        </div>
                    )}

                    {isEmpty && (
                        <div className="flex items-center justify-center h-full p-4">
                            <div className="text-center text-stone-500 max-w-md">
                                <p className="text-lg font-medium">No messages yet</p>
                                <p className="text-sm mt-2">Start a conversation by sending a message below</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Message input fixed at bottom */}
            <div className="border-t border-stone-800 bg-stone-950 p-3 md:p-4 flex-shrink-0">
                <div className="chat-conversation-container">
                    <ChatForm
                        isPending={isLoading}
                        handleSubmit={handleSubmit}
                    >
                        {({ files, setFiles }) => (
                            <MessageInput
                                value={input}
                                onChange={handleInputChange}
                                allowAttachments={false}
                                isGenerating={isLoading}
                                placeholder="Type your message..."
                                className="bg-stone-900 border-stone-700 text-stone-100 placeholder-stone-500 min-h-[44px]"
                            />
                        )}
                    </ChatForm>
                </div>
            </div>
        </div>
    );
}; 