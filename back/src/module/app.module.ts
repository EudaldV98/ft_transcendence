import { Module } from '@nestjs/common';
import { AppController } from 'src/controller/app.controller';
import { AppService } from 'src/service/app.service';
import { UserModule } from './users.module'
import { AuthModule } from './auth.module'
import { AllMiddleware } from './middleware.module';
import { DbConnectModule } from './db.connect.module';
import { AppGateway } from 'src/webSocket/app.gateway';

@Module({
  imports: [ DbConnectModule, UserModule, AuthModule, AllMiddleware ],
  controllers: [ AppController ],
  providers: [ AppService, AppGateway],
})
export class AppModule {}
