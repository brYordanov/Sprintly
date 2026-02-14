'use client'

import { FormField } from '@/components/forms/FormField'
import { FormSelect } from '@/components/forms/FormSelect'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { FieldGroup } from '@/components/ui/field'
import { useGetManageableUserCompanies } from '@/features/company/api/useGetManageableUserCompanies'
import { useGetManageableUserWorkspaces } from '@/features/workspace/api/useGetManageableUserWorkspaces'
import { zodResolver } from '@hookform/resolvers/zod'
import { CreateProjectDto, CreateProjectSchema } from '@shared/validations'
import { FolderKanban, Hash, Image } from 'lucide-react'
import { useForm } from 'react-hook-form'
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
                        <FormSelect
                            name="companyId"
                            control={control}
                            placeholder="Select a company"
                            label="Company*"
                            options={
                                userCompanies?.map(c => ({ value: c.id, label: c.name })) || []
                            }
                        />
                        <FormSelect
                            name="workspaceId"
                            control={control}
                            placeholder="Select a workspace (optional)"
                            label="Workspace"
                            options={
                                userWorkspaces?.map(c => ({ value: c.id, label: c.name })) || []
                            }
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
                        <FormField
                            name="description"
                            control={control}
                            label="Description"
                            placeholder="Enter project description"
                            type="description"
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
