// components/layout/Navbar.tsx
"use client";

import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

export default function Navbar() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md p-4">
      <div className="flex justify-between items-center">
        <Link href="/dashboard" className="text-xl font-bold text-blue-600">
          FinTrack
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-4">
          <Link href="/dashboard" className="text-gray-700 hover:text-blue-600">
            Dashboard
          </Link>
          <Link href="/dashboard/transactions" className="text-gray-700 hover:text-blue-600">
            Transações
          </Link>
          <Link href="/dashboard/profile" className="text-gray-700 hover:text-blue-600">
            Perfil
          </Link>
          <button
            onClick={() => signOut()}
            className="text-red-600 hover:text-red-800 font-medium"
          >
            Sair
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden mt-4 flex flex-col space-y-2">
          <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 p-2">
            Dashboard
          </Link>
          <Link href="/dashboard/transactions" className="text-gray-700 hover:text-blue-600 p-2">
            Transações
          </Link>
          <Link href="/dashboard/profile" className="text-gray-700 hover:text-blue-600 p-2">
            Perfil
          </Link>
          <button
            onClick={() => signOut()}
            className="text-red-600 hover:text-red-800 font-medium p-2 text-left"
          >
            Sair
          </button>
        </div>
      )}
    </nav>
  );
}