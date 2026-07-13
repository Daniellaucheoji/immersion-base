import { z } from "zod";

export const registrationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name is too long"),
  email: z
    .string()
    .trim()
    .email("Enter a valid email")
    .max(120, "Email is too long"),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number")
    .max(30, "Phone number is too long")
    .regex(/^[+\d][\d\s().-]{6,}$/, "Enter a valid phone number"),
  experience: z.enum(["VR", "FIFA"], {
    error: "Select VR or FIFA",
  }),
  disclaimer_accepted: z.literal(true, {
    error: "You must accept the health & safety disclaimer to continue",
  }),
  checked_in_by_team_member_id: z.string().uuid().optional().nullable(),
});

export const statusUpdateSchema = z.object({
  status: z.enum(["waiting", "ready", "playing", "completed", "no_show"]),
});

export const teamMemberSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(80),
  email: z.string().trim().email("Enter a valid email").max(120),
  role: z.string().trim().min(2, "Role is required").max(80),
});

export const eventSchema = z.object({
  name: z.string().trim().min(2, "Event name is required").max(120),
  location: z.string().trim().min(2, "Location is required").max(160),
  event_date: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date"),
  start_time: z.string().trim().optional().nullable(),
  end_time: z.string().trim().optional().nullable(),
  active: z.boolean().optional(),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;
