import nodemailer from "nodemailer";
import { describe, expect, it, vi } from "vitest";

import { getSmtpConfig, handleContactSubmission, type SmtpConfig } from "./contact";
import { createRateLimiter } from "./rate-limit";

const config: SmtpConfig = {
  host: "smtp.test",
  port: 587,
  secure: false,
  user: "bot@site.test",
  pass: "secret",
  from: "bot@site.test",
  to: "manager@site.test",
};

function form(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

const valid = { name: "Aiko", email: "aiko@example.com", message: "Loved the latest chapter!" };
const limiter = () => createRateLimiter({ limit: 5, windowMs: 60_000 });

describe("getSmtpConfig", () => {
  it("returns null when SMTP_HOST or CONTACT_TO is missing", () => {
    expect(getSmtpConfig({})).toBeNull();
    expect(getSmtpConfig({ SMTP_HOST: "smtp.test" })).toBeNull();
    expect(getSmtpConfig({ CONTACT_TO: "a@b.test" })).toBeNull();
  });

  it("reads the env vars with sensible defaults", () => {
    expect(getSmtpConfig({ SMTP_HOST: "smtp.test", CONTACT_TO: "a@b.test" })).toMatchObject({
      port: 587,
      secure: false,
      user: undefined,
      from: "a@b.test",
    });
    expect(
      getSmtpConfig({ SMTP_HOST: "smtp.test", SMTP_PORT: "465", SMTP_USER: "u@b.test", SMTP_PASS: "p", CONTACT_TO: "a@b.test" }),
    ).toMatchObject({ port: 465, secure: true, user: "u@b.test", pass: "p", from: "u@b.test" });
  });
});

describe("handleContactSubmission", () => {
  it("returns field errors for invalid input and echoes the values back", async () => {
    const mailer = { sendMail: vi.fn() };
    const state = await handleContactSubmission(form({ name: " ", email: "nope", message: "hi" }), {
      ip: "1.1.1.1",
      config,
      mailer,
      limiter: limiter(),
    });
    expect(state.status).toBe("error");
    expect(Object.keys(state.fieldErrors ?? {}).sort()).toEqual(["email", "message", "name"]);
    expect(state.values).toEqual({ name: " ", email: "nope", message: "hi" });
    expect(mailer.sendMail).not.toHaveBeenCalled();
  });

  it("sends the message through the SMTP transport", async () => {
    // nodemailer's JSON transport builds the full message without any network.
    const transport = nodemailer.createTransport({ jsonTransport: true });
    const sendMail = vi.spyOn(transport, "sendMail");
    const state = await handleContactSubmission(form(valid), {
      ip: "1.1.1.1",
      config,
      mailer: transport,
      limiter: limiter(),
    });

    expect(state).toEqual({ status: "success", message: expect.any(String) });
    expect(sendMail).toHaveBeenCalledTimes(1);
    const info = await sendMail.mock.results[0].value;
    const sent = JSON.parse(info.message);
    expect(sent.to).toEqual([{ address: "manager@site.test", name: "" }]);
    expect(sent.replyTo).toEqual([{ address: "aiko@example.com", name: "Aiko" }]);
    expect(sent.subject).toContain("Aiko");
    expect(sent.text).toContain("Loved the latest chapter!");
  });

  it("strips line breaks from the name used in the subject", async () => {
    const mailer = { sendMail: vi.fn().mockResolvedValue({}) };
    await handleContactSubmission(form({ ...valid, name: "Aiko\r\nBcc: x@evil.test" }), {
      ip: "1.1.1.1",
      config,
      mailer,
      limiter: limiter(),
    });
    expect(mailer.sendMail.mock.calls[0][0].subject).not.toMatch(/[\r\n]/);
  });

  it("returns an error state when the transport fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const mailer = { sendMail: vi.fn().mockRejectedValue(new Error("ECONNREFUSED")) };
    const state = await handleContactSubmission(form(valid), { ip: "1.1.1.1", config, mailer, limiter: limiter() });
    expect(state.status).toBe("error");
    expect(state.values).toEqual(valid);
  });

  it("silently accepts but drops submissions with the honeypot filled", async () => {
    const mailer = { sendMail: vi.fn() };
    const state = await handleContactSubmission(form({ ...valid, website: "http://spam.test" }), {
      ip: "1.1.1.1",
      config,
      mailer,
      limiter: limiter(),
    });
    expect(state.status).toBe("success");
    expect(mailer.sendMail).not.toHaveBeenCalled();
  });

  it("rate-limits per IP", async () => {
    const mailer = { sendMail: vi.fn().mockResolvedValue({}) };
    const deps = { config, mailer, limiter: createRateLimiter({ limit: 2, windowMs: 60_000 }) };
    for (let i = 0; i < 2; i++) {
      expect((await handleContactSubmission(form(valid), { ...deps, ip: "1.1.1.1" })).status).toBe("success");
    }
    expect((await handleContactSubmission(form(valid), { ...deps, ip: "1.1.1.1" })).status).toBe("error");
    expect((await handleContactSubmission(form(valid), { ...deps, ip: "2.2.2.2" })).status).toBe("success");
    expect(mailer.sendMail).toHaveBeenCalledTimes(3);
  });

  it("refuses to send when SMTP is not configured", async () => {
    const state = await handleContactSubmission(form(valid), { ip: "1.1.1.1", config: null, limiter: limiter() });
    expect(state.status).toBe("error");
  });
});
