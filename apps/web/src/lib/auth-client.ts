// Re-export the shared Better Auth client from the auth package.
// This keeps the import path `@/lib/auth-client` working across the codebase
// while there's one source of truth for auth config.
export {
  authClient,
  getSession,
  signIn,
  signOut,
  signUp,
  useSession,
} from "@homebuddy-12/auth/client";
