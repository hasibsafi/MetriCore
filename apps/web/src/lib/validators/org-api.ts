import { z } from "zod";

export const createOrgSchema = z.object({
  name: z.string().trim().min(2, "Organization name is required").max(120)
});
