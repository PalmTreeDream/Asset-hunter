type EventName = 
  | 'page_view'
  | 'search_initiated'
  | 'scan_started'
  | 'scan_completed'
  | 'asset_viewed'
  | 'analysis_requested'
  | 'newsletter_signup'
  | 'lead_captured'
  | 'upgrade_clicked'
  | 'checkout_started'
  | 'magic_link_requested'
  | 'session_verified'
  | 'referral_redeemed';

interface EventProperties {
  [key: string]: string | number | boolean | undefined;
}

class Analytics {
  private enabled: boolean;

  constructor() {
    this.enabled = true;
  }

  track(event: EventName, properties?: EventProperties) {
    if (!this.enabled) return;

    const payload = {
      event,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
        url: window.location.pathname,
        referrer: document.referrer,
      },
    };

    console.log('[Analytics]', payload.event, payload.properties);

    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'include',
    }).catch(() => {
    });
  }

  pageView(page: string) {
    this.track('page_view', { page });
  }

  searchInitiated(query: string, scanType: string) {
    this.track('search_initiated', { query, scanType });
  }

  scanStarted(query: string, marketplaces: number) {
    this.track('scan_started', { query, marketplaces });
  }

  scanCompleted(query: string, resultsCount: number, duration: number) {
    this.track('scan_completed', { query, resultsCount, durationMs: duration });
  }

  assetViewed(assetId: string, marketplace: string, isPremiumContent: boolean) {
    this.track('asset_viewed', { assetId, marketplace, isPremiumContent });
  }

  analysisRequested(assetId: string, marketplace: string) {
    this.track('analysis_requested', { assetId, marketplace });
  }

  newsletterSignup(source: string) {
    this.track('newsletter_signup', { source });
  }

  leadCaptured(source: string) {
    this.track('lead_captured', { source });
  }

  upgradeClicked(tier: string, source: string) {
    this.track('upgrade_clicked', { tier, source });
  }

  checkoutStarted(tier: string, price: number) {
    this.track('checkout_started', { tier, priceInCents: price });
  }

  magicLinkRequested(source: string) {
    this.track('magic_link_requested', { source });
  }

  sessionVerified() {
    this.track('session_verified');
  }

  referralRedeemed(code: string) {
    this.track('referral_redeemed', { code });
  }
}

export const analytics = new Analytics();
