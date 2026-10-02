import React, { useState } from 'react';
import { WorkflowStep, BORROWER_GROUPS, BorrowerGroupKey } from '../types';
import { BarChart3, Filter, PieChart, Layers, ArrowRight } from 'lucide-react';

interface VisualizationsProps {
  steps: WorkflowStep[];
}

export const Visualizations: React.FC<VisualizationsProps> = ({ steps }) => {
  const [selectedMilestoneStep, setSelectedMilestoneStep] = useState<number>(1);

  // Key milestone steps for comparison chart
  const milestoneStepNumbers = [1, 4, 5, 8, 9, 11];
  const milestoneSteps = steps.filter((s) => milestoneStepNumbers.includes(s.stepNumber));

  // Current selected step for deep dive
  const activeStep = steps.find((s) => s.stepNumber === selectedMilestoneStep) || steps[0];
  const activeMetric = activeStep.metrics[0];

  const totalInActiveStep =
    activeMetric.oldBorrower +
    activeMetric.newBorrower +
    activeMetric.overCurriculum +
    activeMetric.disqualified;

  // Max value across all milestone steps for proportional bar scaling
  const maxVal = Math.max(
    ...milestoneSteps.map((s) => {
      const m = s.metrics[0];
      return Math.max(m.oldBorrower, m.newBorrower, m.overCurriculum, m.disqualified);
    }),
    1
  );

  // Funnel steps calculation
  const funnelSteps = [
    { num: 1, label: '1. รับเอกสารคำขอ', val: steps[0]?.metrics[0]?.oldBorrower + steps[0]?.metrics[0]?.newBorrower + steps[0]?.metrics[0]?.overCurriculum + steps[0]?.metrics[0]?.disqualified || 1 },
    { num: 4, label: '4. ตรวจสอบผ่าน', val: steps[3]?.metrics[0]?.oldBorrower + steps[3]?.metrics[0]?.newBorrower + steps[3]?.metrics[0]?.overCurriculum || 0 },
    { num: 5, label: '5. ส่งแบบเบิกเงิน', val: steps[4]?.metrics[0]?.oldBorrower + steps[4]?.metrics[0]?.newBorrower + steps[4]?.metrics[0]?.overCurriculum || 0 },
    { num: 9, label: '9. ส่งให้ธนาคาร', val: steps[8]?.metrics[0]?.oldBorrower + steps[8]?.metrics[0]?.newBorrower + steps[8]?.metrics[0]?.overCurriculum || 0 },
    { num: 11, label: '11. ผ่านสมบูรณ์', val: steps[10]?.metrics[0]?.oldBorrower + steps[10]?.metrics[0]?.newBorrower + steps[10]?.metrics[0]?.overCurriculum || 0 },
  ];
  const baseCount = funnelSteps[0].val || 1;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Chart 1: Group Comparison Bar Chart (7 cols on lg) */}
      <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">
                    กราฟเปรียบเทียบ 4 กลุ่มผู้กู้ยืมในแต่ละขั้นตอน
                  </h3>
                  <p className="text-xs text-slate-500">
                    วิเคราะห์จำนวนผู้กู้แยกตามประเภทในหมุดหมายสำคัญ
                  </p>
                </div>
              </div>
            </div>

            {/* Step selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">ขั้นตอน:</span>
              <select
                value={selectedMilestoneStep}
                onChange={(e) => setSelectedMilestoneStep(Number(e.target.value))}
                className="text-xs font-semibold py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 cursor-pointer focus:ring-2 focus:ring-blue-500"
              >
                {milestoneSteps.map((s) => (
                  <option key={s.stepNumber} value={s.stepNumber}>
                    ขั้นที่ {s.stepNumber}: {s.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Current step breakdown header */}
          <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-500">ขั้นตอนที่กำลังดู:</span>
              <p className="font-bold text-slate-800 text-sm">
                ขั้นที่ {activeStep.stepNumber}: {activeStep.title} ({activeMetric.label})
              </p>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-semibold text-slate-500">ยอดรวมขั้นนี้:</span>
              <p className="font-extrabold text-blue-700 text-base tabular-nums">
                {totalInActiveStep.toLocaleString('th-TH')} คน
              </p>
            </div>
          </div>

          {/* Comparative horizontal bars */}
          <div className="mt-6 space-y-4">
            {BORROWER_GROUPS.map((group) => {
              const count = activeMetric[group.id];
              const pctOfStep = totalInActiveStep > 0 ? Math.round((count / totalInActiveStep) * 100) : 0;
              const barWidth = Math.max(4, Math.round((count / Math.max(1, maxVal)) * 100));

              return (
                <div key={group.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: group.color }}
                      />
                      <span className="font-semibold text-slate-700">{group.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 tabular-nums">
                        {count.toLocaleString('th-TH')} คน
                      </span>
                      <span className="text-slate-400 font-medium text-[11px]">
                        ({pctOfStep}%)
                      </span>
                    </div>
                  </div>

                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${barWidth}%`,
                        backgroundColor: group.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Milestone Quick Toggles */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap gap-1.5">
          <span className="text-[11px] text-slate-400 self-center mr-1">ขั้นตอนหลัก:</span>
          {milestoneSteps.map((s) => (
            <button
              key={s.stepNumber}
              onClick={() => setSelectedMilestoneStep(s.stepNumber)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                selectedMilestoneStep === s.stepNumber
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ขั้นที่ {s.stepNumber}
            </button>
          ))}
        </div>
      </div>

      {/* Chart 2: Workflow Funnel & Progress (5 cols on lg) */}
      <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">
                อัตราการไหลของกระบวนการ (Loan Pipeline Funnel)
              </h3>
              <p className="text-xs text-slate-500">
                สัดส่วนการผ่านแต่ละด่านจากลงรับสู่การอนุมัติสมบูรณ์
              </p>
            </div>
          </div>

          {/* Funnel visualization */}
          <div className="mt-5 space-y-3">
            {funnelSteps.map((f, idx) => {
              const pctFromStart = Math.round((f.val / baseCount) * 100);
              const isLast = idx === funnelSteps.length - 1;

              return (
                <div key={f.num} className="relative">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-700">{f.label}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900 tabular-nums">
                        {f.val.toLocaleString('th-TH')} ราย
                      </span>
                      <span
                        className={`text-[11px] font-bold px-1.5 py-0.2 rounded-sm ${
                          isLast
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {pctFromStart}%
                      </span>
                    </div>
                  </div>

                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isLast
                          ? 'bg-emerald-500'
                          : idx === 0
                          ? 'bg-blue-600'
                          : 'bg-indigo-500'
                      }`}
                      style={{ width: `${Math.max(5, pctFromStart)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Funnel Note */}
        <div className="mt-6 p-3.5 bg-emerald-50/60 border border-emerald-100 rounded-xl text-xs text-emerald-900">
          <div className="font-bold flex items-center gap-1.5 mb-1 text-emerald-800">
            <span>สรุปประสิทธิภาพกระบวนการ:</span>
          </div>
          <p className="leading-relaxed text-[11px] text-emerald-700">
            จากคำขอทั้งหมด {baseCount.toLocaleString('th-TH')} ราย ได้รับการอนุมัติผ่านสมบูรณ์แล้ว{' '}
            {funnelSteps[4].val.toLocaleString('th-TH')} ราย คิดเป็น{' '}
            <span className="font-bold underline">
              {Math.round((funnelSteps[4].val / baseCount) * 100)}%
            </span>{' '}
            ของกลุ่มผู้มีสิทธิ์กู้ยืม
          </p>
        </div>
      </div>
    </div>
  );
};
