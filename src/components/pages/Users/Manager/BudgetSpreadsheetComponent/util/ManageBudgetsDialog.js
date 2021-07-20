import { Dialog, DialogActions, DialogContent, DialogTitle } from "@material-ui/core";
import { useEffect, useState } from "react";
import { auth, db, getManagerData } from "../../../../../../firebase/firebase";
import SelectResearchers from "../../../../general/SelectResearchers";
import "./manageBudgetsDialog.css"

/**
 * Display the dialog for managing 
 * @param { Object } props The props of the dialog.
 * @param { string } props.open The open status of the dialog.
 * @param { (value: string) => void } props.setOpen The setter for props.open.
 * @param { (param: {canViewUids: string[], displayName: string, budgetUid: string}) => void } props.onAction Callback that is called when a budget has been updated.
 * @param { () => void } props.onNoBudgets Callback that is called if the user has no budget under his name.
 * @param { () => void } props.onCancel Callback that is called when the cancel button has clicked.
 * @param { (uid: string )} props.onBudgetDelete The uid of the budget to delete.
 */
function ManageBudgetDialog({ open, onAction, onNoBudgets, onCancel, onBudgetDelete }) {

    const [budgetsList, setBudgetsList] = useState([])

    useEffect(() => {
        async function fetchBudgets() {
            const query = await db.collection('researchBudgets')
                .get()

            const mergedDocs = query.docs.map(doc => {
                var data = doc.data()
                data.budgetUid = doc.id;
                return data;
            }).map(async doc => {
                doc.user = await getManagerData(doc.user)
                return doc;
            })


            setBudgetsList(await Promise.all(mergedDocs))

            if (query.docs.length == 0 && typeof (onNoBudgets) == "function") {
                onNoBudgets()
            }
        }

        fetchBudgets()
    }, [])

    return <Dialog open={open} fullWidth maxWidth="lg">
        <DialogTitle style={{ textAlign: 'right' }}>נהל את התקציבים</DialogTitle>

        <DialogContent>
            <div className="budgets-list-container">
                {
                    budgetsList.map((doc, index) => {
                        const { canView, displayName, fileUrl, uploadDate, budgetUid, user } = doc;
                        const uploadJsDate = new Date(uploadDate.seconds * 1000).toISOString().split("T")[0]

                        return <div className="budget-list-item">
                            <h1>{displayName} <span>{uploadJsDate}</span></h1>
                            <div className="can-view">
                                <h2 style={{textAlign: 'right'}}>הרשאות חוקרים</h2>
                                <SelectResearchers initialSelectedResearchers={canView} selectedValueUpdated={(uids) => {
                                    const budgetsCopy = Array.from(budgetsList)
                                    budgetsCopy[index].canView = uids;
                                    setBudgetsList(budgetsCopy)
                                }} />
                            </div>

                            <input id="update-budget-list-item" className="name-input form-control" placeholder="הכנס שם חדש" value={displayName} onChange={(event) => {
                                const budgetsCopy = Array.from(budgetsList)
                                budgetsCopy[index].displayName = event.target.value
                                setBudgetsList(budgetsCopy)
                            }} />
                            <label>הכנס שם חדש</label>


                            <button className="update-btn" onClick={() => {
                                if (typeof (onAction) === 'function') {
                                    onAction({ canViewUids: canView, budgetUid: budgetUid, displayName: displayName })
                                }
                            }}>עדכן</button>

                            <button className="delete-btn" onClick={() => onBudgetDelete(budgetUid)}>מחק</button>

                            <div className="creator" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span></span>
                                <h3>{`נוצר על ידי ${user.fname} ${user.lname}`}</h3>
                            </div>

                            <div className="sperator"></div>
                        </div>
                    })
                }
            </div>
        </DialogContent>
        <DialogActions>
            <button className="cancel-btn" onClick={() => onCancel()}>בטל</button>
        </DialogActions>

    </Dialog>
}

export default ManageBudgetDialog;