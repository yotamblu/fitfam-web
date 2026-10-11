import SessionProvider from "@/components/app/Session";

// Everything signed-in lives here: the session gate loads the user and their plans once for all of these screens.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
