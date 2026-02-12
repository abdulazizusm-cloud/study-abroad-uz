/**
 * Генерирует уникальный цвет на основе строки
 * Использует HSL для приятных пастельных тонов
 */
export function generateAvatarColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hue = Math.abs(hash % 360);
  const saturation = 65 + (Math.abs(hash) % 15);
  const lightness = 55 + (Math.abs(hash >> 8) % 10);
  
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/**
 * Извлекает инициалы из имени и фамилии
 */
export function getInitials(firstName?: string, lastName?: string, email?: string): string {
  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  }
  if (firstName) {
    return firstName.slice(0, 2).toUpperCase();
  }
  if (email) {
    return email.slice(0, 2).toUpperCase();
  }
  return "??";
}
