# Windows: quick start

1. Install **Node.js 22 LTS** (https://nodejs.org) and **Git** (https://git-scm.com). Restart the terminal.
2. Unzip the project, open PowerShell in the `dogfight` folder.
3. Run:

```powershell
npm install
npm run dev
```

4. Open http://localhost:5173 in Chrome. Arrow keys fly the ship.
5. Experiments: open the URLs from README.md, copy numbers from the HUD into the README tables.
   DevTools (F12) -> Performance -> gear icon -> CPU: 6x slowdown for experiment 3.
6. When done:

```powershell
npm run lint
git init
git add .
git commit -m "Lab 1: done"
git tag lab-01
```
