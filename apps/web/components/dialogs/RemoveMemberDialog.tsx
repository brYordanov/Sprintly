import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface RemoveMemberDialogProps {
    memberName: string | null
    context: string
    isRemoving: boolean
    onConfirm: () => void
}

export function RemoveMemberDialog({
    memberName,
    context,
    isRemoving,
    onConfirm,
}: RemoveMemberDialogProps) {
    return (
        <AlertDialog>
            <AlertDialogTrigger
                disabled={isRemoving}
                className="text-sm text-destructive hover:text-destructive/80 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Remove
            </AlertDialogTrigger>
            <AlertDialogContent size="sm">
                <AlertDialogHeader>
                    <AlertDialogTitle>Remove member</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to remove{' '}
                        <span className="font-medium text-foreground">{memberName}</span> from this{' '}
                        {context}?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction variant="destructive" onClick={onConfirm}>
                        Remove
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
