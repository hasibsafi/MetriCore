import { z } from "zod";

export const ga4PropertyIdSchema = z
  .string()
  .trim()
  .regex(/^properties\/\d+$/, "ga4PropertyId must match properties/<digits>");

export const gscSiteUrlSchema = z
  .string()
  .trim()
  .regex(/^(sc-domain:.+|https?:\/\/.+)$/, "gscSiteUrl must be sc-domain:<domain> or http(s)://...");

export const integrationUpdateBodySchema = z
  .object({
    ga4PropertyId: ga4PropertyIdSchema.optional(),
    gscSiteUrl: gscSiteUrlSchema.optional()
  })
  .refine((value) => value.ga4PropertyId || value.gscSiteUrl, {
    message: "At least one of ga4PropertyId or gscSiteUrl must be provided"
  });
