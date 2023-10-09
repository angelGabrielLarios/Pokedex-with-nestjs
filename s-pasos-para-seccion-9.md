- comando para leventar la base de datos
~~~
docker-compose up -d
~~~

- las variables de entorno corren en cualquier servidor
y ocutal informacion sensible como los endpoints, y en donde esta
ubicada la base de datos, y el puerto

- define un archivo asi **.env** la ubicación es en la raiz del proyecto
y aqui se definiran las variables de entorno


- las variables por defecto del proyecto se muestran aqui
~~~typescript
process.env 
~~~

- por el momento estas son la variables de entorno que voy a utilizar
que son la dirección de la base de datos y ademas el puerto del servidor
donde se ejecuta mi aplicación

~~~env
MONGODB=mongodb://localhost:27017/nest-pokemon
PORT=3000
~~~

- ahora se tiene que instalar un paquete para la configuracíón de las 
**variable de entorno**

- voy aplicar este proyecto porque mi proyecto esta en `yarn`
~~~
yarn add @nestjs/config
~~~

- modificar el archivo **app.module.ts**, la linea que se agrego fue en **imports**
se agrego *ConfigureModuel.forRoot()*, cabe aclarar que se define al principio del arrelog
~~~typescript
import { MongooseModule } from '@nestjs/mongoose';
import { CommonModule } from './common/common.module';
import { SeedModule } from './seed/seed.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),

    MongooseModule.forRoot(`mongodb://localhost:27017/nest-pokemon`),
    PokemonModule,
    CommonModule,
    SeedModule
  ],
})
export class AppModule {
  constructor() {
    console.log(process.env)
  }
}

~~~

### OJo
- la variables de entorno su valor por defecto son **STRING**

- ahora en la carpeta **src** crear una carpeta **config** con un archivo de nombre *app.config.ts*
que tiene el siguient código que es una función que hace un mapeo de las variables de entorno y lo devuelve
en un objeto javascript

~~~typescript
/* el archivo de configuracion de variables de entorno */

/* esta función lo que hace es mapear los variables de entorno en un objeto javascript */
export const EnvConfigurarion = () => {
    return {
        environment: process.env.NODE_ENV || 'dev',
        mongodb: process.env.MONGODB,
        port: process.env.PORT || 3000,
        default_limit: process.env.DEFAULT_LIMIT || 7
    }
}

~~~

- ahora se modificar el archivo *app.moduke.ts* se tiene que agregar la funcion
**EnvConfigrarion**
~~~typescript
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [EnvConfigurarion] // esta parte se modifica
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),

    MongooseModule.forRoot(process.env.MONGODB),
    PokemonModule,
    CommonModule,
    SeedModule
  ],
})
export class AppModule {
}
~~~


- agregar un nuevo atributo privaddo en el archvo *pokemin.service.ts*
~~~typescript
constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly configService: ConfigService
  ) {
    console.log(process.env.DEFAULT_LIMIT)
  }
~~~

- se crea un atributo privado fuera del contructor en el archivo **pokemon.service.ts**

~~~typescript
private defaultLimit: number
~~~

- el metodo contructor se le asigna un valor al atributo *defaultLimit*, que es 
lo que devuelve el metodo **configServide.get('defaultLimit')**
~~~typescript
constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly configService: ConfigService
  ) {

    this.defaultLimit = configService.get<number>(`defaultLimit`)

  }

~~~

- modificamos este metodo de la clase **PokemonService** del archivo **pokemon.service.ts**
~~~typescript
async findAll(paginationDto: PaginationDto) {
    const { limit = this.defaultLimit, offset = 0 } = paginationDto
    return this.pokemonModel.find()
      .limit(limit)
      .skip(offset)
      .sort({
        no: 1
      })
      .select('-__v')
  }
~~~

- instalar *joi*, para las validaciones de mi proyecto
~~~
yarn add joi
~~~

- en la carpeta **config** crear el archivo *joi.validation.ts*
- el codigo del archivo anterior es este:
~~~typescript
import * as Joi from 'joi'
/* crear un schema validation */
export const JoinValidationSchema = Joi.object({
    MONGODB: Joi.required(),
    PORT: Joi.number().default(3000),
    DEFAULT_LIMIT: Joi.number().default(6)
})
~~~

- despues modificar el archivo **app.module.ts** para agregar la que estamos exportando el archivo *joi.validation.ts*

~~~typescript
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [EnvConfigurarion],
      validationSchema: JoinValidationSchema
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),

    MongooseModule.forRoot(process.env.MONGODB),
    PokemonModule,
    CommonModule,
    SeedModule
  ],
})
~~~

- modificar el archivo de **app.config.ts* para que una variable de entorno que convierta a numero colando
*+* a la izquierda

~~~typescript
import * as Joi from 'joi'
/* crear un schema validation */
export const JoinValidationSchema = Joi.object({
    MONGODB: Joi.required(),
    PORT: Joi.number().default(3000),
    DEFAULT_LIMIT: Joi.number().default(6)
})
~~~

- cuando se crean y configuran variables de entorno se deben documentar

- para ello se copia el archivo **.env** y se pega en la raiz del proyecto, y se renombra
a **.env.template**

- ir a la pagina railway, crear una base de datos de mongo, modificar el el archivo de .env
para agregar el link de la base de datos en la nube
~~~env
MONGODB=mongodb://mongo:wOcI3x7trV2f0ZJMy66O@containers-us-west-101.railway.app:5959
PORT=3000
DEFAULT_LIMIT=5  
~~~

-Despues solo definir un *nombre_Base_Datos* en la configuracion de archivo **app.module.ts**
en la parte de **MongooseModule**
~~~typescript

~~~

~~~typescript
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
~~~

- ya finalmente solo ejecutamos la seed para que nuestro datos ya se almacenen en la nube


- ahora subir nuestra aplicacion con railway

- en el archivo **package-json** debemos modificar la parte de escript **"scripts"**
vamos intercalar los valores de **"start"** y **"start:prod"**