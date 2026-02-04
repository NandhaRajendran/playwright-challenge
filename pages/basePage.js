/**
 * BasePage - simple base page helper
 */
class BasePage {
    /**
   * @param {import('playwright').Page} page
   */
    constructor( page, logger ) {
        this.page = page;
        this.logger = logger;
    }

    /**
   * Navigate to the given URL. Returns the response from page.goto
   * @param {string} url
   * @param {import('playwright').NavigateOptions} [options]
   */
    async navigateURL( url, options = {}) {
        if ( !url || typeof url !== 'string' ) {
            throw new Error( 'navigateURL requires a valid URL string' );
        }
        this.logger.info( `Navigating to URL: ${url}` );
        return await this.page.goto( url, { waitUntil: 'load', ...options });
    }
}

export default BasePage;
