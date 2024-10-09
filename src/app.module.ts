import { Module } from '@nestjs/common';
import { WhiteboardGateway } from './whiteboard/whiteboard.gateway';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
  ],
  providers: [WhiteboardGateway],
})
export class AppModule {}
