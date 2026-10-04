/**
 * KwanzaFolha Angola - Sistema de Processamento Salarial
 * Adaptado para a Legislação Laboral e Fiscal de Angola
 * - Código do IRT (Lei n.º 28/20)
 * - Regime da Segurança Social (INSS Angola - 3% Trabalhador e 8% Patronal)
 * - Lei Geral do Trabalho (LGT)
 */

import React, { useState, useEffect } from 'react';
import { CompanySettings, Employee, PayrollPeriod } from './types/payroll';
import { 
  INITIAL_COMPANY_SETTINGS, 
  INITIAL_EMPLOYEES, 
  createInitialPeriod 
} from './data/initialData';
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

const STORAGE_KEYS = {
  SETTINGS: 'kwanza_payroll_settings_v1',
  EMPLOYEES: 'kwanza_payroll_employees_v1',
  PERIODS: 'kwanza_payroll_periods_v1',
  ACTIVE_PERIOD_ID: 'kwanza_payroll_active_period_id_v1'
};

export default function App() {
  // Estado das configurações
  const [settings, setSettings] = useState<CompanySettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_COMPANY_SETTINGS;
  });

  // Estado dos colaboradores
  const [employees, setEmployees] = useState<Employee[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_EMPLOYEES;
  });

  // Estado dos períodos de processamento
  const [periods, setPeriods] = useState<PayrollPeriod[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PERIODS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    const initialPeriod = createInitialPeriod(INITIAL_EMPLOYEES, INITIAL_COMPANY_SETTINGS);
    return [initialPeriod];
  });

  // Período activo seleccionado
  const [activePeriodId, setActivePeriodId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_PERIOD_ID);
      if (saved) return saved;
    } catch (e) {
      console.error(e);
    }
    return '2026-10';
  });

  // Navegação
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [selectedPayslipEmpId, setSelectedPayslipEmpId] = useState<string>('');

  // Modais
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [isNewPeriodModalOpen, setIsNewPeriodModalOpen] = useState(false);

  // Sincronização com LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error(e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
    } catch (e) {
      console.error(e);
    }
  }, [employees]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PERIODS, JSON.stringify(periods));
    } catch (e) {
      console.error(e);
    }
  }, [periods]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_PERIOD_ID, activePeriodId);
    } catch (e) {
      console.error(e);
    }
  }, [activePeriodId]);

  // Período actual em visualização
  const activePeriod = periods.find((p) => p.id === activePeriodId) || periods[0];

  // Gestão de Colaboradores
  const handleSaveEmployee = (empToSave: Employee) => {
    let updatedEmployees: Employee[];
    const exists = employees.some((e) => e.id === empToSave.id);
    if (exists) {
      updatedEmployees = employees.map((e) => (e.id === empToSave.id ? empToSave : e));
    } else {
      updatedEmployees = [empToSave, ...employees];
    }
    setEmployees(updatedEmployees);

    // Actualiza o cálculo do colaborador no período activo
    if (activePeriod) {
      const currentInput = activePeriod.items[empToSave.id] || {
        employeeId: empToSave.id,
        daysWorked: 22,
        daysAbsentUnjustified: 0,
        overtimeHoursDay: 0,
        overtimeHoursNight: 0,
        bonus: 0,
        salaryAdvance: 0,
        unionFeePercent: 1,
        otherDeductions: 0
      };

      const newResult = calculateEmployeePayroll(empToSave, currentInput, settings, activePeriod.id);
      const updatedPeriod: PayrollPeriod = {
        ...activePeriod,
        items: {
          ...activePeriod.items,
          [empToSave.id]: currentInput
        },
        results: {
          ...activePeriod.results,
          [empToSave.id]: newResult
        }
      };

      setPeriods((prev) => prev.map((p) => (p.id === updatedPeriod.id ? updatedPeriod : p)));
    }
  };

  const handleDeleteEmployee = (empId: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== empId));
  };

  // Gestão de Períodos
  const handleUpdatePeriod = (updatedPeriod: PayrollPeriod) => {
    setPeriods((prev) => prev.map((p) => (p.id === updatedPeriod.id ? updatedPeriod : p)));
  };

  const handleCreatePeriod = (month: number, year: number, type: 'regular' | 'vacation' | 'thirteenth') => {
    const periodId = `${year}-${String(month).padStart(2, '0')}${type !== 'regular' ? `-${type}` : ''}`;
    
    // Verifica se já existe
    const existing = periods.find((p) => p.id === periodId);
    if (existing) {
      setActivePeriodId(periodId);
      setCurrentTab('payroll');
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
        otherDeductions: 0
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
      results
    };

    setPeriods((prev) => [newPeriod, ...prev]);
    setActivePeriodId(periodId);
    setCurrentTab('payroll');
  };

  // Exportar todos os dados (Backup JSON)
  const handleExportAllData = () => {
    const backup = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      country: 'Angola',
      settings,
      employees,
      periods
    };
    const jsonStr = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Backup_KwanzaFolha_Angola_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  // Importar dados de backup
  const handleImportAllData = (jsonStr: string) => {
    const data = JSON.parse(jsonStr);
    if (data.settings && data.employees && data.periods) {
      setSettings(data.settings);
      setEmployees(data.employees);
      setPeriods(data.periods);
      if (data.periods[0]) {
        setActivePeriodId(data.periods[0].id);
      }
    } else {
      throw new Error('Formato de backup inválido.');
    }
  };

  // Restaurar dados padrão de Angola
  const handleResetToDemoData = () => {
    setSettings(INITIAL_COMPANY_SETTINGS);
    setEmployees(INITIAL_EMPLOYEES);
    const p = createInitialPeriod(INITIAL_EMPLOYEES, INITIAL_COMPANY_SETTINGS);
    setPeriods([p]);
    setActivePeriodId(p.id);
    localStorage.clear();
  };

  const handleSelectEmployeePayslip = (empId: string) => {
    setSelectedPayslipEmpId(empId);
    setCurrentTab('payslip');
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900 font-sans selection:bg-neutral-900 selection:text-white">
      
      {/* Top Bar Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        activePeriodLabel={activePeriod?.label || 'Outubro 2026'}
        onNewPayrollModal={() => setIsNewPeriodModalOpen(true)}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Secondary Period Selector bar (visible on relevant views) */}
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
              <span>{employees.length} colaboradores activos</span>
            </div>
          </div>
        )}

        {/* View Routing */}
        {currentTab === 'dashboard' && (
          <DashboardView
            period={activePeriod}
            employees={employees}
            settings={settings}
            onNavigate={setCurrentTab}
            onSelectEmployeePayslip={handleSelectEmployeePayslip}
          />
        )}

        {currentTab === 'payroll' && (
          <PayrollProcessingView
            period={activePeriod}
            employees={employees}
            settings={settings}
            onUpdatePeriod={handleUpdatePeriod}
            onViewPayslip={handleSelectEmployeePayslip}
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
            onSaveSettings={setSettings}
            onExportAllData={handleExportAllData}
            onImportAllData={handleImportAllData}
            onResetToDemoData={handleResetToDemoData}
          />
        )}

      </main>

      {/* Modals */}
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

      {/* Quiet Corporate Footer */}
      <footer className="no-print mt-auto border-t border-neutral-200 bg-white py-6 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-900">KwanzaFolha Angola</span>
            <span aria-hidden="true">·</span>
            <span>Sistema Laboral e Fiscal de Angola</span>
          </div>

          <div className="flex items-center gap-4 text-neutral-400">
            <span>Lei n.º 28/20 (Código do IRT)</span>
            <span aria-hidden="true">·</span>
            <span>Decreto Presidencial n.º 227/18 (INSS 3% + 8%)</span>
            <span aria-hidden="true">·</span>
            <span>Lei Geral do Trabalho de Angola</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
