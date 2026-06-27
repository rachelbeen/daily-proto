import type { DailyPrompt, DataSource } from "./types.js";

function authNote(auth: DataSource["auth"]): string {
  switch (auth) {
    case "none":
      return "No API key required.";
    case "optional":
      return "API key optional for higher limits.";
    case "free-key":
      return "Free API key available — check docs if you hit rate limits.";
  }
}

function formatSourceSection(source: DataSource): string[] {
  return [
    `**${source.name}** (${source.category})`,
    "",
    source.description,
    "",
    `- Docs: ${source.docsUrl}`,
    `- Auth: ${authNote(source.auth)}`,
    `- Tags: ${source.tags.map((t) => `\`${t}\``).join(", ")}`,
    "",
    "Starter endpoint:",
    "```",
    source.exampleEndpoint,
    "```",
    "",
    "Sample fields:",
    source.sampleFields.map((f) => `- \`${f}\``).join("\n"),
    "",
  ];
}

export function formatPromptMarkdown(prompt: DailyPrompt): string {
  const { date, dataSources, comboNote, challenge, constraint, twist } = prompt;
  const sourceHeading = dataSources.length > 1 ? "## Data sources" : "## Data source";

  const sourceBlocks = dataSources.flatMap((source) => formatSourceSection(source));

  return [
    `# Daily Proto — ${date}`,
    "",
    `> ${challenge.prompt}`,
    "",
    ...(comboNote ? [`_${comboNote}_`, ""] : []),
    sourceHeading,
    "",
    ...sourceBlocks,
    "## Constraint",
    constraint.text,
    "",
    "## Twist",
    twist,
    "",
    "---",
    "_Same prompt for everyone on this date. Remix freely._",
  ].join("\n");
}

export function formatPromptPlain(prompt: DailyPrompt): string {
  return formatPromptMarkdown(prompt).replace(/[#*`]/g, "");
}

export function formatSlackBlocks(prompt: DailyPrompt) {
  const text = formatPromptMarkdown(prompt);
  const sourceLines = prompt.dataSources
    .map((s) => `*${s.name}* (${s.category}) — <${s.docsUrl}|docs>`)
    .join("\n");
  const endpoints = prompt.dataSources.map((s) => `\`${s.exampleEndpoint}\``).join("\n");
  const fields = prompt.dataSources
    .flatMap((s) => s.sampleFields)
    .map((f) => `\`${f}\``)
    .join(", ");

  return {
    text: `Daily Proto — ${prompt.date}: ${prompt.challenge.prompt}`,
    blocks: [
      {
        type: "header",
        text: { type: "plain_text", text: `Daily Proto — ${prompt.date}`, emoji: true },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*${prompt.challenge.prompt}*`,
        },
      },
      ...(prompt.comboNote
        ? [{ type: "section" as const, text: { type: "mrkdwn" as const, text: `_${prompt.comboNote}_` } }]
        : []),
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*${prompt.dataSources.length > 1 ? "Sources" : "Source"}*\n${sourceLines}`,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Starter endpoints*\n${endpoints}`,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Constraint*\n${prompt.constraint.text}\n\n*Twist*\n${prompt.twist}`,
        },
      },
      {
        type: "context",
        elements: [{ type: "mrkdwn", text: `Fields: ${fields}` }],
      },
    ],
    fallbackText: text,
  };
}

export function formatDiscordEmbed(prompt: DailyPrompt) {
  const sourceValue = prompt.dataSources
    .map((s) => `[${s.name}](${s.docsUrl}) — ${s.category}`)
    .join("\n");
  const endpointValue = prompt.dataSources.map((s) => s.exampleEndpoint).join("\n\n");

  return {
    content: `**Daily Proto — ${prompt.date}**`,
    embeds: [
      {
        title: prompt.challenge.prompt.slice(0, 120),
        description: [prompt.comboNote].filter(Boolean).join("\n\n"),
        color: 0x5b6af0,
        fields: [
          {
            name: prompt.dataSources.length > 1 ? "Data sources" : "Data source",
            value: sourceValue,
            inline: false,
          },
          {
            name: "Starter endpoints",
            value: `\`\`\`${endpointValue}\`\`\``,
            inline: false,
          },
          {
            name: "Constraint",
            value: prompt.constraint.text,
            inline: false,
          },
          {
            name: "Twist",
            value: prompt.twist,
            inline: false,
          },
        ],
        footer: { text: "Same prompt for everyone today. Remix freely." },
      },
    ],
  };
}
