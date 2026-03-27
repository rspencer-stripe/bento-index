import { prisma } from "@/lib/db/prisma";
import { MindItem } from "@/lib/types";

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function fetchSlackMessages(userId: string): Promise<MindItem[]> {
  const connection = await prisma.integrationConnection.findUnique({
    where: { userId_provider: { userId, provider: "slack" } },
  });

  if (!connection) {
    return [];
  }

  const accessToken = connection.accessToken;

  // Fetch recent messages from conversations
  const conversationsResponse = await fetch(
    "https://slack.com/api/conversations.list?" +
      new URLSearchParams({
        types: "im,mpim,private_channel",
        limit: "20",
      }),
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!conversationsResponse.ok) {
    console.error("Failed to fetch Slack conversations");
    return [];
  }

  const conversationsData = await conversationsResponse.json();
  if (!conversationsData.ok) {
    console.error("Slack API error:", conversationsData.error);
    return [];
  }

  const channels = conversationsData.channels || [];
  const items: MindItem[] = [];

  // Fetch recent messages from each conversation
  for (const channel of channels.slice(0, 10)) {
    const historyResponse = await fetch(
      "https://slack.com/api/conversations.history?" +
        new URLSearchParams({
          channel: channel.id,
          limit: "5",
        }),
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!historyResponse.ok) continue;

    const historyData = await historyResponse.json();
    if (!historyData.ok) continue;

    const messages = historyData.messages || [];

    for (const message of messages) {
      if (!message.text || message.subtype) continue;

      // Detect priority based on content
      let priority = 3;
      const lowerText = message.text.toLowerCase();
      if (
        lowerText.includes("urgent") ||
        lowerText.includes("asap") ||
        lowerText.includes("blocking")
      ) {
        priority = 5;
      } else if (
        lowerText.includes("waiting") ||
        lowerText.includes("need your")
      ) {
        priority = 4;
      }

      // Detect tag from content
      let tag = "#Slack";
      if (lowerText.includes("radar")) tag = "#Radar";
      else if (lowerText.includes("dispute")) tag = "#Disputes";

      const timestamp = new Date(parseFloat(message.ts) * 1000).toISOString();

      items.push({
        id: `slack-${channel.id}-${message.ts}`,
        tag,
        type: "message" as const,
        priority,
        title: message.text.slice(0, 100) + (message.text.length > 100 ? "..." : ""),
        snippet: message.text.slice(0, 300),
        source: "slack" as const,
        sourceMeta: {
          source: "slack" as const,
          meta: {
            coreAsk: message.text.slice(0, 200),
            collaborator: {
              name: message.user || "Unknown",
              avatarUrl: "",
            },
            threadUrl: `https://stripe.slack.com/archives/${channel.id}/p${message.ts.replace(".", "")}`,
            channel: channel.name || "DM",
          },
        },
        createdAt: timestamp,
        lastTouchedAt: timestamp,
      } as MindItem);
    }
  }

  return items;
}

// Slack OAuth URL generator
export function getSlackAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.SLACK_CLIENT_ID!,
    scope: "channels:history,channels:read,groups:history,groups:read,im:history,im:read,mpim:history,mpim:read,users:read",
    redirect_uri: `${process.env.NEXTAUTH_URL}/api/integrations/slack/callback`,
    state,
  });

  return `https://slack.com/oauth/v2/authorize?${params}`;
}

// Exchange Slack auth code for tokens
export async function exchangeSlackCode(
  code: string
): Promise<{ accessToken: string; teamId: string; teamName: string }> {
  const response = await fetch("https://slack.com/api/oauth.v2.access", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.SLACK_CLIENT_ID!,
      client_secret: process.env.SLACK_CLIENT_SECRET!,
      code,
      redirect_uri: `${process.env.NEXTAUTH_URL}/api/integrations/slack/callback`,
    }),
  });

  const data = await response.json();

  if (!data.ok) {
    throw new Error(`Slack OAuth failed: ${data.error}`);
  }

  return {
    accessToken: data.access_token,
    teamId: data.team.id,
    teamName: data.team.name,
  };
}
