import mongoose from 'mongoose';

const MONGODB_URL = process.env.MONGODB_URL;

if (!MONGODB_URL) {
  console.error('Missing MONGODB_URL environment variable.');
  process.exit(1);
}

const isDryRun = process.argv.includes('--dry-run');

const ProductSchema = new mongoose.Schema(
  {
    name: String,
    slug: String,
    price: Number,
    prices: { type: Map, of: Number, default: {} },
  },
  { strict: false }
);

const StoreSettingsSchema = new mongoose.Schema(
  {
    slug: { type: String, index: true },
    defaultPriceTypeId: { type: String, default: null },
  },
  { strict: false }
);

const Product = mongoose.models.product || mongoose.model('product', ProductSchema, 'products');
const StoreSettings =
  mongoose.models.StoreSettings ||
  mongoose.model('StoreSettings', StoreSettingsSchema, 'storesettings');

function getMapSize(value) {
  if (!value) return 0;
  if (value instanceof Map) return value.size;
  if (typeof value?.size === 'number') return value.size;
  if (typeof value === 'object') return Object.keys(value).length;
  return 0;
}

function hasLegacyPrice(product) {
  const parsed = Number(product?.price);
  return Number.isFinite(parsed);
}

function normalizeLegacyPrice(product) {
  return Number(product.price);
}

async function runMigration() {
  const report = {
    migrated: [],
    skipped: [],
    errors: [],
  };

  const settingsCache = new Map();

  const cursor = Product.find({}, { _id: 1, name: 1, slug: 1, price: 1, prices: 1 }).cursor();

  for await (const product of cursor) {
    try {
      const productId = String(product._id);
      const productName = product.name || '(unnamed product)';
      const slug = product.slug || null;

      if (!hasLegacyPrice(product)) {
        report.skipped.push({
          productId,
          productName,
          reason: 'Legacy price is missing or invalid',
        });
        continue;
      }

      if (getMapSize(product.prices) > 0) {
        report.skipped.push({
          productId,
          productName,
          reason: 'prices already has values (not overwritten)',
        });
        continue;
      }

      if (!slug) {
        report.errors.push({
          productId,
          productName,
          error: 'Product slug is missing; cannot resolve store defaultPriceTypeId',
        });
        continue;
      }

      let defaultPriceTypeId = settingsCache.get(slug);
      if (defaultPriceTypeId === undefined) {
        const settings = await StoreSettings.findOne(
          { slug },
          { defaultPriceTypeId: 1 }
        ).lean();
        defaultPriceTypeId = settings?.defaultPriceTypeId || null;
        settingsCache.set(slug, defaultPriceTypeId);
      }

      if (!defaultPriceTypeId) {
        report.errors.push({
          productId,
          productName,
          slug,
          error: 'No defaultPriceTypeId found for store settings',
        });
        continue;
      }

      const legacyPrice = normalizeLegacyPrice(product);

      if (!isDryRun) {
        if (!(product.prices instanceof Map)) {
          product.prices = new Map();
        }

        product.prices.set(defaultPriceTypeId, legacyPrice);
        await product.save();
      }

      report.migrated.push({
        productId,
        productName,
        slug,
        defaultPriceTypeId,
        price: legacyPrice,
        dryRun: isDryRun,
      });
    } catch (error) {
      report.errors.push({
        productId: String(product?._id || ''),
        productName: product?.name || '(unknown)',
        error: error?.message || 'Unknown migration error',
      });
    }
  }

  return report;
}

async function main() {
  await mongoose.connect(MONGODB_URL, {});

  try {
    const report = await runMigration();

    const summary = {
      dryRun: isDryRun,
      migratedCount: report.migrated.length,
      skippedCount: report.skipped.length,
      errorCount: report.errors.length,
    };

    console.log('\n=== Product Prices Migration Report ===');
    console.log(JSON.stringify(summary, null, 2));

    console.log('\nProducts migrated:');
    console.log(JSON.stringify(report.migrated, null, 2));

    console.log('\nProducts skipped:');
    console.log(JSON.stringify(report.skipped, null, 2));

    console.log('\nErrors:');
    console.log(JSON.stringify(report.errors, null, 2));

    if (report.errors.length > 0) {
      process.exitCode = 2;
    }
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error('Migration failed:', error?.message || error);
  process.exit(1);
});
