import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required")
});

export const signUpSchema = z
  .object({
    email: z.string().trim().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password")
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  });

export const passwordResetRequestSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address")
});

export const passwordResetConfirmSchema = z
  .object({
    token: z.string().min(10, "Reset token is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password")
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  });
