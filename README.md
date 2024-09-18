# Subscription Payment Manager

This is a Next.js project that implements a Subscription Payment Manager, allowing users to manage and track their recurring payments and subscriptions.

## Features

- Generate subscription lists using AI
- Add, edit, and delete subscriptions
- Filter subscriptions by status (active/inactive)
- Calculate total monthly cost
- Save progress locally
- Responsive design

## Technologies Used

- [Next.js](https://nextjs.org/) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Static typing
- [Shadcn UI](https://ui.shadcn.com/) - UI components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Zod](https://github.com/colinhacks/zod) - Schema validation
- [AI](https://github.com/vercel/ai) - AI SDK for Next.js
- [UUID](https://github.com/uuidjs/uuid) - Unique ID generation

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

## Project Structure

- `app/page.tsx`: Main component for the Subscription Payment Manager
- `components/subscriptions/types.ts`: TypeScript types and schemas for subscriptions
- `components/ui/`: Reusable UI components

## Learn More

To learn more about the technologies used in this project, check out the following resources:

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Shadcn UI Documentation](https://ui.shadcn.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Zod Documentation](https://zod.dev/)
- [Vercel AI SDK Documentation](https://sdk.vercel.ai/docs)

## Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
