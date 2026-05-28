import { Bar, Doughnut, Line } from "react-chartjs-2";
import { Chart as Chartjs, defaults } from 'chart.js/auto';


function Analyticsuse() {
    return (
        <>
        <div className="analytics-resources-conatiner">
                        <h1 className="analytics-title">User- analytics</h1>
                        <div className="con-analytics">
        
                            <div className="view-growth">
                                <div className="line-graph-view car-an">
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
                                <div className="bar-resou-growth car-an">
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
                                <div className="stackedbar-reso-dist car-an">
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
                            </div>
                            <div className="resources-performance">
                                
                                <div className="dongut-performance">
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
        
                            
                        </div>
                    </div>
        </>
    )
}
export default Analyticsuse;