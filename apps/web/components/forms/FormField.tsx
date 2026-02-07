import React from 'react'
import { Control, Controller, FieldValues, Path } from 'react-hook-form'
import { Field, FieldError, FieldLabel } from '../ui/field'
import { InputWithIcon, PassInput } from '../ui/input'

type FormFieldProps<TFormData extends FieldValues> = {
    name: Path<TFormData>
    control: Control<TFormData>
    label?: string
    placeholder?: string
    Icon?: React.ElementType
    type?: string
    className?: string
}

export function FormField<TFormData extends FieldValues>({
    name,
    control,
    label,
    placeholder,
    Icon,
    type = 'text',
    className,
}: FormFieldProps<TFormData>) {
    const InputComponent = type === 'password' ? PassInput : InputWithIcon

    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState }) => (
                <Field className={`relative pb-5 ${className}`}>
                    <FieldLabel htmlFor={name}>{label}</FieldLabel>
                    <InputComponent
                        {...field}
                        id={name}
                        aria-invalid={fieldState.invalid}
                        placeholder={placeholder}
                        autoComplete="off"
                        Icon={Icon}
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
    )
}
