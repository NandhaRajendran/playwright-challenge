import test, { expect } from './fixtures.js';
import enums from '../data/enums.json' with { type: 'json' };
import endpointData from '../data/endpointData.json' with { type: 'json' };
import BasePage from '../pages/basePage.js';
import EmploymentDetailsPage from '../pages/employmentDetailsPage.js';
import FinancePage from '../pages/financePage.js';
import HomePage from '../pages/homePage.js';
import OfferPage from '../pages/offerPage.js';
import PersonalDetailsPage from '../pages/personalDetailsPage.js';
import { DataGeneratorHelper } from '../helper/data/dataGeneratorHelper.js';

let logger, dataGeneratorHelper, basePage, homePage, personalDetailsPage, employmentDetailsPage, financePage, offerPage, executionHelper;
const userFilters = enums.USER.FILTERS;
const employmentStatuses = enums.EMPLOYMENT_STATUSES;

test.describe( 'Loan application - Student Tests @Test @Regression', () => {
    let user;
    test.beforeEach( async({ page, executionHelper: execHelper, logger: log }) => {
        // assign fixtures to outer variable to use inside the test
        executionHelper = execHelper;
        logger = log;
        dataGeneratorHelper = new DataGeneratorHelper( logger );
        basePage = new BasePage( page, logger );
        homePage = new HomePage( page, logger );
        personalDetailsPage = new PersonalDetailsPage( page, logger );
        employmentDetailsPage = new EmploymentDetailsPage( page, logger );
        financePage = new FinancePage( page, logger );
        offerPage = new OfferPage( page, logger );

        // Get a test user - student loan applicant
        const filters = {
            [userFilters.EMPLOYMENTTYPE]: employmentStatuses.STUDENT,
            [userFilters.USERACTIONTYPES]: ['apply-student-loan']
        };
        user = await executionHelper.getTestUser( filters );

        // Navigate to application start page
        await basePage.navigateURL( `${endpointData.baseURL}/application` );

        // Start flow
        await homePage.startApplication();
    });
    // Happy-path checks for ages inside and just above/below the accepted range (25 - 30)
    const validAges = [24, 25, 27, 30, 35];
    for ( const age of validAges ) {
        test( `Happy Path: Student maximum offer test (age ${age})`, async() => {
            logger.info( `Starting test: Student receives maximum 20000 kr offer (age ${age})` );

            // Fill application forms
            await testFillPersonalDetails( user, age );
            await testSelectEmploymentDetails( user.employmentType || employmentStatuses.STUDENT );
            await testFillFinancialDetails({ income: user.income, kidsStatus: '0', householdStatus: '1' });

            // Verify offer
            await testVerifyOfferAmount( 20000, `age ${age}` );
        });
    }

    // Boundary/negative checks for ages outside the accepted range and underage
    // TODO:: randomise boundary age from config or data file
    const boundaryAges = [100, 10];
    for ( const age of boundaryAges ) {
        test( `Negative: Student age ${age} not applicable for offer test`, async() => {
            logger.info( `Starting boundary test for age ${age}` );

            // Fill application forms
            await testFillPersonalDetails( user, age );
            await testSelectEmploymentDetails( user.employmentType || employmentStatuses.STUDENT );
            await testFillFinancialDetails({ income: user.income, kidsStatus: '2', householdStatus: '2' });

            // Verify rejection or non-standard offer
            try {
                await offerPage.waitForOfferPageLoad();

                logger.info( `Asserting offer page should NOT appear for age ${age}` );
                await expect.poll( async() => offerPage.isOnOfferPage(), { timeout: 10000 }).toBeFalsy();
                logger.info( `✓ Offer page correctly not shown for age ${age}` );

                logger.info( `Asserting offer amount is NOT 20000 kr for age ${age}` );
                const amount = await offerPage.getOfferAmount();
                expect( amount, `Offer amount for age ${age}` ).not.toBe( 20000 );
                logger.info( `✓ Offer amount confirmed is not 20000 kr (actual: ${amount} kr) for age ${age}` );
            } catch ( error ) {
                logger.info( `Expected no offer page for age ${age}. Caught error: ${error.message}` );
                await testVerifyRejectionPage( `age ${age}` );
            }
        });
    }

    // Additional test for different salary inputs and some household/kids status combinations
    const incomeValues = [0, 10000, 15000, 14000, 50000];
    for ( const income of incomeValues ) {
        test( `Student offer with income ${income} kr test`, async() => {
            logger.info( `Starting test: Student offer with income ${income} kr` );

            // Set income and fill application forms
            user.income = income;
            await testFillPersonalDetails( user, 27 );
            await testSelectEmploymentDetails( user.employmentType || employmentStatuses.STUDENT );

            // Verify outcome based on income
            switch ( income ) {
            case 0:
                await testFillFinancialDetails({ income: user.income, kidsStatus: '0', householdStatus: '1' });
                await testVerifyErrorAlert( `income ${income} kr` );
                break;
            case 10000:
                await testFillFinancialDetails({ income: user.income, kidsStatus: '1', householdStatus: '2' });
                await testVerifyRejectionPage( `income ${income} kr` );
                break;
            case 15000:
                await testFillFinancialDetails({ income: user.income, kidsStatus: '3', householdStatus: '1' });
                await testVerifyRejectionPage( 20000, `income ${income} kr` );
                break;
            case 14000:
                await testFillFinancialDetails({ income: user.income, kidsStatus: '0', householdStatus: '2' });
                await testVerifyOfferAmountLessThanorEqual( 20000, `income ${income} kr` );
                break;
            case 50000:
                await testFillFinancialDetails({ income: user.income, kidsStatus: '3', householdStatus: '1' });
                await testVerifyOfferAmount( 20000, `income ${income} kr` );
                break;
            }
        });
    }

    //Additional tests can be added here for different household and kids status combinations
});

// ============================================================================
// Reusable Test Helper Functions
// ============================================================================

/**
 * Fill personal details with generated data for a specific age
 * @param {Object} user - User object to update with generated data
 * @param {number} age - Age for personnummer generation
 */
async function testFillPersonalDetails( user, age ) {
    logger.info( `Generating personal details for age ${age}` );
    user.socialSecurityNumber = await dataGeneratorHelper.generatePersonnummerForAge( age );
    user.email = await dataGeneratorHelper.random.getRandomEmail();
    user.mobile = await dataGeneratorHelper.random.getRandomMobileNumber();

    await personalDetailsPage.setPersonalDetails( user );
    await personalDetailsPage.submitPersonalDetails();
    logger.info( `✓ Personal details filled and submitted` );
}

/**
 * Select employment details with student status
 * @param {string} employmentStatus - Employment status (defaults to STUDENT)
 */
async function testSelectEmploymentDetails( employmentStatus = employmentStatuses.STUDENT ) {
    logger.info( `Setting employment status: ${employmentStatus}` );
    await employmentDetailsPage.selectEmploymentStatus( employmentStatus );
    await employmentDetailsPage.submitEmploymentDetails();
    logger.info( `✓ Employment details submitted` );
}

/**
 * Fill financial details
 * @param {Object} options - Financial details options
 * @param {number} options.income - Income amount
 * @param {string} options.kidsStatus - Kids status value
 * @param {string} options.householdStatus - Household status value
 */
async function testFillFinancialDetails({ income, kidsStatus = '1', householdStatus = '2' }) {
    logger.info( `Setting financial details: income=${income}, kids=${kidsStatus}, household=${householdStatus}` );
    await financePage.setFinancialDetails({
        income,
        housingCost: 0,
        transportCost: 0,
        otherLoanCost: 0
    });
    await financePage.selectKidsStatus( kidsStatus );
    await financePage.selectHouseholdStatus( householdStatus );
    await financePage.submitFinanceDetails();
    logger.info( `✓ Financial details submitted` );
}

/**
 * Assert user is on offer page and verify offer amount
 * @param {number} expectedAmount - Expected offer amount
 * @param {string} context - Context for logging (e.g., "age 27", "income 15000 kr")
 * @returns {number} Actual offer amount
 */
async function testVerifyOfferAmount( expectedAmount, context ) {
    await offerPage.waitForOfferPageLoad();

    logger.info( `Asserting user reaches offer page (${context})` );
    await expect.poll( async() => offerPage.isOnOfferPage(), { timeout: 10000 }).toBeTruthy();
    logger.info( `✓ Offer page confirmed for ${context}` );

    logger.info( `Asserting offer amount = ${expectedAmount} kr (${context})` );
    const amount = await offerPage.getOfferAmount();
    expect( amount, `Offer amount for ${context}` ).toBe( expectedAmount );
    logger.info( `✓ Offer amount confirmed: ${amount} kr for ${context}` );

    return amount;
}

/**
 * Assert user is on offer page and verify offer amount is less than or equal to expected
 * @param {number} maxAmount - Maximum expected offer amount
 * @param {string} context - Context for logging
 * @returns {number} Actual offer amount
 */
async function testVerifyOfferAmountLessThanorEqual( maxAmount, context ) {
    await offerPage.waitForOfferPageLoad();

    logger.info( `Asserting user reaches offer page (${context})` );
    await expect.poll( async() => offerPage.isOnOfferPage(), { timeout: 10000 }).toBeTruthy();
    logger.info( `✓ Offer page confirmed for ${context}` );

    logger.info( `Asserting offer amount <= ${maxAmount} kr (${context})` );
    const amount = await offerPage.getOfferAmount();
    expect( amount, `Offer amount for ${context}` ).toBeLessThanOrEqual( maxAmount );
    logger.info( `✓ Offer amount confirmed: ${amount} kr (<= ${maxAmount} kr) for ${context}` );

    return amount;
}

/**
 * Assert user is on status/rejection page
 * @param {string} context - Context for logging
 */
async function testVerifyRejectionPage( context ) {
    logger.info( `Expected no offer page for ${context}` );
    await offerPage.waitForStatusPageLoad();

    logger.info( `Asserting user is on status/rejection page (${context})` );
    await expect.poll( async() => offerPage.isOnStatusPage(), { timeout: 10000 }).toBeTruthy();
    logger.info( `✓ Status page confirmed for ${context}` );
}

/**
 * Assert error alert is visible on finance page
 * @param {string} context - Context for logging
 */
async function testVerifyErrorAlert( context ) {
    logger.info( `Asserting error alert is visible (${context})` );
    await expect.poll( async() => financePage.isErrorAlertVisible(), { timeout: 5000 }).toBe( true );
    logger.info( `✓ Error alert confirmed visible for ${context}` );
}