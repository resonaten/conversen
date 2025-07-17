import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { createHash } from "crypto";

export const authRouter = createTRPCRouter({
    signIn: publicProcedure
        .input(
            z.object({
                username: z.string().min(1),
                password: z.string().min(1),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            // Hash the password with MD5
            const hashedPassword = createHash('md5').update(input.password).digest('hex');

            // Find user with matching username and password
            const user = await ctx.db.user.findFirst({
                where: {
                    username: input.username,
                    password: hashedPassword,
                },
            });

            if (!user) {
                throw new Error("Invalid username or password");
            }

            return {
                id: user.id,
                username: user.username,
            };
        }),

    getCurrentUser: publicProcedure
        .input(z.object({ userId: z.number() }))
        .query(async ({ ctx, input }) => {
            const user = await ctx.db.user.findUnique({
                where: { id: input.userId },
                select: {
                    id: true,
                    username: true,
                },
            });

            return user;
        }),
}); 