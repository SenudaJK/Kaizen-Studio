import { z } from "zod";
import { MIN_PASSWORD_LENGTH } from "./domain/account";

export const updateProfileSchema = z.object({
  name: z.string().trim().max(80, "Keep your name under 80 characters."),
});

export const changePasswordSchema = z.object({
  current: z.string().min(1, "Enter your current password."),
  next: z.string().min(MIN_PASSWORD_LENGTH, `Use at least ${MIN_PASSWORD_LENGTH} characters.`).max(200, "That password is too long."),
});

export const deleteAccountSchema = z.object({ email: z.string().max(320) });
