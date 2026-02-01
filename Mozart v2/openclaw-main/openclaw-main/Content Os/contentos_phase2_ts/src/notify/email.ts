import net from "node:net";
import tls from "node:tls";

export interface SmtpConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  from_addr: string;
  to_addr: string;
  use_tls: boolean;
}

function b64(s: string): string {
  return Buffer.from(s, "utf-8").toString("base64");
}

async function readLine(sock: net.Socket): Promise<string> {
  return await new Promise((resolve, reject) => {
    const onData = (data: Buffer) => {
      const text = data.toString("utf-8");
      resolve(text);
      sock.off("error", onError);
    };
    const onError = (e: Error) => {
      reject(e);
      sock.off("data", onData);
    };
    sock.once("data", onData);
    sock.once("error", onError);
  });
}

async function writeCmd(sock: net.Socket, cmd: string): Promise<void> {
  sock.write(cmd + "\r\n");
}

function codeOk(reply: string, expectedPrefix: string): boolean {
  return reply.trim().startsWith(expectedPrefix);
}

export async function sendSmtp(cfg: SmtpConfig, subject: string, message: string): Promise<void> {
  if (!cfg.host || !cfg.to_addr || !cfg.from_addr) return;

  const sock = net.createConnection({ host: cfg.host, port: cfg.port });
  sock.setTimeout(15000);

  const banner = await readLine(sock);
  if (!codeOk(banner, "220")) throw new Error(`SMTP banner unexpected: ${banner}`);

  await writeCmd(sock, `EHLO contentos`);
  const ehlo = await readLine(sock);
  if (!codeOk(ehlo, "250")) throw new Error(`SMTP EHLO failed: ${ehlo}`);

  let transport: net.Socket = sock;

  if (cfg.use_tls) {
    await writeCmd(sock, "STARTTLS");
    const starttls = await readLine(sock);
    if (!codeOk(starttls, "220")) throw new Error(`SMTP STARTTLS failed: ${starttls}`);

    transport = tls.connect({ socket: sock, servername: cfg.host });

    await writeCmd(transport, `EHLO contentos`);
    const ehlo2 = await readLine(transport);
    if (!codeOk(ehlo2, "250")) throw new Error(`SMTP EHLO after TLS failed: ${ehlo2}`);
  }

  if (cfg.username && cfg.password) {
    await writeCmd(transport, "AUTH PLAIN " + b64(`\u0000${cfg.username}\u0000${cfg.password}`));
    const auth = await readLine(transport);
    if (!codeOk(auth, "235")) throw new Error(`SMTP auth failed: ${auth}`);
  }

  await writeCmd(transport, `MAIL FROM:<${cfg.from_addr}>`);
  const mf = await readLine(transport);
  if (!codeOk(mf, "250")) throw new Error(`MAIL FROM failed: ${mf}`);

  await writeCmd(transport, `RCPT TO:<${cfg.to_addr}>`);
  const rt = await readLine(transport);
  if (!codeOk(rt, "250")) throw new Error(`RCPT TO failed: ${rt}`);

  await writeCmd(transport, "DATA");
  const data = await readLine(transport);
  if (!codeOk(data, "354")) throw new Error(`DATA failed: ${data}`);

  const lines = [
    `From: ${cfg.from_addr}`,
    `To: ${cfg.to_addr}`,
    `Subject: ${subject}`,
    `Content-Type: text/plain; charset=utf-8`,
    "",
    message,
    "",
    ".",
  ].join("\r\n");

  transport.write(lines + "\r\n");
  const sent = await readLine(transport);
  if (!codeOk(sent, "250")) throw new Error(`Message send failed: ${sent}`);

  await writeCmd(transport, "QUIT");
  transport.end();
}
