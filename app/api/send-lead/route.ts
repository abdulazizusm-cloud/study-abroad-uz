import { NextRequest, NextResponse } from "next/server";

const PLAN_LABELS: Record<string, string> = {
  pro: "PRO — 59 000 сум / месяц",
  profile_review: "Разбор профиля — 299 000 сум",
  mentorship: "Менторство (1 университет) — 1 500 000 сум",
};

function formatWizardData(w: Record<string, unknown>): string {
  const lines: string[] = [];
  if (w.countryOfStudy) lines.push(`🌍 Страна: ${w.countryOfStudy}`);
  if (w.level) lines.push(`🎓 Уровень: ${w.level}`);
  if (w.gradingAverage && w.gradingScheme) lines.push(`📊 GPA: ${w.gradingAverage} (${w.gradingScheme})`);
  if (w.englishExamType && w.englishExamType !== "None") {
    const score = w.englishScore ?? w.ieltsOverall ?? w.toeflTotal ?? w.duolingoOverall ?? "";
    lines.push(`🗣 Английский: ${w.englishExamType}${score ? ` ${score}` : ""}`);
  } else if (w.englishExamType === "None") {
    lines.push(`🗣 Английский: нет сертификата`);
  }
  if (w.budget) lines.push(`💰 Бюджет: ${w.budget}`);
  if (w.nationality) lines.push(`🏳️ Гражданство: ${w.nationality}`);
  if (w.programGoal) lines.push(`🎯 Цель: ${w.programGoal}`);
  if (Array.isArray(w.faculty) && w.faculty.length > 0) lines.push(`📚 Направление: ${(w.faculty as string[]).join(", ")}`);
  return lines.join("\n");
}

export async function POST(req: NextRequest) {
  const { plan, name, contact, source, wizardData, userProfile } = await req.json();

  if (!contact) {
    return NextResponse.json({ success: false, error: "No contact provided" }, { status: 400 });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn("Telegram env vars not set — lead not sent");
    return NextResponse.json({ success: true, dev: true });
  }

  const planLabel = PLAN_LABELS[plan] ?? plan;

  const parts: string[] = [
    "📩 <b>Новая заявка!</b>",
    "",
    `🎯 <b>Тариф:</b> ${planLabel}`,
  ];

  if (name) parts.push(`👤 <b>Имя:</b> ${name}`);
  parts.push(`📱 <b>Контакт:</b> ${contact}`);
  if (source) parts.push(`📍 <b>Источник:</b> ${source}`);

  // Profile data
  if (userProfile) {
    const profileLines: string[] = [];
    if (userProfile.firstName || userProfile.lastName) {
      profileLines.push(`${userProfile.firstName ?? ""} ${userProfile.lastName ?? ""}`.trim());
    }
    if (userProfile.email) profileLines.push(userProfile.email);
    if (userProfile.phone) profileLines.push(userProfile.phone);
    if (profileLines.length > 0) {
      parts.push("", "👤 <b>Профиль пользователя:</b>", ...profileLines.map(l => `  ${l}`));
    }
  }

  // Wizard form data
  if (wizardData && typeof wizardData === "object") {
    const formatted = formatWizardData(wizardData as Record<string, unknown>);
    if (formatted) {
      parts.push("", "📋 <b>Анкета:</b>", ...formatted.split("\n").map(l => `  ${l}`));
    }
  }

  const text = parts.join("\n");

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Telegram API error:", err);
    return NextResponse.json({ success: false, error: "Telegram error" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
