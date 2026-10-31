import assert from 'node:assert/strict';
import {readFileSync,readdirSync,statSync,existsSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const root=fileURLToPath(new URL('../',import.meta.url)),dist=join(root,'dist');
const read=p=>readFileSync(join(dist,p),'utf8');
const requireFile=p=>assert(existsSync(join(dist,p))&&statSync(join(dist,p)).isFile(),`Missing deployment file: ${p}`);
const walk=dir=>readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(dir,e.name)):[join(dir,e.name)]);
const modules=JSON.parse(read('curriculum.json')),images=JSON.parse(read('assets/source-images.json'));
assert.equal(modules.length,10);assert.equal(images.length,40);
modules.forEach(m=>requireFile('playbooks/'+m.source));images.forEach(i=>requireFile('assets/'+i.file));
for(const f of ['index.html','mission-case.json','mission-scenarios.js','assets/ori.webp','assets/hero.webp','assets/ori-states.png','assets/space-materials.webp','assets/earth.jpg','assets/earth-clouds.jpg'])requireFile(f);
for(const file of walk(dist)){
 if(file.endsWith('.json'))JSON.parse(readFileSync(file,'utf8'));
 if(!/\.(js|css|html)$/.test(file))continue;
 const text=readFileSync(file,'utf8');
 for(const match of text.matchAll(/(?:assets|playbooks)\/[A-Za-z0-9_./-]+\.(?:webp|png|jpg|jpeg|pdf|json|svg|woff2)/g))requireFile(match[0]);
 if(file.endsWith('.html'))for(const match of text.matchAll(/(?:src|href)="([^"#]+)"/g)){if(!/^(?:https?:|data:|mailto:)/.test(match[1]))requireFile(match[1].split(/[?#]/)[0])}
 if(file.endsWith('.js')){
  for(const match of text.matchAll(/(?:from\s*|import\s*)['"](\.\.?\/[^'"]+)['"]/g))assert(existsSync(resolve(file,'..',match[1])),`Missing import: ${match[1]}`);
  const check=spawnSync(process.execPath,['--check',file],{stdio:'inherit'});if(check.status!==0)process.exit(check.status||1);
 }
}
const vc=JSON.parse(readFileSync(join(root,'vercel.json'),'utf8'));assert.equal(vc.outputDirectory,'dist');assert.equal(vc.framework,null);
console.log('Asset integrity passed: 10 playbooks, 40 source illustrations, all declared local assets and JS modules.');
const tests=spawnSync(process.execPath,['scripts/test.mjs'],{cwd:root,stdio:'inherit'});if(tests.status!==0)process.exit(tests.status||1);
console.log('Ready: Vercel serves the validated dist/ directory.');
