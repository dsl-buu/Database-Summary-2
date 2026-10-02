import React from 'react';
import {
  FileText,
  Clock,
  Send,
  Building2,
  CheckCircle,
  TrendingUp,
  AlertCircle,
  Users,
} from 'lucide-react';
import { WorkflowStep, BORROWER_GROUPS } from '../types';

interface KpiCardsProps {
  steps: WorkflowStep[];
}

export const KpiCards: React.FC<KpiCardsProps> = ({ steps }) => {
  // Step 1: Received total
  const step1 = steps.find((s) => s.stepNumber === 1);
  const totalReceived = step1?.metrics[0]
    ? step1.metrics[0].oldBorrower +
      step1.metrics[0].newBorrower +
      step1.metrics[0].overCurriculum +
      step1.metrics[0].disqualified
    : 0;

  // Step 3: Remaining fixes on application
  const step3 = steps.find((s) => s.stepNumber === 3);
  const step3Remaining = step3?.metrics.find((m) => m.id === 'step3_remaining');
  const totalAppFixRemaining = step3Remaining
    ? step3Remaining.oldBorrower +
      step3Remaining.newBorrower +
      step3Remaining.overCurriculum +
      step3Remaining.disqualified
    : 0;

  // Step 9: Sent to bank
  const step9 = steps.find((s) => s.stepNumber === 9);
  const totalSentToBank = step9?.metrics[0]
    ? step9.metrics[0].oldBorrower +
      step9.metrics[0].newBorrower +
      step9.metrics[0].overCurriculum +
      step9.metrics[0].disqualified
    : 0;

  // Step 10: In review by bank (R1)
  const step10 = steps.find((s) => s.stepNumber === 10);
  const step10InReview = step10?.metrics.find((m) => m.id === 'step10_in_review');
  const totalInBankReview = step10InReview
    ? step10InReview.oldBorrower +
      step10InReview.newBorrower +
      step10InReview.overCurriculum +
      step10InReview.disqualified
    : 0;

  // Step 11: Approved completely
  const step11 = steps.find((s) => s.stepNumber === 11);
  const step11Approved = step11?.metrics.find((m) => m.id === 'step11_approved');
  const totalApproved = step11Approved
    ? step11Approved.oldBorrower +
      step11Approved.newBorrower +
      step11Approved.overCurriculum +
      step11Approved.disqualified
    : 0;

  // Completion percentage based on eligible applicants (totalReceived - disqualified)
  const disqualifiedCount = step1?.metrics[0]?.disqualified || 0;
  const eligibleApplicants = Math.max(1, totalReceived - disqualifiedCount);
  const completionRate = Math.min(100, Math.round((totalApproved / eligibleApplicants) * 100));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Card 1: Total Received */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            คำขอกู้ยืมทั้งหมด
          </span>
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
            {totalReceived.toLocaleString('th-TH')}
            <span className="text-xs font-normal text-slate-500 ml-1.5">ราย</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center text-blue-700 font-medium">
              เก่า: {step1?.metrics[0]?.oldBorrower || 0}
            </span>
            <span>•</span>
            <span className="inline-flex items-center text-emerald-700 font-medium">
              ใหม่: {step1?.metrics[0]?.newBorrower || 0}
            </span>
            <span>•</span>
            <span className="inline-flex items-center text-amber-700 font-medium">
              เกิน: {step1?.metrics[0]?.overCurriculum || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Card 2: Pending Revisions */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            คงค้างรอแก้ไขคำขอ
          </span>
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl lg:text-3xl font-bold text-amber-600 tracking-tight">
            {totalAppFixRemaining.toLocaleString('th-TH')}
            <span className="text-xs font-normal text-slate-500 ml-1.5">ราย</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500 truncate">
            ผู้กู้ที่ยังไม่ส่งเล่มคำขอฉบับแก้ไข
          </p>
        </div>
      </div>

      {/* Card 3: Sent to Bank */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            ส่งเอกสารให้ธนาคาร
          </span>
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Send className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl lg:text-3xl font-bold text-indigo-600 tracking-tight">
            {totalSentToBank.toLocaleString('th-TH')}
            <span className="text-xs font-normal text-slate-500 ml-1.5">ราย</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500 truncate">
            คิดเป็น {Math.round((totalSentToBank / Math.max(1, totalReceived)) * 100)}% ของคำขอทั้งหมด
          </p>
        </div>
      </div>

      {/* Card 4: Bank In-Review (R1) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            ธนาคารตรวจ (รอบ 1)
          </span>
          <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl lg:text-3xl font-bold text-sky-600 tracking-tight">
            {totalInBankReview.toLocaleString('th-TH')}
            <span className="text-xs font-normal text-slate-500 ml-1.5">ราย</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500 truncate">
            อยู่ระหว่างเจ้าหน้าที่ธนาคารพิจารณา
          </p>
        </div>
      </div>

      {/* Card 5: Approved Completely */}
      <div className="bg-white rounded-2xl p-5 border border-emerald-200 bg-gradient-to-b from-white to-emerald-50/30 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
            ตรวจสอบผ่านสมบูรณ์
          </span>
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl lg:text-3xl font-extrabold text-emerald-700 tracking-tight">
            {totalApproved.toLocaleString('th-TH')}
            <span className="text-xs font-normal text-slate-500 ml-1.5">ราย</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-emerald-800 font-semibold">
            <span>ความสำเร็จ</span>
            <span>{completionRate}%</span>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
