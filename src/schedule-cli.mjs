import { runScheduled } from './schedule.mjs';
try {
 const [repo,state,report]=process.argv.slice(2);
 if (!repo || !state || !report) throw new Error('Usage: schedule-cli owner/repo state.json report.json');
 console.log(JSON.stringify(await runScheduled(repo,state,report)));
} catch(e) { console.error(e.message); process.exitCode=1; }
