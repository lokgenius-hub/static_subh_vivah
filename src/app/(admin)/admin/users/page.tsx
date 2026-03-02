import { getAllUsers } from "@/lib/actions";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, Building2, Shield, Phone, Mail } from "lucide-react";
import { format } from "date-fns";
import { UserRoleActions } from "./user-role-actions";

export const metadata = {
  title: "User Management | VivahSthal Admin",
};

const roleBadgeColors: Record<string, string> = {
  customer: "bg-blue-100 text-blue-700",
  vendor: "bg-purple-100 text-purple-700",
  admin: "bg-red-100 text-red-700",
  rm: "bg-amber-100 text-amber-700",
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const users = await getAllUsers({ role: params.role, q: params.q });

  const customerCount = users.filter((u: Record<string, unknown>) => u.role === "customer").length;
  const vendorCount = users.filter((u: Record<string, unknown>) => u.role === "vendor").length;
  const adminCount = users.filter((u: Record<string, unknown>) => u.role === "admin" || u.role === "rm").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-charcoal)]">Users</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage customers, vendors, and admin users
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total", count: users.length, color: "bg-gray-100 text-gray-800", icon: Users },
          { label: "Customers", count: customerCount, color: "bg-blue-100 text-blue-800", icon: UserCheck },
          { label: "Vendors", count: vendorCount, color: "bg-purple-100 text-purple-800", icon: Building2 },
          { label: "Admin/RM", count: adminCount, color: "bg-red-100 text-red-800", icon: Shield },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">{s.count}</p>
              <s.icon className="h-5 w-5 text-gray-300" />
            </div>
            <span className={`px-2 py-0.5 rounded-full text-xs ${s.color}`}>{s.label}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <form className="flex-1 flex gap-2">
          <input
            name="q"
            type="text"
            defaultValue={params.q || ""}
            placeholder="Search by name, email, or phone..."
            className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
          />
          <select
            name="role"
            defaultValue={params.role || ""}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none"
          >
            <option value="">All Roles</option>
            <option value="customer">Customer</option>
            <option value="vendor">Vendor</option>
            <option value="admin">Admin</option>
            <option value="rm">RM</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white text-sm font-medium hover:opacity-90"
          >
            Filter
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {users.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">City</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((user: Record<string, unknown>) => (
                  <tr key={user.id as string} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-gradient-gold flex items-center justify-center text-white text-sm font-bold uppercase shrink-0">
                          {((user.full_name as string) || "U")[0]}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{user.full_name as string}</p>
                          <p className="text-xs text-gray-400">{user.email as string}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        {(user.phone as string | null) ? (
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <Phone className="h-3 w-3" /> {user.phone as string}
                          </div>
                        ) : null}
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Mail className="h-3 w-3" /> {user.email as string}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        roleBadgeColors[user.role as string] || "bg-gray-100 text-gray-600"
                      }`}>
                        {user.role as string}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-600">{(user.city as string) || "—"}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs text-gray-500">
                        {user.created_at ? format(new Date(user.created_at as string), "MMM d, yyyy") : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <UserRoleActions userId={user.id as string} currentRole={user.role as string} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
