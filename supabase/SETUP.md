# Connect Supabase for household creation

1. Create a Supabase project.
2. In the project Dashboard, copy the Project URL, a Publishable key, and a Secret key.
3. Copy `.env.local.example` to `.env.local` in the project root and fill in those values. Set `SUPABASE_ADMIN_EMAILS` to the email address used by the administrator account. Keep `SUPABASE_SECRET_KEY` server-only; `.env.local` is ignored by Git.
4. In Supabase Authentication, create the administrator user with the same email. The server checks the signed-in account against `SUPABASE_ADMIN_EMAILS` before allowing household creation.
5. Run `supabase/migrations/20261128000000_create_households.sql` in the Supabase SQL Editor, or apply it with the Supabase CLI. If you already ran an earlier version, run the updated migration again so the server `service_role` receives the required table permissions.
6. In Authentication → URL Configuration, add `http://localhost:3000/**` to the allowed redirect URLs for local development. Add your deployed site's matching callback URL when deploying. Supabase only sends recovery links to URLs on this allowlist.
7. Restart the Next.js development server and sign in. The Create Household form now creates the homeowner’s Auth account and database row together. The password is sent to Supabase Auth over the server route and is never written to the households table or browser storage.

The login page's Forgot password link sends a recovery email from the browser so Supabase can keep its PKCE verifier in the same browser session. Open the reset link in that browser; its callback exchanges the recovery code for a session and lets the user set a new password. Reset emails require working Supabase Auth email delivery.

If household insertion fails after Auth creates the account, the route deletes that newly created Auth user so the database and Auth records do not drift apart.
