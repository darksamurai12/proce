import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Edit3, 
  FileText, 
  Plus, 
  Search, 
  Trash2, 
  UserCheck 
} from 'lucide-react';
import { Employee } from '../../types/payroll';
import { formatKz } from '../../utils/formatters';

interface EmployeeListProps {
  employees: Employee[];
  onAddEmployee: () => void;
  onEditEmployee: (employee: Employee) => void;
  onDeleteEmployee: (employeeId: string) => void;
  onViewPayslip: (employeeId: string) => void;
}

export const EmployeeList: React.FC<EmployeeListProps> = ({
  employees,
  onAddEmployee,
  onEditEmployee,
  onDeleteEmployee,
  onViewPayslip
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');

  const departments = useMemo(() => {
    const set = new Set<string>();
    employees.forEach((emp) => set.add(emp.department));
    return Array.from(set);
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchSearch =
        emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.biNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.nif.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.code.toLowerCase().includes(searchTerm.toLowerCase());

      const matchDept = selectedDept === 'all' || emp.department === selectedDept;

      return matchSearch && matchDept;
    });
  }, [employees, searchTerm, selectedDept]);

  const totalBaseMass = employees.reduce((acc, emp) => acc + emp.baseSalary, 0);

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            Quadro de Colaboradores
          </h1>
          <div className="flex items-center gap-2 mt-1 text-xs text-neutral-500">
            <span>{employees.length} trabalhadores activos</span>
            <span aria-hidden="true">·</span>
            <span>Massa salarial base: {formatKz(totalBaseMass, false)}</span>
          </div>
        </div>

        <button
          onClick={onAddEmployee}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Cadastrar Colaborador</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-lg border border-neutral-200">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por nome, BI, NIF, cargo ou código..."
            className="w-full pl-9 pr-4 py-1.5 text-xs border border-neutral-200 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-900"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500 whitespace-nowrap">Departamento:</span>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="text-xs border border-neutral-200 rounded-md py-1.5 px-2.5 bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900"
          >
            <option value="all">Todos os Departamentos</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-neutral-50/75 border-b border-neutral-200 text-neutral-600 font-medium">
                <th className="py-3 px-4">Código / Nome</th>
                <th className="py-3 px-4">Documentos (BI / NIF / INSS)</th>
                <th className="py-3 px-4">Departamento / Função</th>
                <th className="py-3 px-4 text-right">Salário Base</th>
                <th className="py-3 px-4 text-right">Subsídios Fixos</th>
                <th className="py-3 px-4">Domiciliação Bancária</th>
                <th className="py-3 px-4 text-center">Acções</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-500">
                    Nenhum colaborador encontrado com os critérios actuais.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => {
                  const totalAllowances =
                    (emp.foodAllowance || 0) +
                    (emp.transportAllowance || 0) +
                    (emp.roleAllowance || 0) +
                    (emp.familyAllowance || 0) +
                    (emp.housingAllowance || 0) +
                    (emp.communicationAllowance || 0);

                  return (
                    <tr key={emp.id} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-neutral-900">{emp.fullName}</div>
                        <div className="text-[11px] text-neutral-400 font-mono flex items-center gap-1.5 mt-0.5">
                          <span>{emp.code}</span>
                          <span aria-hidden="true">·</span>
                          <span className="capitalize">{emp.contractType}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-neutral-600">
                        <div>BI: <span className="text-neutral-900">{emp.biNumber}</span></div>
                        <div className="text-[11px] text-neutral-400">INSS: {emp.socialSecurityNumber || 'Pendente'}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-medium text-neutral-800">{emp.role}</div>
                        <div className="text-[11px] text-neutral-500">{emp.department}</div>
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-semibold text-neutral-900">
                        {formatKz(emp.baseSalary)}
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-neutral-600">
                        <div>{formatKz(totalAllowances)}</div>
                        <div className="text-[10px] text-neutral-400">
                          Alim: {formatKz(emp.foodAllowance, false)} · Trans: {formatKz(emp.transportAllowance, false)}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-neutral-600">
                        <div className="font-medium text-neutral-800 truncate max-w-[160px]">{emp.bankName}</div>
                        <div className="text-[11px] font-mono text-neutral-400 truncate max-w-[170px]">{emp.iban}</div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            title="Emitir Recibo"
                            onClick={() => onViewPayslip(emp.id)}
                            className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title="Editar Dados"
                            onClick={() => onEditEmployee(emp)}
                            className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title="Remover Colaborador"
                            onClick={() => {
                              if (confirm(`Pretende eliminar ${emp.fullName}?`)) {
                                onDeleteEmployee(emp.id);
                              }
                            }}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
