import { z } from "zod";

const cuidRegex = /^c[a-z0-9]{24}$/i;
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const orgIdSchema = z
  .string()
  .trim()
  .min(1, "orgId is required")
  .refine((value) => cuidRegex.test(value) || uuidRegex.test(value), {
    message: "Invalid organization id"
  });

export function parseOrgId(value: string): string {
  return orgIdSchema.parse(value);
}
