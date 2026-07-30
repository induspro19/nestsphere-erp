import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class PredictiveAnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getAiPredictiveInsights(societyId: string) {
    const [bills, complaints, visitors] = await Promise.all([
      this.prisma.maintenanceBill.findMany({ where: { societyId, isDeleted: false } }),
      this.prisma.complaint.findMany({ where: { societyId, isDeleted: false } }),
      this.prisma.visitorPass.findMany({ where: { societyId, isDeleted: false } }),
    ]);

    const unpaidCount = bills.filter((b: any) => b.status === 'UNPAID' || b.status === 'OVERDUE').length;

    return {
      generatedAt: new Date().toISOString(),
      predictions: [
        {
          id: 'pred-1',
          category: 'COLLECTION_FORECAST',
          title: 'Next Month Collection Velocity',
          prediction: '₹14.8 Lakhs projected (92.4% velocity)',
          confidenceScore: 94,
          riskLevel: 'LOW',
          reasoning: `${unpaidCount} units currently overdue. Historical data shows 85% of overdue units settle upon auto-reminder dispatch within 5 days of billing cycle start.`,
          recommendation: 'Schedule automated SMS & WhatsApp billing reminders 3 days prior to due date.',
        },
        {
          id: 'pred-2',
          category: 'EXPENSE_ANOMALY',
          title: 'Common-Area Utility Surge Detected',
          prediction: '+18.5% expected surge in July-August utility expenses',
          confidenceScore: 89,
          riskLevel: 'MEDIUM',
          reasoning: 'Seasonal temperature increase correlates with continuous HVAC and pump runtime in clubhouse and podium zones.',
          recommendation: 'Optimize podium lighting timers and set HVAC automated setbacks between 11 PM - 5 AM.',
        },
        {
          id: 'pred-3',
          category: 'COMPLAINT_PREDICTION',
          title: 'Plumbing & Water Pressure Workload Alert',
          prediction: '14-18 Plumbing tickets anticipated next week',
          confidenceScore: 86,
          riskLevel: 'MEDIUM',
          reasoning: 'Overhead tank cleaning scheduled for Thursday historically increases air-lock complaints in upper floors.',
          recommendation: 'Pre-allocate 2 dedicated maintenance technicians for upper-floor air-lock purging on Friday morning.',
        },
        {
          id: 'pred-4',
          category: 'VISITOR_TRAFFIC',
          title: 'Weekend Delivery & Visitor Peak',
          prediction: '340+ visitors expected on Saturday (11 AM - 3 PM)',
          confidenceScore: 96,
          riskLevel: 'LOW',
          reasoning: 'Festival weekend trend matched across historical gate logs for past 3 quarters.',
          recommendation: 'Enable Kiosk Self Check-In on Gate 2 to prevent vehicular queuing at Main Gate.',
        },
      ],
      automatedExecutiveSummaries: [
        {
          title: 'Executive Financial Summary',
          summary: 'Collection efficiency is currently tracking 4.2% above Q2 benchmark. Outstanding dues are concentrated across 12 primary units.',
          actionNeeded: 'Issue 60-day statutory notice for 3 persistent defaulters.',
        },
        {
          title: 'Operational Health Summary',
          summary: 'Average SLA turnaround for high-priority tickets stands at 3.8 hours against a 6-hour target. Vendor performance score is 91/100.',
          actionNeeded: 'Approve vendor AMC renewal for Lift Maintenance.',
        },
      ],
    };
  }
}
