import { ShootBrief } from "../agents/schemas.js";

export function renderMarkdown(brief: ShootBrief): string {
  const lines: string[] = [];
  lines.push(`# Shoot Brief — ${brief.event.summary}`);
  lines.push("");
  lines.push(`- Event ID: \`${brief.event.id}\``);
  lines.push(`- Start: ${brief.event.start}`);
  lines.push(`- Location: ${brief.event.location}`);
  lines.push(`- Deal ID: \`${brief.deal.deal_id}\``);
  if (brief.deal.price !== undefined) lines.push(`- Price: $${brief.deal.price.toLocaleString()}`);
  if (brief.deal.terms) lines.push(`- Terms: ${brief.deal.terms}`);
  lines.push("");

  lines.push("## YouTube Packaging");
  lines.push("");
  lines.push(`**Title:** ${brief.youtube_title}`);
  lines.push("");
  lines.push(`**Thumbnail concept:** ${brief.thumbnail_concept}`);
  lines.push("");

  lines.push("## Hook Variants");
  lines.push("");
  for (const h of brief.hook_variants) lines.push(`- ${h}`);
  lines.push("");

  lines.push("## 0–30s Intro Rewrite");
  lines.push("");
  lines.push(brief.intro_rewrite_0_30s);
  lines.push("");

  lines.push("## Shot List");
  lines.push("");
  brief.shot_list.forEach((s, i) => lines.push(`${i + 1}. ${s}`));
  lines.push("");

  lines.push("## Talking Points");
  lines.push("");
  brief.talking_points.forEach((t) => lines.push(`- ${t}`));
  lines.push("");

  lines.push("## Do Not Leave Until Captured");
  lines.push("");
  brief.do_not_leave_checklist.forEach((c) => lines.push(`- ${c}`));
  lines.push("");

  return lines.join("\n") + "\n";
}

export function renderCaptureChecklist(brief: ShootBrief): string {
  const lines: string[] = [];
  lines.push(`CAPTURE CHECKLIST — ${brief.event.summary}`);
  lines.push("");
  for (const c of brief.do_not_leave_checklist) {
    lines.push(`[ ] ${c}`);
  }
  lines.push("");
  lines.push("SHOT LIST");
  lines.push("");
  brief.shot_list.forEach((s, i) => lines.push(`[ ] ${i + 1}. ${s}`));
  lines.push("");
  return lines.join("\n") + "\n";
}
