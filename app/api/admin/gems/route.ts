import { NextRequest, NextResponse } from "next/server";
import { enforceCsrf, getAuthenticatedUser, isAdminRole, isHighAdminRole } from "@/lib/auth/middleware-helper";
import { getRepositoryFactory } from "@/lib/repositories";
import { rateLimiters, getRateLimitIdentifier } from "@/lib/rate-limit";
import { validateInput, ValidationRule } from "@/lib/validation";

// GET /api/admin/gems - Get all gems
export async function GET(request: NextRequest) {
  try {
    const { user, supabase, error } = await getAuthenticatedUser(request);
    if (error || !user || !isAdminRole(user.role)) {
      return NextResponse.json(
        { error: error || "Forbidden - Admin access required" },
        { status: error ? 401 : 403 }
      );
    }

    const gemRepository = getRepositoryFactory(supabase).getGemRepository();

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || undefined;
    const minPrice = searchParams.get("minPrice")
      ? parseFloat(searchParams.get("minPrice")!)
      : undefined;
    const maxPrice = searchParams.get("maxPrice")
      ? parseFloat(searchParams.get("maxPrice")!)
      : undefined;
    const isActive = searchParams.get("isActive")
      ? searchParams.get("isActive") === "true"
      : undefined;
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Fetch gems with filters
    let gems;
    if (search) {
      gems = await gemRepository.searchGems(search, limit);
    } else if (minPrice || maxPrice || isActive !== undefined) {
      gems = await gemRepository.findGemsWithFilters({
        minPrice,
        maxPrice,
        isActive
      }, limit, offset);
    } else {
      gems = await gemRepository.findAll(limit, offset);
    }

    return NextResponse.json({ gems }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching gems:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch gems" },
      { status: 500 }
    );
  }
}

// POST /api/admin/gems - Create new gem
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientId = getRateLimitIdentifier(request);
    const rateLimit = await rateLimiters.api(clientId);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const { user, supabase, error } = await getAuthenticatedUser(request);
    if (error || !user || !isHighAdminRole(user.role)) {
      return NextResponse.json(
        { error: error || "Forbidden - Admin access required" },
        { status: error ? 401 : 403 }
      );
    }

    const csrf = enforceCsrf(request);
    if (!csrf.ok) {
      return NextResponse.json({ error: csrf.error }, { status: 403 });
    }

    const gemRepository = getRepositoryFactory(supabase).getGemRepository();
    const auditLogRepository = getRepositoryFactory(supabase).getAuditLogRepository();

    const body = await request.json();

    // Validate input using validation utility
    const validationRules: ValidationRule[] = [
      { field: 'name', type: 'string', required: true },
      { field: 'price', type: 'number', required: true, min: 0, max: 10000000 },
      { field: 'identification', type: 'string', required: false },
      { field: 'weight_carats', type: 'string', required: false },
      { field: 'color', type: 'string', required: false },
      { field: 'clarity', type: 'string', required: false },
      { field: 'shape_and_cut', type: 'string', required: false },
      { field: 'dimensions', type: 'string', required: false },
      { field: 'treatments', type: 'string', required: false },
      { field: 'origin', type: 'string', required: false },
      { field: 'stock_quantity', type: 'number', required: false, min: 0, max: 100000 },
      { field: 'is_month_highlight', type: 'boolean', required: false },
    ];

    const validationResult = validateInput(body, validationRules);
    if (!validationResult.valid) {
      return NextResponse.json(
        { error: `Validation failed: ${validationResult.errors.map(e => e.message).join(', ')}` },
        { status: 400 }
      );
    }

    // Create gem data
    const gemData = {
      name: body.name,
      price: body.price,
      identification: body.identification,
      weight_carats: body.weight_carats,
      color: body.color,
      clarity: body.clarity,
      shape_and_cut: body.shape_and_cut,
      dimensions: body.dimensions,
      treatments: body.treatments,
      origin: body.origin,
      images: body.images || [],
      stock_quantity: body.stock_quantity || 0,
      is_active: body.is_active !== undefined ? body.is_active : true,
      is_month_highlight: body.is_month_highlight === true,
    };

    // Create gem
    const newGem = await gemRepository.create(gemData);

    // Enforce single highlight
    if (gemData.is_month_highlight) {
      await (supabase as any)
        .from('gems')
        .update({ is_month_highlight: false })
        .neq('id', newGem.id);
    }

    // Log the action
    await auditLogRepository.create({
      user_id: user.id,
      action: "CREATE_GEM",
      entity_type: "gem",
      entity_id: newGem.id,
      changes: {
        gemName: newGem.name,
        price: newGem.price,
        origin: newGem.origin,
      },
    });

    return NextResponse.json(newGem, { status: 201 });
  } catch (error: any) {
    console.error("Error creating gem:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create gem" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/gems - Update gem
export async function PUT(request: NextRequest) {
  try {
    const { user, supabase, error } = await getAuthenticatedUser(request);
    if (error || !user || !isHighAdminRole(user.role)) {
      return NextResponse.json(
        { error: error || "Forbidden - Admin access required" },
        { status: error ? 401 : 403 }
      );
    }

    const csrf = enforceCsrf(request);
    if (!csrf.ok) {
      return NextResponse.json({ error: csrf.error }, { status: 403 });
    }

    const gemRepository = getRepositoryFactory(supabase).getGemRepository();
    const auditLogRepository = getRepositoryFactory(supabase).getAuditLogRepository();

    const body = await request.json();

    // Validate gem ID
    if (!body.id) {
      return NextResponse.json(
        { error: "Gem ID is required" },
        { status: 400 }
      );
    }

    // Check if gem exists
    const existingGem = await gemRepository.findById(body.id);
    if (!existingGem) {
      return NextResponse.json({ error: "Gem not found" }, { status: 404 });
    }

    // Validate price if provided
    if (body.price !== undefined) {
      if (typeof body.price !== "number" || body.price < 0) {
        return NextResponse.json(
          { error: "Price must be a non-negative number" },
          { status: 400 }
        );
      }
    }

    // Validate stock if provided
    if (body.stock_quantity !== undefined) {
      if (typeof body.stock_quantity !== "number" || body.stock_quantity < 0) {
        return NextResponse.json(
          { error: "Stock quantity must be a non-negative number" },
          { status: 400 }
        );
      }
    }

    // Prepare update data (only include provided fields)
    const updateData: any = {};
    const allowedFields = [
      "name",
      "price",
      "identification",
      "weight_carats",
      "color",
      "clarity",
      "shape_and_cut",
      "dimensions",
      "treatments",
      "origin",
      "images",
      "stock_quantity",
      "is_active",
      "is_month_highlight",
    ];

    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    });

    // Enforce single highlight if setting true
    if (updateData.is_month_highlight === true) {
      await (supabase as any)
        .from('gems')
        .update({ is_month_highlight: false })
        .neq('id', body.id);
    }

    // Update gem
    const updatedGem = await gemRepository.update(body.id, updateData);

    if (!updatedGem) {
      return NextResponse.json(
        { error: "Failed to update gem" },
        { status: 500 }
      );
    }

    // Log the action
    await auditLogRepository.create({
      user_id: user.id,
      action: "UPDATE_GEM",
      entity_type: "gem",
      entity_id: updatedGem.id,
      changes: {
        gemName: updatedGem.name,
        updatedFields: Object.keys(updateData),
      },
    });

    return NextResponse.json(updatedGem, { status: 200 });
  } catch (error: any) {
    console.error("Error updating gem:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update gem" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/gems - Delete gem
export async function DELETE(request: NextRequest) {
  try {
    const { user, supabase, error } = await getAuthenticatedUser(request);
    if (error || !user || !isHighAdminRole(user.role)) {
      return NextResponse.json(
        { error: error || "Forbidden - Admin access required" },
        { status: error ? 401 : 403 }
      );
    }

    const csrf = enforceCsrf(request);
    if (!csrf.ok) {
      return NextResponse.json({ error: csrf.error }, { status: 403 });
    }

    const gemRepository = getRepositoryFactory(supabase).getGemRepository();
    const auditLogRepository = getRepositoryFactory(supabase).getAuditLogRepository();

    const searchParams = request.nextUrl.searchParams;
    const gemId = searchParams.get("id");

    if (!gemId) {
      return NextResponse.json(
        { error: "Gem ID is required" },
        { status: 400 }
      );
    }

    // Check if gem exists
    const existingGem = await gemRepository.findById(gemId);
    if (!existingGem) {
      return NextResponse.json({ error: "Gem not found" }, { status: 404 });
    }

    // Delete gem
    const deleted = await gemRepository.delete(gemId);

    if (!deleted) {
      return NextResponse.json(
        { error: "Failed to delete gem" },
        { status: 500 }
      );
    }

    // Log the action
    await auditLogRepository.create({
      user_id: user.id,
      action: "DELETE_GEM",
      entity_type: "gem",
      entity_id: gemId,
      changes: {
        gemName: existingGem.name,
      },
    });

    return NextResponse.json(
      { message: "Gem deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting gem:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete gem" },
      { status: 500 }
    );
  }
}