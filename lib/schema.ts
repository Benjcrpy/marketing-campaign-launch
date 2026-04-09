import { z } from "zod";

export const UserProfileSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  company: z.string().min(1),
  website: z.string().url().or(z.literal("")).default("")
});

export const CampaignSchema = z.object({
  campaignName: z.string().min(1),
  productOrService: z.string().min(1),
  targetAudience: z.string().min(1),
  primaryGoal: z.string().min(1),
  channels: z.array(z.string().min(1)).min(1),
  startDate: z.string().optional().default(""),
  endDate: z.string().optional().default(""),
  brandVoice: z.string().min(1),
  offer: z.string().optional().default("")
});

export const CredentialsSchema = z.object({
  openrouterApiKey: z.string().optional().default(""),
  hermesApiKey: z.string().optional().default(""),
  hermesBaseUrl: z.string().optional().default(""),
  x: z
    .object({
      apiKey: z.string().optional().default(""),
      apiSecret: z.string().optional().default(""),
      accessToken: z.string().optional().default(""),
      accessTokenSecret: z.string().optional().default("")
    })
    .default({}),
  instagram: z
    .object({
      accessToken: z.string().optional().default("")
    })
    .default({}),
  reddit: z
    .object({
      clientId: z.string().optional().default(""),
      clientSecret: z.string().optional().default(""),
      refreshToken: z.string().optional().default("")
    })
    .default({}),
  smtp: z
    .object({
      host: z.string().optional().default(""),
      port: z.string().optional().default("587"),
      user: z.string().optional().default(""),
      pass: z.string().optional().default("")
    })
    .default({})
});

export type UserProfile = z.infer<typeof UserProfileSchema>;
export type Campaign = z.infer<typeof CampaignSchema>;
export type Credentials = z.infer<typeof CredentialsSchema>;

