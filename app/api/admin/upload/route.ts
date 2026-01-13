import { NextRequest, NextResponse } from "next/server";
import { enforceCsrf, getAuthenticatedUser, isAdminRole } from "@/lib/auth/middleware-helper";
import { createClient } from '@supabase/supabase-js';
import { getRateLimitIdentifier, rateLimiters } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientId = getRateLimitIdentifier(request);
    const rl = await rateLimiters.api(`admin_upload:${clientId}`);
    if (!rl.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const { user, error } = await getAuthenticatedUser(request);
    if (error || !user || !isAdminRole(user.role)) {
      return NextResponse.json(
        { error: error || "Forbidden - Admin access required" },
        { status: error ? 401 : 403 }
      );
    }

    const csrf = enforceCsrf(request);
    if (!csrf.ok) {
      return NextResponse.json({ error: csrf.error }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    const folderRaw = (formData.get('folder') as string | null) || 'gems';
    const folder = folderRaw.trim().toLowerCase();

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate folder (prevent path traversal / arbitrary prefixes)
    if (!/^[a-z0-9_-]+$/.test(folder)) {
      return NextResponse.json(
        { error: "Invalid folder name" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: "Only image files are allowed" },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 }
      );
    }

    // Generate unique filename with proper extension
    const fileName = file.name || 'upload';
    const fileExt = fileName.includes('.') ? fileName.split('.').pop() : 'jpg'; // Default to jpg if no extension
    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${folder}/${uniqueFileName}`;

    // Use service role client for storage operations (bypasses RLS)
    const serviceSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Convert file to buffer if needed
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Upload to Supabase Storage using service role
    const { data, error: uploadError } = await serviceSupabase.storage
      .from('gems-images')
      .upload(filePath, fileBuffer, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return NextResponse.json(
        { error: `Failed to upload image: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Get public URL using service client
    const { data: { publicUrl } } = serviceSupabase.storage
      .from('gems-images')
      .getPublicUrl(filePath);

    return NextResponse.json({
      url: publicUrl,
      path: filePath
    }, { status: 200 });

  } catch (error: any) {
    console.error("Unexpected error in upload:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload file" },
      { status: 500 }
    );
  }
}
