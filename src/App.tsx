/**
 * KwanzaFolha Angola - Sistema de Processamento Salarial
 * Adaptado para a Legislação Laboral e Fiscal de Angola
 * - Código do IRT (Lei n.º 28/20)
 * - Regime da Segurança Social (INSS Angola - 3% Trabalhador e 8% Patronal)
 * - Lei Geral do Trabalho (LGT)
 * - Base de Dados na Nuvem (Google Cloud Firestore & Firebase Auth)
 */

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { CompanySettings, Employee, PayrollPeriod } from './types/payroll';
import { calculateEmployeePayroll } from './utils/angolaPayrollCalculator';
import { Navbar, NavTab } from './components/layout/Navbar';
import { DashboardView } from './components/dashboard/DashboardView';
import { PayrollProcessingView } from './components/payroll/PayrollProcessingView';
import { EmployeeList } from './components/employees/EmployeeList';
import { EmployeeModal } from './components/employees/EmployeeModal';
import { PayslipView } from './components/payslip/PayslipView';
import { LegalReportsView } from './components/reports/LegalReportsView';
import { SalaryCalculatorView } from './components/calculator/SalaryCalculatorView';
import { SettingsView } from './components/settings/SettingsView';
import { NewPeriodModal } from './components/payroll/NewPeriodModal';
import { getMonthName } from './utils/formatters';

import { auth, googleProvider, testConnection } from './firebase/config';
import {
  DEFAULT_CLEAN_SETTINGS,
  loadCompanySettings,
  saveCompanySettingsToDb,
  subscribeEmployees,
  addEmployeeToDb,
  updateEmployeeInDb,
  deleteEmployeeFromDb,
  subscribePayrollPeriods,
  savePayrollPeriodToDb,
  deletePayrollPeriodFromDb,
} from './firebase/payrollService';
import { Database, LogIn, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function App() {
  // Estado de Autenticação Firebase
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [dbConnected, setDbConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Estado das configurações da empresa
  const [settings, setSettings] = useState<CompanySettings>(DEFAULT_CLEAN_SETTINGS);

  // Estado dos colaboradores (carregados da BD)
  const [employees, setEmployees] = useState<Employee[]>([]);

  // Estado dos períodos de folha salarial (carregados da BD)
  const [periods, setPeriods] = useState<PayrollPeriod[]>([]);
  const [activePeriodId, setActivePeriodId] = useState<string>('');

  // Navegação e Selecção
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [selectedPayslipEmpId, setSelectedPayslipEmpId] = useState<string>('');

  // Modais
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [isNewPeriodModalOpen, setIsNewPeriodModalOpen] = useState(false);

  // Limpa feedback temporário
  const showFeedback = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setFeedbackMessage({ text, type });
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 4000);
  };

  // Inicialização e Monitorização de Autenticação
  useEffect(() => {
    testConnection().then((ok) => {
      setDbConnected(ok);
    });

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setIsAuthReady(true);

      if (user) {
        setIsSyncing(true);
        try {
          const loadedSettings = await loadCompanySettings();
          setSettings(loadedSettings);
        } catch (e) {
          console.error('Erro ao carregar configurações:', e);
        } finally {
          setIsSyncing(false);
        }
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Subscrição em Tempo Real aos Colaboradores e Períodos no Firestore
  useEffect(() => {
    if (!currentUser) {
      return;
    }

    setIsSyncing(true);

    const unsubEmployees = subscribeEmployees(
      (list) => {
        setEmployees(list);
        setIsSyncing(false);
      },
      (err) => {
        console.warn('Erro ao escutar colaboradores:', err);
        setIsSyncing(false);
      }
    );

    const unsubPeriods = subscribePayrollPeriods(
      (list) => {
        setPeriods(list);
        if (list.length > 0 && !activePeriodId) {
          setActivePeriodId(list[0].id);
        }
        setIsSyncing(false);
      },
      (err) => {
        console.warn('Erro ao escutar períodos:', err);
        setIsSyncing(false);
      }
    );

    return () => {
      unsubEmployees();
      unsubPeriods();
    };
  }, [currentUser, activePeriodId]);

  // Período actual em visualização
  const activePeriod = periods.find((p) => p.id === activePeriodId) || periods[0] || null;

  // Login com Conta Google
  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      showFeedback('Sessão iniciada com sucesso. A sua base de dados está sincronizada!', 'success');
    } catch (error: any) {
      console.error('Erro ao iniciar sessão:', error);
      showFeedback(`Falha ao iniciar sessão: ${error.message}`, 'error');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      showFeedback('Sessão terminada.', 'info');
    } catch (error: any) {
      console.error('Erro ao terminar sessão:', error);
    }
  };

  // Guardar Colaborador (Adicionar / Editar) na BD
  const handleSaveEmployee = async (empToSave: Employee) => {
    const exists = employees.some((e) => e.id === empToSave.id);
    setIsSyncing(true);

    try {
      if (currentUser) {
        if (exists) {
          await updateEmployeeInDb(empToSave);
          showFeedback(`Colaborador ${empToSave.fullName} actualizado na base de dados!`, 'success');
        } else {
          await addEmployeeToDb(empToSave);
          showFeedback(`Colaborador ${empToSave.fullName} cadastrado na base de dados com sucesso!`, 'success');
        }
      } else {
        // Fallback local se ainda não autenticado
        setEmployees((prev) => (exists ? prev.map((e) => (e.id === empToSave.id ? empToSave : e)) : [empToSave, ...prev]));
        showFeedback(`Colaborador guardado localmente. Ligue a sua conta Google para gravar na nuvem.`, 'info');
      }

      // Se houver um período activo, actualiza o cálculo correspondente
      if (activePeriod) {
        const currentInput = activePeriod.items?.[empToSave.id] || {
          employeeId: empToSave.id,
          daysWorked: 22,
          daysAbsentUnjustified: 0,
          overtimeHoursDay: 0,
          overtimeHoursNight: 0,
          bonus: 0,
          salaryAdvance: 0,
          unionFeePercent: 1,
          otherDeductions: 0,
        };

        const newResult = calculateEmployeePayroll(empToSave, currentInput, settings, activePeriod.id);
        const updatedPeriod: PayrollPeriod = {
          ...activePeriod,
          items: {
            ...(activePeriod.items || {}),
            [empToSave.id]: currentInput,
          },
          results: {
            ...(activePeriod.results || {}),
            [empToSave.id]: newResult,
          },
        };

        if (currentUser) {
          await savePayrollPeriodToDb(updatedPeriod);
        } else {
          setPeriods((prev) => prev.map((p) => (p.id === updatedPeriod.id ? updatedPeriod : p)));
        }
      }
    } catch (err: any) {
      console.error('Erro ao gravar colaborador:', err);
      showFeedback(`Erro ao gravar na base de dados: ${err.message}`, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Remover Colaborador da BD
  const handleDeleteEmployee = async (empId: string) => {
    setIsSyncing(true);
    try {
      if (currentUser) {
        await deleteEmployeeFromDb(empId);
        showFeedback('Colaborador eliminado da base de dados com sucesso.', 'info');
      } else {
        setEmployees((prev) => prev.filter((e) => e.id !== empId));
      }

      // Remove dos períodos em memória / BD
      if (activePeriod && activePeriod.items?.[empId]) {
        const newItems = { ...activePeriod.items };
        delete newItems[empId];
        const newResults = { ...activePeriod.results };
        delete newResults[empId];

        const updatedPeriod = {
          ...activePeriod,
          items: newItems,
          results: newResults,
        };

        if (currentUser) {
          await savePayrollPeriodToDb(updatedPeriod);
        } else {
          setPeriods((prev) => prev.map((p) => (p.id === updatedPeriod.id ? updatedPeriod : p)));
        }
      }
    } catch (err: any) {
      console.error('Erro ao eliminar colaborador:', err);
      showFeedback(`Erro ao eliminar: ${err.message}`, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Actualizar Folha Salarial na BD
  const handleUpdatePeriod = async (updatedPeriod: PayrollPeriod) => {
    setIsSyncing(true);
    try {
      if (currentUser) {
        await savePayrollPeriodToDb(updatedPeriod);
        showFeedback(`Folha de ${updatedPeriod.label} gravada na base de dados!`, 'success');
      } else {
        setPeriods((prev) => prev.map((p) => (p.id === updatedPeriod.id ? updatedPeriod : p)));
      }
    } catch (err: any) {
      console.error('Erro ao actualizar folha:', err);
      showFeedback(`Erro ao gravar folha: ${err.message}`, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Criar Novo Período de Folha na BD
  const handleCreatePeriod = async (month: number, year: number, type: 'regular' | 'vacation' | 'thirteenth') => {
    const periodId = `${year}-${String(month).padStart(2, '0')}${type !== 'regular' ? `-${type}` : ''}`;

    const existing = periods.find((p) => p.id === periodId);
    if (existing) {
      setActivePeriodId(periodId);
      setCurrentTab('payroll');
      showFeedback(`Acedendo à folha existente de ${existing.label}.`, 'info');
      return;
    }

    const typeSuffix = type === 'vacation' ? ' (Férias)' : type === 'thirteenth' ? ' (13º Mês)' : '';
    const label = `${getMonthName(month)} ${year}${typeSuffix}`;

    const items: Record<string, any> = {};
    const results: Record<string, any> = {};

    employees.forEach((emp) => {
      const input = {
        employeeId: emp.id,
        daysWorked: 22,
        daysAbsentUnjustified: 0,
        overtimeHoursDay: 0,
        overtimeHoursNight: 0,
        bonus: 0,
        salaryAdvance: 0,
        unionFeePercent: 1,
        otherDeductions: 0,
      };
      items[emp.id] = input;
      results[emp.id] = calculateEmployeePayroll(emp, input, settings, periodId);
    });

    const newPeriod: PayrollPeriod = {
      id: periodId,
      month,
      year,
      label,
      type,
      status: 'draft',
      createdAt: new Date().toISOString(),
      items,
      results,
    };

    setIsSyncing(true);
    try {
      if (currentUser) {
        await savePayrollPeriodToDb(newPeriod);
      } else {
        setPeriods((prev) => [newPeriod, ...prev]);
      }
      setActivePeriodId(periodId);
      setCurrentTab('payroll');
      showFeedback(`Nova folha de ${label} criada e gravada na base de dados!`, 'success');
    } catch (err: any) {
      console.error('Erro ao criar período:', err);
      showFeedback(`Erro ao gravar novo período: ${err.message}`, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Eliminar Período de Folha
  const handleDeletePeriod = async (periodId: string) => {
    setIsSyncing(true);
    try {
      if (currentUser) {
        await deletePayrollPeriodFromDb(periodId);
      }
      setPeriods((prev) => prev.filter((p) => p.id !== periodId));
      if (activePeriodId === periodId) {
        const remaining = periods.filter((p) => p.id !== periodId);
        setActivePeriodId(remaining[0]?.id || '');
      }
      showFeedback('Período de folha eliminado da base de dados.', 'info');
    } catch (err: any) {
      console.error('Erro ao eliminar período:', err);
      showFeedback(`Erro ao eliminar: ${err.message}`, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Guardar Configurações da Empresa na BD
  const handleSaveSettings = async (newSettings: CompanySettings) => {
    setSettings(newSettings);
    setIsSyncing(true);
    try {
      if (currentUser) {
        await saveCompanySettingsToDb(newSettings);
        showFeedback('Configurações da empresa guardadas com sucesso na base de dados!', 'success');
      } else {
        showFeedback('Configurações salvas localmente. Ligue a sua conta Google para gravar na nuvem.', 'info');
      }
    } catch (err: any) {
      console.error('Erro ao guardar configurações:', err);
      showFeedback(`Erro ao guardar configurações: ${err.message}`, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Exportar Backup JSON
  const handleExportAllData = () => {
    const backup = {
      version: '2.0',
      exportDate: new Date().toISOString(),
      country: 'Angola',
      settings,
      employees,
      periods,
    };
    const jsonStr = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Backup_KwanzaFolha_Angola_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    showFeedback('Ficheiro de backup JSON transferido!', 'info');
  };

  // Importar Backup JSON
  const handleImportAllData = async (jsonStr: string) => {
    const data = JSON.parse(jsonStr);
    if (data.settings && Array.isArray(data.employees)) {
      setSettings(data.settings);
      setEmployees(data.employees);
      if (Array.isArray(data.periods)) {
        setPeriods(data.periods);
        if (data.periods[0]) setActivePeriodId(data.periods[0].id);
      }

      if (currentUser) {
        setIsSyncing(true);
        await saveCompanySettingsToDb(data.settings);
        for (const emp of data.employees) {
          await addEmployeeToDb(emp);
        }
        if (Array.isArray(data.periods)) {
          for (const p of data.periods) {
            await savePayrollPeriodToDb(p);
          }
        }
        setIsSyncing(false);
        showFeedback('Dados importados e sincronizados com a base de dados Firestore!', 'success');
      } else {
        showFeedback('Dados importados localmente. Ligue com Google para sincronizar com a base de dados.', 'info');
      }
    } else {
      throw new Error('Ficheiro de backup inválido.');
    }
  };

  const handleSelectEmployeePayslip = (empId: string) => {
    setSelectedPayslipEmpId(empId);
    setCurrentTab('payslip');
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900 font-sans selection:bg-neutral-900 selection:text-white">
      
      {/* Top Bar Navigation com Autenticação e Indicador de BD */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        activePeriodLabel={activePeriod?.label}
        onNewPayrollModal={() => setIsNewPeriodModalOpen(true)}
        currentUser={currentUser}
        onSignIn={handleGoogleSignIn}
        onSignOut={handleSignOut}
        isDbSyncing={isSyncing}
      />

      {/* Notificação / Feedback flutuante */}
      {feedbackMessage && (
        <div
          className={`fixed bottom-4 right-4 z-50 px-4 py-2.5 rounded-lg shadow-lg border text-xs font-medium flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200 ${
            feedbackMessage.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : feedbackMessage.type === 'info'
              ? 'bg-neutral-900 text-white border-neutral-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          {feedbackMessage.type === 'error' ? (
            <AlertTriangle className="w-4 h-4 text-red-600" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          )}
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {/* Banner de Ligação à Base de Dados caso não esteja autenticado */}
      {!currentUser && isAuthReady && (
        <div className="no-print bg-neutral-900 text-white px-4 py-3 text-xs border-b border-neutral-800">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Base de dados pronta (Google Cloud Firestore):</strong> Para gravar e sincronizar os seus colaboradores e folhas em tempo real com segurança, ligue a sua conta Google.
              </span>
            </div>
            <button
              onClick={handleGoogleSignIn}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-neutral-900 font-semibold rounded-md hover:bg-neutral-100 transition-colors whitespace-nowrap shadow-xs"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Ligar com Google</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Barra de Período Seleccionado */}
        {['payroll', 'payslip', 'reports'].includes(currentTab) && periods.length > 1 && (
          <div className="no-print mb-6 p-3 bg-white border border-neutral-200 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-neutral-700">Período de Folha Seleccionado:</span>
              <select
                value={activePeriodId}
                onChange={(e) => setActivePeriodId(e.target.value)}
                className="font-medium text-neutral-900 border border-neutral-300 rounded px-2.5 py-1 bg-neutral-50 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              >
                {periods.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label} ({p.status === 'approved' ? 'Aprovada' : 'Rascunho'})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 text-neutral-500">
              <span>{employees.length} colaboradores na base de dados</span>
            </div>
          </div>
        )}

        {/* Rotas de Visualização */}
        {currentTab === 'dashboard' && (
          <DashboardView
            period={activePeriod}
            employees={employees}
            settings={settings}
            onNavigate={setCurrentTab}
            onSelectEmployeePayslip={handleSelectEmployeePayslip}
            onNewPayrollModal={() => setIsNewPeriodModalOpen(true)}
          />
        )}

        {currentTab === 'payroll' && (
          <PayrollProcessingView
            period={activePeriod}
            employees={employees}
            settings={settings}
            onUpdatePeriod={handleUpdatePeriod}
            onDeletePeriod={handleDeletePeriod}
            onViewPayslip={handleSelectEmployeePayslip}
            onNewPayrollModal={() => setIsNewPeriodModalOpen(true)}
            onNavigateToEmployees={() => setCurrentTab('employees')}
          />
        )}

        {currentTab === 'employees' && (
          <EmployeeList
            employees={employees}
            onAddEmployee={() => {
              setEditingEmployee(null);
              setIsEmployeeModalOpen(true);
            }}
            onEditEmployee={(emp) => {
              setEditingEmployee(emp);
              setIsEmployeeModalOpen(true);
            }}
            onDeleteEmployee={handleDeleteEmployee}
            onViewPayslip={handleSelectEmployeePayslip}
          />
        )}

        {currentTab === 'payslip' && (
          <PayslipView
            period={activePeriod}
            employees={employees}
            settings={settings}
            selectedEmployeeId={selectedPayslipEmpId}
          />
        )}

        {currentTab === 'reports' && (
          <LegalReportsView
            period={activePeriod}
            employees={employees}
            settings={settings}
          />
        )}

        {currentTab === 'calculator' && (
          <SalaryCalculatorView />
        )}

        {currentTab === 'settings' && (
          <SettingsView
            settings={settings}
            onSaveSettings={handleSaveSettings}
            onExportAllData={handleExportAllData}
            onImportAllData={handleImportAllData}
            onResetToDemoData={() => {
              setEmployees([]);
              setPeriods([]);
              setActivePeriodId('');
              showFeedback('Base de dados limpa. Pronta para novos dados.', 'info');
            }}
          />
        )}

      </main>

      {/* Modais de Cadastro e Edição */}
      <EmployeeModal
        isOpen={isEmployeeModalOpen}
        onClose={() => {
          setIsEmployeeModalOpen(false);
          setEditingEmployee(null);
        }}
        onSave={handleSaveEmployee}
        initialEmployee={editingEmployee}
      />

      <NewPeriodModal
        isOpen={isNewPeriodModalOpen}
        onClose={() => setIsNewPeriodModalOpen(false)}
        onCreatePeriod={handleCreatePeriod}
        existingPeriods={periods}
      />

      {/* Rodapé Institucional */}
      <footer className="no-print mt-auto border-t border-neutral-200 bg-white py-6 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-900">KwanzaFolha Angola</span>
            <span aria-hidden="true">·</span>
            <span>Sistema Laboral e Fiscal de Angola (BD Firestore)</span>
          </div>

          <div className="flex items-center gap-4 text-neutral-400">
            <span>Lei n.º 28/20 (Código do IRT)</span>
            <span aria-hidden="true">·</span>
            <span>INSS Angola (3% + 8%)</span>
            <span aria-hidden="true">·</span>
            <span>Lei Geral do Trabalho</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
