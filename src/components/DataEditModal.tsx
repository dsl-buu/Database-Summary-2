import React, { useState } from 'react';
import { WorkflowStep, MetricRow, BORROWER_GROUPS } from '../types';
import { X, Save, AlertCircle } from 'lucide-react';

interface DataEditModalProps {
  step: WorkflowStep | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedStep: WorkflowStep) => void;
}

export const DataEditModal: React.FC<DataEditModalProps> = ({
  step,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen || !step) return null;

  // Local copy of step metrics for editing
  const [metrics, setMetrics] = useState<MetricRow[]>(
    step.metrics.map((m) => ({ ...m }))
  );

  const handleValueChange = (
    metricIdx: number,
    field: 'oldBorrower' | 'newBorrower' | 'overCurriculum' | 'disqualified',
    val: string
  ) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    setMetrics((prev) => {
      const copy = [...prev];
      copy[metricIdx] = {
        ...copy[metricIdx],
        [field]: num,
      };
      return copy;
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...step,
      metrics,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <form onSubmit={handleSave}>
          {/* Header */}
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                {step.stepNumber}
              </span>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  แก้ไขข้อมูลขั้นตอนที่ {step.stepNumber}: {step.title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{step.subtitle}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {metrics.map((m, mIdx) => {
              const currentTotal =
                m.oldBorrower + m.newBorrower + m.overCurriculum + m.disqualified;

              return (
                <div
                  key={m.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{m.label}</h4>
                      {m.subLabel && (
                        <p className="text-xs text-slate-500">{m.subLabel}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-slate-400">คำนวณยอดรวม:</span>
                      <p className="font-bold text-slate-900 text-sm tabular-nums">
                        {currentTotal.toLocaleString('th-TH')} ราย
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    {/* Old Borrower */}
                    <div>
                      <label className="block text-xs font-semibold text-blue-800 mb-1">
                        ผู้กู้รายเก่า
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={m.oldBorrower}
                        onChange={(e) =>
                          handleValueChange(mIdx, 'oldBorrower', e.target.value)
                        }
                        className="w-full px-3 py-2 text-sm font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                      />
                    </div>

                    {/* New Borrower */}
                    <div>
                      <label className="block text-xs font-semibold text-emerald-800 mb-1">
                        ผู้กู้รายใหม่
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={m.newBorrower}
                        onChange={(e) =>
                          handleValueChange(mIdx, 'newBorrower', e.target.value)
                        }
                        className="w-full px-3 py-2 text-sm font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      />
                    </div>

                    {/* Over Curriculum */}
                    <div>
                      <label className="block text-xs font-semibold text-amber-800 mb-1">
                        เกินหลักสูตร
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={m.overCurriculum}
                        onChange={(e) =>
                          handleValueChange(mIdx, 'overCurriculum', e.target.value)
                        }
                        className="w-full px-3 py-2 text-sm font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                      />
                    </div>

                    {/* Disqualified */}
                    <div>
                      <label className="block text-xs font-semibold text-rose-800 mb-1">
                        ไม่ผ่านคุณสมบัติ
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={m.disqualified}
                        onChange={(e) =>
                          handleValueChange(mIdx, 'disqualified', e.target.value)
                        }
                        className="w-full px-3 py-2 text-sm font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer actions */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>บันทึกการเปลี่ยนแปลง</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
