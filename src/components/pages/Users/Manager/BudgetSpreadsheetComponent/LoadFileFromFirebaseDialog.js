import { Card, Dialog, DialogActions, DialogContent } from '@material-ui/core'
import { useEffect, useState } from 'react';
import { auth, db } from '../../../../../firebase/firebase';
import "./spreadsheetStyles.css"


async function getFilesList() {
    const query = await db.collection('researchBudgets').where('user', '==', auth.currentUser.uid).get()
    const result = query.docs.map(snapshot => {
        var obj = snapshot.data();
        obj.docId = snapshot.id;

        return obj;
    }).map(doc => {
        doc.uploadDate = new Date(doc.uploadDate.seconds)
        return doc;
    })

    return result;
}

function FileListItem({ displayName, url, user, uploadDate, isActiveFile, onClick }) {
    return <Card onClick={onClick} style={{ backgroundColor: isActiveFile ? 'rgba(0, 255, 255, 0.3)' : 'white' }} className="file-list-item-container">
        <div className="file-list-item">
            <h1>{displayName}</h1>
            <p className="ml-55 mr-55">{uploadDate.toJSON().substr(0, 10)}</p>
        </div>
    </Card>
}

/**
 * Display the list of all of the files the user has and select one of them.
 * @param { Object } props The props of the component.
 * @param { boolean } props.open The open status of the dialog.
 * @param { () => void } props.onCancel Callback that is called when the cancel button is clicked.. 
 * @param { (url: string, displayName: string) => void } props.onFileSelected Callback function that is called when the user has selected a file.
 */
function LoadFileFromFirebaseDialog({ open, onCancel, onFileSelected, onFilesListLoaded }) {
    const [filesList, setFilesList] = useState([])
    const [activeFile, setActiveFile] = useState({})

    useEffect(async () => {
        setFilesList(await getFilesList())
    }, [])

    return (
        <div className="load-sheet-from-firebase-dialog">
            <Dialog open={open} fullWidth maxWidth="xl">
                <DialogContent>
                    {
                        filesList.map((file, index) => <FileListItem key={`FileList_Item_${index}`} {...file} isActiveFile={file.docId == activeFile.docId} onClick={() => setActiveFile(file)} />)
                    }
                </DialogContent>
                <DialogActions>
                    <button onClick={() => onCancel()}>בטל</button>
                    <button onClick={() => {
                        onFileSelected(activeFile.fileUrl, activeFile.displayName)
                    }}>טען</button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default LoadFileFromFirebaseDialog;