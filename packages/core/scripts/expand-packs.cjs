#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'src', 'packs', 'data');

function readPack(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writePack(file, obj) {
  fs.writeFileSync(file, JSON.stringify(obj, null, 2) + '\n', 'utf8');
}

const pools = require('./expand-pools.json');

function hintFor(word, packId) {
  const parts = word.replace(/[:'’]/g, '').split(/\s+/).filter(Boolean);
  const hints = [];
  for (let i = 0; i < Math.min(3, parts.length); i++) {
    hints.push(parts[i].toLowerCase());
  }
  while (hints.length < 3) {
    if (!hints.includes(packId)) hints.push(packId.split('-')[0]);
    if (hints.length < 3) hints.push('common');
  }
  return hints;
}

function generateCandidates(packId, needed, existing) {
  const pool = pools[packId] || pools[packId.replace('-', '')] || [];
  const results = [];
  let idx = 0;
  for (let i = 0; i < pool.length && results.length < needed; i++) {
    const w = pool[i];
    if (!existing.has(w)) {
      results.push({ word: w, hints: hintFor(w, packId) });
    }
  }
  const adjectives = ['ancient','modern','giant','mini','electric','neon','solar','lunar','quantum','retro','ultra','micro','macro','hyper','silent','noisy','secret','hidden','golden','crimson'];
  while (results.length < needed) {
    const noun = pool[idx % pool.length] || ('item' + idx);
    const adj = adjectives[idx % adjectives.length];
    const candidate = `${adj.charAt(0).toUpperCase()+adj.slice(1)} ${noun}`;
    if (!existing.has(candidate) && !results.some(r=>r.word===candidate)) {
      results.push({ word: candidate, hints: hintFor(candidate, packId) });
    }
    idx++;
    if (idx > 10000) break;
  }
  return results;
}

function expandAll() {
  const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));
  for (const file of files) {
    const filePath = path.join(dataDir, file);
    const pack = readPack(filePath);
    const current = pack.words || [];
    const existing = new Set(current.map(w => w.word));
    const target = 120;
    const needed = Math.max(0, target - current.length);
    if (needed === 0) {
      console.log(`${file} already has ${current.length} words`);
      continue;
    }
    const packId = pack.id || path.basename(file, '.json');
    const candidates = generateCandidates(packId, needed, existing);
    console.log(`Adding ${candidates.length} entries to ${file} (was ${current.length})`);
    pack.words = current.concat(candidates);
    writePack(filePath, pack);
  }
}

expandAll();

console.log('Expansion complete.');
