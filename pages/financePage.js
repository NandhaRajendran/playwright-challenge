/**
 * Page Object Model for finance details page.
 */
class FinancePage {
    constructor( page, logger ) {
        this.page = page;
        this.logger = logger;
        // Prefer data-testid for stable input locators, fall back to role-based locators
        this.incomeTextbox = this.page.locator( 'input[id="monthlyIncome"], input[name="monthlyIncome"]' );
        this.housingCostTextbox = this.page.locator( 'input[id="monthlyHouseCost"], input[name="monthlyHouseCost"]' );
        this.transportCostTextbox = this.page.locator( 'input[id="transportationCost"], input[name="transportationCost"]' );
        this.otherLoanCostTextbox = this.page.locator( 'input[id="otherLoanCost"], input[name="otherLoanCost"]' );
        this.submitButton = page.locator( 'button[type="submit"][form="finances-form"]' );
        this.errorAlert = page.locator( '#error[role="alert"]' );
    }

    /**
     * Set financial details.
     * @param {JSON} userFinanceData user financial data object containing income, housing, transport, otherLoanCost
     */
    async setFinancialDetails( userFinanceData ) {
        if ( !userFinanceData ) {
            throw new Error( 'No user financial data provided' );
        }

        await this.logger.info( `Setting user financial details: income=${userFinanceData.income}, housing=${userFinanceData.housingCost}, transport=${userFinanceData.transportCost}, otherLoanCost=${userFinanceData.otherLoanCost}` );
        await this.incomeTextbox.waitFor({ state: 'visible', timeout: 5000 });
        await this.incomeTextbox.fill( String( userFinanceData.income ));
        await this.housingCostTextbox.fill( userFinanceData.housingCost ? String( userFinanceData.housingCost ) : '0' );
        await this.transportCostTextbox.fill( userFinanceData.transportCost ? String( userFinanceData.transportCost ) : '0' );
        await this.otherLoanCostTextbox.fill( userFinanceData.otherLoanCost ? String( userFinanceData.otherLoanCost ) : '0' );
    }

    /**
     * Selects the household status option.
     * @param {String} numberOfPersons number of persons living in household
     * eg.: "1", "2"
     */
    async selectHouseholdStatus( numberOfPersons = "1" ) {
        const inputLocator = this.page.locator( `input[name="numberOfPersonsLiving"][value="${numberOfPersons}"]` );
        if ( await inputLocator.count() === 0 ) {
            this.logger.error( `Household option ${numberOfPersons} not found` );
            throw new Error( `Household option ${numberOfPersons} not found` );
        }
        const input = inputLocator.first();
        await input.waitFor({ state: 'visible', timeout: 10000 });
        const id = await input.getAttribute( 'id' );
        const label = id ? this.page.locator( `label[for="${id}"]` ).first() : input.locator( 'xpath=ancestor::label[1]' );
        if ( await label.count() > 0 ) {
            const lbl = label.first();
            await lbl.waitFor({ state: 'visible', timeout: 10000 });
            await lbl.scrollIntoViewIfNeeded();
            await lbl.evaluate( el => el.click());
            const selected = await input.evaluate( el => el.checked );
            if ( !selected ) {
                throw new Error( `Failed to select household option: ${numberOfPersons}` );
            }
            return;
        }
        throw new Error( `No household label found or label not visible for option: ${numberOfPersons}` );
    }

    /**
     * Selects the kids status option.
     * @param {String} numberOfChildren number of children in household
     * eg.: "0", "1", "2", "3"
     */
    async selectKidsStatus( numberOfChildren = "1" ) {
        const inputLocator = this.page.locator( `input[name="numberOfChildren"][value="${numberOfChildren}"]` );
        if ( await inputLocator.count() === 0 ) {
            this.logger.error( `Children option ${numberOfChildren} not found` );
            throw new Error( `Children option ${numberOfChildren} not found` );
        }
        const input = inputLocator.first();
        await input.waitFor({ state: 'visible', timeout: 10000 });
        const id = await input.getAttribute( 'id' );
        const label = id ? this.page.locator( `label[for="${id}"]` ).first() : input.locator( 'xpath=ancestor::label[1]' );
        if ( await label.count() > 0 ) {
            const lbl = label.first();
            await lbl.waitFor({ state: 'visible', timeout: 10000 });
            await lbl.scrollIntoViewIfNeeded();
            await lbl.evaluate( el => el.click());
            const selected = await input.evaluate( el => el.checked );
            if ( !selected ) {
                throw new Error( `Failed to select children option: ${numberOfChildren}` );
            }
            return;
        }
        throw new Error( `No children label found or label not visible for option: ${numberOfChildren}` );
    }

    /**
     * Submits the finance details form by clicking the submit button.
     */
    async submitFinanceDetails() {
        await this.logger.info( 'Submitting finance details form' );
        if ( await this.submitButton.isEnabled({ timeout: 5000 }) && await this.submitButton.count() > 0 ) {
            await this.submitButton.first().click();
        } else {
            this.logger.error( 'Finance details submit button is not enabled or not found' );
        }
    }

    /**
     * Returns true if an error alert is visible on the finance page.
     */
    async isErrorAlertVisible() {
        return await this.errorAlert.isVisible({ timeout: 3000 });
    }
}

export default FinancePage;
