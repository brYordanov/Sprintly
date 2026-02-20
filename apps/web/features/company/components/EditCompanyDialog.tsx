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
import { EditCompanyDto, EditCompanySchema } from '@shared/validations'
import { Building2, Hash, Image } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useEditCompany } from '../api/useEditCompany'

interface EditCompanyDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    companyId: string
    defaultValues: {
        name: string
        slug: string
        description?: string | null
        logoUrl?: string | null
    }
}

export function EditCompanyDialog({
    open,
    onOpenChange,
    companyId,
    defaultValues,
}: EditCompanyDialogProps) {
    console.log(123)

    const { mutate: editCompany, isPending } = useEditCompany(companyId)
    const { control, handleSubmit, reset } = useForm<EditCompanyDto>({
        resolver: zodResolver(EditCompanySchema),
        mode: 'onTouched',
        defaultValues: {
            name: defaultValues.name,
            slug: defaultValues.slug,
            description: defaultValues.description ?? '',
            logoUrl: defaultValues.logoUrl ?? '',
        },
    })

    const onSubmit = (data: EditCompanyDto) => {
        editCompany(data, {
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
                    <DialogTitle>Edit Company</DialogTitle>
                    <DialogDescription>Update your company details below.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <FieldGroup>
                        <FormField
                            name="name"
                            control={control}
                            label="Name"
                            placeholder="Enter company name"
                            Icon={Building2}
                        />
                        <FormField
                            name="slug"
                            control={control}
                            label="Slug"
                            placeholder="company-slug"
                            Icon={Hash}
                        />
                        <FormField
                            name="description"
                            control={control}
                            label="Description"
                            placeholder="Enter company description"
                            type="description"
                        />
                        <FormField
                            name="logoUrl"
                            control={control}
                            label="Logo URL"
                            placeholder="https://example.com/logo.png"
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
