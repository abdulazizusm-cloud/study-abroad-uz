import { NextRequest, NextResponse } from "next/server";

const PLAN_LABELS: Record<string, string> = {
  pro: "PRO — 59 000 сум / месяц",
  profile_review: "Разбор профиля — 299 000 сум",
  mentorship: "Менторство (1 университет) — 1 500 000 сум",
};

export async function POST(req: NextRequest) {
  const { plan, name, contact, source } = await req.json();

  if (!contact) {
    return NextResponse.json({ success: false, error: "No contact provided" }, { status: 400 });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    // Silently succeed in dev if not configured
    console.warn("Telegram env vars not set — lead not sent");
    return NextResponse.json({ success: true, dev: true });
  }

  const planLabel = PLAN_LABELS[plan] ?? plan;
  const nameLine = name ? `\n👤 <b>Имя:</b> ${name}` : "";
  const sourceLine = source ? `\n📍 <b>Источник:</b> ${source}` : "";

  const text = [
    "📩 <b>Новая заявка!</b>",
    "",
    `🎯 <b>Тариф:</b> ${planLabel}`,
    nameLine,
    `📱 <b>Контакт:</b> ${contact}`,
    sourceLine,
  ]
    .filter((l) => l !== undefined)
    .join("\n");

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Telegram API error:", err);
    return NextResponse.json({ success: false, error: "Telegram error" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
