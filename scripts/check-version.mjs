import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const run = (cmd) => execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
const currentVersion = () => JSON.parse(readFileSync('package.json', 'utf8')).version;

// Compare against the branch upstream, falling back to the remote default branch.
let remoteVersion = null;
for (const ref of ['@{u}', 'origin/HEAD', 'origin/master']) {
  try {
    remoteVersion = JSON.parse(run(`git show ${ref}:package.json`)).version;
    break;
  } catch {
    // try next ref
  }
}

if (remoteVersion === null || currentVersion() !== remoteVersion) {
  process.exit(0);
}

run('npm version patch --no-git-tag-version');
run('git add package.json package-lock.json');
console.log(`Version unchanged from remote (${remoteVersion}); bumped to ${currentVersion()}.`);
