import fs from 'node:fs';
const file='\\\\wsl.localhost\\Ubuntu-24.04\\root\\botteam-rakazo\\demo-acct\\data.json';
const book=JSON.parse(fs.readFileSync(file,'utf8'));
const net=new Map();
for(const entry of book.journal) for(const line of entry.lines){
 const code=String(line.account??line.accountCode??line.code??'');
 if(!code) throw new Error('Unknown ledger fields: '+Object.keys(line).join(','));
 net.set(code,(net.get(code)||0)+Number(line.debit)-Number(line.credit));
}
const debit=[...net.values()].filter(x=>x>0).reduce((a,b)=>a+b,0);
const credit=-[...net.values()].filter(x=>x<0).reduce((a,b)=>a+b,0);
console.log('LEDGER',JSON.stringify({arSatang:net.get('1130'),debitSatang:debit,creditSatang:credit,balanced:debit===credit}));
const res=await fetch('http://127.0.0.1:3300/api/events',{signal:AbortSignal.timeout(8000)});
console.log('OFFICE_EVENTS_HTTP',res.status);
const reader=res.body.getReader();let text='',state=null;
try{
 for(let i=0;i<12;i++){
  const {value,done}=await reader.read();if(done)break;text+=new TextDecoder().decode(value);
  const lines=text.split('\n');text=lines.pop();
  for(const line of lines){ if(line.startsWith('data: ')){const event=JSON.parse(line.slice(6));if(event.type==='state')state=event;} }
  if(state?.bots?.length===9 || state?.error)break;
 }
 console.log('OFFICE_LIVE_STATE',JSON.stringify({bots:state?.bots?.length,groups:state?.groups?.length,error:state?.error}));
}finally{await reader.cancel();}
if(debit!==credit || state?.bots?.length!==9 || state?.error)process.exitCode=1;
