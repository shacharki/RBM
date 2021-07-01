import React from "react";


/**
 * Set the style of a specific cell in the data grid. Assume there is only 1 data grid running.
 * @param { number } rowNumber The row index of the cell. The function adds 1 to rowNumber when accessing the elements to skip the headers row. Therefore, you can access the headers by specifing rowNumber = -1;
 * @param { number } columnNumber The column index of the cell. Start from 0.
 * @param { React.CSSProperties } style The new style of the cell. The style is merged with the existing style, not overiding it completely.
 */
function setStyleOfCell(rowNumber, columnNumber, style) {
    const htmlRows = document.getElementsByClassName('rdg-row')
    const arr = [...htmlRows]

    const cells = arr[rowNumber + 1].getElementsByClassName('rdg-cell')
    const cellToUpdate = cells.item(cells.length - columnNumber)

    if(cellToUpdate) {
        cellToUpdate.style.backgroundColor = 'red'
    }
}


export default setStyleOfCell;