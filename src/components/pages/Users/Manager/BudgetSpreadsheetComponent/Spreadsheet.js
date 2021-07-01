import React, { useEffect, useState, useRef } from "react";
import DataGrid, { Cell } from 'react-data-grid'
import { executeFormula } from "./ForumulaParser";
import SpreadsheetState from "./SpreadsheetState";
import "./spreadsheetStyles.css"
import setStyleOfCell from "./util/gridCellStyling";

function calculateRow(row, spreadsheet) {
    for (const column in row) {
        const cell = row[column];

        if (typeof (cell.v) == "string") {
            // Update the formula property if the cell is indeed a formula, before the new value is calculated.
            row[column].f = cell.v.startsWith('=') ? cell.v.substr(1) : undefined;


            const newValue = executeFormula(row[column].v, spreadsheet)
            row[column].v = newValue == undefined ? row[column] : newValue;

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
            enableVirtualization={true}
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