import { Global, Module } from '@nestjs/common'
import Redis from 'ioredis'

export const REDIS_CLIENT = Symbol('REDIS_CLIENT')
@Global()
@Module({
    providers: [
        {
            provide: REDIS_CLIENT,
            useFactory: async () => {
                const client = new Redis(process.env.REDIS_URL!)

                await new Promise<void>((resolve, reject) => {
                    client.once('ready', resolve)
                    client.once('error', reject)
                })

                return client
            },
        },
    ],
    exports: [REDIS_CLIENT],
})
export class RedisModule {}
