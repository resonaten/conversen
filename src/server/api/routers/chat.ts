import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const chatRouter = createTRPCRouter({
    // Get all chats for a specific user
    getAll: publicProcedure
        .input(z.object({ userId: z.number() }))
        .query(async ({ ctx, input }) => {
            return ctx.db.chat.findMany({
                where: { userId: input.userId },
                orderBy: { createdAt: "desc" },
            });
        }),

    getById: publicProcedure
        .input(
            z.object({
                chatId: z.number(),
                userId: z.number(),
            }),
        )
        .query(async ({ ctx, input }) => {
            return ctx.db.chat.findFirst({
                where: {
                    id: input.chatId,
                    userId: input.userId,
                },
            });
        }),

    // Create a new chat
    create: publicProcedure
        .input(z.object({
            name: z.string().min(1),
            description: z.string().min(1),
            userId: z.number(),
        }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.chat.create({
                data: {
                    name: input.name,
                    description: input.description,
                    userId: input.userId,
                },
            });
        }),

    update: publicProcedure
        .input(
            z.object({
                chatId: z.number(),
                name: z.string().min(1),
                description: z.string().min(1),
                userId: z.number(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            return ctx.db.chat.updateMany({
                where: {
                    id: input.chatId,
                    userId: input.userId,
                },
                data: {
                    name: input.name,
                    description: input.description,
                },
            });
        }),

    delete: publicProcedure
        .input(
            z.object({
                chatId: z.number(),
                userId: z.number(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            // First verify ownership and delete all messages in the chat
            await ctx.db.message.deleteMany({
                where: {
                    chatId: input.chatId,
                    chat: { userId: input.userId },
                },
            });

            // Then delete the chat itself (only if owned by user)
            return ctx.db.chat.deleteMany({
                where: {
                    id: input.chatId,
                    userId: input.userId,
                },
            });
        }),

    // Get messages for a specific chat
    getMessages: publicProcedure
        .input(z.object({ chatId: z.number() }))
        .query(async ({ ctx, input }) => {
            return ctx.db.message.findMany({
                where: { chatId: input.chatId },
                orderBy: { timestamp: "asc" },
            });
        }),

    // Create a new message
    createMessage: publicProcedure
        .input(z.object({
            chatId: z.number(),
            sender: z.enum(["boy", "girl"]),
            content: z.string().min(1),
        }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.message.create({
                data: {
                    chatId: input.chatId,
                    sender: input.sender,
                    content: input.content,
                    timestamp: new Date(),
                },
            });
        }),

    // Update a message
    updateMessage: publicProcedure
        .input(z.object({
            messageId: z.number(),
            content: z.string().min(1),
            sender: z.enum(["boy", "girl"]),
        }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.message.update({
                where: { id: input.messageId },
                data: {
                    content: input.content,
                    sender: input.sender,
                },
            });
        }),

    // Delete a message
    deleteMessage: publicProcedure
        .input(z.object({
            messageId: z.number(),
        }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.message.delete({
                where: { id: input.messageId },
            });
        }),
}); 