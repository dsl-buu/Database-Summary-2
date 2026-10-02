/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { KpiCards } from './components/KpiCards';
import { SummaryMatrixTable } from './components/SummaryMatrixTable';
import { Visualizations } from './components/Visualizations';
import { DataEditModal } from './components/DataEditModal';
import { SheetsModal } from './components/SheetsModal';
import { INITIAL_DASHBOARD_DATA } from './data/defaultData';
import { DashboardData, WorkflowStep, GoogleUserInfo } from './types';
import {
  initAuth,
  googleSignIn,
  logoutGoogle,
  formatUserInfo,
  getAccessToken,
  setAccessToken,
} from './firebase';
import {
  LayoutDashboard,
  Table as TableIcon,
  BarChart3,
  Calendar,
  CheckCircle,
  FileSpreadsheet,
  AlertCircle,
  Download,
  Info,
  ShieldCheck,
} from 'lucide-react';

export default function App() {
  const [dashboardData, setDashboardData] = useState<DashboardData>(() => {
    // Check localStorage fallback for persistence
    const saved = localStorage.getItem('dsl_dashboard_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved data', e);
      }
    }
    return INITIAL_DASHBOARD_DATA;
  });

  const [userInfo, setUserInfo] = useState<GoogleUserInfo | null>(null);
  const [accessToken, setToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [editingStep, setEditingStep] = useState<WorkflowStep | null>(null);
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'all' | 'table' | 'charts'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize Firebase Auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setUserInfo(formatUserInfo(user));
        if (token) setToken(token);
      },
      () => {
        setUserInfo(null);
        setToken(null);
      }
    );
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Save to localStorage when dashboardData changes
  useEffect(() => {
    try {
      localStorage.setItem('dsl_dashboard_data', JSON.stringify(dashboardData));
    } catch (e) {
      console.warn('Storage save failed', e);
    }
  }, [dashboardData]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUserInfo(formatUserInfo(result.user));
        setToken(result.accessToken);
        showToast(`ยินดีต้อนรับคุณ ${result.user.displayName || result.user.email}`);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      showToast('การเข้าสู่ระบบถูกยกเลิกหรือขัดข้อง');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutGoogle();
      setUserInfo(null);
      setToken(null);
      showToast('ออกจากระบบเรียบร้อยแล้ว');
    } catch (err) {
      console.error(err);
    }
  };

  const handleStepSave = (updatedStep: WorkflowStep) => {
    setDashboardData((prev) => {
      const newSteps = prev.steps.map((s) =>
        s.stepNumber === updatedStep.stepNumber ? updatedStep : s
      );
      return {
        ...prev,
        steps: newSteps,
        updatedAt: new Date().toISOString(),
      };
    });
    showToast(`อัปเดตข้อมูลขั้นตอนที่ ${updatedStep.stepNumber} สำเร็จ`);
  };

  const handleReset = () => {
    if (window.confirm('คุณต้องการรีเซ็ตข้อมูลตัวเลขกลับเป็นค่าเริ่มต้นหรือไม่?')) {
      setDashboardData({
        ...INITIAL_DASHBOARD_DATA,
        updatedAt: new Date().toISOString(),
      });
      localStorage.removeItem('dsl_dashboard_data');
      showToast('รีเซ็ตข้อมูลกลับเป็นค่าเริ่มต้นแล้ว');
    }
  };

  const handleExportCsv = () => {
    // Generate CSV with UTF-8 BOM
    const bom = '\uFEFF';
    const rows: (string | number)[][] = [
      [`แดชบอร์ดสรุปข้อมูลกองทุนเงินให้กู้ยืมเพื่อการศึกษา (${dashboardData.term})`],
      [`วันที่ส่งออก: ${new Date().toLocaleString('th-TH')}`],
      [],
      [
        'ขั้นตอนที่',
        'ชื่อขั้นตอน',
        'ตัวชี้วัด',
        'กลุ่มที่ 1: ผู้กู้รายเก่า',
        'กลุ่มที่ 2: ผู้กู้รายใหม่',
        'กลุ่มที่ 3: ผู้กู้เกินหลักสูตร',
        'กลุ่มที่ 4: ไม่ผ่านคุณสมบัติ',
        'ยอดรวมทั้งหมด (Total)',
      ],
    ];

    dashboardData.steps.forEach((step) => {
      step.metrics.forEach((m) => {
        const total = m.oldBorrower + m.newBorrower + m.overCurriculum + m.disqualified;
        rows.push([
          step.stepNumber,
          step.title,
          m.label,
          m.oldBorrower,
          m.newBorrower,
          m.overCurriculum,
          m.disqualified,
          total,
        ]);
      });
    });

    const csvContent =
      bom +
      rows
        .map((r) =>
          r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')
        )
        .join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `รายงานสรุปกองทุนกู้ยืม_${dashboardData.term.replace(/\s+/g, '_')}_${Date.now()}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('ดาวน์โหลดไฟล์ CSV เรียบร้อยแล้ว');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        userInfo={userInfo}
        onLogin={handleLogin}
        onLogout={handleLogout}
        isLoggingIn={isLoggingIn}
        onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
        onExportCsv={handleExportCsv}
        onPrint={handlePrint}
        onReset={handleReset}
        currentTerm={dashboardData.term}
        onChangeTerm={(term) =>
          setDashboardData((prev) => ({ ...prev, term, updatedAt: new Date().toISOString() }))
        }
        lastUpdated={dashboardData.updatedAt}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Banner with Institution and Navigation Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-6 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs font-semibold">
                Database Summary System
              </span>
              <span className="text-xs text-slate-300">
                • {dashboardData.term}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold mt-1.5 tracking-tight">
              สถิติและสถานะการดำเนินงานกองทุนกู้ยืม
            </h2>
            <p className="text-xs sm:text-sm text-blue-100/90 mt-1 max-w-2xl font-light">
              รวบรวมข้อมูลตั้งแต่การลงรับเล่มคำขอ ตรวจสอบเอกสารเบิกเงิน ส่งธนาคาร จนถึงการอนุมัติโอนเงินเสร็จสมบูรณ์ 4 กลุ่มผู้กู้
            </p>
          </div>

          {/* View Tab Buttons */}
          <div className="flex items-center bg-blue-950/60 p-1.5 rounded-xl border border-blue-800/60 self-start md:self-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-blue-200 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>ทั้งหมด</span>
            </button>
            <button
              onClick={() => setActiveTab('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'table'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-blue-200 hover:text-white'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>ตารางสรุปหลัก</span>
            </button>
            <button
              onClick={() => setActiveTab('charts')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'charts'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-blue-200 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>กราฟวิเคราะห์</span>
            </button>
          </div>
        </div>

        {/* 1. KPI Cards */}
        <section aria-label="KPI Cards Summary">
          <KpiCards steps={dashboardData.steps} />
        </section>

        {/* 2. Visualizations (shown if 'all' or 'charts') */}
        {(activeTab === 'all' || activeTab === 'charts') && (
          <section aria-label="Visualizations">
            <Visualizations steps={dashboardData.steps} />
          </section>
        )}

        {/* 3. Summary Matrix Table (shown if 'all' or 'table') */}
        {(activeTab === 'all' || activeTab === 'table') && (
          <section aria-label="Summary Matrix Table">
            <SummaryMatrixTable
              steps={dashboardData.steps}
              onEditStep={(step) => setEditingStep(step)}
            />
          </section>
        )}

        {/* Borrower Groups Reference Legend */}
        <section className="bg-white rounded-2xl p-5 border border-slate-200 text-xs text-slate-600 space-y-3">
          <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600" />
            <span>คำอธิบาย 4 กลุ่มผู้กู้ยืม (Borrower Categories)</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100">
              <span className="font-bold text-blue-900 block mb-0.5">กลุ่มที่ 1: ผู้กู้รายเก่า</span>
              <p className="text-[11px] text-blue-700 leading-relaxed">
                ผู้กู้ยืมเงินต่อเนื่องจากปีการศึกษาก่อนหน้า เลื่อนชั้นปีตามแผนการเรียนปกติ
              </p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
              <span className="font-bold text-emerald-900 block mb-0.5">กลุ่มที่ 2: ผู้กู้รายใหม่</span>
              <p className="text-[11px] text-emerald-700 leading-relaxed">
                ผู้กู้ยืมที่เริ่มทำสัญญากู้ยืมเงินเป็นปีแรกในระดับอุดมศึกษา
              </p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100">
              <span className="font-bold text-amber-900 block mb-0.5">กลุ่มที่ 3: ผู้กู้เกินหลักสูตร</span>
              <p className="text-[11px] text-amber-700 leading-relaxed">
                ผู้กู้ที่ลงทะเบียนเรียนเกินจำนวนปีที่ระบุไว้ในหลักสูตรตามที่ได้รับอนุมัติ
              </p>
            </div>
            <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-100">
              <span className="font-bold text-rose-900 block mb-0.5">กลุ่มที่ 4: ไม่ผ่านคุณสมบัติ</span>
              <p className="text-[11px] text-rose-700 leading-relaxed">
                ผู้ยื่นคำขอที่เอกสารไม่สมบูรณ์ ขาดคุณสมบัติตามเกณฑ์ กยศ. หรือสละสิทธิ์
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>ระบบสารสนเทศกองทุนเงินให้กู้ยืมเพื่อการศึกษา (กยศ.)</span>
          </div>
          <div className="text-slate-400">
            ฐานข้อมูล: Firebase Project 'Database Summary' • Google Workspace Integration
          </div>
        </div>
      </footer>

      {/* Edit Modal */}
      <DataEditModal
        step={editingStep}
        isOpen={!!editingStep}
        onClose={() => setEditingStep(null)}
        onSave={handleStepSave}
      />

      {/* Google Sheets Modal */}
      <SheetsModal
        isOpen={isSheetsModalOpen}
        onClose={() => setIsSheetsModalOpen(false)}
        dashboardData={dashboardData}
        accessToken={accessToken}
        onLogin={handleLogin}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700 text-xs sm:text-sm font-medium flex items-center gap-2.5 animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
