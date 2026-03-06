"use client";

import { useState, useEffect, useTransition } from "react";
import { Package, Plus, Edit, Trash2, Crown, Shield, Gem, Sparkles, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { getMarriagePackages, createMarriagePackage, updateMarriagePackage, deleteMarriagePackage } from "@/lib/client-actions";
import { formatPrice } from "@/lib/utils";
import type { MarriagePackage } from "@/lib/types";

const tierIcons: Record<string, typeof Crown> = { silver: Shield, golden: Crown, diamond: Gem, custom: Sparkles };
const tierColors: Record<string, string> = { silver: "text-gray-400", golden: "text-amber-400", diamond: "text-purple-400", custom: "text-rose-400" };

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<MarriagePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<MarriagePackage | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getMarriagePackages(false).then((data) => { setPackages(data); setLoading(false); });
  }, []);

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      if (editing) {
        const result = await updateMarriagePackage(editing.id, formData);
        if (result.success) {
          const updated = await getMarriagePackages(false);
          setPackages(updated);
          setEditing(null);
          setShowForm(false);
        }
      } else {
        const result = await createMarriagePackage(formData);
        if (result.success) {
          const updated = await getMarriagePackages(false);
          setPackages(updated);
          setShowForm(false);
        }
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this package?")) return;
    startTransition(async () => {
      await deleteMarriagePackage(id);
      setPackages((prev) => prev.filter((p) => p.id !== id));
    });
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" />
        <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Package className="h-6 w-6" /> Marriage Packages
          </h1>
          <p className="text-sm text-gray-400 mt-1">{packages.length} packages</p>
        </div>
        <Button onClick={() => { setEditing(null); setShowForm(!showForm); }}>
          <Plus className="h-4 w-4" /> {showForm ? "Cancel" : "New Package"}
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <form action={handleSubmit} className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 space-y-4">
          <h3 className="font-semibold text-white">{editing ? "Edit Package" : "Create Package"}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input name="name" label="Package Name" defaultValue={editing?.name || ""} required className="bg-gray-800 border-gray-700 text-white" />
            <Select
              name="tier"
              label="Tier"
              options={[
                { value: "silver", label: "Silver" },
                { value: "golden", label: "Golden" },
                { value: "diamond", label: "Diamond" },
                { value: "custom", label: "Custom" },
              ]}
              defaultValue={editing?.tier || "silver"}
            />
            <Input name="tagline" label="Tagline" defaultValue={editing?.tagline || ""} className="bg-gray-800 border-gray-700 text-white" />
            <Input name="price" label="Price (₹)" type="number" defaultValue={editing?.price?.toString() || ""} required className="bg-gray-800 border-gray-700 text-white" />
            <Input name="original_price" label="Original Price (₹)" type="number" defaultValue={editing?.original_price?.toString() || ""} className="bg-gray-800 border-gray-700 text-white" />
            <Input name="display_order" label="Display Order" type="number" defaultValue={editing?.display_order?.toString() || "0"} className="bg-gray-800 border-gray-700 text-white" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-300 mb-1 block">Description</label>
            <textarea name="description" rows={3} defaultValue={editing?.description || ""} className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-sm text-white" />
          </div>
          <Input name="cover_image" label="Cover Image URL" defaultValue={editing?.cover_image || ""} className="bg-gray-800 border-gray-700 text-white" />
          <div>
            <label className="text-sm font-medium text-gray-300 mb-1 block">Features (JSON array of {`{title, desc}`})</label>
            <textarea name="features" rows={4} defaultValue={JSON.stringify(editing?.features || [], null, 2)} className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-sm text-white font-mono" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-300 mb-1 block">Inclusions (JSON array of strings)</label>
            <textarea name="inclusions" rows={3} defaultValue={JSON.stringify(editing?.inclusions || [], null, 2)} className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-sm text-white font-mono" />
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input type="checkbox" name="is_popular" value="true" defaultChecked={editing?.is_popular} />
              Mark as Popular
            </label>
          </div>
          <Button type="submit" loading={isPending}>
            {editing ? "Update Package" : "Create Package"}
          </Button>
        </form>
      )}

      {/* Packages List */}
      <div className="space-y-3">
        {packages.map((pkg) => {
          const Icon = tierIcons[pkg.tier] || Sparkles;
          return (
            <div key={pkg.id} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Icon className={`h-8 w-8 ${tierColors[pkg.tier] || "text-gray-400"}`} />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-white">{pkg.name}</p>
                    <Badge className="text-xs capitalize">{pkg.tier}</Badge>
                    {pkg.is_popular && <Badge variant="gold" className="text-xs">Popular</Badge>}
                    {!pkg.is_active && <Badge variant="danger" className="text-xs">Inactive</Badge>}
                  </div>
                  <p className="text-sm text-gray-400 mt-0.5">
                    {formatPrice(pkg.price)}
                    {pkg.original_price && <span className="line-through ml-2 text-gray-500">{formatPrice(pkg.original_price)}</span>}
                    {" · "}{pkg.inclusions.length} inclusions
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => { setEditing(pkg); setShowForm(true); }}
                  className="text-gray-400 hover:text-white"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(pkg.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
