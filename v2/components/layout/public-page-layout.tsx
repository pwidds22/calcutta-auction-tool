import { createClient } from '@/lib/supabase/server';
import { Navbar } from '@/components/layout/navbar';
import { AppNavbar } from '@/components/layout/app-navbar';
import { Footer } from '@/components/layout/footer';

/**
 * Layout wrapper for public pages (events, blog) that shows
 * the marketing navbar for anonymous users and the app navbar
 * for authenticated users.
 */
export async function PublicPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      {user ? <AppNavbar /> : <Navbar />}
      {children}
      <Footer />
    </>
  );
}
