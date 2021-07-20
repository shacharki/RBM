import { useState, useRef, useEffect } from 'react';
import { buildColumns, buildSingleRow, buildRows, convertArrays, lettersToNumbers, convertNumberToSpradsheetColumn } from './SpreadsheetBuilders';
import React from 'react';
import Spreadsheet from './Spreadsheet'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import SpreadsheetState from './SpreadsheetState';
import "./spreadsheetStyles.css"
import Spinner from '../../../Spinner'
import XLSX from 'xlsx';
import { parseSpreadsheetCellPosition } from './EvaluateCellNode';
import GetFilenameDialog from './ExportDataDialog';
import saveByteArray from './util/saveFile';
import { auth, db, storage } from '../.../../../../../../firebase/firebase'
import firebase from 'firebase/app'
import LoadFileFromFirebaseDialog from './LoadFileFromFirebaseDialog';
import { NotificationManager } from 'react-notifications';
import inferUserTypeFromUrl from '../.../../../../../../firebase/inferUserTypeFromUrl'
import SelectResearchers from './../../../general/SelectResearchers'
import sendBudgetUpdatedMails from '../../../../../emailjs/sendBudgetUpdatedMails';
import ManageBudgetDialog from './util/ManageBudgetsDialog';

/**
 * Split the sheet ref to 2 points. Sheet ref = '<COL><ROW>:<COL><ROW>'. e.g. A23, O40, etc.
 * @param { string } sheetRef
 * @returns { start: {cols: number, rows: number}, end:{ cols:number, rows:number } } 
 */
function parseSheetRef(sheetRef) {
    const [startStr, endStr] = sheetRef.split(':')

    const [startStrCol, startStrRow] = parseSpreadsheetCellPosition(startStr)
    const [endStrCol, endStrRow] = parseSpreadsheetCellPosition(endStr)

    return {
        start: {
            cols: lettersToNumbers(startStrCol),
            rows: startStrRow
        },
        end: {
            cols: lettersToNumbers(endStrCol),
            rows: endStrRow
        }
    }
}

/**
 * Convert the data that xlsx has provided to data the GridData can understand.
 * @param { {[index:key]: any} } sheet The sheet of data. 
 * @param { Array<any> } rows The rows to store the data in.
 * @returns { Array<any> } Return the rows paramater that was given.
 */
function xlsxRowsToGridRows(sheet, rows) {
    Object.keys(sheet).forEach(key => {
        const [colStr, row] = parseSpreadsheetCellPosition(key)
        const columnNumber = lettersToNumbers(colStr)

        // Check for parse errors. The column number must be higher then 0.
        if ((typeof (columnNumber) == 'number' && typeof (row) == 'number') && columnNumber >= 0 && row > 0) {
            const cellValue = sheet[key]

            rows[row - 1][convertNumberToSpradsheetColumn(columnNumber - 1)] = cellValue;
        }
    })

    return rows;
}

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

    const [spinnerState, setSpinnerState] = useState({
        text: '',
        show: false
    })

    const [canViewBudget, setCanViewBudget] = useState([])
    const [exportDialogStatus, setExportDialogStatus] = useState(false)
    const [uploadFileDialog, setUploadFileDialog] = useState(false)
    const [loadFileFromFirebaseDialog, setLoadFileFromFirebase] = useState(false)
    const [manageBudgetsDialogStatus, setManageBudgetDialogStatus] = useState(false)

    const [firestorageData, setFirestorageData] = useState({ fileUrl: '', used: false, docId: '' })
    const [filenameHeader, setFilenameHeader] = useState("excel.xlsx")

    const userType = inferUserTypeFromUrl();

    const dataToArrayBuffer = () => {
        var workbook = XLSX.utils.book_new()

        Object.keys(sheets).forEach(key => {
            var rows = sheets[key].rows

            // Re-reverse the column order for the excel.
            rows = rows.map(singleRow => Object.fromEntries(Object.entries(singleRow).reverse()))

            workbook.Sheets[key] = XLSX.utils.json_to_sheet(rows, { skipHeader: true })
        })

        workbook.SheetNames = Object.keys(sheets)

        const excelData = XLSX.write(workbook, { type: 'array', bookType: 'xlsx', cellStyles: true })

        return { buffer: excelData, workbook: workbook }
    }

    useEffect(() => {
        if (userType === 'Manager') return;

        return auth.onAuthStateChanged(async user => {
            if (!user) {
                return NotificationManager.error("בבקשה התחבר למערכת על מנת להמשיך")
            }
            const sheets = await db.collection('researchBudgets')
                .where('canView', 'array-contains', auth.currentUser.uid)
                .get()

            if (sheets.docs.length !== 0) {
                const file = sheets.docs[0].data()
                const filePath = file.fileUrl
                const filename = file.displayName;

                const ref = storage.ref('researchBudgets').child(filePath)
                const downloadUrl = await ref.getDownloadURL()

                setSpinnerState({ show: false, text: 'מוריד את התקציב...' })
                const response = await (await fetch(downloadUrl)).arrayBuffer()

                await getXlsxFile(response)

                setSpinnerState({ show: false, text: '' })

                setFirestorageData({ fileUrl: filePath, used: true })

                setFilenameHeader(filename)
                return NotificationManager.success('התקציב נטען בהצלחה');
            }

            NotificationManager.error('לא נמצא תקציב מחקר במערכת. פנה למנהל להוסיף תקציב.')

        })
    }, [])

    /**
     * Read the excel file and update the state of the component.
     * @param { ArrayBuffer } arrBuffer The buffer to parse.
     */
    const getXlsxFile = async (arrBuffer) => {
        const workbook = XLSX.read(arrBuffer, { type: 'array', cellStyles: true })

        const sheets = workbook.Sheets;

        var newSheetsTabs = {}

        Object.keys(sheets).forEach((sheetName) => {
            const sheet = sheets[sheetName]
            const sheetRef = sheet['!ref']

            const sheetWidthHeight = parseSheetRef(sheetRef)

            const sheetColumns = buildColumns(sheetWidthHeight.end.cols);

            var sheetRows = buildRows(sheetWidthHeight.end.rows, sheetColumns)

            var copy = { ...sheet }
            delete copy['!margins']
            delete copy['!ref']
            delete copy['!merges']
            delete copy['!autofilter']
            delete copy['!protect']
            sheetRows = xlsxRowsToGridRows(copy, sheetRows)

            newSheetsTabs[sheetName] = new SpreadsheetState(sheetColumns, sheetRows)
        })

        setSheets(newSheetsTabs)
        setActiveSheet(sheets[0])
    }

    return (
        <div style={props.style}>
            <h1>{filenameHeader}</h1>
            <Tabs defaultIndex={1} onSelect={(index, last, event) => {
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
                    Object.keys(sheets)
                        .map((key, keyIndex) => {
                            const state = sheets[key];
                            return <TabPanel key={"tabPanelIndex_" + keyIndex}>
                                <Spreadsheet state={activeSheet}></Spreadsheet>
                            </TabPanel>
                        })
                }
            </Tabs>

            <input type="file" onChange={async (event) => {
                const file = event.target.files[0];

                if (file === undefined) return;

                setSpinnerState({
                    text: "טוענים קובץ...",
                    show: true
                })

                await getXlsxFile(await file.arrayBuffer()).catch(err => {
                    console.log(err)
                    alert("אי אפשר לטעון קובץ.")
                });

                setSpinnerState({
                    text: "",
                    show: false
                })

                setFilenameHeader(file.name)
            }} placeholder="Load Excel File"></input>


            <button onClick={() => {
                setExportDialogStatus(true)
            }}>הורד קובץ למחשב</button>

            <button hidden={userType === "Researcher" } onClick={() => {
                // If the file wasnt originated from firebase, upload the file to firebase.
                if(firestorageData.used === false) {
                    return setUploadFileDialog(true);
                }

                setSpinnerState({ text: 'מעדכנים את התקציב...', show: true })

                const { buffer } = dataToArrayBuffer()
                const storageRef = storage.ref('researchBudgets')

                const uploadTask = storageRef.child(firestorageData.fileUrl).put(buffer)

                uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
                    () => undefined,
                    (err) => {
                        setSpinnerState({ text: '', show: false })
                        NotificationManager.error(err.message)
                        console.log(err)
                    },
                    async () => {
                        NotificationManager.success("התקציב עודכן")

                        setSpinnerState({ text: '...מעדכנים את החוקרים', show: true })

                        await sendBudgetUpdatedMails(canViewBudget, auth.currentUser.email, filenameHeader)
                        setSpinnerState({ text: '', show: false })
                    })
            }}>
                עדכן קובץ
            </button>


            <button hidden={userType == 'Researcher'} onClick={() => setLoadFileFromFirebase(true)}>
                טען קובץ מהענן
            </button>
            <button hidden={userType == 'Researcher'} onClick={() => setManageBudgetDialogStatus(true)}>נהל תקציבים</button>
            <GetFilenameDialog
                dialogStatus={exportDialogStatus}
                setDialogStatus={(v) => setExportDialogStatus(v)}
                dialogContentText={"הכנס את השם של הקובץ להורדה"}
                onSubmit={(filename) => {
                    setFilenameHeader(filename)
                    const { buffer } = dataToArrayBuffer()
                    saveByteArray([buffer], filename)
                }} />

            {
                /**
                 * Upload file to firebase dialog.
                 */
            }
            <GetFilenameDialog
                dialogStatus={uploadFileDialog}
                setDialogStatus={(v) => setUploadFileDialog(v)}
                dialogContentText={".הכנס את השם של הקובץ"}
                showResearchersSelection
                onSubmit={(filename, researchersUids) => {
                    const { buffer } = dataToArrayBuffer()
                    const storageRef = storage.ref('researchBudgets')

                    const uploadDate = new Date();
                    const childPath = `/${uploadDate.toJSON()}_${auth.currentUser.uid}_ResearchBudget.xlsx`

                    const uploadTask = storageRef
                        .child(childPath)
                        .put(buffer, { customMetadata: { uploader: auth.currentUser.uid } })

                    const getSpinnerText = (progress) => `${progress}...מעלה קובץ`
                    setSpinnerState({ text: getSpinnerText(0), show: true })

                    setCanViewBudget(researchersUids)

                    uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
                        (snapshot) => {
                            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                            setSpinnerState({ text: getSpinnerText(progress), show: true })
                        },
                        (err) => {
                            setSpinnerState({ text: '', show: false })
                            alert(`An error occured ${err.code}, ${err.message}`)
                        },
                        async () => {
                            setSpinnerState({ text: '...מעדכנים את הנתונים', show: true })

                            await db.collection('researchBudgets').add({
                                user: auth.currentUser.uid,
                                fileUrl: childPath,
                                uploadDate: uploadDate,
                                displayName: filename,
                                canView: researchersUids
                            })

                            setSpinnerState({ text: '', show: false })
                            setFilenameHeader(filename)

                            setSpinnerState({ text: '...מעדכנים את החוקרים', show: true })
                            await sendBudgetUpdatedMails(canViewBudget, auth.currentUser.email, filenameHeader)
                            setSpinnerState({ text: '', show: false })
                        })
                }} />

            {
                /**
                 * Load file from firebase dialog.
                 */
            }
            <LoadFileFromFirebaseDialog
                open={loadFileFromFirebaseDialog}
                onCancel={() => setLoadFileFromFirebase(false)}
                onFileSelected={async (file) => {
                    const { fileUrl, docId, canView, displayName } = file;
                    setLoadFileFromFirebase(false)


                    setSpinnerState({ text: `${displayName} טוען קובץ`, show: true })
                    const ref = storage.ref('researchBudgets').child(fileUrl)
                    const downloadUrl = await ref.getDownloadURL()

                    const response = await (await fetch(downloadUrl)).arrayBuffer()

                    await getXlsxFile(response)

                    setSpinnerState({ text: '', show: false })
                    setFirestorageData({ fileUrl: fileUrl, used: true, docId: docId })
                    setFilenameHeader(displayName)
                    setCanViewBudget(canView)
                }} />

            <ManageBudgetDialog
                open={manageBudgetsDialogStatus}
                setOpen={(value) => setManageBudgetDialogStatus(value)}
                onNoBudgets={() => {
                    NotificationManager.error("לא נמצאו תקציבים")
                    setManageBudgetDialogStatus(false)
                }}
                onCancel={() => setManageBudgetDialogStatus(false)}
                onAction={async (budget) => {
                    setSpinnerState({ show: true, text: 'מעדכנים נתונים' })

                    const ref = db.collection('researchBudgets').doc(budget.budgetUid)

                    try {
                        await ref.update({ canView: budget.canViewUids, displayName: budget.displayName, })
                    } catch (error) {
                        NotificationManager.error("אי אפשר היה לעדכן את הנתונים")
                        return console.log(error)
                    }

                    setSpinnerState({ show: false, text: 'מעדכנים נתונים' })

                    NotificationManager.success("התקציב עודכן בהצלחה")
                }}

                onBudgetDelete={async uid => {
                    if (window.confirm("למחוק את התקציב שנבחר?")) {
                        const budget = await db.collection("researchBudgets").doc(uid).get()

                        setSpinnerState({ text: 'מוחקים קובץ מהענן', show: true })
                        await storage.refFromURL(budget.data().fileUrl).delete()

                        await db.collection('researchBudgets')
                            .doc(uid)
                            .delete()
                            .catch(err => {
                                NotificationManager.error("חלה בעיה. התקציב לא נמחק")
                                console.log(err)
                            })

                        setManageBudgetDialogStatus(false)

                        setSpinnerState({ show: false })
                        return NotificationManager.success("התקציב נמחק בהצלחה")
                    }

                    NotificationManager.error("התקציב לא נמחק")
                }} />
            <Spinner {...spinnerState} ></Spinner>
        </div>

    );
}


export default BudgetSpreadsheet;