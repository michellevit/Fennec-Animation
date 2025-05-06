# Deploying to the Web

These are instructions to deploy this animation to GitHub Pages, and then to a subdomain. Some instructions may already be completed - this is because I am writing this as a reference on how to deploy from scratch, but if you are cloning this repository you may skip some of the file setup that has already been completed. Steps with an asterisk (\*) can be skipped if you are cloning this repo.

## 1. Update next.config.js (\*)

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/Fennec-Animation",
  assetPrefix: "/Fennec-Animation",
};

export default nextConfig;
```

Replace 'Fennec-Animation' with your GitHub repo name if different.

## 2. Add a deploy script to package.json (\*)

In your package.json, add this to scripts:

```json
"scripts": {
...
"export": "next build && next export",
"deploy": "npm run export && gh-pages -d out"
...
}
```

## 3. Install gh-pages package

```powershell
npm install gh-pages --save-dev
```

## 4. Deploy to GitHub Pages

Run the following to build and deploy:

```powershell
npm run deploy
```

**Note:**

- This will automatically create a gh-pages branch (if it doesn't already exist), and push the static site files from your /out folder to it.
- GitHub Pages will use this branch to serve your website, once you enable it in the next step.
- You won’t see the usual source code in this branch — just the generated static files (HTML, JS, CSS).

## 5. Set up GitHub Pages

- Go to your repository on GitHub.
- Navigate to Settings → Pages (found in the left-hand sidebar).
- Under "Build and deployment", set the following:
  - Source: Deploy from a branch
  - Branch: gh-pages
  - Folder: / (root)

**Note:**

- Once this is set, GitHub will serve your site from the gh-pages branch.

## 6. (Optional) Use a Custom Domain or Subdomain

If you want your project to be accessible at a custom domain like fennec-animation.michellef.dev, follow these steps:

#### Step 1: Add a CNAME File to the Project

- In your project, go to the public/ directory.
- Create a file named CNAME (no extension).
- Inside the file, write your subdomain:
  - fennec-animation.michellef.dev
  - This file will be included in the export and tells GitHub Pages to use this domain.
- Commit and push the changes to main:

  ```powershell
  git add public/CNAME
  git commit -m "Add CNAME file for custom domain"
  git push origin main
  ```

- Then deploy:

  ```powershell
  npm run deploy
  ```

- The CNAME file must be included in the gh-pages branch for GitHub Pages to recognize and apply the custom domain.
- Adding it to the main branch ensures it's part of your source project and picked up during each deployment.

#### Step 2: Configure DNS Records

- In your domain provider’s DNS settings, add a CNAME record with the following values:

  - Host: fennec.michellef.dev
  - Points to: michellevit.github.io

- Important Notes:
  - The CNAME value must be a domain (e.g., michellevit.github.io)
  - Do not include the full GitHub Pages URL with a path (e.g., /Fennec-Animation/)

#### Step 3: Configure Custom Domain in GitHub

- Go to your repository on GitHub.
- Navigate to: Settings > Pages
- In the Custom Domain field, enter:
  - fennec.michellef.dev
  - Click Save.
- Check Enforce HTTPS once available.
- This step finalizes the link between your domain and the repository.

#### Step 4: Redeploy

- After updating the CNAME file and DNS settings, redeploy your site:

  ```powershell
  npm run deploy
  ```

- GitHub will now serve your project at the custom subdomain.

## 7. Updating the Deployed Project

After making changes to your project:

#### Step 1: Commit and Push to GitHub

```powershell
git add .
git commit -m "Your commit message here"
git push origin main
```

This updates your GitHub repository's main branch.

#### Step 2: Redeploy to GitHub Pages

```powershell
npm run deploy
```

This will:

- Rebuild your project using next build
- Export it as static files to /out
- Push the new files to the gh-pages branch
- Your deployed site will now reflect the latest changes.
