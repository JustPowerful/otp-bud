import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { TokenModule } from './token/token.module';
import { ApplicationModule } from './application/application.module';
import { TemplateModule } from './template/template.module';
import { OtpModule } from './otp/otp.module';
import { EmailModule } from './email/email.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RedisModule,
    AuthModule,
    TokenModule,
    ApplicationModule,
    TemplateModule,
    OtpModule,
    EmailModule,
    RedisModule,
  ],
})
export class AppModule {}
