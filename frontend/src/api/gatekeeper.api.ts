import { axiosClient } from './axiosClient';

export interface GateShiftDetails {
  shiftId: string;
  gateName: string;
  guardName: string;
  guardId: string;
  previousGuard: string;
  shiftStartedAt: string;
  shiftDuration: string;
  handoverNotes: string;
}

export interface GatekeeperCommandSummary {
  activeGate: string;
  gateStatus: 'OPEN' | 'CLOSED';
  guardOnDuty: string;
  shift: GateShiftDetails;
  metrics: {
    visitorsInside: number;
    waitingApproval: number;
    todayEntries: number;
    todayExits: number;
    expectedVisitors: number;
    deliveryWaiting: number;
    staffInside: number;
    blacklistAlerts: number;
    emergencyAlerts: number;
  };
}

export interface QrScanDetails {
  qrCode: string;
  type: 'VISITOR' | 'DELIVERY' | 'RESIDENT' | 'STAFF' | 'VEHICLE' | 'TEMP_PASS';
  name: string;
  photoUrl?: string;
  flat: string;
  hostName: string;
  validUntil: string;
  entryCount: number;
  approvalStatus: 'APPROVED' | 'PENDING' | 'REJECTED';
}

export const gatekeeperApi = {
  getCommandSummary: async (gateName: string = 'Gate 1 - Main Entrance'): Promise<GatekeeperCommandSummary> => {
    return {
      activeGate: gateName,
      gateStatus: 'OPEN',
      guardOnDuty: 'Rajesh Sharma (SEC-881)',
      shift: {
        shiftId: 'SHIFT-2026-0724-A',
        gateName,
        guardName: 'Rajesh Sharma',
        guardId: 'SEC-881',
        previousGuard: 'Vikram Singh (SEC-712)',
        shiftStartedAt: '07:00 AM',
        shiftDuration: '5 hrs 12 mins',
        handoverNotes: 'All perimeter barriers operational. CCTV camera 4 replaced at 09:00 AM.',
      },
      metrics: {
        visitorsInside: 12,
        waitingApproval: 2,
        todayEntries: 48,
        todayExits: 36,
        expectedVisitors: 6,
        deliveryWaiting: 3,
        staffInside: 8,
        blacklistAlerts: 0,
        emergencyAlerts: 0,
      },
    };
  },

  startShift: async (gateName: string, notes: string) => {
    return { success: true, shiftId: 'SHIFT-2026-0724-B' };
  },

  endShift: async (shiftId: string, notes: string) => {
    return { success: true };
  },

  scanUniversalQr: async (qrCode: string): Promise<QrScanDetails> => {
    let type: QrScanDetails['type'] = 'VISITOR';
    if (qrCode.startsWith('STAFF')) type = 'STAFF';
    else if (qrCode.startsWith('VEHICLE') || qrCode.startsWith('MH-')) type = 'VEHICLE';
    else if (qrCode.startsWith('DELIVERY')) type = 'DELIVERY';
    else if (qrCode.startsWith('RESIDENT')) type = 'RESIDENT';

    return {
      qrCode,
      type,
      name: 'Sunil Verma',
      flat: 'A-402 (Grand Heights)',
      hostName: 'Resident User',
      validUntil: '2026-07-24 23:59',
      entryCount: 1,
      approvalStatus: 'APPROVED',
    };
  },

  verifyVehicle: async (vehicleNo: string) => {
    return {
      vehicleNo,
      ownerName: 'Resident User',
      flat: 'A-402',
      parkingSlot: 'SLOT A-402',
      insuranceValid: '2027-03-31',
      pucValid: '2026-08-15',
      fastagStatus: 'ACTIVE',
      status: 'AUTHORIZED',
    };
  },

  checkOutVisitor: async (visitorId: string) => {
    return {
      visitorId,
      timeInside: '2 hrs 15 mins',
      overstay: false,
      status: 'CHECKED_OUT',
    };
  },

  exportSecurityReport: async (reportType: string, format: 'PDF' | 'EXCEL' | 'CSV') => {
    return { success: true, downloadUrl: `/reports/security-${reportType}.${format.toLowerCase()}` };
  },
};
