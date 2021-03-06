import { DialogContent, TextField } from "@material-ui/core";
import { DialogActions } from "@material-ui/core";
import { DialogContentText } from "@material-ui/core";
import { Dialog } from "@material-ui/core";
import { useState } from "react";
import SelectResearchers from './../../../general/SelectResearchers'

/**
 * Open the dialog for exporting the data.
 * @param { Object } props The props of the component.
 * @param { boolean } props.dialogStatus true if the dialog is open, false otherwise.
 * @param { (v:boolean) => void } props.setDialogStatus The setter for the dialog status.
 * @param { (filename:string, selectedResearchers: Array<string> | undefined) => void } props.onSubmit Callback function that will be called when the export button is clicked.
 * @param { string } props.dialogContentText The text to display.
 * @param { boolean } props.showResearchersSelection true if the <SelectResearchers/> Should be displayed, false otherwise.
 */
const GetFilenameDialog = ({ dialogStatus, setDialogStatus, onSubmit, dialogContentText, showResearchersSelection }) => {
    const defaultValue = 'excel.xlsx'
    const [filename, setFilename] = useState(defaultValue)

    const [selectedResearchers, setSelectedResearchers] = useState([])

    return <Dialog open={dialogStatus} style={{ height: '1000px' }}>
        <DialogContent>
            <DialogContentText> {dialogContentText} </DialogContentText>

            <TextField
                autoFocus
                margin="dense"
                id="fileName"
                label="שם הקובץ"
                type="string"
                fullWidth
                defaultValue={filename}
                onChange={(e) => setFilename(e.target.value)}
            />

            {
                showResearchersSelection ? <SelectResearchers selectedValueUpdated={selected => { console.log(selected);setSelectedResearchers(selected) }} /> : null
            }

        </DialogContent>

        <DialogActions>
            <button onClick={() => {
                setFilename(defaultValue)
                setDialogStatus(false)
            }}>Cancel</button>

            <button color={"primary"} onClick={() => {

                if (filename) {
                    setDialogStatus(false)
                    onSubmit(filename, showResearchersSelection ? selectedResearchers : undefined)
                }

            }}>Ok</button>
        </DialogActions>
    </Dialog>
}

export default GetFilenameDialog;