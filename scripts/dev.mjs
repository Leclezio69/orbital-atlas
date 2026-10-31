import {createServer} from 'node:http';
import {readFile,realpath,stat} from 'node:fs/promises';
import {extname,resolve,sep} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const root=fileURLToPath(new URL('../dist/',import.meta.url)).replace(/[\\/]$/,'');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.pdf':'application/pdf','.woff2':'font/woff2','.ico':'image/x-icon'};
export async function handler(req,res){
 const fail=(status,message)=>{res.writeHead(status,{'Content-Type':'text/plain; charset=utf-8'});res.end(req.method==='HEAD'?undefined:message)};
 if(!['GET','HEAD'].includes(req.method)){fail(405,'Method not allowed');return}
 let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname)}catch{fail(400,'Invalid URL');return}
 if(pathname.includes('\0')||pathname.includes('\\')){fail(400,'Invalid path');return}
 if(pathname.split('/').some(p=>p.startsWith('.'))){fail(403,'Forbidden');return}
 let file=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
 if(!file.startsWith(root+sep)){fail(403,'Forbidden');return}
 try{
  file=await realpath(file);if(!file.startsWith(root+sep)){fail(403,'Forbidden');return}
  if(!(await stat(file)).isFile()){fail(404,'Not found');return}
  const body=await readFile(file);
  res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Content-Length':body.length,'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});
  res.end(req.method==='HEAD'?undefined:body);
 }catch(error){fail(error.code==='ENOENT'||error.code==='ENOTDIR'?404:500,'File unavailable')}
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url){
 const i=process.argv.indexOf('--port'),port=Number(i>=0?process.argv[i+1]:process.env.PORT||3000);
 if(!Number.isInteger(port)||port<1||port>65535)throw new Error('Choose a port from 1 to 65535');
 const server=createServer(handler);server.on('error',e=>{console.error(e.code==='EADDRINUSE'?`Port ${port} is in use. Try npm run dev -- --port 3001`:e.message);process.exitCode=1});
 server.listen(port,'127.0.0.1',()=>console.log(`Orbital Atlas: http://localhost:${port}\nEdit files in dist/, then refresh the browser. Ctrl+C stops this server.`));
}
