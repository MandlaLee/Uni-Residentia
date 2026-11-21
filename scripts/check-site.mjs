import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
const root=process.cwd();
const sources=[...readdirSync(root).filter(x=>x.endsWith(".html")), "css/style.css"];
const missing=[];
for (const file of sources){
 const content=readFileSync(join(root,file),"utf8");
 const refs=file.endsWith(".css")
   ? [...content.matchAll(/url\(\s*['"]?([^)'"]+)/g)].map(m=>m[1])
   : [...content.matchAll(/(?:src|href)=["']([^"'#]+)["']/g)].map(m=>m[1]);
 for(const href of refs){
   if(/^(https?:|mailto:|tel:|data:|\/\/)/i.test(href)) continue;
   const path=href.split(/[?#]/)[0];
   if(!path)continue;
   const target=resolve(root,dirname(file),path);
   if(!target.startsWith(root)||!existsSync(target)) missing.push(file+" -> "+href);
 }
}
if(missing.length){ console.error("Broken local references:\n"+missing.join("\n")); process.exit(1); }
const main=readFileSync(join(root,"js/main.js"),"utf8");
if(main.includes("Application Submitted!")||main.includes("Simulate login")){
 console.error("Mock application or authentication flow reintroduced.");process.exit(1);
}
if(!existsSync(join(root,"supabase/schema.sql")))throw Error("Missing backend schema");
console.log("Site checks passed: "+sources.length+" documents checked.");
