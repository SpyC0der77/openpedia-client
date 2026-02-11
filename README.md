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

## Wikipedia OAuth Login

This app supports signing in with your Wikipedia/Wikimedia account via OAuth 2.0.

### Setup

1. Copy `.env.example` to `.env.local`
2. Generate `AUTH_SECRET`: `npx auth secret`
3. Register an OAuth 2.0 consumer at [meta.wikimedia.org](https://meta.wikimedia.org/wiki/Special:OAuthConsumerRegistration/propose/oauth2):
   - Add redirect URL: `http://localhost:3000/api/auth/callback/wikimedia` (or your production URL)
   - Select "User identity verification only" for minimal scope (faster approval)
   - Do not check "This consumer is only for [your username]"
4. After creating the consumer, copy the client ID and secret to `AUTH_WIKIMEDIA_ID` and `AUTH_WIKIMEDIA_SECRET`

You can test immediately with your own Wikimedia account. Public use may require admin approval (typically within a few days).

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
