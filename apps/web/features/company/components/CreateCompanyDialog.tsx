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
import { CreateCompanyDto, CreateCompanySchema } from '@shared/validations'
import { Building2, Hash, Image } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useCreateCompany } from '../api/useCreateCompany'

interface CreateCompanyDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function CreateCompanyDialog({ open, onOpenChange }: CreateCompanyDialogProps) {
    const { mutate: createCompany, isPending } = useCreateCompany()
    const { control, handleSubmit, reset } = useForm<CreateCompanyDto>({
        resolver: zodResolver(CreateCompanySchema),
        mode: 'onTouched',
        defaultValues: {
            name: '',
            slug: '',
            description: '',
            logoUrl: '',
        },
    })

    const onSubmit = (data: CreateCompanyDto) => {
        createCompany(data, {
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
                    <DialogTitle>Create Company</DialogTitle>
                    <DialogDescription>
                        Add a new company to your organization. Fill in the details below.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <FieldGroup>
                        <FormField
                            name="name"
                            control={control}
                            label="Name*"
                            placeholder="Enter company name"
                            Icon={Building2}
                        />
                        <FormField
                            name="slug"
                            control={control}
                            label="Slug*"
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
                            {isPending ? 'Creating...' : 'Create Company'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
