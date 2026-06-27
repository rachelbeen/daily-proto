import { formatDiscordEmbed, formatSlackBlocks } from "./format.js";
import type { DailyPrompt } from "./types.js";

export interface PostResult {
  channel: "slack" | "discord";
  ok: boolean;
  status: number;
}

async function postJson(url: string, body: unknown): Promise<Response> {
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function postToSlack(
  prompt: DailyPrompt,
  webhookUrl = process.env.SLACK_WEBHOOK_URL,
): Promise<PostResult> {
  if (!webhookUrl) {
    throw new Error("SLACK_WEBHOOK_URL is not set. Copy .env.example to .env and add your webhook.");
  }

  const payload = formatSlackBlocks(prompt);
  const response = await postJson(webhookUrl, payload);
  return { channel: "slack", ok: response.ok, status: response.status };
}

export async function postToDiscord(
  prompt: DailyPrompt,
  webhookUrl = process.env.DISCORD_WEBHOOK_URL,
): Promise<PostResult> {
  if (!webhookUrl) {
    throw new Error(
      "DISCORD_WEBHOOK_URL is not set. Copy .env.example to .env and add your webhook.",
    );
  }

  const payload = formatDiscordEmbed(prompt);
  const response = await postJson(webhookUrl, payload);
  return { channel: "discord", ok: response.ok, status: response.status };
}

export async function postDailyPrompt(
  prompt: DailyPrompt,
  targets: Array<"slack" | "discord"> = ["slack", "discord"],
): Promise<PostResult[]> {
  const results: PostResult[] = [];

  for (const target of targets) {
    const webhook =
      target === "slack" ? process.env.SLACK_WEBHOOK_URL : process.env.DISCORD_WEBHOOK_URL;
    if (!webhook) continue;

    const result =
      target === "slack" ? await postToSlack(prompt, webhook) : await postToDiscord(prompt, webhook);
    results.push(result);

    if (!result.ok) {
      throw new Error(`${target} post failed with status ${result.status}`);
    }
  }

  if (results.length === 0) {
    throw new Error("No webhook URLs configured. Set SLACK_WEBHOOK_URL and/or DISCORD_WEBHOOK_URL.");
  }

  return results;
}
