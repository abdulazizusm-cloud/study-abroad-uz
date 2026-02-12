"use client";

import { useMemo } from "react";

interface UserAvatarProps {
  firstName?: string;
  lastName?: string;
  email?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function UserAvatar({
  firstName,
  lastName,
  email,
  size = "md",
  className = "",
}: UserAvatarProps) {
  // Генерация инициалов
  const initials = useMemo(() => {
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
  }, [firstName, lastName, email]);

  // Генерация цвета на основе хеша
  const backgroundColor = useMemo(() => {
    const str = `${firstName || ""}${lastName || ""}${email || ""}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Генерируем приятные пастельные цвета
    const hue = Math.abs(hash % 360);
    const saturation = 65 + (Math.abs(hash) % 15); // 65-80%
    const lightness = 55 + (Math.abs(hash >> 8) % 10); // 55-65%
    
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }, [firstName, lastName, email]);

  // Размеры
  const sizeClasses = {
    sm: "w-10 h-10 text-sm",
    md: "w-14 h-14 text-lg",
    lg: "w-20 h-20 text-2xl",
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-bold text-white shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 ${className}`}
      style={{ backgroundColor }}
      title={`${firstName || ""} ${lastName || ""}`.trim() || email || "User"}
    >
      {initials}
    </div>
  );
}
