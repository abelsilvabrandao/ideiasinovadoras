
export enum UserRole {
  COLABORADOR = 'COLABORADOR',
  GREEN_BELT = 'GREEN_BELT',
  COMITE = 'COMITE',
  AGENTE_IMPLANTACAO = 'AGENTE_IMPLANTACAO',
  ADMIN = 'ADMIN'
}

export interface UserAccount {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  registration: string;
  sector: string;
  position: string; 
  costCenter: string; 
  admissionDate?: string; // Campo adicionado para histórico e Sangue Verde
  birthDate?: string; 
  password?: string; 
  profilePhoto?: string; 
  phone?: string; 
  managedSectors?: string[]; 
  managedCostCenters?: string[]; 
  isManager?: boolean;
}

export enum ProgramType {
  IDEIAS = 'IDEIAS',
  SANGUE_VERDE = 'SANGUE_VERDE'
}

export enum IdeaType {
  INOVADORA = 'INOVADORA',
  MELHORIA_CONTINUA = 'MELHORIA_CONTINUA',
  NAO_APLICAVEL = 'NAO_APLICAVEL',
  PENDENTE = 'PENDENTE'
}

export enum ImplementationStatus {
  PLANEJAMENTO = 'PLANEJAMENTO',
  EM_EXECUCAO = 'EM_EXECUCAO',
  CONCLUIDO = 'CONCLUIDO',
  CANCELADO = 'CANCELADO'
}

export enum CyclePhase {
  SUBMISSAO = 'SUBMISSAO',
  AVALIACO_COMITE = 'AVALIACO_COMITE',
  VOTACAO_FINAL = 'VOTACAO_FINAL',
  PUBLICADO = 'PUBLICADO'
}

export interface CycleConfig {
  id?: string;
  program: ProgramType;
  year: number;
  quarter: number;
  submissionStart: string;
  submissionEnd: string;
  evaluationStart: string;
  evaluationEnd: string;
  resultsDate: string;
  isPublished: boolean;
  phase?: CyclePhase;
  videoStorageUrl?: string;
}

export interface SangueVerdeNomination {
  id: string;
  nomineeName: string;
  registration: string;
  costCenter: string;
  admissionDate: string;
  selectedValues: string[];
  justification: string;
  profilePhoto: string;
  validationVideos: string[]; 
  nominatorName: string;
  year: number;
  quarter: number;
  dateSubmitted: string;
  votes?: number;
}

export interface Evaluation {
  evaluatorId: string;
  type: IdeaType;
  date: string;
  scores?: { criterionId: string; score: number }[];
  relevanceScore?: number;
  justification?: string;
}

export interface IdeaFeedback {
  user: string;
  text: string;
  date: string;
}

export interface Idea {
  id: string;
  registration: string;
  fullname: string;
  nickname?: string;
  phone: string;
  email: string;
  greenBelt: string;
  sector: string;
  ideaDate: string;
  category: string;
  location: string;
  problem: string;
  idea: string; 
  implementationDetails: string;
  investment: string;
  financialReturn: string;
  manager: string;
  selectedCriteria: string[];
  profilePhoto?: string; 
  videoUrl?: string; 
  title: string; 
  author: string;
  area: string;
  dateSubmitted: string;
  cycle: number;
  year: number;
  finalType: IdeaType;
  evaluations: Evaluation[];
  finalScore: number;
  votes?: number;
  implementationStatus?: ImplementationStatus;
  implementationAgent?: string;
  rank?: string;
  feedbacks?: IdeaFeedback[];
}
