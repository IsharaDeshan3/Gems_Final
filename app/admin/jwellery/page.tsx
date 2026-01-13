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
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Image as ImageIcon,
  RefreshCw,
} from "lucide-react";

export interface AdminJwellery {
  id: string;
  name: string;
  price: number;

  metal_type_purity?: string;
  gross_weight_grams?: number;
  gemstone_type?: string;
  carat_weight?: number;
  cut_and_shape?: string;
  color_and_clarity?: string;
  report_number?: string;
  report_date?: string;
  authorized_seal_signature?: string;

  images?: string[];
  image_url?: string;
  stock_quantity: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

function normalizeItem(item: any): AdminJwellery {
  const images: string[] = Array.isArray(item?.images) ? item.images : [];
  return {
    ...item,
    images,
    image_url: item?.image_url ?? images[0] ?? "",
    stock_quantity:
      typeof item?.stock_quantity === "number" ? item.stock_quantity : 0,
    is_active: !!item?.is_active,
    price: typeof item?.price === "number" ? item.price : Number(item?.price || 0),
    created_at: item?.created_at ?? new Date().toISOString(),
  } as AdminJwellery;
}

function getCsrfTokenFromCookie() {
  return (
    document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrfToken="))
      ?.split("=")[1] || ""
  );
}

export default function AdminJwelleryPage() {
  const [items, setItems] = useState<AdminJwellery[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Inactive">(
    "All"
  );

  const [editing, setEditing] = useState<AdminJwellery | null>(null);
  const [form, setForm] = useState({
    name: "",
    price: 0,
    stock_quantity: 0,
    is_active: true,

    metal_type_purity: "",
    gross_weight_grams: "",
    gemstone_type: "",
    carat_weight: "",
    cut_and_shape: "",
    color_and_clarity: "",
    report_number: "",
    report_date: "",
    authorized_seal_signature: "",

    image_url: "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  async function fetchItems() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/jwellery", {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch jwellery");
      }

      const data = await res.json();
      const list = Array.isArray(data?.jwellery) ? data.jwellery : [];
      setItems(list.map(normalizeItem));
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "Failed to fetch jwellery");
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
      gemstone_type: "",
      carat_weight: "",
      cut_and_shape: "",
      color_and_clarity: "",
      report_number: "",
      report_date: "",
      authorized_seal_signature: "",

      image_url: "",
    });
    setError(null);
  }

  function startEdit(item: AdminJwellery) {
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
      gemstone_type: item.gemstone_type || "",
      carat_weight:
        item.carat_weight !== undefined && item.carat_weight !== null
          ? String(item.carat_weight)
          : "",
      cut_and_shape: item.cut_and_shape || "",
      color_and_clarity: item.color_and_clarity || "",
      report_number: item.report_number || "",
      report_date: item.report_date || "",
      authorized_seal_signature: item.authorized_seal_signature || "",

      image_url: item.image_url || item.images?.[0] || "",
    });
    setError(null);
  }

  async function uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "jwellery");

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

        metal_type_purity: form.metal_type_purity || undefined,
        gross_weight_grams:
          form.gross_weight_grams !== "" ? Number(form.gross_weight_grams) : undefined,
        gemstone_type: form.gemstone_type || undefined,
        carat_weight: form.carat_weight !== "" ? Number(form.carat_weight) : undefined,
        cut_and_shape: form.cut_and_shape || undefined,
        color_and_clarity: form.color_and_clarity || undefined,
        report_number: form.report_number || undefined,
        report_date: form.report_date || undefined,
        authorized_seal_signature: form.authorized_seal_signature || undefined,

        images: imageUrl ? [imageUrl] : [],
      };

      const csrf = getCsrfTokenFromCookie();

      if (editing) {
        const res = await fetch("/api/admin/jwellery", {
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
          throw new Error(data?.error || "Failed to update jwellery");
        }

        const updated = normalizeItem(await res.json());
        setItems((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        resetForm();
      } else {
        const res = await fetch("/api/admin/jwellery", {
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
          throw new Error(data?.error || "Failed to create jwellery");
        }

        const created = normalizeItem(await res.json());
        setItems((prev) => [created, ...prev]);
        resetForm();
      }
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "Failed to save jwellery");
    } finally {
      setSaving(false);
      setUploading(false);
    }
  }

  async function deleteItem(item: AdminJwellery) {
    if (!confirm(`Are you sure you want to delete "${item.name}"?`)) return;

    setSaving(true);
    setError(null);
    try {
      const csrf = getCsrfTokenFromCookie();
      const res = await fetch(`/api/admin/jwellery?id=${item.id}`, {
        method: "DELETE",
        headers: {
          "x-csrf-token": csrf,
        },
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to delete jwellery");
      }

      setItems((prev) => prev.filter((p) => p.id !== item.id));
      if (editing?.id === item.id) resetForm();
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "Failed to delete jwellery");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(item: AdminJwellery) {
    setSaving(true);
    setError(null);
    try {
      const csrf = getCsrfTokenFromCookie();
      const res = await fetch("/api/admin/jwellery", {
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Diamond className="h-7 w-7" />
          <div>
            <h1 className="text-2xl font-bold">Jwellery</h1>
            <p className="text-sm text-muted-foreground">
              Manage your certified jwellery products
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

      <Card>
        <CardHeader>
          <CardTitle>{editing ? "Edit Jwellery" : "Add New Jwellery"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Price</Label>
              <Input type="number" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: Number(e.target.value) }))} />
            </div>
            <div className="space-y-2">
              <Label>Stock Quantity</Label>
              <Input type="number" value={form.stock_quantity} onChange={(e) => setForm((p) => ({ ...p, stock_quantity: Number(e.target.value) }))} />
            </div>

            <div className="space-y-2">
              <Label>Metal Type & Purity</Label>
              <Input value={form.metal_type_purity} onChange={(e) => setForm((p) => ({ ...p, metal_type_purity: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Gross Weight (g)</Label>
              <Input type="number" value={form.gross_weight_grams} onChange={(e) => setForm((p) => ({ ...p, gross_weight_grams: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Gemstone Type (Natural/Synthetic)</Label>
              <Input value={form.gemstone_type} onChange={(e) => setForm((p) => ({ ...p, gemstone_type: e.target.value }))} />
            </div>

            <div className="space-y-2">
              <Label>Carat Weight (cts)</Label>
              <Input type="number" value={form.carat_weight} onChange={(e) => setForm((p) => ({ ...p, carat_weight: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Cut & Shape</Label>
              <Input value={form.cut_and_shape} onChange={(e) => setForm((p) => ({ ...p, cut_and_shape: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Color & Clarity</Label>
              <Input value={form.color_and_clarity} onChange={(e) => setForm((p) => ({ ...p, color_and_clarity: e.target.value }))} />
            </div>

            <div className="space-y-2">
              <Label>Report Number</Label>
              <Input value={form.report_number} onChange={(e) => setForm((p) => ({ ...p, report_number: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Report Date</Label>
              <Input type="date" value={form.report_date} onChange={(e) => setForm((p) => ({ ...p, report_date: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Authorized Seal & Signature</Label>
              <Input value={form.authorized_seal_signature} onChange={(e) => setForm((p) => ({ ...p, authorized_seal_signature: e.target.value }))} />
            </div>

            <div className="space-y-2 md:col-span-2 lg:col-span-3">
              <Label className="flex items-center gap-2">
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
              <div className="text-xs text-muted-foreground">
                Upload uses the same storage bucket as gems.
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={form.is_active ? "active" : "inactive"}
                onValueChange={(v) => setForm((p) => ({ ...p, is_active: v === "active" }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-2">
            <Button onClick={saveItem} disabled={saving || uploading || !form.name}>
              {saving ? "Saving..." : editing ? "Update" : "Create"}
            </Button>
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            {uploading ? (
              <span className="text-sm text-muted-foreground">Uploading image...</span>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <CardTitle>Items</CardTitle>
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
                      <div className="mt-1 flex items-center gap-2">
                        <Badge variant={item.is_active ? "default" : "secondary"}>
                          {item.is_active ? "Active" : "Inactive"}
                        </Badge>
                        {item.metal_type_purity ? (
                          <Badge variant="outline">{item.metal_type_purity}</Badge>
                        ) : null}
                        {item.report_number ? (
                          <Badge variant="outline">Report: {item.report_number}</Badge>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
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
