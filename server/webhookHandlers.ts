import { getStripeSync, getUncachableStripeClient } from './stripeClient';
import { notifyPurchase } from './notifications';

export class WebhookHandlers {
  static async processWebhook(payload: Buffer, signature: string): Promise<void> {
    if (!Buffer.isBuffer(payload)) {
      throw new Error(
        'STRIPE WEBHOOK ERROR: Payload must be a Buffer. ' +
        'Received type: ' + typeof payload + '. ' +
        'This usually means express.json() parsed the body before reaching this handler. ' +
        'FIX: Ensure webhook route is registered BEFORE app.use(express.json()).'
      );
    }

    const sync = await getStripeSync();
    await sync.processWebhook(payload, signature);
    
    // Also parse event for notifications (async, don't block)
    try {
      const stripe = await getUncachableStripeClient();
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      
      if (webhookSecret) {
        const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
        
        // Send notification for successful checkout/subscription
        if (event.type === 'checkout.session.completed') {
          const session = event.data.object as any;
          const customerEmail = session.customer_email || session.customer_details?.email || 'Unknown';
          const amount = session.amount_total || 0;
          const currency = session.currency || 'usd';
          
          // Try to get plan name from metadata or line items
          let planName = session.metadata?.plan || 'Subscription';
          
          notifyPurchase(customerEmail, planName, amount, currency).catch(() => {});
        } else if (event.type === 'invoice.payment_succeeded') {
          const invoice = event.data.object as any;
          if (invoice.billing_reason === 'subscription_create' || invoice.billing_reason === 'subscription_cycle') {
            const customerEmail = invoice.customer_email || 'Unknown';
            const amount = invoice.amount_paid || 0;
            const currency = invoice.currency || 'usd';
            const planName = invoice.lines?.data?.[0]?.description || 'Subscription';
            
            notifyPurchase(customerEmail, planName, amount, currency).catch(() => {});
          }
        }
      }
    } catch (notifyError) {
      // Don't fail webhook processing if notification fails
      console.error('[Notifications] Failed to process webhook for notifications:', notifyError);
    }
  }
}
