import { Card, Dialog, DialogActions, DialogContent } from '@material-ui/core'
import { useEffect, useState } from 'react';
import { auth, db, getManagerData } from '../../../../../firebase/firebase';
import "./spreadsheetStyles.css"


async function getFilesList() {
    const query = await db.collection('researchBudgets')
        .get()


    const result = query.docs.map(async snapshot => {
        var data = snapshot.data();
        data.docId = snapshot.id;
        
        data.user = await getManagerData(data.user)

        data.uploadDate = new Date(data.uploadDate.seconds * 1000)
        return data;
    })


    return Promise.all(result);
}

function FileListItem({ displayName, url, user, uploadDate, isActiveFile, onClick }) {
    return <Card onClick={onClick} style={{ backgroundColor: isActiveFile ? 'rgba(0, 255, 255, 0.2)' : 'white' }} className="file-list-item">
        <h1 className="budget-name">{displayName}</h1>
        <p className="creation-date">{uploadDate.toJSON().substr(0, 10)}</p>
        <p className="creator-text">{`${user.fname} ${user.lname}`}</p>
    </Card>
}

/**
 * Display the list of all of the files the user has and select one of them.
 * @param { Object } props The props of the component.
 * @param { boolean } props.open The open status of the dialog.
 * @param { () => void } props.onCancel Callback that is called when the cancel button is clicked.. 
 * @param { ({url: string, displayName: string, docId}) => void } props.onFileSelected Callback function that is called when the user has selected a file.
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
                    <div className="budget-files-list">
                        {
                            filesList.map((file, index) => (
                                <div className="file-list-item-container">
                                    <h1 className="index-text">{index}</h1>
                                    <FileListItem key={`FileList_Item_${index}`} {...file} isActiveFile={file.docId == activeFile.docId} onClick={() => setActiveFile(file)} />
                                </div>
                            ))
                        }
                    </div>
                </DialogContent>
                <DialogActions>
                    <button onClick={() => onCancel()}>בטל</button>
                    <button onClick={() => {
                        onFileSelected(activeFile)
                    }}>טען</button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default LoadFileFromFirebaseDialog;