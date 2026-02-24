/**
 * Logger helper using pino library.
 */
import pino from 'pino';
import loggerConfig from '../../configuration/logger.json' with { type: 'json' };

class Logger {
    /**
     * Create a pino-based logger.
     * @param {string} logContext optional context prefix
     */
    constructor( logContext = 'Test Log' ) {
        const options = {
            level: loggerConfig && loggerConfig.logger && loggerConfig.logger.minLevel || 'debug',
            transport: {
                target: 'pino-pretty',
                options: {
                    colorize: loggerConfig.logger.prettyPrint && loggerConfig.logger.prettyPrint.colorize || false,
                    translateTime: loggerConfig.logger.prettyPrint && loggerConfig.logger.prettyPrint.translateTime || false,
                    ignore: loggerConfig.logger.prettyPrint && loggerConfig.logger.prettyPrint.ignore,
                    messageFormat: '{msg}',
                    singleLine: loggerConfig.logger.prettyPrint && loggerConfig.logger.prettyPrint.singleLine || false,
                }
            }
        };

        this.prefix = `[${logContext}] `;
        this.logger = pino( options );
    }

    trace( message, meta ) {
        if ( this.logger.trace )
        {this.logger.trace( meta || {}, this.prefix + message );}
        else
        {this.logger.debug( meta || {}, this.prefix + message );}
    }

    debug( message, meta ) {
        this.logger.debug( meta || {}, this.prefix + message );
    }

    info( message, meta ) {
        this.logger.info( meta || {}, this.prefix + message );
    }

    warn( message, meta ) {
        this.logger.warn( meta || {}, this.prefix + message );
    }

    error( message, meta ) {
        this.logger.error( meta || {}, this.prefix + message );
    }

    fatal( message, meta ) {
        if ( this.logger.fatal )
        {this.logger.fatal( meta || {}, this.prefix + message );}
        else
        {this.logger.error( meta || {}, this.prefix + message );}
    }

    log( level, message, meta ) {
        if ( typeof this.logger[level] === 'function' ) {
            this.logger[level]( meta || {}, this.prefix + message );
        } else {
            this.logger.info( meta || {}, this.prefix + message );
        }
    }
}

export default Logger;