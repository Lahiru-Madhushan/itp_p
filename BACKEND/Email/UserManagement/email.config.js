// Central SMTP / mail transport configuration (ESM)
import nodemailer from "nodemailer";
import "dotenv/config";

// Values pasted into .env often carry stray spaces, quotes or a trailing \r
// (Windows line endings). Gmail app passwords in particular are displayed as
// "abcd efgh ijkl mnop" and must be sent without the spaces.
const clean = (v) => (typeof v === "string" ? v.trim().replace(/^["']|["']$/g, "") : v);
const cleanSecret = (v) => (typeof v === "string" ? v.replace(/\s+/g, "") : v);

const SMTP_HOST = clean(process.env.SMTP_HOST);
const SMTP_PORT = Number(clean(process.env.SMTP_PORT) || 587);
const SMTP_USER = clean(process.env.SMTP_USER);
const SMTP_PASS = cleanSecret(process.env.SMTP_PASS);

const MT_TEST_USER = clean(process.env.MT_TEST_USER);
const MT_TEST_PASS = clean(process.env.MT_TEST_PASS);

const isProd = clean(process.env.NODE_ENV) === "production";

// Which transport are we actually using? Decided by what is configured,
// not by NODE_ENV alone, so a misconfigured .env fails loudly instead of
// silently pointing at the wrong server.
function buildTransport() {
  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    return {
      kind: "smtp",
      label: `SMTP ${SMTP_HOST}:${SMTP_PORT} as ${SMTP_USER}`,
      transport: nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_PORT === 465,       // 465 = implicit TLS, 587 = STARTTLS
        requireTLS: SMTP_PORT === 587,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
      }),
    };
  }

  if (MT_TEST_USER && MT_TEST_PASS) {
    return {
      kind: "mailtrap",
      label: "Mailtrap sandbox (sandbox.smtp.mailtrap.io:2525)",
      transport: nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: { user: MT_TEST_USER, pass: MT_TEST_PASS },
      }),
    };
  }

  return {
    kind: "console",
    label: "console (no SMTP configured - mail is logged, not sent)",
    transport: nodemailer.createTransport({ jsonTransport: true }),
  };
}

const built = buildTransport();

// A console transport used as a safety net in development so that signup /
// password-reset flows keep working when SMTP credentials are rejected.
const consoleTransport = nodemailer.createTransport({ jsonTransport: true });

// Set to true by verifyMailer() when the real transport is unusable.
let smtpBroken = false;

function logToConsoleTransport(mail, reason) {
  console.warn(
    `[mail] not sent via ${built.label}${reason ? ` (${reason})` : ""}. ` +
      `Falling back to console output.`
  );
  console.warn(
    `[mail] to=${mail.to} subject=${mail.subject}\n${mail.text || "(no text part)"}`
  );
  return consoleTransport.sendMail(mail);
}

// Public transport. Same API as a nodemailer transport (sendMail / verify),
// but with the dev fallback wired in.
export const transporter = {
  get options() {
    return built.transport.options;
  },
  verify: () => built.transport.verify(),
  async sendMail(mail) {
    if (built.kind === "console") {
      return logToConsoleTransport(mail, "no SMTP configured");
    }
    if (smtpBroken && !isProd) {
      return logToConsoleTransport(mail, "SMTP credentials were rejected at startup");
    }
    try {
      return await built.transport.sendMail(mail);
    } catch (err) {
      if (!isProd) {
        return logToConsoleTransport(mail, err.message);
      }
      throw err;
    }
  },
};

// Single source of truth for the From header.
// Gmail rejects/rewrites a From address that is not the authenticated account,
// so default it to SMTP_USER rather than an example.test address.
export const FROM = {
  name: clean(process.env.MAIL_FROM_NAME) || "Yong SMART",
  address: clean(process.env.MAIL_FROM) || SMTP_USER || "no-reply@example.test",
};

// Called on app start. Never throws - it reports and lets the server boot.
export async function verifyMailer() {
  if (built.kind === "console") {
    console.warn(`[mail] ${built.label}`);
    console.warn(
      "[mail] Set SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS in BACKEND/.env to send real email."
    );
    return false;
  }

  try {
    await built.transport.verify();
    console.log(`[mail] ready - ${built.label}`);
    return true;
  } catch (e) {
    smtpBroken = true;
    console.error(`[mail] transport unusable - ${built.label}`);
    console.error(`[mail] ${e.code || "ERROR"}: ${e.message}`);

    if (e.code === "EAUTH" && /gmail/i.test(SMTP_HOST || "")) {
      console.error(
        "[mail] Gmail rejected the login (535-5.7.8). Gmail does not accept your\n" +
          "       normal account password over SMTP. Fix it by:\n" +
          "       1. Turning on 2-Step Verification for " + (SMTP_USER || "the account") + "\n" +
          "          -> https://myaccount.google.com/signinoptions/two-step-verification\n" +
          "       2. Creating an App Password (Mail / Other)\n" +
          "          -> https://myaccount.google.com/apppasswords\n" +
          "       3. Putting those 16 characters in SMTP_PASS in BACKEND/.env\n" +
          "          (spaces are stripped automatically) and restarting the server.\n" +
          "       An existing App Password stops working if it was revoked or if the\n" +
          "       account password was changed - generate a new one in that case."
      );
    }

    if (!isProd) {
      console.error("[mail] Development mode: emails will be logged to the console instead.");
    }
    return false;
  }
}
