// app/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function DashboardPage() {
  // Dados simulados
  const [balance, setBalance] = useState({
    income: 5200,
    expenses: 3150,
    balance: 2050
  });

  const [upcomingBills, setUpcomingBills] = useState([
    { id: 1, description: "Aluguel", amount: 1500, dueDate: "05/04/2025", category: "Moradia" },
    { id: 2, description: "Energia", amount: 180, dueDate: "10/04/2025", category: "Moradia" },
    { id: 3, description: "Netflix", amount: 35, dueDate: "15/04/2025", category: "Lazer" },
    { id: 4, description: "Internet", amount: 99, dueDate: "20/04/2025", category: "Moradia" }
  ]);

  const [recentTransactions, setRecentTransactions] = useState([
    { id: 1, description: "Salário", amount: 4500, date: "01/04/2025", type: "income", category: "Trabalho" },
    { id: 2, description: "Supermercado", amount: 280, date: "02/04/2025", type: "expense", category: "Alimentação" },
    { id: 3, description: "Restaurante", amount: 120, date: "03/04/2025", type: "expense", category: "Lazer" },
    { id: 4, description: "Freelance", amount: 700, date: "04/04/2025", type: "income", category: "Trabalho" },
    { id: 5, description: "Combustível", amount: 150, date: "05/04/2025", type: "expense", category: "Transporte" }
  ]);

  // Dados para gráficos
  const barChartData = {
    labels: ['Jan', 'Fev', 'Mar', 'Abr'],
    datasets: [
      {
        label: 'Receitas',
        data: [4800, 5200, 4900, 5200],
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
      {
        label: 'Despesas',
        data: [3200, 3100, 3400, 3150],
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
    ],
  };

  const pieChartData = {
    labels: ['Moradia', 'Alimentação', 'Transporte', 'Lazer', 'Saúde'],
    datasets: [
      {
        data: [1500, 680, 350, 250, 150],
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF'
        ],
        borderWidth: 2,
      }
    ]
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Receitas vs Despesas (últimos 4 meses)',
      },
    },
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Distribuição de Despesas por Categoria',
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">FinTrack Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Olá, Usuário</span>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">Receitas Totais</h3>
            <p className="text-3xl font-bold">R$ {balance.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            <p className="text-green-100 text-sm mt-2">+12% em relação ao mês anterior</p>
          </div>
          
          <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">Despesas Totais</h3>
            <p className="text-3xl font-bold">R$ {balance.expenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            <p className="text-red-100 text-sm mt-2">-5% em relação ao mês anterior</p>
          </div>
          
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">Saldo Atual</h3>
            <p className="text-3xl font-bold">R$ {balance.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            <p className="text-blue-100 text-sm mt-2">Saldo positivo</p>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <Bar data={barChartData} options={barChartOptions} />
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <Pie data={pieChartData} options={pieChartOptions} />
          </div>
        </div>

        {/* Alertas e Transações Recentes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Próximas Despesas */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Próximas Despesas</h2>
            <div className="space-y-4">
              {upcomingBills.map((bill) => (
                <div key={bill.id} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                  <div>
                    <h3 className="font-medium text-gray-900">{bill.description}</h3>
                    <p className="text-sm text-gray-500">{bill.category} • Vence em {bill.dueDate}</p>
                  </div>
                  <span className="text-lg font-semibold text-red-600">R$ {bill.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Transações Recentes */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Transações Recentes</h2>
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                  <div>
                    <h3 className="font-medium text-gray-900">{transaction.description}</h3>
                    <p className="text-sm text-gray-500">{transaction.category} • {transaction.date}</p>
                  </div>
                  <span className={`text-lg font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.type === 'income' ? '+' : '-'} R$ {transaction.amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cotações */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Dólar (USD)</h3>
            <p className="text-2xl font-bold text-green-600">R$ 5,12</p>
            <p className="text-sm text-gray-500">+0.5% hoje</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Euro (EUR)</h3>
            <p className="text-2xl font-bold text-red-600">R$ 5,56</p>
            <p className="text-sm text-gray-500">-0.2% hoje</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Ibovespa</h3>
            <p className="text-2xl font-bold text-blue-600">125.420</p>
            <p className="text-sm text-gray-500">+1.2% hoje</p>
          </div>
        </div>
      </main>
    </div>
  );
}