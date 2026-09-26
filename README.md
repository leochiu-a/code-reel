# CodeReel

A browser-only code snippet editor: write your steps, style the frame, play the
animation, and export images. Everything runs in the browser — there is no
backend, no API route, and no server-side rendering of user data.

## The editor

Type your code straight into the frame and click line numbers to highlight
them. Add and switch steps from the toolbar below, pick a theme and layout in
the panel on the right, then play the sequence to see the code morph between
steps.

![CodeReel editor](docs/editor.png)

## Run Locally

**Prerequisites:** Node.js, pnpm

```
pnpm install
pnpm dev
```

## Build

```
pnpm build
pnpm start
```

## Exports

- **Images** (PNG / JPEG / WebP) are rendered in the browser via `modern-screenshot`.
- **Video**: use the in-app Recording Guide — play the animation and capture the
  highlighted region with your own screen recorder (CleanShot, OBS, etc.).
