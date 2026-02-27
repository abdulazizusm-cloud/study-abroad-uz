import { NextRequest, NextResponse } from "next/server";

const PLAN_LABELS: Record<string, string> = {
  pro: "PRO — 59 000 сум / месяц",
  profile_review: "Разбор профиля — 299 000 сум",
  mentorship: "Менторство (1 университет) — 1 500 000 сум",
};

function formatWizardData(w: Record<string, unknown>): string {
  const lines: string[] = [];

  if (w.nationality) lines.push(`🏳️ Гражданство: ${w.nationality}`);
  if (w.countryOfStudy) lines.push(`🌍 Страна обучения: ${w.countryOfStudy}`);
  if (w.level) lines.push(`🎓 Уровень: ${w.level}`);
  if (w.gradingAverage && w.gradingScheme) lines.push(`📊 GPA: ${w.gradingAverage} (${w.gradingScheme})`);

  // English test
  const examType = w.englishExamType as string | undefined;
  if (examType && examType !== "None") {
    if (examType === "IELTS" && w.ieltsOverall) {
      lines.push(`🗣 IELTS Overall: ${w.ieltsOverall}`);
      const sub = [w.ieltsListening && `L:${w.ieltsListening}`, w.ieltsReading && `R:${w.ieltsReading}`, w.ieltsWriting && `W:${w.ieltsWriting}`, w.ieltsSpeaking && `S:${w.ieltsSpeaking}`].filter(Boolean).join(" ");
      if (sub) lines.push(`   (${sub})`);
    } else if (examType === "TOEFL" && w.toeflTotal) {
      lines.push(`🗣 TOEFL Total: ${w.toeflTotal}`);
      const sub = [w.toeflReading && `R:${w.toeflReading}`, w.toeflListening && `L:${w.toeflListening}`, w.toeflSpeaking && `S:${w.toeflSpeaking}`, w.toeflWriting && `W:${w.toeflWriting}`].filter(Boolean).join(" ");
      if (sub) lines.push(`   (${sub})`);
    } else if (examType === "Duolingo" && w.duolingoOverall) {
      lines.push(`🗣 Duolingo: ${w.duolingoOverall}`);
    } else {
      const score = w.englishScore ?? "";
      lines.push(`🗣 ${examType}${score ? `: ${score}` : ""}`);
    }
  } else {
    lines.push(`🗣 Английский тест: нет сертификата`);
  }

  // Standardized tests (GRE / GMAT)
  const stdExam = w.standardizedExamType as string | undefined;
  if (stdExam && stdExam !== "None") {
    if (stdExam === "GRE") {
      const parts = [w.greVerbal && `Verbal: ${w.greVerbal}${w.greVerbalPercentile ? ` (${w.greVerbalPercentile}%)` : ""}`, w.greQuant && `Quant: ${w.greQuant}${w.greQuantPercentile ? ` (${w.greQuantPercentile}%)` : ""}`, w.greWriting && `Writing: ${w.greWriting}${w.greWritingPercentile ? ` (${w.greWritingPercentile}%)` : ""}`].filter(Boolean).join(", ");
      if (parts) lines.push(`📝 GRE: ${parts}`);
    } else if (stdExam === "GMAT") {
      const parts = [w.gmatTotal && `Total: ${w.gmatTotal}${w.gmatTotalPercentile ? ` (${w.gmatTotalPercentile}%)` : ""}`, w.gmatQuant && `Quant: ${w.gmatQuant}`, w.gmatVerbal && `Verbal: ${w.gmatVerbal}`, w.gmatDataInsights && `DI: ${w.gmatDataInsights}`].filter(Boolean).join(", ");
      if (parts) lines.push(`📝 GMAT: ${parts}`);
    } else if (stdExam === "SAT") {
      const parts = [w.satTotal && `Total: ${w.satTotal}`, w.satMath && `Math: ${w.satMath}`, w.satEbrw && `EBRW: ${w.satEbrw}`].filter(Boolean).join(", ");
      if (parts) lines.push(`📝 SAT: ${parts}`);
    }
  }

  if (w.budget) lines.push(`💰 Бюджет: ${w.budget}`);
  if (w.financeSource) lines.push(`💳 Финансирование: ${w.financeSource}`);
  if (Array.isArray(w.faculty) && w.faculty.length > 0) lines.push(`📚 Направление: ${(w.faculty as string[]).join(", ")}`);
  if (w.programGoal) lines.push(`🎯 Цель программы: ${w.programGoal}`);
  if (w.scholarship) lines.push(`🏅 Стипендия: ${w.scholarship === "Yes" ? "Да, интересует" : "Нет"}`);

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
    const fullName = `${userProfile.firstName ?? ""} ${userProfile.lastName ?? ""}`.trim();
    if (fullName) profileLines.push(`ФИО: ${fullName}`);
    if (userProfile.email) profileLines.push(`Email: ${userProfile.email}`);
    if (userProfile.phone) profileLines.push(`Телефон: ${userProfile.phone}`);
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
