/**
 * Page Object Model for personal details page.
 */
class PersonalDetailsPage {
    /** @param {import('@playwright/test').Page} page */
    constructor( page, logger ) {
        this.page = page;
        this.logger = logger;
        this.emailInput = page.locator( 'input[name="email"], input[type="email"]' );
        this.mobileInput = page.locator( 'input[name="mobile"], input[type="tel"]' );
        this.socialSecurityNumberInput = page.locator( 'input[name="nationalNumber"], input[id="nationalNumber"]' );
        this.continueButton = page.locator( 'button[type="submit"][form="personal-details-form"]' );
    }

    /**
     * Set primary personal details on the form.
     * @param {JSON} userPersonalData user personal data object
     */
    async setPersonalDetails( userPersonalData ) {
        if ( !userPersonalData || !userPersonalData.socialSecurityNumber || !userPersonalData.email || !userPersonalData.mobile ) {
            this.logger.error( 'No user personal data provided or user personal data is incomplete' );
            return -1;
        }
        await this.logger.info( `Setting user personal details: email=${userPersonalData.email}, mobile=${userPersonalData.mobile}, socialSecurityNumber=${userPersonalData.socialSecurityNumber}` );
        await this.emailInput.first().waitFor({ state: 'visible', timeout: 5000 });
        await this.emailInput.first().fill( userPersonalData.email );
        await this.mobileInput.first().fill( userPersonalData.mobile );
        await this.socialSecurityNumberInput.first().fill( userPersonalData.socialSecurityNumber );
        this.logger.info( 'User personal details: email, mobile, socialSecurityNumber are set' );
    }

    /**
     * Submits the personal details form by clicking the continue button.
     */
    async submitPersonalDetails() {
        await this.logger.info( 'Submitting personal details form' );
        if ( await this.continueButton.isEnabled({ timeout: 5000 }) && await this.continueButton.count() > 0 ) {
            await this.continueButton.first().click();
        } else {
            throw new Error( 'Personal details continue button is not enabled or not found' );
        }
    }
}

export default PersonalDetailsPage;
