#!/usr/bin/env node
/**
 * Injects .env variables into environment.ts
 * Usage: node scripts/set-env.js [--reset]
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const ENV_PATH = path.join(ROOT, '.env');
const TARGET_PATH = path.join(ROOT, 'src/environments/environment.ts');

const PLACEHOLDER = 'YOUR_FAL_API_KEY_HERE';

// Check for --reset flag
const resetMode = process.argv.includes('--reset');

// Load .env manually (simple parser, no dependency needed if dotenv fails)
function loadEnv() {
  try {
    require('dotenv').config({ path: ENV_PATH });
  } catch {
    // Fallback: manual parse
    if (fs.existsSync(ENV_PATH)) {
      fs.readFileSync(ENV_PATH, 'utf-8')
        .split('\n')
        .filter(line => line.includes('='))
        .forEach(line => {
          const [key, ...val] = line.split('=');
          process.env[key.trim()] = val.join('=').trim();
        });
    }
  }
}

// Template
const template = (apiKey) => `export const environment = {
  production: false,
  falApi: {
    baseUrl: '/api/fal',
    apiKey: '${apiKey}'
  },
  pricing: {
    pricePerVideo: 0.50,
    model: 'Luma Dream Machine',
    provider: 'fal.ai'
  } as const
};
`;

// Main
function main() {
  if (resetMode) {
    fs.writeFileSync(TARGET_PATH, template(PLACEHOLDER));
    console.log('✓ environment.ts reset to placeholder');
    return;
  }

  loadEnv();
  const apiKey = process.env.FAL_API_KEY || PLACEHOLDER;
  fs.writeFileSync(TARGET_PATH, template(apiKey));

  if (apiKey !== PLACEHOLDER) {
    console.log('✓ API key loaded from .env');
  } else {
    console.log('⚠ No .env found - using placeholder');
  }
}

main();
