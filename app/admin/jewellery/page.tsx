"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Diamond,
  Gem,
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Image as ImageIcon,
  RefreshCw,
  Star,
} from "lucide-react";

export interface AdminJewellery {
  id: string;
  name: string;
  price: number;

  // Jewellery-specific fields
  metal_type_purity?: string;
  gross_weight_grams?: number;
  report_number?: string;
  report_date?: string;
  authorized_seal_signature?: string;

  // Gemstone fields (from gem form)
  gemstone_name?: string;
  gemstone_type?: string;
  carat_weight?: number;
  cut_and_shape?: string;
  color_and_clarity?: string;
  gem_identification?: string;
  gem_weight_carats?: string;
  gem_color?: string;
  gem_clarity?: string;
  gem_dimensions?: string;
  gem_treatments?: string;
  gem_origin?: string;

  images?: string[];
  image_url?: string;
  stock_quantity: number;
  is_active: boolean;
  is_month_highlight?: boolean;
  created_at: string;
  updated_at?: string;
}

function normalizeItem(item: any): AdminJewellery {
  const images: string[] = Array.isArray(item?.images) ? item.images : [];
  return {
    ...item,
    images,
    image_url: item?.image_url ?? images[0] ?? "",
    stock_quantity:
      typeof item?.stock_quantity === "number" ? item.stock_quantity : 0,
    is_active: !!item?.is_active,
    is_month_highlight: !!item?.is_month_highlight,
    price: typeof item?.price === "number" ? item.price : Number(item?.price || 0),
    created_at: item?.created_at ?? new Date().toISOString(),
  } as AdminJewellery;
}

function getCsrfTokenFromCookie() {
  return (
    document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrfToken="))
      ?.split("=")[1] || ""
  );
}

export default function AdminJewelleryPage() {
  const [items, setItems] = useState<AdminJewellery[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Inactive">(
    "All"
  );

  const [editing, setEditing] = useState<AdminJewellery | null>(null);
  const [form, setForm] = useState({
    // Required fields
    name: "",
    price: 0,
    stock_quantity: 0,
    is_active: true,

    // Jewellery-specific fields (optional)
    metal_type_purity: "",
    gross_weight_grams: "",
    report_number: "",
    report_date: "",
    authorized_seal_signature: "",

    // Gemstone fields (all from gem form - optional)
    gemstone_name: "",
    gemstone_type: "",
    carat_weight: "",
    cut_and_shape: "",
    color_and_clarity: "",
    gem_identification: "",
    gem_weight_carats: "",
    gem_color: "",
    gem_clarity: "",
    gem_dimensions: "",
    gem_treatments: "",
    gem_origin: "",

    image_url: "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  async function fetchItems() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/jewellery", {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch jewellery");
      }

      const data = await res.json();
      const list = Array.isArray(data?.jewellery) ? data.jewellery : [];
      setItems(list.map(normalizeItem));
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "Failed to fetch jewellery");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchItems();
  }, []);

  const filteredItems = useMemo(() => {
    let result = [...items];

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((p) => {
        const hay = [
          p.name,
          p.metal_type_purity,
          p.report_number,
          p.gemstone_type,
          p.gemstone_name,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      });
    }

    if (statusFilter === "Active") {
      result = result.filter((p) => p.is_active);
    } else if (statusFilter === "Inactive") {
      result = result.filter((p) => !p.is_active);
    }

    return result;
  }, [items, searchQuery, statusFilter]);

  function resetForm() {
    setEditing(null);
    setSelectedFile(null);
    setForm({
      name: "",
      price: 0,
      stock_quantity: 0,
      is_active: true,

      metal_type_purity: "",
      gross_weight_grams: "",
      report_number: "",
      report_date: "",
      authorized_seal_signature: "",

      gemstone_name: "",
      gemstone_type: "",
      carat_weight: "",
      cut_and_shape: "",
      color_and_clarity: "",
      gem_identification: "",
      gem_weight_carats: "",
      gem_color: "",
      gem_clarity: "",
      gem_dimensions: "",
      gem_treatments: "",
      gem_origin: "",

      image_url: "",
    });
    setError(null);
  }

  function startEdit(item: AdminJewellery) {
    setEditing(item);
    setSelectedFile(null);
    setForm({
      name: item.name,
      price: item.price,
      stock_quantity: item.stock_quantity,
      is_active: item.is_active,

      metal_type_purity: item.metal_type_purity || "",
      gross_weight_grams:
        item.gross_weight_grams !== undefined && item.gross_weight_grams !== null
          ? String(item.gross_weight_grams)
          : "",
      report_number: item.report_number || "",
      report_date: item.report_date || "",
      authorized_seal_signature: item.authorized_seal_signature || "",

      gemstone_name: item.gemstone_name || "",
      gemstone_type: item.gemstone_type || "",
      carat_weight:
        item.carat_weight !== undefined && item.carat_weight !== null
          ? String(item.carat_weight)
          : "",
      cut_and_shape: item.cut_and_shape || "",
      color_and_clarity: item.color_and_clarity || "",
      gem_identification: item.gem_identification || "",
      gem_weight_carats: item.gem_weight_carats || "",
      gem_color: item.gem_color || "",
      gem_clarity: item.gem_clarity || "",
      gem_dimensions: item.gem_dimensions || "",
      gem_treatments: item.gem_treatments || "",
      gem_origin: item.gem_origin || "",

      image_url: item.image_url || item.images?.[0] || "",
    });
    setError(null);
  }

  async function uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "jewellery");

    const csrf = getCsrfTokenFromCookie();

    const res = await fetch("/api/admin/upload", {
      method: "POST",
      headers: {
        "x-csrf-token": csrf,
      },
      body: formData,
      credentials: "include",
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data?.error || "Failed to upload image");
    }

    const data = await res.json();
    return data.url;
  }

  async function saveItem() {
    // Validate required fields
    if (!form.name.trim()) {
      setError("Product name is required");
      return;
    }
    if (form.price <= 0) {
      setError("Price must be greater than 0");
      return;
    }
    if (form.stock_quantity < 0) {
      setError("Stock quantity cannot be negative");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      let imageUrl = form.image_url;
      if (selectedFile) {
        setUploading(true);
        try {
          imageUrl = await uploadImage(selectedFile);
        } finally {
          setUploading(false);
        }
      }

      const payload: any = {
        name: form.name,
        price: Number(form.price),
        stock_quantity: Number(form.stock_quantity) || 0,
        is_active: !!form.is_active,

        // Jewellery fields
        metal_type_purity: form.metal_type_purity || undefined,
        gross_weight_grams:
          form.gross_weight_grams !== "" ? Number(form.gross_weight_grams) : undefined,
        report_number: form.report_number || undefined,
        report_date: form.report_date || undefined,
        authorized_seal_signature: form.authorized_seal_signature || undefined,

        // Gemstone fields
        gemstone_name: form.gemstone_name || undefined,
        gemstone_type: form.gemstone_type || undefined,
        carat_weight: form.carat_weight !== "" ? Number(form.carat_weight) : undefined,
        cut_and_shape: form.cut_and_shape || undefined,
        color_and_clarity: form.color_and_clarity || undefined,
        gem_identification: form.gem_identification || undefined,
        gem_weight_carats: form.gem_weight_carats || undefined,
        gem_color: form.gem_color || undefined,
        gem_clarity: form.gem_clarity || undefined,
        gem_dimensions: form.gem_dimensions || undefined,
        gem_treatments: form.gem_treatments || undefined,
        gem_origin: form.gem_origin || undefined,

        images: imageUrl ? [imageUrl] : [],
      };

      const csrf = getCsrfTokenFromCookie();

      if (editing) {
        const res = await fetch("/api/admin/jewellery", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-csrf-token": csrf,
          },
          credentials: "include",
          body: JSON.stringify({ id: editing.id, ...payload }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.error || "Failed to update jewellery");
        }

        const updated = normalizeItem(await res.json());
        setItems((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        resetForm();
      } else {
        const res = await fetch("/api/admin/jewellery", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-csrf-token": csrf,
          },
          credentials: "include",
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.error || "Failed to create jewellery");
        }

        const created = normalizeItem(await res.json());
        setItems((prev) => [created, ...prev]);
        resetForm();
      }
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "Failed to save jewellery");
    } finally {
      setSaving(false);
      setUploading(false);
    }
  }

  async function deleteItem(item: AdminJewellery) {
    if (!confirm(`Are you sure you want to delete "${item.name}"?`)) return;

    setSaving(true);
    setError(null);
    try {
      const csrf = getCsrfTokenFromCookie();
      const res = await fetch(`/api/admin/jewellery?id=${item.id}`, {
        method: "DELETE",
        headers: {
          "x-csrf-token": csrf,
        },
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to delete jewellery");
      }

      setItems((prev) => prev.filter((p) => p.id !== item.id));
      if (editing?.id === item.id) resetForm();
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "Failed to delete jewellery");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(item: AdminJewellery) {
    setSaving(true);
    setError(null);
    try {
      const csrf = getCsrfTokenFromCookie();
      const res = await fetch("/api/admin/jewellery", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrf,
        },
        credentials: "include",
        body: JSON.stringify({ id: item.id, is_active: !item.is_active }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to update status");
      }

      const updated = normalizeItem(await res.json());
      setItems((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "Failed to update status");
    } finally {
      setSaving(false);
    }
  }

  async function setMonthHighlight(item: AdminJewellery, enabled: boolean) {
    setSaving(true);
    setError(null);
    try {
      const csrf = getCsrfTokenFromCookie();
      const res = await fetch("/api/admin/jewellery", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrf,
        },
        credentials: "include",
        body: JSON.stringify({ id: item.id, is_month_highlight: enabled }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to update highlight");
      }

      // API returns the updated item; update list and enforce single highlight locally.
      const updated = normalizeItem(await res.json());
      setItems((prev) =>
        prev.map((p) => {
          if (enabled) {
            return { ...p, is_month_highlight: p.id === updated.id };
          }
          return p.id === updated.id ? { ...p, is_month_highlight: false } : p;
        })
      );
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "Failed to update highlight");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Diamond className="h-7 w-7" />
          <div>
            <h1 className="text-2xl font-bold">Jewellery</h1>
            <p className="text-sm text-muted-foreground">
              Manage your certified jewellery products with gemstone details
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchItems} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={resetForm} variant="secondary">
            <Plus className="h-4 w-4 mr-2" />
            New
          </Button>
        </div>
      </div>

      {error ? (
        <Card className="border-red-500/30">
          <CardContent className="py-4 text-red-600">{error}</CardContent>
        </Card>
      ) : null}

      {/* Form with Two Sections */}
      <Card>
        <CardHeader>
          <CardTitle>{editing ? "Edit Jewellery" : "Add New Jewellery"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* TOP SECTION: Jewellery Information */}
          <div className="border rounded-lg p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-slate-800 dark:to-slate-700">
            <div className="flex items-center gap-2 mb-4">
              <Diamond className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-300">Jewellery Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-purple-700 dark:text-purple-300">Name *</Label>
                <Input 
                  value={form.name} 
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} 
                  placeholder="e.g., Diamond Ring"
                  className="border-purple-200"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-purple-700 dark:text-purple-300">Price (USD) *</Label>
                <Input 
                  type="number" 
                  value={form.price} 
                  onChange={(e) => setForm((p) => ({ ...p, price: Number(e.target.value) }))} 
                  placeholder="2500.00"
                  className="border-purple-200"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-purple-700 dark:text-purple-300">Stock Quantity *</Label>
                <Input 
                  type="number" 
                  value={form.stock_quantity} 
                  onChange={(e) => setForm((p) => ({ ...p, stock_quantity: Number(e.target.value) }))} 
                  placeholder="5"
                  className="border-purple-200"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-purple-700 dark:text-purple-300">Metal Type & Purity</Label>
                <Input 
                  value={form.metal_type_purity} 
                  onChange={(e) => setForm((p) => ({ ...p, metal_type_purity: e.target.value }))} 
                  placeholder="18K White Gold"
                  className="border-purple-200"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-purple-700 dark:text-purple-300">Gross Weight (grams)</Label>
                <Input 
                  type="number" 
                  value={form.gross_weight_grams} 
                  onChange={(e) => setForm((p) => ({ ...p, gross_weight_grams: e.target.value }))} 
                  placeholder="5.5"
                  className="border-purple-200"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-purple-700 dark:text-purple-300">Report Number</Label>
                <Input 
                  value={form.report_number} 
                  onChange={(e) => setForm((p) => ({ ...p, report_number: e.target.value }))} 
                  placeholder="GIA-123456"
                  className="border-purple-200"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-purple-700 dark:text-purple-300">Report Date</Label>
                <Input 
                  type="date" 
                  value={form.report_date} 
                  onChange={(e) => setForm((p) => ({ ...p, report_date: e.target.value }))} 
                  className="border-purple-200"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-purple-700 dark:text-purple-300">Authorized Seal & Signature</Label>
                <Input 
                  value={form.authorized_seal_signature} 
                  onChange={(e) => setForm((p) => ({ ...p, authorized_seal_signature: e.target.value }))} 
                  placeholder="Authorized by..."
                  className="border-purple-200"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-purple-700 dark:text-purple-300">Status</Label>
                <Select
                  value={form.is_active ? "active" : "inactive"}
                  onValueChange={(v) => setForm((p) => ({ ...p, is_active: v === "active" }))}
                >
                  <SelectTrigger className="border-purple-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* BOTTOM SECTION: Gemstone Information */}
          <div className="border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-slate-800 dark:to-slate-700">
            <div className="flex items-center gap-2 mb-4">
              <Gem className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300">Gemstone on Jewellery</h3>
              <span className="text-sm text-blue-600 dark:text-blue-400">(Optional - Details about the gem mounted on this jewellery)</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-blue-700 dark:text-blue-300">Gemstone Name</Label>
                <Input 
                  value={form.gemstone_name} 
                  onChange={(e) => setForm((p) => ({ ...p, gemstone_name: e.target.value }))} 
                  placeholder="Ceylon Blue Sapphire"
                  className="border-blue-200"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-blue-700 dark:text-blue-300">Identification</Label>
                <Input 
                  value={form.gem_identification} 
                  onChange={(e) => setForm((p) => ({ ...p, gem_identification: e.target.value }))} 
                  placeholder="Natural Blue Sapphire"
                  className="border-blue-200"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-blue-700 dark:text-blue-300">Gemstone Type (Natural/Synthetic)</Label>
                <Input 
                  value={form.gemstone_type} 
                  onChange={(e) => setForm((p) => ({ ...p, gemstone_type: e.target.value }))} 
                  placeholder="Natural"
                  className="border-blue-200"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-blue-700 dark:text-blue-300">Weight (Carats)</Label>
                <Input 
                  value={form.gem_weight_carats} 
                  onChange={(e) => setForm((p) => ({ ...p, gem_weight_carats: e.target.value }))} 
                  placeholder="2.50"
                  className="border-blue-200"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-blue-700 dark:text-blue-300">Carat Weight (cts)</Label>
                <Input 
                  type="number" 
                  value={form.carat_weight} 
                  onChange={(e) => setForm((p) => ({ ...p, carat_weight: e.target.value }))} 
                  placeholder="2.50"
                  className="border-blue-200"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-blue-700 dark:text-blue-300">Shape / Cut</Label>
                <Input 
                  value={form.cut_and_shape} 
                  onChange={(e) => setForm((p) => ({ ...p, cut_and_shape: e.target.value }))} 
                  placeholder="Oval Brilliant"
                  className="border-blue-200"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-blue-700 dark:text-blue-300">Color</Label>
                <Input 
                  value={form.gem_color} 
                  onChange={(e) => setForm((p) => ({ ...p, gem_color: e.target.value }))} 
                  placeholder="Royal Blue"
                  className="border-blue-200"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-blue-700 dark:text-blue-300">Clarity</Label>
                <Input 
                  value={form.gem_clarity} 
                  onChange={(e) => setForm((p) => ({ ...p, gem_clarity: e.target.value }))} 
                  placeholder="VS"
                  className="border-blue-200"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-blue-700 dark:text-blue-300">Color & Clarity Combined</Label>
                <Input 
                  value={form.color_and_clarity} 
                  onChange={(e) => setForm((p) => ({ ...p, color_and_clarity: e.target.value }))} 
                  placeholder="Royal Blue / VS"
                  className="border-blue-200"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-blue-700 dark:text-blue-300">Dimensions</Label>
                <Input 
                  value={form.gem_dimensions} 
                  onChange={(e) => setForm((p) => ({ ...p, gem_dimensions: e.target.value }))} 
                  placeholder="8.0 x 6.0 x 4.2 mm"
                  className="border-blue-200"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-blue-700 dark:text-blue-300">Treatments</Label>
                <Input 
                  value={form.gem_treatments} 
                  onChange={(e) => setForm((p) => ({ ...p, gem_treatments: e.target.value }))} 
                  placeholder="Heat"
                  className="border-blue-200"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-blue-700 dark:text-blue-300">Origin</Label>
                <Input 
                  value={form.gem_origin} 
                  onChange={(e) => setForm((p) => ({ ...p, gem_origin: e.target.value }))} 
                  placeholder="Sri Lanka"
                  className="border-blue-200"
                />
              </div>
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="border rounded-lg p-4">
            <Label className="flex items-center gap-2 mb-3">
              <ImageIcon className="h-4 w-4" /> Product Image
            </Label>
            <div className="flex flex-col md:flex-row gap-3">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
              <Input
                placeholder="Or paste image URL"
                value={form.image_url}
                onChange={(e) => setForm((p) => ({ ...p, image_url: e.target.value }))}
              />
            </div>
            {(selectedFile || form.image_url) && (
              <div className="mt-3 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedFile ? URL.createObjectURL(selectedFile) : form.image_url}
                  alt="Preview"
                  className="w-16 h-16 object-cover rounded-lg border"
                />
                <span className="text-sm text-muted-foreground">
                  {selectedFile ? selectedFile.name : "URL Image"}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button onClick={saveItem} disabled={saving || uploading || !form.name}>
              {saving ? "Saving..." : editing ? "Update Jewellery" : "Create Jewellery"}
            </Button>
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            {uploading && (
              <span className="text-sm text-muted-foreground">Uploading image...</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Items List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <CardTitle>Jewellery Items</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  className="pl-9 w-72"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as any)}
              >
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">Loading...</div>
          ) : filteredItems.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No items found.</div>
          ) : (
            <div className="space-y-3">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-md bg-muted overflow-hidden flex items-center justify-center">
                      {item.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold">{item.name}</div>
                      <div className="text-sm text-muted-foreground">
                        ${item.price} • Stock: {item.stock_quantity}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        {item.is_month_highlight ? (
                          <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-black">
                            <Star className="h-3 w-3 mr-1" /> Highlight
                          </Badge>
                        ) : null}
                        <Badge variant={item.is_active ? "default" : "secondary"}>
                          {item.is_active ? "Active" : "Inactive"}
                        </Badge>
                        {item.metal_type_purity ? (
                          <Badge variant="outline">{item.metal_type_purity}</Badge>
                        ) : null}
                        {item.gemstone_name ? (
                          <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900">
                            💎 {item.gemstone_name}
                          </Badge>
                        ) : null}
                        {item.report_number ? (
                          <Badge variant="outline">Report: {item.report_number}</Badge>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setMonthHighlight(item, !item.is_month_highlight)}
                      disabled={saving}
                      title={item.is_month_highlight ? "Remove monthly highlight" : "Set as monthly highlight"}
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => startEdit(item)}>
                      <Edit3 className="h-4 w-4 mr-2" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleActive(item)}
                      disabled={saving}
                    >
                      {item.is_active ? (
                        <>
                          <EyeOff className="h-4 w-4 mr-2" /> Hide
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-2" /> Show
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteItem(item)}
                      disabled={saving}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

