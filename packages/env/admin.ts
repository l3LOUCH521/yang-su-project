import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

let cachedEnv: ReturnType<typeof createEnv> | null = null;

function initEnv() {
  if (cachedEnv) return cachedEnv;

  cachedEnv = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    JWT_SECRET: z.string(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    // E2E: process.env.E2E,
    JWT_SECRET: process.env.JWT_SECRET,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
  });

  return cachedEnv;
}

// Lazily validate env vars the first time they are accessed.
export const env = new Proxy(
  {},
  {
    get(_target, prop) {
      if (typeof prop !== "string") return undefined;
      // Ensure env is initialised/validated only when actually used.
      return (initEnv() as any)[prop];
    },
  },
) as ReturnType<typeof createEnv>;

