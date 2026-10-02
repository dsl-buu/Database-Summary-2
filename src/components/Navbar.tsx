import React from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  RotateCcw,
  Sparkles,
  GraduationCap,
  Calendar,
  LogOut,
  User as UserIcon,
  CheckCircle2,
} from 'lucide-react';
import { GoogleUserInfo } from '../types';

interface NavbarProps {
  userInfo: GoogleUserInfo | null;
  onLogin: () => void;
  onLogout: () => void;
  isLoggingIn: boolean;
  onOpenSheetsModal: () => void;
  onExportCsv: () => void;
  onPrint: () => void;
  onReset: () => void;
  currentTerm: string;
  onChangeTerm: (term: string) => void;
  lastUpdated: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  userInfo,
  onLogin,
  onLogout,
  isLoggingIn,
  onOpenSheetsModal,
  onExportCsv,
  onPrint,
  onReset,
  currentTerm,
  onChangeTerm,
  lastUpdated,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top institution bar */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white px-4 lg:px-8 py-2.5 text-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 font-medium">
            <GraduationCap className="w-3.5 h-3.5" />
            กองทุนเงินให้กู้ยืมเพื่อการศึกษา (กยศ.)
          </span>
          <span className="text-slate-300 hidden sm:inline">|</span>
          <span className="text-slate-200 font-medium hidden sm:inline">
            ระบบบริหารจัดการและสรุปสถิติผู้กู้ยืมเงินแบบเรียลไทม์
          </span>
        </div>

        <div className="flex items-center gap-3 text-slate-300">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            สถานะฐานข้อมูล: เชื่อมต่อสมบูรณ์
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-300">
            อัปเดตล่าสุด: {new Date(lastUpdated).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} น.
          </span>
        </div>
      </div>

      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Logo and system title */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  แดชบอร์ดสรุปข้อมูลกองทุนกู้ยืม
                </h1>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-blue-100 text-blue-800 border border-blue-200">
                  DSL BUU
                </span>
              </div>
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                ติดตาม 11 ขั้นตอนการดำเนินงาน จำแนก 4 กลุ่มผู้กู้ยืม พร้อมสรุปยอดรวม (Total)
              </p>
            </div>
          </div>

          {/* Right Controls: Academic Term + Google Auth + Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Term selector */}
            <div className="relative inline-flex items-center">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <select
                value={currentTerm}
                onChange={(e) => onChangeTerm(e.target.value)}
                className="pl-9 pr-8 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer transition-colors appearance-none"
              >
                <option value="ภาคเรียนที่ 1/2567">ภาคเรียนที่ 1/2567</option>
                <option value="ภาคเรียนที่ 2/2567">ภาคเรียนที่ 2/2567</option>
                <option value="ภาคเรียนที่ 1/2568">ภาคเรียนที่ 1/2568 (เตรียมการ)</option>
              </select>
              <span className="absolute right-2.5 text-slate-400 pointer-events-none text-xs">▼</span>
            </div>

            {/* Google Sheets Sync Button */}
            <button
              onClick={onOpenSheetsModal}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer hover:shadow-emerald-100"
              title="เชื่อมต่อและส่งออก Google Sheets"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Google Sheets</span>
            </button>

            {/* Export CSV */}
            <button
              onClick={onExportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer"
              title="ดาวน์โหลดไฟล์ตาราง CSV"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">ส่งออก CSV</span>
            </button>

            {/* Print button */}
            <button
              onClick={onPrint}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer"
              title="พิมพ์เอกสารรายงานสรุป"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">พิมพ์รายงาน</span>
            </button>

            {/* Reset data */}
            <button
              onClick={onReset}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="รีเซ็ตเป็นข้อมูลตัวอย่างเริ่มต้น"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Google Authentication Section */}
            <div className="pl-1 border-l border-slate-200 ml-1">
              {userInfo ? (
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-1.5 pr-2.5">
                  {userInfo.photoURL ? (
                    <img
                      src={userInfo.photoURL}
                      alt={userInfo.displayName || 'User'}
                      className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-200"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                      {userInfo.displayName?.charAt(0) || <UserIcon className="w-4 h-4" />}
                    </div>
                  )}
                  <div className="hidden md:block text-left text-xs max-w-[130px] truncate">
                    <p className="font-semibold text-slate-800 truncate leading-tight">
                      {userInfo.displayName || 'เจ้าหน้าที่ กยศ.'}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">{userInfo.email}</p>
                  </div>
                  <button
                    onClick={onLogout}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                    title="ออกจากระบบ"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={onLogin}
                  disabled={isLoggingIn}
                  className="gsi-material-button inline-flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-xs transition-all text-xs font-semibold text-slate-700 cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                  </svg>
                  <span>{isLoggingIn ? 'กำลังเชื่อมต่อ...' : 'เข้าสู่ระบบ Gmail'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
