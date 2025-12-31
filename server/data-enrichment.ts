import axios from "axios";

export interface GitHubRepoInfo {
  lastCommitDate: string | null;
  commitCount: number;
  openIssues: number;
  stars: number;
  forks: number;
  language: string | null;
  techStack: string[];
  isArchived: boolean;
  daysSinceLastCommit: number | null;
  activityScore: number;
}

export interface HunterIOResult {
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  position: string | null;
  confidence: number;
  sources: string[];
  linkedIn: string | null;
  twitter: string | null;
}

export interface EnrichmentResult {
  github: GitHubRepoInfo | null;
  owner: HunterIOResult | null;
  domain: string | null;
  enrichedAt: string;
}

const GITHUB_API = "https://api.github.com";
const HUNTER_API = "https://api.hunter.io/v2";

function extractDomainFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function extractGitHubRepo(url: string): { owner: string; repo: string } | null {
  const match = url.match(/github\.com\/([^\/]+)\/([^\/\?#]+)/i);
  if (match) {
    return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
  }
  return null;
}

export async function enrichFromGitHub(repoUrl: string): Promise<GitHubRepoInfo | null> {
  const repoInfo = extractGitHubRepo(repoUrl);
  if (!repoInfo) return null;

  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "AssetHunter/1.0",
    };

    const repoResponse = await axios.get(
      `${GITHUB_API}/repos/${repoInfo.owner}/${repoInfo.repo}`,
      { headers, timeout: 10000 }
    );

    const repo = repoResponse.data;

    let lastCommitDate: string | null = null;
    let daysSinceLastCommit: number | null = null;

    try {
      const commitsResponse = await axios.get(
        `${GITHUB_API}/repos/${repoInfo.owner}/${repoInfo.repo}/commits`,
        { headers, params: { per_page: 1 }, timeout: 10000 }
      );
      if (commitsResponse.data.length > 0) {
        lastCommitDate = commitsResponse.data[0].commit.author.date;
        if (lastCommitDate) {
          const lastDate = new Date(lastCommitDate);
          daysSinceLastCommit = Math.floor(
            (Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
          );
        }
      }
    } catch (e) {
      console.log("Failed to fetch commits:", (e as Error).message);
    }

    let techStack: string[] = [];
    try {
      const languagesResponse = await axios.get(
        `${GITHUB_API}/repos/${repoInfo.owner}/${repoInfo.repo}/languages`,
        { headers, timeout: 10000 }
      );
      techStack = Object.keys(languagesResponse.data).slice(0, 5);
    } catch (e) {
      if (repo.language) {
        techStack = [repo.language];
      }
    }

    const activityScore = calculateActivityScore({
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      openIssues: repo.open_issues_count,
      daysSinceLastCommit,
      isArchived: repo.archived,
    });

    return {
      lastCommitDate,
      commitCount: 0,
      openIssues: repo.open_issues_count || 0,
      stars: repo.stargazers_count || 0,
      forks: repo.forks_count || 0,
      language: repo.language,
      techStack,
      isArchived: repo.archived || false,
      daysSinceLastCommit,
      activityScore,
    };
  } catch (error) {
    console.error("GitHub enrichment failed:", (error as Error).message);
    return null;
  }
}

function calculateActivityScore(data: {
  stars: number;
  forks: number;
  openIssues: number;
  daysSinceLastCommit: number | null;
  isArchived: boolean;
}): number {
  if (data.isArchived) return 0;

  let score = 50;

  if (data.daysSinceLastCommit !== null) {
    if (data.daysSinceLastCommit < 30) score += 30;
    else if (data.daysSinceLastCommit < 90) score += 15;
    else if (data.daysSinceLastCommit < 180) score += 5;
    else if (data.daysSinceLastCommit > 365) score -= 20;
    else score -= 10;
  }

  if (data.stars > 1000) score += 15;
  else if (data.stars > 100) score += 10;
  else if (data.stars > 10) score += 5;

  if (data.openIssues > 100) score -= 10;
  else if (data.openIssues > 50) score -= 5;

  return Math.max(0, Math.min(100, score));
}

export async function findOwnerWithHunterIO(domain: string): Promise<HunterIOResult | null> {
  const apiKey = process.env.HUNTER_API_KEY;
  if (!apiKey) {
    console.log("Hunter.io API key not configured");
    return null;
  }

  try {
    const response = await axios.get(`${HUNTER_API}/domain-search`, {
      params: {
        domain,
        api_key: apiKey,
        limit: 5,
      },
      timeout: 15000,
    });

    const data = response.data.data;
    if (!data || !data.emails || data.emails.length === 0) {
      return null;
    }

    const ownerPatterns = ["ceo", "founder", "owner", "co-founder", "creator"];
    let bestContact = data.emails[0];

    for (const email of data.emails) {
      const position = (email.position || "").toLowerCase();
      if (ownerPatterns.some((p) => position.includes(p))) {
        bestContact = email;
        break;
      }
    }

    return {
      email: bestContact.value || null,
      firstName: bestContact.first_name || null,
      lastName: bestContact.last_name || null,
      position: bestContact.position || null,
      confidence: bestContact.confidence || 0,
      sources: (bestContact.sources || []).map((s: any) => s.domain || s.uri).slice(0, 3),
      linkedIn: bestContact.linkedin || null,
      twitter: bestContact.twitter || null,
    };
  } catch (error) {
    console.error("Hunter.io lookup failed:", (error as Error).message);
    return null;
  }
}

export async function enrichAsset(
  assetUrl: string,
  linkedGithubUrl?: string
): Promise<EnrichmentResult> {
  const domain = extractDomainFromUrl(assetUrl);

  const [github, owner] = await Promise.all([
    linkedGithubUrl ? enrichFromGitHub(linkedGithubUrl) : Promise.resolve(null),
    domain ? findOwnerWithHunterIO(domain) : Promise.resolve(null),
  ]);

  return {
    github,
    owner,
    domain,
    enrichedAt: new Date().toISOString(),
  };
}

export async function detectGitHubFromMarketplacePage(
  marketplaceUrl: string,
  description?: string
): Promise<string | null> {
  const githubPatterns = [
    /github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+/gi,
    /Source:?\s*github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+/gi,
  ];

  const textToSearch = description || "";

  for (const pattern of githubPatterns) {
    const match = textToSearch.match(pattern);
    if (match) {
      const url = match[0].replace(/^Source:?\s*/i, "");
      return `https://${url}`;
    }
  }

  return null;
}
