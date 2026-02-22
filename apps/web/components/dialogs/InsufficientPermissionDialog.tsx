import { ShieldAlert } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog'

export function InsufficientPermissionDialog({ open }: { open: boolean }) {
    const router = useRouter()

    return (
        <Dialog open={open} onOpenChange={() => {}}>
            <DialogContent className="sm:max-w-md [&>button]:hidden">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 shrink-0">
                            <ShieldAlert className="h-5 w-5 text-destructive" />
                        </div>
                        <div>
                            <DialogTitle>Insufficient Permissions</DialogTitle>
                            <DialogDescription className="mt-0.5">
                                You don&apos;t have a high enough permission level to view this
                                page.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>
                <p className="text-sm text-muted-foreground">
                    Please ask a company admin or owner to upgrade your role.
                </p>
                <div className="flex justify-end pt-2">
                    <Button variant="outline" onClick={() => router.back()}>
                        Go back
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
