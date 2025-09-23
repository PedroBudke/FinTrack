// app/dashboard/profile/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { db } from "@/src/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      if (session?.user?.email) {
        const userDoc = await getDoc(doc(db, "users", session.user.email));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setName(userData.name || "");
          setEmail(userData.email || "");
          setCpf(userData.cpf || "");
        }
      }
    };
    fetchProfile();
  }, [session]);

  const handleUpdate = async () => {
    try {
      if (session?.user?.email) {
        await updateDoc(doc(db, "users", session.user.email), {
          name,
        });
        toast.success("Perfil atualizado!");
      }
    } catch (error) {
      toast.error("Erro ao atualizar");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
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