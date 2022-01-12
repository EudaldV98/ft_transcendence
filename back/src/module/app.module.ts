import { Module } from '@nestjs/common';
import { AppController } from 'src/controller/app.controller';
import { AppService } from 'src/service/app.service';
import { AuthModule } from './auth.module'
import { AllMiddleware } from './middleware.module';
import { DbConnectModule } from './db.connect.module';
import { ProfileModule } from './profile.module';
import { CustomJwtModule } from './custom.jwt.module';
import { UsersModule } from './users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entity/user.entity';
import { Messages } from 'src/entity/messages.entity';
import { Channel } from 'src/entity/channel.entity';
import { FriendsModule } from './friends.module';

//Gateway
import { ChatGateway } from 'src/webSocket/chat.gateway';
import { GameGateway } from 'src/webSocket/game.gateway';
import { ChannelParticipant } from 'src/entity/channelParticipant.entity';
import { ChannelModule } from './channel.module';
import { GameService } from 'src/service/game.service';
import { PrivateMessage } from 'src/entity/privateMessage.entity';
import { PrivateMessagesModule } from './privateMessage.module';
import { Game } from 'src/entity/game.entity';
import { ActiveGateway } from 'src/webSocket/active.gateway';
import { ChatService } from 'src/service/chat.service';

import { Match } from 'src/entity/match.entity';
import { MatchsModule } from './matchs.module';

@Module({
  imports: [ DbConnectModule, UsersModule, ProfileModule, AuthModule, AllMiddleware, CustomJwtModule, ChannelModule,
    TypeOrmModule.forFeature([User, Channel, ChannelParticipant, Messages, PrivateMessage, Match]), FriendsModule, PrivateMessagesModule, MatchsModule ],
  controllers: [ AppController ],
  providers: [ AppService, ChatGateway, GameGateway, ActiveGateway, GameService, ChatService ],
})
export class AppModule {}
