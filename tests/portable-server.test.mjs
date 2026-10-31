import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {handler} from '../scripts/dev.mjs';
async function request(url,method='GET'){let result={};await handler({url,method},{writeHead(status,headers){Object.assign(result,{status,headers})},end(body){result.body=body}});return result}
const home=await request('/');assert.equal(home.status,200);assert.match(home.body.toString(),/Orbital Atlas/);
const js=await request('/mission-engine.js?v=6');assert.equal(js.status,200);assert.match(js.headers['Content-Type'],/javascript/);
const image=await request('/assets/ori.webp');assert.deepEqual(image.body,readFileSync(new URL('../dist/assets/ori.webp',import.meta.url)));
const head=await request('/assets/ori.webp','HEAD');assert.equal(head.status,200);assert.equal(head.body,undefined);assert.equal(head.headers['Content-Length'],image.body.length);
assert.equal((await request('/absent.js')).status,404);assert.equal((await request('/%2e%2e%2fpackage.json')).status,403);assert.equal((await request('/.env')).status,403);assert.equal((await request('/','POST')).status,405);
console.log('PASS: portable server handler serves HTML, modules and binary assets; handles HEAD; rejects missing files, hidden files and traversal.');
