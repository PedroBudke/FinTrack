"use client";

export const dynamic = "force-dynamic"; // ✅ Evita pré-render estático

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import toast from "react-hot-toast";

export default function ProfilePage() {
  // ✅ Adiciona fallback para evitar erro no build
  const sessionResult = useSession();
  const session = sessionResult?.data ?? null;
  const status = sessionResult?.status ?? "loading";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      const userId = session.user.id; // ✅ uid do Firebase
      const fetchProfile = async () => {
        try {
          const userDoc = await getDoc(doc(db, "users", userId)); // ✅ Usa uid
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setName(userData.name || "");
            setEmail(userData.email || "");
            setCpf(userData.cpf || "");
          }
        } catch (err) {
          toast.error("Erro ao carregar perfil.");
        }
      };
      fetchProfile();
    }
  }, [status, session]);

  const handleUpdate = async () => {
    if (!session?.user?.id) return;
    try {
      await updateDoc(doc(db, "users", session.user.id), { name });
      toast.success("Perfil atualizado!");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Erro ao atualizar perfil.");
      }
    }
  };

  if (status === "loading") {
    return <p className="text-center mt-10">Carregando sessão...</p>;
  }

  if (status === "unauthenticated") {
    return <p className="text-center mt-10">Acesso negado. Faça login.</p>;
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow mt-6">
      <h1 className="text-2xl font-bold mb-6">Meu Perfil</h1>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Nome</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">E-mail</label>
          <input
            type="email"
            value={email}
            disabled
            className="w-full p-2 border rounded bg-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">CPF</label>
          <input
            type="text"
            value={cpf}
            disabled
            className="w-full p-2 border rounded bg-gray-100"
          />
        </div>
        <button
          onClick={handleUpdate}
          className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Atualizar Perfil
        </button>
      </div>
    </div>
  );
}