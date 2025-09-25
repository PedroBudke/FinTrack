"use client";

import { useState, useEffect } from 'react';
import { auth, googleProvider, githubProvider } from '@/lib/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail,
  signInWithPopup,
  updateProfile,
  sendEmailVerification,
  User
} from 'firebase/auth';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';

export default function HomePage() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false); // Novo modal
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const router = useRouter();

  // Verifica se usuário já está logado
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        if (user.emailVerified) {
          router.push('/dashboard');
        } else {
          setShowVerificationModal(true);
        }
      }
    });
    return unsubscribe;
  }, [router]);

  // Funções de autenticação
  const handleRegister = async (email: string, password: string, name: string) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      
      // ✅ Envia e-mail de verificação
      await sendEmailVerification(userCredential.user);
      
      toast.success('Conta criada! Verifique seu e-mail para ativar sua conta.');
      setShowRegisterModal(false);
      setCurrentUser(userCredential.user);
      setShowVerificationModal(true);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || 'Erro ao criar conta');
      } else {
        toast.error('Erro ao criar conta');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        // ✅ Bloqueia login se e-mail não verificado
        toast.error('Verifique seu e-mail antes de fazer login.');
        await auth.signOut(); // Desloga imediatamente
        setCurrentUser(null);
        setShowVerificationModal(true);
        return;
      }

      toast.success('Login realizado com sucesso!');
      setShowLoginModal(false);
      router.push('/dashboard');
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || 'Erro ao fazer login');
      } else {
        toast.error('Erro ao fazer login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (email: string) => {
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('E-mail de recuperação enviado!');
      setShowForgotPasswordModal(false);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || 'Erro ao enviar e-mail');
      } else {
        toast.error('Erro ao enviar e-mail');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: import("firebase/auth").AuthProvider) => {
    setLoading(true);
    try {
      await signInWithPopup(auth, provider);
      // ✅ Nota: contas OAuth (Google/GitHub) não exigem verificação de e-mail
      toast.success('Login realizado com sucesso!');
      setShowLoginModal(false);
      setShowRegisterModal(false);
      setShowForgotPasswordModal(false);
      setShowVerificationModal(false);
      router.push('/dashboard');
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || 'Erro ao fazer login');
      } else {
        toast.error('Erro ao fazer login');
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Reenvia e-mail de verificação
  const handleResendVerification = async () => {
    if (!currentUser) return;
    try {
      await sendEmailVerification(currentUser);
      toast.success('E-mail de verificação reenviado!');
    } catch (error) {
      toast.error('Erro ao reenviar e-mail. Tente novamente.');
    }
  };

  // ✅ Verifica novamente se o e-mail foi verificado
  const handleCheckVerification = async () => {
    if (!currentUser) return;
    try {
      await currentUser.reload();
      if (currentUser.emailVerified) {
        toast.success('E-mail verificado com sucesso!');
        setShowVerificationModal(false);
        router.push('/dashboard');
      } else {
        toast.error('E-mail ainda não verificado.');
      }
    } catch (error) {
      toast.error('Erro ao verificar e-mail.');
    }
  };

  // ✅ Faz logout
  const handleLogout = async () => {
    await auth.signOut();
    setCurrentUser(null);
    setShowVerificationModal(false);
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800">
      {/* Navbar */}
      <nav className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-white">FinTrack</h1>
            </div>
            <div className="flex space-x-4">
              <button 
                onClick={() => setShowLoginModal(true)}
                className="text-white hover:text-blue-200 font-medium transition duration-300"
              >
                Login
              </button>
              <button 
                onClick={() => setShowRegisterModal(true)}
                className="bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg font-medium transition duration-300 transform hover:scale-105"
              >
                Cadastro
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6">
            Controle suas finanças com
            <span className="text-yellow-300"> inteligência</span>
          </h1>
          <p className="text-xl text-blue-100 mb-10 max-w-3xl mx-auto">
            FinTrack é a plataforma completa para gerenciar seus gastos, investimentos e alcançar seus objetivos financeiros.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => setShowRegisterModal(true)}
              className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-xl font-bold text-lg transition duration-300 transform hover:scale-105 shadow-lg"
            >
              Comece Agora - É Grátis
            </button>
            <button 
              onClick={() => setShowLoginModal(true)}
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-xl font-bold text-lg transition duration-300"
            >
              Já tenho conta
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-white mb-2">Dashboard Inteligente</h3>
            <p className="text-blue-100">Visualize seus gastos e receitas em tempo real com gráficos interativos.</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20">
            <div className="text-4xl mb-4">🔔</div>
            <h3 className="text-xl font-bold text-white mb-2">Alertas Personalizados</h3>
            <p className="text-blue-100">Receba notificações sobre vencimentos e limites de gastos.</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-bold text-white mb-2">Segurança Total</h3>
            <p className="text-blue-100">Seus dados financeiros protegidos com criptografia de ponta a ponta.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black/20 backdrop-blur-sm border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-white/80">
            <p>© 2024 FinTrack. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Modais */}
      {showLoginModal && (
        <LoginModal 
          onClose={() => setShowLoginModal(false)} 
          onForgotPassword={() => {
            setShowLoginModal(false);
            setShowForgotPasswordModal(true);
          }}
          onRegister={() => {
            setShowLoginModal(false);
            setShowRegisterModal(true);
          }}
          onLogin={handleLogin}
          onSocialLogin={handleSocialLogin}
          loading={loading}
        />
      )}

      {showRegisterModal && (
        <RegisterModal 
          onClose={() => setShowRegisterModal(false)} 
          onLogin={() => {
            setShowRegisterModal(false);
            setShowLoginModal(true);
          }}
          onRegister={handleRegister}
          onSocialLogin={handleSocialLogin}
          loading={loading}
        />
      )}

      {showForgotPasswordModal && (
        <ForgotPasswordModal 
          onClose={() => setShowForgotPasswordModal(false)} 
          onLogin={() => {
            setShowForgotPasswordModal(false);
            setShowLoginModal(true);
          }}
          onForgotPassword={handleForgotPassword}
          loading={loading}
        />
      )}

      {/* ✅ NOVO MODAL: Verificação de E-mail */}
      {showVerificationModal && currentUser && (
        <VerificationModal
          email={currentUser.email || ''}
          onResend={handleResendVerification}
          onCheck={handleCheckVerification}
          onLogout={handleLogout}
          loading={loading}
        />
      )}
    </div>
  );
}

// ==================== MODAL DE VERIFICAÇÃO DE E-MAIL ====================
function VerificationModal({ 
  email, 
  onResend, 
  onCheck, 
  onLogout,
  loading
}: { 
  email: string; 
  onResend: () => void; 
  onCheck: () => void;
  onLogout: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
        <div className="mb-6 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Verifique seu e-mail</h2>
          <p className="text-gray-600 mt-2">
            Enviamos um link de verificação para:
            <br />
            <span className="font-semibold text-blue-600">{email}</span>
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={onCheck}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition"
          >
            Verificar Agora
          </button>

          <button
            onClick={onResend}
            disabled={loading}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-4 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Enviando...' : 'Reenviar E-mail'}
          </button>

          <button
            onClick={onLogout}
            className="w-full text-gray-600 hover:text-gray-800 font-medium py-3 px-4 rounded-lg transition"
          >
            Sair
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== COMPONENTES DOS MODAIS EXISTENTES ====================
// (LoginModal, RegisterModal, ForgotPasswordModal permanecem exatamente como antes)

function LoginModal({ 
  onClose, 
  onForgotPassword, 
  onRegister,
  onLogin,
  onSocialLogin,
  loading
}: { 
  onClose: () => void; 
  onForgotPassword: () => void;
  onRegister: () => void;
  onLogin: (email: string, password: string) => Promise<void>;
  onSocialLogin: (provider: import("firebase/auth").AuthProvider) => Promise<void>;
  loading: boolean;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={handleBackdropClick}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          aria-label="Fechar"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
        
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Login</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="seu@email.com"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
              required
            />
          </div>
          
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        
        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-4 text-gray-500 text-sm">ou continue com</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>
        
        <div className="space-y-3">
          <button 
            onClick={() => onSocialLogin(googleProvider)}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg transition duration-300 disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </button>
          
          <button 
            onClick={() => onSocialLogin(githubProvider)}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-lg transition duration-300 disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            GitHub
          </button>
        </div>
        
        <div className="mt-6 text-center">
          <button 
            onClick={onForgotPassword}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Esqueceu sua senha?
          </button>
        </div>
      </div>
    </div>
  );
}

function RegisterModal({ 
  onClose, 
  onLogin,
  onRegister,
  onSocialLogin,
  loading
}: { 
  onClose: () => void; 
  onLogin: () => void;
  onRegister: (email: string, password: string, name: string) => Promise<void>;
  onSocialLogin: (provider: import("firebase/auth").AuthProvider) => Promise<void>;
  loading: boolean;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const formatCPF = (value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    if (cleanValue.length <= 3) return cleanValue;
    if (cleanValue.length <= 6) return `${cleanValue.slice(0, 3)}.${cleanValue.slice(3)}`;
    if (cleanValue.length <= 9) return `${cleanValue.slice(0, 3)}.${cleanValue.slice(3, 6)}.${cleanValue.slice(6)}`;
    return `${cleanValue.slice(0, 3)}.${cleanValue.slice(3, 6)}.${cleanValue.slice(6, 9)}-${cleanValue.slice(9, 11)}`;
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setCpf(formatted);
  };

  const validateCPFLocal = (cpf: string): boolean => {
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
    let sum = 0;
    for (let i = 0; i < 9; i++) sum += parseInt(cpf.charAt(i)) * (10 - i);
    let remainder = sum % 11;
    const firstDigit = remainder < 2 ? 0 : 11 - remainder;
    if (firstDigit !== parseInt(cpf.charAt(9))) return false;
    sum = 0;
    for (let i = 0; i < 10; i++) sum += parseInt(cpf.charAt(i)) * (11 - i);
    remainder = sum % 11;
    const secondDigit = remainder < 2 ? 0 : 11 - remainder;
    return secondDigit === parseInt(cpf.charAt(10));
  };

  const validateCPFWithAPI = async (cpf: string): Promise<boolean> => {
    const cleanCPF = cpf.replace(/\D/g, '');
    if (cleanCPF.length !== 11) return false;
    return validateCPFLocal(cleanCPF);
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem!');
      return;
    }

    const cleanCPF = cpf.replace(/\D/g, '');
    if (cleanCPF.length !== 11) {
      toast.error('CPF inválido. Preencha corretamente.');
      return;
    }

    const isCPFValid = await validateCPFWithAPI(cleanCPF);

    if (!isCPFValid) {
      toast.error('CPF inválido. Verifique os dígitos e tente novamente.');
      return;
    }

    onRegister(email, password, name);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={handleBackdropClick}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          aria-label="Fechar"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
        
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Cadastro</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Seu nome completo"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
            <input 
              type="text" 
              value={cpf}
              onChange={handleCPFChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="000.000.000-00"
              required
              maxLength={14}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="seu@email.com"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Senha</label>
            <input 
              type="password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
              required
            />
          </div>
          
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 disabled:opacity-50"
          >
            {loading ? 'Verificando CPF...' : 'Criar Conta'}
          </button>
        </form>
        
        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-4 text-gray-500 text-sm">ou continue com</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>
        
        <div className="space-y-3">
          <button 
            onClick={() => onSocialLogin(googleProvider)}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg transition duration-300 disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </button>
          
          <button 
            onClick={() => onSocialLogin(githubProvider)}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-lg transition duration-300 disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            GitHub
          </button>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Já tem uma conta? 
            <button 
              onClick={() => {
                onClose();
                onLogin();
              }}
              className="text-blue-600 hover:text-blue-800 font-medium ml-1"
            >
              Faça login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function ForgotPasswordModal({ 
  onClose, 
  onLogin,
  onForgotPassword,
  loading
}: { 
  onClose: () => void; 
  onLogin: () => void;
  onForgotPassword: (email: string) => Promise<void>;
  loading: boolean;
}) {
  const [email, setEmail] = useState('');

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onForgotPassword(email);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={handleBackdropClick}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          aria-label="Fechar"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
        
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Recuperar Senha</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="seu@email.com"
              required
            />
          </div>
          
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 disabled:opacity-50"
          >
            {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <button 
            onClick={() => {
              onClose();
              onLogin();
            }}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Voltar ao login
          </button>
        </div>
      </div>
    </div>
  );
}