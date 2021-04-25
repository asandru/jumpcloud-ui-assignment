
import Button from '@material-ui/core/Button'
import Tooltip from '@material-ui/core/Tooltip'
import Typography from '@material-ui/core/Typography'

export const CHECKBOX_COLUMN_ID = '__check__' // this is the id assigned by default by DataGrid widget whenever 'checkboxSelection' property is supplied
export const USER_STATUS_COLUMN_ID = 'status'
export const USER_USERNAME_COLUMN_ID = 'username'
export const USER_FULLNAME_COLUMN_ID = 'fullName'
export const USER_DISPLAYNAME_COLUMN_ID = 'displayname'
export const USER_FIRSTNAME_COLUMN_ID = 'firstname'
export const USER_LASTNAME_COLUMN_ID = 'lastname'
export const USER_MIDDLENAME_COLUMN_ID = 'lastname'
export const USER_EMAIL_COLUMN_ID = 'email'
export const USER_EDIT_COLUMN_ID = 'editUser'

/**
 * This function handles the metadata portion associated with a data grid.
 * A data grid is basically a table , so it has a bunch of columns.
 * Each object (in the array returned below) describes:
 *   - the *type* of data (i.e. NOT the data itself) for that particular grid column.
 *   - how the data will be rendered
 * 
 * Notes:
 *  - The object order placed in this area dictates the order of displayed columns (from left to right).
 * 
 *  - The value given to 'headerName' property is what will be displayed for that column header.
 * 
 *  - For columns which want to display a custom way of acessing the cell value (for a particular user), one needs to implement the additional 'valueGetter'
 *    where the user data is provided as part of: params.row (e.g. the column 'Full Name' returns a customized value for each data row)
 *    More on customization examples here: https://material-ui.com/components/data-grid/columns/
 * 
 *  - Columns which just want to display the raw value (i.e. as returned by the backend) just need to ensure their 'field' property
 *    matches exactly the property name associated with user object that was returned by backend.
 * 
 *  - The data (associated with a single user) is alwaysrepresented by params.row
 * 
 * @returns Returns the metadata, as an array of objects.
 */
export function getGridMetaData () {
    return [
        {
          field: USER_STATUS_COLUMN_ID,
          type: 'string',
          headerName: 'Status',
          sortable: true,
          width: 100,
          renderCell: (params) =>{
              const status = params.row.activated ? 'Active' : 'Inactive'
              const colorToUse =  params.row.activated ? 'primary' : 'error'
              return (
                <Typography color={colorToUse}> 
                  {status}
                </Typography>
              )
          }
        },
        { 
          field: USER_USERNAME_COLUMN_ID,
          type: 'string',
          description: 'Mandatory user identifier',
          sortable: true,
          headerName: 'Username', 
          width: 150,
          renderCell: (params) => (
            <strong>
                <Tooltip title={'ID: ' + params.row.id}>
                  <Typography> 
                      {params.row.username}
                  </Typography>
                </Tooltip>
            </strong>
          )
        },
        {
          field: USER_FULLNAME_COLUMN_ID,
          type: 'string',
          headerName: 'Full Name',
          description: 'This column will show the full name of any fecthed user',
          sortable: true,
          width: 200,
          valueGetter: (params) =>
            `${params.row.firstname || ''} ${params.row.lastname || ''}`
        },
        {
            field: USER_EMAIL_COLUMN_ID, 
            type: 'string',
            headerName: 'E-Mail', 
            width: 250
        },
        // For icons I used the ones provided by Google's Material UI, by adding a <link> in client/public/index.html
        // The full set is icons are here: https://fonts.google.com/icons
        {
            field: USER_EDIT_COLUMN_ID,
            description: 'Provides a way to edit properties for a selected user',
            headerName: 'Edit',
            sortable: false,
            filterable: false,
            resizable: false,
            width: 80,
            cellAlign: 'center',
            renderCell: (params) => (
              <strong>
                <Tooltip title={'Edit ' + params.row.firstname + ' ' + params.row.lastname}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                  >
                    <i className="material-icons">edit </i>
                  </Button>
                </Tooltip>
              </strong>
            )
        }
    ]
}