import main from '../../assets/main.png'
import './sidebar.css'
import { FaBars, FaBell, FaCog, FaSearch } from 'react-icons/fa';
import {FiSettings} from 'react-icons/fi'

function Topbar() {
    return (
        <>
            <div className="admin">
                <div className="bar" >
                    <FaBars color='#d1cccc' fontSize='25px' />
                    <p>Wellcome <span>kevin</span></p>
                </div>
                <div className="search-any">
                    <FaSearch color='#fff' />
                    <input type="text" placeholder='Search Anything' />
                </div>
                <div className="basic-set">
                    <FaBell color='#fff' fontSize='20px'/>
                    <FiSettings color='#ccc5c5' fontSize='20px'/>
                </div>

                <div className="profole-admin">
                    <img src={main} alt="" />
                </div>
            </div>
        </>
    )
}
export default Topbar;