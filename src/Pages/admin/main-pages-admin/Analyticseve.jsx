import { Chart as Chartjs, defaults } from 'chart.js/auto';
import { Doughnut } from "react-chartjs-2";
import { MdEvent } from 'react-icons/md';
import { Box, Typography, Select, MenuItem, Card, CardContent } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { mockResources } from '../../../api/mockResources';
import { useState } from 'react';

const darkTheme = createTheme({
    palette: {
        mode: "dark",
        background: {
            default: "#121212",
            paper: "#111",
        },
        text: {
            primary: "#e0e0e0",
            secondary: "#b0b0b0",
        },
    },
});


function Analyticseve() {
    const [category, setCategory] = useState("All");
    
        const filteredResources = category === "All"
            ? mockResources
            : mockResources.filter(r => r.category === category);
    
        // Sort by views and take top 3
        const topResources = [...filteredResources]
            .sort((a, b) => b.views - a.views)
            .slice(0, 3);
    return (
        <>
            <div className="analysis-conatiner-event">
                <h1 className="event-titel" > <MdEvent color='#3c704d' /> Events Analysis</h1>
                <div className="con-analytic-eve">
                    <div className="over-view-ev">
                        <div className="status-ev-card">
                            <div className="stat-cardev">
                                <h3>Total Events</h3>
                                <p>30K</p>
                            </div>
                            <div className="stat-cardev">
                                <h3>Event created per month </h3>
                                <p>3K/Month</p>
                            </div>
                            <div className="stat-cardev">
                                <h3>Total registerd users</h3>
                                <p>20K</p>
                            </div>
                        </div>
                        <div className="upcaming-ev">
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
                        <div className="Published-Draft iv">
                            <ThemeProvider theme={darkTheme}>

                                <Box sx={{ p: 3, bgcolor: "background.default", borderRadius: 2 }}>
                                    <Typography variant="h6" gutterBottom>
                                        Top 3 Events
                                    </Typography>

                                    <Select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        sx={{ mb: 2 }}
                                    >
                                        <MenuItem value="All">All</MenuItem>
                                        <MenuItem value="Events">Events</MenuItem>
                                        <MenuItem value="Learning">Learning</MenuItem>
                                        <MenuItem value="Support">Support</MenuItem>
                                        <MenuItem value="Opportunities">Opportunities</MenuItem>
                                        <MenuItem value="Announcements">Announcements</MenuItem>
                                    </Select>

                                    {topResources.map((res) => (
                                        <Card key={res.id} sx={{ mb: 2, boxShadow: 3 }}>
                                            <CardContent>
                                                <Typography variant="subtitle1" fontWeight="bold">
                                                    {res.title}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {res.category}
                                                </Typography>
                                                <Typography variant="body2">Views: {res.views}</Typography>
                                                <Typography variant="body2">Likes: {res.likes}</Typography>
                                                {res.registrations && (
                                                    <Typography variant="body2">Registrations: {res.registrations}</Typography>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </Box>
                            </ThemeProvider>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
export default Analyticseve;