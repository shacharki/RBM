import SpreadsheetState from "./SpreadsheetState";
import { buildTree } from 'excel-formula-ast'
import { tokenize } from 'excel-formula-tokenizer'
import evaluateFunction from "./EvaluateFunction";
import evaluateBinaryExpression from "./EvaluateBinaryExpression";
import evaluateCellNode, { parseSpreadsheetCellPosition } from "./EvaluateCellNode";
import { lettersToNumbers, numberToLetters } from "./SpreadsheetBuilders";

/**
 * 
 * @param { string } col 
 * @param { number } row
 * @returns { import("excel-formula-ast").CellNode } 
 */
function createCellNode(col, row) {
    if (col.startsWith("col_")) {
        col = parseInt(col.substr("col_".length)) + 1
    }

    return {
        type: "cell",
        refType: "relative",
        key: `${numberToLetters(col)}${row}`
    }
}

/**
 * 
 * @param { import("excel-formula-ast").CellRangeNode } node 
 * @param { SpreadsheetState } spreadsheet 
 */
function evaluateCellRange(node, spreadsheet) {
    var [startCol, startRow] = parseSpreadsheetCellPosition(node.left.key);
    var [endCol, endRow] = parseSpreadsheetCellPosition(node.right.key)

    startCol = lettersToNumbers(startCol) - 1;
    endCol = lettersToNumbers(endCol)

    var selectedRows = []


    for (var i = startRow - 1; i < endRow && i < spreadsheet.rows.length; i++) {
        const row = spreadsheet.rows[i];
        var filtered = Object.keys(row).reverse().filter((_, colIndex) => colIndex >= startCol && colIndex < endCol)


        selectedRows.push(
            filtered.map((col) => createCellNode(col, i + 1))
        )
    }

    return selectedRows;
}

/**
 * Evaluate one of the node in the AST tree.
 * @param { import("excel-formula-ast").Node } node The node to evaluate. 
 * @param { SpreadsheetState } spreadsheet The spreadsheet state.
 * @returns { import("excel-formula-ast").Node | undefined | string | number | Array<import("excel-formula-ast").CellNode> }
 */
export function evaluateNode(node, spreadsheet) {
    if (spreadsheet == undefined) throw new Error("Please provide the spreadsheet for evaluateNode");

    switch (node.type) {
        case "number":
            return node.value;
        case "text":
            return node.value
        case "function":
            return evaluateFunction(node, spreadsheet);
        case "binary-expression":
            return evaluateBinaryExpression(node, spreadsheet);
        case "cell":
            return evaluateCellNode(node, spreadsheet);
        case "logical":
            return node.value;
        case "cell-range":
            return evaluateCellRange(node, spreadsheet);
        default:
            break;
    }

    return undefined;
}


/**
 * Check if the given cell is a formula, by checking if it starts with '='
 * @param { string } cell
 * @returns { boolean } true if the cell if a formula, false otherwise. 
 */
export function isCellFormula(cell) {
    return cell.trim().startsWith('=')
}


/**
 * Parse and execute the given cell. If the cell is not a valid formula, return the cell iteself.
 * @param { string } cell The cell containing the formula.
 * @param { SpreadsheetState } spreadsheet The spreadsheet to parse. 
 * @returns { string } The new content of the cell
 */
export function executeFormula(cell, spreadsheet) {
    var formula = cell.trim();

    if (!isCellFormula(cell)) {
        return cell;
    }

    formula = formula.substr(1);

    const tokens = tokenize(formula)
    const tree = buildTree(tokens)

    var formulaResult = evaluateNode(tree, spreadsheet);

    return formulaResult;
}