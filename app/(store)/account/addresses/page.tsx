// app/(store)/account/addresses/page.tsx
import React from "react";
import { MapPin, Trash2, Home, Briefcase, Info } from "lucide-react";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createAddress, deleteAddress } from "@/actions/auth";

export const dynamic = "force-dynamic";

export default async function AddressesPage() {
  const session = await auth();
  const userId = session?.user?.id;

  const addresses = await prisma.address.findMany({
    where: { userId },
    orderBy: { isDefault: "desc" },
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-xl font-bold text-ink mb-1">Manage Addresses</h2>
        <p className="text-xs text-muted">Manage your billing and shipping addresses for faster checkout.</p>
      </div>

      <hr className="border-border" />

      {/* Address cards list */}
      <div className="space-y-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">Saved Addresses</h3>
        
        {addresses.length === 0 ? (
          <p className="text-sm text-muted bg-elevated/20 p-4 rounded border border-border border-dashed">
            No saved addresses found. Add a shipping address below to make checking out faster.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {addresses.map((addr) => {
              const LabelIcon = addr.label === "Home" ? Home : addr.label === "Office" ? Briefcase : Info;
              return (
                <div
                  key={addr.id}
                  className={`border rounded-lg p-5 bg-elevated/30 flex flex-col justify-between relative group transition-all duration-200 ${
                    addr.isDefault ? "border-gold/60" : "border-border hover:border-gold/30"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 bg-gold/10 text-gold text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                        <LabelIcon size={12} />
                        {addr.label}
                      </span>
                      {addr.isDefault && (
                        <span className="text-[10px] font-bold text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded">
                          Default
                        </span>
                      )}
                    </div>

                    <div className="text-sm text-muted leading-relaxed">
                      <span className="font-bold text-ink block">{addr.name}</span>
                      <span>{addr.address}</span>
                      <span className="block">{addr.city}{addr.state ? `, ${addr.state}` : ""}{addr.zip ? ` ${addr.zip}` : ""}</span>
                      <span className="block">{addr.country}</span>
                      {addr.phone && <span className="block mt-1 font-semibold text-xs text-ink">Tel: {addr.phone}</span>}
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-border/40 mt-4">
                    <form action={deleteAddress}>
                      <input type="hidden" name="addressId" value={addr.id} />
                      <button
                        type="submit"
                        className="text-muted hover:text-crimson p-1 rounded hover:bg-elevated cursor-pointer transition-colors"
                        aria-label="Delete address"
                      >
                        <Trash2 size={16} />
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <hr className="border-border" />

      {/* Add Address Form */}
      <div className="space-y-4 max-w-xl bg-surface border border-border p-5 rounded-[var(--radius-card)]">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-ink flex items-center gap-2">
          <MapPin size={16} className="text-gold" />
          Add New Address
        </h3>

        <form action={createAddress} className="space-y-4">
          <input type="hidden" name="userId" value={userId} />

          {/* Label selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
              Address Label
            </label>
            <select
              name="label"
              className="w-full bg-elevated border border-border text-ink text-sm rounded-[var(--radius-btn)] h-10 px-3 focus:outline-none focus:border-gold cursor-pointer"
            >
              <option value="Home">Home (Residential)</option>
              <option value="Office">Office (Work)</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Recipient name */}
          <Input
            label="Recipient Name *"
            name="name"
            placeholder="John Doe"
            required
          />

          {/* Phone */}
          <Input
            label="Phone Number *"
            name="phone"
            placeholder="03336936666"
            required
          />

          {/* Street Address */}
          <Input
            label="Street Address *"
            name="address"
            placeholder="House, Street, Area details"
            required
          />

          {/* Grid fields */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="City *"
              name="city"
              placeholder="Depalpur"
              required
            />
            <Input
              label="State / Province"
              name="state"
              placeholder="Punjab"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Postal Code (Zip)"
              name="zip"
              placeholder="56180"
            />
            <Input
              label="Country *"
              name="country"
              defaultValue="Pakistan"
              required
            />
          </div>

          {/* Default Switch toggle */}
          <div className="pt-2">
            <label className="flex items-center gap-2.5 text-sm text-muted cursor-pointer hover:text-ink transition-colors">
              <input
                type="checkbox"
                name="isDefault"
                className="rounded border-border bg-void text-gold focus:ring-gold h-4 w-4"
              />
              <span>Set as default shipping address</span>
            </label>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <Button type="submit" variant="primary" className="px-6 rounded-[var(--radius-btn)] font-semibold h-11">
              Save Address
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
