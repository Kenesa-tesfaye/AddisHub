import { FaChevronCircleDown, FaEdit, FaEllipsisH, FaEye, FaHeart, FaInfoCircle, FaPen, FaPenAlt, FaPencilAlt, FaStreetView, FaTrash, FaUser } from "react-icons/fa";
import './dashboard.css'
import { Chart as Chartjs, defaults } from 'chart.js/auto';
import { Radar, Doughnut, Line, Bar, Pie, PolarArea, Scatter, Bubble, } from 'react-chartjs-2';

import main from '../../../assets/logo.png'

import Graph from "./Graph";

function Dashboard() {
    return (
        <>
            <div className="dash-board">
                <div className="quick-stat">
                    <div className="stats-card-container">
                        <div className="stats-card">
                            <p className="title-card">Total Users</p>
                            <h3 className="no-card">7889</h3>
                            <div className="bottom-card">

                                <h5 className="percent-card">24%</h5><p className="mon-card"> vs Last month</p>
                            </div>
                            <FaUser className="icon-card" />
                        </div>
                        <div className="stats-card">
                            <p className="title-card">Active Users</p>
                            <h3 className="no-card">5589</h3>
                            <div className="bottom-card">

                                <h5 className="percent-card">12%</h5><p className="mon-card"> vs Last 2 day</p>
                            </div>
                            <FaUser className="icon-card active" />
                        </div>
                        <div className="stats-card">
                            <p className="title-card">Total Like This Week</p>
                            <h3 className="no-card">23,340</h3>
                            <div className="bottom-card">

                                <h5 className="percent-card">24%</h5><p className="mon-card"> vs Last month</p>
                            </div>
                            <FaHeart className="icon-card heart" />
                        </div>
                        <div className="stats-card">
                            <p className="title-card">Total Views This Week</p>
                            <h3 className="no-card">100,000</h3>
                            <div className="bottom-card">

                                <h5 className="percent-card">24%</h5><p className="mon-card"> vs Lastmonth</p>
                            </div>
                            <FaStreetView className="icon-card view" />
                        </div>
                    </div>
                </div>
                <div className="main-stats">
                    <div className="users-stat">

                        <div className="new-users">
                            <h1>New Members</h1>
                            <div className="list-newusers">
                                <div className="singuser">
                                    <div className="img-user">
                                        <img src={main} alt="" />
                                    </div>
                                    <div className="info-users">
                                        <p className="user-title">Name</p>
                                        <p className="user-description">User</p>
                                    </div>
                                    <div className="actions">
                                        <p>
                                            <span>over view</span>
                                            <FaEye 
                                            fontSize='10px'
                                             color="#15493c"
                                             />
                                        </p>
                                    </div>
                                </div>

                                 <div className="singuser">
                                    <div className="img-user">
                                        <img src={main} alt="" />
                                    </div>
                                    <div className="info-users">
                                        <p className="user-title">Name</p>
                                        <p className="user-description">Admin</p>
                                    </div>
                                    <div className="actions">
                                        <p>
                                            <span>over view</span>
                                            <FaEye 
                                            fontSize='20px'
                                             color="#15493c"
                                             />
                                        </p>
                                    </div>
                                </div>
                                 <div className="singuser">
                                    <div className="img-user">
                                        <img src={main} alt="" />
                                    </div>
                                    <div className="info-users">
                                        <p className="user-title">Name</p>
                                        <p className="user-description">User</p>
                                    </div>
                                    <div className="actions">
                                        <p>
                                            <span>over view</span>
                                            <FaEye 
                                            fontSize='20px'
                                             color="#15493c"
                                             />
                                        </p>
                                    </div>
                                </div>
                                <div className="singuser">
                                    <div className="img-user">
                                        <img src={main} alt="" />
                                    </div>
                                    <div className="info-users">
                                        <p className="user-title">Name</p>
                                        <p className="user-description">User</p>
                                    </div>
                                    <div className="actions">
                                        <p>
                                            <span>over view</span>
                                            <FaEye 
                                            fontSize='20px'
                                             color="#15493c"
                                             />
                                        </p>
                                    </div>
                                </div>
                                <div className="singuser">
                                    <div className="img-user">
                                        <img src={main} alt="" />
                                    </div>
                                    <div className="info-users">
                                        <p className="user-title">Name</p>
                                        <p className="user-description">User</p>
                                    </div>
                                    <div className="actions">
                                        <p>
                                            <span>over view</span>
                                            <FaEye 
                                            fontSize='20px'
                                             color="#15493c"
                                             />
                                        </p>
                                    </div>
                                </div>
                                 <div className="singuser">
                                    <div className="img-user">
                                        <img src={main} alt="" />
                                    </div>
                                    <div className="info-users">
                                        <p className="user-title">Name</p>
                                        <p className="user-description">User</p>
                                    </div>
                                    <div className="actions">
                                        <p>
                                            <span>over view</span>
                                            <FaEye 
                                            fontSize='20px'
                                             color="#15493c"
                                             />
                                        </p>
                                    </div>
                                </div>
                                <div className="singuser">
                                    <div className="img-user">
                                        <img src={main} alt="" />
                                    </div>
                                    <div className="info-users">
                                        <p className="user-title">Name</p>
                                        <p className="user-description">User</p>
                                    </div>
                                    <div className="actions">
                                        <p>
                                            <span>over view</span>
                                            <FaEye 
                                            fontSize='20px'
                                             color="#15493c"
                                             />
                                        </p>
                                    </div>
                                </div>
                                <div className="singuser">
                                    <div className="img-user">
                                        <img src={main} alt="" />
                                    </div>
                                    <div className="info-users">
                                        <p className="user-title">Name</p>
                                        <p className="user-description">User</p>
                                    </div>
                                    <div className="actions">
                                        <p>
                                            <span>over view</span>
                                            <FaEye 
                                            fontSize='20px'
                                             color="#15493c"
                                             />
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="side-garph">
                            <Line
                                                    options={{
                                                        responsive: true,
                                                        maintainAspectRatio: false
                                                    }}
                                                    data={
                                                        {
                                                            labels: ['Mon', 'Thu', 'Wen', 'Thr', 'Fri', 'Sat', 'Sun'],
                                                            datasets: [
                                                                {
                                                                    label: 'Active Users',
                                                                    data: [52, 68, 74, 81, 77, 63, 58],
                                                                    borderColor: '#161616',
                                                                    backgroundColor: 'rgba(79, 70, 229, 0.25)',
                                                                    tension: 0.4,
                                                                    pointRadius: 4,
                                                                    pointBackgroundColor: '#4F46E5',
                                                                }
                                                            ]
                                                        }
                                                    }
                                                />
                        </div>
                    </div>
                    <div className="graph">
                        <Graph />
                    </div>
                </div>
            </div>
        </>
    )
}
export default Dashboard;