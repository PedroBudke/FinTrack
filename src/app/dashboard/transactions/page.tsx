// app/dashboard/transactions/page.tsx
"use client";

import { useState, useEffect } from "react";
import { db } from "@/src/lib/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import toast from "react-hot-toast";

type Transaction = {
  id?: string;
  type: "income" | "expense";
  description: string;
  amount: number;
  date: string;
  category: string;
  status?: "paid" | "pending";
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [form, setForm] = useState<Omit<Transaction, "id">>({
    type: "expense",
    description: "",
    amount: 0,
    date: "",
    category: "",
    status: "pending",
  });

  const fetchTransactions = async () => {
    const querySnapshot = await getDocs(collection(db, "transactions"));
    const data = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Transaction[];
    setTransactions(data);
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "transactions"), form);
      toast.success("Transação adicionada!");
      setForm({
        type: "expense",
        description: "",
        amount: 0,
        date: "",
        category: "",
        status: "pending",
      });
      fetchTransactions();
    } catch (error) {
      toast.error("Erro ao adicionar");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "transactions", id));
      toast.success("Transação excluída!");
      fetchTransactions();
    } catch (error) {
      toast.error("Erro ao excluir");
    }
  };

  const handleEdit = async (id: string, updatedData: Partial<Transaction>) => {
    try {
      await updateDoc(doc(db, "transactions", id), updatedData);
      toast.success("Transação atualizada!");
      fetchTransactions();
    } catch (error) {
      toast.error("Erro ao atualizar");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Gerenciar Transações</h1>

      {/* Formulário */}
      <form onSubmit={handleAdd} className="bg-white p-4 rounded shadow space-y-4">
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value as "income" | "expense" })}
          className="border p-2 rounded w-full"
        >
          <option value="expense">Despesa</option>
          <option value="income">Receita</option>
        </select>
        <input
          type="text"
          placeholder="Descrição"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="border p-2 rounded w-full"
          required
        />
        <input
          type="number"
          placeholder="Valor"
          value={form.amount || ""}
          onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) })}
          className="border p-2 rounded w-full"
          required
        />
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          className="border p-2 rounded w-full"
          required
        />
        <input
          type="text"
          placeholder="Categoria"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="border p-2 rounded w-full"
          required
        />
        {form.type === "expense" && (
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as "paid" | "pending" })}
            className="border p-2 rounded w-full"
          >
            <option value="pending">Pendente</option>
            <option value="paid">Pago</option>
          </select>
        )}
        <button
          type="submit"
          className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Adicionar
        </button>
      </form>

      {/* Lista */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Transações</h2>
        <div className="space-y-4">
          {transactions.map((t) => (
            <div key={t.id} className="flex justify-between items-center p-3 border rounded">
              <div>
                <p className="font-medium">{t.description}</p>
                <p className="text-sm text-gray-500">
                  {t.category} • {t.date} • {t.type === "expense" ? `Status: ${t.status}` : ""}
                </p>
              </div>
              <div className="flex space-x-2">
                <span className={`font-bold ${t.type === "income" ? "text-green-600" : "text-red-600"}`}>
                  {t.type === "income" ? "+" : "-"} R$ {t.amount.toFixed(2)}
                </span>
                <button
                  onClick={() => handleEdit(t.id!, { ...t, description: prompt("Nova descrição", t.description) || t.description })}
                  className="text-blue-600 hover:underline"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(t.id!)}
                  className="text-red-600 hover:underline"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}