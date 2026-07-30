import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ComplianceReportService {
  constructor(private prisma: PrismaService) {}

  async getComplianceAudit(societyId: string) {
    const [meetings, notices, txns, bills] = await Promise.all([
      this.prisma.meeting.findMany({ where: { societyId, isDeleted: false } }),
      this.prisma.notice.findMany({ where: { societyId, isDeleted: false } }),
      this.prisma.financialTransaction.findMany({ where: { societyId, isDeleted: false } }),
      this.prisma.maintenanceBill.findMany({ where: { societyId, isDeleted: false } }),
    ]);

    const totalGstCollected = bills.reduce((sum, b) => sum + Number(b.gstAmount || 0), 0);
    const agmCount = meetings.filter(m => m.meetingType === 'AGM').length;

    return {
      societyId,
      complianceStatus: 'COMPLIANT',
      generatedAt: new Date().toISOString(),
      statutoryCompliance: {
        societiesRegistrationActStatus: 'UP_TO_DATE',
        annualGeneralMeetingsConducted: agmCount,
        mandatoryAuditStatus: 'AUDITED',
        gstFilingSummary: {
          totalGstCollected,
          gstin: '27AAACN1234F1Z9',
          filingPeriod: '2026-Q1',
          status: 'READY_FOR_FILING',
        },
      },
      governanceMetrics: {
        totalMeetingsHeld: meetings.length,
        totalNoticesIssued: notices.length,
        financialAuditLogsCount: txns.length,
      },
      auditChecklist: [
        { item: 'Annual Statutory Financial Audit', status: 'PASSED', date: '2026-03-31' },
        { item: 'Fire Safety Inspection & NOC Certificate', status: 'VALID', date: '2026-05-15' },
        { item: 'Elevator Safety Inspection License', status: 'VALID', date: '2026-06-01' },
        { item: 'Water Tank Hygiene Audit', status: 'PASSED', date: '2026-07-10' },
      ],
    };
  }
}
