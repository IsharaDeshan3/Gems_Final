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
  CheckCircle2,
  XCircle,
  AlertCircle,
  Image as ImageIcon,
  RefreshCw,
  Calendar,
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
  const [creating, setCreating] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priceRange, setPriceRange] = useState("All");

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

    images: [] as string[],
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [mounted, setMounted] = useState(false);

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
    setMounted(true);
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

    if (statusFilter !== "All") {
      if (statusFilter === "Active") {
        result = result.filter((p) => p.is_active);
      } else if (statusFilter === "Inactive") {
        result = result.filter((p) => !p.is_active);
      } else if (statusFilter === "Out of Stock") {
        result = result.filter((p) => p.stock_quantity === 0);
      } else if (statusFilter === "Low Stock") {
        result = result.filter(
          (p) => p.stock_quantity > 0 && p.stock_quantity <= 5
        );
      }
    }

    if (priceRange !== "All") {
      if (priceRange === "Under $1000") {
        result = result.filter((p) => p.price < 1000);
      } else if (priceRange === "$1000-$5000") {
        result = result.filter((p) => p.price >= 1000 && p.price <= 5000);
      } else if (priceRange === "$5000-$10000") {
        result = result.filter((p) => p.price > 5000 && p.price <= 10000);
      } else if (priceRange === "Over $10000") {
        result = result.filter((p) => p.price > 10000);
      }
    }

    return result;
  }, [items, searchQuery, statusFilter, priceRange]);

  function resetForm() {
    setEditing(null);
    setCreating(false);
    setSelectedFiles([]);
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

      images: [],
    });
    setError(null);
  }

  function startEdit(item: AdminJewellery) {
    setEditing(item);
    setCreating(true);
    setSelectedFiles([]);
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

      images: item.images || [],
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
      let allImages: string[] = [...form.images];

      if (selectedFiles.length > 0) {
        setUploading(true);
        try {
          for (const file of selectedFiles) {
            const uploadedUrl = await uploadImage(file);
            allImages.push(uploadedUrl);
          }
        } catch (uploadError: any) {
          setError(`Image upload failed: ${uploadError.message}`);
          setUploading(false);
          setSaving(false);
          return;
        }
        setUploading(false);
      }

      allImages = allImages.slice(0, 5);

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

        images: allImages,
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

  function formatPrice(price: number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(price);
  }

  function getStockBadgeColor(quantity: number) {
    if (quantity === 0) return "from-red-500 to-pink-500";
    if (quantity <= 5) return "from-orange-500 to-amber-500";
    return "from-emerald-500 to-teal-500";
  }

  function getStockStatus(quantity: number) {
    if (quantity === 0) return "Out of Stock";
    if (quantity <= 5) return "Low Stock";
    return "In Stock";
  }

  if (!mounted) {
    return null;
  }

  const stats = {
    total: items.length,
    active: items.filter((p) => p.is_active).length,
    outOfStock: items.filter((p) => p.stock_quantity === 0).length,
    lowStock: items.filter(
      (p) => p.stock_quantity > 0 && p.stock_quantity <= 5
    ).length,
    totalValue: items.reduce((sum, p) => sum + p.price * p.stock_quantity, 0),
  };

  return (
    <div className="admin-products-page space-y-8">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-20 right-10 w-32 h-32 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full animate-pulse"></div>
        <div
          className="absolute bottom-20 left-10 w-24 h-24 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-full animate-bounce"
          style={{ animationDuration: "3s" }}
        ></div>
      </div>

      {/* Header Section with Stats */}
      <div className="relative z-10 backdrop-blur-md bg-white/80 dark:bg-slate-800/80 rounded-2xl p-6 shadow-2xl border border-white/20">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg">
              <Diamond className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                Jewellery
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Manage your certified jewellery products with gemstone details
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => {
                setCreating(!creating);
                setEditing(null);
                resetForm();
              }}
              className={`${
                creating
                  ? "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
                  : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              } text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}
            >
              {creating ? (
                <XCircle className="h-5 w-5 mr-2" />
              ) : (
                <Plus className="h-5 w-5 mr-2" />
              )}
              {creating ? "Cancel" : "Add Jewellery"}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
          <div className="bg-white/60 dark:bg-slate-700/60 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-slate-800 dark:text-white">
              {stats.total}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">
              Total Products
            </div>
          </div>
          <div className="bg-white/60 dark:bg-slate-700/60 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-emerald-600">
              {stats.active}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">
              Active
            </div>
          </div>
          <div className="bg-white/60 dark:bg-slate-700/60 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {stats.outOfStock}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">
              Out of Stock
            </div>
          </div>
          <div className="bg-white/60 dark:bg-slate-700/60 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {stats.lowStock}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">
              Low Stock
            </div>
          </div>
          <div className="bg-white/60 dark:bg-slate-700/60 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {formatPrice(stats.totalValue)}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">
              Total Value
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <div className="flex items-center text-red-600 dark:text-red-400">
            <AlertCircle className="h-4 w-4 mr-2" />
            {error}
          </div>
        </div>
      )}

      {/* Form with Two Sections */}
      {(creating || editing) && (
        <Card
          className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border-0 shadow-2xl rounded-2xl overflow-hidden"
          style={{ animation: "slideDown 0.5s ease-out" }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-purple-500/5"></div>
          <CardHeader className="relative z-10 bg-gradient-to-r from-slate-50 to-purple-50 dark:from-slate-800 dark:to-slate-700 border-b border-slate-200/50 dark:border-slate-600/50">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-lg">
                <Diamond className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-slate-800 dark:text-white">
                {editing ? "Edit Jewellery" : "Add New Jewellery"}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="relative z-10 p-6 space-y-6">
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
              <ImageIcon className="h-4 w-4" /> Product Images (Up to 5)
            </Label>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    const totalImages = form.images.length + selectedFiles.length + files.length;
                    if (totalImages > 5) {
                      setError("Maximum 5 images allowed");
                      return;
                    }
                    setSelectedFiles([...selectedFiles, ...files]);
                  }}
                  className="hidden"
                  id="jewellery-image-upload"
                  disabled={form.images.length + selectedFiles.length >= 5}
                />
                <label
                  htmlFor="jewellery-image-upload"
                  className={`flex items-center px-4 py-2 rounded-lg cursor-pointer transition-all ${
                    form.images.length + selectedFiles.length >= 5
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
                  }`}
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Add Images ({form.images.length + selectedFiles.length}/5)
                </label>
              </div>

              {form.images.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Existing Images:
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {form.images.map((url, index) => (
                      <div key={`existing-${index}`} className="relative group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt={`Existing ${index + 1}`}
                          className="w-20 h-20 object-cover rounded-lg border-2 border-slate-200 dark:border-slate-600"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setForm({ ...form, images: form.images.filter((_, i) => i !== index) });
                          }}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    New Images to Upload:
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {selectedFiles.map((file, index) => (
                      <div key={`new-${index}`} className="relative group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`New ${index + 1}`}
                          className="w-20 h-20 object-cover rounded-lg border-2 border-blue-400"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
                          }}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
                        >
                          ✕
                        </button>
                        <p className="text-xs text-center mt-1 truncate w-20">{file.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                Upload up to 5 images for this product. Supported formats: JPG, PNG, WebP
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="md:col-span-2 flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={resetForm}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              onClick={saveItem}
              disabled={saving || uploading || !form.name}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-lg px-6"
            >
              {uploading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : saving ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  {editing ? "Update Jewellery" : "Create Jewellery"}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
      )}

      {/* Filters Section */}
      <Card className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border-0 shadow-lg rounded-xl">
        <CardContent className="p-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 bg-white/60 dark:bg-slate-700/60 border-slate-200 dark:border-slate-600 rounded-xl"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-11 bg-white/60 dark:bg-slate-700/60 border-slate-200 dark:border-slate-600 rounded-xl">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                <SelectItem value="Low Stock">Low Stock</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger className="h-11 bg-white/60 dark:bg-slate-700/60 border-slate-200 dark:border-slate-600 rounded-xl">
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Prices</SelectItem>
                <SelectItem value="Under $1000">Under $1,000</SelectItem>
                <SelectItem value="$1000-$5000">$1,000 - $5,000</SelectItem>
                <SelectItem value="$5000-$10000">$5,000 - $10,000</SelectItem>
                <SelectItem value="Over $10000">Over $10,000</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("All");
                setPriceRange("All");
              }}
              variant="outline"
              className="h-11 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 scr-y">
        {filteredItems.map((item, index) => (
          <Card
            key={item.id}
            className="group backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border-0 shadow-lg hover:shadow-2xl rounded-xl overflow-hidden transition-all duration-300 transform hover:scale-105 hover:-translate-y-2"
            style={{
              animationDelay: `${index * 0.1}s`,
              animation: mounted ? "fadeInUp 0.6s ease-out forwards" : "none",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 to-purple-50/50 dark:from-slate-800/50 dark:to-slate-700/50"></div>

            {/* Product Image */}
            <div className="relative h-48 overflow-hidden">
              <img
                src={
                  item.image_url ||
                  "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300&h=300&fit=crop"
                }
                alt={item.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300&h=300&fit=crop";
                }}
              />
              <div className="absolute top-3 right-3 flex flex-col space-y-2">
                {item.is_month_highlight ? (
                  <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-black border-0 text-xs">
                    <Star className="h-3 w-3 mr-1" /> Highlight
                  </Badge>
                ) : null}
                <Badge
                  className={`bg-gradient-to-r ${
                    item.is_active
                      ? "from-emerald-500 to-teal-500"
                      : "from-red-500 to-pink-500"
                  } text-white border-0 text-xs`}
                >
                  {item.is_active ? "Active" : "Inactive"}
                </Badge>
                <Badge
                  className={`bg-gradient-to-r ${getStockBadgeColor(
                    item.stock_quantity
                  )} text-white border-0 text-xs`}
                >
                  {getStockStatus(item.stock_quantity)}
                </Badge>
              </div>
            </div>

            <CardContent className="relative z-10 p-4">
              <div className="space-y-3">
                <div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-white line-clamp-1">
                    {item.name}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mt-1">
                    {item.metal_type_purity ||
                      item.gemstone_name ||
                      item.report_number ||
                      item.gem_identification ||
                      ""}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-purple-600">
                    {formatPrice(item.price)}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    Stock: {item.stock_quantity}
                  </div>
                </div>

                <div className="text-xs text-slate-400 flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  Created {new Date(item.created_at).toLocaleDateString()}
                </div>

                {/* Actions */}
                <div className="flex space-x-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setMonthHighlight(item, !item.is_month_highlight)}
                    className="h-8 text-xs border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
                    title={item.is_month_highlight ? "Remove monthly highlight" : "Set as monthly highlight"}
                  >
                    <Star className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => startEdit(item)}
                    className="flex-1 h-8 text-xs border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    <Edit3 className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleActive(item)}
                    className="h-8 text-xs border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
                    disabled={saving}
                  >
                    {item.is_active ? (
                      <EyeOff className="h-3 w-3" />
                    ) : (
                      <Eye className="h-3 w-3" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteItem(item)}
                    className="h-8 text-xs bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 border-0"
                    disabled={saving}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <Card className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border-0 shadow-lg rounded-xl">
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 rounded-full flex items-center justify-center">
              <Diamond className="h-8 w-8 text-slate-500 dark:text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
              {items.length === 0
                ? "No Jewellery Found"
                : "No Jewellery Match Your Filters"}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-4">
              {items.length === 0
                ? "Start building your jewellery collection by adding your first item."
                : "Try adjusting your search criteria or filters to find more items."}
            </p>
            {items.length === 0 && (
              <Button
                onClick={() => {
                  setCreating(true);
                  setEditing(null);
                  resetForm();
                }}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Jewellery
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-2xl text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-purple-500 mx-auto mb-4" />
            <p className="text-slate-700 dark:text-slate-300">Processing...</p>
          </div>
        </div>
      )}

      <style jsx>{`
        .admin-products-page {
          font-size: 1.6rem;
        }

        .admin-products-page * {
          font-size: inherit;
        }

        .admin-products-page .text-xs {
          font-size: 1.2rem;
        }
        .admin-products-page .text-sm {
          font-size: 1.4rem;
        }
        .admin-products-page .text-base {
          font-size: 1.6rem;
        }
        .admin-products-page .text-lg {
          font-size: 1.8rem;
        }
        .admin-products-page .text-xl {
          font-size: 2rem;
        }
        .admin-products-page .text-2xl {
          font-size: 2.4rem;
        }
        .admin-products-page .text-3xl {
          font-size: 3rem;
        }

        .line-clamp-1 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
        }

        .line-clamp-2 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

