// app/(auth)/forgot-password/page.tsx
"use client";

import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("E-mail de recuperação enviado!");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center">Recuperar Senha</h1>
      <form onSubmit={handleReset} className="space-y-4">
        <input
          type="email"
          placeholder="E-mail cadastrado"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <button
          type="submit"
          className="w-full p-2 text-white bg-orange-600 rounded hover:bg-orange-700"
        >
          Enviar link de recuperação
        </button>
      </form>
      <div className="text-center">
        <Link href="/login" className="text-blue-600 hover:underline">
          Voltar ao login
        </Link>
      </div>
    </div>
  );
}