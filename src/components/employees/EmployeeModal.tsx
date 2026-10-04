import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { Employee } from '../../types/payroll';

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (employee: Employee) => void;
  initialEmployee?: Employee | null;
}

const ANGOLAN_BANKS = [
  'BAI - Banco Angolano de Investimentos',
  'BFA - Banco de Fomento Angola',
  'Banco BIC',
  'Banco Millennium Atlântico',
  'Standard Bank Angola',
  'Banco Sol',
  'Banco de Poupança e Crédito (BPC)',
  'Banco Keve',
  'Banco Comercial Angolano (BCA)',
  'Banco Yetu',
  'Banco de Comércio e Indústria (BCI)'
];

const ANGOLAN_PROVINCES = [
  'Bengo', 'Benguela', 'Bié', 'Cabinda', 'Cuando Cubango', 'Cuanza Norte',
  'Cuanza Sul', 'Cunene', 'Huambo', 'Huíla', 'Luanda', 'Lunda Norte',
  'Lunda Sul', 'Malanje', 'Moxico', 'Namibe', 'Uíge', 'Zaire'
];

export const EmployeeModal: React.FC<EmployeeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialEmployee
}) => {
  const isEditing = !!initialEmployee;

  const [formData, setFormData] = useState<Partial<Employee>>(() => {
    if (initialEmployee) return { ...initialEmployee };
    return {
      code: `EMP-00${Math.floor(Math.random() * 900) + 100}`,
      fullName: '',
      biNumber: '',
      nif: '',
      socialSecurityNumber: '',
      birthDate: '1995-01-01',
      gender: 'M',
      phone: '+244 ',
      email: '',
      address: '',
      city: 'Luanda',
      department: 'Operações',
      role: '',
      admissionDate: new Date().toISOString().split('T')[0],
      contractType: 'indeterminado',
      status: 'active',
      baseSalary: 150000,
      foodAllowance: 30000,
      transportAllowance: 30000,
      roleAllowance: 0,
      familyAllowance: 0,
      housingAllowance: 0,
      communicationAllowance: 0,
      otherFixedAllowances: 0,
      dependentsCount: 0,
      bankName: 'BAI - Banco Angolano de Investimentos',
      bankAccount: '',
      iban: 'AO06.'
    };
  });

  const [activeTab, setActiveTab] = useState<'personal' | 'contract' | 'salary' | 'bank'>('personal');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.biNumber) {
      alert('Por favor preencha o Nome Completo e o Bilhete de Identidade.');
      return;
    }

    const employeeToSave: Employee = {
      id: initialEmployee ? initialEmployee.id : `emp-${Date.now()}`,
      code: formData.code || 'EMP-001',
      fullName: formData.fullName || '',
      biNumber: formData.biNumber || '',
      nif: formData.nif || formData.biNumber || '',
      socialSecurityNumber: formData.socialSecurityNumber || '',
      birthDate: formData.birthDate || '1995-01-01',
      gender: formData.gender || 'M',
      phone: formData.phone || '',
      email: formData.email || '',
      address: formData.address || '',
      city: formData.city || 'Luanda',
      department: formData.department || 'Geral',
      role: formData.role || 'Colaborador',
      admissionDate: formData.admissionDate || new Date().toISOString().split('T')[0],
      contractType: formData.contractType || 'indeterminado',
      status: formData.status || 'active',
      baseSalary: Number(formData.baseSalary) || 0,
      foodAllowance: Number(formData.foodAllowance) || 0,
      transportAllowance: Number(formData.transportAllowance) || 0,
      roleAllowance: Number(formData.roleAllowance) || 0,
      familyAllowance: Number(formData.familyAllowance) || 0,
      housingAllowance: Number(formData.housingAllowance) || 0,
      communicationAllowance: Number(formData.communicationAllowance) || 0,
      otherFixedAllowances: Number(formData.otherFixedAllowances) || 0,
      dependentsCount: Number(formData.dependentsCount) || 0,
      bankName: formData.bankName || 'BAI',
      bankAccount: formData.bankAccount || '',
      iban: formData.iban || ''
    };

    onSave(employeeToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl border border-neutral-200 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">
              {isEditing ? 'Editar Ficha do Colaborador' : 'Cadastrar Novo Colaborador'}
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Dados pessoais, fiscais (NIF/INSS) e remuneração em Kwanzas
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex border-b border-neutral-200 bg-neutral-50 px-6 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('personal')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'personal'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            1. Dados Pessoais & BI
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('contract')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'contract'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            2. Contrato & LGT
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('salary')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'salary'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            3. Salário & Subsídios
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('bank')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'bank'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            4. Dados Bancários (IBAN)
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 max-h-[65vh] overflow-y-auto space-y-4">
            
            {activeTab === 'personal' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-neutral-700">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 text-sm border border-neutral-300 rounded-md shadow-xs focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
                    placeholder="Ex: João Baptista Silva"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700">Nº do Bilhete de Identidade (BI) *</label>
                  <input
                    type="text"
                    required
                    value={formData.biNumber}
                    onChange={(e) => setFormData({ ...formData, biNumber: e.target.value, nif: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 text-sm font-mono border border-neutral-300 rounded-md shadow-xs focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
                    placeholder="Ex: 004819283LA041"
                  />
                  <span className="text-[11px] text-neutral-400">Padrão angolano de 14 caracteres</span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700">NIF (Número de Contribuinte) *</label>
                  <input
                    type="text"
                    required
                    value={formData.nif}
                    onChange={(e) => setFormData({ ...formData, nif: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 text-sm font-mono border border-neutral-300 rounded-md shadow-xs focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
                    placeholder="Igual ao BI para pessoas singulares"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700">Nº da Segurança Social (INSS) *</label>
                  <input
                    type="text"
                    value={formData.socialSecurityNumber}
                    onChange={(e) => setFormData({ ...formData, socialSecurityNumber: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 text-sm font-mono border border-neutral-300 rounded-md shadow-xs focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
                    placeholder="Ex: 12049382"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700">Gênero</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'M' | 'F' })}
                    className="mt-1 block w-full px-3 py-2 text-sm border border-neutral-300 rounded-md shadow-xs focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
                  >
                    <option value="M">Masculino</option>
                    <option value="F">Feminino</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700">Data de Nascimento</label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 text-sm border border-neutral-300 rounded-md shadow-xs focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700">Telefone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 text-sm border border-neutral-300 rounded-md shadow-xs focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
                    placeholder="+244 923 000 000"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700">E-mail</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 text-sm border border-neutral-300 rounded-md shadow-xs focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
                    placeholder="colaborador@empresa.ao"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700">Província</label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 text-sm border border-neutral-300 rounded-md shadow-xs focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
                  >
                    {ANGOLAN_PROVINCES.map((prov) => (
                      <option key={prov} value={prov}>
                        {prov}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-neutral-700">Morada / Endereço Residencial</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 text-sm border border-neutral-300 rounded-md shadow-xs focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
                    placeholder="Bairro, Município, Rua"
                  />
                </div>
              </div>
            )}

            {activeTab === 'contract' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-700">Código do Colaborador</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 text-sm font-mono border border-neutral-300 rounded-md shadow-xs focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700">Departamento</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 text-sm border border-neutral-300 rounded-md shadow-xs focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
                    placeholder="Ex: Engenharia, Finanças, RH"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700">Função / Cargo</label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 text-sm border border-neutral-300 rounded-md shadow-xs focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
                    placeholder="Ex: Contabilista Sénior"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700">Data de Admissão</label>
                  <input
                    type="date"
                    value={formData.admissionDate}
                    onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 text-sm border border-neutral-300 rounded-md shadow-xs focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700">Tipo de Contrato (LGT)</label>
                  <select
                    value={formData.contractType}
                    onChange={(e) => setFormData({ ...formData, contractType: e.target.value as any })}
                    className="mt-1 block w-full px-3 py-2 text-sm border border-neutral-300 rounded-md shadow-xs focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
                  >
                    <option value="indeterminado">Tempo Indeterminado (Efectivo)</option>
                    <option value="determinado">Tempo Determinado (Termo Certo)</option>
                    <option value="estagio">Estágio Profissional</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700">Estado / Situação</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="mt-1 block w-full px-3 py-2 text-sm border border-neutral-300 rounded-md shadow-xs focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
                  >
                    <option value="active">Activo</option>
                    <option value="on_leave">Em Férias / Licença</option>
                    <option value="terminated">Rescindido</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700">Número de Dependentes</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={formData.dependentsCount}
                    onChange={(e) => setFormData({ ...formData, dependentsCount: Number(e.target.value) })}
                    className="mt-1 block w-full px-3 py-2 text-sm border border-neutral-300 rounded-md shadow-xs focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
                  />
                </div>
              </div>
            )}

            {activeTab === 'salary' && (
              <div className="space-y-4">
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-md text-xs text-amber-800">
                  <strong>Regras fiscais de Angola:</strong> Subsídio de alimentação e de transporte possuem isenção legal de IRT e INSS até <strong>30.000 Kz cada</strong>. O subsídio de função/chefia é integralmente tributável.
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-neutral-900">Salário Base Mensal (Kz) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="1000"
                      value={formData.baseSalary}
                      onChange={(e) => setFormData({ ...formData, baseSalary: Number(e.target.value) })}
                      className="mt-1 block w-full px-3 py-2.5 text-base font-bold font-mono border border-neutral-300 rounded-md shadow-xs focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
                      placeholder="150000"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700">Subsídio de Alimentação (Kz)</label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={formData.foodAllowance}
                      onChange={(e) => setFormData({ ...formData, foodAllowance: Number(e.target.value) })}
                      className="mt-1 block w-full px-3 py-2 text-sm font-mono border border-neutral-300 rounded-md shadow-xs focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
                    />
                    <span className="text-[11px] text-neutral-400">Isento de IRT e INSS até 30.000 Kz</span>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700">Subsídio de Transporte (Kz)</label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={formData.transportAllowance}
                      onChange={(e) => setFormData({ ...formData, transportAllowance: Number(e.target.value) })}
                      className="mt-1 block w-full px-3 py-2 text-sm font-mono border border-neutral-300 rounded-md shadow-xs focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
                    />
                    <span className="text-[11px] text-neutral-400">Isento de IRT e INSS até 30.000 Kz</span>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700">Subsídio de Função / Chefia (Kz)</label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={formData.roleAllowance}
                      onChange={(e) => setFormData({ ...formData, roleAllowance: Number(e.target.value) })}
                      className="mt-1 block w-full px-3 py-2 text-sm font-mono border border-neutral-300 rounded-md shadow-xs focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
                    />
                    <span className="text-[11px] text-neutral-400">Tributável a 100% em INSS e IRT</span>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700">Abono / Subsídio de Família (Kz)</label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={formData.familyAllowance}
                      onChange={(e) => setFormData({ ...formData, familyAllowance: Number(e.target.value) })}
                      className="mt-1 block w-full px-3 py-2 text-sm font-mono border border-neutral-300 rounded-md shadow-xs focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
                    />
                    <span className="text-[11px] text-neutral-400">Legalmente isento de IRT e INSS</span>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700">Subsídio de Habitação (Kz)</label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={formData.housingAllowance}
                      onChange={(e) => setFormData({ ...formData, housingAllowance: Number(e.target.value) })}
                      className="mt-1 block w-full px-3 py-2 text-sm font-mono border border-neutral-300 rounded-md shadow-xs focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700">Subsídio de Comunicação (Kz)</label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={formData.communicationAllowance}
                      onChange={(e) => setFormData({ ...formData, communicationAllowance: Number(e.target.value) })}
                      className="mt-1 block w-full px-3 py-2 text-sm font-mono border border-neutral-300 rounded-md shadow-xs focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'bank' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-neutral-700">Banco Domiciliário</label>
                  <select
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 text-sm border border-neutral-300 rounded-md shadow-xs focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
                  >
                    {ANGOLAN_BANKS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700">Número da Conta Bancária</label>
                  <input
                    type="text"
                    value={formData.bankAccount}
                    onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 text-sm font-mono border border-neutral-300 rounded-md shadow-xs focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
                    placeholder="Ex: 88492019"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700">IBAN Angolano (AO06...)</label>
                  <input
                    type="text"
                    value={formData.iban}
                    onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 text-sm font-mono border border-neutral-300 rounded-md shadow-xs focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
                    placeholder="AO06.0040.0000.1249.8231.1012.3"
                  />
                  <span className="text-[11px] text-neutral-400">21 dígitos numéricos com prefixo AO06</span>
                </div>
              </div>
            )}

          </div>

          {/* Footer actions */}
          <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors shadow-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-md hover:bg-neutral-800 transition-colors shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Guardar Alterações' : 'Concluir Cadastro'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
