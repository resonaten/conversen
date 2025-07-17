"use client";

import { useState } from "react";
import { Download, Edit, Trash, Settings } from "lucide-react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface ChatSettingsProps {
    chatId: number;
    userId: number;
    currentName: string;
    currentDescription: string;
    onUpdate: () => void;
    onDelete: () => void;
}

export const ChatSettings: React.FC<ChatSettingsProps> = ({
    chatId,
    userId,
    currentName,
    currentDescription,
    onUpdate,
    onDelete,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState(currentName);
    const [description, setDescription] = useState(currentDescription);

    const { data: messages } = api.chat.getMessages.useQuery({ chatId });

    const updateChat = api.chat.update.useMutation({
        onSuccess: () => {
            onUpdate();
            setIsOpen(false);
        },
    });

    const deleteChat = api.chat.delete.useMutation({
        onSuccess: () => {
            onDelete();
            setIsOpen(false);
        },
    });

    const handleUpdateChat = async (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim() && description.trim()) {
            await updateChat.mutateAsync({
                chatId,
                name: name.trim(),
                description: description.trim(),
                userId,
            });
        }
    };

    const handleDeleteChat = async () => {
        if (window.confirm("Are you sure you want to delete this chat? This action cannot be undone.")) {
            await deleteChat.mutateAsync({ chatId, userId });
        }
    };

    const utils = api.useContext();

    const handleExportJSONL = async (exportAll: boolean = false) => {
        try {
            let jsonlContent = '';

            if (exportAll) {
                // Export all chats for this user
                const allChats = await utils.chat.getAll.fetch({ userId });

                if (!allChats || allChats.length === 0) {
                    alert("No chats to export.");
                    return;
                }

                const chatLines = await Promise.all(
                    allChats.map(async (chat) => {
                        const chatMessages = await utils.chat.getMessages.fetch({ chatId: chat.id });

                        return JSON.stringify({
                            chat_name: chat.name,
                            description: chat.description,
                            messages: chatMessages?.map((message) => ({
                                sender: message.sender,
                                content: message.content,
                                timestamp: message.timestamp.toISOString(),
                            })) || []
                        });
                    })
                );

                jsonlContent = chatLines.join('\n');
            } else {
                // Export current chat only
                if (!messages || messages.length === 0) {
                    alert("No messages to export.");
                    return;
                }

                const chatObject = {
                    chat_name: currentName,
                    description: currentDescription,
                    messages: messages.map((message) => ({
                        sender: message.sender,
                        content: message.content,
                        timestamp: message.timestamp.toISOString(),
                    }))
                };

                jsonlContent = JSON.stringify(chatObject);
            }

            const blob = new Blob([jsonlContent], { type: 'application/jsonl' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = exportAll
                ? 'all_chats.jsonl'
                : `${currentName.replace(/[^a-zA-Z0-9]/g, '_')}_chat.jsonl`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Export failed:', error);
            alert('Export failed. Please try again.');
        }
    };

    const handleOpen = (open: boolean) => {
        setIsOpen(open);
        if (open) {
            setName(currentName);
            setDescription(currentDescription);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-stone-400 hover:text-stone-100 hover:bg-stone-800"
                >
                    <Settings className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-stone-900 border-stone-700 text-stone-100 max-w-[calc(100vw-2rem)] md:max-w-md mx-4">
                <DialogHeader>
                    <DialogTitle className="text-stone-100">Chat Settings</DialogTitle>
                    <DialogDescription className="text-stone-400">
                        Manage your chat settings, export data, or delete the chat.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <form onSubmit={handleUpdateChat} className="space-y-4">
                        <div>
                            <label htmlFor="chatName" className="block text-sm font-medium text-stone-200 mb-1">
                                Chat Name
                            </label>
                            <Input
                                id="chatName"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="bg-stone-800 border-stone-700 text-stone-100 placeholder-stone-500"
                                placeholder="Enter chat name..."
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="chatDescription" className="block text-sm font-medium text-stone-200 mb-1">
                                Chat Description
                            </label>
                            <Textarea
                                id="chatDescription"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="bg-stone-800 border-stone-700 text-stone-100 placeholder-stone-500 resize-none"
                                placeholder="Enter chat description..."
                                rows={3}
                                required
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-sm"
                            disabled={updateChat.isPending}
                        >
                            <Edit className="h-4 w-4 mr-2" />
                            {updateChat.isPending ? "Updating..." : "Update Chat"}
                        </Button>
                    </form>

                    <div className="border-t border-stone-800 pt-4 space-y-2">
                        <Button
                            onClick={() => handleExportJSONL(false)}
                            variant="outline"
                            className="w-full bg-stone-800 border-stone-700 text-stone-100 hover:bg-stone-700 text-sm"
                        >
                            <Download className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Export This Chat as JSONL</span>
                            <span className="sm:hidden">Export Chat</span>
                        </Button>
                        <Button
                            onClick={() => handleExportJSONL(true)}
                            variant="outline"
                            className="w-full bg-stone-800 border-stone-700 text-stone-100 hover:bg-stone-700 text-sm"
                        >
                            <Download className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Export All Chats as JSONL</span>
                            <span className="sm:hidden">Export All</span>
                        </Button>
                    </div>

                    <div className="border-t border-stone-800 pt-4">
                        <Button
                            onClick={handleDeleteChat}
                            variant="destructive"
                            className="w-full bg-red-600 hover:bg-red-700 text-sm"
                            disabled={deleteChat.isPending}
                        >
                            <Trash className="h-4 w-4 mr-2" />
                            {deleteChat.isPending ? "Deleting..." : "Delete Chat"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}; 