// /src/lib/types.ts

// --- Core User and Organization Types ---

export type UserRole =
  | 'SuperAdmin'
  | 'Admin'
  | 'Academico'
  | 'RRHH'
  | 'Finanzas'
  | 'Estudiante'
  | 'Empleado'
  | 'EnEspera'
  | 'SinAsignar'
  | 'Ventas'
  | 'Marketing'
  | 'Soporte'
  | 'Cancelled';

export type UserProfile = {
  uid: string;
  email: string;
  role: UserRole;
  name: string;
  avatarUrl: string;
  status: 'Active' | 'Inactive' | 'Pending' | 'Cancelled';
  forcePasswordChange?: boolean;
  organizationId?: string;
};

export type Organization = {
  id: string;
  name: string;
  taxId?: string; // NIT
  createdAt?: any; // serverTimestamp
  subscriptionEnds: string; // YYYY-MM-DD
  modules: {
    hr: boolean;
    academics: boolean;
    finance: boolean;
    students: boolean;
    inventory: boolean;
    sales: boolean;
    reports: boolean;
    landingPage: boolean;
    communications: boolean;
  };
  themeColors?: ThemeColors;
  landingPageConfig?: LandingPageConfig;
  planType?: string;
  contractStartDate?: string;
  contractEndDate?: string;
  contractStatus?: 'Active' | 'OnTrial' | 'Expired' | 'Cancelled' | 'Pending';
};

export type LandingPageConfig = {
  title: string;
  description: string;
};

export type ThemeColors = {
  primary: string;
  background: string;
  accent: string;
};

// --- Odontology Module Types ---

export type OdontogramCondition =
  | 'sano'
  | 'caries'
  | 'restauracion'
  | 'ausente'
  | 'extraccion'
  | 'corona'
  | 'implante'
  | 'sellante';

export type ToothState = {
  status: OdontogramCondition;
  condition?: string;
};

export type OdontogramState = {
  [toothId: string]: ToothState;
};

export type Patient = {
  id: string;
  name: string;
  identificationNumber: string;
  age: number;
  gender: 'Masculino' | 'Femenino' | 'Otro';
  phone?: string;
  email?: string;
  department?: string;
  municipality?: string;

  // Medical History
  allergies?: string;
  currentMedications?: string;
  chronicDiseases?: string;
  surgeries?: string;
  habits?: string;

  // Odontology specific
  odontogramState?: OdontogramState;
  generalNotes?: string;
  odontogramScreenshot?: string; // Add this line
  
  organizationId: string;
  createdAt?: any;
  updatedAt?: any;
};

// --- CRM Specific Types ---

export type CustomerType = 'Prospecto' | 'Activo' | 'Inactivo' | 'Potencial';
export type IdentificationType = 'CC' | 'CE' | 'NIT' | 'Pasaporte';
export type CompanySize = 'microempresa' | 'pequeña' | 'mediana' | 'grande';

export type Customer = {
  id: string;
  isBusiness: boolean; // Persona Natural (false) o Jurídica (true)
  identificationType: IdentificationType;
  identificationNumber: string;
  name: string; // Razón Social for business, Nombre Completo for natural person
  customerType: CustomerType;
  // RF-005 Segmentation
  department?: string;
  municipality?: string;
  economicActivity?: string; // CIIU Code
  companySize?: CompanySize;
  acquisitionChannel?: string;
  // End RF-005
  organizationId: string;
  createdAt?: any;
  updatedAt?: any;
};

export type OpportunityStatus = 'Calificación' | 'Propuesta' | 'Negociación' | 'Ganada' | 'Perdida';

export type Opportunity = {
  id: string;
  name: string;
  customerId: string;
  customerName: string;
  estimatedValue: number;
  status: OpportunityStatus;
  assignedToId: string; // User ID of the salesperson
  assignedToName: string;
  organizationId: string;
  createdAt?: any;
  updatedAt?: any;
  closedAt?: any; // Timestamp for when it's won or lost
};

export type InteractionType = 'Llamada' | 'Reunión' | 'Correo';

export type Interaction = {
    id: string;
    customerId: string;
    type: InteractionType;
    date: string; // ISO 8601 format
    notes: string;
    userId: string; // ID of the user who logged the interaction
    userName: string;
    organizationId: string;
    createdAt?: any;
};

export type CrmSettings = {
  acquisitionChannels: string[];
};


// --- HR Module Types ---

export type Employee = {
  id: string;
  name: string;
  email: string;
  position: string;
  role: UserRole;
  status: 'Active' | 'Inactive';
  salary: number;
  contractedHours?: number; // Horas contratadas al mes
  avatarUrl?: string;
  organizationId?: string;
  bankName?: string;
  accountNumber?: string;
  eps?: string;
  arl?: string;
  createdAt?: any;
  updatedAt?: any;
};

export type PayrollStatus = 'Pending' | 'Paid' | 'Cancelled';
export type PayrollNoveltyType = 'bonus' | 'deduction';
export type PayrollNovelty = {
    id: string;
    description: string;
    amount: number;
    type: PayrollNoveltyType;
};


export type Payroll = {
  id: string;
  employeeId: string;
  employeeName: string;
  period: string; // e.g., "2024-05-01 to 2024-05-15"
  baseSalary: number;
  workedHours: number; // Horas trabajadas en el período
  contractedHours: number; // Horas contratadas para el período
  deductions: PayrollNovelty[]; // For manual/other deductions
  bonuses: PayrollNovelty[]; // For manual/other bonuses
  legalDeductions: PayrollNovelty[]; // For fixed legal deductions
  totalDeductions: number;
  totalBonuses: number;
  netPay: number;
  status: PayrollStatus;
  paymentDate?: string;
  organizationId: string;
};

export type Attendance = {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string; // YYYY-MM-DD
  checkIn: string | null; // HH:mm
  checkOut: string | null; // HH:mm
  status: 'Presente' | 'Ausente' | 'Tarde' | 'Jornada Finalizada';
  notes?: string;
  organizationId: string;
};

// --- Academics Module Types ---
export type Student = {
  id: string;
  name: string;
  email: string;
  grade: string;
  status: 'Active' | 'Inactive';
  avatarUrl?: string;
  organizationId: string;
};

export type Subject = {
  id: string;
  name: string;
  teacherId: string;
  teacherName: string;
  grade: string;
  organizationId: string;
};

export type Grade = {
    id: string;
    studentId: string;
    studentName: string;
    subjectId: string;
    subjectName: string;
    grade: number;
    notes?: string;
    date: string; // YYYY-MM-DD
    organizationId: string;
}

export type Schedule = {
    id: string;
    subjectId: string;
    subjectName: string;
    teacherId: string;
    teacherName: string;
    dayOfWeek: 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado' | 'Domingo';
    startTime: string; // "HH:mm"
    endTime: string; // "HH:mm"
    classroom: string;
    modality: 'Presencial' | 'Virtual' | 'Híbrido';
    organizationId: string;
}


export type LessonPlan = {
  id: string;
  title: string;
  subject: string;
  teacher: string;
  date: string; // YYYY-MM-DD
  objectives: string[];
  organizationId: string;
};

export type VideoRecording = {
  id: string;
  title: string;
  subject: string;
  date: string;
  url: string;
  summary?: string;
  organizationId: string;
};

export type AcademicPeriod = {
  id: string;
  name: string; // e.g., "Semestre 2024-1"
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  isActive: boolean;
  organizationId: string;
};

export type GradingActivity = {
  id: string;
  name: string; // e.g., "Examen Parcial", "Taller"
  percentage: number;
  organizationId: string;
};

export type AcademicAttendance = {
    id: string;
    studentId: string;
    studentName: string;
    subjectId: string;
    date: string; // YYYY-MM-DD
    checkInTime: string; // HH:mm
    status: 'Presente' | 'Ausente' | 'Tarde';
    organizationId: string;
}


// --- Finance Module Types ---
export type AccountType = 'Activo' | 'Pasivo' | 'Patrimonio' | 'Ingreso' | 'Gasto';
export type Account = {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  isParent: boolean;
  parentCode?: string;
  balance: number;
  organizationId: string;
};

export type JournalEntry = {
  id: string;
  date: string; // YYYY-MM-DD
  description: string;
  transactions: {
    accountId: string;
    accountCode: string;
    accountName: string;
    debit: number;
    credit: number;
  }[];
  organizationId: string;
  createdAt?: any;
};

export type Invoice = {
  id: string;
  customerName: string;
  date: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  total: number;
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue';
  items: {
    description: string;
    quantity: number;
    price: number;
  }[];
  organizationId: string;
};

// --- Inventory & Sales Module Types ---
export type Warehouse = {
    id: string;
    name: string;
    location: string;
    organizationId: string;
};

export type ProductCategory = {
  id: string;
  name: string;
  organizationId: string;
  createdAt?: any;
};

export type Product = {
    id: string;
    sku: string;
    name: string;
    description: string;
    costPrice: number;
    salePrice: number;
    category: string;
    imageUrl?: string;
    stockLevels: { [warehouseId: string]: number };
    organizationId: string;
};

export type SaleItem = {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    costPrice: number; // Stored at time of sale for profitability calculation
};

export type Sale = {
    id: string;
    date: string; // YYYY-MM-DD
    items: SaleItem[];
    subtotal: number;
    tax: number;
    total: number;
    paymentMethod: 'Cash' | 'Card' | 'Transfer';
    warehouseId: string;
    warehouseName: string;
    organizationId: string;
    createdAt?: any;
};

// --- Communications Module Types ---
export type TemplateType = 'whatsapp' | 'email';

export type Template = {
  id: string;
  name: string;
  type: TemplateType;
  subject?: string; // For emails
  content: string;
  organizationId: string;
  createdAt?: any;
};

export type Campaign = {
  id: string;
  name: string;
  templateId: string;
  targetAudience: 'all' | 'prospects' | 'active'; // Simplified for now
  status: 'draft' | 'scheduled' | 'sent';
  scheduledAt?: any;
  sentAt?: any;
  organizationId: string;
  createdAt?: any;
};

export type CommunicationsSettings = {
  defaultEmailFooter: string;
};


// --- System Types ---

export type SystemSettings = {
  id?: string;
  taxRate: number;
  accountingSector?: 'comercial' | 'financiero' | 'salud' | 'solidario';
  defaultCashAccountId?: string;
  defaultSalesRevenueAccountId?: string;
  defaultTaxPayableAccountId?: string;
  defaultInventoryAccountId?: string;
  defaultCostOfGoodsSoldAccountId?: string;
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: any; // serverTimestamp
};

export type UserPresence = {
    uid: string;
    userName: string;
    role: UserRole;
    organizationId: string | null;
    organizationName: string;
    lastSeen: any; // serverTimestamp
};

export type ChatCategory = 'Soporte' | 'Admin' | 'Ventas' | 'Dudas';

export type ChatRoom = {
    id: string;
    name: string;
    type: 'organization' | 'support';
    category: ChatCategory;
    organizationId: string;
    memberIds: string[];
    createdAt: any;
    lastMessage?: {
        text: string;
        timestamp: any; // serverTimestamp
    };
};

export type ChatMessage = {
    id: string;
    roomId: string;
    senderId: string;
    senderName: string;
    senderAvatarUrl?: string;
    text: string;
    timestamp: any; // serverTimestamp, but will be a Timestamp object on client
};

// --- System Audit Types ---
export type DeletedUserLog = {
  id: string;
  deletedUid: string;
  email: string;
  name: string;
  role: UserRole;
  organizationId?: string;
  deletedAt: any; // serverTimestamp
};
