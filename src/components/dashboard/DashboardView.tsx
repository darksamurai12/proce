import React from 'react';
import { 
  AlertCircle, 
  ArrowUpRight, 
  Calendar, 
  CheckCircle2, 
  DollarSign, 
  FileSpreadsheet, 
  FileText, 
  HelpCircle, 
  Percent, 
  ShieldCheck, 
  Users, 
  Wallet 
} from 'lucide-react';
import { CompanySettings, Employee, PayrollPeriod } from '../../types/payroll';
import { formatKz, formatPercent } from '../../utils/formatters';
import { NavTab } from '../layout/Navbar';

interface DashboardViewProps {
  period: PayrollPeriod;
  employees: Employee[];
  settings: CompanySettings;
  onNavigate: (tab: NavTab) => void;
  onSelectEmployeePayslip: (employeeId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  period,
  employees,
  settings,
  onNavigate,
  onSelectEmployeePayslip,
}) => {
  // Cálculos agregados do período
  const results = Object.values(period.results);
  const totalEmployees = results.length;

  const totalGross = results.reduce((acc, curr) => acc + curr.grossSalary, 0);
  const totalNet = results.reduce((acc, curr) => acc + curr.netSalary, 0);
  const totalIRT = results.reduce((acc, curr) => acc + curr.irtAmount, 0);
  const totalINSSEmployee = results.reduce((acc, curr) => acc + curr.inssEmployeeAmount, 0);
  const totalINSSEmployer = results.reduce((acc, curr) => acc + curr.inssEmployerAmount, 0);
  const totalINSS = totalINSSEmployee + totalINSSEmployer;
  const totalCompanyCost = results.reduce((acc, curr) => acc + curr.totalCompanyCost, 0);
  const totalExemptions = results.reduce((acc, curr) => acc + curr.totalExemptions, 0);

  // Repartição por departamento
  const deptMap: Record<string, { count: number; totalGross: number; totalNet: number }> = {};
  employees.forEach((emp) => {
    const res = period.results[emp.id];
    if (res) {
      if (!deptMap[emp.department]) {
        deptMap[emp.department] = { count: 0, totalGross: 0, totalNet: 0 };
      }
      deptMap[emp.department].count += 1;
      deptMap[emp.department].totalGross += res.grossSalary;
      deptMap[emp.department].totalNet += res.netSalary;
    }
  });

  const departmentStats = Object.entries(deptMap).map(([dept, data]) => ({
    name: dept,
    ...data,
    percentage: totalGross > 0 ? (data.totalGross / totalGross) * 100 : 0
  })).sort((a, b) => b.totalGross - a.totalGross);

  return (
    <div className="space-y-8">
      {/* Top Banner & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            Painel Executivo Salarial
          </h1>
          <div className="flex items-center gap-2 mt-1 text-sm text-neutral-500">
            <span>{settings.name}</span>
            <span aria-hidden="true">·</span>
            <span>NIF: {settings.nif}</span>
            <span aria-hidden="true">·</span>
            <span>Período: {period.label}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('payroll')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Gerir Folha de {period.label}</span>
          </button>
          <button
            onClick={() => onNavigate('reports')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-neutral-900 rounded-md hover:bg-neutral-800 transition-colors shadow-xs"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Emitir Guias Legais</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Salário Líquido Total */}
        <div className="p-5 bg-white rounded-lg border border-neutral-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Líquido a Pagar
            </span>
            <span className="p-1.5 rounded-md bg-emerald-50 text-emerald-700">
              <Wallet className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono tracking-tight text-neutral-900">
              {formatKz(totalNet)}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-neutral-500">
              <Users className="w-3.5 h-3.5" />
              <span>{totalEmployees} colaboradores processados</span>
            </div>
          </div>
        </div>

        {/* Card 2: Salário Bruto Total */}
        <div className="p-5 bg-white rounded-lg border border-neutral-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Massa Salarial Ilíquida
            </span>
            <span className="p-1.5 rounded-md bg-neutral-100 text-neutral-700">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono tracking-tight text-neutral-900">
              {formatKz(totalGross)}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-neutral-500">
              <span>Isenções fiscais: {formatKz(totalExemptions, false)}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Retenção IRT (AGT) */}
        <div className="p-5 bg-white rounded-lg border border-neutral-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
              IRT Retido (AGT)
            </span>
            <span className="p-1.5 rounded-md bg-amber-50 text-amber-700">
              <Percent className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono tracking-tight text-neutral-900">
              {formatKz(totalIRT)}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-neutral-500">
              <span>Imposto Lei 28/20 (Grupo A)</span>
            </div>
          </div>
        </div>

        {/* Card 4: INSS Total (11%) */}
        <div className="p-5 bg-white rounded-lg border border-neutral-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
              INSS Total (11%)
            </span>
            <span className="p-1.5 rounded-md bg-blue-50 text-blue-700">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono tracking-tight text-neutral-900">
              {formatKz(totalINSS)}
            </div>
            <div className="mt-1 flex items-center gap-1 text-xs text-neutral-500">
              <span>3% Trab. ({formatKz(totalINSSEmployee, false)}) + 8% Patr.</span>
            </div>
          </div>
        </div>

      </div>

      {/* Main Grid: Fiscal Compliance in Angola & Cost Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Angola Statutory Deadlines & Fiscal Obligations */}
        <div className="p-6 bg-white rounded-lg border border-neutral-200 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-neutral-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-neutral-700" />
              <span>Prazos Legais em Angola</span>
            </h2>
            <span className="text-xs text-neutral-500">{period.label}</span>
          </div>

          <p className="text-xs text-neutral-600 leading-relaxed">
            Calendário de obrigações tributárias e contributivas obrigatórias segundo a Lei Geral do Trabalho, Código do IRT e Segurança Social:
          </p>

          <div className="space-y-3.5">
            <div className="p-3.5 rounded-lg border border-neutral-200 bg-neutral-50 flex items-start gap-3">
              <div className="mt-0.5 text-amber-600">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="font-semibold text-neutral-900">
                  Liquidação do IRT à AGT
                </div>
                <div className="text-neutral-600 mt-0.5">
                  Prazo: Até ao <strong>último dia útil</strong> do mês seguinte à liquidação.
                </div>
                <div className="font-mono text-neutral-500 mt-1">
                  Total a entregar: {formatKz(totalIRT)}
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-lg border border-neutral-200 bg-neutral-50 flex items-start gap-3">
              <div className="mt-0.5 text-blue-600">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="font-semibold text-neutral-900">
                  Contribuições para a Segurança Social (INSS)
                </div>
                <div className="text-neutral-600 mt-0.5">
                  Prazo: Até ao <strong>dia 10</strong> do mês seguinte.
                </div>
                <div className="font-mono text-neutral-500 mt-1">
                  Total a entregar (11%): {formatKz(totalINSS)}
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-lg border border-neutral-200 bg-neutral-50 flex items-start gap-3">
              <div className="mt-0.5 text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="font-semibold text-neutral-900">
                  Recibos de Vencimento (LGT)
                </div>
                <div className="text-neutral-600 mt-0.5">
                  Obrigatória entrega do duplicado ao trabalhador na data do pagamento.
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs">
            <span className="text-neutral-500">Custo Total Empresa:</span>
            <span className="font-bold font-mono text-neutral-900">{formatKz(totalCompanyCost)}</span>
          </div>
        </div>

        {/* Middle & Right Column: Department Cost Breakdown & Quick Payslip Access */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Department Breakdown */}
          <div className="p-6 bg-white rounded-lg border border-neutral-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-neutral-900">
                  Distribuição por Departamento
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Massa salarial bruta e número de funcionários por sector
                </p>
              </div>
              <button
                onClick={() => onNavigate('employees')}
                className="text-xs font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                Ver todos ({employees.length})
              </button>
            </div>

            <div className="space-y-3">
              {departmentStats.map((dept) => (
                <div key={dept.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="font-medium text-neutral-900">
                      {dept.name} <span className="text-neutral-400 font-normal">({dept.count} trab.)</span>
                    </div>
                    <div className="font-mono text-neutral-700">
                      {formatKz(dept.totalGross)} <span className="text-neutral-400">({dept.percentage.toFixed(1)}%)</span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-neutral-800 rounded-full"
                      style={{ width: `${dept.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Payslip Table for Recent Employees */}
          <div className="p-6 bg-white rounded-lg border border-neutral-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-neutral-900">
                  Recibos Prontos para Emissão
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Clique para visualizar o recibo formal detalhado com cálculos de IRT e INSS
                </p>
              </div>
              <button
                onClick={() => onNavigate('payslip')}
                className="text-xs font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                Abrir Central de Recibos
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-200 text-neutral-500">
                    <th className="pb-2 font-medium">Colaborador</th>
                    <th className="pb-2 font-medium">Cargo</th>
                    <th className="pb-2 font-medium text-right">Bruto</th>
                    <th className="pb-2 font-medium text-right">INSS (3%)</th>
                    <th className="pb-2 font-medium text-right">IRT</th>
                    <th className="pb-2 font-medium text-right">Líquido</th>
                    <th className="pb-2 font-medium text-center">Acção</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {employees.slice(0, 5).map((emp) => {
                    const res = period.results[emp.id];
                    if (!res) return null;
                    return (
                      <tr key={emp.id} className="hover:bg-neutral-50/80 transition-colors">
                        <td className="py-2.5 font-medium text-neutral-900">
                          {emp.fullName}
                          <div className="text-[11px] text-neutral-400 font-mono">{emp.biNumber}</div>
                        </td>
                        <td className="py-2.5 text-neutral-600">{emp.role}</td>
                        <td className="py-2.5 font-mono text-neutral-700 text-right">{formatKz(res.grossSalary)}</td>
                        <td className="py-2.5 font-mono text-neutral-700 text-right">{formatKz(res.inssEmployeeAmount)}</td>
                        <td className="py-2.5 font-mono text-neutral-700 text-right">{formatKz(res.irtAmount)}</td>
                        <td className="py-2.5 font-mono font-semibold text-neutral-900 text-right">{formatKz(res.netSalary)}</td>
                        <td className="py-2.5 text-center">
                          <button
                            onClick={() => onSelectEmployeePayslip(emp.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded transition-colors"
                          >
                            <FileText className="w-3 h-3" />
                            <span>Ver Recibo</span>
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

      </div>
    </div>
  );
};
