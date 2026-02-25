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
import { EditWorkspaceDto, EditWorkspaceSchema } from '@shared/validations'
import { Hash, Layers } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useEditWorkspace } from '../api/useEditWorkspace'

interface EditWorkspaceDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    workspaceId: string
    workspaceSlug: string
    currentName: string
    currentSlug: string
    currentDescription?: string | null
}

export function EditWorkspaceDialog({
    open,
    onOpenChange,
    workspaceId,
    workspaceSlug,
    currentName,
    currentSlug,
    currentDescription,
}: EditWorkspaceDialogProps) {
    const { mutate: editWorkspace, isPending } = useEditWorkspace(workspaceId, workspaceSlug)
    const { control, handleSubmit, reset } = useForm<EditWorkspaceDto>({
        resolver: zodResolver(EditWorkspaceSchema),
        mode: 'onTouched',
        values: {
            name: currentName,
            slug: currentSlug,
            description: currentDescription ?? '',
        },
    })

    const onSubmit = (data: EditWorkspaceDto) => {
        editWorkspace(data, {
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
                    <DialogTitle>Workspace Settings</DialogTitle>
                    <DialogDescription>Update your workspace details below.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <FieldGroup>
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
                        <FormField
                            name="description"
                            control={control}
                            label="Description"
                            placeholder="Enter workspace description"
                            type="description"
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
