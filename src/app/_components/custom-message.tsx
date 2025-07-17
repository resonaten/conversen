"use client";

import React from "react";
import { ChatMessage, type Message } from "@/components/ui/chat-message";
import { MessageActions } from "./message-actions";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface CustomMessageProps {
    message: Message & {
        originalId: number;
        originalSender: "boy" | "girl";
    };
    chatId: number;
    onUpdate: () => void;
}

export const CustomMessage: React.FC<CustomMessageProps> = ({
    message,
    chatId,
    onUpdate,
}) => {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <div className="cursor-pointer">
                    <ChatMessage
                        {...message}
                        showTimeStamp={true}
                        animation="scale"
                    />
                </div>
            </PopoverTrigger>
            <PopoverContent
                className="w-48 p-1 bg-stone-900 border-stone-700"
                align={message.originalSender === "boy" ? "end" : "start"}
            >
                <MessageActions
                    messageId={message.originalId}
                    currentContent={message.content}
                    currentSender={message.originalSender}
                    chatId={chatId}
                    onUpdate={onUpdate}
                />
            </PopoverContent>
        </Popover>
    );
}; 