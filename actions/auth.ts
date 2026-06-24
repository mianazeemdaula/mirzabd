// actions/auth.ts
"use server";

import { revalidatePath } from "next/cache";
import { hash } from "bcryptjs";
import prisma from "@/lib/prisma";

/**
 * Server Action to update the user profile details
 */
export async function updateProfile(formData: FormData) {
  const userId = formData.get("userId") as string;
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;

  if (!userId) {
    throw new Error("User ID is required");
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        name: name || null,
        phone: phone || null,
      },
    });

    revalidatePath("/account");
  } catch (error) {
    console.error("Failed to update profile:", error);
    throw new Error("Failed to update profile. Please try again.");
  }
}

/**
 * Server Action to register a new customer user account
 */
export async function registerUser(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password || !name) {
    return { error: "All fields are required" };
  }

  try {
    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return { error: "Email is already registered" };
    }

    // Hash password
    const passwordHash = await hash(password, 12);

    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "CUSTOMER",
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Registration error:", error);
    return { error: "Something went wrong. Please try again." };
  }
}

/**
 * Server Action to save a new customer address
 */
export async function createAddress(formData: FormData) {
  const userId = formData.get("userId") as string;
  const label = (formData.get("label") as string) || "Home";
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const address = formData.get("address") as string;
  const city = formData.get("city") as string;
  const state = formData.get("state") as string;
  const zip = formData.get("zip") as string;
  const country = (formData.get("country") as string) || "Pakistan";
  const isDefault = formData.get("isDefault") === "on";

  if (!userId || !name || !address || !city) {
    throw new Error("Missing required address fields");
  }

  try {
    if (isDefault) {
      // Set all other user addresses to not default
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    // Check if it's the first address, if so, make it default
    const count = await prisma.address.count({ where: { userId } });
    const shouldBeDefault = count === 0 ? true : isDefault;

    await prisma.address.create({
      data: {
        userId,
        label,
        name,
        phone,
        address,
        city,
        state,
        zip,
        country,
        isDefault: shouldBeDefault,
      },
    });

    revalidatePath("/account/addresses");
  } catch (error) {
    console.error("Failed to create address:", error);
    throw new Error("Failed to save address.");
  }
}

/**
 * Server Action to delete a customer address
 */
export async function deleteAddress(formData: FormData) {
  const addressId = formData.get("addressId") as string;

  if (!addressId) {
    throw new Error("Address ID is required");
  }

  try {
    await prisma.address.delete({
      where: { id: addressId },
    });

    revalidatePath("/account/addresses");
  } catch (error) {
    console.error("Failed to delete address:", error);
    throw new Error("Failed to delete address.");
  }
}
