import { getAdminDb } from '../src/server/firebaseAdmin.js';
import { FIRESTORE_COLLECTIONS } from '../src/core/config/FirestoreConfig.js';
import { INITIAL_SETTINGS, INITIAL_CATEGORIES } from '../src/data/mockData.js';

/**
 * Production Database Seeder
 * Requirement TASK-025:
 * - Seeds database ONLY if empty.
 * - NEVER overwrites existing production data.
 * - Seeds: Categories, Brands, Suppliers, Settings.
 */

const DEFAULT_BRANDS = [
  { id: 'brand-lg', name: 'LG', arabicName: 'إل جي', category: 'شاشات وثلاجات وغسالات', isActive: true },
  { id: 'brand-samsung', name: 'Samsung', arabicName: 'سامسونج', category: 'شاشات وثلاجات وغسالات', isActive: true },
  { id: 'brand-toshiba', name: 'Toshiba', arabicName: 'توشيبا', category: 'أجهزة منزلية متعددة', isActive: true },
  { id: 'brand-sharp', name: 'Sharp', arabicName: 'شارب', category: 'تكييفات وثلاجات', isActive: true },
  { id: 'brand-kiriazi', name: 'Kiriazi', arabicName: 'كريازي', category: 'ثلاجات وديب فريزر', isActive: true },
  { id: 'brand-beko', name: 'Beko', arabicName: 'بيكو', category: 'أجهزة أوربية', isActive: true },
  { id: 'brand-tornado', name: 'Tornado', arabicName: 'تورنيدو', category: 'أجهزة منزلية', isActive: true },
  { id: 'brand-fresh', name: 'Fresh', arabicName: 'فرش', category: 'بوتاجازات وتكييفات', isActive: true },
  { id: 'brand-zanussi', name: 'Zanussi', arabicName: 'زانوسي', category: 'غسالات وبوتاجازات', isActive: true },
  { id: 'brand-carrier', name: 'Carrier', arabicName: 'كاريير', category: 'تكييفات', isActive: true },
  { id: 'brand-bosch', name: 'Bosch', arabicName: 'بوش', category: 'أجهزة ألمانية فاخرة', isActive: true },
];

const DEFAULT_SUPPLIERS = [
  {
    id: 'sup-1',
    name: 'المجموعات الكبرى للتوريدات',
    phone: '',
    contactPerson: 'إدارة التوريدات المركزية',
    governorate: 'القاهرة',
    city: 'المعادي',
    suppliedCategories: ['ثلاجات وديب فريزر', 'غسالات ملابس وأطباق'],
    rating: 5,
    status: 'active',
  },
  {
    id: 'sup-2',
    name: 'المتحدة للأجهزة الكهربائية',
    phone: '',
    contactPerson: 'قسم الجودة والمعاينة',
    governorate: 'القاهرة',
    city: 'مدينة نصر',
    suppliedCategories: ['شاشات وتلفزيونات ذكية', 'أجهزة التكييف والتبريد'],
    rating: 5,
    status: 'active',
  },
];

export async function seedProductionDatabase() {
  console.log('🚀 Starting Production Database Seeder audit...');

  try {
    const db = getAdminDb();

    // 1. Showroom Settings
    const settingsRef = db.collection(FIRESTORE_COLLECTIONS.SHOWROOM_SETTINGS).doc('showroom_settings');
    const settingsSnap = await settingsRef.get();

    if (!settingsSnap.exists) {
      console.log('📦 Seeding initial Showroom Settings...');
      await settingsRef.set(INITIAL_SETTINGS, { merge: true });
      console.log('✅ Showroom Settings seeded successfully.');
    } else {
      console.log('ℹ️ Showroom Settings document already exists. Skipping overwrite.');
    }

    // 2. Categories
    const categoriesCol = db.collection('categories');
    const categoriesSnap = await categoriesCol.get();

    if (categoriesSnap.empty) {
      console.log('📦 Seeding Categories collection...');
      for (const cat of INITIAL_CATEGORIES) {
        await db.collection('categories').doc(cat.id).set(cat, { merge: true });
      }
      console.log(`✅ Seeded ${INITIAL_CATEGORIES.length} Categories.`);
    } else {
      console.log(`ℹ️ Categories collection already has ${categoriesSnap.size} documents. Skipping overwrite.`);
    }

    // 3. Brands
    const brandsCol = db.collection('brands');
    const brandsSnap = await brandsCol.get();

    if (brandsSnap.empty) {
      console.log('📦 Seeding Brands collection...');
      for (const brand of DEFAULT_BRANDS) {
        await db.collection('brands').doc(brand.id).set(brand, { merge: true });
      }
      console.log(`✅ Seeded ${DEFAULT_BRANDS.length} Brands.`);
    } else {
      console.log(`ℹ️ Brands collection already has ${brandsSnap.size} documents. Skipping overwrite.`);
    }

    // 4. Suppliers
    const suppliersCol = db.collection(FIRESTORE_COLLECTIONS.SUPPLIERS);
    const suppliersSnap = await suppliersCol.get();

    if (suppliersSnap.empty) {
      console.log('📦 Seeding Suppliers collection...');
      for (const sup of DEFAULT_SUPPLIERS) {
        await db.collection(FIRESTORE_COLLECTIONS.SUPPLIERS).doc(sup.id).set(sup, { merge: true });
      }
      console.log(`✅ Seeded ${DEFAULT_SUPPLIERS.length} Suppliers.`);
    } else {
      console.log(`ℹ️ Suppliers collection already has ${suppliersSnap.size} documents. Skipping overwrite.`);
    }

    console.log('🎉 Database seeding completed safely.');
  } catch (error) {
    console.error('❌ Error executing Production Database Seeder:', error);
    process.exit(1);
  }
}

// Execute if called directly via CLI
if (process.argv[1]?.endsWith('databaseSeeder.ts') || process.argv[1]?.endsWith('databaseSeeder.js')) {
  seedProductionDatabase().then(() => process.exit(0));
}
