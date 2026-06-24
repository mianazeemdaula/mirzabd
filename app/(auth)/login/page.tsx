// app/(auth)/login/page.tsx
"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { LogIn } from "lucide-react";
import { LoginSchema, LoginFormValues } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (res?.error) {
        toast.error("Invalid email or password. Please try again.");
      } else {
        toast.success("Successfully signed in!");
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h2 className="font-display text-2xl font-bold text-ink">Welcome Back</h2>
        <p className="text-xs text-muted">Sign in to manage orders, addresses and wishlist</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <Input
          label="Email Address"
          type="email"
          {...register("email")}
          placeholder="yourname@example.com"
          error={errors.email?.message}
        />

        {/* Password */}
        <Input
          label="Password"
          type="password"
          {...register("password")}
          placeholder="Enter your password"
          error={errors.password?.message}
        />

        {/* Submit */}
        <div className="pt-2">
          <Button
            type="submit"
            disabled={isLoading}
            variant="primary"
            className="w-full h-11 rounded-[var(--radius-btn)] font-semibold flex items-center justify-center gap-2"
          >
            <LogIn size={16} />
            {isLoading ? "Signing In..." : "Sign In"}
          </Button>
        </div>
      </form>

      <hr className="border-border" />

      {/* Alternative links */}
      <div className="text-center text-xs space-y-1">
        <span className="text-muted">Don't have an account? </span>
        <Link href="/register" className="text-gold font-semibold hover:underline">
          Create an account
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center py-4 text-muted font-body text-xs">Loading form...</div>}>
      <LoginForm />
    </Suspense>
  );
}






