"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const Signin = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const router = useRouter();

  const signinMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const signinData = await signIn("credentials", {
        username: credentials.email,
        password: credentials.password,
        callbackUrl: "/dashboard",
        redirect: false,
      });

      if (!signinData?.ok) {
        throw new Error("Invalid email or password. Please try again.");
      }

      return signinData;
    },
    onSuccess: (data) => {
      router.push(data?.url || "/");
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    signinMutation.mutate({ email, password });
  };

  const onEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const onPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  return (
    <div className="flex justify-center items-center h-screen relative bg-[url('/signin-page.jpg')] bg-cover bg-center">
      {signinMutation.isError && (
        <div className="absolute top-4 right-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded w-80">
          {signinMutation.error?.message}
        </div>
      )}

      <Card className="form-container">
        <CardHeader>
          <CardTitle className="form-title text-center">Sign In</CardTitle>
          <CardDescription className="form-description text-center">
            Welcome back! Please sign in to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                onChange={onEmailChange}
                value={email}
                required
                type="email"
                id="email"
                placeholder="Enter your email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                onChange={onPasswordChange}
                value={password}
                required
                type="password"
                id="password"
                placeholder="Enter your password"
              />
            </div>

            <Button
              type="submit"
              disabled={signinMutation.isPending}
              className="w-full"
            >
              {signinMutation.isPending ? "Signing In..." : "Sign In"}
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                className="w-full flex items-center justify-center gap-2"
              >
                <Image
                  src="/google.svg"
                  alt="Google"
                  width={20}
                  height={20}
                  className="w-5 h-5"
                />
                <span className="hidden sm:inline">Google</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
                className="w-full flex items-center justify-center gap-2"
              >
                <Image
                  src="/github.svg"
                  alt="GitHub"
                  width={20}
                  height={20}
                  className="w-5 h-5"
                />
                <span className="hidden sm:inline">GitHub</span>
              </Button>
            </div>

            <p className="text-sm text-center text-gray-600 mt-4">
              Don&apos;t have an account?{" "}
              <a href="/api/signup" className="text-blue-500 hover:underline">
                Sign Up
              </a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signin