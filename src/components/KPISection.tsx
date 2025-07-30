
import { Card, CardContent } from './ui/card';
import { Package, PackageCheck, CalendarDays, TrendingUp, Timer, Activity } from 'lucide-react';

interface KPIData {
  poToday: number;
  poNext7Days: number;
  pstTotal: number;
  pstCompleted: number;
  pstRemaining: number;
  pstToday: number;
  pswThisWeek: number;
  pswCompleted: number;
  pswRemaining: number;
}

interface KPISectionProps {
  kpis: KPIData;
}

export function KPISection({ kpis }: KPISectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Purchase Order Intake</h2>
          <p className="text-sm text-gray-600">Monitor incoming PO volumes</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Activity className="w-3 h-3" />
          <span>Updated 2 min ago</span>
        </div>
      </div>
      
      {/* Compact KPI Cards - 3 in a row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Compact PO Card */}
        <Card className="border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-100 rounded-md flex items-center justify-center">
                  <Package className="w-3 h-3 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">PO</h3>
                  <p className="text-xs text-gray-600">Purchase Orders</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">{kpis.poToday + kpis.poNext7Days}</div>
                <div className="text-xs text-gray-500">Total</div>
              </div>
            </div>
            
            {/* Side by side layout for Today and Next 7 days */}
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="flex flex-col items-center p-2 bg-white rounded">
                <div className="flex items-center gap-1 mb-1">
                  <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                  <span className="text-xs text-gray-700">Today</span>
                </div>
                <span className="text-sm font-bold text-red-600">{kpis.poToday}</span>
              </div>
              
              <div className="flex flex-col items-center p-2 bg-white rounded">
                <div className="flex items-center gap-1 mb-1">
                  <div className="w-1 h-1 bg-orange-500 rounded-full"></div>
                  <span className="text-xs text-gray-700">Next 7d</span>
                </div>
                <span className="text-sm font-bold text-orange-600">{kpis.poNext7Days}</span>
              </div>
            </div>
            
            <div className="pt-2 border-t border-gray-200">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <TrendingUp className="w-3 h-3" />
                <span>+2 vs yesterday</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Compact PST Card with Today */}
        <Card className="border-0 bg-gradient-to-br from-amber-50 to-orange-50">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-amber-100 rounded-md flex items-center justify-center">
                  <PackageCheck className="w-3 h-3 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">PST</h3>
                  <p className="text-xs text-gray-600">Prepare Shipping</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">{kpis.pstTotal}</div>
                <div className="text-xs text-gray-500">Total</div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-1 mb-2">
              <div className="flex flex-col items-center p-1.5 bg-white rounded">
                <div className="flex items-center gap-1 mb-1">
                  <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                  <span className="text-xs text-gray-700">Today</span>
                </div>
                <span className="text-sm font-bold text-red-600">{kpis.pstToday}</span>
              </div>
              
              <div className="flex flex-col items-center p-1.5 bg-white rounded">
                <div className="flex items-center gap-1 mb-1">
                  <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-gray-700">Done</span>
                </div>
                <span className="text-sm font-bold text-green-600">{kpis.pstCompleted}</span>
              </div>
              
              <div className="flex flex-col items-center p-1.5 bg-white rounded">
                <div className="flex items-center gap-1 mb-1">
                  <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                  <span className="text-xs text-gray-700">Left</span>
                </div>
                <span className="text-sm font-bold text-gray-600">{kpis.pstRemaining}</span>
              </div>
            </div>
            
            <div className="pt-2 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Timer className="w-3 h-3" />
                  <span>Progress</span>
                </div>
                <div className="text-xs font-medium text-amber-600">
                  {kpis.pstTotal > 0 ? Math.round((kpis.pstCompleted / kpis.pstTotal) * 100) : 0}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* New Compact PSW Card with Updated Labels */}
        <Card className="border-0 bg-gradient-to-br from-purple-50 to-violet-50">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-purple-100 rounded-md flex items-center justify-center">
                  <CalendarDays className="w-3 h-3 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">PSW</h3>
                  <p className="text-xs text-gray-600">Weekly Prep</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">{kpis.pswThisWeek}</div>
                <div className="text-xs text-gray-500">This Week</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="flex flex-col items-center p-2 bg-white rounded">
                <div className="flex items-center gap-1 mb-1">
                  <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-gray-700">Done</span>
                </div>
                <span className="text-sm font-bold text-green-600">{kpis.pswCompleted}</span>
              </div>
              
              <div className="flex flex-col items-center p-2 bg-white rounded">
                <div className="flex items-center gap-1 mb-1">
                  <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                  <span className="text-xs text-gray-700">Left</span>
                </div>
                <span className="text-sm font-bold text-gray-600">{kpis.pswRemaining}</span>
              </div>
            </div>
            
            <div className="pt-2 border-t border-gray-200">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <TrendingUp className="w-3 h-3" />
                <span>+3 vs last week</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}