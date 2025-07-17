"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface SignInProps {
    onSignIn: (user: { id: number; username: string }) => void;
}

export const SignIn: React.FC<SignInProps> = ({ onSignIn }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    const signInMutation = api.auth.signIn.useMutation({
        onSuccess: (user) => {
            onSignIn(user);
            setError(null);
        },
        onError: (error) => {
            setError(error.message);
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (username.trim() && password.trim()) {
            await signInMutation.mutateAsync({
                username: username.trim(),
                password: password.trim(),
            });
        }
    };

    return (
        <div className="min-h-screen bg-stone-950 flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-stone-900 border-stone-800">
                <CardHeader className="text-center">
                    <CardTitle className="text-xl md:text-2xl text-stone-100">Sign In</CardTitle>
                    <CardDescription className="text-stone-400 text-sm md:text-base">
                        Enter your credentials to access conversen Dataset Tool
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-stone-200 mb-1">
                                Username
                            </label>
                            <Input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="bg-stone-800 border-stone-700 text-stone-100 placeholder-stone-500 h-11"
                                placeholder="Enter your username"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-stone-200 mb-1">
                                Password
                            </label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-stone-800 border-stone-700 text-stone-100 placeholder-stone-500 h-11"
                                placeholder="Enter your password"
                                required
                            />
                        </div>
                        {error && (
                            <div className="text-red-400 text-sm text-center p-2 bg-red-900/20 rounded-md border border-red-800">
                                {error}
                            </div>
                        )}
                        <Button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 h-11"
                            disabled={signInMutation.isPending}
                        >
                            {signInMutation.isPending ? "Signing in..." : "Sign In"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}; 