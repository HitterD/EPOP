'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useLogin } from '@/lib/api/hooks/use-auth'
// Removed lucide icon to reduce JS on auth pages

type LoginForm = {
  email: string
  password: string
}

function LoginContent() {
  const { mutate: login, isPending } = useLogin()
  const { register, handleSubmit } = useForm<LoginForm>()

  const onSubmit = (data: LoginForm) => {
    login(data)
  }

  return (
    <Card className="border-0 shadow-2xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@company.com"
              {...register('email', { required: true })}
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                prefetch={false}
                className="text-sm text-primary hover:underline"
                tabIndex={-1}
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register('password', { required: true, minLength: 6 })}
              disabled={isPending}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <span className="inline-flex items-center"><span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>Signing in...</span>
            ) : (
              'Sign in'
            )}
          </Button>
        </form>

        {process.env.NEXT_PUBLIC_ENABLE_REGISTRATION !== 'false' && (
          <div className="mt-4 text-center text-sm">
            Don't have an account?{' '}
            <Link href="/register" prefetch={false} className="text-primary hover:underline">
              Sign up
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function LoginPage() {
  return <LoginContent />
}
