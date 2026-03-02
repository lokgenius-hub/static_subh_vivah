import { getAdminStats } from "@/lib/actions";
import {
  Building2, Users, Phone, TrendingUp,
  CheckCircle2, XCircle, Star, UserCheck,
} from "lucide-react";

export const metadata = {
  title: "Settings & Dashboard | VivahSthal Admin",
};

export default async function AdminSettingsPage() {
  const stats = await getAdminStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-charcoal)]">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Platform overview and statistics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Total Venues"
          value={stats.totalVenues}
          icon={Building2}
          color="bg-blue-100 text-blue-600"
          sub={`${stats.activeVenues} active · ${stats.totalVenues - stats.activeVenues} inactive`}
        />
        <StatCard
          title="Featured Venues"
          value={stats.featuredVenues}
          icon={Star}
          color="bg-amber-100 text-amber-600"
          sub="Highlighted on homepage"
        />
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          color="bg-purple-100 text-purple-600"
          sub={`${stats.customers} customers · ${stats.vendors} vendors`}
        />
        <StatCard
          title="Total Leads"
          value={stats.totalLeads}
          icon={Phone}
          color="bg-green-100 text-green-600"
          sub={`${stats.newLeads} new · ${stats.convertedLeads} converted`}
        />
        <StatCard
          title="Active Venues"
          value={stats.activeVenues}
          icon={CheckCircle2}
          color="bg-emerald-100 text-emerald-600"
          sub="Currently listed on platform"
        />
        <StatCard
          title="Conversion Rate"
          value={stats.totalLeads > 0 ? `${Math.round((stats.convertedLeads / stats.totalLeads) * 100)}%` : "0%"}
          icon={TrendingUp}
          color="bg-rose-100 text-rose-600"
          sub="Leads to conversions"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <ActionLink href="/admin/venues" icon={Building2} label="Manage Venues" desc="Review, approve, or deactivate listings" />
            <ActionLink href="/admin/users" icon={UserCheck} label="Manage Users" desc="View and update user roles" />
            <ActionLink href="/admin/leads" icon={Phone} label="View Leads" desc="Track and manage customer enquiries" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Platform Info</h2>
          <div className="space-y-3 text-sm">
            <InfoRow label="Platform" value="VivahSthal" />
            <InfoRow label="Version" value="1.0.0" />
            <InfoRow label="Database" value="Supabase (PostgreSQL)" />
            <InfoRow label="Auth" value="Supabase Auth (Email + Google)" />
            <InfoRow label="Roles" value="Customer, Vendor, RM, Admin" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title, value, icon: Icon, color, sub,
}: {
  title: string;
  value: number | string;
  icon: React.FC<{ className?: string }>;
  color: string;
  sub: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="text-2xl font-bold text-[var(--color-charcoal)]">{value}</p>
      <p className="text-sm font-medium text-gray-700 mt-0.5">{title}</p>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </div>
  );
}

function ActionLink({
  href, icon: Icon, label, desc,
}: {
  href: string;
  icon: React.FC<{ className?: string }>;
  label: string;
  desc: string;
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
    >
      <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-[var(--color-primary)]/10 transition-colors">
        <Icon className="h-5 w-5 text-gray-400 group-hover:text-[var(--color-primary)] transition-colors" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-800">{label}</p>
        <p className="text-xs text-gray-400">{desc}</p>
      </div>
    </a>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-800">{value}</span>
    </div>
  );
}
