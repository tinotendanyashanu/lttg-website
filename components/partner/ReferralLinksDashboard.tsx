'use client';

import { useState } from 'react';
import {
  Copy,
  CheckCircle,
  MousePointer2,
  TrendingUp,
  Users,
  Briefcase,
  Sparkles,
  RefreshCw,
  BarChart3,
  ArrowUpRight,
} from 'lucide-react';
import { generateReferralCode } from '@/lib/actions/partner';
import { useRouter } from 'next/navigation';

interface ReferralStats {
  referralCode: string;
  totalClicks: number;
  totalLeads: number;
  totalConvertedDeals: number;
  recentClicks: number;
  conversionRate: string;
  dealConversionRate: string;
  clicksByDay: { date: string; clicks: number }[];
}

export default function ReferralLinksDashboard({ stats }: { stats: ReferralStats }) {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const link = stats.referralCode
    ? `https://leosystems.ai/?ref=${stats.referralCode}`
    : '';

  const copyToClipboard = () => {
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateCode = async () => {
    setLoading(true);
    try {
      const result = await generateReferralCode();
      if (result.success) {
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to generate code:', error);
    } finally {
      setLoading(false);
    }
  };

  const maxClicks = Math.max(...stats.clicksByDay.map((d) => d.clicks), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Referral Links</h2>
        <p className="text-slate-500">
          Track your referral link performance and conversions.
        </p>
      </div>

      {/* Referral Link Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden p-6 sm:p-8">
        <h3 className="text-lg font-bold text-slate-900 mb-2">Your Referral Link</h3>
        <p className="text-sm text-slate-500 mb-5">
          Share this link anywhere — any lead captured is permanently attributed to your account.
        </p>

        {stats.referralCode ? (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-2xl">
            <div className="bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl flex-1 font-mono text-sm text-slate-700 overflow-x-auto whitespace-nowrap scrollbar-hide">
              {link}
            </div>
            <button
              onClick={copyToClipboard}
              className={`h-11 px-5 rounded-xl font-bold text-sm transition-all flex items-center justify-center shrink-0 ${
                copied
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              {copied ? (
                <CheckCircle className="h-4 w-4 mr-2" />
              ) : (
                <Copy className="h-4 w-4 mr-2" />
              )}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        ) : (
          <button
            onClick={handleGenerateCode}
            disabled={loading}
            className="flex items-center px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            Generate Referral Code
          </button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={MousePointer2}
          iconBg="bg-blue-50"
          iconColor="text-blue-500"
          value={stats.totalClicks.toLocaleString()}
          label="Total Clicks"
          sublabel={`${stats.recentClicks} last 30 days`}
        />
        <StatCard
          icon={Users}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-500"
          value={stats.totalLeads.toLocaleString()}
          label="Total Leads"
          sublabel={`${stats.conversionRate}% click → lead`}
        />
        <StatCard
          icon={Briefcase}
          iconBg="bg-purple-50"
          iconColor="text-purple-500"
          value={stats.totalConvertedDeals.toLocaleString()}
          label="Converted Deals"
          sublabel={`${stats.dealConversionRate}% lead → deal`}
        />
        <StatCard
          icon={TrendingUp}
          iconBg="bg-indigo-50"
          iconColor="text-indigo-500"
          value={`${stats.conversionRate}%`}
          label="Conversion Rate"
          sublabel="Clicks to leads"
        />
      </div>

      {/* Click Activity Chart */}
      {stats.clicksByDay.length > 0 && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="h-5 w-5 text-slate-400" />
            <h3 className="text-lg font-bold text-slate-900">Click Activity (Last 7 Days)</h3>
          </div>
          <div className="flex items-end gap-2 h-40">
            {stats.clicksByDay.map((day) => (
              <div key={day.date} className="flex flex-col items-center flex-1 gap-1">
                <span className="text-xs font-bold text-slate-700">{day.clicks}</span>
                <div
                  className="w-full bg-emerald-400 rounded-t-lg transition-all min-h-[4px]"
                  style={{
                    height: `${(day.clicks / maxClicks) * 100}%`,
                  }}
                />
                <span className="text-[10px] text-slate-400 font-medium">
                  {new Date(day.date).toLocaleDateString('en', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Funnel Visualization */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-8">
        <h3 className="text-lg font-bold text-slate-900 mb-6">Conversion Funnel</h3>
        <div className="space-y-3">
          <FunnelStep
            label="Clicks"
            value={stats.totalClicks}
            percentage={100}
            color="bg-blue-400"
          />
          <div className="flex items-center justify-center">
            <ArrowUpRight className="h-4 w-4 text-slate-300 rotate-90" />
          </div>
          <FunnelStep
            label="Leads Generated"
            value={stats.totalLeads}
            percentage={stats.totalClicks > 0 ? (stats.totalLeads / stats.totalClicks) * 100 : 0}
            color="bg-emerald-400"
          />
          <div className="flex items-center justify-center">
            <ArrowUpRight className="h-4 w-4 text-slate-300 rotate-90" />
          </div>
          <FunnelStep
            label="Deals Converted"
            value={stats.totalConvertedDeals}
            percentage={stats.totalClicks > 0 ? (stats.totalConvertedDeals / stats.totalClicks) * 100 : 0}
            color="bg-purple-400"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  iconBg,
  iconColor,
  value,
  label,
  sublabel,
}: {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  value: string;
  label: string;
  sublabel: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className={`h-10 w-10 ${iconBg} ${iconColor} rounded-xl flex items-center justify-center mb-3`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-sm font-semibold text-slate-600 mt-0.5">{label}</p>
      <p className="text-xs text-slate-400 mt-0.5">{sublabel}</p>
    </div>
  );
}

function FunnelStep({
  label,
  value,
  percentage,
  color,
}: {
  label: string;
  value: number;
  percentage: number;
  color: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-semibold text-slate-700">{label}</span>
        <span className="text-sm font-bold text-slate-900">
          {value.toLocaleString()} <span className="text-slate-400 font-medium">({percentage.toFixed(1)}%)</span>
        </span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-3">
        <div
          className={`${color} h-3 rounded-full transition-all`}
          style={{ width: `${Math.max(percentage, 2)}%` }}
        />
      </div>
    </div>
  );
}
