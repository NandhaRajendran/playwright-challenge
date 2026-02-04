import process from "node:process";
/**
 * Helpers for generating random data for tests.
 */
class RandomGeneratorHelper {
    constructor( logger ) {
        this.logger = logger;
    }

    /**
     * Generates a random month number as a two-digit string.
     * @returns {String} A two-digit month number (01-12).
     */
    async getRandomMonthNumber() {
        const month = Math.floor( Math.random() * 12 ) + 1;
        return String( month ).padStart( 2, '0' );
    }

    /**
     * Generates a random day number as a two-digit string.
     * @returns {String} A two-digit day number (01-28).
     */
    async getRandomDayNumber() {
        // Keep safe days up to 28 to avoid month-length issues
        const day = Math.floor( Math.random() * 28 ) + 1;
        return String( day ).padStart( 2, '0' );
    }

    /**
     * Generates a random fixed-length integer.
     * @param {Number} stringLength - The length of the integer.
     * @returns {Number} A random integer of the specified length.
     */
    async getRandomFixedInteger( stringLength = 4 ) {
        const min = Math.pow( 10, stringLength - 1 );
        const max = Math.pow( 10, stringLength ) - 1;
        return Math.floor( Math.random() * ( max - min + 1 )) + min;
    }

    /**
     * Generates a random integer within a specified range.
     * @param {Number} min - The minimum value (inclusive).
     * @param {Number} max - The maximum value (inclusive).
     * @returns {Number} A random integer between min and max.
     */
    async getRandomInteger( min = 0, max = 9999 ) {
        return Math.floor( Math.random() * ( max - min + 1 )) + min;
    }

    /**
     * Generates a random email address.
     * @param {String} country - The country code to include in the email.
     * @returns {String} A random email address.
     */
    async getRandomEmail( options = {}) {
        // If TEST_EMAIL_DOMAIN is set, produce a plus-address on that domain so
        // all aliases deliver to a real mailbox (e.g. yourname+tag@domain.com).
        const domain = process.env.TEST_EMAIL_DOMAIN;
        const localFromEnv = process.env.TEST_EMAIL_LOCAL;
        const randomEmailBool = process.env.RANDOM_EMAIL;
        const alias = options.alias || '1';
        if ( domain && localFromEnv && randomEmailBool === 'false' ) {
            const tag = `${alias}-${Date.now()}`;
            return `${localFromEnv}+${tag}@${domain}`;
        }

        if ( randomEmailBool === 'true' ) {
            return `qaUser_${Date.now()}@test.com`;
        }
    }
    /**
     * Generates a random 10-digit mobile number.
     * @returns {String} A 10-digit mobile number.
     */
    async getRandomMobileNumber() {
        let mobile = '07';
        for ( let i = 0; i < 8; i++ ) {
            mobile += String( Math.floor( Math.random() * 9 ) + 1 );
        }
        return mobile;
    }
}

/**
 * Data generator helper class.
 */
class DataGeneratorHelper {
    constructor( logger ) {
        this.logger = logger;
        this.random = new RandomGeneratorHelper( logger );
    }

    /**
     * Swedish personnummer generator
     * Defaults to 12-digit format: YYYYMMDDNNNC (no separator).
     * @param {Number} age
     * @param {Object} [options]
     * @param {Boolean} [options.useFourDigitYear=true]
     * @param {Boolean} [options.includeSeparator=false]
     * @returns {String} e.g. 199801061234 or 980106-1234
     */
    async generatePersonnummerForAge( age, options = {}) {
        const { useFourDigitYear = true, includeSeparator = false } = options;
        if ( !Number.isInteger( age ) || age < 0 || age > 120 ) {
            throw new Error( 'Generate personnummer requires a valid age between 0 and 120' );
        }

        const now = new Date();
        const year = now.getFullYear() - age;
        const yy = String( year ).slice( -2 );
        const mm = await this.random.getRandomMonthNumber();
        const dd = await this.random.getRandomDayNumber();
        const individual = String( await this.random.getRandomFixedInteger( 3 )).padStart( 3, '0' );
        const base = `${yy}${mm}${dd}${individual}`;
        const checksum = await this.calculateLuhnChecksumDigit( base );
        const shortNumber = `${yy}${mm}${dd}${individual}${checksum}`;

        if ( useFourDigitYear ) {
            const fullNumber = `${year}${mm}${dd}${individual}${checksum}`;
            return includeSeparator ? `${year}${mm}${dd}-${individual}${checksum}` : fullNumber;
        }

        return includeSeparator ? `${yy}${mm}${dd}-${individual}${checksum}` : shortNumber;
    }

    /**
     * Calculates the Luhn checksum digit for a given string of digits.
     * @param {String} digits - The string of digits to calculate the checksum for.
     * @returns {Number} The Luhn checksum digit.
     */
    async calculateLuhnChecksumDigit( digits ) {
        let sum = 0;
        for ( let i = 0; i < digits.length; i++ ) {
            const digit = Number( digits[i]);
            const multiplier = i % 2 === 0 ? 2 : 1;
            let product = digit * multiplier;
            if ( product > 9 ) {
                product -= 9;
            }
            sum += product;
        }
        return ( 10 - sum % 10 ) % 10;
    }
}

export { DataGeneratorHelper, RandomGeneratorHelper };
