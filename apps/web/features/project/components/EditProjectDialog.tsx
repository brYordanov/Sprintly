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
import { FieldGroup } from '@/components/ui/field'
import { zodResolver } from '@hookform/resolvers/zod'
import { EditProjectDto, EditProjectSchema } from '@shared/validations'
import { FolderKanban, Hash, Image } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useEditProject } from '../api/useEditProject'

interface EditProjectDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    projectId: string
    slug: string
    defaultValues: {
        name: string
        slug: string
        description?: string | null
        iconUrl?: string | null
    }
}

export function EditProjectDialog({
    open,
    onOpenChange,
    projectId,
    slug,
    defaultValues,
}: EditProjectDialogProps) {
    const { mutate: editProject, isPending } = useEditProject(projectId, slug)
    const { control, handleSubmit, reset } = useForm<EditProjectDto>({
        resolver: zodResolver(EditProjectSchema),
        mode: 'onTouched',
        defaultValues: {
            name: defaultValues.name,
            slug: defaultValues.slug,
            description: defaultValues.description ?? '',
            iconUrl: defaultValues.iconUrl ?? '',
        },
    })

    const onSubmit = (data: EditProjectDto) => {
        editProject(data, {
            onSuccess: () => {
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
                    <DialogTitle>Project Settings</DialogTitle>
                    <DialogDescription>Update your project details below.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <FieldGroup>
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
                            {isPending ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
