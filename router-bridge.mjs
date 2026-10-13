// Windows-only API bridge, restricted to the WSL virtual adapter. No credentials are stored here.
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
const root = path.dirname(fileURLToPath(import.meta.url));
const route = JSON.parse(execFileSync('wsl.exe', ['-d','Ubuntu-24.04','--exec','ip','-j','-4','route','show','default'], {encoding:'utf8'}));
const host = route[0]?.gateway;
const interfaces = Object.entries(os.networkInterfaces());
if (!host || !interfaces.some(([name, rows]) => /WSL/i.test(name) && rows.some(r => r.address === host))) throw new Error('WSL-only interface unavailable; refusing a public bind');
const port = 20129;
const allowed = new Map([['GET /v1/models', true], ['POST /v1/chat/completions', true], ['POST /v1/responses', true]]);
const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (req.method === 'GET' && url.pathname === '/health') { res.writeHead(200, {'Content-Type':'application/json'}); return res.end(JSON.stringify({bridge:'ready', bind:host, upstream:'127.0.0.1:20128'})); }
  if (!allowed.has(`${req.method} ${url.pathname}`)) { res.writeHead(404); return res.end(); }
  if (!/^Bearer \S+$/.test(req.headers.authorization || '')) { res.writeHead(401); return res.end('Bearer authorization required'); }
  const headers = {...req.headers, host:'127.0.0.1:20128'};
  for (const h of ['connection','proxy-authorization','proxy-connection','upgrade','keep-alive']) delete headers[h];
  const upstream = http.request({hostname:'127.0.0.1',port:20128,path:url.pathname+url.search,method:req.method,headers,timeout:180000}, incoming => {
    const responseHeaders = {...incoming.headers}; delete responseHeaders.connection;
    res.writeHead(incoming.statusCode || 502, responseHeaders); incoming.pipe(res);
  });
  upstream.on('timeout', () => upstream.destroy(new Error('upstream timeout')));
  upstream.on('error', () => { if (!res.headersSent) res.writeHead(502); res.end('Gateway unavailable'); });
  let bytes = 0;
  req.on('data', chunk => { bytes += chunk.length; if (bytes > 20*1024*1024) { upstream.destroy(); if (!res.headersSent) res.writeHead(413); res.end(); req.destroy(); } });
  req.on('aborted', () => upstream.destroy());
  res.on('close', () => { if (!res.writableEnded) upstream.destroy(); });
  req.pipe(upstream);
});
server.headersTimeout = 15000;
server.requestTimeout = 180000;
server.on('error', err => { console.error('Bridge:', err.code); process.exitCode=1; });
server.listen(port, host, () => {
  const configFile = path.join(root, 'botteam.local.json');
  const config = fs.existsSync(configFile) ? JSON.parse(fs.readFileSync(configFile,'utf8').replace(/^\uFEFF/,'')) : {};
  config.routerUrl = `http://${host}:${port}/v1`;
  config.routerModel ||= 'kimi/kimi-k2.5';
  fs.writeFileSync(configFile, JSON.stringify(config,null,2)+'\n');
  console.log(`WSL-only 9Router bridge listening at ${host}:${port}`);
});
for (const signal of ['SIGINT','SIGTERM']) process.on(signal, () => { server.close(); setTimeout(()=>process.exit(),3000).unref(); });
