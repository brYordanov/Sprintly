'use client'

import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { ProjectLogo } from '@/components/ui/icon'
import { InputWithIcon } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { RegisterBodySchema } from '@shared/validations'
import { Lock, Mail, User, UserCircle } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import z from 'zod'

const RegisterFormSchema = RegisterBodySchema.extend({
    confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
    message: 'Passwords dont match',
    path: ['confirmPassword'],
})
type RegisterFormData = z.infer<typeof RegisterFormSchema>

export function RegisterForm() {
    const form = useForm<RegisterFormData>({
        resolver: zodResolver(RegisterFormSchema),
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
                <form id="registerForm" action="" className="space-y-5">
                    <FieldGroup>
                        <Controller
                            name="email"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field>
                                    <FieldLabel htmlFor="email">Email</FieldLabel>
                                    <InputWithIcon
                                        {...field}
                                        id="email"
                                        aria-invalid={fieldState.invalid}
                                        placeholder="Enter email"
                                        autoComplete="off"
                                        Icon={Mail}
                                    />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />
                        <Controller
                            name="username"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field>
                                    <FieldLabel htmlFor="username">Username</FieldLabel>
                                    <InputWithIcon
                                        {...field}
                                        id="username"
                                        aria-invalid={fieldState.invalid}
                                        placeholder="Enter username"
                                        autoComplete="off"
                                        Icon={User}
                                    />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />
                        <Controller
                            name="fullname"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field>
                                    <FieldLabel htmlFor="fullname">Full Name</FieldLabel>
                                    <InputWithIcon
                                        {...field}
                                        id="fullname"
                                        aria-invalid={fieldState.invalid}
                                        placeholder="Enter fullname"
                                        autoComplete="off"
                                        Icon={UserCircle}
                                    />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />
                        <Controller
                            name="password"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field>
                                    <FieldLabel htmlFor="password">Password</FieldLabel>
                                    <InputWithIcon
                                        {...field}
                                        id="password"
                                        aria-invalid={fieldState.invalid}
                                        placeholder="Enter password"
                                        autoComplete="off"
                                        Icon={Lock}
                                    />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />
                        <Controller
                            name="confirmPassword"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field>
                                    <FieldLabel htmlFor="confirmPassword">
                                        Confirm Password
                                    </FieldLabel>
                                    <InputWithIcon
                                        {...field}
                                        id="confirmPassword"
                                        aria-invalid={fieldState.invalid}
                                        placeholder="Enter confirmPassword"
                                        autoComplete="off"
                                        Icon={Lock}
                                    />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />
                    </FieldGroup>
                    <Button type="submit" form="register-form" className="w-full min-h-11">
                        Create Account
                    </Button>
                </form>
            </CardContent>
            <CardFooter>Already have an account? Sign in</CardFooter>
        </Card>
    )
}
