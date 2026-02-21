import * as React from 'react'

import { cn } from '@/lib/utils'
import { Eye, EyeOff } from 'lucide-react'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
    return (
        <input
            type={type}
            data-slot="input"
            className={cn(
                'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
                'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
                'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
                className,
            )}
            {...props}
        />
    )
}

function InputWithIcon({
    className,
    type,
    Icon,
    ...props
}: React.ComponentProps<'input'> & { Icon?: React.ElementType }) {
    return (
        <div className="relative h-fit">
            {Icon && <Icon className="absolute left-2 top-1/2 -translate-y-1/2" />}
            <Input className={`pl-9 ${className}`} type={type} {...props}></Input>
        </div>
    )
}

function PassInput({
    className,
    Icon,
    ...props
}: React.ComponentProps<'input'> & { Icon?: React.ElementType }) {
    const [showPass, setShowPass] = React.useState(false)
    return (
        <div className="relative">
            {Icon && <Icon className="absolute left-2 top-[50%] -translate-y-1/2" />}
            <Input
                className={`pl-9 ${className}`}
                type={showPass ? 'text' : 'password'}
                placeholder={showPass ? 'password' : '••••••••'}
                {...props}
            ></Input>
            <button
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                type="button"
                onClick={() => {
                    setShowPass(state => !state)
                }}
            >
                {showPass ? <EyeOff /> : <Eye />}
            </button>
        </div>
    )
}

export { Input, InputWithIcon, PassInput }
