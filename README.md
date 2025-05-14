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
- [Deploying Updates to Production](#deploying-updates-to-production)
- [Production Preview](#production-preview)
- [Creating Pixel Art](#creating-pixel-art)
- [To Do](#to-do)

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

## Deploying Updates to Production

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

## Production Preview

To simulate production locally before deploying:

```powershell
npm run export
```

Then separately (in another Terminal window) run:

```powershell
npx serve out
```

Then visit the provided port.

## Creating Pixel Art

- [ChatGPT](https://openai.com/index/chatgpt/)
- [Pixil Art](https://www.pixilart.com/)

## To Do

- Create start/end sprite images
- Configure sprite canvas size + location
- How to modify sprite speed + run until last 3 seconds
- Create side-scroll background .png + configure
- Create side-scroll foreground elements .png + configure
- Create side-scroll sky + configure
- Create sky elements .png (sun, moon, clouds, stars) + configure
- Add customizable controls
- Add instructions
