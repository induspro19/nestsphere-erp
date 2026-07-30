import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { MainLayout } from '../components/layout/MainLayout';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';

const LoginPage = React.lazy(() => import('../pages/LoginPage').then(m => ({ default: m.LoginPage })));
const DashboardShell = React.lazy(() => import('../pages/DashboardShell').then(m => ({ default: m.DashboardShell })));
const PropertySettingsPage = React.lazy(() => import('../pages/PropertySettingsPage').then(m => ({ default: m.PropertySettingsPage })));
const PeopleManagementPage = React.lazy(() => import('../pages/PeopleManagementPage').then(m => ({ default: m.PeopleManagementPage })));
const AccessControlPage = React.lazy(() => import('../pages/AccessControlPage').then(m => ({ default: m.AccessControlPage })));
const VisitorsPage = React.lazy(() => import('../pages/VisitorsPage').then(m => ({ default: m.VisitorsPage })));
const NotificationsPage = React.lazy(() => import('../pages/NotificationsPage').then(m => ({ default: m.NotificationsPage })));
const WorkflowsPage = React.lazy(() => import('../pages/WorkflowsPage').then(m => ({ default: m.WorkflowsPage })));
const AssetsPage = React.lazy(() => import('../pages/AssetsPage').then(m => ({ default: m.AssetsPage })));
const DocumentsPage = React.lazy(() => import('../pages/DocumentsPage').then(m => ({ default: m.DocumentsPage })));
const FinancialsPage = React.lazy(() => import('../pages/FinancialsPage').then(m => ({ default: m.FinancialsPage })));
const AnalyticsPage = React.lazy(() => import('../pages/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));
const ExecutiveAnalyticsPage = React.lazy(() => import('../pages/ExecutiveAnalyticsPage').then(m => ({ default: m.ExecutiveAnalyticsPage })));
const AiInsightsPage = React.lazy(() => import('../pages/AiInsightsPage').then(m => ({ default: m.AiInsightsPage })));
const AdvancedReportsPage = React.lazy(() => import('../pages/AdvancedReportsPage').then(m => ({ default: m.AdvancedReportsPage })));
const ComplaintsPage = React.lazy(() => import('../pages/ComplaintsPage').then(m => ({ default: m.ComplaintsPage })));
const MaintenancePage = React.lazy(() => import('../pages/MaintenancePage').then(m => ({ default: m.MaintenancePage })));
const MaintenanceBillingPage = React.lazy(() => import('../pages/MaintenanceBillingPage').then(m => ({ default: m.MaintenanceBillingPage })));
const AmenityBookingPage = React.lazy(() => import('../pages/AmenityBookingPage').then(m => ({ default: m.AmenityBookingPage })));
const ParkingManagementPage = React.lazy(() => import('../pages/ParkingManagementPage').then(m => ({ default: m.ParkingManagementPage })));
const VendorAmcPage = React.lazy(() => import('../pages/VendorAmcPage').then(m => ({ default: m.VendorAmcPage })));
const MeetingsPage = React.lazy(() => import('../pages/MeetingsPage').then(m => ({ default: m.MeetingsPage })));
const NoticeBoardPage = React.lazy(() => import('../pages/NoticeBoardPage').then(m => ({ default: m.NoticeBoardPage })));
const ResidentDashboardPage = React.lazy(() => import('../pages/resident/ResidentDashboardPage').then(m => ({ default: m.ResidentDashboardPage })));
const ResidentProfilePage = React.lazy(() => import('../pages/resident/ResidentProfilePage').then(m => ({ default: m.ResidentProfilePage })));
const ResidentBillsPage = React.lazy(() => import('../pages/resident/ResidentBillsPage').then(m => ({ default: m.ResidentBillsPage })));
const ResidentComplaintsPage = React.lazy(() => import('../pages/resident/ResidentComplaintsPage').then(m => ({ default: m.ResidentComplaintsPage })));
const ResidentNoticesPage = React.lazy(() => import('../pages/resident/ResidentNoticesPage').then(m => ({ default: m.ResidentNoticesPage })));
const ResidentMeetingsPage = React.lazy(() => import('../pages/resident/ResidentMeetingsPage').then(m => ({ default: m.ResidentMeetingsPage })));
const ResidentVisitorsPage = React.lazy(() => import('../pages/resident/ResidentVisitorsPage').then(m => ({ default: m.ResidentVisitorsPage })));
const ResidentAmenitiesPage = React.lazy(() => import('../pages/resident/ResidentAmenitiesPage').then(m => ({ default: m.ResidentAmenitiesPage })));
const ResidentParkingPage = React.lazy(() => import('../pages/resident/ResidentParkingPage').then(m => ({ default: m.ResidentParkingPage })));
const ResidentDocumentsPage = React.lazy(() => import('../pages/resident/ResidentDocumentsPage').then(m => ({ default: m.ResidentDocumentsPage })));
const ResidentSosPage = React.lazy(() => import('../pages/resident/ResidentSosPage').then(m => ({ default: m.ResidentSosPage })));
const ResidentPortalLayout = React.lazy(() => import('../components/layout/resident/ResidentPortalLayout').then(m => ({ default: m.ResidentPortalLayout })));
const ResidentMorePage = React.lazy(() => import('../pages/resident/ResidentMorePage').then(m => ({ default: m.ResidentMorePage })));

const GatekeeperKioskLayout = React.lazy(() => import('../components/layout/gatekeeper/GatekeeperKioskLayout').then(m => ({ default: m.GatekeeperKioskLayout })));
const GatekeeperDashboardPage = React.lazy(() => import('../pages/gatekeeper/GatekeeperDashboardPage').then(m => ({ default: m.GatekeeperDashboardPage })));
const GatekeeperCheckInPage = React.lazy(() => import('../pages/gatekeeper/GatekeeperCheckInPage').then(m => ({ default: m.GatekeeperCheckInPage })));
const GatekeeperCheckOutPage = React.lazy(() => import('../pages/gatekeeper/GatekeeperCheckOutPage').then(m => ({ default: m.GatekeeperCheckOutPage })));
const GatekeeperDeliveryPage = React.lazy(() => import('../pages/gatekeeper/GatekeeperDeliveryPage').then(m => ({ default: m.GatekeeperDeliveryPage })));
const GatekeeperStaffAttendancePage = React.lazy(() => import('../pages/gatekeeper/GatekeeperStaffAttendancePage').then(m => ({ default: m.GatekeeperStaffAttendancePage })));
const GatekeeperVehicleVerifyPage = React.lazy(() => import('../pages/gatekeeper/GatekeeperVehicleVerifyPage').then(m => ({ default: m.GatekeeperVehicleVerifyPage })));
const GatekeeperBlacklistPage = React.lazy(() => import('../pages/gatekeeper/GatekeeperBlacklistPage').then(m => ({ default: m.GatekeeperBlacklistPage })));
const GatekeeperReportsPage = React.lazy(() => import('../pages/gatekeeper/GatekeeperReportsPage').then(m => ({ default: m.GatekeeperReportsPage })));

const SuperAdminLayout = React.lazy(() => import('../components/layout/super-admin/SuperAdminLayout').then(m => ({ default: m.SuperAdminLayout })));
const SuperAdminDashboardPage = React.lazy(() => import('../pages/super-admin/SuperAdminDashboardPage'));
const SocietiesManagementPage = React.lazy(() => import('../pages/super-admin/SocietiesManagementPage'));
const SubscriptionManagementPage = React.lazy(() => import('../pages/super-admin/SubscriptionManagementPage'));
const LicenseManagementPage = React.lazy(() => import('../pages/super-admin/LicenseManagementPage'));
const BillingDashboardPage = React.lazy(() => import('../pages/super-admin/BillingDashboardPage'));
const PlatformUsersPage = React.lazy(() => import('../pages/super-admin/PlatformUsersPage'));
const CustomerSupportPage = React.lazy(() => import('../pages/super-admin/CustomerSupportPage'));
const SystemMonitoringPage = React.lazy(() => import('../pages/super-admin/SystemMonitoringPage'));
const AuditCenterPage = React.lazy(() => import('../pages/super-admin/AuditCenterPage'));
const PlatformSettingsPage = React.lazy(() => import('../pages/super-admin/PlatformSettingsPage'));

const NotFoundPage = React.lazy(() => import('../pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));
const ForbiddenPage = React.lazy(() => import('../pages/ForbiddenPage').then(m => ({ default: m.ForbiddenPage })));
const DeviceSettingsPage = React.lazy(() => import('../pages/DeviceSettingsPage').then(m => ({ default: m.DeviceSettingsPage })));

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<LoadingSpinner message="Loading..." />}>
      <Routes>
        {/* Public Unauthenticated Routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Main Layout Shell */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<DashboardShell />} />
            <Route path="/property-management" element={<PropertySettingsPage />} />
            <Route path="/people" element={<PeopleManagementPage />} />
            <Route path="/access-control" element={<AccessControlPage />} />
            <Route path="/visitors" element={<VisitorsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/workflows" element={<WorkflowsPage />} />
            <Route path="/assets" element={<AssetsPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/financials" element={<FinancialsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/executive-bi" element={<ExecutiveAnalyticsPage />} />
            <Route path="/ai-insights" element={<AiInsightsPage />} />
            <Route path="/reports-center" element={<AdvancedReportsPage />} />
            <Route path="/complaints" element={<ComplaintsPage />} />
            <Route path="/maintenance" element={<MaintenancePage />} />
            <Route path="/billing" element={<MaintenanceBillingPage />} />
            <Route path="/amenities" element={<AmenityBookingPage />} />
            <Route path="/parking" element={<ParkingManagementPage />} />
            <Route path="/vendors" element={<VendorAmcPage />} />
            <Route path="/meetings" element={<MeetingsPage />} />
            <Route path="/notices" element={<NoticeBoardPage />} />
          </Route>

          {/* Dedicated Resident Mobile Portal App Shell */}
          <Route element={<ResidentPortalLayout />}>
            <Route path="/resident/dashboard" element={<ResidentDashboardPage />} />
            <Route path="/resident/profile" element={<ResidentProfilePage />} />
            <Route path="/resident/bills" element={<ResidentBillsPage />} />
            <Route path="/resident/complaints" element={<ResidentComplaintsPage />} />
            <Route path="/resident/notices" element={<ResidentNoticesPage />} />
            <Route path="/resident/meetings" element={<ResidentMeetingsPage />} />
            <Route path="/resident/visitors" element={<ResidentVisitorsPage />} />
            <Route path="/resident/amenities" element={<ResidentAmenitiesPage />} />
            <Route path="/resident/parking" element={<ResidentParkingPage />} />
            <Route path="/resident/documents" element={<ResidentDocumentsPage />} />
            <Route path="/resident/sos" element={<ResidentSosPage />} />
            <Route path="/resident/more" element={<ResidentMorePage />} />
          </Route>

          {/* Dedicated Gatekeeper Security Kiosk App Shell */}
          <Route element={<GatekeeperKioskLayout />}>
            <Route path="/gatekeeper/dashboard" element={<GatekeeperDashboardPage />} />
            <Route path="/gatekeeper/check-in" element={<GatekeeperCheckInPage />} />
            <Route path="/gatekeeper/check-out" element={<GatekeeperCheckOutPage />} />
            <Route path="/gatekeeper/deliveries" element={<GatekeeperDeliveryPage />} />
            <Route path="/gatekeeper/staff-attendance" element={<GatekeeperStaffAttendancePage />} />
            <Route path="/gatekeeper/vehicle-verify" element={<GatekeeperVehicleVerifyPage />} />
            <Route path="/gatekeeper/blacklist" element={<GatekeeperBlacklistPage />} />
            <Route path="/gatekeeper/reports" element={<GatekeeperReportsPage />} />
          </Route>

            {/* Super Admin Restricted Shell */}
            <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']} />}>
              <Route element={<SuperAdminLayout />}>
                <Route path="/super-admin" element={<SuperAdminDashboardPage />} />
                <Route path="/super-admin/societies" element={<SocietiesManagementPage />} />
                <Route path="/super-admin/subscriptions" element={<SubscriptionManagementPage />} />
                <Route path="/super-admin/licenses" element={<LicenseManagementPage />} />
                <Route path="/super-admin/billing" element={<BillingDashboardPage />} />
                <Route path="/super-admin/users" element={<PlatformUsersPage />} />
                <Route path="/super-admin/support" element={<CustomerSupportPage />} />
                <Route path="/super-admin/monitoring" element={<SystemMonitoringPage />} />
                <Route path="/super-admin/audit" element={<AuditCenterPage />} />
                <Route path="/super-admin/settings" element={<PlatformSettingsPage />} />
              </Route>
            </Route>

            {/* Settings Shell */}
            <Route path="/settings">
              <Route index element={
                <div className="p-8 text-center border border-border/40 rounded-2xl bg-card">
                  <h2 className="text-xl font-bold font-display">System Settings Engine</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    10-Domain Enterprise Settings Framework (Extends in future phases)
                  </p>
                </div>
              } />
              <Route path="device" element={<DeviceSettingsPage />} />
            </Route>
          </Route>

        <Route path="/403" element={<ForbiddenPage />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};
