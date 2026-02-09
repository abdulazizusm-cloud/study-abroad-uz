"use client";

 import { useEffect, useState } from "react";
 import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogHeader,
   DialogTitle,
 } from "@/components/ui/dialog";
 import { Input } from "@/components/ui/input";
 import { Button } from "@/components/ui/button";
 import { Label } from "@/components/ui/label";

 interface ProfileCompletionModalProps {
   open: boolean;
   onSubmit: (profile: { firstName: string; lastName: string; phone: string }) => Promise<void>;
   initialFirstName?: string;
   initialLastName?: string;
   initialPhone?: string;
 }

 export function ProfileCompletionModal({
   open,
   onSubmit,
   initialFirstName = "",
   initialLastName = "",
   initialPhone = "",
 }: ProfileCompletionModalProps) {
   const [firstName, setFirstName] = useState(initialFirstName);
   const [lastName, setLastName] = useState(initialLastName);
   const [phone, setPhone] = useState(initialPhone);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState("");

   useEffect(() => {
     if (open) {
       setFirstName(initialFirstName);
       setLastName(initialLastName);
       setPhone(initialPhone);
       setError("");
     }
   }, [open, initialFirstName, initialLastName, initialPhone]);

   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!firstName.trim() || !lastName.trim() || !phone.trim()) {
       setError("Пожалуйста, заполните имя, фамилию и телефон");
       return;
     }
     setLoading(true);
     setError("");
     try {
       await onSubmit({
         firstName: firstName.trim(),
         lastName: lastName.trim(),
         phone: phone.trim(),
       });
     } catch {
       setError("Не удалось сохранить профиль. Попробуйте ещё раз.");
     } finally {
       setLoading(false);
     }
   };

   return (
     <Dialog open={open} onOpenChange={() => {}}>
       <DialogContent className="sm:max-w-[425px]">
         <DialogHeader>
           <DialogTitle className="text-2xl font-bold">Заполните профиль</DialogTitle>
           <DialogDescription>
             Это нужно для сохранения вашей анкеты и доступа к результатам.
           </DialogDescription>
         </DialogHeader>
         <form onSubmit={handleSubmit} className="space-y-4">
           <div className="space-y-2">
             <Label htmlFor="profile-first-name">Имя</Label>
             <Input
               id="profile-first-name"
               type="text"
               placeholder="Введите имя"
               value={firstName}
               onChange={(e) => setFirstName(e.target.value)}
               required
               disabled={loading}
             />
           </div>
           <div className="space-y-2">
             <Label htmlFor="profile-last-name">Фамилия</Label>
             <Input
               id="profile-last-name"
               type="text"
               placeholder="Введите фамилию"
               value={lastName}
               onChange={(e) => setLastName(e.target.value)}
               required
               disabled={loading}
             />
           </div>
           <div className="space-y-2">
             <Label htmlFor="profile-phone">Номер телефона</Label>
             <Input
               id="profile-phone"
               type="tel"
               placeholder="+998 90 123 45 67"
               value={phone}
               onChange={(e) => setPhone(e.target.value)}
               required
               disabled={loading}
             />
           </div>
           {error && <p className="text-sm text-red-600">{error}</p>}
           <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
             {loading ? "Сохраняем..." : "Сохранить"}
           </Button>
         </form>
       </DialogContent>
     </Dialog>
   );
 }
