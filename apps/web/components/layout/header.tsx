import Link from 'next/link'
import { Button } from '../ui/button'
import { ProjectSymbol } from '../ui/icon'

export function Header() {
    return (
        <header className="bg-card border-accent pt-4 pb-4 pl-4 pr-4 flex items-center justify-between shadow-soft">
            <div className="flex items-center gap-3">
                <ProjectSymbol width={60} height={60} />
                <h1>Sprintly</h1>
            </div>
            <div>
                <Button variant="ghost" className="mr-2">
                    <Link href="/login">Log in</Link>
                </Button>
                <Button variant="default">
                    <Link href="/register">Sign up</Link>
                </Button>
            </div>
        </header>
    )
}
