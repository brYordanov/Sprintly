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
import { zodResolver } from '@hookform/resolvers/zod'
import { CreateWorkspaceDto, CreateWorkspaceSchema } from '@shared/validations'
import { Hash, Layers } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useCreateWorkspace } from '../api/useCreateWorkspace'

interface CreateWorkspaceDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function CreateWorkspaceDialog({ open, onOpenChange }: CreateWorkspaceDialogProps) {
    const { mutate: createWorkspace, isPending } = useCreateWorkspace()
    const { data: userCompanies } = useGetManageableUserCompanies()
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
                        <FormSelect
                            name="companyId"
                            control={control}
                            placeholder="Select a company"
                            label="Company*"
                            options={
                                userCompanies?.map(c => ({ value: c.id, label: c.name })) || []
                            }
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
                            {isPending ? 'Creating...' : 'Create Workspace'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
