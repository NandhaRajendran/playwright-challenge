/**
 * Helper class for execution related methods
 */
import userData from '../../data/userData.json' with { type: 'json' };
import enums from '../../data/enums.json' with { type: 'json' };

const userFilters = enums.USER.FILTERS;

class ExecutionHelper {
    constructor( logger ) {
        this.logger = logger;
    }

    /**
    * This method finds a specific user when given the appropriate filters and then returned
    * @param {JSON} filters JSON array of user properties eg: filters = { [userFilters.employmentType]: "student", [userFilters.USERACTIONTYPES]: ["apply-student-loan"] };
    * @returns A specific user
    */
    async getTestUser( filters ) {
        if ( !userData || userData.length <= 0 ) {
            throw new Error( '[WARN] Users data not provided' );
        }
        let filteredUsers = userData;

        for ( const filter in filters )
        {
            if ( filter == userFilters.USERACTIONTYPES )
            {
                for ( const userActionFilter in filters[filter])
                {
                    filteredUsers = filteredUsers.filter( user => user[filter].includes( filters[filter][userActionFilter]));
                }
            }
            else
            {
                filteredUsers = filteredUsers.filter( user => user[filter].includes( filters[filter]));
            }
            if ( filteredUsers.length == 0 ) {
                break;
            }
        }
        if ( !filteredUsers || filteredUsers.length == 0 ) {
            throw new Error( '[WARN] No users returned when filtering for users.' );
        }
        else {
            return JSON.parse( JSON.stringify( filteredUsers[0]));
        }
    }
}

export default ExecutionHelper;