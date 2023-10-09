import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PokemonModule } from './pokemon/pokemon.module';
import { MongooseModule } from '@nestjs/mongoose';
import { CommonModule } from './common/common.module';
import { SeedModule } from './seed/seed.module';
import { ConfigModule } from '@nestjs/config';
import { EnvConfigurarion } from './config/app.config';
import { JoinValidationSchema } from './config/joi.validationn';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [EnvConfigurarion],
      validationSchema: JoinValidationSchema
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),

    MongooseModule.forRoot(
      process.env.MONGODB,
      {
        dbName: 'pokemoDb'
      }
    ),
    PokemonModule,
    CommonModule,
    SeedModule
  ],
})
export class AppModule {
}


/* 

ConfigModule, se encarga todo acerca de las variables de entorno
*/