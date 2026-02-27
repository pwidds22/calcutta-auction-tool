import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'

interface ForgotPasswordPageProps {
  searchParams: Promise<{ error?: string }>
}

export default async function ForgotPasswordPage({ searchParams }: ForgotPasswordPageProps) {
  const params = await searchParams
  const invalidLink = params.error === 'invalid_link'

  return <ForgotPasswordForm invalidLink={invalidLink} />
}
