// app/(store)/account/page.tsx
import React from "react";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateProfile } from "@/actions/auth";

export const dynamic = "force-dynamic";

export default async function AccountProfilePage() {
  const session = await auth();
  const userId = session?.user?.id;

  // Retrieve user record including database values (phone)
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-ink mb-1">Personal Profile</h2>
        <p className="text-xs text-muted">Update your contact information and display details.</p>
      </div>

      <hr className="border-border" />

      {/* Profile Form */}
      <form action={updateProfile} className="space-y-4 max-w-xl">
        <input type="hidden" name="userId" value={user.id} />
        
        {/* Name */}
        <Input
          label="Display Name"
          name="name"
          defaultValue={user.name || ""}
          placeholder="Your full name"
          required
        />

        {/* Email - Disabled (email logins are unique) */}
        <div className="space-y-1.5 opacity-60">
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
            Email Address
          </label>
          <input
            type="email"
            value={user.email}
            disabled
            className="w-full bg-elevated border border-border text-muted text-sm rounded-[var(--radius-btn)] h-10 px-3 cursor-not-allowed"
          />
          <span className="text-[10px] text-faint">Contact admin to modify registered email.</span>
        </div>

        {/* Phone */}
        <Input
          label="Phone Number"
          name="phone"
          defaultValue={user.phone || ""}
          placeholder="03336936666"
        />

        {/* Action Button */}
        <div className="pt-2">
          <Button type="submit" variant="primary" className="px-6 rounded-[var(--radius-btn)] font-semibold h-11">
            Save Profile Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
