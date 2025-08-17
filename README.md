# Fennec Animation

![Next.js](https://img.shields.io/badge/Next.js-15.3.1-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.0.0-61dafb?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-yellow?style=flat-square&logo=javascript)

A JavaScript/React project which animates 8-bit images to accompany a song.

[![Demo](https://img.shields.io/badge/DEMO-004596?style=for-the-badge)](https://fennec.michellef.dev)

## Table of Contents

- [Getting Started](#getting-started)
- [Deploying to the Web](./docs/deploying-to-the-web.md)
- [Running Locally](#running-locally)
- [Running Production Preview](#running-production-preview)
- [Deploying Updates to Production](#deploying-updates-to-production)
- [Creating Pixel Art](#creating-pixel-art)
- [Notes for Non-Windows Users](#notes-for-non-windows-users)
- [General Notes](#general-notes)
<!-- [To Do](#to-do) -->

## Getting Started

Clone the repository:

```powershell
git clone https://github.com/michellevit/Fennec-Animation.git
```

Install dependencies

```powershell
npm install
```

## Running Locally

Run the development server:

```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

**Note:** It may be better to [run via preview](#running-production-preview) instead (but don't run both at the same time)

## Running Production Preview

To simulate production locally before deploying:

```powershell
npm run preview
```

The link to the preview server will automatically be copied to your clipboard.

## Deploying Updates to Production

**Note:** The deploy process in this project includes a Windows-specific clean step.  
If you're using macOS or Linux, see the [Notes for Non-Windows Users](#notes-for-non-windows-users) section.

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
- Export the contents of the /out folder to the gh-pages branch
- This keeps your source code in main, and your deployed static site in gh-pages

## Creating Pixel Art

- [ChatGPT](https://openai.com/index/chatgpt/)
- [Pixil Art](https://www.pixilart.com/)

## Notes for Non-Windows Users

The `deploy` command in `package.json` includes a Windows-specific clean step:

```json
"deploy": "npm run build && gh-pages -d out --dotfiles",
"build": "npm run clean && next build",
"clean": "powershell -ExecutionPolicy Bypass -File .\\scripts\\clean.ps1"
```

The clean.ps1 script resolves a Windows-only file lock issue where media files (like mp3s) in /public/ can cause builds to fail.

On macOS and Linux, this issue does not occur.

However, since npm run build always triggers npm run clean, this will fail on Mac because PowerShell isn't installed.

There is an alternative deploy-mac command to avoid this:

```bash
npm run deploy-mac
```

## General Notes

### Different between npm run dev + npm run preview:

#### npm run dev

- Hot reloads on file changes.
- Includes dev-only code (warnings, slow paths).
- Fast rebuilds for dev feedback.
- Not optimized for speed or size.

#### npm run preview

- Uses output of next build (optimized, minified, production-ready files).
- No hot reloads.
- Exactly what will be deployed to production.
- Useful for realistic testing.

### npm run preview: Local vs Network:

When running the local preview server, you'll see two addresses:

- http://localhost:5000
- http://10.0.0.89:5000

#### Use http://localhost:5000 when:

- Testing in your local browser (Chrome, Firefox, Edge).
- Previewing layout, animations, and functionality on your own computer.
- You don’t need to test from other devices.

#### Use http://10.0.0.89:5000 when:

- Testing the site on a phone, tablet, or another device connected to your Wi-Fi/LAN.
- Checking responsive layouts and touch interactions on different screen sizes.
- Demoing the project to someone else on the same network.

#### Summary

- Both links serve the exact same local build.
- The only difference is which device you're accessing it from.
- localhost only works on the computer you run `npm run preview` on

<!--

🛠️ TODO
-----------------------------------
- Play button orange on mobile?
- Add sky elements .png (sun, moon)
- Darken entire canvas at night (except for moon/sun)
- Add foreground elements
- Smoother frame movement
- Add instructions
- Attempt local + prod deploy with Mac

-->
