import React, { useState } from 'react';
import { 
  Building2, 
  Check, 
  Download, 
  FileUp, 
  HelpCircle, 
  RefreshCcw, 
  Save, 
  ShieldCheck, 
  Sliders 
} from 'lucide-react';
import { CompanySettings } from '../../types/payroll';
import { formatPercent } from '../../utils/formatters';

interface SettingsViewProps {
  settings: CompanySettings;
  onSaveSettings: (settings: CompanySettings) => void;
  onExportAllData: () => void;
  onImportAllData: (jsonData: string) => void;
  onResetToDemoData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  onExportAllData,
  onImportAllData,
  onResetToDemoData
}) => {
  const [formData, setFormData] = useState<CompanySettings>(settings);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        onImportAllData(content);
        alert('Dados importados com sucesso!');
      } catch (err) {
        alert('Erro ao importar o ficheiro JSON. Verifique a formatação.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8 max-w-5xl">
      
      {/* Header */}
      <div className="pb-4 border-b border-neutral-200">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
          Configurações da Empresa & Parâmetros Fiscais
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Identificação da entidade empregadora e parâmetros da legislação tributária e laboral de Angola
        </p>
      </div>

      {saveSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Configurações guardadas com sucesso!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Section 1: Company Profile */}
        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
            <Building2 className="w-4 h-4 text-neutral-700" />
            <h2 className="text-base font-semibold text-neutral-900">
              Dados Oficiais da Empresa
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-neutral-700">Denominação Social / Firma *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700">NIF da Empresa *</label>
              <input
                type="text"
                required
                value={formData.nif}
                onChange={(e) => setFormData({ ...formData, nif: e.target.value })}
                className="mt-1 block w-full px-3 py-2 text-sm font-mono border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700">Nº de Contribuinte INSS *</label>
              <input
                type="text"
                required
                value={formData.inssNumber}
                onChange={(e) => setFormData({ ...formData, inssNumber: e.target.value })}
                className="mt-1 block w-full px-3 py-2 text-sm font-mono border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-neutral-700">Endereço / Sede</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="mt-1 block w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700">Província / Cidade</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value, province: e.target.value })}
                className="mt-1 block w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700">Contactos Telefónicos</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="mt-1 block w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700">Responsável de RH (Assinatura)</label>
              <input
                type="text"
                value={formData.hrResponsibleName}
                onChange={(e) => setFormData({ ...formData, hrResponsibleName: e.target.value })}
                className="mt-1 block w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700">Cargo do Responsável</label>
              <input
                type="text"
                value={formData.hrResponsibleRole}
                onChange={(e) => setFormData({ ...formData, hrResponsibleRole: e.target.value })}
                className="mt-1 block w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Angolan Fiscal Parameters */}
        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
            <Sliders className="w-4 h-4 text-neutral-700" />
            <h2 className="text-base font-semibold text-neutral-900">
              Limites & Taxas da Legislação Angolana
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-700">
                Limite Isenção Subsídio Alimentação (Kz)
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                value={formData.foodAllowanceExemptLimit}
                onChange={(e) => setFormData({ ...formData, foodAllowanceExemptLimit: Number(e.target.value) })}
                className="mt-1 block w-full px-3 py-2 text-sm font-mono border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
              />
              <span className="text-[11px] text-neutral-400">Padrão legal em Angola: 30.000 Kz</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700">
                Limite Isenção Subsídio Transporte (Kz)
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                value={formData.transportAllowanceExemptLimit}
                onChange={(e) => setFormData({ ...formData, transportAllowanceExemptLimit: Number(e.target.value) })}
                className="mt-1 block w-full px-3 py-2 text-sm font-mono border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
              />
              <span className="text-[11px] text-neutral-400">Padrão legal em Angola: 30.000 Kz</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700">
                Taxa INSS Trabalhador (Decimal, ex: 0.03 = 3%)
              </label>
              <input
                type="number"
                min="0"
                max="1"
                step="0.005"
                value={formData.inssEmployeeRate}
                onChange={(e) => setFormData({ ...formData, inssEmployeeRate: Number(e.target.value) })}
                className="mt-1 block w-full px-3 py-2 text-sm font-mono border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
              />
              <span className="text-[11px] text-neutral-400">Obrigatório por lei: 3% (0.03)</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700">
                Taxa INSS Entidade Patronal (Decimal, ex: 0.08 = 8%)
              </label>
              <input
                type="number"
                min="0"
                max="1"
                step="0.005"
                value={formData.inssEmployerRate}
                onChange={(e) => setFormData({ ...formData, inssEmployerRate: Number(e.target.value) })}
                className="mt-1 block w-full px-3 py-2 text-sm font-mono border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
              />
              <span className="text-[11px] text-neutral-400">Obrigatório por lei: 8% (0.08)</span>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Configurações</span>
          </button>
        </div>
      </form>

      {/* Section 3: Data Management & Backup */}
      <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-xs space-y-4">
        <h2 className="text-base font-semibold text-neutral-900">
          Cópia de Segurança & Gestão de Dados
        </h2>
        <p className="text-xs text-neutral-600">
          Exporte todos os colaboradores, históricos de processamento salarial e dados da empresa em formato JSON seguro, ou restaure a qualquer momento.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={onExportAllData}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar Backup (JSON)</span>
          </button>

          <label className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors shadow-xs cursor-pointer">
            <FileUp className="w-3.5 h-3.5" />
            <span>Restaurar Ficheiro JSON</span>
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            onClick={() => {
              if (confirm('Tem a certeza que pretende recarregar os dados de demonstração de Angola? Todas as alterações manuais serão reiniciadas.')) {
                onResetToDemoData();
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors shadow-xs"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            <span>Repor Dados Demonstrativos</span>
          </button>
        </div>
      </div>

    </div>
  );
};
