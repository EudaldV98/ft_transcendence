import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileController } from 'src/controller/profile.controller';
import { ProfileService } from 'src/service/profile.service';
import { User } from 'src/entity/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { CustomJwtModule } from './custom.jwt.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), CustomJwtModule ],
  controllers: [ ProfileController ],
  providers: [ ProfileService ]
})
export class ProfileModule {}