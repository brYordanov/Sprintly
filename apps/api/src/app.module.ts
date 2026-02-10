import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ThrottlerModule } from '@nestjs/throttler'
import { resolve } from 'path'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { DbModule } from './db/db.module'
import { AuthModule } from './modules/auth/auth.module'
import { CompanyModule } from './modules/company/company.module'
import { UserModule } from './modules/user/user.module'
import { ProjectModule } from './modules/project/project.module'
import { WorkspaceModule } from './modules/workspace/workspace.module'
import { RedisModule } from './redis/redis.module'

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: resolve(__dirname, '../../../..', `.env-${process.env.NODE_ENV ?? 'dev'}`),
        }),
        ThrottlerModule.forRoot([
            {
                name: 'short',
                ttl: 1000,
                limit: 3,
            },
            {
                name: 'auth',
                ttl: 60000,
                limit: 5,
            },
        ]),
        DbModule,
        RedisModule,
        UserModule,
        AuthModule,
        CompanyModule,
        ProjectModule,
        WorkspaceModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
