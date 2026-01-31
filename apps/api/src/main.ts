import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import cookieParser from 'cookie-parser'
import { AppModule } from './app.module'

const isProduction = process.env.NODE_ENV === 'prod'
const allowedOrigins = isProduction ? ['https://your-domain.com'] : ['http://localhost:3001']

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule)

    app.use(cookieParser())

    app.set('trust proxy', 1)

    app.enableCors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true)
            } else {
                callback(new Error('Not allowed by CORS'))
            }
        },
        credentials: true,
    })

    await app.listen(process.env.PORT ?? 3000)
}
bootstrap()
