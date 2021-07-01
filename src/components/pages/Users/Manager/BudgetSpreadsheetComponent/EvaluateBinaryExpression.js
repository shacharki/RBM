import { evaluateNode } from "./ForumulaParser";


/**
 * Evaluate binary expression nodes.
 * @param { import("excel-formula-ast").BinaryExpressionNode } node 
 * @param { SpreadsheetState } spreadsheet
 */
function evaluateBinaryExpression(node, spreadsheet) {
    const operatorHandlers = {
        "+": (left, right) => evaluateNode(left, spreadsheet) + evaluateNode(right, spreadsheet),
        "-": (left, right) => evaluateNode(left, spreadsheet) - evaluateNode(right, spreadsheet),
        "/": (left, right) => evaluateNode(left, spreadsheet) / evaluateNode(right, spreadsheet),
        "*": (left, right) => evaluateNode(left, spreadsheet) * evaluateNode(right, spreadsheet),
        "&": (left, right) => evaluateNode(left, spreadsheet) & evaluateNode(right, spreadsheet),
        "<=": (left, right) => evaluateNode(left, spreadsheet) <= evaluateNode(right, spreadsheet),
        ">=": (left, right) => evaluateNode(left, spreadsheet) >= evaluateNode(right, spreadsheet),
        "=": (left, right) => evaluateNode(left, spreadsheet) == evaluateNode(right, spreadsheet),
        ">": (left, right) => evaluateNode(left, spreadsheet) > evaluateNode(right, spreadsheet),
        "<": (left, right) => evaluateNode(left, spreadsheet) < evaluateNode(right, spreadsheet),
    }
    var result = undefined;

    try {
        result = operatorHandlers[node.operator](node.left, node.right);
    } catch (error) {
        throw new Error(`Error while executing operator ${node.operator}. error: ${error}`)
    }

    return result;
}


export default evaluateBinaryExpression;