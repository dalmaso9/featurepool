export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Place to initialize OTel SDKs if desired.
    // Sentry auto-instrumentation will hook into Next APIs.
  }
}
