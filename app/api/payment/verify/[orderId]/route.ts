/**
 * Payment Verification API
 * Verifies payment status for an order
 */

import { NextRequest, NextResponse } from 'next/server';
import { getRepositoryFactory } from '@/lib/repositories';
import { createClient } from '@supabase/supabase-js';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Server is not configured (missing Supabase env vars).' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });

    const paymentRepository = getRepositoryFactory(supabase).getPaymentRepository();

    // Find payment by order ID
    const payment = await paymentRepository.findByOrderId(orderId);

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Return payment information
    return NextResponse.json({
      orderId: payment.order_id,
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      payment_method: payment.payment_method,
      payhere_payment_id: payment.payhere_payment_id,
      created_at: payment.created_at,
      updated_at: payment.updated_at,
      completed_at: payment.completed_at,
    }, { status: 200 });

  } catch (error: any) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
