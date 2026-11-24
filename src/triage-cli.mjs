import { readFile } from 'node:fs/promises';
import { planIssues } from './triage.mjs';
try {
 const [reportPath,issuesPath]=process.argv.slice(2);
 if(!reportPath||!issuesPath) throw Error('Usage: triage-cli report.json existing-issues.json');
 const report=JSON.parse(await readFile(reportPath,'utf8'));
 const existing=JSON.parse(await readFile(issuesPath,'utf8'));
 console.log(JSON.stringify({mode:'dry-run',proposals:planIssues(report,existing)},null,2));
} catch(e){console.error(e.message);process.exitCode=1;}
