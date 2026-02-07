'use client'

import { FormField } from '@/components/forms/FormField'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { FieldGroup } from '@/components/ui/field'
import { ProjectLogo } from '@/components/ui/icon'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoginBodyDto, LoginBodySchema } from '@shared/validations'
import { Lock, Mail } from 'lucide-react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { useLogin } from '../api/useLogin'

export function LoginForm() {
    const { mutate, isPending } = useLogin()
    const onSubmit = (data: LoginBodyDto) => {
        mutate(data)
    }

    const { control, handleSubmit } = useForm<LoginBodyDto>({
        resolver: zodResolver(LoginBodySchema),
        mode: 'onTouched',
        defaultValues: {
            identifier: '',
            password: '',
        },
    })
    return (
        <Card className="w-[70%] max-w-125 shadow-soft">
            <CardHeader className="justify-items-center">
                <ProjectLogo />
                <CardTitle className="font-bold">Enter your account</CardTitle>
                <CardDescription>Manage your projects like a pro</CardDescription>
            </CardHeader>
            <CardContent>
                <form
                    id="login-form"
                    action=""
                    className="space-y-5"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    <FieldGroup>
                        <FormField
                            name="identifier"
                            control={control}
                            label="Email or username*"
                            placeholder="Enter email or username"
                            Icon={Mail}
                        />
                        <FormField
                            className="pb-6"
                            name="password"
                            control={control}
                            label="Password*"
                            Icon={Lock}
                            type="password"
                        />
                    </FieldGroup>
                    <Button type="submit" form="login-form" className="w-full min-h-11 text-lg">
                        {isPending ? 'Loging...' : 'Log in'}
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground justify-center">
                Dont have an account?{' '}
                <Link
                    href="/register"
                    className="underline hover:text-foreground pl-1 text-primary font-medium"
                >
                    Sign up
                </Link>
            </CardFooter>
        </Card>
    )
}
