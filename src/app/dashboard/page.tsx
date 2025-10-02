// src/app/dashboard/page.tsx
"use client";

// Impede pré-renderização estática — necessário para autenticação
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { toast } from "react-hot-toast";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import {
  CalendarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ClockIcon,
  CurrencyDollarIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline";

// Registrar plugins do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// ✅ Tipagem explícita para transações (sem `any`)
interface Transaction {
  id: string;
  userId: string;
  type: "income" | "expense";
  value: number;
  category: string;
  description: string;
  date: string; // assumindo que é string ISO (ex: "2024-06-01")
  status?: "pending" | "paid";
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]); // ✅ Tipado
  const [currencyData, setCurrencyData] = useState({
    usd: 5.12,
    ibov: { value: 125420, change: 1.2 },
  });
  const router = useRouter();

  // Protege rota com autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        toast.error("Faça login para acessar o dashboard.");
        router.push("/auth/login");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  // Busca transações do usuário
  useEffect(() => {
    if (!user) return;

    const fetchTransactions = async () => {
      try {
        const q = query(collection(db, "transactions"), where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const transactionsData: Transaction[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Transaction, "id">),
        }));
        setTransactions(transactionsData);
      } catch (error) {
        console.error("Erro ao buscar transações:", error);
        toast.error("Erro ao carregar dados financeiros.");
      }
    };

    fetchTransactions();
  }, [user]);

  // Simula busca de cotações
  useEffect(() => {
    const fetchCurrencyRates = async () => {
      // Substitua por chamada real se desejar
      setCurrencyData({
        usd: 5.12,
        ibov: { value: 125420, change: 1.2 },
      });
    };
    fetchCurrencyRates();
  }, []);

  // Calcula balanço
  const balanceData = transactions.reduce(
    (acc, transaction) => {
      if (transaction.type === "income") {
        acc.income += transaction.value;
      } else {
        acc.expenses += transaction.value;
      }
      return acc;
    },
    { income: 0, expenses: 0 }
  );
  const balance = balanceData.income - balanceData.expenses;

  // Despesas por categoria
  const expenseByCategory: Record<string, number> = {};
  transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.value;
    });

  // Dados mensais (últimos 4 meses)
  const now = new Date();
  const monthlyData: Record<string, { income: number; expense: number }> = {};
  for (let i = 3; i >= 0; i--) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`;
    monthlyData[monthKey] = { income: 0, expense: 0 };
  }

  transactions.forEach((t) => {
    const date = new Date(t.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    if (monthlyData[monthKey]) {
      if (t.type === "income") {
        monthlyData[monthKey].income += t.value;
      } else {
        monthlyData[monthKey].expense += t.value;
      }
    }
  });

  const barChartData = {
    labels: Object.keys(monthlyData).map((key) => {
      const [year, month] = key.split("-");
      return new Date(parseInt(year), parseInt(month) - 1).toLocaleString("pt-BR", {
        month: "short",
      });
    }),
    datasets: [
      {
        label: "Receitas",
        data: Object.values(monthlyData).map((d) => d.income),
        backgroundColor: "rgba(54, 162, 235, 0.6)",
      },
      {
        label: "Despesas",
        data: Object.values(monthlyData).map((d) => d.expense),
        backgroundColor: "rgba(255, 99, 132, 0.6)",
      },
    ],
  };

  const pieChartData = {
    labels: Object.keys(expenseByCategory),
    datasets: [
      {
        data: Object.values(expenseByCategory),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
          "#8AC926",
        ],
        borderWidth: 2,
      },
    ],
  };

  // Próximas despesas (7 dias)
  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);

  const upcomingBills = transactions
    .filter(
      (t) =>
        t.type === "expense" &&
        t.status === "pending" &&
        new Date(t.date) >= today &&
        new Date(t.date) <= nextWeek
    )
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Transações recentes
  const recentTransactions = [...transactions]
    .sort(
      (a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-lg text-gray-700">Carregando dashboard...</p>
      </div>
    );
  }

  if (!user) return null;

  const displayName = user.displayName || user.email?.split("@")[0] || "Usuário";

  const handleLogout = async () => {
    await auth.signOut();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">FinTrack Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">
              Olá, <span className="font-semibold">{displayName}</span>
            </span>
            <button
              onClick={handleLogout}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Receitas Totais</h3>
                <p className="text-3xl font-bold">
                  R$ {balanceData.income.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <ArrowUpIcon className="w-8 h-8 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Despesas Totais</h3>
                <p className="text-3xl font-bold">
                  R$ {balanceData.expenses.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <ArrowDownIcon className="w-8 h-8 text-red-200" />
            </div>
          </div>

          <div
            className={`bg-gradient-to-r ${
              balance >= 0 ? "from-blue-500 to-blue-600" : "from-yellow-500 to-yellow-600"
            } rounded-xl shadow-lg p-6 text-white`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Saldo Atual</h3>
                <p className="text-3xl font-bold">
                  R$ {balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <CurrencyDollarIcon className="w-8 h-8 text-blue-200" />
            </div>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Receitas vs Despesas (últimos 4 meses)
            </h2>
            {Object.values(monthlyData).some((d) => d.income > 0 || d.expense > 0) ? (
              <Bar
                data={barChartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: "top" as const },
                  },
                }}
              />
            ) : (
              <p className="text-gray-500 text-center py-8">Nenhuma transação registrada</p>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Distribuição de Despesas por Categoria
            </h2>
            {Object.keys(expenseByCategory).length > 0 ? (
              <Pie
                data={pieChartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: "top" as const },
                  },
                }}
              />
            ) : (
              <p className="text-gray-500 text-center py-8">Nenhuma despesa registrada</p>
            )}
          </div>
        </div>

        {/* Alertas + Transações Recentes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Próximas Despesas</h2>
              <CalendarIcon className="w-6 h-6 text-gray-500" />
            </div>
            {upcomingBills.length > 0 ? (
              <div className="space-y-4">
                {upcomingBills.map((bill) => (
                  <div
                    key={bill.id}
                    className="flex justify-between items-center p-4 border-l-4 border-red-500 bg-red-50 rounded-lg"
                  >
                    <div>
                      <h3 className="font-medium text-gray-900">{bill.description}</h3>
                      <p className="text-sm text-gray-600">
                        {bill.category} • Vence em {new Date(bill.date).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <span className="text-lg font-semibold text-red-600">
                      R$ {bill.value.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Nenhuma conta vencendo nos próximos 7 dias</p>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Transações Recentes</h2>
              <ClockIcon className="w-6 h-6 text-gray-500" />
            </div>
            {recentTransactions.length > 0 ? (
              <div className="space-y-4">
                {recentTransactions.map((t) => (
                  <div
                    key={t.id}
                    className="flex justify-between items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                  >
                    <div>
                      <h3 className="font-medium text-gray-900">{t.description}</h3>
                      <p className="text-sm text-gray-500">
                        {t.category} • {new Date(t.date).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <span
                      className={`text-lg font-semibold ${
                        t.type === "income" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {t.type === "income" ? "+" : "-"} R$ {t.value.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Nenhuma transação registrada</p>
            )}
          </div>
        </div>

        {/* Botão para adicionar transação */}
        <div className="mt-8 text-center">
          <a
            href="/dashboard/transactions/add/"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition"
          >
            <PlusCircleIcon className="w-5 h-5" />
            Adicionar Nova Transação
          </a>
        </div>
      </main>
    </div>
  );
}