/* el archivo de configuracion de variables de entorno */

/* esta función lo que hace es mapear los variables de entorno en un objeto javascript */
export const EnvConfigurarion = () => {
    return {
        environment: process.env.NODE_ENV || 'dev',
        mongodb: process.env.MONGODB,
        port: process.env.PORT || 3000,
        defaultLimit: +process.env.DEFAULT_LIMIT || 7
    }
}