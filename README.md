# VoxHalo — Live Voice Trust

> Every call gets a trust score before you say hello.

VoxHalo is a real-time telecom fraud detection platform built with Next.js. It analyzes incoming voice calls using heuristic trust scoring, speaker diarization, voice fingerprinting, and an AI-powered honeypot to identify scams, cloned voices, and social engineering attempts — all in the browser.

---

## Features

| Screen | What it does |
|---|---|
| **Call** | Live trust ring with real-time audio level, consent badge, and Guardian SOS panel |
| **Proof** | Judge-ready proof view with implementation badges and evidence strips |
| **Security** | Security case summary with threat classification |
| **Receipt** | Tamper-evident evidence receipt for legal/compliance use |
| **Reasoning** | Explainable heuristic breakdown of the trust score |
| **Honeypot** | AI honeypot (powered by Groq) that traps scammers into revealing intent |
| **Network** | Pattern network visualizing call relationship graphs |
| **Red Team** | Red team dashboard for attack simulation and stress testing |
| **Arena** | Speech arena comparing real vs. cloned voice detection |
| **CEO (Diarization)** | Speaker diarization view isolating individual voices on a call |
| **Compliance** | Toggle between TRAI and GDPR compliance modes |
| **Privacy** | Privacy architecture diagram showing data flow and consent enforcement |
| **Audit** | Immutable audit log of all events during a session |

---

## Tech Stack

- **Framework** — Next.js 14 (App Router)
- **UI** — Tailwind CSS, Framer Motion, Recharts, Lucide React
- **State** — Zustand
- **AI / LLM** — Groq API (honeypot & reasoning)
- **ML** — `@xenova/transformers` (in-browser voice feature extraction)
- **Language** — TypeScript

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Groq API key](https://console.groq.com)

### Install & run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

Copy `.env.example` to `.env.local` and fill in your key:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_GROQ_API_KEY=your_groq_api_key_here
```

---

## Scripts

```bash
npm run dev        # Start development server
npm run build      # Production build
npm run start      # Start production server
npm run lint       # ESLint
npm run typecheck  # TypeScript type check (tsc --noEmit)
```

---

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full Vercel deployment instructions.

**Quick deploy:**

1. Push to GitHub
2. Import repo at [vercel.com/new](https://vercel.com/new)
3. Add `NEXT_PUBLIC_GROQ_API_KEY` as an environment variable
4. Deploy — Vercel auto-detects Next.js

---

## Project Structure

```
app/                  Next.js app router (layout, page, global styles)
components/           All UI components (screens, panels, badges)
hooks/                Custom React hooks (Guardian alert)
lib/                  Core logic (audio capture, classifier, fingerprint,
                      honeypot, diarization, consent ledger, store, types…)
public/
  benchmark/          Audio deepfake evaluation dataset (JSON)
  demo-audio/         Sample real and cloned voice files
scripts/              Offline evaluation scripts
```

---

## Key Concepts

**Trust Score** — A 0–1 heuristic score computed from voice anomaly signals, fingerprint match, scenario classification, and compliance state. Displayed as a live ring on the Call screen.

**Guardian SOS** — When trust drops below a threshold, a browser speech synthesis warning fires and the user can mark the caller safe or escalate to a guardian contact.

**Honeypot** — Groq LLM generates a plausible-sounding trap statement. If the caller responds with suspicious intent, the response is flagged and logged.

**Consent Ledger** — Every call consent event is recorded with a cryptographic certificate visible on the Call screen.

**Audit Log** — All system events (scenario changes, honeypot activations, compliance switches, Guardian alerts, report exports) are logged immutably for the session.

---

## License

MIT
