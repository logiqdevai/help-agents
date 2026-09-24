## API rules (`api/**`)

@.cursor/rules/api-code-structure-and-best-practices.mdc

## App rules (`app/**`)

@.cursor/rules/app-code-structure-and-best-practices.mdc

## Local development

For local API work, use `.env.staging` (`npm run start:staging` in `api/`), not `.env.local` — `.env.local` has empty/placeholder integration keys (e.g. `RESEND_API_KEY`), so flows like email sending fail locally with it. `.env.staging` has working keys.

## App structure notes (Next.js App Router)

The app rules above were written for a Vite/React Router project. In this Next.js app:

- Route files live in `app/src/app/**` (`page.tsx`, `layout.tsx`) and stay **thin** — they only render a page component and set `metadata`.
- Page-level components live in `app/src/views/<section>/` (**not** `src/pages`, which Next.js reserves for the Pages Router). Everything the rules say about `pages/<section>/{components,hooks,utils}` applies to `views/<section>/`.
- UI kit is shadcn on Base UI (`components/ui/*`), not HeroUI — ignore the HeroUI-specific snippets (Modal/Table/Select nesting); use the local `components/ui` primitives (`dialog`, `alert-dialog`, `table`, `select`, `native-select`, `tabs`, …) and `ConfirmationDialog` for destructive actions.
- Navigation uses `next/link` / `useRouter` from `next/navigation` with the `Routes` object; env vars via `environments`; toasts via `notify` from `@/lib/notify`.
- `useSearchParams()` must sit under a `<Suspense>` boundary in the route file.
- Zod is v3 (`zod@3.25`).
