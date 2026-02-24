'use client';

import { useAuction } from '@/lib/auction/auction-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/calculations/format';

function StatRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-medium tabular-nums ${color ?? ''}`}>{value}</span>
    </div>
  );
}

export function SummaryStatsCards() {
  const { summaryStats } = useAuction();
  const { myTeams, opponents, available } = summaryStats;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            My Teams ({myTeams.count})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5">
          <StatRow label="Total Paid" value={formatCurrency(myTeams.totalPaid)} />
          <StatRow label="Projected Value" value={formatCurrency(myTeams.projectedValue)} />
          <StatRow
            label="Expected Profit"
            value={formatCurrency(myTeams.expectedProfit)}
            color={myTeams.expectedProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}
          />
          <StatRow
            label="ROI"
            value={`${myTeams.roi.toFixed(1)}%`}
            color={myTeams.roi >= 0 ? 'text-emerald-400' : 'text-red-400'}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Opponents ({opponents.count})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5">
          <StatRow label="Total Paid" value={formatCurrency(opponents.totalPaid)} />
          <StatRow label="Projected Value" value={formatCurrency(opponents.projectedValue)} />
          <StatRow
            label="Expected Profit"
            value={formatCurrency(opponents.expectedProfit)}
            color={opponents.expectedProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}
          />
          <StatRow
            label="ROI"
            value={`${opponents.roi.toFixed(1)}%`}
            color={opponents.roi >= 0 ? 'text-emerald-400' : 'text-red-400'}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Available ({available.count})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5">
          <StatRow
            label="Projected Value"
            value={formatCurrency(available.projectedValue)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
