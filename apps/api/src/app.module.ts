import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { resolve } from 'path'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { DbModule } from './db/db.module'
import { UserModule } from './modules/user/user.module'
import { RedisModule } from './redis/redis.module'

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: resolve(__dirname, '../../../..', `.env-${process.env.NODE_ENV ?? 'dev'}`),
        }),
        DbModule,
        RedisModule,
        UserModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
