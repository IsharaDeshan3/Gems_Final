import {
  generatePayhereHash,
  verifyPayhereSignature,
  formatPayhereAmount,
  validatePaymentData
} from '../lib/payhere/hash';
import { payhereConfig } from '../lib/payhere/config';
import crypto from 'crypto';

async function runPhase3Tests() {
  console.log('🚀 Starting Phase 3: Core E-Commerce & Payment Logic Test...\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.log(`❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // Ensure config has dummy values if env is missing
  if (!payhereConfig.merchantSecret) {
    payhereConfig.merchantSecret = 'TEST_SECRET_12345';
  }
  if (!payhereConfig.merchantId) {
    payhereConfig.merchantId = '1234567';
  }

  try {
    console.log('\n--- 1. PayHere Hash Generation ---');
    const orderData = {
      merchant_id: payhereConfig.merchantId,
      order_id: 'ORDER-123',
      amount: '1500.00',
      currency: 'LKR'
    };

    const expectedHashedSecret = crypto.createHash('md5').update(payhereConfig.merchantSecret).digest('hex').toUpperCase();
    const expectedHashString = `${orderData.merchant_id}${orderData.order_id}${orderData.amount}${orderData.currency}${expectedHashedSecret}`;
    const expectedFinalHash = crypto.createHash('md5').update(expectedHashString).digest('hex').toUpperCase();

    const generatedHash = generatePayhereHash(orderData);
    assert(generatedHash === expectedFinalHash, 'PayHere payment hash generated correctly');


    console.log('\n--- 2. Webhook Signature Verification ---');
    const webhookData = {
      merchant_id: payhereConfig.merchantId,
      order_id: 'ORDER-123',
      payhere_amount: '1500.00',
      status_code: '2', // Success
      md5sig: expectedFinalHash // We will overwrite this to the correct webhook hash
    };

    const webhookHashStr = `${webhookData.merchant_id}${webhookData.order_id}${webhookData.payhere_amount}${webhookData.status_code}${expectedHashedSecret}`;
    webhookData.md5sig = crypto.createHash('md5').update(webhookHashStr).digest('hex').toUpperCase();

    const isValidSignature = verifyPayhereSignature(webhookData);
    assert(isValidSignature === true, 'Valid webhook signature accepted');

    const invalidWebhookData = { ...webhookData, md5sig: 'BAD_SIGNATURE' };
    assert(verifyPayhereSignature(invalidWebhookData) === false, 'Invalid webhook signature rejected');


    console.log('\n--- 3. Data Formatting & Validation ---');
    const formattedAmt = formatPayhereAmount(1500.5);
    assert(formattedAmt === '1500.50', 'Payment amount formatted to 2 decimal places');

    const validPaymentPayload = {
      order_id: 'ORDER-123',
      amount: 1500.00,
      currency: 'LKR',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      phone: '0771234567',
      address: '123 Galle Rd',
      city: 'Colombo',
      country: 'Sri Lanka'
    };

    const validCheck = validatePaymentData(validPaymentPayload);
    assert(validCheck.valid === true, 'Valid payment data accepted');

    const invalidPaymentPayload = {
      ...validPaymentPayload,
      email: 'invalid-email',
      amount: -50
    };
    
    const invalidCheck = validatePaymentData(invalidPaymentPayload);
    assert(invalidCheck.valid === false && invalidCheck.errors.length === 2, 'Invalid payment data correctly flagged (negative amount, bad email)');

  } catch (error: any) {
    console.error('\n💥 Critical Test Failure:', error.message);
  }

  console.log(`\n--- Test Summary ---`);
  console.log(`Total: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
  if (failed === 0) {
    console.log('✅ Phase 3 Unit Tests Passed Successfully!');
  } else {
    console.log('❌ Phase 3 Unit Tests Completed with Errors.');
  }
}

runPhase3Tests();
