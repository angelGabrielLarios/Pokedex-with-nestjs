import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Model, isValidObjectId } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';

/* inyeccion de dependecia con mongo */
import { InjectModel } from '@nestjs/mongoose';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PokemonService {

  private defaultLimit: number
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly configService: ConfigService
  ) {

    this.defaultLimit = configService.get<number>(`defaultLimit`)

  }

  async create(createPokemonDto: CreatePokemonDto) {

    createPokemonDto.name = createPokemonDto.name.toLowerCase()
    /* aqui solo hicemos es devolver lo que se envia en la data */


    try {
      /* aki creamos la inserscion y devolvemo el post */
      const pokemon = await this.pokemonModel.create(createPokemonDto)
      return pokemon;
    } catch (error) {

      this.handleExeptions(error)
    }


    /* 
    corregir ese error 600
    */
  }

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

  async findOne(term: string) {

    let pokemon: Pokemon

    if (!isNaN(+term)) {
      pokemon = await this.pokemonModel.findOne({ no: term })
    }

    /* buscar por MongoID */
    if (!pokemon && isValidObjectId(term)) {
      pokemon = await this.pokemonModel.findById(term)
    }


    /* buscar por name */

    if (!pokemon) {
      pokemon = await this.pokemonModel.findOne({ name: term.toLocaleLowerCase().trim() })
    }

    /* por si pokemon es null y no esta en la base de datos */
    if (!pokemon) {
      throw new NotFoundException(`Pokemon with name or no "${term}" not found `)
    }
    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {

    const pokemon: Pokemon = await this.findOne(term)

    if (updatePokemonDto.name)
      updatePokemonDto.name = updatePokemonDto.name.toLocaleLowerCase();


    try {
      await pokemon.updateOne(updatePokemonDto, { new: true })
      return {
        ...pokemon.toJSON(),
        ...updatePokemonDto
      }

    } catch (error) {
      this.handleExeptions(error)
    }


  }

  async remove(id: string) {

    const { deletedCount } = await this.pokemonModel.deleteOne({ _id: id })

    if (deletedCount === 0) {
      throw new BadRequestException(`POkemon with id "${id}" not found`)
    }

    return
  }

  private handleExeptions(error: any) {
    if (error.code === 11000) {
      throw new BadRequestException(`Pokemon exists in db ${JSON.stringify(error.keyValue)}`)
    }

    throw new InternalServerErrorException(`Can't update Pokemon - Check server logs`)
  }
}


/* los modulos encapsulan el codigo   */