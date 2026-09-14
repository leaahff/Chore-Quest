# Chorequest

**Level up your household chores.** Chorequest turns everyday chores into a small game: complete tasks, earn XP and coins, keep your streak alive, unlock badges and avatars, and redeem rewards.

## Publish on GitHub Pages

1. Create a new GitHub repository named **`Chore-Quest`** (or another name you prefer).
2. Upload **all files in this folder** to the repository, including `.github/workflows/deploy.yml`.
3. Make sure the default branch is **`main`**.
4. On GitHub, open **Settings → Pages**.
5. Under **Build and deployment**, choose **GitHub Actions**.
6. Push to `main`. The workflow will build and publish the site automatically.
7. Your site will normally be available at:
   `https://YOUR-GITHUB-USERNAME.github.io/Chore-Quest/`

### Run locally

Prerequisite: Node.js 20+.

```bash
npm ci
npm run dev
```

Then open the local URL shown by Vite.

### Build check

```bash
npm run lint
npm run build
```

## Notes

- The app stores its game state in the browser's `localStorage`.
- Browser notifications are optional and depend on browser permission/support.
- No Gemini API key is currently used by the app, so you do **not** need to put a secret API key on GitHub for this version.
- `.env*` files are ignored by Git, while `.env.example` is safe to commit.
