import { useState } from 'react';
import DataGrid, { TextEditor } from 'react-data-grid';
import { buildSingleColumn, buildColumns, buildSingleRow, buildRows, convertArrays } from './SpreadsheetBuilders';
import readXlsxFile from 'read-excel-file'
import React from 'react';
import Spreadsheet from './Spreadsheet'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import SpreadsheetState from './SpreadsheetState';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import "./spreadsheetStyles.css"

//<Spreadsheet columns={columns} setColumns={setColumns} rows={rows} setRows={setRows} style={props.style}></Spreadsheet>

/**
 * Show the research budget spreadsheet and other options for handling the information.
 * @param {{ style?: React.CSSProperties }} props
 * @returns { JSX.Element }
 */
const BudgetSpreadsheet = (props) => {
    var columns = buildColumns(10);


    const [sheets, setSheets] = useState({
        default: new SpreadsheetState(columns, buildRows(3, columns)),
    })

    const [activeSheet, setActiveSheet] = useState(sheets.default)

    const [dialogOpenStatus, setDialogOpenStatus] = useState(false)
    const [dialogDownloadUrl, setDialogDownloadUrl] = useState("")

    const getXlsxFile = async (file) => {
        const sheetsList = await readXlsxFile(file, { getSheets: true })

        if (sheetsList == undefined) {
            return;
        }

        var newSheetsTabs = {}

        var sheetNumber = 0;
        for (var currentSheet of sheetsList) {
            var rows = await readXlsxFile(file, { sheet: sheetNumber + 1 })
            if (rows) {
                var convertedRows = convertArrays(rows, columns)

                newSheetsTabs[currentSheet.name] = new SpreadsheetState(columns, convertedRows);
            }

            sheetNumber++;
        }

        setSheets(newSheetsTabs)
        setActiveSheet(sheets[0])
    }

    return (
        <div style={props.style}>
            <Tabs onSelect={(index, last, event) => {
                const newActiveSheet = sheets[Object.keys(sheets)[index]];
                setActiveSheet(newActiveSheet)
            }}>
                <TabList>
                    {
                        Object.keys(sheets).map((key, keyIndex) => {
                            return <Tab key={"tabIndex_" + keyIndex}>{key}</Tab>
                        })
                    }

                </TabList>

                {
                    Object.keys(sheets).map((key, keyIndex) => {
                        /**
                         * @returns {SpreadsheetState}
                         */
                        const x = () => sheets[key];
                        const state = x();


                        return <TabPanel key={"tabPanelIndex_" + keyIndex}>
                            <Spreadsheet state={activeSheet}></Spreadsheet>
                        </TabPanel>
                    })
                }

            </Tabs>
            <input type="file" onChange={async (event) => {
                const file = event.target.files[0];
                await getXlsxFile(file)
            }} placeholder="Load Excel File"></input>
            <button onClick={() => {
                const [sheetState, setSheetState] = activeSheet;
                var clone = Object.assign(Object.create(Object.getPrototypeOf(sheetState)), sheetState)

                clone.columns = [buildSingleColumn(clone.columns.length, true), ...clone.columns]

                setSheetState(clone)
            }}>הוספת טור</button>

            <button onClick={() => {
                // setRowsCount(rows + 1)
                // setRows([...rows, buildSingleRow(columns)])
            }}>הוספת שורה</button>


            <button onClick={() => {
                setDialogOpenStatus(true)
            }}>טען גיליון מכתובת אתר</button>

            <Dialog open={dialogOpenStatus} onClose={() => setDialogOpenStatus(false)} >
                <DialogTitle id="get-sheet-url-dialog">הורדה לאקסל</DialogTitle>

                <DialogContent>
                    <DialogContentText>
                        הזן את כתובת האתר של הגיליון האלקטרוני להורדה
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="sheetUrl"
                        label="URL"
                        type="string"
                        fullWidth
                        onChange={(props) => setDialogDownloadUrl(props.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <button onClick={() => setDialogOpenStatus(false)} color="primary">
                        בטל
                    </button>
                    <button onClick={async () => {
                        const stream = (await (await fetch(dialogDownloadUrl)).blob()).stream()
                        await getXlsxFile(stream)
                    }} color="primary">
                        הורד
                    </button>
                </DialogActions>
            </Dialog>

        </div>

    );
}


export default BudgetSpreadsheet;