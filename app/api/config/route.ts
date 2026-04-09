import path from "node:path";
import { NextResponse } from "next/server";

import { CampaignSchema, CredentialsSchema, UserProfileSchema } from "@/lib/schema";
import { CONFIG_DIR, readJson, writeJson } from "@/lib/storage";

const userPath = path.join(CONFIG_DIR, "user_profile.json");
const campaignPath = path.join(CONFIG_DIR, "campaign.json");
const credentialsPath = path.join(CONFIG_DIR, "credentials.json");

export async function GET() {
  const userProfile = await readJson(userPath, null);
  const campaign = await readJson(campaignPath, null);
  const credentials = await readJson(credentialsPath, null);
  return NextResponse.json({ userProfile, campaign, credentials });
}

export async function POST(req: Request) {
  const body = await req.json();
  const userProfileParsed = UserProfileSchema.safeParse(body.userProfile);
  const campaignParsed = CampaignSchema.safeParse(body.campaign);
  const credentialsParsed = CredentialsSchema.safeParse(body.credentials ?? {});

  const issues = [
    ...(userProfileParsed.success ? [] : userProfileParsed.error.issues.map((i) => ({ scope: "userProfile", ...i }))),
    ...(campaignParsed.success ? [] : campaignParsed.error.issues.map((i) => ({ scope: "campaign", ...i }))),
    ...(credentialsParsed.success ? [] : credentialsParsed.error.issues.map((i) => ({ scope: "credentials", ...i })))
  ];

  if (issues.length) {
    return NextResponse.json(
      {
        error: "Validation failed",
        issues
      },
      { status: 400 }
    );
  }

  const userProfile = userProfileParsed.data;
  const campaign = campaignParsed.data;
  const credentials = credentialsParsed.data;

  await writeJson(userPath, userProfile);
  await writeJson(campaignPath, campaign);
  await writeJson(credentialsPath, credentials);

  return NextResponse.json({ ok: true });
}

