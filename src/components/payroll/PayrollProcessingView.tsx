import React, { useState } from 'react';
import { 
  AlertCircle, 
  Check, 
  Download, 
  FileCheck2, 
  FileText, 
  Lock, 
  RefreshCw, 
  SlidersHorizontal 
} from 'lucide-react';
import { CompanySettings, Employee, PayrollInputItem, PayrollPeriod } from '../../types/payroll';
import { calculateEmployeePayroll } from '../../utils/angolaPayrollCalculator';
import { exportToCSV, formatKz } from '../../utils/formatters';

interface PayrollProcessingViewProps {
  period: PayrollPeriod;
  employees: Employee[];
  settings: CompanySettings;
  onUpdatePeriod: (updatedPeriod: PayrollPeriod) => void;
  onViewPayslip: (employeeId: string) => void;
}

export const PayrollProcessingView: React.FC<PayrollProcessingViewProps> = ({
  period,
  employees,
  settings,
  onUpdatePeriod,
  onViewPayslip
}) => {
  const isLocked = period.status === 'approved' || period.status === 'paid';
  const [editingInputs, setEditingInputs] = useState<Record<string, PayrollInputItem>>(() => ({
    ...period.items
  }));

  const handleInputChange = (employeeId: string, field: keyof PayrollInputItem, value: number) => {
    if (isLocked) return;

    const currentInput = editingInputs[employeeId] || {
      employeeId,
      daysWorked: 22,
      daysAbsentUnjustified: 0,
      overtimeHoursDay: 0,
      overtimeHoursNight: 0,
      bonus: 0,
      salaryAdvance: 0,
      unionFeePercent: 1,
      otherDeductions: 0
    };

    const updated = {
      ...currentInput,
      [field]: isNaN(value) ? 0 : value
    };

    const newInputs = {
      ...editingInputs,
      [employeeId]: updated
    };

    setEditingInputs(newInputs);

    // Recalcula o colaborador em tempo real
    const emp = employees.find((e) => e.id === employeeId);
    if (emp) {
      const newResult = calculateEmployeePayroll(emp, updated, settings, period.id);
      const updatedResults = {
        ...period.results,
        [employeeId]: newResult
      };

      onUpdatePeriod({
        ...period,
        items: newInputs,
        results: updatedResults
      });
    }
  };

  const handleRecalculateAll = () => {
    const newResults: Record<string, any> = {};
    employees.forEach((emp) => {
      const input = editingInputs[emp.id] || {
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
      newResults[emp.id] = calculateEmployeePayroll(emp, input, settings, period.id);
    });

    onUpdatePeriod({
      ...period,
      items: editingInputs,
      results: newResults,
      processedAt: new Date().toISOString()
    });
  };

  const toggleLockStatus = () => {
    const nextStatus = isLocked ? 'draft' : 'approved';
    onUpdatePeriod({
      ...period,
      status: nextStatus,
      approvedAt: nextStatus === 'approved' ? new Date().toISOString() : undefined
    });
  };

  const handleExportCSV = () => {
    const headers = [
      'Código',
      'Nome Completo',
      'BI',
      'NIF',
      'Nº INSS',
      'Departamento',
      'Cargo',
      'Salário Base (Kz)',
      'Sub. Alimentação (Kz)',
      'Sub. Transporte (Kz)',
      'Sub. Função (Kz)',
      'Horas Extras (Kz)',
      'Bónus (Kz)',
      'Faltas Desc. (Kz)',
      'Total Ilíquido (Kz)',
      'INSS Trab. 3% (Kz)',
      'Matéria Colectável IRT (Kz)',
      'IRT Retido (Kz)',
      'Outros Descontos (Kz)',
      'Total Descontos (Kz)',
      'Salário Líquido (Kz)',
      'INSS Patronal 8% (Kz)',
      'Custo Total Empresa (Kz)',
      'Banco',
      'IBAN'
    ];

    const rows = employees.map((emp) => {
      const res = period.results[emp.id];
      if (!res) return [];
      return [
        emp.code,
        emp.fullName,
        emp.biNumber,
        emp.nif,
        emp.socialSecurityNumber,
        emp.department,
        emp.role,
        res.baseSalary,
        res.foodAllowance,
        res.transportAllowance,
        res.roleAllowance,
        res.totalOvertimeAmount,
        res.bonusAmount,
        res.absenceDeductionAmount,
        res.grossSalary,
        res.inssEmployeeAmount,
        res.irtTaxableBase,
        res.irtAmount,
        res.salaryAdvance + res.unionFeeAmount + res.otherDeductions,
        res.totalDeductions,
        res.netSalary,
        res.inssEmployerAmount,
        res.totalCompanyCost,
        emp.bankName,
        emp.iban
      ];
    });

    exportToCSV(`Folha_Salarial_Angola_${period.id}`, [headers, ...rows]);
  };

  // Totais resumidos
  const resultsList = Object.values(period.results);
  const totalGross = resultsList.reduce((acc, curr) => acc + curr.grossSalary, 0);
  const totalNet = resultsList.reduce((acc, curr) => acc + curr.netSalary, 0);
  const totalINSS3 = resultsList.reduce((acc, curr) => acc + curr.inssEmployeeAmount, 0);
  const totalIRT = resultsList.reduce((acc, curr) => acc + curr.irtAmount, 0);
  const totalINSS8 = resultsList.reduce((acc, curr) => acc + curr.inssEmployerAmount, 0);

  return (
    <div className="space-y-6">
      
      {/* Top Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
              Processamento da Folha Salarial
            </h1>
            <span
              className={`px-2 py-0.5 text-xs font-semibold rounded-md ${
                isLocked
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {isLocked ? 'Folha Fechada & Aprovada' : 'Em Elaboração (Rascunho)'}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-neutral-500">
            <span>Período: <strong>{period.label}</strong></span>
            <span aria-hidden="true">·</span>
            <span>Tipo: {period.type === 'regular' ? 'Salário Mensal Regular' : period.type === 'vacation' ? 'Subsídio de Férias' : '13º Mês (Natal)'}</span>
            <span aria-hidden="true">·</span>
            <span>Legislação: Código do IRT (Lei 28/20) e INSS Angola</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!isLocked && (
            <button
              onClick={handleRecalculateAll}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Recalcular Todos</span>
            </button>
          )}

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar Folha (CSV)</span>
          </button>

          <button
            onClick={toggleLockStatus}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors shadow-xs ${
              isLocked
                ? 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                : 'bg-neutral-900 text-white hover:bg-neutral-800'
            }`}
          >
            {isLocked ? (
              <>
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Reabrir para Edição</span>
              </>
            ) : (
              <>
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>Aprovar & Fechar Folha</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mini Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 bg-white rounded-lg border border-neutral-200 text-xs">
        <div>
          <span className="text-neutral-500">Total Ilíquido:</span>
          <div className="font-bold font-mono text-neutral-900 text-sm mt-0.5">{formatKz(totalGross)}</div>
        </div>
        <div>
          <span className="text-neutral-500">INSS Trabalhador (3%):</span>
          <div className="font-bold font-mono text-blue-700 text-sm mt-0.5">{formatKz(totalINSS3)}</div>
        </div>
        <div>
          <span className="text-neutral-500">IRT Retenção (AGT):</span>
          <div className="font-bold font-mono text-amber-700 text-sm mt-0.5">{formatKz(totalIRT)}</div>
        </div>
        <div>
          <span className="text-neutral-500">Líquido a Transferir:</span>
          <div className="font-bold font-mono text-emerald-700 text-sm mt-0.5">{formatKz(totalNet)}</div>
        </div>
        <div>
          <span className="text-neutral-500">INSS Patronal (8%):</span>
          <div className="font-bold font-mono text-neutral-900 text-sm mt-0.5">{formatKz(totalINSS8)}</div>
        </div>
      </div>

      {isLocked && (
        <div className="flex items-center gap-2 p-3 bg-neutral-100 border border-neutral-200 rounded-md text-xs text-neutral-600">
          <Lock className="w-4 h-4 text-neutral-500 shrink-0" />
          <span>
            Esta folha está aprovada e bloqueada para alterações. Clique em "Reabrir para Edição" se necessitar de ajustar faltas, horas extras ou adiantamentos.
          </span>
        </div>
      )}

      {/* Interactive Batch Processing Table */}
      <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
        <div className="p-3.5 border-b border-neutral-200 bg-neutral-50/60 flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-800">
            Ajustes do Mês (Faltas, Horas Extras, Bónus e Adiantamentos)
          </span>
          <span className="text-[11px] text-neutral-500">
            Valores são recalculados instantaneamente nos termos do Código do IRT de Angola
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-neutral-50/90 border-b border-neutral-200 text-neutral-600 font-medium whitespace-nowrap">
                <th className="py-2.5 px-3">Colaborador</th>
                <th className="py-2.5 px-3 text-right">Salário Base</th>
                <th className="py-2.5 px-3 text-center">Faltas (Dias)</th>
                <th className="py-2.5 px-3 text-center">H. Extras 50%</th>
                <th className="py-2.5 px-3 text-center">H. Extras 100%</th>
                <th className="py-2.5 px-3 text-center">Bónus / Prémio</th>
                <th className="py-2.5 px-3 text-center">Adiantamento</th>
                <th className="py-2.5 px-3 text-right">Total Ilíquido</th>
                <th className="py-2.5 px-3 text-right">INSS (3%)</th>
                <th className="py-2.5 px-3 text-right">IRT Retido</th>
                <th className="py-2.5 px-3 text-right font-bold text-neutral-900">Salário Líquido</th>
                <th className="py-2.5 px-3 text-center">Recibo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {employees.map((emp) => {
                const res = period.results[emp.id];
                const input = editingInputs[emp.id] || {
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

                if (!res) return null;

                return (
                  <tr key={emp.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <div className="font-semibold text-neutral-900">{emp.fullName}</div>
                      <div className="text-[11px] text-neutral-400 font-mono">
                        {emp.code} · {emp.role}
                      </div>
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono font-medium text-neutral-800 whitespace-nowrap">
                      {formatKz(emp.baseSalary)}
                    </td>

                    {/* Inputs editáveis se não bloqueado */}
                    <td className="py-2.5 px-2 text-center whitespace-nowrap">
                      <input
                        type="number"
                        min="0"
                        max="22"
                        disabled={isLocked}
                        value={input.daysAbsentUnjustified}
                        onChange={(e) => handleInputChange(emp.id, 'daysAbsentUnjustified', parseInt(e.target.value) || 0)}
                        className="w-14 text-center py-1 font-mono text-xs border border-neutral-200 rounded disabled:bg-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                      />
                    </td>

                    <td className="py-2.5 px-2 text-center whitespace-nowrap">
                      <input
                        type="number"
                        min="0"
                        max="80"
                        disabled={isLocked}
                        value={input.overtimeHoursDay}
                        onChange={(e) => handleInputChange(emp.id, 'overtimeHoursDay', parseFloat(e.target.value) || 0)}
                        className="w-14 text-center py-1 font-mono text-xs border border-neutral-200 rounded disabled:bg-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                      />
                    </td>

                    <td className="py-2.5 px-2 text-center whitespace-nowrap">
                      <input
                        type="number"
                        min="0"
                        max="80"
                        disabled={isLocked}
                        value={input.overtimeHoursNight}
                        onChange={(e) => handleInputChange(emp.id, 'overtimeHoursNight', parseFloat(e.target.value) || 0)}
                        className="w-14 text-center py-1 font-mono text-xs border border-neutral-200 rounded disabled:bg-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                      />
                    </td>

                    <td className="py-2.5 px-2 text-center whitespace-nowrap">
                      <input
                        type="number"
                        min="0"
                        step="5000"
                        disabled={isLocked}
                        value={input.bonus}
                        onChange={(e) => handleInputChange(emp.id, 'bonus', parseFloat(e.target.value) || 0)}
                        className="w-20 text-right pr-1 py-1 font-mono text-xs border border-neutral-200 rounded disabled:bg-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                      />
                    </td>

                    <td className="py-2.5 px-2 text-center whitespace-nowrap">
                      <input
                        type="number"
                        min="0"
                        step="5000"
                        disabled={isLocked}
                        value={input.salaryAdvance}
                        onChange={(e) => handleInputChange(emp.id, 'salaryAdvance', parseFloat(e.target.value) || 0)}
                        className="w-20 text-right pr-1 py-1 font-mono text-xs border border-neutral-200 rounded disabled:bg-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                      />
                    </td>

                    {/* Resultados calculados */}
                    <td className="py-2.5 px-3 text-right font-mono text-neutral-800 whitespace-nowrap">
                      {formatKz(res.grossSalary)}
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono text-blue-700 whitespace-nowrap">
                      {formatKz(res.inssEmployeeAmount)}
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono text-amber-700 whitespace-nowrap">
                      <div>{formatKz(res.irtAmount)}</div>
                      <div className="text-[10px] text-neutral-400">
                        {res.irtAmount === 0 ? 'Isento' : `${(res.irtExcessRate * 100).toFixed(0)}%`}
                      </div>
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-800 whitespace-nowrap bg-emerald-50/30">
                      {formatKz(res.netSalary)}
                    </td>

                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <button
                        onClick={() => onViewPayslip(emp.id)}
                        className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded transition-colors"
                        title="Ver Recibo Individual"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
