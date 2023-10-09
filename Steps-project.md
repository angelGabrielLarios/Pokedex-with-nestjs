- **SEED** es la semilla para crear el seed

## Pasos para esta leccion
- crer un SEED me permite cargar data de mis base de datos

- crear el comando
~~~
nest g res seed --no-spec
~~~
- en las opciones darle en **REST API**
- Y darle **yes** para que fabrique los endpoints
- en la carpeta de seed creada borrar la carpeta. **dto,entity,**
- el archivo **controller** solo va tener un metodo con el decorador **@Get**
- tambien modoficar **service** para que tenga solo un metodo llamado **executeSeed**

- solo la carpeta seed va tener **service,module y controller**

- verificar que la version de Node 18 o superior para poder realizar peticiones http como la funcion **fetch**
- realizamos un fetch en la funcion executeSeed, la respuesta de la pokeapi la transformar a interfaces con extensiones
ó con un paginas de internet, 

- este el codigo que trae datos del del pokeapi, hace una extraccion de un caracter del atributo url para solo obtener el numero
~~~typescript
import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { PokeResponse } from './interfaces/poke-reponse.interface';


@Injectable()
export class SeedService {

  private readonly axios: AxiosInstance = axios

  async executeSeed() {

    const { data } = await this.axios.get<PokeResponse>(`https://pokeapi.co/api/v2/pokemon?limit=10`)

    data.results.forEach(({ name, url }) => {
      const segments = url.split('/')
      const no: number = +segments[segments.length - 2]

      console.log({ name, no })
    })
    return data.results;
  }
}

~~~
- ahora de la informacion insertada necesitamos insertarla en la base de datos
-codigo para primeramente realizar la inyección de dependencias
~~~typescript
import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { PokeResponse } from './interfaces/poke-reponse.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { Model } from 'mongoose';


@Injectable()
export class SeedService {

  private readonly axios: AxiosInstance = axios

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>
  ) { }

  async executeSeed() {

    const { data } = await this.axios.get<PokeResponse>(`https://pokeapi.co/api/v2/pokemon?limit=650`)

    data.results.forEach(({ name, url }) => {
      const segments = url.split('/')
      const no: number = +segments[segments.length - 2]

      console.log({ name, no })
    })
    return data.results;
  }
}

~~~

- ahora tenemos que exportar y modificar el archivo de **pokemon.module.ts**
- aqui esta el **codigo:**
~~~typescript
import { Module } from '@nestjs/common';
import { PokemonService } from './pokemon.service';
import { PokemonController } from './pokemon.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Pokemon, PokemonSchema } from './entities/pokemon.entity';

@Module({
  controllers: [PokemonController],
  providers: [PokemonService],

  imports: [
    MongooseModule.forFeature([
      {
        name: Pokemon.name, /* el name NO es de atributo de la clase es de otra closa */
        schema: PokemonSchema
      }
    ])
  ],
  exports: [
    MongooseModule
  ]
})

export class PokemonModule { }

~~~

- ahora modificar el archivo **seed.module.ts** para importar
- **código:**

~~~typescript
import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { PokemonModule } from 'src/pokemon/pokemon.module';

@Module({
  controllers: [SeedController],
  providers: [SeedService],
  imports: [
    PokemonModule
  ]
})
export class SeedModule { }

~~~


- ahora insertar datos una vez configurado los archivos
~~~typescript

import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { PokeResponse } from './interfaces/poke-reponse.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { Model } from 'mongoose';


@Injectable()
export class SeedService {

  private readonly axios: AxiosInstance = axios

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>
  ) { }

  async executeSeed() {

    const { data } = await this.axios.get<PokeResponse>(`https://pokeapi.co/api/v2/pokemon?limit=10`)

    

    data.results.forEach(async ({ name, url }) => {
      const segments = url.split('/')
      const no: number = +segments[segments.length - 2]
      const pokemon = await this.pokemonModel.create({ name, no })

      
    })

    return `Seed Executed`;
  }
}

~~~


- código que presenta una manera más eficiente de realizar inserciones a la base de datos
~~~typescript
import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { PokeResponse } from './interfaces/poke-reponse.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { Model } from 'mongoose';


@Injectable()
export class SeedService {

  private readonly axios: AxiosInstance = axios

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>
  ) { }

  async executeSeed() {

    await this.pokemonModel.deleteMany({}) /* eliminar todos los registros posteriores */

    const { data } = await this.axios.get<PokeResponse>(`https://pokeapi.co/api/v2/pokemon?limit=10`)

    const insertPromisesArray = []
    data.results.forEach(({ name, url }) => {
      const segments = url.split('/')
      const no: number = +segments[segments.length - 2]
      /* const pokemon = await this.pokemonModel.create({ name, no }) */


      insertPromisesArray.push(
        this.pokemonModel.create({ name, no })
      )

    })

    await Promise.all(insertPromisesArray)



    return `Seed Executed`;
  }
}

~~~

- segunda forma alternativa de realizar insercciones a la base de datos
~~~typescript
import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { PokeResponse } from './interfaces/poke-reponse.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { Model } from 'mongoose';


@Injectable()
export class SeedService {

  private readonly axios: AxiosInstance = axios

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>
  ) { }

  async executeSeed() {

    await this.pokemonModel.deleteMany({}) /* eliminar todos los registros posteriores */

    const { data } = await this.axios.get<PokeResponse>(`https://pokeapi.co/api/v2/pokemon?limit=650`)

    const pokemonToInsert: { name: string, no: number }[] = []

    data.results.forEach(({ name, url }) => {
      const segments = url.split('/')
      const no: number = +segments[segments.length - 2]


      pokemonToInsert.push(
        { no, name }
      )

    })

    await this.pokemonModel.insertMany(pokemonToInsert)



    return `Seed Executed`;
  }
}

~~~

- crear un provider personalizado
- en la carpeta **common** se debe de crear otras 3 carpetas de nombre
  - **adapters**
  - **dto**
  - **interfaces**

- crear una interface en la carpeta **interface** que se esta implementado en patron de diseño de **adapter**
~~~typescript
/* definir una interface para que lo implemente una clase */

export interface HttAdapter {


    get<T>(url: string): Promise<T>
}
~~~


- en la carpeta de **adapters** crear la clase que aplique la interface anterior
~~~typescript
import axios, { AxiosInstance } from "axios";
import { HttAdapter } from "../interfaces/http-adapter.interface";
import { Injectable } from "@nestjs/common";


@Injectable()
export class AxiosAdapter implements HttAdapter {

    private readonly axios: AxiosInstance = axios
    async get<T>(url: string): Promise<T> {
        try {
            const { data } = await this.axios.get<T>(url)
            return data
        } catch (error) {
            throw new Error(`This is an error - check logs`)
        }
    }
}

~~~
- para utilizarlo necesita modificar el archivo **common.module.ts** para que otros archivos lo puedan utilizar
~~~typescript
import { Module } from '@nestjs/common';
import { AxiosAdapter } from './adapters/axios.adapter';


@Module({
    providers: [AxiosAdapter],
    exports: [AxiosAdapter]
})
export class CommonModule { }

~~~

- también debo modifcar este archivo para que pueda utilizar la clase **AxiosAdapter**
~~~typescript
import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { PokemonModule } from 'src/pokemon/pokemon.module';
import { CommonModule } from 'src/common/common.module';

@Module({
  controllers: [SeedController],
  providers: [SeedService],
  imports: [
    PokemonModule,
    CommonModule
  ]
})
export class SeedModule { }

~~~


- ahora aplicar la clase anterior en el archivo **seed.service.ts**

~~~typescript
import { Injectable } from '@nestjs/common';

import { PokeResponse } from './interfaces/poke-reponse.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { Model } from 'mongoose';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';


@Injectable()
export class SeedService {



  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly http: AxiosAdapter
  ) { }

  async executeSeed() {

    await this.pokemonModel.deleteMany({}) /* eliminar todos los registros posteriores */

    const data = await this.http.get<PokeResponse>(`https://pokeapi.co/api/v2/pokemon?limit=650`)

    const pokemonToInsert: { name: string, no: number }[] = []

    data.results.forEach(({ name, url }) => {
      const segments = url.split('/')
      const no: number = +segments[segments.length - 2]


      pokemonToInsert.push(
        { no, name }
      )

    })

    await this.pokemonModel.insertMany(pokemonToInsert)



    return `Seed Executed`;
  }
}

~~~


- ahora para realizar la paginacion se crea una carpeta **dto** en la carepta **common**, y agregar una clase
~~~typescript
import { IsNumber, IsOptional, IsPositive, Min } from "class-validator"

export class PaginationDto {

    @IsOptional()
    @IsPositive()
    @Min(1)
    @IsNumber()
    limit?: number


    @IsOptional()
    @IsPositive()
    @IsNumber()
    offset?: number
}
~~~
- para que funcione clase dto de **pagination** se debe configurar el archivo **main.ts**
para que acepte las conversiones

~~~typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
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
  await app.listen(3000);
}
bootstrap();

~~~


- modificar el metodo findAll de archivo **pokemon.servide.rts**
~~~typescript
async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto
    return this.pokemonModel.find()
      .limit(limit)
      .skip(offset)
      .sort({
        no: 1
      })
      .select('-__v')
  }
~~~

- de igual manera modificar el archivi **pokemon.controller.ts**
- aqui solo se utiliza el decorador @Query, y la clase dto Creada para la paginación
~~~typescript

@Get()
  findAll(@Query() queryParameters: PaginationDto) {
    console.log({ queryParameters })
    return this.pokemonService.findAll(queryParameters);
  }
~~~