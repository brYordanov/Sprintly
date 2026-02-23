import { Control, Controller, FieldValues, Path } from 'react-hook-form'
import { Field, FieldError, FieldLabel } from '../ui/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

type SelectOption = {
    value: string
    label: string
}
type FormSelectProps<TFormData extends FieldValues> = {
    name: Path<TFormData>
    control: Control<TFormData>
    label?: string
    placeholder?: string
    options: SelectOption[]
    Icon?: React.ElementType
    className?: string
    disabled?: boolean
    displayValue?: string
}

export function FormSelect<TFormData extends FieldValues>({
    name,
    control,
    label,
    placeholder = 'Select an option',
    options,
    Icon,
    className,
    disabled = false,
    displayValue,
}: FormSelectProps<TFormData>) {
    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState }) => (
                <Field className="relative pb-5">
                    {label && <FieldLabel htmlFor={name}>{label}</FieldLabel>}
                    <Select onValueChange={field.onChange} value={field.value} disabled={disabled}>
                        <SelectTrigger
                            id={name}
                            aria-invalid={fieldState.invalid}
                            className={className}
                        >
                            {Icon && <Icon className="mr-2 h-4 w-4" />}
                            <SelectValue placeholder={placeholder}>
                                {displayValue}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {options.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
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
    )
}
