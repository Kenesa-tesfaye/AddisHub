import Sidebar from "./sidebar";
import Topbar from "./Topbar";
import './sidebar.css'
import Dashboard from "./ad_Components/Dashboard";
import { useState } from "react";
function Admin() {

    const[ activemain, setactivemain] = useState(<Dashboard/>)

    function activater(pages){
        setactivemain(pages)
    }

    return (
        <><div className="main-admin">

            <div className="side-bar">
                <Sidebar activater={activater}/>
            </div>
            <div className="notfication-main">
                <Topbar />
                {activemain}
            </div>
        </div>
        </>
    )
}

export default Admin;