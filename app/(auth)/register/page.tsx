// app/(auth)/register/page.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import { RegisterSchema, RegisterFormValues } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { registerUser } from "@/actions/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("email", values.email);
      formData.append("password", values.password);

      const res = await registerUser(formData);

      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Account created successfully! Please sign in.");
        router.push("/login");
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
        <h2 className="font-display text-lg sm:text-xl font-bold text-ink">Create Account</h2>
        <p className="text-xs text-muted">Join us today to build your custom literary shelf</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name */}
        <Input
          label="Full Name"
          {...register("name")}
          placeholder="John Doe"
          error={errors.name?.message}
        />

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
          placeholder="Min. 8 characters"
          error={errors.password?.message}
        />

        {/* Confirm Password */}
        <Input
          label="Confirm Password"
          type="password"
          {...register("confirmPassword")}
          placeholder="Re-enter your password"
          error={errors.confirmPassword?.message}
        />

        {/* Submit */}
        <div className="pt-2">
          <Button
            type="submit"
            disabled={isLoading}
            variant="primary"
            className="w-full h-11 rounded-[var(--radius-btn)] font-semibold flex items-center justify-center gap-2"
          >
            <UserPlus size={16} />
            {isLoading ? "Registering..." : "Create Account"}
          </Button>
        </div>
      </form>

      <hr className="border-border" />

      {/* Alternative links */}
      <div className="text-center text-xs space-y-1">
        <span className="text-muted">Already have an account? </span>
        <Link href="/login" className="text-gold font-semibold hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
}
