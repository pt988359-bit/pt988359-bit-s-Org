import {
  initializeTestEnvironment,
  RulesTestEnvironment,
  assertFails,
  assertSucceeds,
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

const PROJECT_ID = 'quadratic-infusion-gzp2g';

export async function runSecurityRulesTestSuite(): Promise<boolean> {
  // If not inside an emulator runner, invoke firebase emulators:exec
  if (!process.env.FIRESTORE_EMULATOR_HOST) {
    console.log('⚡ FIRESTORE_EMULATOR_HOST not detected. Launching Firestore Emulator automatically...');
    const result = spawnSync('firebase emulators:exec --only firestore "npx tsx firestore.rules.test.ts"', {
      stdio: 'inherit',
      shell: true,
      env: { ...process.env, RUNNING_INSIDE_EMULATOR: 'true' },
    });
    if (result.status !== 0) {
      throw new Error(`Emulator test execution failed with exit code ${result.status}`);
    }
    return true;
  }

  console.log(`🛡️ Connecting to Firestore Emulator at ${process.env.FIRESTORE_EMULATOR_HOST}...`);
  const rules = fs.readFileSync(path.resolve(process.cwd(), 'firestore.rules'), 'utf8');

  let testEnv: RulesTestEnvironment;
  try {
    testEnv = await initializeTestEnvironment({
      projectId: PROJECT_ID,
      firestore: {
        rules,
        host: process.env.FIRESTORE_EMULATOR_HOST.split(':')[0] || '127.0.0.1',
        port: parseInt(process.env.FIRESTORE_EMULATOR_HOST.split(':')[1] || '8080', 10),
      },
    });
  } catch (initErr: any) {
    console.error('Failed to initialize RulesTestEnvironment:', initErr);
    throw initErr;
  }

  let passedTests = 0;
  let totalTests = 0;

  function recordResult(name: string, success: boolean) {
    totalTests++;
    if (success) {
      passedTests++;
      console.log(`  ✅ [PASS] ${name}`);
    } else {
      console.error(`  ❌ [FAIL] ${name}`);
      throw new Error(`Security Test Assertion Failed: ${name}`);
    }
  }

  try {
    console.log('\n🔒 --- Executing The Dirty Dozen Attack Payload Security Suite ---');

    // Setup: Seed an admin doc for verified admin tests
    const adminUid = 'admin-session-proteck-master-2025';
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), `admins/${adminUid}`), {
        role: 'superadmin',
        uid: adminUid,
        email: 'pt988359@gmail.com',
      });
      await setDoc(doc(context.firestore(), 'products/prod_1'), {
        name: 'Samsung 55 Inch TV',
        price: 15000,
        category: 'screens',
        images: ['https://example.com/img1.png'],
      });
      await setDoc(doc(context.firestore(), 'orders/ord_100'), {
        customerName: 'Customer Test',
        customerPhone: '01012345678',
        productId: 'prod_1',
        totalAmount: 15000,
        status: 'pending',
      });
      await setDoc(doc(context.firestore(), 'reservations/res_1'), {
        customerName: 'Customer Test',
        customerPhone: '01012345678',
        productId: 'prod_1',
        status: 'expired',
      });
      await setDoc(doc(context.firestore(), 'audit_logs/log_999'), {
        timestamp: new Date().toISOString(),
        action: 'system_boot',
      });
    });

    const unauth = testEnv.unauthenticatedContext();
    const admin = testEnv.authenticatedContext(adminUid);

    // 1. Payload #1: Block unauthenticated creation of admin role in /admins
    try {
      await assertFails(setDoc(doc(unauth.firestore(), 'admins/attacker_uid'), { role: 'superadmin' }));
      recordResult('Payload #1: Block unauthenticated creation of admin role in /admins', true);
    } catch {
      recordResult('Payload #1: Block unauthenticated creation of admin role in /admins', false);
    }

    // 2. Payload #2: Block unauthenticated price modification on /products
    try {
      await assertFails(updateDoc(doc(unauth.firestore(), 'products/prod_1'), { price: 1 }));
      recordResult('Payload #2: Block unauthenticated price modification on /products', true);
    } catch {
      recordResult('Payload #2: Block unauthenticated price modification on /products', false);
    }

    // 3. Payload #3: Reject oversized payload (>200 char name on product)
    try {
      const hugeName = 'X'.repeat(250);
      await assertFails(setDoc(doc(admin.firestore(), 'products/prod_oversized'), {
        name: hugeName,
        price: 1000,
      }));
      recordResult('Payload #3: Reject oversized payload (>200 char name on product)', true);
    } catch {
      recordResult('Payload #3: Reject oversized payload (>200 char name on product)', false);
    }

    // 4. Payload #4: Block unauthenticated listing of /customers PII
    try {
      await assertFails(getDocs(collection(unauth.firestore(), 'customers')));
      recordResult('Payload #4: Block unauthenticated listing of /customers PII', true);
    } catch {
      recordResult('Payload #4: Block unauthenticated listing of /customers PII', false);
    }

    // 5. Payload #5: Prevent unauthenticated reservation status override
    try {
      await assertFails(updateDoc(doc(unauth.firestore(), 'reservations/res_1'), { status: 'approved' }));
      recordResult('Payload #5: Prevent unauthenticated reservation status override', true);
    } catch {
      recordResult('Payload #5: Prevent unauthenticated reservation status override', false);
    }

    // 6. Payload #6: Block unauthenticated writes to /finance
    try {
      await assertFails(setDoc(doc(unauth.firestore(), 'finance/daily_summary'), { netIncome: 1000000 }));
      recordResult('Payload #6: Block unauthenticated writes to /finance', true);
    } catch {
      recordResult('Payload #6: Block unauthenticated writes to /finance', false);
    }

    // 7. Payload #7: Block modification of immutable fields / orders by unauth
    try {
      await assertFails(updateDoc(doc(unauth.firestore(), 'orders/ord_100'), { customerId: 'attacker' }));
      recordResult('Payload #7: Block modification of immutable fields / orders by unauth', true);
    } catch {
      recordResult('Payload #7: Block modification of immutable fields / orders by unauth', false);
    }

    // 8. Payload #8: Block deletion of audit logs (immutable even for admin)
    try {
      await assertFails(deleteDoc(doc(unauth.firestore(), 'audit_logs/log_999')));
      await assertFails(deleteDoc(doc(admin.firestore(), 'audit_logs/log_999')));
      recordResult('Payload #8: Block deletion of audit logs', true);
    } catch {
      recordResult('Payload #8: Block deletion of audit logs', false);
    }

    // 9. Payload #9: Reject oversized image array in product update (>10 images)
    try {
      const overSizedImages = Array.from({ length: 15 }, (_, i) => `https://example.com/img_${i}.jpg`);
      await assertFails(setDoc(doc(admin.firestore(), 'products/prod_too_many_images'), {
        name: 'Valid Product Name',
        price: 500,
        images: overSizedImages,
      }));
      recordResult('Payload #9: Reject oversized image array in product (>10 images)', true);
    } catch {
      recordResult('Payload #9: Reject oversized image array in product (>10 images)', false);
    }

    // 10. Payload #10: Reject invalid junk-character document IDs (>128 chars)
    try {
      const invalidDocId = 'junk-id-'.repeat(25); // >128 chars
      await assertFails(setDoc(doc(unauth.firestore(), `reservations/${invalidDocId}`), {
        customerName: 'Karim Mostafa',
        customerPhone: '01099887766',
        productId: 'prod_1',
        status: 'pending',
      }));
      recordResult('Payload #10: Reject invalid junk-character document IDs (>128 chars)', true);
    } catch {
      recordResult('Payload #10: Reject invalid junk-character document IDs (>128 chars)', false);
    }

    // 11. Payload #11: Reject unverified email admin actions
    try {
      const spoofedContext = testEnv.authenticatedContext('spoofed-admin-id', {
        email: 'attacker@proteck.com',
        email_verified: false,
      });
      await assertFails(setDoc(doc(spoofedContext.firestore(), 'finance/secret_ledger'), { leak: true }));
      recordResult('Payload #11: Reject unverified email admin actions', true);
    } catch {
      recordResult('Payload #11: Reject unverified email admin actions', false);
    }

    // 12. Payload #12: Reject shadow field injection on reservation creation
    try {
      await assertFails(setDoc(doc(unauth.firestore(), 'reservations/res_shadow_field'), {
        customerName: 'Hassan Ali',
        customerPhone: '01122334455',
        productId: 'prod_1',
        status: 'pending',
        isAdminApproved: true,
        priceDiscount: 90,
      }));
      recordResult('Payload #12: Reject shadow field injection on reservation creation', true);
    } catch {
      recordResult('Payload #12: Reject shadow field injection on reservation creation', false);
    }

    // Additional: Verify legitimate authorized actions succeed
    console.log('\n✨ --- Verifying Legitimate Authorized Operations ---');
    try {
      // Public reservation submission
      await assertSucceeds(setDoc(doc(unauth.firestore(), 'reservations/res_valid_123'), {
        customerName: 'Amr Zaki',
        customerPhone: '01001122334',
        productId: 'prod_1',
        status: 'pending',
      }));
      recordResult('Legitimate: Public guest can submit valid reservation', true);

      // Public product catalog read
      await assertSucceeds(getDoc(doc(unauth.firestore(), 'products/prod_1')));
      recordResult('Legitimate: Public can read product catalog', true);

      // Admin updating reservation
      await assertSucceeds(updateDoc(doc(admin.firestore(), 'reservations/res_1'), {
        status: 'active',
      }));
      recordResult('Legitimate: Admin can manage reservations', true);
    } catch (legitErr) {
      console.error('Legitimate operation test failed:', legitErr);
      throw legitErr;
    }

    console.log(`\n🎉 All ${totalTests} Security Matrix Tests Passed Successfully (${passedTests}/${totalTests})!`);
    return true;
  } finally {
    await testEnv.cleanup();
  }
}

// Execute if run directly
if (process.argv[1]?.endsWith('firestore.rules.test.ts') || process.argv[1]?.endsWith('firestore.rules.test.js')) {
  runSecurityRulesTestSuite()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Test Suite Failed:', err);
      process.exit(1);
    });
}
