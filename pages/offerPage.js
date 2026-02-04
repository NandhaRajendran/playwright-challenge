/**
 * Page Object Model for the offer/result page.
 */
class OfferPage {
    /**
   * @param {import('@playwright/test').Page} page
   */
    constructor( page ) {
        this.page = page;
        this.offerAmountLocator = page.getByRole( 'heading' ).or( page.locator( 'text=/\\d[\\d\\s]*\\s*(?:kr|SEK)/i' ));
    }

    /**
   * Waits for the offer page to load by waiting for the URL to match.
   */
    async waitForOfferPageLoad() {
        return this.page.waitForURL( /\/credit\/offer$/, { timeout: 10000 });
    }

    /**
   * Waits for the status page to load by waiting for the URL to match.
   */
    async waitForStatusPageLoad() {
        try {
            await this.page.waitForURL( /\/status$/, { timeout: 10000 });
        } catch ( error ) {
            throw new Error( `Status page did not load within timeout: ${ error.message}` );
        }
        return true;
    }

    /**
   * Returns true if we are on the offer page (heuristic).
   */
    async isOnOfferPage() {
        return await this.offerAmountLocator.count() > 0;
    }

    /** */
    async isOnStatusPage() {
        const url = this.page.url();
        return url.includes( '/status' );
    }

    /**
   * Parses the first visible offer amount and returns a number (SEK).
   * If parsing fails, returns NaN.
   */
    async getOfferAmount() {
        if ( await this.offerAmountLocator.count() === 0 ) {
            throw new Error( 'No offer amount locator found on offer page' );
        }
        const locator = this.offerAmountLocator.first();
        await locator.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
        const text = await locator.innerText();
        // Normalize and trim
        const normalized = text.replace( /\u00A0/g, ' ' ).trim();
        // Try to match amounts with optional currency (kr or SEK)
        const match = normalized.match( /(\d[\d\s]*)\s*(?:kr|SEK)?/i );
        if ( !match ) {
            throw new Error( 'No offer amount found on offer page' );
        }
        const digits = match[1].replace( /\s/g, '' );
        return Number( digits );
    }
}

export default OfferPage;
