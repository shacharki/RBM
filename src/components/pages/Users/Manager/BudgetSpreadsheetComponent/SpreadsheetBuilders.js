import { TextEditor, ValueFormatter } from "react-data-grid/";
import SpreadsheetTextEditor from './SpreadsheetCellEditor'
import { ReactDOM, useEffect, useRef, useState } from 'react'
import './spreadsheetStyles.css'
import DOMPurify from 'dompurify'

/**
 * Convert the counting method from numbers to letters. e.g. 1 => A, 2 => B, 27 => AA.
 * @param { number } num The number to convert.
 * @returns { string } The converted number as string.
 */
export function numberToLetters(num) {
    var mod = num % 26,
        pow = num / 26 | 0,
        out = mod ? String.fromCharCode(64 + mod) : (--pow, 'Z');
    return pow ? numberToLetters(pow) + out : out;
}

/**
 * Convert a string of letter counting to a number. e.g. A => 1, B => 2, AA => 27.
 * @param { string } str The string to convert.
 * @returns { number } The converted number. 
 */
export function lettersToNumbers(str) {
    var base = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', i, j, result = 0;

    for (i = 0, j = str.length - 1; i < str.length; i += 1, j -= 1) {
        result += Math.pow(base.length, j) * (base.indexOf(str[i]) + 1);
    }

    return result;
}

/**
 * Convert the app row that contains the style and other properties of every cell to just the text value.
 */
function transformRowToDataGridRow(row) {
    const entries = Object.entries(row).map(([column, cellProps]) => {
        return cellProps ? [column, cellProps.v] : [column, cellProps]
    })

    return Object.fromEntries(entries)
}


/**
 * Convert the styles that was parsed by XLSX to the css used by react.
 * @param { Object } style The style that XLSX has parsed.
 * @param {{rgb?: string}} style.bgColor The background color of the cell.
 * @param {{rgb?:string}} style.fgColor The forground color of the cell.
 * @param {string} style.patternType The fill pattern. currently ignored.
 * @returns { React.CSSProperties } The converted css.
 */
function convertXlsxStyleToCss({ bgColor, fgColor, patternType }) {
    const firstOrUndefined = (val, second) => val ? second : undefined;

    return {
        backgroundColor: firstOrUndefined(bgColor?.rgb, `#${bgColor?.rgb}`),
        color: firstOrUndefined(fgColor?.rgb, `#${fgColor?.rgb}`)
    }
}

/**
 * The cell renderer.
 * @param { import("react-data-grid/").FormatterProps } props 
 */
function SpreadsheetCellFormatter(props) {

    const getBackgroundColor = (style) => {
        if (!style || !('bgColor' in style)) {
            return ''
        }

        return `#${style.bgColor.rgb}`
    }

    const ref = useRef(null)

    useEffect(() => {
        if (ref !== null) {
            const parent = ref.current.parentElement
            // Allow the background color to fill the cell.
            parent.style.padding = '0px 0px 0px 0px';
        }
    }, [ref])

    const cell = props.row[props.column.key]

    // HTML is disabled.
    const getContent = () => cell.h == undefined || true ?
        cell.v : <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(cell.h) }}></div>

    return (
        <div ref={ref} key={`key_${props.rowIdx}`}>
            <div style={{ backgroundColor: getBackgroundColor(cell.s), position: 'relative', zIndex: 100 }}>
                {
                    getContent()
                }

            </div>
        </div>
    )
}

/**
 * Create a single column.
 * @param { number } index The index of the column. 
 * @param { boolean | any } editable true if the column is editable, false otherwise.  
 * @returns 
 */
export function buildSingleColumn(index, editable) {
    editable = editable == true ? true : false;

    var item = {
        key: "col_" + index,
        name: numberToLetters(index + 1),
        editable: editable,
        resizeable: true,
        editor: SpreadsheetTextEditor,
        formatter: SpreadsheetCellFormatter,

    };

    return item;
}


/**
 * Create the columns array for the spreadsheet.
 * @param { number } length The amount of columns to build.
 * @returns { Array<{}> } The columns array.
 */
export function buildColumns(length) {
    var arr = new Array(), i = 0;

    arr.push({
        key: "row_number_counter",
        name: ""
    })

    while (++i < length) arr.push({})

    arr = arr.map((_, index) => {
        return buildSingleColumn(index, true)
    })

    return arr.reverse();
}

export function buildSingleRow(columns, row_number) {
    var obj = {}

    columns.forEach(col => {
        obj[col.key] = {
            v: undefined,
            s: {}
        }
    })

    return obj;
}

/**
 * Create the basic rows for the spreadsheet.
 * @param { number } length The amount of rows to create.
 * @param { Array<any> } columns The columns of the spreadsheet. Every cell is initilized with undefined.
 * @returns 
 */
export function buildRows(length, columns) {
    var arr = new Array();
    for (let i = 0; i < length; i++) {
        arr.push(buildSingleRow(columns, i))
    }
    return arr;
}


/**
 * Convert the rows read by readXlsxFile to rows that are supported by DataGrid.
 * @param { Array<Array<string | number | boolean | null>> } rows 
 * @param { Array<any> } columns The columns of the spreadsheet.
 */
export function convertArrays(rows, columns) {
    var newRows = new Array();

    rows.forEach((currentRow, rowNumber) => {
        var convertedRow = buildSingleRow(columns, rowNumber - 1)

        currentRow.forEach((cell, cellNumber) => {
            convertedRow[convertNumberToSpradsheetColumn(cellNumber)] = cell
        })

        newRows.push(convertedRow)
    })

    return newRows;
}

export function convertNumberToSpradsheetColumn(number) {
    return "col_" + number;
}