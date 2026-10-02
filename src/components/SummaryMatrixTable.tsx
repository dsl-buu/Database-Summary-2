import React from 'react';
import {
  WorkflowStep,
  BorrowerGroupKey,
  MetricRow,
  BORROWER_GROUPS,
} from '../types';
import { Edit3, CheckCircle2, Clock, AlertTriangle, ArrowRight } from 'lucide-react';

interface SummaryMatrixTableProps {
  steps: WorkflowStep[];
  onEditStep: (step: WorkflowStep) => void;
  selectedGroupFilter?: BorrowerGroupKey | 'all';
}

export const SummaryMatrixTable: React.FC<SummaryMatrixTableProps> = ({
  steps,
  onEditStep,
  selectedGroupFilter = 'all',
}) => {
  const getCategoryBadge = (category: WorkflowStep['category']) => {
    switch (category) {
      case 'application':
        return {
          label: 'หมวดที่ 1: คำขอกู้ยืม',
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
        };
      case 'disbursement':
        return {
          label: 'หมวดที่ 2: การเบิกเงิน',
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        };
      case 'bank':
        return {
          label: 'หมวดที่ 3: ธนาคาร',
          bg: 'bg-purple-50 text-purple-700 border-purple-200',
        };
      case 'completion':
        return {
          label: 'หมวดที่ 4: ผลสำเร็จ',
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
        };
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Table Header toolbar */}
      <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <span>ตารางสรุปหลัก (Summary Matrix Table)</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-200/70 text-slate-700">
              11 ขั้นตอน × 4 กลุ่ม
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            แสดงจำนวนคนในแต่ละขั้นตอนการดำเนินงาน จำแนกตามสถานะผู้กู้ยืมและยอดรวมสะสม
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> กลุ่ม 1: เก่า
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> กลุ่ม 2: ใหม่
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> กลุ่ม 3: เกิน
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> กลุ่ม 4: ไม่ผ่าน
          </span>
        </div>
      </div>

      {/* Main Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-slate-100/80 text-slate-700 border-b border-slate-200 text-xs uppercase tracking-wider font-semibold">
              <th className="py-3.5 px-4 w-[28%] min-w-[240px]">
                ขั้นตอนการดำเนินงาน (Workflow Steps)
              </th>
              <th className="py-3.5 px-3 w-[15%] min-w-[140px]">ตัวชี้วัด / สถานะ</th>
              <th className="py-3.5 px-3 text-right bg-blue-50/40 text-blue-900 border-l border-slate-200">
                กลุ่ม 1: ผู้กู้รายเก่า
              </th>
              <th className="py-3.5 px-3 text-right bg-emerald-50/40 text-emerald-900 border-l border-slate-200">
                กลุ่ม 2: ผู้กู้รายใหม่
              </th>
              <th className="py-3.5 px-3 text-right bg-amber-50/40 text-amber-900 border-l border-slate-200">
                กลุ่ม 3: ผู้กู้เกินหลักสูตร
              </th>
              <th className="py-3.5 px-3 text-right bg-rose-50/40 text-rose-900 border-l border-slate-200">
                กลุ่ม 4: ไม่ผ่านคุณสมบัติ
              </th>
              <th className="py-3.5 px-4 text-right bg-slate-900 text-white font-bold border-l border-slate-700">
                ยอดรวมทั้งหมด (Total)
              </th>
              <th className="py-3.5 px-3 text-center w-[80px]">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-xs sm:text-sm">
            {steps.map((step) => {
              const catBadge = getCategoryBadge(step.category);
              const totalRowSpan = step.metrics.length;

              return (
                <React.Fragment key={`step-${step.stepNumber}`}>
                  {step.metrics.map((metric, metricIdx) => {
                    const totalCount =
                      metric.oldBorrower +
                      metric.newBorrower +
                      metric.overCurriculum +
                      metric.disqualified;

                    const isFirstMetric = metricIdx === 0;

                    return (
                      <tr
                        key={metric.id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          isFirstMetric ? 'bg-white' : 'bg-slate-50/40'
                        }`}
                      >
                        {/* Step Name (rendered once per step if multiple metrics) */}
                        {isFirstMetric && (
                          <td
                            rowSpan={totalRowSpan}
                            className="py-3.5 px-4 align-top border-r border-slate-200 bg-white"
                          >
                            <div className="flex items-start gap-2.5">
                              <span className="w-6 h-6 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                                {step.stepNumber}
                              </span>
                              <div>
                                <span
                                  className={`inline-block px-2 py-0.5 rounded-sm text-[10px] font-semibold border mb-1 ${catBadge.bg}`}
                                >
                                  {catBadge.label}
                                </span>
                                <h3 className="font-bold text-slate-800 text-sm leading-snug">
                                  {step.title}
                                </h3>
                                <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">
                                  {step.subtitle}
                                </p>
                              </div>
                            </div>
                          </td>
                        )}

                        {/* Metric Label / Sub-indicator */}
                        <td className="py-3 px-3 align-middle border-r border-slate-200">
                          <div className="flex items-center gap-1.5">
                            {metric.isSubMetric && (
                              <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                            )}
                            <div>
                              <span
                                className={`font-semibold ${
                                  metric.isSubMetric
                                    ? 'text-slate-700 text-xs'
                                    : 'text-slate-800'
                                }`}
                              >
                                {metric.label}
                              </span>
                              {metric.subLabel && (
                                <p className="text-[10px] text-slate-400 leading-tight">
                                  {metric.subLabel}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Old Borrower */}
                        <td className="py-3 px-3 text-right font-medium text-slate-700 bg-blue-50/20 border-r border-slate-200 tabular-nums">
                          {metric.oldBorrower.toLocaleString('th-TH')}
                        </td>

                        {/* New Borrower */}
                        <td className="py-3 px-3 text-right font-medium text-slate-700 bg-emerald-50/20 border-r border-slate-200 tabular-nums">
                          {metric.newBorrower.toLocaleString('th-TH')}
                        </td>

                        {/* Over Curriculum */}
                        <td className="py-3 px-3 text-right font-medium text-slate-700 bg-amber-50/20 border-r border-slate-200 tabular-nums">
                          {metric.overCurriculum.toLocaleString('th-TH')}
                        </td>

                        {/* Disqualified */}
                        <td className="py-3 px-3 text-right font-medium text-slate-700 bg-rose-50/20 border-r border-slate-200 tabular-nums">
                          {metric.disqualified.toLocaleString('th-TH')}
                        </td>

                        {/* TOTAL COLUMN */}
                        <td className="py-3 px-4 text-right font-bold text-slate-900 bg-slate-100 border-r border-slate-300 tabular-nums text-sm">
                          <span className="inline-block px-2 py-0.5 rounded-md bg-white border border-slate-200 shadow-2xs">
                            {totalCount.toLocaleString('th-TH')}
                          </span>
                        </td>

                        {/* Action Edit button */}
                        {isFirstMetric && (
                          <td
                            rowSpan={totalRowSpan}
                            className="py-3 px-3 text-center align-middle bg-white"
                          >
                            <button
                              onClick={() => onEditStep(step)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title={`แก้ไขข้อมูลขั้นตอนที่ ${step.stepNumber}`}
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Table Footer Guide */}
      <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>สูตรคำนวณ: ยอดรวมทั้งหมด (Total) = กลุ่ม 1 + กลุ่ม 2 + กลุ่ม 3 + กลุ่ม 4</span>
        </div>
        <div className="text-slate-400">
          * คลิกไอคอนรูปดินสอด้านขวาเพื่อแก้ไขตัวเลขในแต่ละขั้นตอน
        </div>
      </div>
    </div>
  );
};
