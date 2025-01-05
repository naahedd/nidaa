This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

# SOS Emergency Detection System

The idea for this offline SOS web app emerged from observing the challenges of our people in Gaza and South Lebanon. Designed specifically for war zones and disaster areas, it provides a reliable means of emergency communication and recovery when traditional networks are no longer an option.

## Status

Currently in development 

## Core Features

### Automated Emergency Detection

The app runs silently in the background, utilizing multiple sensor types:

#### Motion Sensors
- **Accelerometer**
  - Detects sudden acceleration changes
  - Monitors impact forces
  - Identifies falling motions
  - Threshold: 5.0 m/s²

- **Gyroscope**
  - Measures device orientation
  - Tracks rotational movement
  - Detects unusual tilting
  - Threshold: 6.0 rad/s

#### Sensor Fusion
- Combined sensor data analysis
- Pattern recognition for:
  - Explosion impacts
  - Building collapses
  - Vehicle accidents
  - Sudden displacements

### Smart Response System

When potential danger is detected:
1. Immediate "Are you okay?" check
2. 2-minute response window
3. Automated escalation if no response
4. False alarm prevention

### Emergency Protocol
- Immediate notification on detection
- Interactive response options
- Automated SOS if unresponsive
- Service worker ensures offline functionality

## Technical Foundation

Built with modern web technologies for maximum reliability:
- Next.js + TypeScript
- Service Workers for offline operation
- Device Sensors API
- Web Notifications
- PWA capabilities

## Privacy & Security

- Zero data collection
- Completely offline capable
- No external dependencies
- Local-first architecture

## Why This Matters

Traditional emergency systems often fail when needed most. This system:
- Works without internet
- Requires no manual activation
- Runs autonomously
- Prevents false alarms

## Development Status

Currently implementing:
- [ ] Location sharing
- [ ] Emergency contact integration
- [ ] Enhanced movement detection
- [ ] Multi-device mesh networking
