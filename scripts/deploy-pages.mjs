/**
 * Publish dist/ to origin gh-pages (legacy GitHub Pages).
 * Uses one-off committer identity via git -c (no git config mutation).
 */
import { execSync } from 'node:child_process'
import { cpSync, mkdirSync, rmSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

const root = new URL('..', import.meta.url).pathname
const dist = join(root, 'dist')
if (!existsSync(dist)) {
  console.error('dist/ missing — run build:pages first')
  process.exit(1)
}

const staging = join(tmpdir(), `us-wine-gh-pages-${Date.now()}`)
rmSync(staging, { recursive: true, force: true })
mkdirSync(staging, { recursive: true })
cpSync(dist, staging, { recursive: true })
writeFileSync(join(staging, '.nojekyll'), '')

const git = (cmd) =>
  execSync(cmd, {
    cwd: staging,
    stdio: 'inherit',
    env: { ...process.env },
  })

git('git init')
git('git checkout -b gh-pages')
git('git add -A')
git(
  'git -c user.email="kfguiang-spec@users.noreply.github.com" -c user.name="kfguiang-spec" commit -m "Deploy US wine regions to GitHub Pages"',
)
git('git remote add origin https://github.com/kfguiang-spec/us-wine-regions.git')
git('git push -u origin gh-pages --force')
console.log('Deployed → https://kfguiang-spec.github.io/us-wine-regions/')
