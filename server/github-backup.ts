// GitHub backup utility using Replit's GitHub integration
import { Octokit } from '@octokit/rest';
import * as fs from 'fs';
import * as path from 'path';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('GitHub not connected');
  }
  return accessToken;
}

async function getUncachableGitHubClient() {
  const accessToken = await getAccessToken();
  return new Octokit({ auth: accessToken });
}

// Files and directories to exclude from backup
const EXCLUDE_PATTERNS = [
  'node_modules',
  '.git',
  'dist',
  '.cache',
  '.replit',
  'replit.nix',
  '.config',
  'attached_assets',
  '__pycache__',
  '.pyc',
  'package-lock.json',
  '.upm',
  '.breakpoints',
  '.local',
  '.pythonlibs',
  'generated_',
  '.bin'
];

function shouldExclude(filePath: string): boolean {
  return EXCLUDE_PATTERNS.some(pattern => filePath.includes(pattern));
}

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (shouldExclude(fullPath)) return;
    
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

async function initializeEmptyRepo(octokit: Octokit, owner: string, repo: string) {
  console.log('Initializing empty repository with README...');
  try {
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: 'README.md',
      message: 'Initial commit - Repository initialized',
      content: Buffer.from('# Asset Hunter\n\nMicro-Private Equity Engine for finding distressed software assets.\n').toString('base64'),
    });
    console.log('Repository initialized successfully');
    // Wait a moment for GitHub to process
    await new Promise(resolve => setTimeout(resolve, 2000));
  } catch (e: any) {
    if (e.status === 422 && e.message?.includes('sha')) {
      console.log('README already exists, continuing...');
    } else {
      throw e;
    }
  }
}

async function pushToGitHub(owner: string, repo: string) {
  console.log(`Starting backup to ${owner}/${repo}...`);
  
  const octokit = await getUncachableGitHubClient();
  const baseDir = process.cwd();
  
  // Get all files
  const files = getAllFiles(baseDir);
  console.log(`Found ${files.length} files to backup`);

  // Get current commit SHA (or create initial commit)
  let baseSha: string | undefined;
  let isEmptyRepo = false;
  try {
    const { data: ref } = await octokit.git.getRef({
      owner,
      repo,
      ref: 'heads/main'
    });
    baseSha = ref.object.sha;
    console.log(`Found existing main branch at ${baseSha.substring(0, 7)}`);
  } catch (e: any) {
    if (e.status === 404 || e.status === 409) {
      console.log('No existing main branch (empty repo), will initialize first');
      isEmptyRepo = true;
    } else {
      throw e;
    }
  }

  // Initialize empty repo if needed
  if (isEmptyRepo) {
    await initializeEmptyRepo(octokit, owner, repo);
    // Get the new SHA after initialization
    const { data: ref } = await octokit.git.getRef({
      owner,
      repo,
      ref: 'heads/main'
    });
    baseSha = ref.object.sha;
    console.log(`After init, main branch at ${baseSha.substring(0, 7)}`);
  }

  // Create blobs for all files
  console.log('Creating file blobs...');
  const treeItems: Array<{path: string; mode: '100644'; type: 'blob'; sha: string}> = [];
  
  for (const filePath of files) {
    const relativePath = path.relative(baseDir, filePath);
    try {
      const content = fs.readFileSync(filePath);
      const base64Content = content.toString('base64');
      
      const { data: blob } = await octokit.git.createBlob({
        owner,
        repo,
        content: base64Content,
        encoding: 'base64'
      });
      
      treeItems.push({
        path: relativePath,
        mode: '100644',
        type: 'blob',
        sha: blob.sha
      });
      
      process.stdout.write('.');
    } catch (err) {
      console.error(`\nFailed to create blob for ${relativePath}:`, err);
    }
  }
  console.log(`\nCreated ${treeItems.length} blobs`);

  // Create tree
  console.log('Creating tree...');
  const { data: tree } = await octokit.git.createTree({
    owner,
    repo,
    tree: treeItems,
    base_tree: baseSha ? undefined : undefined
  });

  // Create commit
  console.log('Creating commit...');
  const commitMessage = `Backup from Replit - ${new Date().toISOString()}`;
  const { data: commit } = await octokit.git.createCommit({
    owner,
    repo,
    message: commitMessage,
    tree: tree.sha,
    parents: baseSha ? [baseSha] : []
  });

  // Update or create main branch reference
  console.log('Updating main branch...');
  try {
    await octokit.git.updateRef({
      owner,
      repo,
      ref: 'heads/main',
      sha: commit.sha,
      force: true
    });
  } catch (e: any) {
    if (e.status === 422) {
      // Reference doesn't exist, create it
      await octokit.git.createRef({
        owner,
        repo,
        ref: 'refs/heads/main',
        sha: commit.sha
      });
    } else {
      throw e;
    }
  }

  console.log(`\nSuccessfully backed up to https://github.com/${owner}/${repo}`);
  console.log(`Commit: ${commit.sha.substring(0, 7)} - ${commitMessage}`);
}

// Run if called directly
const owner = 'PalmTreeDream';
const repo = 'Asset-hunter';

pushToGitHub(owner, repo).catch(console.error);
