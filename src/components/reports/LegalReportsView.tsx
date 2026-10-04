import React, { useState } from 'react';
import { 
  Building2, 
  CheckCircle, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Printer, 
  ShieldCheck 
} from 'lucide-react';
import { CompanySettings, Employee, PayrollPeriod } from '../../types/payroll';
import { exportToCSV, formatKz } from '../../utils/formatters';

interface LegalReportsViewProps {
  period: PayrollPeriod;
  employees: Employee[];
  settings: CompanySettings;
}

type ReportType = 'inss' | 'irt' | 'payroll_sheet' | 'bank_transfer';

export const LegalReportsView: React.FC<LegalReportsViewProps> = ({
  period,
  employees,
  settings
}) => {
  const [activeReport, setActiveReport] = useState<ReportType>('inss');

  const resultsList = employees
    .map((emp) => ({
      emp,
      res: period.results[emp.id]
    }))
    .filter((item) => !!item.res);

  // Totais globais
  const totalGross = resultsList.reduce((acc, curr) => acc + curr.res.grossSalary, 0);
  const totalNet = resultsList.reduce((acc, curr) => acc + curr.res.netSalary, 0);
  const totalINSSSubject = resultsList.reduce((acc, curr) => acc + curr.res.inssSubjectBase, 0);
  const totalINSS3 = resultsList.reduce((acc, curr) => acc + curr.res.inssEmployeeAmount, 0);
  const totalINSS8 = resultsList.reduce((acc, curr) => acc + curr.res.inssEmployerAmount, 0);
  const totalINSS11 = totalINSS3 + totalINSS8;
  const totalIRTTaxable = resultsList.reduce((acc, curr) => acc + curr.res.irtTaxableBase, 0);
  const totalIRT = resultsList.reduce((acc, curr) => acc + curr.res.irtAmount, 0);

  const handlePrint = () => {
    window.print();
  };

  const handleExportBankTransfer = () => {
    const headers = ['Beneficiário', 'NIF / BI', 'Banco', 'IBAN Angolano', 'Montante (Kz)', 'Moeda', 'Referência'];
    const rows = resultsList.map(({ emp, res }) => [
      emp.fullName,
      emp.biNumber,
      emp.bankName,
      emp.iban,
      res.netSalary,
      'AOA',
      `Salário ${period.label}`
    ]);
    exportToCSV(`Ordem_Transferencia_Bancaria_Angola_${period.id}`, [headers, ...rows]);
  };

  const handleExportINSS = () => {
    const headers = [
      'Nº Segurado INSS',
      'Nome do Trabalhador',
      'BI',
      'Remuneração Sujeita (Kz)',
      'Contribuição Trabalhador 3% (Kz)',
      'Contribuição Patronal 8% (Kz)',
      'Total INSS 11% (Kz)'
    ];
    const rows = resultsList.map(({ emp, res }) => [
      emp.socialSecurityNumber || 'Pendente',
      emp.fullName,
      emp.biNumber,
      res.inssSubjectBase,
      res.inssEmployeeAmount,
      res.inssEmployerAmount,
      res.inssTotalAmount
    ]);
    exportToCSV(`Mapa_Remuneracoes_INSS_Angola_${period.id}`, [headers, ...rows]);
  };

  const handleExportIRT = () => {
    const headers = [
      'Nome do Contribuinte',
      'NIF / BI',
      'Rendimento Bruto (Kz)',
      'Dedução INSS 3% (Kz)',
      'Isenções Legais (Kz)',
      'Matéria Colectável IRT (Kz)',
      'IRT Retido na Fonte (Kz)'
    ];
    const rows = resultsList.map(({ emp, res }) => [
      emp.fullName,
      emp.nif,
      res.grossSalary,
      res.inssEmployeeAmount,
      res.totalExemptions,
      res.irtTaxableBase,
      res.irtAmount
    ]);
    exportToCSV(`Guia_Retencao_IRT_AGT_Angola_${period.id}`, [headers, ...rows]);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            Mapas Oficiais & Guias Legais de Angola
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Documentos em conformidade com as exigências da AGT, Segurança Social (INSS) e Bancos Angolanos
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir Relatório</span>
          </button>

          {activeReport === 'bank_transfer' && (
            <button
              onClick={handleExportBankTransfer}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-neutral-900 rounded-md hover:bg-neutral-800 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descarregar Ficheiro Bancário (CSV)</span>
            </button>
          )}

          {activeReport === 'inss' && (
            <button
              onClick={handleExportINSS}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-neutral-900 rounded-md hover:bg-neutral-800 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Mapa INSS (CSV)</span>
            </button>
          )}

          {activeReport === 'irt' && (
            <button
              onClick={handleExportIRT}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-neutral-900 rounded-md hover:bg-neutral-800 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Guia AGT (CSV)</span>
            </button>
          )}
        </div>
      </div>

      {/* Report Selector Tabs (Interactive filter tabs) */}
      <div className="no-print flex items-center gap-1 p-1 bg-neutral-200/60 rounded-lg max-w-2xl">
        <button
          onClick={() => setActiveReport('inss')}
          className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-md transition-colors ${
            activeReport === 'inss'
              ? 'bg-white text-neutral-900 shadow-xs font-semibold'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          1. Folha INSS (11%)
        </button>
        <button
          onClick={() => setActiveReport('irt')}
          className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-md transition-colors ${
            activeReport === 'irt'
              ? 'bg-white text-neutral-900 shadow-xs font-semibold'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          2. Guia IRT (AGT)
        </button>
        <button
          onClick={() => setActiveReport('bank_transfer')}
          className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-md transition-colors ${
            activeReport === 'bank_transfer'
              ? 'bg-white text-neutral-900 shadow-xs font-semibold'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          3. Mapa Bancário (IBAN)
        </button>
        <button
          onClick={() => setActiveReport('payroll_sheet')}
          className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-md transition-colors ${
            activeReport === 'payroll_sheet'
              ? 'bg-white text-neutral-900 shadow-xs font-semibold'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          4. Folha Geral Completa
        </button>
      </div>

      {/* REPORT CONTENT VIEWPORT */}
      <div className="bg-white rounded-xl border border-neutral-300 shadow-xs p-6 sm:p-8 font-sans print:border-none print:shadow-none print:p-0">
        
        {/* Company Header on Report */}
        <div className="border-b border-neutral-300 pb-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
            <div>
              <div className="text-base font-bold text-neutral-900 uppercase">{settings.name}</div>
              <div className="text-xs text-neutral-500 mt-0.5">
                NIF: {settings.nif} · Nº INSS: {settings.inssNumber} · {settings.city}, Angola
              </div>
            </div>
            <div className="sm:text-right text-xs">
              <div className="font-semibold text-neutral-900">Período de Referência: {period.label}</div>
              <div className="text-neutral-400 mt-0.5">Emitido em: {new Date().toLocaleDateString('pt-AO')}</div>
            </div>
          </div>
        </div>

        {/* 1. INSS REPORT */}
        {activeReport === 'inss' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-neutral-900">
                  Mapa de Remunerações para a Segurança Social (INSS)
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Conforme o Decreto Presidencial n.º 227/18: 3% Trabalhador + 8% Entidade Patronal = 11%
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-neutral-400 uppercase block">Data Limite de Pagamento:</span>
                <span className="text-xs font-semibold text-blue-700">Até dia 10 do mês seguinte</span>
              </div>
            </div>

            {/* Metric Strip */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-neutral-50 rounded-lg border border-neutral-200 text-xs">
              <div>
                <span className="text-neutral-500">Base Sujeita INSS:</span>
                <div className="font-mono font-bold text-neutral-900 text-sm mt-0.5">{formatKz(totalINSSSubject)}</div>
              </div>
              <div>
                <span className="text-neutral-500">Contribuição Trabalhadores (3%):</span>
                <div className="font-mono font-bold text-neutral-900 text-sm mt-0.5">{formatKz(totalINSS3)}</div>
              </div>
              <div>
                <span className="text-neutral-500">Contribuição Empresa (8%):</span>
                <div className="font-mono font-bold text-neutral-900 text-sm mt-0.5">{formatKz(totalINSS8)}</div>
              </div>
            </div>

            <div className="overflow-x-auto border border-neutral-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-neutral-100/75 border-b border-neutral-200 text-neutral-700 font-semibold">
                    <th className="py-2.5 px-3">Nº INSS</th>
                    <th className="py-2.5 px-3">Nome do Trabalhador</th>
                    <th className="py-2.5 px-3">Nº do BI</th>
                    <th className="py-2.5 px-3 text-right">Remuneração Sujeita</th>
                    <th className="py-2.5 px-3 text-right">Trab. (3%)</th>
                    <th className="py-2.5 px-3 text-right">Empresa (8%)</th>
                    <th className="py-2.5 px-3 text-right">Total a Entregar (11%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {resultsList.map(({ emp, res }) => (
                    <tr key={emp.id} className="hover:bg-neutral-50/70">
                      <td className="py-2 px-3 font-mono text-neutral-700">{emp.socialSecurityNumber || 'Pendente'}</td>
                      <td className="py-2 px-3 font-medium text-neutral-900">{emp.fullName}</td>
                      <td className="py-2 px-3 font-mono text-neutral-600">{emp.biNumber}</td>
                      <td className="py-2 px-3 text-right font-mono text-neutral-800">{formatKz(res.inssSubjectBase)}</td>
                      <td className="py-2 px-3 text-right font-mono text-blue-700">{formatKz(res.inssEmployeeAmount)}</td>
                      <td className="py-2 px-3 text-right font-mono text-neutral-700">{formatKz(res.inssEmployerAmount)}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-neutral-900">{formatKz(res.inssTotalAmount)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-neutral-100 font-bold border-t-2 border-neutral-300 text-neutral-900">
                    <td colSpan={3} className="py-3 px-3">TOTAIS A LIQUIDAR AO INSS:</td>
                    <td className="py-3 px-3 text-right font-mono">{formatKz(totalINSSSubject)}</td>
                    <td className="py-3 px-3 text-right font-mono text-blue-700">{formatKz(totalINSS3)}</td>
                    <td className="py-3 px-3 text-right font-mono">{formatKz(totalINSS8)}</td>
                    <td className="py-3 px-3 text-right font-mono text-sm">{formatKz(totalINSS11)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* 2. IRT REPORT */}
        {activeReport === 'irt' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-neutral-900">
                  Guia Resumo de Retenção na Fonte de IRT (Grupo A)
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Administração Geral Tributária (AGT) · Código do IRT (Lei n.º 28/20)
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-neutral-400 uppercase block">Data Limite de Pagamento:</span>
                <span className="text-xs font-semibold text-amber-700">Último dia útil do mês seguinte</span>
              </div>
            </div>

            {/* Metric Strip */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-neutral-50 rounded-lg border border-neutral-200 text-xs">
              <div>
                <span className="text-neutral-500">Rendimento Bruto Total:</span>
                <div className="font-mono font-bold text-neutral-900 text-sm mt-0.5">{formatKz(totalGross)}</div>
              </div>
              <div>
                <span className="text-neutral-500">Matéria Colectável Global:</span>
                <div className="font-mono font-bold text-neutral-900 text-sm mt-0.5">{formatKz(totalIRTTaxable)}</div>
              </div>
              <div>
                <span className="text-neutral-500">Total IRT a Entregar à AGT:</span>
                <div className="font-mono font-bold text-amber-800 text-sm mt-0.5">{formatKz(totalIRT)}</div>
              </div>
            </div>

            <div className="overflow-x-auto border border-neutral-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-neutral-100/75 border-b border-neutral-200 text-neutral-700 font-semibold">
                    <th className="py-2.5 px-3">NIF / BI</th>
                    <th className="py-2.5 px-3">Nome do Contribuinte</th>
                    <th className="py-2.5 px-3 text-right">Rendimento Bruto</th>
                    <th className="py-2.5 px-3 text-right">Dedução INSS (3%)</th>
                    <th className="py-2.5 px-3 text-right">Isenções Legais</th>
                    <th className="py-2.5 px-3 text-right">Matéria Colectável</th>
                    <th className="py-2.5 px-3 text-right">IRT Liquidado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {resultsList.map(({ emp, res }) => (
                    <tr key={emp.id} className="hover:bg-neutral-50/70">
                      <td className="py-2 px-3 font-mono text-neutral-700">{emp.nif}</td>
                      <td className="py-2 px-3 font-medium text-neutral-900">{emp.fullName}</td>
                      <td className="py-2 px-3 text-right font-mono text-neutral-700">{formatKz(res.grossSalary)}</td>
                      <td className="py-2 px-3 text-right font-mono text-neutral-700">-{formatKz(res.inssEmployeeAmount)}</td>
                      <td className="py-2 px-3 text-right font-mono text-neutral-700">-{formatKz(res.totalExemptions)}</td>
                      <td className="py-2 px-3 text-right font-mono font-medium text-neutral-800">{formatKz(res.irtTaxableBase)}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-amber-700">{formatKz(res.irtAmount)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-neutral-100 font-bold border-t-2 border-neutral-300 text-neutral-900">
                    <td colSpan={2} className="py-3 px-3">TOTAIS DE RETENÇÃO DO GRUPO A:</td>
                    <td className="py-3 px-3 text-right font-mono">{formatKz(totalGross)}</td>
                    <td className="py-3 px-3 text-right font-mono">-{formatKz(totalINSS3)}</td>
                    <td className="py-3 px-3 text-right font-mono">-{formatKz(resultsList.reduce((acc, curr) => acc + curr.res.totalExemptions, 0))}</td>
                    <td className="py-3 px-3 text-right font-mono">{formatKz(totalIRTTaxable)}</td>
                    <td className="py-3 px-3 text-right font-mono text-sm text-amber-800">{formatKz(totalIRT)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* 3. BANK TRANSFER REPORT */}
        {activeReport === 'bank_transfer' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-neutral-900">
                  Mapa de Transferências Bancárias (Ordens de Pagamento)
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Ficheiro compatível para emissão de ordens via internet banking bancário em Angola
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-neutral-400 uppercase block">Conta Ordenante:</span>
                <span className="text-xs font-mono font-medium text-neutral-800">{settings.bankName} · {settings.iban}</span>
              </div>
            </div>

            <div className="overflow-x-auto border border-neutral-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-neutral-100/75 border-b border-neutral-200 text-neutral-700 font-semibold">
                    <th className="py-2.5 px-3">Código</th>
                    <th className="py-2.5 px-3">Beneficiário</th>
                    <th className="py-2.5 px-3">Banco</th>
                    <th className="py-2.5 px-3">IBAN Angolano (AO06...)</th>
                    <th className="py-2.5 px-3 text-right">Montante Líquido</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {resultsList.map(({ emp, res }) => (
                    <tr key={emp.id} className="hover:bg-neutral-50/70">
                      <td className="py-2 px-3 font-mono text-neutral-500">{emp.code}</td>
                      <td className="py-2 px-3 font-medium text-neutral-900">{emp.fullName}</td>
                      <td className="py-2 px-3 text-neutral-700">{emp.bankName}</td>
                      <td className="py-2 px-3 font-mono text-neutral-900">{emp.iban}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-emerald-800">{formatKz(res.netSalary)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-neutral-100 font-bold border-t-2 border-neutral-300 text-neutral-900">
                    <td colSpan={4} className="py-3 px-3">VALOR TOTAL DAS TRANSFERÊNCIAS:</td>
                    <td className="py-3 px-3 text-right font-mono text-sm text-emerald-800">{formatKz(totalNet)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* 4. GENERAL PAYROLL SHEET */}
        {activeReport === 'payroll_sheet' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-neutral-900">
                Folha de Pagamento Geral Completa
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Demonstrativo analítico exaustivo de vencimentos e encargos patronais
              </p>
            </div>

            <div className="overflow-x-auto border border-neutral-200 rounded-lg">
              <table className="w-full text-left text-[11px]">
                <thead>
                  <tr className="bg-neutral-100 border-b border-neutral-200 text-neutral-700 font-semibold whitespace-nowrap">
                    <th className="py-2 px-2">Colaborador</th>
                    <th className="py-2 px-2 text-right">Sal. Base</th>
                    <th className="py-2 px-2 text-right">Subsídios</th>
                    <th className="py-2 px-2 text-right">H. Extras</th>
                    <th className="py-2 px-2 text-right">Bruto</th>
                    <th className="py-2 px-2 text-right">INSS (3%)</th>
                    <th className="py-2 px-2 text-right">IRT Retido</th>
                    <th className="py-2 px-2 text-right">Outros Desc.</th>
                    <th className="py-2 px-2 text-right font-bold">Líquido</th>
                    <th className="py-2 px-2 text-right">INSS Patr. (8%)</th>
                    <th className="py-2 px-2 text-right">Custo Empresa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {resultsList.map(({ emp, res }) => {
                    const totalAllowances =
                      res.foodAllowance +
                      res.transportAllowance +
                      res.roleAllowance +
                      res.familyAllowance +
                      res.housingAllowance +
                      res.communicationAllowance;
                    const otherDeductionsTotal = res.salaryAdvance + res.unionFeeAmount + res.otherDeductions;

                    return (
                      <tr key={emp.id} className="hover:bg-neutral-50/70 whitespace-nowrap">
                        <td className="py-2 px-2 font-medium text-neutral-900">{emp.fullName}</td>
                        <td className="py-2 px-2 text-right font-mono">{formatKz(res.baseSalary)}</td>
                        <td className="py-2 px-2 text-right font-mono">{formatKz(totalAllowances)}</td>
                        <td className="py-2 px-2 text-right font-mono">{formatKz(res.totalOvertimeAmount)}</td>
                        <td className="py-2 px-2 text-right font-mono font-medium">{formatKz(res.grossSalary)}</td>
                        <td className="py-2 px-2 text-right font-mono text-blue-700">{formatKz(res.inssEmployeeAmount)}</td>
                        <td className="py-2 px-2 text-right font-mono text-amber-700">{formatKz(res.irtAmount)}</td>
                        <td className="py-2 px-2 text-right font-mono text-neutral-600">{formatKz(otherDeductionsTotal)}</td>
                        <td className="py-2 px-2 text-right font-mono font-bold text-emerald-800">{formatKz(res.netSalary)}</td>
                        <td className="py-2 px-2 text-right font-mono text-neutral-700">{formatKz(res.inssEmployerAmount)}</td>
                        <td className="py-2 px-2 text-right font-mono font-semibold text-neutral-900">{formatKz(res.totalCompanyCost)}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-neutral-100 font-bold border-t-2 border-neutral-300 text-neutral-900 whitespace-nowrap">
                    <td className="py-2.5 px-2">TOTAIS:</td>
                    <td className="py-2.5 px-2 text-right font-mono">{formatKz(resultsList.reduce((acc, curr) => acc + curr.res.baseSalary, 0))}</td>
                    <td className="py-2.5 px-2 text-right font-mono">-</td>
                    <td className="py-2.5 px-2 text-right font-mono">-</td>
                    <td className="py-2.5 px-2 text-right font-mono">{formatKz(totalGross)}</td>
                    <td className="py-2.5 px-2 text-right font-mono text-blue-700">{formatKz(totalINSS3)}</td>
                    <td className="py-2.5 px-2 text-right font-mono text-amber-700">{formatKz(totalIRT)}</td>
                    <td className="py-2.5 px-2 text-right font-mono">-</td>
                    <td className="py-2.5 px-2 text-right font-mono text-emerald-800">{formatKz(totalNet)}</td>
                    <td className="py-2.5 px-2 text-right font-mono">{formatKz(totalINSS8)}</td>
                    <td className="py-2.5 px-2 text-right font-mono">{formatKz(resultsList.reduce((acc, curr) => acc + curr.res.totalCompanyCost, 0))}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* Validation Footnote */}
        <div className="mt-8 pt-4 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-500 gap-2">
          <span>Elaborado por: {settings.hrResponsibleName} ({settings.hrResponsibleRole})</span>
          <span>Certificado para apresentação oficial e fiscal em Angola</span>
        </div>

      </div>

    </div>
  );
};
