
/**
 * Formata uma string de data YYYY-MM-DD para o padrão brasileiro DD/MM/YYYY
 * Evita o problema de fuso horário UTC do JavaScript
 */
export const formatLocalDate = (dateStr: string | undefined): string => {
  if (!dateStr) return '-';
  
  // Se a data vier no formato ISO completo, pega apenas a parte da data
  const simpleDate = dateStr.split('T')[0];
  const parts = simpleDate.split('-');
  
  if (parts.length !== 3) return dateStr;
  
  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
};

/**
 * Retorna a data atual no formato YYYY-MM-DD respeitando o fuso local
 */
export const getLocalISODate = (): string => {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const localDate = new Date(now.getTime() - (offset * 60 * 1000));
  return localDate.toISOString().split('T')[0];
};
