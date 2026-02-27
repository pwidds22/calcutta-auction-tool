import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ResetPasswordForm } from '@/components/auth/reset-password-form'

export default async function ResetPasswordPage() {
  // Verify the user has a valid session (set by auth callback after recovery email click)
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    // No session at all — they didn't come from a recovery email
    redirect('/forgot-password?error=invalid_link')
  }

  return <ResetPasswordForm />
}
