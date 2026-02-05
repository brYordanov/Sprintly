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
import { RegisterBodySchema } from '@shared/validations'
import { Lock, Mail, User, UserCircle } from 'lucide-react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import z from 'zod'

const RegisterFormSchema = RegisterBodySchema.extend({
    confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
    message: 'Passwords dont match',
    path: ['confirmPassword'],
})
export type RegisterFormData = z.infer<typeof RegisterFormSchema>

export function RegisterForm() {
    const onSubmit = () => {
        console.log(123)
    }

    const { control, handleSubmit } = useForm<RegisterFormData>({
        resolver: zodResolver(RegisterFormSchema),
        mode: 'onTouched',
        defaultValues: {
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
            fullname: '',
        },
    })
    return (
        <Card className="w-[70%] max-w-125 shadow-soft">
            <CardHeader className="justify-items-center">
                <ProjectLogo />
                <CardTitle className="font-bold">Create your account</CardTitle>
                <CardDescription>Start managing your projects like a pro</CardDescription>
            </CardHeader>
            <CardContent>
                <form
                    id="register-form"
                    action=""
                    className="space-y-5"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    <FieldGroup>
                        <FormField
                            name="email"
                            control={control}
                            label="Email*"
                            placeholder="Enter email"
                            Icon={Mail}
                        />
                        <FormField
                            name="username"
                            control={control}
                            label="Username*"
                            placeholder="Enter username"
                            Icon={User}
                        />
                        <FormField
                            name="fullname"
                            control={control}
                            label="Full Name"
                            placeholder="Enter full name"
                            Icon={UserCircle}
                        />
                        <FormField
                            className="pb-6"
                            name="password"
                            control={control}
                            label="Password*"
                            Icon={Lock}
                        />
                        <FormField
                            name="confirmPassword"
                            control={control}
                            label=" Confirm Password*"
                            Icon={Lock}
                        />
                    </FieldGroup>
                    <Button type="submit" form="register-form" className="w-full min-h-11 text-lg">
                        Create Account
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground justify-center">
                Already have an account?{' '}
                <Link
                    href="/login"
                    className="underline hover:text-foreground pl-1 text-primary font-medium"
                >
                    Sign in
                </Link>
            </CardFooter>
        </Card>
    )
}
