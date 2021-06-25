import React, { useEffect, useState } from "react";
import DataGrid from 'react-data-grid'
import { executeFormula } from "./ForumulaParser";
import SpreadsheetState from "./SpreadsheetState";
import "./spreadsheetStyles.css"

function calculateRow(row, spreadsheet) {
    for (const column in row) {
        const cell = row[column];

        if (typeof (cell) == "string") {
            const newValue = executeFormula(row[column], spreadsheet)
            row[column] = newValue == undefined ? row[column] : newValue;
        }
    }
}

/**
 * 
 * @param { {state: SpreadsheetState, setSpreadsheetState: (SpreadsheetState) => void} } props 
 * @returns { JSX.Element }
 */
const Spreadsheet = (props) => {
    const [state, setSpreadsheetState] = useState(props.state)

    return <div style={state.style}>
        <DataGrid
            columns={state.columns}
            rows={state.rows}
            defaultColumnOptions={{ sortable: true, resizable: true }}
            onRowsChange={(changedRows, changeData) => {
                const stateCopy = { ...state };

                changeData.indexes.forEach((index) => {
                    var row = changedRows[index];

                    try {
                        calculateRow(row, stateCopy)
                    } catch (error) {
                        console.log("Error while computing the formulas: ", error)
                    }

                    stateCopy.rows[index] = row;
                })

                setSpreadsheetState(stateCopy)
            }}

            onSelectedCellChange={(pos) => {
                var copy = { ...state };
                copy.activeCellPos = {
                    colNumber: pos.idx,
                    rowNumber: pos.rowIdx
                }
            }}

        />
    </div>
}


export default Spreadsheet;