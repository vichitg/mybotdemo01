// Real read-only integration probes: UI host -> Rakazo worker -> 9Router -> model.
import fs from 'node:fs';
import path from 'node:path';
import { connect } from './cdp.mjs';
const c=await connect();
const rk=(route,input={})=>c.evaluate(`App.call('rk',${JSON.stringify({path:route,input})})`);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const textOf=m=>(m.blocks||[]).filter(b=>b.kind==='text').map(b=>b.text).join('\n');
const results=[];
async function probe(bot,text,required,limit=150000){
 const before=(await rk('threads/get',{botId:bot.id})).messages.length;
 await rk('threads/send',{botId:bot.id,text});
 const end=Date.now()+limit; let messages=[],active=true;
 while(Date.now()<end){
  await sleep(2000);
  messages=(await rk('threads/get',{botId:bot.id})).messages.slice(before);
  active=(await rk('runs/list',{filter:'active'})).runs.some(r=>r.botId===bot.id);
  if(!active && messages.some(m=>m.role!=='user')) break;
 }
 const answer=messages.filter(m=>m.role!=='user').map(textOf).join('\n');
 const result={bot:bot.name,finished:!active,ok:!active&&required.test(answer),answer,blockKinds:[...new Set(messages.flatMap(m=>(m.blocks||[]).map(b=>b.kind)))]};
 results.push(result); console.log(JSON.stringify(result,null,2));
}
try{
 const boot=await rk('bootstrap'); console.log('TEAM',boot.bots.length,'GROUPS',boot.groups.length);
 const ceo=boot.bots.find(b=>b.name==='CEO'), accountant=boot.bots.find(b=>b.name==='ฝ่ายบัญชี');
 if(!ceo||!accountant) throw new Error('Run seed-bots.mjs first');
 await probe(ceo,'ทดสอบการเชื่อมต่อ ตอบว่า BOTTEAM_READY แล้วแนะนำบทบาทของคุณหนึ่งประโยคเป็นภาษาไทย ไม่ต้องเรียกเครื่องมือหรือส่งงานต่อ',/BOTTEAM_READY/);
 if(results[0].ok) await probe(accountant,'อ่านข้อมูลจากระบบบัญชีสาธิตผ่าน MCP ที่เชื่อมไว้ สรุปลูกหนี้ค้างชำระและงบทดลองเป็นภาษาไทย ระบุว่าเป็นข้อมูลสมมติ ใช้เครื่องมืออ่านเท่านั้น ห้ามสร้าง แก้ไข หรือส่งรายการใด ๆ และห้ามเดาตัวเลข',/[0-9].*(บาท|THB)|[0-9],[0-9]{3}/s,180000);
 await c.evaluate('App.chat.load()');
 await c.evaluate(`App.go({type:'bot',id:${JSON.stringify(ceo.id)}})`);
 const out=path.resolve('logs'); fs.mkdirSync(out,{recursive:true});
 fs.writeFileSync(path.join(out,'gateway-live-demo.json'),JSON.stringify({at:new Date().toISOString(),results},null,2));
 await c.screenshot(path.join(out,'botteam-live.png'));
 if(results.length<2||results.some(r=>!r.ok)) process.exitCode=1;
} catch(error){console.error('LIVE_DEMO_ERROR',error.message);process.exitCode=1;}
finally{c.close();}
