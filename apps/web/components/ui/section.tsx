import { cn } from '@/lib/utils'

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
    container?: boolean
    centered?: boolean
}

export function Section({
    children,
    className,
    container = true,
    centered = true,
    ...props
}: SectionProps) {
    return (
        <section
            className={cn(
                'pt-12 md:pt-24',
                container && 'mx-auto max-w-7xl px-4',
                centered && 'flex flex-col items-center justify-center text-center',
                className,
            )}
            {...props}
        >
            {children}
        </section>
    )
}
