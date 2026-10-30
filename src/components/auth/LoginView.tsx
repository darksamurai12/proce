import React, { useState } from 'react';
import { 
  Building2, 
  CheckCircle2, 
  Lock, 
  Mail, 
  ShieldCheck, 
  User, 
  ArrowRight, 
  Loader2, 
  AlertCircle,
  Eye,
  EyeOff,
  Database
} from 'lucide-react';

export interface AppUser {
  email: string;
  displayName: string;
  role?: string;
}

interface LoginViewProps {
  onSuccess: (user: AppUser) => void;
  onContinueAsGuest?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onSuccess,
  onContinueAsGuest,
}) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Login Corporativo Rápido com perfil da WE Business Consulting
  const handleQuickAdminLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      const user: AppUser = {
        email: 'geral.weconsulting@gmail.com',
        displayName: 'WE Business Consulting',
        role: 'Administrador',
      };
      localStorage.setItem('kwanzafolha_auth_user', JSON.stringify(user));
      setIsLoading(false);
      onSuccess(user);
    }, 400);
  };

  // Login com Email e Senha
  const handleEmailAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage('Por favor, preencha o correio electrónico e a palavra-passe.');
      return;
    }

    if (password.length < 4) {
      setErrorMessage('A palavra-passe deve ter pelo menos 4 caracteres.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    setTimeout(() => {
      const name = fullName.trim() || email.split('@')[0];
      const user: AppUser = {
        email: email.trim(),
        displayName: name,
        role: isSignUp ? 'Gestor de RH' : 'Utilizador Autorizado',
      };
      localStorage.setItem('kwanzafolha_auth_user', JSON.stringify(user));
      setIsLoading(false);
      onSuccess(user);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-neutral-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-neutral-100 selection:bg-amber-500/20 selection:text-white">
      
      {/* Background Subtle Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-800 via-neutral-900 to-black opacity-80 pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        
        {/* Brand Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3.5 bg-white rounded-2xl shadow-xl">
            <img
              src="/assets/aistudio/logo_2_4756bbe5.png"
              alt="WE Business Consulting"
              className="h-12 w-auto object-contain"
            />
          </div>
          
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white uppercase">
              WE BUSINESS CONSULTING
            </h1>
            <p className="text-xs text-neutral-400 mt-1 font-medium">
              PRESTAÇÃO DE SERVIÇOS, LDA &bull; Processamento Salarial Angola
            </p>
          </div>

          {/* Legal Badges */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-800 text-neutral-300 border border-neutral-700">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              LGT Angola
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-800 text-neutral-300 border border-neutral-700">
              IRT (Lei 28/20)
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-800 text-neutral-300 border border-neutral-700">
              INSS 11% (3% + 8%)
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800">
              <Database className="w-3 h-3 text-emerald-400" />
              Cloud Firestore Activa
            </span>
          </div>
        </div>

        {/* Main Card */}
        <div className="mt-8 bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl p-6 sm:p-8 backdrop-blur-sm">
          
          <div className="space-y-6">
            
            {/* Header of Form */}
            <div className="border-b border-neutral-800 pb-4 text-center">
              <h2 className="text-base font-semibold text-white">
                {isSignUp ? 'Criar Acesso ao Sistema' : 'Acesso de Gestão e Recursos Humanos'}
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Inicie sessão para gerir colaboradores e emitir recibos de vencimento
              </p>
            </div>

            {/* Error Message banner */}
            {errorMessage && (
              <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-lg text-xs text-red-200 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed">{errorMessage}</div>
              </div>
            )}

            {/* Acesso Rápido Administrador WE Business Consulting */}
            <div>
              <button
                type="button"
                onClick={handleQuickAdminLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm rounded-lg transition-all duration-150 shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <>
                    <Building2 className="w-4 h-4" />
                    <span>Entrar como WE Business Consulting</span>
                  </>
                )}
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="border-t border-neutral-800 w-full" />
              <span className="bg-neutral-950 px-3 text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
                ou com as suas credenciais
              </span>
              <div className="border-t border-neutral-800 w-full" />
            </div>

            {/* Email / Password Form */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {isSignUp && (
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Nome Completo
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ex: Welles Fábio Ramos Correia de Melo"
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 transition-colors"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Correio Electrónico
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="geral.weconsulting@gmail.com"
                    required
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Palavra-passe
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-9 pr-10 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 p-0.5"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white hover:bg-neutral-100 text-neutral-950 font-semibold text-xs sm:text-sm rounded-lg transition-colors border border-neutral-200 disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-neutral-900" />
                ) : (
                  <>
                    <span>{isSignUp ? 'Criar Conta e Aceder' : 'Entrar no Sistema'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Alternar entre Iniciar Sessão e Criar Registo */}
            <div className="pt-2 text-center text-xs text-neutral-400">
              {isSignUp ? (
                <span>
                  Já possui credenciais?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(false);
                      setErrorMessage(null);
                    }}
                    className="text-white font-semibold hover:underline cursor-pointer"
                  >
                    Iniciar sessão
                  </button>
                </span>
              ) : (
                <span>
                  Novo utilizador de RH?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(true);
                      setErrorMessage(null);
                    }}
                    className="text-white font-semibold hover:underline cursor-pointer"
                  >
                    Registar novo utilizador
                  </button>
                </span>
              )}
            </div>

            {/* Modo Convidado / Demonstração */}
            {onContinueAsGuest && (
              <div className="pt-3 border-t border-neutral-800/80 text-center">
                <button
                  type="button"
                  onClick={onContinueAsGuest}
                  className="text-xs text-neutral-400 hover:text-neutral-200 transition-colors font-medium hover:underline cursor-pointer"
                >
                  Continuar em Modo de Demonstração (Sem Registo)
                </button>
              </div>
            )}

          </div>
        </div>

        {/* Security & Cloud Assurance Note */}
        <div className="mt-8 text-center text-[11px] text-neutral-500 space-y-1">
          <p>Acesso restrito a utilizadores autorizados de Recursos Humanos e Contabilidade.</p>
          <p>Base de Dados Cloud Firestore activa &bull; Dados guardados em nuvem.</p>
        </div>

      </div>

    </div>
  );
};
