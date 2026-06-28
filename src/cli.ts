#!/usr/bin/env node
import { generateDailyPrompt, listUpcoming, resolveDate } from "./generate.js";
import { formatPromptMarkdown, formatPromptPlain } from "./format.js";
import { postDailyPrompt } from "./post.js";

function printHelp() {
  console.log(`daily-proto — daily prototyping prompts with real public APIs

Usage:
  daily-proto today              Print today's prompt (markdown)
  daily-proto generate [--date YYYY-MM-DD] [--json] [--plain]
  daily-proto preview [--days N] Preview upcoming prompts
  daily-proto post [--slack] [--discord] [--date YYYY-MM-DD]
  daily-proto help

Environment:
  SLACK_WEBHOOK_URL     Slack incoming webhook
  DISCORD_WEBHOOK_URL   Discord webhook
  PROMPT_DATE           Override date for testing (YYYY-MM-DD)
  PROMPT_TIMEZONE       IANA timezone for "today" (default: America/New_York)
`);
}

function parseArgs(argv: string[]) {
  const args = [...argv];
  const flags = new Set<string>();
  const options: Record<string, string> = {};

  while (args[0]?.startsWith("--")) {
    const key = args.shift()!.slice(2);
    if (args[0] && !args[0].startsWith("--")) {
      options[key] = args.shift()!;
    } else {
      flags.add(key);
    }
  }

  return { command: args[0] ?? "help", positional: args.slice(1), flags, options };
}

async function main() {
  const { command, flags, options } = parseArgs(process.argv.slice(2));
  const date = options.date;

  switch (command) {
    case "today":
    case "generate": {
      const prompt = generateDailyPrompt(date);
      if (flags.has("json")) {
        console.log(JSON.stringify(prompt, null, 2));
      } else if (flags.has("plain")) {
        console.log(formatPromptPlain(prompt));
      } else {
        console.log(formatPromptMarkdown(prompt));
      }
      break;
    }

    case "preview": {
      const days = Number(options.days ?? "7");
      const prompts = listUpcoming(days, date ?? resolveDate());
      for (const prompt of prompts) {
        console.log(formatPromptMarkdown(prompt));
        console.log("\n");
      }
      break;
    }

    case "post": {
      const prompt = generateDailyPrompt(date);
      let targets: Array<"slack" | "discord">;

      if (flags.has("slack") && flags.has("discord")) {
        targets = ["slack", "discord"];
      } else if (flags.has("slack")) {
        targets = ["slack"];
      } else if (flags.has("discord")) {
        targets = ["discord"];
      } else {
        targets = [];
        if (process.env.SLACK_WEBHOOK_URL) targets.push("slack");
        if (process.env.DISCORD_WEBHOOK_URL) targets.push("discord");
      }

      const results = await postDailyPrompt(prompt, targets);
      console.log(`Posted ${prompt.date} to: ${results.map((r) => r.channel).join(", ")}`);
      break;
    }

    case "help":
    default:
      printHelp();
      if (command !== "help") {
        process.exitCode = 1;
      }
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Error: ${message}`);
  process.exit(1);
});
