/**
 * API Client for Royal Gems Institute
 * Uses Supabase repositories for data access
 */

import { Product, Order, OrderItem } from "../types";
import { getRepositoryFactory } from "@/lib/repositories";
import { getSupabaseClient } from "@/lib/supabase";

function getGemRepository() {
  return getRepositoryFactory(getSupabaseClient()).getGemRepository();
}

function getOrderRepository() {
  return getRepositoryFactory(getSupabaseClient()).getOrderRepository();
}

// ✅ Jwellery
export async function getJwelleryProducts(): Promise<Product[]> {
  try {
    const response = await fetch('/api/jwellery', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.products || [];
  } catch (error) {
    console.error('Error fetching jwellery products:', error);
    return [];
  }
}

export async function getJwelleryProductById(id: string): Promise<Product> {
  try {
    const response = await fetch(`/api/jwellery?id=${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error('Product not found');
    }

    const data = await response.json();
    return data.product;
  } catch (error) {
    console.error('Error fetching jwellery product:', error);
    throw error;
  }
}

// ✅ Products (Gems)
export async function getProducts(): Promise<Product[]> {
  try {
    // Use public API endpoint for fetching products
    const response = await fetch('/api/products', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      cache: 'no-store' // Don't cache to always get latest products
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.products || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    // Return empty array instead of throwing to prevent page crash
    return [];
  }
}

export async function getProductById(id: string): Promise<Product> {
  try {
    // Use public API endpoint
    const response = await fetch(`/api/products?id=${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error('Product not found');
    }

    const data = await response.json();
    return data.product;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
}

export async function createProduct(
  product: Omit<Product, "id" | "created_at">
): Promise<Product> {
  try {
    const gemData = {
      name: product.name,
      price: product.price,
      category: product.category || 'Other',
      images: product.images,
      stock_quantity: product.stock_quantity ?? product.stock ?? 0,
      is_active: product.is_active ?? true,
      identification: product.specifications?.identification ?? product.description,
      weight_carats: product.specifications?.weight_carats,
      color: product.specifications?.color,
      clarity: product.specifications?.clarity,
      shape_and_cut: product.specifications?.shape_and_cut,
      dimensions: product.specifications?.dimensions,
      treatments: product.specifications?.treatments,
      origin: product.specifications?.origin,
    };

    const gem = await getGemRepository().create(gemData);

    return {
      id: gem.id!,
      name: gem.name,
      description: gem.identification || '',
      price: gem.price,
      image_url: gem.images?.[0] || '',
      images: gem.images || [],
      category: (gem as any).category || 'Gemstone',
      stock_quantity: gem.stock_quantity || 0,
      stock: gem.stock_quantity || 0,
      active: gem.is_active ?? true,
      is_active: gem.is_active ?? true,
      specifications: {
        identification: gem.identification || '',
        weight_carats: gem.weight_carats || '',
        color: gem.color || '',
        clarity: gem.clarity || '',
        shape_and_cut: gem.shape_and_cut || '',
        dimensions: gem.dimensions || '',
        treatments: gem.treatments || '',
        origin: gem.origin || ''
      },
      created_at: gem.created_at || new Date().toISOString(),
      updated_at: gem.updated_at || new Date().toISOString()
    };
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
}

export async function updateProduct(
  id: string,
  product: Partial<Product>
): Promise<Product> {
  try {
    const updateData: any = {};
    
    if (product.name) updateData.name = product.name;
    if (product.price !== undefined) updateData.price = product.price;
    if (product.category) updateData.category = product.category;
    if (product.images) updateData.images = product.images;
    if (product.stock_quantity !== undefined) updateData.stock_quantity = product.stock_quantity;
    if (product.stock !== undefined) updateData.stock_quantity = product.stock;
    if (product.is_active !== undefined) updateData.is_active = product.is_active;
    
    if (product.specifications) {
      if (product.specifications.identification !== undefined) updateData.identification = product.specifications.identification;
      if (product.specifications.weight_carats !== undefined) updateData.weight_carats = product.specifications.weight_carats;
      if (product.specifications.color !== undefined) updateData.color = product.specifications.color;
      if (product.specifications.clarity !== undefined) updateData.clarity = product.specifications.clarity;
      if (product.specifications.shape_and_cut !== undefined) updateData.shape_and_cut = product.specifications.shape_and_cut;
      if (product.specifications.dimensions !== undefined) updateData.dimensions = product.specifications.dimensions;
      if (product.specifications.treatments !== undefined) updateData.treatments = product.specifications.treatments;
      if (product.specifications.origin !== undefined) updateData.origin = product.specifications.origin;
    }

    const gem = await getGemRepository().update(id, updateData);

    if (!gem) {
      throw new Error('Failed to update product');
    }

    return {
      id: gem.id!,
      name: gem.name,
      description: gem.identification || '',
      price: gem.price,
      image_url: gem.images?.[0] || '',
      images: gem.images || [],
      category: (gem as any).category || 'Gemstone',
      stock_quantity: gem.stock_quantity || 0,
      stock: gem.stock_quantity || 0,
      active: gem.is_active ?? true,
      is_active: gem.is_active ?? true,
      specifications: {
        identification: gem.identification || '',
        weight_carats: gem.weight_carats || '',
        color: gem.color || '',
        clarity: gem.clarity || '',
        shape_and_cut: gem.shape_and_cut || '',
        dimensions: gem.dimensions || '',
        treatments: gem.treatments || '',
        origin: gem.origin || ''
      },
      created_at: gem.created_at || new Date().toISOString(),
      updated_at: gem.updated_at || new Date().toISOString()
    };
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
}

export async function deleteProduct(id: string): Promise<{ message: string }> {
  try {
    await getGemRepository().delete(id);
    return { message: 'Product deleted successfully' };
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
}

// Helper function to map repository Order to API Order
function mapRepositoryOrderToApiOrder(repoOrder: any): Order {
  return {
    _id: repoOrder.id,
    orderId: repoOrder.id,
    user_id: repoOrder.user_id,
    total_amount: repoOrder.total_amount,
    status: repoOrder.status,
    billing_details: repoOrder.billing_address || repoOrder.shipping_address || {},
    payment_status: repoOrder.payment_status || 'pending',
    payment_id: repoOrder.payment_id,
    payment_method: repoOrder.payment_method,
    order_items: repoOrder.items || [],
    tracking_number: repoOrder.tracking_number,
    notes: repoOrder.notes,
    created_at: repoOrder.created_at,
    updated_at: repoOrder.updated_at
  };
}

// ✅ Orders
export async function getOrders(): Promise<Order[]> {
  try {
    // This would need user context, for now return empty or implement with auth
    const orders = await getOrderRepository().findAll(100, 0);
    return orders.map(mapRepositoryOrderToApiOrder);
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
}

export async function getOrderById(id: string): Promise<Order> {
  try {
    const order = await getOrderRepository().findById(id);
    
    if (!order) {
      throw new Error('Order not found');
    }

    return mapRepositoryOrderToApiOrder(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
}

export async function createOrder(order: Order): Promise<Order> {
  try {
    const orderData = {
      user_id: order.user_id,
      items: order.order_items || [],
      total_amount: order.total_amount,
      status: order.status || 'pending',
      payment_status: order.payment_status || 'pending',
      payment_method: order.payment_method,
      shipping_address: order.billing_details,
      tracking_number: order.tracking_number,
      notes: order.notes
    };

    const createdOrder = await getOrderRepository().create(orderData);
    return mapRepositoryOrderToApiOrder(createdOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

export async function updateOrderStatus(
  id: string,
  status: Order["status"]
): Promise<Order> {
  try {
    const order = await getOrderRepository().updateStatus(id, status);
    
    if (!order) {
      throw new Error('Order not found');
    }

    return mapRepositoryOrderToApiOrder(order);
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
}

export async function deleteOrder(id: string): Promise<{ message: string }> {
  try {
    await getOrderRepository().delete(id);
    return { message: 'Order deleted successfully' };
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
}

// ✅ Order Items
export async function getOrderItems(orderId: string): Promise<OrderItem[]> {
  try {
    const orderWithItems = await getOrderRepository().getOrderWithItems(orderId);
    
    if (!orderWithItems) {
      throw new Error('Order not found');
    }

    // Map repository order items to API order items
    return orderWithItems.items.map((item: any) => ({
      _id: item.id,
      product_id: item.gem_id,
      quantity: item.quantity,
      price: item.unit_price
    }));
  } catch (error) {
    console.error('Error fetching order items:', error);
    throw error;
  }
}

export async function addOrderItem(
  orderId: string,
  item: { product_id: string; quantity: number; price: number }
): Promise<OrderItem> {
  try {
    const orderWithItems = await getOrderRepository().getOrderWithItems(orderId);
    
    if (!orderWithItems) {
      throw new Error('Order not found');
    }

    const newItem: OrderItem = {
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price
    };

    // Map API items to repository items
    const updatedItems = [
      ...orderWithItems.items,
      {
        gem_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity
      }
    ];
    
    await getOrderRepository().update(orderId, { items: updatedItems } as any);

    return newItem;
  } catch (error) {
    console.error('Error adding order item:', error);
    throw error;
  }
}

export async function deleteOrderItem(
  orderId: string,
  itemId: string
): Promise<{ message: string }> {
  try {
    const orderWithItems = await getOrderRepository().getOrderWithItems(orderId);
    
    if (!orderWithItems) {
      throw new Error('Order not found');
    }

    const updatedItems = orderWithItems.items.filter(
      (item: any) => item.gem_id !== itemId
    );

    await getOrderRepository().update(orderId, { items: updatedItems } as any);

    return { message: 'Order item deleted successfully' };
  } catch (error) {
    console.error('Error deleting order item:', error);
    throw error;
  }
}

