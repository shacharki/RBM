import { convertNumberToSpradsheetColumn, lettersToNumbers } from './SpreadsheetBuilders'
import { evaluateNode } from "./ForumulaParser";


/**
 * Convert the spreadsheet cell position to numbers. A1 => [1,1], AA24 => [27,24]
 * @param { string } strPos The position as string.
 * @returns { Array<number> } The position as numbers. The first element is the column, the second is the row.
 */
export function parseSpreadsheetCellPosition(strPos) {
    var column = "", row = 0, i = 0;

    for (; i < strPos.length; i++) {
        if (!/[a-z]/i.test(strPos[i]))
            break;
    }

    column = strPos.substr(0, i)
    row = parseInt(strPos.substr(i))

    return [column, row]
}

/**
 * Get the cell from the spreadsheet and return its value.
 * @param { import("excel-formula-ast").CellNode } node 
 * @param { SpreadsheetState } spreadsheet 
 */
function evaluateCellNode(node, spreadsheet) {
    var [column, row] = parseSpreadsheetCellPosition(node.key)

    if (row == NaN || column == "") {
        throw new Error("Could not parse cell.")
    }

    const columnNumber = lettersToNumbers(column) + - 1

    const cellValue = spreadsheet.rows[row - 1][convertNumberToSpradsheetColumn(columnNumber)].v
    const asNumber = parseFloat(cellValue);

    return isNaN(asNumber) ? cellValue : asNumber;
}

export default evaluateCellNode;