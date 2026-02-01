import https from "node:https";

export async function notifySlack(webhookUrl: string, message: string): Promise<void> {
  if (!webhookUrl || !webhookUrl.trim()) return;
  const url = new URL(webhookUrl);
  const body = JSON.stringify({ text: message });

  await new Promise<void>((resolve, reject) => {
    const req = https.request(
      {
        method: "POST",
        hostname: url.hostname,
        path: url.pathname + url.search,
        headers: {
          "content-type": "application/json",
          "content-length": Buffer.byteLength(body),
        },
      },
      (res) => {
        const ok = (res.statusCode ?? 500) >= 200 && (res.statusCode ?? 500) < 300;
        res.resume();
        if (ok) resolve();
        else reject(new Error(`Slack webhook failed: ${res.statusCode}`));
      }
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}
