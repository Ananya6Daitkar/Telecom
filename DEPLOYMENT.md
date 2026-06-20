# VoxHalo Deployment

## Vercel

1. Push this repository to GitHub.
2. Open https://vercel.com/new and import the GitHub repository.
3. Set the environment variable:

```env
NEXT_PUBLIC_GROQ_API_KEY=your_groq_key
```

4. Deploy.

Vercel should detect Next.js automatically. `vercel.json` pins the expected install and build commands.

## Build Check

```bash
npm install
npm run build
```

## Demo URL

After deploy, use the Vercel production URL for judges. Confirm these screens before submitting:

- Call
- Proof
- Security
- Receipt
- Arena
- Audit
