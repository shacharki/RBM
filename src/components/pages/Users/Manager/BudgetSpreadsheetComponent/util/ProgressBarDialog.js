import { DialogContent } from "@material-ui/core";
import { DialogActions } from "@material-ui/core";
import { Dialog } from "@material-ui/core";
import LinearProgress from '@material-ui/core/LinearProgress';


/**
 * Open progress bar dialog.
 * @param { Object } props The properties of the component.
 * @param { boolean } props.openStatus The status of the dialog.
 * @param { (v:boolean) => void } props.setOpenStatus The setter for props.openStatus.
 * @param { number } props.progress The progress of the dialog.
 */
function ProgressBarDialog({ openStatus, setOpenStatus, progress }) {
    return (
        <Dialog open={openStatus}>
            <DialogContent >
                <LinearProgress value={progress}></LinearProgress>
            </DialogContent>

            <DialogActions>
                <button
                    hidden={progress < 100}
                    onClick={() => {
                        setOpenStatus(false)
                    }}>סיים</button>
            </DialogActions>
        </Dialog>
    )
}

export default ProgressBarDialog;