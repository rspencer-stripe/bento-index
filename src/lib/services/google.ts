import { prisma } from "@/lib/db/prisma";
import { MindItem } from "@/lib/types";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface GoogleTokens {
  accessToken: string;
  refreshToken: string | null;
  expiresAt: Date | null;
}

async function refreshTokenIfNeeded(
  userId: string,
  tokens: GoogleTokens
): Promise<string> {
  if (!tokens.expiresAt || tokens.expiresAt > new Date()) {
    return tokens.accessToken;
  }

  if (!tokens.refreshToken) {
    throw new Error("Token expired and no refresh token available");
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: tokens.refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to refresh token");
  }

  const data = await response.json();

  await prisma.integrationConnection.update({
    where: { userId_provider: { userId, provider: "google" } },
    data: {
      accessToken: data.access_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
    },
  });

  return data.access_token;
}

export async function fetchCalendarEvents(userId: string): Promise<MindItem[]> {
  const connection = await prisma.integrationConnection.findUnique({
    where: { userId_provider: { userId, provider: "google" } },
  });

  if (!connection) {
    return [];
  }

  const accessToken = await refreshTokenIfNeeded(userId, {
    accessToken: connection.accessToken,
    refreshToken: connection.refreshToken,
    expiresAt: connection.expiresAt,
  });

  const now = new Date();
  const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
      new URLSearchParams({
        timeMin: now.toISOString(),
        timeMax: oneWeekFromNow.toISOString(),
        singleEvents: "true",
        orderBy: "startTime",
        maxResults: "50",
      }),
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!response.ok) {
    console.error("Failed to fetch calendar events:", await response.text());
    return [];
  }

  const data = await response.json();
  const events = data.items || [];

  return events.map((event: any) => {
    const startTime = event.start?.dateTime || event.start?.date;
    const endTime = event.end?.dateTime || event.end?.date;

    // Detect event type
    let eventType: "oneOnOne" | "teamSync" | "external" | "focus" | "allHands" =
      "teamSync";
    const attendeeCount = event.attendees?.length || 0;
    if (attendeeCount === 2) eventType = "oneOnOne";
    else if (attendeeCount > 10) eventType = "allHands";
    else if (
      event.attendees?.some(
        (a: any) => a.email && !a.email.endsWith("@stripe.com")
      )
    )
      eventType = "external";

    // Extract Zoom/Meet link
    let zoomLink = event.hangoutLink || "";
    if (event.conferenceData?.entryPoints) {
      const videoEntry = event.conferenceData.entryPoints.find(
        (e: any) => e.entryPointType === "video"
      );
      if (videoEntry) zoomLink = videoEntry.uri;
    }

    return {
      id: `cal-${event.id}`,
      tag: "#Calendar",
      type: "event" as const,
      priority: 4,
      title: event.summary || "Untitled Event",
      snippet: event.description?.slice(0, 200) || "",
      source: "calendar" as const,
      sourceMeta: {
        source: "calendar" as const,
        meta: {
          eventType,
          startsAt: startTime,
          endsAt: endTime,
          attendees:
            event.attendees?.map((a: any) => ({
              name: a.displayName || a.email?.split("@")[0] || "Unknown",
              email: a.email,
              avatarUrl: "",
            })) || [],
          zoomLink,
          location: event.location || "",
          tetheredArtifacts: [],
        },
      },
      createdAt: event.created,
      lastTouchedAt: startTime || event.updated || event.created,
    } as MindItem;
  });
}

export async function fetchDriveFiles(userId: string): Promise<MindItem[]> {
  const connection = await prisma.integrationConnection.findUnique({
    where: { userId_provider: { userId, provider: "google" } },
  });

  if (!connection) {
    return [];
  }

  const accessToken = await refreshTokenIfNeeded(userId, {
    accessToken: connection.accessToken,
    refreshToken: connection.refreshToken,
    expiresAt: connection.expiresAt,
  });

  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?` +
      new URLSearchParams({
        orderBy: "modifiedTime desc",
        pageSize: "30",
        fields:
          "files(id,name,mimeType,modifiedTime,webViewLink,lastModifyingUser)",
        q: "mimeType contains 'application/vnd.google-apps'",
      }),
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!response.ok) {
    console.error("Failed to fetch drive files:", await response.text());
    return [];
  }

  const data = await response.json();
  const files = data.files || [];

  return files.map((file: any) => {
    // Detect tag from filename
    let tag = "#Documents";
    const lowerName = file.name.toLowerCase();
    if (lowerName.includes("radar")) tag = "#Radar";
    else if (lowerName.includes("dispute")) tag = "#Disputes";
    else if (lowerName.includes("apollo")) tag = "#Apollo";

    return {
      id: `drive-${file.id}`,
      tag,
      type: "artifact" as const,
      priority: 3,
      title: file.name,
      snippet: `Last modified by ${file.lastModifyingUser?.displayName || "Unknown"}`,
      source: "drive" as const,
      sourceMeta: {
        source: "drive" as const,
        meta: {
          docTitle: file.name,
          executiveSummary: "",
          lastEditors: [
            {
              name: file.lastModifyingUser?.displayName || "Unknown",
              editedAt: file.modifiedTime,
            },
          ],
          webUrl: file.webViewLink || "",
        },
      },
      createdAt: file.modifiedTime,
      lastTouchedAt: file.modifiedTime,
    } as MindItem;
  });
}
