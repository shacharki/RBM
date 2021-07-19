import { useEffect, useState } from "react";
import { auth, db } from "../../../../../firebase/firebase";
import DisplayPurchaseRequests from "../../Manager/ManagerRequestPurchase/DisplayPurchaseRequests";
import "./ManagerRequestPurchase.css"

/**
 * Get all of the request purchase of specific user.
 * @param { import("firebase").default.User; } user The user to get the requests from.
 * @returns { Promise<Array<any>> }
 */
async function getAllPurchaseRequests(user) {
    const query = await db.collection("researcher")
        .doc(user.uid)
        .collection("request")
        .get()

    const userDoc = await db.collection("researcher").doc(user.uid).get()
    const team = await userDoc.data().team.get()


    return query.docs.map(async doc => {
        const teamDocument = await team.collection("Requests").doc(doc.id)

        return [{ requestId: doc.id, ...doc.data() }, teamDocument]
    })
}

/**
 * The page for managing the request purchases.
 * @param { Object } props The props of the component. 
 */
function ManageRequestPurchase({ }) {

    const [purchasesList, setPurchasesList] = useState([])

    useEffect(() => {
        auth.onAuthStateChanged(async user => {
            if (user) {
                const purchases = await getAllPurchaseRequests(user)
                setPurchasesList(purchases)
            }
        })
    }, [])

    return (
        <div className="sec-design">
            <h1>This is the manage request purchase page</h1>


            <div className="request-purchases-container">
                {
                    purchasesList.map(([request, requestDataDocument]) => {
                        const { requestId, form } = request
                        const key = `request-purchases-item_${requestId}`

                        return <div key={key}>
                            <DisplayPurchaseRequests form={requestDataDocument} requests={form} />
                        </div>
                    })
                }
            </div>
        </div>

    )
}


export default ManageRequestPurchase;