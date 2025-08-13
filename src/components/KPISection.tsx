import { ModernKPICard } from './ModernKPICard';
import { useEShippingDashboard } from '../hooks/useEShippingDashboard';
import { Activity } from 'lucide-react';

export interface KPIData {
  poToday: number;
  poLast7Days: number;
  pstNewEntry: number;
  pstUnderReview: number;
  pstTotalPending: number;
  pstTodayPending: number;
  pstTodayCompleted: number;
  pswPending: number;
  pswUnderReview: number;
  pswLast7DaysPending: number;
  pswTotalPending: number;
  // ADDED: New field for Rebel pending
  rebelPending: number;
  // Legacy fields for backward compatibility
  poNext7Days: number;
  pstTotal: number;
  pstCompleted: number;
  pstRemaining: number;
  pswThisWeek: number;
  pswCompleted: number;
  pswRemaining: number;
}

interface KPISectionProps {
  kpis?: KPIData; // Made optional since we'll use API data
}

export function KPISection({ kpis }: KPISectionProps) {
  const { data: apiData, loading, error } = useEShippingDashboard();

  // Default KPI values to prevent null/undefined errors
  const defaultKPIs: KPIData = {
    poToday: 0,
    poLast7Days: 0,
    pstNewEntry: 0,
    pstUnderReview: 0,
    pstTotalPending: 0,
    pstTodayPending: 0,
    pstTodayCompleted: 0,
    pswPending: 0,
    pswUnderReview: 0,
    pswLast7DaysPending: 0,
    pswTotalPending: 0,
    rebelPending: 0,
    poNext7Days: 0,
    pstTotal: 0,
    pstCompleted: 0,
    pstRemaining: 0,
    pswThisWeek: 0,
    pswCompleted: 0,
    pswRemaining: 0,
  };

  // Use API data if available, fallback to props, then to default values
  const displayData = apiData?.data ? {
    poToday: apiData.data.poToday || 0,
    poLast7Days: apiData.data.poNext7Days || 0, // Map to poNext7Days from API
    pstTotalPending: apiData.data.pstLeft || 0,
    pstTodayPending: apiData.data.pstLeft || 0, // Use same value for today pending
    pswTotalPending: apiData.data.pswLeft || 0,
    pswCompleted: apiData.data.pswDone || 0,
    // Other fields with fallback values
    pstNewEntry: 0,
    pstUnderReview: 0,
    pstTodayCompleted: apiData.data.pstDone || 0,
    pswPending: apiData.data.pswLeft || 0,
    pswUnderReview: 0,
    pswLast7DaysPending: 0,
    rebelPending: 0,
    // Legacy fields
    poNext7Days: apiData.data.poNext7Days || 0,
    pstTotal: (apiData.data.pstDone || 0) + (apiData.data.pstLeft || 0),
    pstCompleted: apiData.data.pstDone || 0,
    pstRemaining: apiData.data.pstLeft || 0,
    pswThisWeek: (apiData.data.pswDone || 0) + (apiData.data.pswLeft || 0),
    pswRemaining: apiData.data.pswLeft || 0,
  } : kpis || defaultKPIs;

  // Loading state
  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-base font-semibold text-gray-900">Dashboard Overview</h2>
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Activity className="w-3 h-3 animate-spin" />
                <span>Loading dashboard data...</span>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-base font-semibold text-gray-900">Dashboard Overview</h2>
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1 text-red-600">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                <span className="font-medium">Error loading data: {error}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate urgency indicators
  const hasUrgentTasks = displayData.pstTotalPending > 0 || displayData.pswTotalPending > 0;
  const totalPendingTasks = displayData.pstTotalPending + displayData.pswTotalPending;

  return (
    <div className="space-y-3">
      {/* Compact header with quick status overview */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h2 className="text-base font-semibold text-gray-900">
            Dashboard Overview
          </h2>
          <div className="flex items-center gap-2 text-xs">
            {hasUrgentTasks ? (
              <div className="flex items-center gap-1 text-amber-600">
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></div>
                <span className="font-medium">{totalPendingTasks} task{totalPendingTasks !== 1 ? 's' : ''} pending</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-green-600">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <span className="font-medium">All tasks up to date</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Activity className="w-2 h-2" />
              <span>{apiData ? 'Live Data' : 'Offline Mode'}</span>
            </div>
          </div>
        </div>
        
        {/* Quick action hint */}
        {hasUrgentTasks && (
          <div className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full">
            👆 Click cards for details
          </div>
        )}
      </div>

      {/* Compact KPI Cards - Responsive horizontal layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {/* PO Volumes Card */}
        <ModernKPICard
          title="PO Volumes"
          pending={displayData.pstTodayPending}
          subtitle="Purchase Orders"
          icon="Package"
          color="blue"
          customDisplay={{
            mainText: "",
            metrics: {
              primary: {
                label: "Total POs",
                value: displayData.poToday + displayData.pstTodayPending,
                color: "text-blue-600"
              },
              split: {
                left: {
                  label: "PO PENDING",
                  value: displayData.pstTodayPending,
                  color: "text-blue-600"
                },
                right: {
                  label: "PO TOTAL",
                  value: displayData.poToday,
                  color: "text-gray-900"
                }
              },
              tertiary: {
                label: "Last 7 days",
                value: `${displayData.poLast7Days} total`
              }
            }
          }}
        />

        {/* PST Processing Card */}
        <ModernKPICard
          title="PST Processing"
          pending={displayData.pstTotalPending}
          subtitle="Pre-Shipment Transport"
          icon="FileText"
          color="orange"
          customDisplay={{
            mainText: "",
            metrics: {
              primary: {
                label: "Total Tasks",
                value: displayData.pstTotalPending + displayData.pstTodayCompleted,
                color: "text-orange-600"
              },
              split: {
                left: {
                  label: "PENDING TASKS",
                  value: displayData.pstTotalPending,
                  color: displayData.pstTotalPending > 0 ? "text-orange-600" : "text-green-600"
                },
                right: {
                  label: "",
                  value: "",
                  color: ""
                }
              },
              tertiary: {
                label: "Requires Action",
                value: displayData.pstTotalPending > 0 ? "Yes" : "All Clear"
              }
            }
          }}
        />

        {/* PSW Weekly Card */}
        <ModernKPICard
          title="PSW Weekly"
          pending={displayData.pswTotalPending}
          subtitle="Pre-Shipment Waiver"
          icon="CheckCircle"
          color="purple"
          customDisplay={{
            mainText: "",
            metrics: {
              primary: {
                label: "Total This Week",
                value: displayData.pswTotalPending + displayData.pswCompleted,
                color: "text-purple-600"
              },
              split: {
                left: {
                  label: "PENDING",
                  value: displayData.pswTotalPending,
                  color: displayData.pswTotalPending > 0 ? "text-purple-600" : "text-green-600"
                },
                right: {
                  label: "COMPLETED",
                  value: displayData.pswCompleted,
                  color: "text-green-600"
                }
              },
              tertiary: {
                label: "This Week",
                value: `${displayData.pswTotalPending + displayData.pswCompleted} total`
              }
            }
          }}
        />
      </div>
    </div>
  );
}