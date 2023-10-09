import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  /* opcion global */

  /* este metodo establece el prefijo */
  app.setGlobalPrefix('api/v2')

  app.useGlobalPipes(
    new ValidationPipe({

      /* estas dos configuraciones es para enviar peticiones post lada data se valide que sea la requerida y ademas que no envie data de menos */
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true
      }
    })
  );

  /* convetir nuestra data de los dto, osea parsear los tipos*/

  await app.listen(process.env.PORT);
  console.log(`App running on port ${process.env.PORT}`)
}
bootstrap();


/* 

sudo apt-get install apt-transport-https ca-certificates curl gnupg2 software-properties-common

*/