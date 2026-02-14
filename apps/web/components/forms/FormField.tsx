import React from 'react'
import { Control, Controller, FieldValues, Path } from 'react-hook-form'
import { Field, FieldError, FieldLabel } from '../ui/field'
import { InputWithIcon, PassInput } from '../ui/input'
import { Textarea } from '../ui/textarea'

type FormFieldProps<TFormData extends FieldValues> = {
    name: Path<TFormData>
    control: Control<TFormData>
    label?: string
    placeholder?: string
    Icon?: React.ElementType
    type?: 'password' | 'description' | 'text'
    className?: string
}

const INPUT_TYPE_MAP = {
    password: PassInput,
    description: Textarea,
    text: InputWithIcon,
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
    const InputComponent = INPUT_TYPE_MAP[type]

    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState }) => (
                <Field className={`relative pb-5 ${className}`}>
                    <FieldLabel htmlFor={name}>{label}</FieldLabel>
                    {/* preventing invalid DOM prop err */}
                    {Icon ? (
                        <InputComponent
                            {...field}
                            id={name}
                            aria-invalid={fieldState.invalid}
                            placeholder={placeholder}
                            autoComplete="off"
                            Icon={Icon}
                        />
                    ) : (
                        <InputComponent
                            {...field}
                            id={name}
                            aria-invalid={fieldState.invalid}
                            placeholder={placeholder}
                            autoComplete="off"
                        />
                    )}
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
