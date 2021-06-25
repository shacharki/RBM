import { ro } from "date-fns/locale";
import { evaluateNode } from "./ForumulaParser";
import SpreadsheetState from "./SpreadsheetState";
import "./spreadsheetStyles.css"


const functionHandlers = {
    /**
     * Sum all of the argument given to the function.
     * @param { import("excel-formula-ast").FunctionNode } node 
     * @param { SpreadsheetState } spreadsheet 
     */
    SUM: (node, spreadsheet) => {
        var sum = 0;
        node.arguments.forEach(arg => {
            const value = evaluateNode(arg, spreadsheet);

            if (value.constructor == Array) {
                return value.forEach(row => row.forEach(cell => sum += evaluateNode(cell, spreadsheet)))
            }

            var asNumber = typeof (value) == "number" ? value : parseFloat(value)

            if (!isNaN(asNumber)) {
                return (sum += asNumber);
            }


            throw new Error(`Cant sum non number ${value}`)
        })


        return sum;
    },
    /**
     * Sum all of the argument given to the function if the first argument resolved to be true.
     * @param { import("excel-formula-ast").FunctionNode } node 
     * @param { SpreadsheetState } spreadsheet 
     */
    SUMIF: (node, spreadsheet) => {
        if (node.arguments.length < 2) {
            throw new Error("At lease 2 arguments are needed for SUMIF.")
        }
        const sumIf = evaluateNode(node.arguments[0], spreadsheet)

        if (typeof (sumIf) !== "boolean") {
            throw new Error("The first argument for SUMIF is needed to be a boolean.");
        }

        if (sumIf) {
            node.arguments = node.arguments.slice(1) // Remove the boolean expression.
            return functionHandlers.SUM(node, spreadsheet)
        }

        return undefined;
    }
    ,
    /**
     * Avarage all of the argument given to it.
     * @param { import("excel-formula-ast").FunctionNode } node 
     * @param { SpreadsheetState } spreadsheet 
     */
    AVG: (node, spreadsheet) => {
        var sum = 0, count = 0;

        // Sum up all of the cell and count them.
        node.arguments.forEach(arg => {
            const value = evaluateNode(arg, spreadsheet)


            if (value.constructor == Array) {
                return value.forEach(row => row.forEach(cell => {
                    sum += evaluateNode(cell, spreadsheet)
                    count++
                }))
            }

            var asNumber = typeof (value) == "number" ? value : parseFloat(value)

            if (!isNaN(asNumber)) {
                sum += asNumber;
                return count++;
            }


            throw new Error(`Cant avarage non number ${value}`)
        })


        return count == 0 ? 0 : sum / count;
    },
    /**
     * Count all of the cells containing numbers in the cells given.
     * @param { import("excel-formula-ast").FunctionNode } node 
     * @param { SpreadsheetState } spreadsheet 
     */
    COUNT: (node, spreadsheet) => {
        var count = 0;

        node.arguments.forEach(arg => {
            var value = evaluateNode(arg, spreadsheet)

            if (value.constructor == Array) {
                return value.forEach(row => row.forEach(cell => {
                    const evaluated = evaluateNode(cell, spreadsheet)
                    if (typeof (evaluated) == "number" && !isNaN(evaluated))
                        count++;
                }))
            }

            if (typeof (value) == "number")
                count++;
        })

        return count;
    },
    /**
     * IF (logical_test, [value_if_true], [value_if_false])
     * @param { import("excel-formula-ast").FunctionNode } node 
     * @param { SpreadsheetState } spreadsheet 
     */
    IF: (node, spreadsheet) => {
        if (node.arguments.length < 1 || node.arguments.length > 3) {
            throw new Error("Invalid arguments count for IF. Provide 1 to 3 arguments.")
        }

        const logicalTest = evaluateNode(node.arguments[0], spreadsheet)

        if (typeof (logicalTest) !== "boolean") {
            throw new Error("The first argument of IF must be a logical exression.")
        }

        const getOrUndefined = (index) => node.arguments.length - 1 < index ? undefined : evaluateNode(node.arguments[index], spreadsheet);

        return logicalTest ? getOrUndefined(1) : getOrUndefined(2);
    }
}

/**
 * 
 * @param { import("excel-formula-ast").FunctionNode } node 
 * @param { SpreadsheetState } spreadsheet 
 */
function evaluateFunction(node, spreadsheet) {
    if (!functionHandlers.hasOwnProperty(node.name)) {
        throw new Error(`Cant find function ${node.name}`)
    }

    return functionHandlers[node.name](node, spreadsheet);
}

export default evaluateFunction;