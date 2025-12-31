import Stripe from 'stripe';

async function getStripeClient() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? 'repl ' + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
      ? 'depl ' + process.env.WEB_REPL_RENEWAL
      : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found');
  }

  const connectorName = 'stripe';
  const isProduction = process.env.REPLIT_DEPLOYMENT === '1';
  const targetEnvironment = isProduction ? 'production' : 'development';

  const url = new URL(`https://${hostname}/api/v2/connection`);
  url.searchParams.set('include_secrets', 'true');
  url.searchParams.set('connector_names', connectorName);
  url.searchParams.set('environment', targetEnvironment);

  const response = await fetch(url.toString(), {
    headers: {
      'Accept': 'application/json',
      'X_REPLIT_TOKEN': xReplitToken
    }
  });

  const data = await response.json();
  const connectionSettings = data.items?.[0];

  if (!connectionSettings?.settings?.secret) {
    throw new Error(`Stripe ${targetEnvironment} connection not found`);
  }

  return new Stripe(connectionSettings.settings.secret, {
    apiVersion: '2025-08-27.basil',
  });
}

interface TierConfig {
  name: string;
  description: string;
  priceMonthly: number;
  tier: string;
  features: string;
  scansPerMonth: string;
}

const TIERS: TierConfig[] = [
  {
    name: 'Asset Hunter Scout',
    description: '10 scans/month, basic distress scoring, all 8 marketplaces.',
    priceMonthly: 2900,
    tier: 'scout',
    features: 'basic_distress_scoring,all_marketplaces',
    scansPerMonth: '10',
  },
  {
    name: 'Asset Hunter Hunter',
    description: 'Unlimited scans, owner contact info, cold email templates, deal dossiers.',
    priceMonthly: 9900,
    tier: 'hunter',
    features: 'unlimited_scans,owner_contact,cold_email,deal_dossiers',
    scansPerMonth: 'unlimited',
  },
  {
    name: 'Asset Hunter Syndicate',
    description: 'Everything in Hunter + 3 team seats, API access, priority alerts, white-label reports.',
    priceMonthly: 24900,
    tier: 'syndicate',
    features: 'unlimited_scans,owner_contact,cold_email,deal_dossiers,team_seats,api_access,priority_alerts,white_label',
    scansPerMonth: 'unlimited',
  },
];

async function seedProducts() {
  console.log('Connecting to Stripe...');
  const stripe = await getStripeClient();
  console.log('Connected to Stripe');

  for (const tierConfig of TIERS) {
    const existingProducts = await stripe.products.search({
      query: `name:'${tierConfig.name}'`,
    });

    if (existingProducts.data.length > 0) {
      console.log(`${tierConfig.tier} tier already exists:`, existingProducts.data[0].id);
      continue;
    }

    console.log(`Creating ${tierConfig.tier} tier product...`);
    
    const product = await stripe.products.create({
      name: tierConfig.name,
      description: tierConfig.description,
      metadata: {
        tier: tierConfig.tier,
        features: tierConfig.features,
        scans_per_month: tierConfig.scansPerMonth,
      },
    });
    console.log('Created product:', product.id);

    const monthlyPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: tierConfig.priceMonthly,
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
      metadata: {
        tier: tierConfig.tier,
        interval: 'monthly',
      },
    });
    console.log(`Created ${tierConfig.tier} monthly price:`, monthlyPrice.id, `($${tierConfig.priceMonthly / 100}/month)`);
  }

  console.log('\nStripe products seeded successfully!');
  console.log('Products will be synced to your database automatically via webhooks.');
}

seedProducts()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error seeding products:', err);
    process.exit(1);
  });
