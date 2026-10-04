/**
 * Formatadores e Utilitários para a Realidade de Angola
 */

export function formatKz(value: number, includeDecimals = true): string {
  if (isNaN(value) || value === null || value === undefined) return '0,00 Kz';

  const fixed = includeDecimals ? value.toFixed(2) : Math.round(value).toString();
  const [intPart, decPart] = fixed.split('.');

  // Formato angolano: pontos para milhares, vírgula para cêntimos
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  if (includeDecimals && decPart !== undefined) {
    return `${formattedInt},${decPart} Kz`;
  }
  return `${formattedInt} Kz`;
}

export function formatPercent(rate: number): string {
  return `${(rate * 100).toFixed(1).replace('.0', '')}%`;
}

export function formatDatePT(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('pt-AO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

export function getMonthName(monthNumber: number): string {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return months[monthNumber - 1] || '';
}

/**
 * Converte valor numérico em Kwanzas por extenso para recibos de vencimento
 */
export function numberToWordsKz(amount: number): string {
  const valor = Math.floor(amount);
  if (valor === 0) return 'Zero kwanzas';

  const unidades = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
  const especiais = ['dez', 'onze', 'doze', 'treze', 'catorze', 'quinze', 'dezasseis', 'dezassete', 'dezoito', 'dezanove'];
  const dezenas = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
  const centenas = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];

  function converterCentenas(num: number): string {
    if (num === 0) return '';
    if (num === 100) return 'cem';
    const c = Math.floor(num / 100);
    const restoD = num % 100;
    const d = Math.floor(restoD / 10);
    const u = restoD % 10;

    let partes: string[] = [];
    if (c > 0) partes.push(centenas[c]);

    if (restoD >= 10 && restoD < 20) {
      partes.push(especiais[restoD - 10]);
    } else {
      if (d > 0) partes.push(dezenas[d]);
      if (u > 0) partes.push(unidades[u]);
    }

    return partes.join(' e ');
  }

  const bilhoes = Math.floor(valor / 1000000000);
  const milhoes = Math.floor((valor % 1000000000) / 1000000);
  const milhares = Math.floor((valor % 1000000) / 1000);
  const resto = valor % 1000;

  let resultado: string[] = [];

  if (bilhoes > 0) {
    resultado.push(bilhoes === 1 ? 'um bilhão' : `${converterCentenas(bilhoes)} bilhões`);
  }
  if (milhoes > 0) {
    resultado.push(milhoes === 1 ? 'um milhão' : `${converterCentenas(milhoes)} milhões`);
  }
  if (milhares > 0) {
    resultado.push(milhares === 1 ? 'mil' : `${converterCentenas(milhares)} mil`);
  }
  if (resto > 0) {
    resultado.push(converterCentenas(resto));
  }

  let texto = resultado.join(', ').replace(/, ([^,]*)$/, ' e $1');
  // Capitaliza a primeira letra
  texto = texto.charAt(0).toUpperCase() + texto.slice(1);
  return `${texto} kwanzas`;
}

/**
 * Gera download de arquivo CSV/Excel compatível
 */
export function exportToCSV(filename: string, rows: (string | number)[][]) {
  const processRow = (row: (string | number)[]) => {
    return row
      .map((val) => {
        const text = String(val ?? '');
        if (text.includes(';') || text.includes('\n') || text.includes('"')) {
          return `"${text.replace(/"/g, '""')}"`;
        }
        return text;
      })
      .join(';');
  };

  const csvContent = '\uFEFF' + rows.map(processRow).join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
