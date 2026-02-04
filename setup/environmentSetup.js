/* eslint-env node */
import { writeFileSync, readFileSync } from 'fs';
import dotenv from 'dotenv';
import process from 'process';
dotenv.config();
import Logger from '../helper/logger/logHelper.js';

class EnvironmentSetup {
    constructor() {
        this.logger = new Logger( 'Environment setup' );
        this.logger.info( 'Initializing environment setup' );

        // destination files in data/
        this.destEndpointDataFileName = `${process.cwd() }/data/endpointData.json`;
        this.destUserDataFileName = `${process.cwd() }/data/userData.json`;
    }

    async setupEnvironment() {
        const env = ( process.env.ENVIRONMENT || '' ).toLowerCase();

        if ( !env ) {
            this.logger.error( 'Environment variable: ENVIRONMENT is not set' );
            throw new Error( 'ENVIRONMENT variable is required!' );
        }

        // This project only has 'test' environment JSON files available.
        if ( env !== 'test' ) {
            this.logger.warn( `Environment variable: ${ env } is not supported by this setup script` );
            throw new Error( 'Environment not supported! Only "test" is available.' );
        }

        this.logger.info( `Setting up environment for: ${env}` );

        // source files under data/environments/test/
        const srcEndpointDataFileName = `${process.cwd() }/data/environments/${env}/endpointData.${env}.json`;
        const srcUserDataFileName = `${process.cwd() }/data/environments/${env}/userData.${env}.json`;

        try {
            this.logger.info( `Creating endpoint data file from: ${ srcEndpointDataFileName}` );
            writeFileSync( this.destEndpointDataFileName, readFileSync( srcEndpointDataFileName ));

            this.logger.info( `Creating user data file from: ${ srcUserDataFileName}` );
            writeFileSync( this.destUserDataFileName, readFileSync( srcUserDataFileName ));
        } catch ( err ) {
            this.logger.error( 'Failed to create environment data files', { error: err });
            throw new Error( 'Environment setup failed!' );
        }

        this.logger.info( `Environment setup completed for: ${ env}` );
    }
}

export default EnvironmentSetup;