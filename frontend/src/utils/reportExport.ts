import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { toast } from 'sonner';

export interface ResidentReportData {
  user?: {
    firstName?: string;
    lastName?: string;
    flatNumber?: string;
    tower?: string;
  };
  maintenance?: {
    totalPaid: number;
    outstanding: number;
    monthsPaid: number;
  };
  payments?: Array<{
    id: string;
    date: string;
    amount: number;
    status: string;
    ref: string;
  }>;
  complaints?: {
    resolved: number;
    pending: number;
    inProgress: number;
  };
  visitors?: {
    thisMonth: number;
    frequent: number;
    deliveries: number;
  };
}

// Fallback sample data if empty
export const getDefaultReportData = (userSession?: any): ResidentReportData => {
  return {
    user: {
      firstName: userSession?.firstName || 'Resident',
      lastName: userSession?.lastName || 'User',
      flatNumber: userSession?.flatNumber || 'A-402',
      tower: userSession?.tower || 'Tower A',
    },
    maintenance: {
      totalPaid: 24500,
      outstanding: 4500,
      monthsPaid: 6,
    },
    payments: [
      { id: '1', date: '2026-06-25', amount: 4500, status: 'Completed', ref: 'TXN-001' },
      { id: '2', date: '2026-05-28', amount: 4500, status: 'Completed', ref: 'TXN-002' },
      { id: '3', date: '2026-04-26', amount: 4500, status: 'Completed', ref: 'TXN-003' },
      { id: '4', date: '2026-03-27', amount: 4500, status: 'Completed', ref: 'TXN-004' },
      { id: '5', date: '2026-02-25', amount: 4500, status: 'Completed', ref: 'TXN-005' },
      { id: '6', date: '2026-01-20', amount: 2000, status: 'Completed', ref: 'TXN-006' },
    ],
    complaints: {
      resolved: 12,
      pending: 1,
      inProgress: 2,
    },
    visitors: {
      thisMonth: 28,
      frequent: 4,
      deliveries: 15,
    },
  };
};

/**
 * 1. PDF Download Generator
 */
export const generateResidentPDF = async (reportData?: ResidentReportData, userSession?: any) => {
  try {
    const data = reportData && reportData.maintenance ? reportData : getDefaultReportData(userSession);
    const doc = new jsPDF();

    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const nowFormatted = new Date().toLocaleString();

    const residentName = `${data.user?.firstName || userSession?.firstName || 'Resident'} ${data.user?.lastName || userSession?.lastName || 'User'}`;
    const flatStr = `${data.user?.tower || 'Tower A'} - Flat ${data.user?.flatNumber || 'A-402'}`;

    // --- Header Branding ---
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 210, 38, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('NestSphere Society ERP', 14, 18);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Official Resident Monthly Analytics & Financial Summary', 14, 27);

    // --- Meta Box ---
    doc.setTextColor(30, 41, 59); // slate-800
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Resident Name: ${residentName}`, 14, 48);
    doc.text(`Unit Designation: ${flatStr}`, 14, 55);

    doc.setFont('helvetica', 'normal');
    doc.text(`Generated Date: ${nowFormatted}`, 130, 48);
    doc.text(`Report ID: RPT-${todayStr}-01`, 130, 55);

    doc.setDrawColor(226, 232, 240);
    doc.line(14, 60, 196, 60);

    // --- 1. Maintenance Summary ---
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 58, 138); // blue-900
    doc.text('1. Maintenance & Financial Summary', 14, 68);

    const mainRows = [
      ['Total Paid (YTD)', `INR ${data.maintenance?.totalPaid.toLocaleString()}`],
      ['Outstanding Balance', `INR ${data.maintenance?.outstanding.toLocaleString()}`],
      ['Months Paid (Current FY)', `${data.maintenance?.monthsPaid} Months`],
    ];

    autoTable(doc, {
      startY: 72,
      head: [['Financial Metric', 'Value']],
      body: mainRows,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 9.5, cellPadding: 3 },
      margin: { left: 14, right: 14 },
    });

    let currentY = (doc as any).lastAutoTable.finalY + 10;

    // --- 2. Complaint & Visitor Statistics ---
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 58, 138);
    doc.text('2. Complaints & Visitor Statistics', 14, currentY);

    const statsRows = [
      ['Complaints Resolved', String(data.complaints?.resolved)],
      ['Complaints In-Progress', String(data.complaints?.inProgress)],
      ['Complaints Pending', String(data.complaints?.pending)],
      ['Total Visitors (This Month)', String(data.visitors?.thisMonth)],
      ['Delivery Entries', String(data.visitors?.deliveries)],
      ['Frequent Guests', String(data.visitors?.frequent)],
    ];

    autoTable(doc, {
      startY: currentY + 4,
      head: [['Category Metric', 'Count / Status']],
      body: statsRows,
      theme: 'striped',
      headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 9.5, cellPadding: 3 },
      margin: { left: 14, right: 14 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 10;

    // --- 3. Recent Payment Transactions ---
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 58, 138);
    doc.text('3. Recent Transaction History', 14, currentY);

    const payRows = (data.payments || []).map((p) => [
      p.date,
      p.ref,
      `INR ${p.amount.toLocaleString()}`,
      p.status,
    ]);

    autoTable(doc, {
      startY: currentY + 4,
      head: [['Date', 'Transaction Ref', 'Amount', 'Payment Status']],
      body: payRows,
      theme: 'grid',
      headStyles: { fillColor: [5, 150, 105], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 3 },
      margin: { left: 14, right: 14 },
    });

    // --- Footer ---
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100, 116, 139);
      doc.text('Generated by NestSphere ERP • This is a computer generated report.', 14, 287);
      doc.text(`Page ${i} of ${pageCount}`, 180, 287);
    }

    doc.save(`Resident_Report_${todayStr}.pdf`);
    toast.success('PDF Downloaded Successfully');
  } catch (err) {
    console.error('PDF Generation Error:', err);
    toast.error('Unable to generate PDF report. Please retry.');
  }
};

/**
 * 2. Excel Export Generator
 */
export const generateResidentExcel = async (reportData?: ResidentReportData, userSession?: any) => {
  try {
    const data = reportData && reportData.maintenance ? reportData : getDefaultReportData(userSession);
    const wb = XLSX.utils.book_new();

    // Sheet 1: Maintenance Summary
    const mainSheetData = [
      ['NESTSPHERE SOCIETY ERP - RESIDENT MAINTENANCE SUMMARY'],
      ['Generated On', new Date().toLocaleString()],
      [],
      ['Metric', 'Amount / Value'],
      ['Total Paid (YTD)', data.maintenance?.totalPaid],
      ['Outstanding Balance', data.maintenance?.outstanding],
      ['Months Paid (Current FY)', data.maintenance?.monthsPaid],
    ];
    const ws1 = XLSX.utils.aoa_to_sheet(mainSheetData);
    XLSX.utils.book_append_sheet(wb, ws1, 'Maintenance Summary');

    // Sheet 2: Complaint History
    const complaintSheetData = [
      ['Date', 'Reference', 'Category', 'Status', 'Remarks'],
      ['2026-07-10', 'CMP-901', 'Plumbing', 'Resolved', 'Pipe leak repaired in kitchen'],
      ['2026-07-15', 'CMP-904', 'Electrical', 'Resolved', 'MCB switch replaced'],
      ['2026-07-28', 'CMP-912', 'Intercom', 'In Progress', 'Wire technician assigned'],
      ['2026-08-01', 'CMP-920', 'Parking', 'Pending', 'Slot sticker request'],
    ];
    const ws2 = XLSX.utils.aoa_to_sheet(complaintSheetData);
    XLSX.utils.book_append_sheet(wb, ws2, 'Complaint History');

    // Sheet 3: Visitor Statistics
    const visitorSheetData = [
      ['Category', 'Count (This Month)', 'Remarks'],
      ['Total Visitors', data.visitors?.thisMonth, 'Recorded at Main Gate'],
      ['Deliveries', data.visitors?.deliveries, 'Amazon, Zomato, Swiggy'],
      ['Frequent Guests', data.visitors?.frequent, 'Pre-approved guests'],
    ];
    const ws3 = XLSX.utils.aoa_to_sheet(visitorSheetData);
    XLSX.utils.book_append_sheet(wb, ws3, 'Visitor Statistics');

    // Sheet 4: Payment History
    const paymentHeaders = ['Date', 'Reference', 'Amount (INR)', 'Status', 'Remarks'];
    const paymentRows = (data.payments || []).map((p) => [
      p.date,
      p.ref,
      p.amount,
      p.status,
      'Maintenance Fee Payment',
    ]);
    const ws4 = XLSX.utils.aoa_to_sheet([paymentHeaders, ...paymentRows]);
    XLSX.utils.book_append_sheet(wb, ws4, 'Payment History');

    // Export Workbook
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    saveAs(blob, 'Resident_Report.xlsx');

    toast.success('Excel Exported Successfully');
  } catch (err) {
    console.error('Excel Export Error:', err);
    toast.error('Unable to generate Excel report. Please retry.');
  }
};



/**
 * 3. Print Report
 */
export const printResidentReport = () => {
  try {
    window.print();
  } catch (err) {
    toast.error('Unable to open print dialog');
  }
};

/**
 * 4. Enterprise A5 Resident Identity Card PDF Generator
 */
export const generateResidentIdentityCardPDF = async (profile: {
  name: string;
  digitalId: string;
  email: string;
  phone: string;
  flat: string;
  tower: string;
  wing: string;
  societyName: string;
  occupancy: string;
  memberSince: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  familyCount: number;
  vehicleCount: number;
}) => {
  try {
    const doc = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a5',
    });

    const cleanId = (profile.digitalId || 'DIG884920').replace(/[^a-zA-Z0-9]/g, '');

    // Header Background Gradient Box
    doc.setFillColor(37, 99, 235); // primary blue
    doc.rect(0, 0, 148, 42, 'F');

    doc.setFillColor(15, 23, 42); // slate-900 accent
    doc.rect(0, 38, 148, 4, 'F');

    // Header Text
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(profile.societyName || 'Greenfield Heights Cooperative Society', 74, 14, { align: 'center' });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Premium Smart Housing Society • Managed by NestSphere ERP', 74, 22, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('RESIDENT IDENTITY CARD', 74, 32, { align: 'center' });

    // Photo Box / Avatar Circle
    doc.setFillColor(241, 245, 249); // slate-100
    doc.setDrawColor(37, 99, 235);
    doc.setLineWidth(1);
    doc.circle(74, 62, 16, 'FD');

    // Initials
    const initials = (profile.name || 'Resident User')
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2);
    doc.setTextColor(37, 99, 235);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(initials, 74, 66, { align: 'center' });

    // Resident Name & Digital ID
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.text(profile.name || 'Riyaz Rathod', 74, 86, { align: 'center' });

    doc.setFillColor(239, 246, 255);
    doc.setDrawColor(191, 219, 254);
    doc.roundedRect(42, 90, 64, 7, 2, 2, 'FD');

    doc.setTextColor(30, 64, 175);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`Digital ID: ${profile.digitalId || 'DIG-884920'}`, 74, 95, { align: 'center' });

    // Key Profile Info Box
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(12, 102, 124, 65, 3, 3, 'FD');

    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);

    const leftX = 18;
    const rightX = 78;

    doc.setFont('helvetica', 'bold');
    doc.text('Unit Flat Number:', leftX, 110);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(profile.flat || 'A-402', leftX + 32, 110);

    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'bold');
    doc.text('Tower & Wing:', rightX, 110);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(`${profile.tower || 'Tower A'}, ${profile.wing || 'Wing 1'}`, rightX + 26, 110);

    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'bold');
    doc.text('Resident Type:', leftX, 119);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(profile.occupancy || 'Owner Occupied', leftX + 26, 119);

    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'bold');
    doc.text('Member Since:', rightX, 119);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(profile.memberSince || 'Jan 2024', rightX + 26, 119);

    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'bold');
    doc.text('Phone Number:', leftX, 128);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(profile.phone || '+91 98765 43210', leftX + 26, 128);

    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'bold');
    doc.text('Emergency Contact:', leftX, 137);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(225, 29, 72);
    doc.text(`${profile.emergencyContactName} (${profile.emergencyContactPhone})`, leftX + 34, 137);

    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'bold');
    doc.text('Family Members:', leftX, 146);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(`${profile.familyCount || 2} Registered Members`, leftX + 30, 146);

    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'bold');
    doc.text('Vehicles Registered:', rightX, 146);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(`${profile.vehicleCount || 2} RFID Active Vehicles`, rightX + 32, 146);

    // Barcode / Resident Security Token Box
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(12, 172, 124, 18, 2, 2, 'FD');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('RESIDENT SECURITY NO.', 20, 180);

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 64, 175);
    doc.text(cleanId.slice(-8) || '884920', 20, 186);

    // Signature Placeholders
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text('Authorized Signature', 110, 180, { align: 'center' });
    doc.text('Society Seal / Stamp', 110, 186, { align: 'center' });

    // Footer Block
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 195, 148, 15, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text('EMERGENCY HELPLINE & OFFICE NUMBERS', 74, 199, { align: 'center' });

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text('Security Gatehouse: Ext. 101  |  Society Office: +91 1800 123 4567  |  Fire: 101  |  Ambulance: 108', 74, 204, { align: 'center' });

    doc.save(`Resident_ID_${cleanId}.pdf`);
    toast.success(`Resident ID Card (${cleanId}) Downloaded!`);
  } catch (err) {
    console.error('Resident ID Card PDF Error:', err);
    toast.error('Failed to generate Resident ID PDF');
  }
};

/**
 * 5. Single Maintenance Bill Invoice PDF Generator
 */
export const generateSingleBillPDF = async (bill: {
  billNumber: string;
  month: string;
  amount: number;
  dueDate: string;
  status: string;
  paidOn?: string;
}, userSession?: any) => {
  try {
    const doc = new jsPDF();
    const residentName = `${userSession?.firstName || 'Resident'} ${userSession?.lastName || 'User'}`;
    const flatStr = `${userSession?.tower || 'Tower A'} - Flat ${userSession?.flatNumber || 'A-402'}`;
    const todayStr = new Date().toISOString().slice(0, 10);

    // Header Branding Box
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('NestSphere Society ERP', 14, 18);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Official Maintenance Bill & Tax Invoice Receipt', 14, 28);

    // Invoice Meta Header
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`INVOICE NO: ${bill.billNumber}`, 14, 50);
    doc.text(`BILLING MONTH: ${bill.month}`, 14, 57);

    doc.setFont('helvetica', 'normal');
    doc.text(`Date Issued: ${todayStr}`, 140, 50);
    doc.text(`Due Date: ${bill.dueDate}`, 140, 57);

    doc.setDrawColor(226, 232, 240);
    doc.line(14, 63, 196, 63);

    // Resident Details
    doc.setFont('helvetica', 'bold');
    doc.text('Billed To:', 14, 72);
    doc.setFont('helvetica', 'normal');
    doc.text(residentName, 14, 78);
    doc.text(flatStr, 14, 84);
    doc.text('Grand Heights Housing Society', 14, 90);

    // Status Badge
    doc.setFillColor(bill.status === 'PAID' ? 220 : 254, bill.status === 'PAID' ? 252 : 242, bill.status === 'PAID' ? 231 : 242);
    doc.roundedRect(140, 70, 56, 20, 3, 3, 'F');
    doc.setTextColor(bill.status === 'PAID' ? 22 : 185, bill.status === 'PAID' ? 101 : 28, bill.status === 'PAID' ? 52 : 28);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`STATUS: ${bill.status}`, 168, 82, { align: 'center' });

    // Itemized Table
    const billItems = [
      ['Monthly Society Maintenance Base Fee', `INR ${(bill.amount * 0.75).toFixed(2)}`],
      ['Sinking & Capital Repair Fund', `INR ${(bill.amount * 0.15).toFixed(2)}`],
      ['Common Area Electricity & Water', `INR ${(bill.amount * 0.10).toFixed(2)}`],
    ];

    autoTable(doc, {
      startY: 98,
      head: [['Charge Description', 'Amount']],
      body: billItems,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 9.5, cellPadding: 4 },
      margin: { left: 14, right: 14 },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 8;

    // Total Amount Summary
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(120, finalY, 76, 24, 2, 2, 'F');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('TOTAL AMOUNT DUE:', 124, finalY + 10);
    doc.setFontSize(14);
    doc.setTextColor(37, 99, 235);
    doc.text(`INR ${bill.amount.toLocaleString()}.00`, 124, finalY + 18);

    // Footer
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 116, 139);
    doc.text('Thank you for being a valued resident of Greenfield Heights.', 14, 280);
    doc.text('NestSphere ERP Official Billing Receipt', 14, 285);

    doc.save(`Invoice_${bill.billNumber}.pdf`);
    toast.success(`Downloaded Invoice PDF (${bill.billNumber})`);
  } catch (err) {
    console.error('Invoice PDF Download Error:', err);
    toast.error('Failed to download invoice PDF');
  }
};

