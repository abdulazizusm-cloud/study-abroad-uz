"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";
import { AuthModal } from "@/components/auth-modal";
import { useAuth } from "@/contexts/auth-context";
import { UserAvatar } from "@/components/ui/user-avatar";

export function Navbar() {
  const router = useRouter();
  const { user, loading, getProfile } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profile, setProfile] = useState<{ first_name: string; last_name: string; phone: string } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user) {
      getProfile().then(setProfile).catch(() => setProfile(null));
    }
  }, [user, getProfile]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-b-2 border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center gap-3 hover:opacity-90 transition-opacity">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <h1 className="hidden sm:block text-xl sm:text-2xl font-bold text-blue-600">
              Apply Smart
            </h1>
          </Link>

          {/* Auth / Profile */}
          {mounted && !loading && (
            <>
              {user ? (
                <button
                  className="relative group cursor-pointer"
                  aria-label="Профиль"
                  onClick={() => router.push("/profile")}
                >
                  <UserAvatar
                    firstName={profile?.first_name || user.user_metadata?.first_name}
                    lastName={profile?.last_name || user.user_metadata?.last_name}
                    email={user.email}
                    size="sm"
                    className="ring-2 ring-blue-200 group-hover:ring-blue-400 transition-all"
                  />
                </button>
              ) : (
                <Button
                  onClick={() => setAuthModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all px-4 sm:px-6 text-sm sm:text-base"
                >
                  <span className="hidden sm:inline">Регистрация / Вход</span>
                  <span className="sm:hidden">Вход</span>
                </Button>
              )}
            </>
          )}
          {/* Loading placeholder */}
          {(!mounted || loading) && (
            <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
          )}
        </div>
      </div>
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </nav>
  );
}
