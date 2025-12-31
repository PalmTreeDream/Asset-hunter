import axios, { AxiosInstance } from 'axios';

const PYTHON_ENGINE_URL = process.env.PYTHON_ENGINE_URL || 'http://localhost:8000';

interface Asset {
  id: string;
  name: string;
  description: string | null;
  url: string;
  marketplace: string;
  users: number;
  rating: number | null;
  reviews_count: number;
  last_updated: string | null;
  developer: string | null;
  developer_email: string | null;
  estimated_mrr: number | null;
  estimated_valuation: number | null;
  distress_signals: string[];
  distress_score: number;
  verified: boolean;
  verification_notes: string | null;
  scraped_at: string;
}

interface ScanResponse {
  assets: Asset[];
  total_found: number;
  marketplaces_scanned: number;
  scan_duration_ms: number;
  cached: boolean;
}

interface VerifyResponse {
  asset_id: string;
  verified: boolean;
  distress_score: number;
  distress_signals: string[];
  estimated_mrr: number | null;
  estimated_valuation: number | null;
  owner_contact: string | null;
  verification_notes: string;
}

interface HealthResponse {
  status: string;
  serpapi_available: boolean;
  gemini_available: boolean;
}

class PythonEngineClient {
  private client: AxiosInstance;
  private isAvailable: boolean = false;

  constructor() {
    this.client = axios.create({
      baseURL: PYTHON_ENGINE_URL,
      timeout: 60000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async checkHealth(): Promise<HealthResponse | null> {
    try {
      const response = await this.client.get<HealthResponse>('/health');
      this.isAvailable = response.data.status === 'healthy';
      console.log('[PythonEngine] Health check:', response.data);
      return response.data;
    } catch (error) {
      console.log('[PythonEngine] Not available:', (error as Error).message);
      this.isAvailable = false;
      return null;
    }
  }

  async scan(
    query: string,
    marketplaces?: string[],
    minUsers: number = 1000,
    maxResultsPerMarketplace: number = 20
  ): Promise<ScanResponse | null> {
    try {
      const response = await this.client.post<ScanResponse>('/scan', {
        query,
        marketplaces: marketplaces || [],
        min_users: minUsers,
        max_results_per_marketplace: maxResultsPerMarketplace,
      });
      
      console.log(`[PythonEngine] Scan returned ${response.data.total_found} assets`);
      return response.data;
    } catch (error) {
      console.error('[PythonEngine] Scan error:', (error as Error).message);
      return null;
    }
  }

  async verify(
    assetId: string,
    assetUrl: string,
    marketplace: string
  ): Promise<VerifyResponse | null> {
    try {
      const response = await this.client.post<VerifyResponse>('/verify', {
        asset_id: assetId,
        asset_url: assetUrl,
        marketplace,
      });
      
      console.log(`[PythonEngine] Verified asset ${assetId}:`, response.data.verified);
      return response.data;
    } catch (error) {
      console.error('[PythonEngine] Verify error:', (error as Error).message);
      return null;
    }
  }

  async getMarketplaces(): Promise<string[]> {
    try {
      const response = await this.client.get<{ marketplaces: string[]; total: number }>('/marketplaces');
      return response.data.marketplaces;
    } catch (error) {
      console.error('[PythonEngine] Marketplaces error:', (error as Error).message);
      return [
        'chrome', 'firefox', 'shopify', 'wordpress', 'slack',
        'zapier', 'notion', 'figma', 'atlassian', 'salesforce',
        'hubspot', 'ios', 'android', 'vscode'
      ];
    }
  }

  get available(): boolean {
    return this.isAvailable;
  }
}

export const pythonEngine = new PythonEngineClient();
export type { Asset, ScanResponse, VerifyResponse, HealthResponse };
