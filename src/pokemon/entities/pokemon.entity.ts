import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Document } from "mongoose"


@Schema()
export class Pokemon extends Document {
    /* mediante clases se pueden definir reglas de negocio */

    /* nombre, numero, id del pokemon */

    @Prop({

        unique: true,
        index: true, /* indice => sabe donde esta el recurso para buscar */

    })
    name: string


    @Prop({
        unique: true,
        index: true
    })
    no: number


    /* 
    "color": "Sunburst",
    "model": "Stratocaster",
    "price": 1200,
    "pickupTypes": ["Single-coil", "Single-coil", "Single-coil"]
    */



}



/* exportar un esquema que son las definiciones las reglas */


export const PokemonSchema = SchemaFactory.createForClass(Pokemon)


/* entity es la representacion de una tabla en mysql o una coleccion en una base nosql*/