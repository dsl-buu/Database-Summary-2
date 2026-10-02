export type BorrowerGroupKey = 'oldBorrower' | 'newBorrower' | 'overCurriculum' | 'disqualified';

export interface BorrowerGroup {
  id: BorrowerGroupKey;
  label: string;
  shortLabel: string;
  description: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  borderCol: string;
}

export const BORROWER_GROUPS: BorrowerGroup[] = [
  {
    id: 'oldBorrower',
    label: 'กลุ่มที่ 1: ผู้กู้รายเก่า',
    shortLabel: 'ผู้กู้รายเก่า',
    description: 'ผู้กู้ยืมต่อเนื่องจากปีก่อนหน้า เลื่อนชั้นปีตามหลักสูตร',
    color: '#2563eb', // blue
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-700',
    borderCol: 'border-blue-200',
  },
  {
    id: 'newBorrower',
    label: 'กลุ่มที่ 2: ผู้กู้รายใหม่',
    shortLabel: 'ผู้กู้รายใหม่',
    description: 'ผู้กู้ยืมที่เริ่มกู้ครั้งแรกในระดับอุดมศึกษา',
    color: '#059669', // emerald
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    borderCol: 'border-emerald-200',
  },
  {
    id: 'overCurriculum',
    label: 'กลุ่มที่ 3: ผู้กู้เกินหลักสูตร',
    shortLabel: 'ผู้กู้เกินหลักสูตร',
    description: 'ผู้กู้ที่ศึกษาเกินระยะเวลาตามแผนการเรียนของหลักสูตร',
    color: '#d97706', // amber
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-700',
    borderCol: 'border-amber-200',
  },
  {
    id: 'disqualified',
    label: 'กลุ่มที่ 4: ไม่ผ่านคุณสมบัติ',
    shortLabel: 'ไม่ผ่านคุณสมบัติ',
    description: 'ผู้ยื่นคำขอแต่ขาดคุณสมบัติตามเกณฑ์ หรือสละสิทธิ์กู้ยืม',
    color: '#dc2626', // rose / red
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-700',
    borderCol: 'border-rose-200',
  },
];

export interface MetricRow {
  id: string;
  label: string;
  subLabel?: string;
  isSubMetric?: boolean;
  oldBorrower: number;
  newBorrower: number;
  overCurriculum: number;
  disqualified: number;
}

export interface WorkflowStep {
  stepNumber: number;
  title: string;
  subtitle: string;
  category: 'application' | 'disbursement' | 'bank' | 'completion';
  metrics: MetricRow[];
}

export interface DashboardData {
  academicYear: string;
  term: string;
  updatedAt: string;
  steps: WorkflowStep[];
}

export interface GoogleUserInfo {
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  uid: string;
}
