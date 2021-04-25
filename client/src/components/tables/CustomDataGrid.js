import React from 'react'
import { DataGrid } from '@material-ui/data-grid'
import { getGridMetaData, USER_EDIT_COLUMN_ID } from './gridMetadata'

const DATA_GRID_PAGE_SIZE = 5

/**
 * This function is responsible for just rendering the table portion in the overall React DOM tree.
 * 
 * @param {Object} The properties passed to this functional component by the parent component.
 * @param {Function} A callback which will be invoked when a single row is selected/checked in this data grid.
 * @returns A data grid instance which will be rendered.
 */
export default function CustomDataGrid ({rows = [], onRowSelected = f => f, onDetailsSelected = f => f}) {

    const onDataGridCellClick = (params, event) => {
      if (params.field === USER_EDIT_COLUMN_ID) {
        console.log('Details for user ', params.row)
        onDetailsSelected(params.row)
      }
    }

    const onDataRowSelected = (param, event) => {
      onRowSelected(param.data, param.isSelected)
    }

    const columns = getGridMetaData()
    // For more props available on DataGrid, see: https://material-ui.com/api/data-grid/

    // We don't want the clicking on a specific data cell to bubble the associated event to the parent components
    // so turn it off by specifying property: disableClickEventBubbling. See example at: https://material-ui.com/components/data-grid/selection/
    return (
      <div style={{ height: 380, width: '100%' }}>
        <DataGrid 
          rows={rows} 
          columns={columns.map((column) => ({
            ...column,
            disableClickEventBubbling: true,
          }))} 
          pageSize={DATA_GRID_PAGE_SIZE}
          onCellClick={onDataGridCellClick}
          onRowSelected={onDataRowSelected}
          checkboxSelection />
      </div>
    )
}