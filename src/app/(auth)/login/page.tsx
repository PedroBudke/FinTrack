
"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      toast.error("Credenciais inválidas");
    } else {
      toast.success("Login realizado com sucesso!");
      window.location.href = "/dashboard";
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center">Login</h1>
      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <button
          type="submit"
          className="w-full p-2 text-white bg-blue-600 rounded hover:bg-blue-700"
        >
          Entrar
        </button>
      </form>

      <div className="flex flex-col space-y-2">
        <button
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="p-2 text-white bg-red-600 rounded hover:bg-red-700"
        >
          Entrar com Google
        </button>
        <button
          onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
          className="p-2 text-white bg-gray-800 rounded hover:bg-gray-900"
        >
          Entrar com GitHub
        </button>
      </div>

      <div className="text-center">
        <Link href="/forgot-password" className="text-blue-600 hover:underline">
          Esqueci minha senha
        </Link>
        <p className="mt-2">
          Não tem conta?{" "}
          <Link href="/register" className="text-blue-600 hover:underline">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  );
}