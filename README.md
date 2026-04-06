# 50+ WorkReady

> **Your Experience Is Your Edge.**
> A job preparation toolkit built specifically for adults 50 and older — because your best work may still be ahead of you.

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Live App](https://img.shields.io/badge/Live%20App-www.workready50.com-gold)](https://www.workready50.com)
[![Built With](https://img.shields.io/badge/Built%20With-React%20%2B%20tRPC%20%2B%20TypeScript-navy)](https://www.workready50.com)

---

## Overview

**50+ WorkReady** is a full-stack Progressive Web App (PWA) designed to empower adults aged 50 and older as they navigate today's job market. The platform addresses the unique challenges faced by experienced professionals — age bias in hiring, outdated resume formats, unfamiliar digital interview tools, and a lack of community support — by providing a comprehensive, AI-powered career toolkit accessible from any device.

The app is free to use with optional premium plans, and is built with accessibility, mobile-first design, and emotional encouragement at its core.

**Live at:** [https://www.workready50.com](https://www.workready50.com)

---

## Features

### Core Tools (Free)
| Feature | Description |
|---|---|
| **Resume Tips** | Modernize your resume and eliminate age bias with expert guidance |
| **Interview Scripts** | Practice confident, age-positive answers to common interview questions |
| **Cover Letter Builder** | Generate a professional, personalized cover letter instantly |
| **Scam Job Checker** | Identify red flags in job postings before you apply |
| **Age-Friendly Job Resources** | Curated job boards and employers known to hire workers 50+ |
| **Daily Affirmations** | Rotating motivational affirmations tailored to the 50+ job search experience |
| **Job Application Tracker** | Track every application, status, and follow-up in one organized place |
| **Salary Negotiation Guide** | Scripts and strategies to confidently ask for what you deserve |
| **Success Stories** | Real inspiration from workers 50+ who successfully re-entered the workforce |
| **LinkedIn Profile Guide** | Optimize your LinkedIn profile to attract age-friendly employers |
| **Networking Hub** | Tips and local event resources to grow your professional connections |

### AI-Powered Tools
| Feature | Description |
|---|---|
| **AI Interview Coach** | Paste any job description and receive 7 custom interview questions with age-positive answer frameworks |
| **AI Job Match** | Paste a job description and get your resume match score, missing keywords, and improvement tips |
| **Resume Builder** | Build and download a professional, age-bias-free resume as a formatted PDF |

### Community & Growth
| Feature | Description |
|---|---|
| **Referral Program** | Share the app and earn rewards for growing the community |
| **Premium Bonus Scripts** | 10 advanced interview scripts for the toughest questions (Premium) |
| **Morning Ritual** | Daily affirmation banner with rotating motivational quotes |

---

## Tech Stack

50+ WorkReady is built on a modern, production-ready full-stack architecture:

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Tailwind CSS 4, shadcn/ui |
| **Backend** | Node.js, Express 4, tRPC 11 |
| **Database** | MySQL (TiDB), Drizzle ORM |
| **Authentication** | Manus OAuth (JWT session cookies) |
| **AI / LLM** | Built-in LLM API (server-side, via tRPC procedures) |
| **Payments** | Stripe (Checkout Sessions + Webhooks) |
| **File Storage** | AWS S3 (via Manus storage helpers) |
| **Build Tool** | Vite 6 |
| **Testing** | Vitest |
| **Hosting** | Manus Platform (custom domain: workready50.com) |

---

## Project Structure

```
50plus-workready/
├── client/
│   ├── src/
│   │   ├── pages/          # All page-level React components
│   │   ├── components/     # Reusable UI components (shadcn/ui + custom)
│   │   ├── contexts/       # React contexts (auth, theme)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/trpc.ts     # tRPC client binding
│   │   ├── App.tsx         # Routes and layout
│   │   └── index.css       # Global styles and design tokens
├── server/
│   ├── routers.ts          # All tRPC procedures (public + protected)
│   ├── db.ts               # Database query helpers
│   ├── storage.ts          # S3 file storage helpers
│   └── _core/              # Framework plumbing (OAuth, context, LLM, maps)
├── drizzle/
│   ├── schema.ts           # Database schema definitions
│   └── migrations/         # Auto-generated migration files
├── shared/
│   ├── types.ts            # Shared TypeScript types
│   └── const.ts            # Shared constants
├── LICENSE                 # Apache 2.0 License
├── todo.md                 # Feature and task checklist
└── README.md               # This file
```

---

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm 9+
- A MySQL-compatible database (TiDB recommended)

### Installation

```bash
# Clone the repository
git clone https://github.com/jb6860-tech/50plus-workready.git
cd 50plus-workready

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL, JWT secret, and API keys

# Push the database schema
pnpm db:push

# Start the development server
pnpm dev
```

The app will be available at `http://localhost:3000`.

### Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | MySQL/TiDB connection string |
| `JWT_SECRET` | Session cookie signing secret |
| `STRIPE_SECRET_KEY` | Stripe secret key (server-side) |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (frontend) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `VITE_APP_ID` | OAuth application ID |
| `OAUTH_SERVER_URL` | OAuth backend base URL |
| `VITE_OAUTH_PORTAL_URL` | OAuth login portal URL |

### Available Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start the development server |
| `pnpm build` | Build for production |
| `pnpm test` | Run Vitest test suite |
| `pnpm db:push` | Generate and run database migrations |
| `pnpm format` | Format code with Prettier |

---

## Pricing

50+ WorkReady offers three tiers to make the tools accessible to everyone:

| Plan | Price | Features |
|---|---|---|
| **Free** | $0 forever | Resume tips, interview scripts, cover letter builder, scam checker, job resources, affirmations, job tracker, salary guide, success stories |
| **Monthly** | $7.99/month | Everything in Free + AI Interview Coach, AI Job Match, Resume Builder PDF, LinkedIn Guide, Networking Hub, Bonus Scripts |
| **Lifetime** | $29.99 one-time | Everything in Monthly — pay once, use forever |

---

## Contributing

Contributions are welcome and encouraged. If you are a developer who believes in empowering the 50+ workforce, here is how to get involved:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes and write tests
4. Commit your changes: `git commit -m "Add: your feature description"`
5. Push to your fork: `git push origin feature/your-feature-name`
6. Open a Pull Request with a clear description of the change

Please open a GitHub Issue first for major changes so the direction can be discussed before implementation begins.

---

## Roadmap

The following features are planned for future releases:

- **Community Forum** — A moderated space for 50+ job seekers to share advice and support each other
- **Resume Review AI** — Upload your existing resume and receive specific, actionable feedback
- **Mock Video Interview** — Practice answering questions on camera with AI feedback on tone and delivery
- **Employer Directory** — A searchable database of age-friendly employers with ratings and reviews
- **Mobile App** — Native iOS and Android apps via PWABuilder and Median.co wrappers

---

## License

This project is licensed under the **Apache License, Version 2.0**. See the [LICENSE](LICENSE) file for full details.

```
Copyright 2026 jb6860-tech (50+ WorkReady)

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0
```

---

## Contact

- **Live App:** [https://www.workready50.com](https://www.workready50.com)
- **GitHub:** [https://github.com/jb6860-tech/50plus-workready](https://github.com/jb6860-tech/50plus-workready)
- **Issues:** [https://github.com/jb6860-tech/50plus-workready/issues](https://github.com/jb6860-tech/50plus-workready/issues)

---

*Built with purpose. Designed for experience. Made for the workforce that built the world.*
