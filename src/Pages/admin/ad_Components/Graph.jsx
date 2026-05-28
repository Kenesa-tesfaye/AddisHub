import { Chart as Chartjs, defaults } from 'chart.js/auto';
import { Radar, Doughnut, Line, Bar, Pie, PolarArea, Scatter, Bubble, } from 'react-chartjs-2';
import './graph.css'
import {  FaUsers } from "react-icons/fa";

function Graph() {
    return (
        <>
            <div className="garph-container">

                <div className="sing-garph">
                    <h1 className=''> <FaUsers fontSize='23px' color='#4F46E5'/>  Weekely active users</h1>

                    <Bar
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
                <div className="sing-garph">
                    <h1 className=''> <FaUsers fontSize='23px' color='#4F46E5'/>  Weekely active users</h1>

                    <Pie
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
                <div className="sing-garph">
                    <h1>Active Users</h1>

                    <Doughnut
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
        </>
    )
}
export default Graph;