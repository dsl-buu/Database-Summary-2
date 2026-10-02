import { DashboardData, WorkflowStep, BORROWER_GROUPS } from '../types';

export interface CreateSheetResult {
  spreadsheetId: string;
  spreadsheetUrl: string;
  title: string;
}

export const createGoogleSheetSummary = async (
  accessToken: string,
  data: DashboardData
): Promise<CreateSheetResult> => {
  const title = `สรุปข้อมูลกองทุนกู้ยืม กยศ. ${data.term} - อัปเดต ${new Date().toLocaleDateString('th-TH')}`;

  // 1. Create Spreadsheet
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title,
      },
      sheets: [
        {
          properties: {
            title: 'สรุป 11 ขั้นตอน',
            gridProperties: {
              rowCount: 35,
              columnCount: 8,
              frozenRowCount: 3,
            },
          },
        },
      ],
    }),
  });

  if (!createRes.ok) {
    const errorText = await createRes.text();
    throw new Error(`สร้าง Google Sheet ล้มเหลว (${createRes.status}): ${errorText}`);
  }

  const sheetData = await createRes.json();
  const spreadsheetId = sheetData.spreadsheetId;
  const spreadsheetUrl = sheetData.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;

  // 2. Format matrix table rows
  const rows: (string | number)[][] = [];

  // Title header
  rows.push([`แดชบอร์ดสรุปข้อมูลกองทุนเงินให้กู้ยืมเพื่อการศึกษา (${data.term})`]);
  rows.push([`อัปเดตล่าสุด: ${new Date().toLocaleString('th-TH')}`, '', '', '', '', '']);
  rows.push([
    'ขั้นตอนที่ / ตัวชี้วัด',
    'ตัวชี้วัดย่อย',
    'กลุ่ม 1: ผู้กู้รายเก่า',
    'กลุ่ม 2: ผู้กู้รายใหม่',
    'กลุ่ม 3: ผู้กู้เกินหลักสูตร',
    'กลุ่ม 4: ไม่ผ่านคุณสมบัติ',
    'ยอดรวมทั้งหมด (Total)',
  ]);

  let currentRowIdx = 4; // 1-based index in Sheet

  data.steps.forEach((step) => {
    step.metrics.forEach((m, mIdx) => {
      const stepPrefix = mIdx === 0 ? `ขั้นตอนที่ ${step.stepNumber}: ${step.title}` : '';
      const metricLabel = m.label;
      const r = currentRowIdx;
      // Formula for sum across columns C to F: =SUM(C{r}:F{r})
      rows.push([
        stepPrefix,
        metricLabel,
        m.oldBorrower,
        m.newBorrower,
        m.overCurriculum,
        m.disqualified,
        `=SUM(C${r}:F${r})`,
      ]);
      currentRowIdx++;
    });
  });

  // 3. Populate Sheet Values
  const updateRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'สรุป 11 ขั้นตอน'!A1:G${rows.length}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range: `'สรุป 11 ขั้นตอน'!A1:G${rows.length}`,
        values: rows,
      }),
    }
  );

  if (!updateRes.ok) {
    const errText = await updateRes.text();
    console.warn('Update sheet values error:', errText);
  }

  return {
    spreadsheetId,
    spreadsheetUrl,
    title,
  };
};

export const updateGoogleSheetValues = async (
  accessToken: string,
  spreadsheetId: string,
  data: DashboardData
): Promise<void> => {
  const rows: (string | number)[][] = [];
  rows.push([`แดชบอร์ดสรุปข้อมูลกองทุนเงินให้กู้ยืมเพื่อการศึกษา (${data.term})`]);
  rows.push([`อัปเดตล่าสุด: ${new Date().toLocaleString('th-TH')}`, '', '', '', '', '']);
  rows.push([
    'ขั้นตอนที่ / ตัวชี้วัด',
    'ตัวชี้วัดย่อย',
    'กลุ่ม 1: ผู้กู้รายเก่า',
    'กลุ่ม 2: ผู้กู้รายใหม่',
    'กลุ่ม 3: ผู้กู้เกินหลักสูตร',
    'กลุ่ม 4: ไม่ผ่านคุณสมบัติ',
    'ยอดรวมทั้งหมด (Total)',
  ]);

  let currentRowIdx = 4;
  data.steps.forEach((step) => {
    step.metrics.forEach((m, mIdx) => {
      const stepPrefix = mIdx === 0 ? `ขั้นตอนที่ ${step.stepNumber}: ${step.title}` : '';
      const metricLabel = m.label;
      const r = currentRowIdx;
      rows.push([
        stepPrefix,
        metricLabel,
        m.oldBorrower,
        m.newBorrower,
        m.overCurriculum,
        m.disqualified,
        `=SUM(C${r}:F${r})`,
      ]);
      currentRowIdx++;
    });
  });

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'สรุป 11 ขั้นตอน'!A1:G${rows.length}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range: `'สรุป 11 ขั้นตอน'!A1:G${rows.length}`,
        values: rows,
      }),
    }
  );

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`บันทึกข้อมูลลง Google Sheet ไม่สำเร็จ (${res.status}): ${errorText}`);
  }
};

export const fetchGoogleSheetData = async (
  accessToken: string,
  spreadsheetId: string
): Promise<any[][]> => {
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'สรุป 11 ขั้นตอน'!A1:G40`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!res.ok) {
    // Try without sheet title if custom sheet
    const fallbackRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A1:G40`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    if (!fallbackRes.ok) {
      throw new Error(`ไม่สามารถอ่านข้อมูลจาก Google Sheet ได้: ${await res.text()}`);
    }
    const data = await fallbackRes.json();
    return data.values || [];
  }

  const data = await res.json();
  return data.values || [];
};
