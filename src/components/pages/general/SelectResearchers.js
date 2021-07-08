import { useEffect, useState } from "react";
import getUsersLists from './../../../firebase/getAllUsers'
import { Checkbox, List, ListItem, ListItemIcon } from "@material-ui/core";
import { ListItemText } from "@material-ui/core";


/**
 * Create a select list that displayes all of the researchers.
 * @param { Object } props The props of the component 
 * @param { string } props.key The key of the component.
 * @param { (string[]) => undefined } props.selectedValueUpdated A callback that is called when the list of selected item has updated.
 */
function SelectResearchers({ key, selectedValueUpdated }) {

    const [researchersOptions, setResearchersOptions] = useState({})
    const [checked, setChecked] = useState([])

    const updateSelection = (value) => {
        const currentIndex = checked.indexOf(value);
        const newChecked = [...checked];

        if (currentIndex === -1) {
            newChecked.push(value);
        } else {
            newChecked.splice(currentIndex, 1);
        }

        setChecked(newChecked);

        selectedValueUpdated(newChecked)
    }

    useEffect(async () => {

        const options = (await getUsersLists()).map(doc => {
            return [
                `${doc.fname} ${doc.lname}`,
                doc.uid
            ]
        })

        setResearchersOptions(Object.fromEntries(options))
    })

    return (
        <List key={key}>
            {
                Object.keys(researchersOptions).map((label, index) => {
                    const value = researchersOptions[label]

                    return <ListItem key={`${value}_${index}`} dense button onClick={() => updateSelection(value)}>
                        <ListItemIcon>
                            <Checkbox
                                edge="start"
                                checked={checked.indexOf(value) !== -1}
                                tabIndex={-1}
                                disableRipple
                                inputProps={{ 'aria-labelledby': `input_${value}_${index}` }}
                            />
                        </ListItemIcon>

                        <ListItemText primary={label} />
                    </ListItem>
                })
            }
        </List>
    )
}

export default SelectResearchers;