#!/usr/bin/env node
/**
 * Sync images from the Google Sheet (column Obrazek) into local mobile_icons folder.
 * - Fetches the CSV like the app (same sheetId)
 * - Extracts image URLs for Typ === 'model'
 * - Downloads each to mobile_icons/<normalized name>.<ext>
 * - Skips existing files unless --force
 */
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const SHEET_ID = '1lZMJ-4Qd0nDY-7Hl9iV-pJnZSTVzYiA-A3rDq_bC16U';
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`;
const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'mobile_icons');
const FORCE = process.argv.includes('--force');

function normalizeName(name){
  try {
    return (name||'')
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu,'')
      .replace(/[^\w\s-]/g,'')
      .trim()
      .replace(/\s+/g,'-')
      .toLowerCase();
  } catch(_) { return (name||'').trim().replace(/\s+/g,'-').toLowerCase(); }
}

function ensureDir(dir){ if(!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); }

function fetchText(url){
  return new Promise((resolve, reject)=>{
    const lib = url.startsWith('https') ? https : http;
    lib.get(url, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchText(res.headers.location).then(resolve, reject);
      }
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
      const chunks=[]; res.on('data',d=>chunks.push(d)); res.on('end',()=>resolve(Buffer.concat(chunks).toString('utf8')));
    }).on('error', reject);
  });
}

function downloadFile(url, dest){
  return new Promise((resolve, reject)=>{
    const lib = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(dest);
    lib.get(url, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        file.close(); fs.unlink(dest, ()=>{
          downloadFile(res.headers.location, dest).then(resolve, reject);
        });
        return;
      }
      if (res.statusCode !== 200) { file.close(); fs.unlink(dest, ()=>{}); return reject(new Error(`HTTP ${res.statusCode}`)); }
      res.pipe(file);
      file.on('finish', ()=> file.close(()=> resolve()));
    }).on('error', err => { file.close(); fs.unlink(dest, ()=>{}); reject(err); });
  });
}

(async function main(){
  try {
    ensureDir(OUT_DIR);
    console.log('Fetching sheet CSV...');
    const csv = await fetchText(SHEET_URL + `&t=${Date.now()}`);
    const rows = csv.split('\n');
    const headers = (rows.shift()||'').match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
    const clean = headers.map(h=> h.trim().replace(/"/g,''));
    const idx = Object.fromEntries(clean.map((h,i)=>[h,i]));

    const items = rows.map(r => {
      const vals = r.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
      return {
        Typ: vals[idx['Typ']]?.replace(/"/g,'').trim() || '',
        Nazwa: vals[idx['Nazwa']]?.replace(/"/g,'').trim() || '',
        Obrazek: vals[idx['Obrazek']]?.replace(/"/g,'').trim() || ''
      };
    }).filter(it => it.Typ && it.Typ.toLowerCase()==='model' && it.Nazwa);

    console.log(`Found ${items.length} model rows with potential images.`);

    let downloaded = 0, skipped = 0, failed = 0;
    for (const it of items){
      const url = it.Obrazek;
      if (!url || !/^https?:\/\//i.test(url)) { continue; }
      const name = normalizeName(it.Nazwa);
      const ext = (new URL(url).pathname.split('.').pop() || 'jpg').toLowerCase().split('?')[0];
      const dest = path.join(OUT_DIR, `${name}.${ext}`);
      if (!FORCE && fs.existsSync(dest)) { skipped++; continue; }
      try {
        console.log('Downloading', url, '->', dest);
        await downloadFile(url, dest);
        downloaded++;
      } catch (e) {
        console.warn('Failed to download', url, e.message);
        failed++;
      }
    }
    console.log(`Done. Downloaded: ${downloaded}, Skipped: ${skipped}, Failed: ${failed}`);
    process.exit(0);
  } catch (e) {
    console.error('sync-mobile-icons failed:', e);
    process.exit(1);
  }
})();
