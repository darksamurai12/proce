import {
  collection,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './config';
import { CompanySettings, Employee, PayrollPeriod } from '../types/payroll';

const SETTINGS_COLLECTION = 'settings';
const EMPLOYEES_COLLECTION = 'employees';
const PERIODS_COLLECTION = 'payroll_periods';
const DEFAULT_SETTINGS_DOC_ID = 'company_profile';

const CACHE_KEYS = {
  SETTINGS: 'kwanzafolha_cached_settings',
  EMPLOYEES: 'kwanzafolha_cached_employees',
  PERIODS: 'kwanzafolha_cached_periods',
};

export const DEFAULT_CLEAN_SETTINGS: CompanySettings = {
  name: 'WE BUSINESS CONSULTING - PRESTAÇAO DE SERVIÇOS, LDA',
  nif: '5001286722',
  inssNumber: '1',
  commercialRegister: '',
  address: 'Benfica – Edifício Lumir, Luanda - República de Angola',
  city: 'Luanda',
  province: 'Luanda',
  phone: '+244 933 264 475',
  email: 'geral.weconsulting@gmail.com',
  bankName: 'BAI - Banco Angolano de Investimentos',
  bankAccount: '',
  iban: 'AO06.',
  hrResponsibleName: '',
  hrResponsibleRole: 'Recursos Humanos',
  foodAllowanceExemptLimit: 30000,
  transportAllowanceExemptLimit: 30000,
  inssEmployeeRate: 0.03,
  inssEmployerRate: 0.08,
  workAccidentInsuranceRate: 0.015,
  workingHoursPerMonth: 173.33,
  workingDaysPerMonth: 22,
};

// ==========================================
// Cache Local / Resiliência Offline
// ==========================================

export function getLocalSettings(): CompanySettings | null {
  try {
    const raw = localStorage.getItem(CACHE_KEYS.SETTINGS);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveLocalSettings(settings: CompanySettings): void {
  try {
    localStorage.setItem(CACHE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (_) {}
}

export function getLocalEmployees(): Employee[] {
  try {
    const raw = localStorage.getItem(CACHE_KEYS.EMPLOYEES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalEmployees(employees: Employee[]): void {
  try {
    localStorage.setItem(CACHE_KEYS.EMPLOYEES, JSON.stringify(employees));
  } catch (_) {}
}

export function getLocalPeriods(): PayrollPeriod[] {
  try {
    const raw = localStorage.getItem(CACHE_KEYS.PERIODS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalPeriods(periods: PayrollPeriod[]): void {
  try {
    localStorage.setItem(CACHE_KEYS.PERIODS, JSON.stringify(periods));
  } catch (_) {}
}

/**
 * Carrega as configurações da empresa do Firestore com tolerância a modo offline
 */
export async function loadCompanySettings(): Promise<CompanySettings> {
  const path = `${SETTINGS_COLLECTION}/${DEFAULT_SETTINGS_DOC_ID}`;
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, DEFAULT_SETTINGS_DOC_ID);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as CompanySettings;
      saveLocalSettings(data);
      return data;
    }
    return getLocalSettings() || DEFAULT_CLEAN_SETTINGS;
  } catch (error: any) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes('Missing or insufficient permissions') || error?.code === 'permission-denied') {
      handleFirestoreError(error, OperationType.GET, path);
    }
    console.warn('Aviso: Firestore offline ou em sincronização ao obter configurações:', msg);
    return getLocalSettings() || DEFAULT_CLEAN_SETTINGS;
  }
}

/**
 * Guarda ou actualiza as configurações da empresa no Firestore
 */
export async function saveCompanySettingsToDb(settings: CompanySettings): Promise<void> {
  const path = `${SETTINGS_COLLECTION}/${DEFAULT_SETTINGS_DOC_ID}`;
  saveLocalSettings(settings);
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, DEFAULT_SETTINGS_DOC_ID);
    await setDoc(
      docRef,
      {
        ...settings,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error: any) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes('Missing or insufficient permissions') || error?.code === 'permission-denied') {
      handleFirestoreError(error, OperationType.WRITE, path);
    } else {
      console.warn('Aviso: Configurações gravadas localmente; sincronização na nuvem pendente:', msg);
    }
  }
}

/**
 * Ouve em tempo real a lista de colaboradores na base de dados
 */
export function subscribeEmployees(
  onData: (employees: Employee[]) => void,
  onError?: (err: any) => void
): () => void {
  const path = EMPLOYEES_COLLECTION;

  // Carrega imediatamente dados em cache se existirem
  const localList = getLocalEmployees();
  if (localList.length > 0) {
    onData(localList);
  }

  try {
    const q = query(collection(db, path));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: Employee[] = [];
        snapshot.forEach((d) => {
          list.push(d.data() as Employee);
        });
        list.sort((a, b) => a.code.localeCompare(b.code));
        saveLocalEmployees(list);
        onData(list);
      },
      (error) => {
        if (onError) onError(error);
        const msg = error instanceof Error ? error.message : String(error);
        if (msg.includes('Missing or insufficient permissions') || (error as any)?.code === 'permission-denied') {
          handleFirestoreError(error, OperationType.LIST, path);
        } else {
          console.warn('Aviso: Firestore em modo offline para colaboradores:', msg);
          const cached = getLocalEmployees();
          if (cached.length > 0) {
            onData(cached);
          }
        }
      }
    );
    return unsubscribe;
  } catch (error: any) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes('Missing or insufficient permissions') || error?.code === 'permission-denied') {
      handleFirestoreError(error, OperationType.LIST, path);
    }
    console.warn('Aviso: Falha ao iniciar subscrição de colaboradores:', msg);
    return () => {};
  }
}

/**
 * Adiciona um novo colaborador ao Firestore
 */
export async function addEmployeeToDb(employee: Employee): Promise<void> {
  const path = `${EMPLOYEES_COLLECTION}/${employee.id}`;
  const current = getLocalEmployees();
  const exists = current.some((e) => e.id === employee.id);
  const updated = exists ? current.map((e) => (e.id === employee.id ? employee : e)) : [...current, employee];
  saveLocalEmployees(updated);

  try {
    const docRef = doc(db, EMPLOYEES_COLLECTION, employee.id);
    await setDoc(docRef, {
      ...employee,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes('Missing or insufficient permissions') || error?.code === 'permission-denied') {
      handleFirestoreError(error, OperationType.CREATE, path);
    } else {
      console.warn('Aviso: Colaborador guardado localmente; sincronização na nuvem pendente:', msg);
    }
  }
}

/**
 * Actualiza um colaborador existente no Firestore
 */
export async function updateEmployeeInDb(employee: Employee): Promise<void> {
  const path = `${EMPLOYEES_COLLECTION}/${employee.id}`;
  const current = getLocalEmployees();
  const updated = current.map((e) => (e.id === employee.id ? employee : e));
  saveLocalEmployees(updated);

  try {
    const docRef = doc(db, EMPLOYEES_COLLECTION, employee.id);
    await setDoc(
      docRef,
      {
        ...employee,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error: any) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes('Missing or insufficient permissions') || error?.code === 'permission-denied') {
      handleFirestoreError(error, OperationType.UPDATE, path);
    } else {
      console.warn('Aviso: Colaborador actualizado localmente; sincronização na nuvem pendente:', msg);
    }
  }
}

/**
 * Remove um colaborador do Firestore
 */
export async function deleteEmployeeFromDb(employeeId: string): Promise<void> {
  const path = `${EMPLOYEES_COLLECTION}/${employeeId}`;
  const current = getLocalEmployees();
  const updated = current.filter((e) => e.id !== employeeId);
  saveLocalEmployees(updated);

  try {
    const docRef = doc(db, EMPLOYEES_COLLECTION, employeeId);
    await deleteDoc(docRef);
  } catch (error: any) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes('Missing or insufficient permissions') || error?.code === 'permission-denied') {
      handleFirestoreError(error, OperationType.DELETE, path);
    } else {
      console.warn('Aviso: Colaborador removido localmente; sincronização na nuvem pendente:', msg);
    }
  }
}

/**
 * Ouve em tempo real os períodos de folha salarial
 */
export function subscribePayrollPeriods(
  onData: (periods: PayrollPeriod[]) => void,
  onError?: (err: any) => void
): () => void {
  const path = PERIODS_COLLECTION;

  const localPeriods = getLocalPeriods();
  if (localPeriods.length > 0) {
    onData(localPeriods);
  }

  try {
    const q = query(collection(db, path));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: PayrollPeriod[] = [];
        snapshot.forEach((d) => {
          list.push(d.data() as PayrollPeriod);
        });
        list.sort((a, b) => b.year - a.year || b.month - a.month);
        saveLocalPeriods(list);
        onData(list);
      },
      (error) => {
        if (onError) onError(error);
        const msg = error instanceof Error ? error.message : String(error);
        if (msg.includes('Missing or insufficient permissions') || (error as any)?.code === 'permission-denied') {
          handleFirestoreError(error, OperationType.LIST, path);
        } else {
          console.warn('Aviso: Firestore em modo offline para períodos:', msg);
          const cached = getLocalPeriods();
          if (cached.length > 0) {
            onData(cached);
          }
        }
      }
    );
    return unsubscribe;
  } catch (error: any) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes('Missing or insufficient permissions') || error?.code === 'permission-denied') {
      handleFirestoreError(error, OperationType.LIST, path);
    }
    console.warn('Aviso: Falha ao iniciar subscrição de períodos:', msg);
    return () => {};
  }
}

/**
 * Guarda ou actualiza um período de folha no Firestore
 */
export async function savePayrollPeriodToDb(period: PayrollPeriod): Promise<void> {
  const path = `${PERIODS_COLLECTION}/${period.id}`;
  const current = getLocalPeriods();
  const exists = current.some((p) => p.id === period.id);
  const updated = exists ? current.map((p) => (p.id === period.id ? period : p)) : [period, ...current];
  saveLocalPeriods(updated);

  try {
    const docRef = doc(db, PERIODS_COLLECTION, period.id);
    await setDoc(docRef, period, { merge: true });
  } catch (error: any) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes('Missing or insufficient permissions') || error?.code === 'permission-denied') {
      handleFirestoreError(error, OperationType.WRITE, path);
    } else {
      console.warn('Aviso: Período guardado localmente; sincronização na nuvem pendente:', msg);
    }
  }
}

/**
 * Elimina um período de processamento no Firestore
 */
export async function deletePayrollPeriodFromDb(periodId: string): Promise<void> {
  const path = `${PERIODS_COLLECTION}/${periodId}`;
  const current = getLocalPeriods();
  const updated = current.filter((p) => p.id !== periodId);
  saveLocalPeriods(updated);

  try {
    const docRef = doc(db, PERIODS_COLLECTION, periodId);
    await deleteDoc(docRef);
  } catch (error: any) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes('Missing or insufficient permissions') || error?.code === 'permission-denied') {
      handleFirestoreError(error, OperationType.DELETE, path);
    } else {
      console.warn('Aviso: Período removido localmente; sincronização na nuvem pendente:', msg);
    }
  }
}
