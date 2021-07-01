import { ClipLoader } from 'react-spinners';


const Spinner = ({ show, text }) => (<div> {!show ? "" :
    <div id='fr'>
        {text}
        <div className="sweet-loading">
            <ClipLoader style={{
                backgroundColor: "rgba(255,255,255,0.85)",
                borderRadius: "25px"
            }}
                size={120}
                color={"#123abc"}

            />
        </div>
    </div>
}</div>)

export default Spinner;