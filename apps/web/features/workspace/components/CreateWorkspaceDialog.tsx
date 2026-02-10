'use client'

import { FormField } from '@/components/forms/FormField'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useGetUserCompanies } from '@/features/company/api/useGetUserCompanies'
import { zodResolver } from '@hookform/resolvers/zod'
import { CreateWorkspaceDto, CreateWorkspaceSchema } from '@shared/validations'
import { Hash, Layers } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { useCreateWorkspace } from '../api/useCreateWorkspace'

interface CreateWorkspaceDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function CreateWorkspaceDialog({ open, onOpenChange }: CreateWorkspaceDialogProps) {
    const { mutate: createWorkspace, isPending } = useCreateWorkspace()
    const { data: userCompanies } = useGetUserCompanies()
    const { control, handleSubmit, reset } = useForm<CreateWorkspaceDto>({
        resolver: zodResolver(CreateWorkspaceSchema),
        mode: 'onTouched',
        defaultValues: {
            companyId: '',
            name: '',
            slug: '',
            description: '',
        },
    })

    const onSubmit = (data: CreateWorkspaceDto) => {
        createWorkspace(data, {
            onSuccess: () => {
                reset()
                onOpenChange(false)
            },
        })
    }

    const handleCancel = () => {
        reset()
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="sm:max-w-125"
                showCloseButton={true}
                onNativeClose={handleCancel}
            >
                <DialogHeader>
                    <DialogTitle>Create Workspace</DialogTitle>
                    <DialogDescription>
                        Add a new workspace to your company. Fill in the details below.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <FieldGroup>
                        <Controller
                            name="companyId"
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field className="relative pb-5">
                                    <FieldLabel htmlFor="companyId">Company*</FieldLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger
                                            id="companyId"
                                            aria-invalid={fieldState.invalid}
                                        >
                                            <SelectValue placeholder="Select a company" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {userCompanies?.map(c => (
                                                <SelectItem key={c.id} value={c.id}>
                                                    {c.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {fieldState.invalid && (
                                        <FieldError
                                            className="max-h-6 absolute bottom-0 left-0"
                                            errors={[fieldState.error]}
                                        />
                                    )}
                                </Field>
                            )}
                        />
                        <FormField
                            name="name"
                            control={control}
                            label="Name*"
                            placeholder="Enter workspace name"
                            Icon={Layers}
                        />
                        <FormField
                            name="slug"
                            control={control}
                            label="Slug*"
                            placeholder="workspace-slug"
                            Icon={Hash}
                        />
                        <Controller
                            name="description"
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field className="relative pb-5">
                                    <FieldLabel htmlFor="description">Description</FieldLabel>
                                    <Textarea
                                        {...field}
                                        id="description"
                                        aria-invalid={fieldState.invalid}
                                        placeholder="Enter workspace description"
                                        autoComplete="off"
                                    />
                                    {fieldState.invalid && (
                                        <FieldError
                                            className="max-h-6 absolute bottom-0 left-0"
                                            errors={[fieldState.error]}
                                        />
                                    )}
                                </Field>
                            )}
                        />
                    </FieldGroup>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancel}
                            disabled={isPending}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? 'Creating...' : 'Create Workspace'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
