import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup } from '@/components/ui/field'
import { ProjectLogo } from '@/components/ui/icon'

export function RegisterForm() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    <ProjectLogo />
                    Create your account
                </CardTitle>
                <CardDescription>Start managing your projects like a pro</CardDescription>
            </CardHeader>
            <CardContent>
                <form action="">
                    <FieldGroup>{/* <Controller></Controller> */}</FieldGroup>
                </form>
            </CardContent>
        </Card>
    )
}
