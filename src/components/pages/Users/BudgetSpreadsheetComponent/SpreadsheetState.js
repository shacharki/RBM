import React from "react";
import "./spreadsheetStyles.css"


class SpreadsheetState {
    columns;
    rows;
    style;
    preRendererComputation;

    /**
     * Store the state of a spreadsheet.
     * @param { Array<Columns<any>> } columns The columns of the spreadsheet. 
     * @param { Array<any> } rows The rows of the spreadsheet.
     * @param { PreRenderComputation} preRendererComputation The list of computation to do before every render.
     * @param { React.CSSProperties } style Optional styling parameter.
     * @param { {colNumber, rowNumber} } activeCellPos The position of the active cell.
     */
    constructor(columns, rows, preRendererComputation, style, activeCellPos) {
        this.columns = columns;
        this.rows = rows;
        this.style = style;
        this.activeCellPos = activeCellPos
    }

}

export default SpreadsheetState;