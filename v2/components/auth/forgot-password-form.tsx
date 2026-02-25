'use client'

import { useState } from 'react'
import { resetPassword } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import Link from 'next/link'

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)
    const result = await resetPassword(formData)
    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
    } else {
      setSuccess(true)
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md border border-white/10">
      <CardHeader>
        <CardTitle>Reset Password</CardTitle>
        <CardDescription>
          Enter your email and we&apos;ll send you a reset link
        </CardDescription>
      </CardHeader>
      <CardContent>
        {success ? (
          <div className="space-y-4">
            <div className="rounded-md bg-emerald-500/10 p-3 text-sm text-emerald-400">
              Check your email for a password reset link. It may take a minute to arrive.
            </div>
            <p className="text-center text-sm text-muted-foreground">
              <Link href="/login" className="text-primary underline">
                Back to sign in
              </Link>
            </p>
          </div>
        ) : (
          <form action={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-500/10 p-3 text-sm text-red-400">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Remember your password?{' '}
              <Link href="/login" className="text-primary underline">
                Sign in
              </Link>
            </p>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
