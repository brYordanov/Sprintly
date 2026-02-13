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
import { useGetManageableUserCompanies } from '@/features/company/api/useGetManageableUserCompanies'
import { useGetManageableUserWorkspaces } from '@/features/workspace/api/useGetManageableUserWorkspaces'
import { zodResolver } from '@hookform/resolvers/zod'
import { CreateProjectDto, CreateProjectSchema } from '@shared/validations'
import { FolderKanban, Hash, Image } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { useCreateProject } from '../api/useCreateProject'

interface CreateProjectDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function CreateProjectDialog({ open, onOpenChange }: CreateProjectDialogProps) {
    const { mutate: createProject, isPending } = useCreateProject()
    const { data: userCompanies } = useGetManageableUserCompanies()
    const { data: userWorkspaces } = useGetManageableUserWorkspaces()
    const { control, handleSubmit, reset } = useForm<CreateProjectDto>({
        resolver: zodResolver(CreateProjectSchema),
        mode: 'onTouched',
        defaultValues: {
            companyId: '',
            workspaceId: undefined,
            name: '',
            slug: '',
            description: '',
            iconUrl: '',
        },
    })

    const onSubmit = (data: CreateProjectDto) => {
        createProject(data, {
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
                    <DialogTitle>Create Project</DialogTitle>
                    <DialogDescription>
                        Add a new project to your company. Fill in the details below.
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
                        <Controller
                            name="workspaceId"
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field className="relative pb-5">
                                    <FieldLabel htmlFor="workspaceId">Workspace</FieldLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value ?? ''}
                                    >
                                        <SelectTrigger
                                            id="workspaceId"
                                            aria-invalid={fieldState.invalid}
                                        >
                                            <SelectValue placeholder="Select a workspace (optional)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {userWorkspaces?.map(w => (
                                                <SelectItem key={w.id} value={w.id}>
                                                    {w.name}
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
                            placeholder="Enter project name"
                            Icon={FolderKanban}
                        />
                        <FormField
                            name="slug"
                            control={control}
                            label="Slug*"
                            placeholder="project-slug"
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
                                        placeholder="Enter project description"
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
                        <FormField
                            name="iconUrl"
                            control={control}
                            label="Icon URL"
                            placeholder="https://example.com/icon.png"
                            Icon={Image}
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
                            {isPending ? 'Creating...' : 'Create Project'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
