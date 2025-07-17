"use client";

import { useState } from "react";
import { Edit, Trash } from "lucide-react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface MessageActionsProps {
    messageId: number;
    currentContent: string;
    currentSender: "boy" | "girl";
    chatId: number;
    onUpdate: () => void;
}

export const MessageActions: React.FC<MessageActionsProps> = ({
    messageId,
    currentContent,
    currentSender,
    chatId,
    onUpdate,
}) => {
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editContent, setEditContent] = useState(currentContent);
    const [editSender, setEditSender] = useState<"boy" | "girl">(currentSender);

    const updateMessage = api.chat.updateMessage.useMutation({
        onSuccess: () => {
            onUpdate();
            setIsEditDialogOpen(false);
        },
    });

    const deleteMessage = api.chat.deleteMessage.useMutation({
        onSuccess: () => {
            onUpdate();
        },
    });

    const handleEdit = () => {
        setEditContent(currentContent);
        setEditSender(currentSender);
        setIsEditDialogOpen(true);
    };

    const handleDelete = async () => {
        await deleteMessage.mutateAsync({ messageId });
    };

    const handleSaveEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editContent.trim()) {
            await updateMessage.mutateAsync({
                messageId,
                content: editContent.trim(),
                sender: editSender,
            });
        }
    };

    const handleChangeRole = async (newSender: "boy" | "girl") => {
        await updateMessage.mutateAsync({
            messageId,
            content: currentContent,
            sender: newSender,
        });
    };

    return (
        <>
            <div className="flex flex-col gap-1">
                <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start text-stone-100 hover:bg-stone-800"
                    onClick={handleEdit}
                >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit message
                </Button>

                <div className="px-2 py-1">
                    <span className="text-xs text-stone-400 font-medium">Change role to:</span>
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start text-stone-100 hover:bg-stone-800"
                    onClick={() => handleChangeRole("boy")}
                    disabled={currentSender === "boy"}
                >
                    <div className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
                    Boy {currentSender === "boy" && "(current)"}
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start text-stone-100 hover:bg-stone-800"
                    onClick={() => handleChangeRole("girl")}
                    disabled={currentSender === "girl"}
                >
                    <div className="w-2 h-2 rounded-full bg-pink-500 mr-2" />
                    Girl {currentSender === "girl" && "(current)"}
                </Button>

                <div className="border-t border-stone-800 my-1" />

                <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start text-red-400 hover:bg-red-950 hover:text-red-300"
                    onClick={handleDelete}
                    disabled={deleteMessage.isPending}
                >
                    <Trash className="h-4 w-4 mr-2" />
                    Delete message
                </Button>
            </div>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="bg-stone-900 border-stone-700 text-stone-100">
                    <DialogHeader>
                        <DialogTitle className="text-stone-100">Edit Message</DialogTitle>
                        <DialogDescription className="text-stone-400">
                            Modify the message content and sender role if needed.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSaveEdit} className="space-y-4">
                        <div>
                            <label htmlFor="editContent" className="block text-sm font-medium text-stone-200 mb-1">
                                Message Content
                            </label>
                            <Input
                                id="editContent"
                                type="text"
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="bg-stone-800 border-stone-700 text-stone-100 placeholder-stone-500"
                                placeholder="Enter message content..."
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="editSender" className="block text-sm font-medium text-stone-200 mb-1">
                                Sender Role
                            </label>
                            <Select value={editSender} onValueChange={(value: "boy" | "girl") => setEditSender(value)}>
                                <SelectTrigger className="bg-stone-800 border-stone-700 text-stone-100">
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
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setIsEditDialogOpen(false)}
                                className="bg-stone-700 hover:bg-stone-600 text-stone-100"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700"
                                disabled={updateMessage.isPending}
                            >
                                {updateMessage.isPending ? "Saving..." : "Save Changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}; 