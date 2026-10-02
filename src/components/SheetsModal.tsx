import React, { useState } from 'react';
import {
  FileSpreadsheet,
  ExternalLink,
  UploadCloud,
  DownloadCloud,
  X,
  CheckCircle,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { DashboardData } from '../types';
import {
  createGoogleSheetSummary,
  updateGoogleSheetValues,
  fetchGoogleSheetData,
  CreateSheetResult,
} from '../services/sheetsService';
import { ConfirmationModal } from './ConfirmationModal';

interface SheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  dashboardData: DashboardData;
  accessToken: string | null;
  onLogin: () => void;
  onDataImported?: (newData: DashboardData) => void;
}

export const SheetsModal: React.FC<SheetsModalProps> = ({
  isOpen,
  onClose,
  dashboardData,
  accessToken,
  onLogin,
  onDataImported,
}) => {
  const [createdSheet, setCreatedSheet] = useState<CreateSheetResult | null>(null);
  const [existingSheetId, setExistingSheetId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  // Mandatory confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    action: async () => {},
  });

  if (!isOpen) return null;

  const handleCreateNewSheet = async () => {
    if (!accessToken) {
      onLogin();
      return;
    }

    setIsProcessing(true);
    setStatusMessage({ type: 'info', text: 'กำลังสร้าง Google Sheet ใหม่ใน Google Drive...' });

    try {
      const result = await createGoogleSheetSummary(accessToken, dashboardData);
      setCreatedSheet(result);
      setExistingSheetId(result.spreadsheetId);
      setStatusMessage({
        type: 'success',
        text: `สร้าง Google Sheet สำเร็จแล้ว! พร้อมข้อมูลสรุป 11 ขั้นตอน`,
      });
    } catch (err: any) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'เกิดข้อผิดพลาดในการสร้าง Google Sheet',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const promptSyncToExistingSheet = () => {
    if (!existingSheetId.trim()) {
      setStatusMessage({
        type: 'error',
        text: 'กรุณากรอก Spreadsheet ID หรือ URL ก่อนดำเนินการ',
      });
      return;
    }

    // Extract ID if full URL pasted
    let cleanId = existingSheetId.trim();
    const match = cleanId.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
      cleanId = match[1];
    }

    // MANDATORY USER CONFIRMATION per Workspace Integration Skill
    setConfirmDialog({
      isOpen: true,
      title: 'ยืนยันการบันทึกทับข้อมูลใน Google Sheet',
      message: `คุณต้องการบันทึกข้อมูลสรุปทั้ง 11 ขั้นตอนลงใน Google Sheet (ID: ${cleanId.slice(
        0,
        12
      )}...) หรือไม่?\n\nการดำเนินการนี้จะอัปเดตค่าตัวเลขในแท็บ 'สรุป 11 ขั้นตอน'`,
      action: async () => {
        setIsProcessing(true);
        try {
          await updateGoogleSheetValues(accessToken!, cleanId, dashboardData);
          setStatusMessage({
            type: 'success',
            text: 'อัปเดตข้อมูลลง Google Sheet เรียบร้อยแล้ว!',
          });
        } catch (err: any) {
          console.error(err);
          setStatusMessage({
            type: 'error',
            text: err.message || 'ไม่สามารถอัปเดต Google Sheet ได้',
          });
        } finally {
          setIsProcessing(false);
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-white/10 backdrop-blur-xs">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base">เชื่อมต่อและส่งออก Google Sheets</h3>
                <p className="text-xs text-emerald-100">
                  ซิงค์ข้อมูลสรุป 11 ขั้นตอนและ 4 กลุ่มผู้กู้ยืมแบบเรียลไทม์
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {!accessToken && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-800 flex-1">
                  <p className="font-semibold">ต้องการการเข้าสู่ระบบ Google Workspace</p>
                  <p className="mt-1">
                    กรุณาลงชื่อเข้าใช้ด้วยบัญชี Google (เช่น @go.buu.ac.th) เพื่ออนุญาตให้ระบบเข้าถึงและสร้าง Google Sheets ใน Google Drive ของคุณ
                  </p>
                  <button
                    onClick={onLogin}
                    className="mt-3 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold transition-colors cursor-pointer"
                  >
                    เข้าสู่ระบบด้วย Google
                  </button>
                </div>
              </div>
            )}

            {/* Notification message */}
            {statusMessage && (
              <div
                className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
                  statusMessage.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : statusMessage.type === 'error'
                    ? 'bg-rose-50 border-rose-200 text-rose-800'
                    : 'bg-blue-50 border-blue-200 text-blue-800'
                }`}
              >
                {statusMessage.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{statusMessage.text}</span>
              </div>
            )}

            {/* Action 1: Create New Sheet */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>สร้างสเปรดชีต Google Sheet ใหม่</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    ระบบจะสร้างตารางสรุป 11 ขั้นตอน พร้อมสูตรคำนวณอัตโนมัติบน Google Drive ของคุณทันที
                  </p>
                </div>
                <button
                  onClick={handleCreateNewSheet}
                  disabled={isProcessing || !accessToken}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50 transition-all shrink-0 cursor-pointer"
                >
                  {isProcessing ? 'กำลังดำเนินการ...' : 'สร้าง Sheet ใหม่'}
                </button>
              </div>

              {createdSheet && (
                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-xs text-slate-600 font-medium truncate max-w-[300px]">
                    ✓ {createdSheet.title}
                  </span>
                  <a
                    href={createdSheet.spreadsheetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
                  >
                    <span>เปิด Google Sheet</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            {/* Action 2: Existing Sheet Sync */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <UploadCloud className="w-4 h-4 text-blue-600" />
                <span>ซิงค์ข้อมูลลงใน Google Sheet เดิม</span>
              </h4>
              <p className="text-xs text-slate-500">
                ใส่ Spreadsheet ID หรือ URL ของไฟล์ที่มีอยู่แล้ว เพื่ออัปเดตข้อมูลล่าสุด
              </p>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://docs.google.com/spreadsheets/d/... หรือ ID"
                  value={existingSheetId}
                  onChange={(e) => setExistingSheetId(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={promptSyncToExistingSheet}
                  disabled={isProcessing || !accessToken}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold disabled:opacity-50 transition-colors shrink-0 cursor-pointer"
                >
                  ซิงค์ข้อมูล
                </button>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      </div>

      {/* Mandatory confirmation modal */}
      <ConfirmationModal
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmLabel="ยืนยันการบันทึก"
        cancelLabel="ยกเลิก"
        isLoading={isProcessing}
        onConfirm={confirmDialog.action}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />
    </>
  );
};
