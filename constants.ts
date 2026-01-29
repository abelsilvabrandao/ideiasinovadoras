
import { CycleConfig, CyclePhase, ProgramType } from './types';

export const WEIGHTS = {
  GRAU_INOVACAO: 4,
  SEGURANCA_AMBIENTE: 4,
  REDUCAO_CUSTOS: 3,
  PRODUTIVIDADE: 3,
  FACILIDADE_APLICACAO: 2,
  ESCALABILIDADE: 2,
  INVESTIMENTO: 1
};

/**
 * Definitions for evaluation criteria including weights.
 * Added to fix missing export error in Evaluation.tsx.
 */
export const CRITERIA_DEFINITIONS = [
  { id: 'GRAU_INOVACAO', label: 'Grau de Inovação', weight: 4 },
  { id: 'SEGURANCA_AMBIENTE', label: 'Segurança/Ambiente', weight: 4 },
  { id: 'REDUCAO_CUSTOS', label: 'Redução de Custos', weight: 3 },
  { id: 'PRODUTIVIDADE', label: 'Produtividade', weight: 3 },
  { id: 'FACILIDADE_APLICACAO', label: 'Facilidade de Aplicação', weight: 2 },
  { id: 'ESCALABILIDADE', label: 'Escalabilidade', weight: 2 },
  { id: 'INVESTIMENTO', label: 'Investimento', weight: 1 }
];

export const SANGUE_VERDE_VALUES = [
  { id: 'DONO', label: 'ATITUDE DE DONO', description: '"Cuidar Como se fosse meu"' },
  { id: 'ETICA', label: 'COMPETITIVIDADE COM ÉTICA E SUSTENTABILIDADE', description: '"Paixão por vencer seguindo as regras do jogo"' },
  { id: 'INOVACAO', label: 'ADAPTABILIDADE, INOVAÇÃO, ARROJO & EMPREENDEDORISMO', description: '"O possível é para todos, o impossível é com a gente"' },
  { id: 'EXCELENCIA', label: 'EXCELÊNCIA OPERACIONAL COM SEGURANÇA', description: '"Fazer certo da 1ª vez; fazer seguro todas as vezes"' },
  { id: 'TIME', label: 'FORÇA DO TIME E INTERDEPENDÊNCIA', description: '"Time que joga junto, ganha junto"' },
  { id: 'CLIENTE', label: 'SERVIR O CLIENTE', description: '"Não basta atender, tem que surpreender"' },
  { id: 'SIMPLICIDADE', label: 'AUSTERIDADE E SIMPLICIDADE', description: '"Fazemos mais com menos, ouvindo a todos em busca da melhor ideia"' }
];

export const CALENDARIO_OFICIAL_2026: CycleConfig[] = [
  {
    program: ProgramType.IDEIAS,
    year: 2026,
    quarter: 1,
    submissionStart: '2026-01-05',
    submissionEnd: '2026-01-30',
    evaluationStart: '2026-02-02',
    evaluationEnd: '2026-02-13',
    resultsDate: '2026-02-27',
    isPublished: false
  },
  {
    program: ProgramType.SANGUE_VERDE,
    year: 2026,
    quarter: 1,
    submissionStart: '2026-01-05',
    submissionEnd: '2026-01-30',
    evaluationStart: '2026-02-02',
    evaluationEnd: '2026-02-13',
    resultsDate: '2026-02-27',
    isPublished: false
  }
];
