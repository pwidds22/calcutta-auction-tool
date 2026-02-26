'use client';

import type { SoldTeam } from '@/lib/auction/live/use-auction-channel';
import type { BaseTeam, TournamentConfig, PayoutRules } from '@/lib/tournaments/types';
import type { TournamentResult } from '@/actions/tournament-results';
import {
  calculateActualSettlement,
  type Payment,
} from '@/lib/auction/live/debt-simplification';
import { ArrowRight, CheckCircle2, DollarSign, AlertTriangle } from 'lucide-react';

interface SettlementMatrixProps {
  soldTeams: SoldTeam[];
  baseTeams: BaseTeam[];
  config: TournamentConfig;
  payoutRules: PayoutRules;
  results: TournamentResult[];
}

export function SettlementMatrix({
  soldTeams,
  baseTeams,
  config,
  payoutRules,
  results,
}: SettlementMatrixProps) {
  const settlement = calculateActualSettlement(
    soldTeams,
    baseTeams,
    results,
    config,
    payoutRules
  );

  const hasResults = results.some((r) => r.result !== 'pending');

  if (!hasResults) {
    return (
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-8 text-center">
        <AlertTriangle className="mx-auto mb-3 size-8 text-amber-400/50" />
        <p className="text-sm text-white/50">
          Settlement will appear once tournament results are entered.
        </p>
        <p className="mt-1 text-xs text-white/30">
          The commissioner needs to mark teams as won/lost for each round.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Pot" value={`$${settlement.actualPot.toLocaleString()}`} />
        <StatCard
          label="Distributed"
          value={`$${Math.round(settlement.totalDistributed).toLocaleString()}`}
        />
        <StatCard
          label="Transactions"
          value={settlement.payments.length.toString()}
        />
        <StatCard
          label="Status"
          value={settlement.isSettled ? 'Settled' : 'In Progress'}
          valueColor={settlement.isSettled ? 'text-emerald-400' : 'text-amber-400'}
        />
      </div>

      {/* Net Balances */}
      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">
          Net Balances
        </h3>
        <div className="space-y-1.5">
          {settlement.balances.map((b) => (
            <div
              key={b.id}
              className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-2.5"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`size-2 rounded-full ${
                    b.netBalance > 0.01
                      ? 'bg-emerald-400'
                      : b.netBalance < -0.01
                        ? 'bg-red-400'
                        : 'bg-white/20'
                  }`}
                />
                <span className="text-sm text-white/80">{b.name}</span>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-4 text-xs text-white/30">
                  <span>Spent: ${b.totalSpent.toLocaleString()}</span>
                  <span>Earned: ${Math.round(b.totalEarned).toLocaleString()}</span>
                </div>
                <p
                  className={`text-sm font-mono font-medium ${
                    b.netBalance > 0.01
                      ? 'text-emerald-400'
                      : b.netBalance < -0.01
                        ? 'text-red-400'
                        : 'text-white/40'
                  }`}
                >
                  {b.netBalance >= 0 ? '+' : ''}${Math.round(b.netBalance).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Plan */}
      {settlement.payments.length > 0 && (
        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">
            Payment Plan ({settlement.payments.length} transaction{settlement.payments.length !== 1 ? 's' : ''})
          </h3>
          <div className="space-y-2">
            {settlement.payments.map((payment, idx) => (
              <PaymentRow key={`${payment.fromId}-${payment.toId}-${idx}`} payment={payment} />
            ))}
          </div>
        </div>
      )}

      {/* All settled indicator */}
      {settlement.isSettled && settlement.payments.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 py-8">
          <CheckCircle2 className="size-8 text-emerald-400" />
          <p className="text-sm font-medium text-emerald-400">All Settled</p>
          <p className="text-xs text-white/40">No payments needed.</p>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  valueColor = 'text-white',
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-center">
      <p className="text-[10px] uppercase tracking-wider text-white/30">{label}</p>
      <p className={`text-lg font-semibold ${valueColor}`}>{value}</p>
    </div>
  );
}

function PaymentRow({ payment }: { payment: Payment }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3">
      <div className="flex-1 text-right">
        <p className="text-sm font-medium text-red-400">{payment.fromName}</p>
      </div>
      <div className="flex items-center gap-2">
        <ArrowRight className="size-3.5 text-white/30" />
        <div className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1">
          <DollarSign className="size-3 text-emerald-400" />
          <span className="text-sm font-mono font-medium text-emerald-400">
            {Math.round(payment.amount).toLocaleString()}
          </span>
        </div>
        <ArrowRight className="size-3.5 text-white/30" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-emerald-400">{payment.toName}</p>
      </div>
    </div>
  );
}
