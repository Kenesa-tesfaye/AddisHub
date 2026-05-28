import logo from '../../assets/logo.png'
import { FaAngleDown, FaAngleUp, FaArrowsAlt, FaCalendarAlt, FaCity, FaSquare, FaUsers } from 'react-icons/fa'
import home from '../../assets/home.png'
import { MdAdminPanelSettings, MdAnalytics, MdDashboard, MdEvent } from 'react-icons/md'
import './sidebar.css'
import Topbar from './Topbar'
import { useState } from 'react'
import Usersadmin from './main-pages-admin/Usersadmin'
import Dashboard from './ad_Components/Dashboard'
import Resourcesadmin from './main-pages-admin/Resourcesadmin'
import Createresources from './main-pages-admin/Createresources'
import Analyticsres from './main-pages-admin/Analyticsres'
import Analyticseve from './main-pages-admin/Analyticseve'
import FullDarkDataGrid from './main-pages-admin/FullDarkDataGrid'
import Analyticsuse from './main-pages-admin/Analyticsuse'

function Sidebar({ activater }) {

    const[rdrop,setrdrop]= useState(false)
    const[edrop,setedrop]= useState(false)
    const[adrop,setadrop]= useState(false)
    const dropdown =(dr)=>{
        if(dr == 'ev' && edrop == false){
            setedrop(true);
            setrdrop(false)
            setadrop(false)
        }
        else if(dr == 'r' && rdrop == false){
            setrdrop(true)
            setedrop(false)
            setadrop(false)
        }
        else if(dr == 'a' && adrop == false){
            setrdrop(false)
            setedrop(false)
            setadrop(true)
        }
        else if(dr == 'r' && rdrop == true){
            setrdrop(false)
        }
         else if(dr == 'a' && adrop == true){
            setadrop(false)
        }
        else if(dr == 'ev' && edrop == true){
            setedrop(false);
        }
    }




    return (
        <>
            <div className="sidebar-container">
                <div className="opener">

                </div>
                <div className="logo-ad">
                    <img src={logo} alt="" />
                </div>
                <ul>
                    <li onClick={()=> activater(<Dashboard/>)}>
                        <div className="main-li" >
                            <MdDashboard className='ico' />

                            <p>Dashboard</p>
                        </div>
                    </li>
                    <li>
                        <div className="main-li" onClick={()=> activater(<FullDarkDataGrid/>)}>
                            <FaUsers className='ico' />
                            <p>users</p>
                        </div>
                    </li>
                    <li>
                        <div className="main-li">
                            <FaCity className='ico' />
                            <p>Resources</p>
                            {
                                rdrop?
                                (<FaAngleUp className='ico-d' onClick={()=>{dropdown('r')}}/>):
                                (<FaAngleDown className='ico-d' onClick={()=>{dropdown('r')}}/>)

                            }
                        </div>
                        <div className={`lists ${rdrop && 'active'} `}>
                            <p onClick={()=>activater(<Createresources/>)} >Create Resource</p>
                            <p onClick={()=>activater(<Resourcesadmin/>)} >Resources List</p>
                        </div>
                    </li>
                    <li>
                        <div className="main-li">
                            <MdEvent className='ico' />
                            <p>Events</p>
                            {
                                edrop?
                                (<FaAngleUp className='ico-d' onClick={()=>{dropdown('ev')}}/>):
                                (<FaAngleDown className='ico-d' onClick={()=>{dropdown('ev')}}/>)

                            }
                        </div>
                        <div className={`lists ${edrop && 'active'} `}>
                            <p>Create event</p>
                            <p>publish Events</p>
                            <p>Event lists</p>
                        </div>
                    </li>
                    <li>
                        <div className="main-li">
                            <MdAnalytics className='ico' />
                            <p>Analytics</p>
                            {
                                adrop?
                                (<FaAngleUp className='ico-d' onClick={()=>{dropdown('a')}}/>):
                                (<FaAngleDown className='ico-d' onClick={()=>{dropdown('a')}}/>)

                            }
                        </div>
                        <div className={`lists ${adrop && 'active'} `}>
                            <p onClick={()=> activater(<Analyticsres/>)}>Resources Analytics</p>
                            <p onClick={()=>activater(<Analyticseve/>)}>Event Analytics </p>
                            <p onClick={()=>activater(<Analyticsuse/>)}>user Analytics</p>
                        </div>

                    </li>
                    <li>
                        <div className="main-li">
                            <MdAdminPanelSettings className='ico' />

                            <p>Admin</p>
                        </div>
                        <div className="lists">
                            <p>add admin</p>
                            <p>user to admin</p>
                            <p>admins</p>
                        </div>

                    </li>

                </ul>

            </div>
            
        </>
    )
}
export default Sidebar;