import { z } from "zod";

export const createOrgBodySchema = z.object({
  name: z.string().trim().min(2, "Organization name must be at least 2 characters.").max(80, "Organization name must be at most 80 characters.")
});

export const createSiteBodySchema = z.object({
  url: z.string().trim().min(1, "URL is required."),
  displayName: z.string().trim().min(2, "Display name must be at least 2 characters.").max(80, "Display name must be at most 80 characters.")
});
