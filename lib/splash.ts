/**
 * The launch splash stays up while a signed-in visitor's home screen loads (see components/Splash.tsx), so nothing but
 * the splash and then the finished screen is ever shown. Call this when the first screen is ready to be seen. It is
 * safe to call more than once and does nothing on pages that use the timed splash.
 */
export function releaseSplash() {
  try {
    (window as unknown as { __ffRelease?: () => void }).__ffRelease?.();
  } catch {
    // the splash is decoration; never let it break the app
  }
}
