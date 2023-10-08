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