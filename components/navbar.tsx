"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GraduationCap, User } from "lucide-react";
import { AuthModal } from "@/components/auth-modal";
import { ProfileCompletionModal } from "@/components/profile-completion-modal";
import { useAuth } from "@/contexts/auth-context";

export function Navbar() {
  const { user, getProfile, upsertProfile } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileInitial, setProfileInitial] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-b-2 border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-blue-600">
              Study Abroad UZ
            </h1>
          </div>

          {/* Auth / Profile */}
          {user ? (
            <Button
              variant="outline"
              className="rounded-full w-11 h-11 p-0 border-2 border-blue-200 text-blue-700 hover:bg-blue-50"
              aria-label="Профиль"
              onClick={async () => {
                try {
                  const profile = await getProfile();
                  setProfileInitial({
                    firstName: profile?.first_name ?? "",
                    lastName: profile?.last_name ?? "",
                    phone: profile?.phone ?? "",
                  });
                  setProfileModalOpen(true);
                } catch {
                  setProfileModalOpen(true);
                }
              }}
            >
              <User className="w-5 h-5" />
            </Button>
          ) : (
            <Button
              onClick={() => setAuthModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all px-6"
            >
              Регистрация / Вход
            </Button>
          )}
        </div>
      </div>
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
      <ProfileCompletionModal
        open={profileModalOpen}
        initialFirstName={profileInitial.firstName}
        initialLastName={profileInitial.lastName}
        initialPhone={profileInitial.phone}
        onSubmit={async (profile) => {
          await upsertProfile(profile);
          setProfileModalOpen(false);
        }}
      />
    </nav>
  );
}
