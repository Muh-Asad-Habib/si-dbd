const fs=require('fs');
const env=Object.fromEntries(fs.readFileSync('.env.local','utf8').split(/\r?\n/).filter(l=>/^[A-Z_]+=/.test(l)).map(l=>{const i=l.indexOf('=');return [l.slice(0,i),l.slice(i+1).replace(/^"|"$/g,'')]}));
(async()=>{
 const base=process.argv[2]||'http://127.0.0.1:3000'; const gate=env.ADMIN_PATH.replace(/^\/+|\/+$/g,'');
 const r=await fetch(base+'/api/admin/login',{method:'POST',headers:{'content-type':'application/json','x-sidbd-gate':gate},body:JSON.stringify({password:env.ADMIN_PASSWORD})});
 console.log('login',r.status); const ck=r.headers.getSetCookie().map(c=>c.split(';')[0]).join('; ');
 const x=await fetch(base+'/api/admin/export',{headers:{cookie:ck}}); console.log('export',x.status,x.headers.get('content-type'),x.headers.get('content-disposition'));
 fs.writeFileSync('.tmp.xlsx',Buffer.from(await x.arrayBuffer()));
 const ExcelJS=require('exceljs'); const wb=new ExcelJS.Workbook(); await wb.xlsx.readFile('.tmp.xlsx');
 for(const ws of wb.worksheets){console.log(ws.name,ws.columnCount,'cols',ws.rowCount,'rows');console.log(JSON.stringify(ws.getRow(1).values));if(ws.rowCount>1)console.log(JSON.stringify(ws.getRow(2).values));}
})().catch(e=>{console.error(e);process.exit(1)});
