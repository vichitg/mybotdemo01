// Smoke test through the running BotTeam app; credentials never leave its host process.
import { connect } from './cdp.mjs';
const c = await connect();
try {
  const mode = await c.evaluate('App.call("llm.mode.set", {mode:"9router"})');
  console.log('MODE', JSON.stringify(mode));
  const boot = await c.evaluate('App.call("rk",{path:"bootstrap",input:{}}).then(b=>({bots:b.bots.map(x=>({id:x.id,name:x.name})),groups:b.groups.length}))');
  console.log('BOOT', JSON.stringify(boot));
  console.log('VISIBLE', await c.evaluate('document.body.innerText.slice(-1200)'));
} catch (error) {
  console.error('APP_ERROR', error.message);
  process.exitCode = 1;
} finally { c.close(); }
