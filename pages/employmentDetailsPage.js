/**
 * Page Object Model for employment details page.
 */
import enums from '../data/enums.json' with { type: 'json' };
const employmentStatuses = enums.EMPLOYMENT_STATUSES;

class EmploymentDetailsPage {
    /** @param {import('@playwright/test').Page} page */
    constructor( page, logger ) {
        this.page = page;
        this.logger = logger;
        this.continueButton = page.locator( 'button[type="submit"][form="employment-status-form"]' );
    }

    /**
     * Selects the employment status option.
     * @param {String} statusValue user visible employment status text
     * eg: 'Employed', 'Unemployed', 'Student', 'Retired', 'SelfEmployed', 'TemporarilyEmployed'
     */
    async selectEmploymentStatus( statusValue ) {
        if ( !statusValue ) {
            throw new Error( 'No employment status text provided' );
        }
        this.logger.info( `Selecting employment status: ${statusValue}` );

        // input is the located radio input (Playwright Locator)
        const input = this.page.locator( `input[name="employmentStatus"][value="${statusValue}"]` );
        const id = await input.getAttribute( 'id' );
        const label = id ? this.page.locator( `label[for="${id}"]` ).first() : input.locator( 'xpath=ancestor::label[1]' );
        this.logger.debug( label ? `Located label for employment status: ${label}` : `No label found for employment status: ${statusValue}` );
        if ( await label.count() > 0 ) {
            const lbl = label.first();
            await lbl.waitFor({ state: 'visible', timeout: 10000 });
            await lbl.scrollIntoViewIfNeeded();
            // DOM click inside page context — avoids pointer interception/race
            await lbl.evaluate( el => {
                el.click();
            });
            const checked = await input.evaluate( el => el.checked );

            if ( !checked ) {
                throw new Error( `Failed to select employment status: ${statusValue}` );
            }
            return;
        }
        throw new Error( `No employment status label found or label not visible for employment status: ${statusValue}` );
    }

    /**
     * Selects the 'Student' employment status.
     * @param {JSON} user user data object containing employmentType
     */
    async selectStudent( user ) {
        const employmentType = user && user.employmentType ? user.employmentType : employmentStatuses.STUDENT;
        await this.selectEmploymentStatus( employmentType );
    }

    /**
     * Submits the employment details form by clicking the continue button.
     */
    async submitEmploymentDetails() {
        await this.logger.info( 'Submitting employment details form' );
        if ( await this.continueButton.isEnabled({ timeout: 5000 }) && await this.continueButton.count() > 0 ) {
            await this.continueButton.first().click();
        } else {
            this.logger.error( 'Employment details continue button is not enabled or not found' );
        }
    }
}

export default EmploymentDetailsPage;
