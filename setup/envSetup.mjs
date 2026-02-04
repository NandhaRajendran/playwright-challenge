/*
 * The purpose of this file is to create the data files based on the environment variable: ENVIRONMENT.
 * Set the corresponding value in your .env file
 * eg: ENVIRONMENT=test
 */

import dotEnv from 'dotenv';
import EnvironmentSetup from '../setup/environmentSetup.js';
dotEnv.config(); // loads the dotEnv Config 

await setupEnvironment();

async function setupEnvironment()
{
    const envSetup = new EnvironmentSetup();
    await envSetup.setupEnvironment();
}