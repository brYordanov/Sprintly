import { ArgumentMetadata, BadRequestException, PipeTransform } from '@nestjs/common'
import z, { ZodError, ZodSchema } from 'zod'

export class ZodValidationPipe implements PipeTransform {
    constructor(private zodSchema: ZodSchema) {}

    transform(value: any, metadata: ArgumentMetadata) {
        const result = this.zodSchema.safeParse(value)
        if (!result.success) {
            throw new BadRequestException({
                message: 'Validation failed',
                errors: formatZodError(result.error),
            })
        }

        return result.data
    }
}

function formatZodError(err: ZodError) {
    return z.treeifyError(err)

    //  debugging (array of issues)
    // return err.issues.map(i => ({
    //     path: i.path.join('.'),
    //     code: i.code,
    //     message: i.message,
    // }))
}
