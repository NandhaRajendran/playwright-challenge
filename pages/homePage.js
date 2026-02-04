/**
 * Page Object Model for the home page.
 */
class HomePage {
    /** @param {import('@playwright/test').Page} page */
    constructor( page, logger ) {
        this.page = page;
        this.logger = logger;
        this.applyNowLink = this.page.locator( 'a[href="/application/personal-details"]' ); // Prefer data-discover for Apply Now link
    }

    /**
     * Clicks the Apply Now button to begin the flow.
     */
    async startApplication() {
        await this.applyNowLink.first().waitFor({ state: 'visible', timeout: 10000 });
        if ( await this.applyNowLink.count() > 0 ) {
            await this.applyNowLink.first().click();
            this.logger.info( 'Clicked Apply Now link to start application' );
            return;
        }
        throw new Error( 'Apply now link is not found' );
    }
}

export default HomePage;
