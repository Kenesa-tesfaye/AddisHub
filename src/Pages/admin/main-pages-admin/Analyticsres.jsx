import { Chart as Chartjs, defaults } from 'chart.js/auto';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { DataGrid } from "@mui/x-data-grid";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Paper } from "@mui/material";
import { Box, Typography, Select, MenuItem, Card, CardContent } from "@mui/material";
import { mockResources } from '../../../api/mockResources';

import './main-pages-admin.css'
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
const rows = [
    { id: 1, title: "CRH Admin", Category: "Super Admin", views: '23', like: '56', location: 'mexico, addis abeba' },
    { id: 2, title: "CRH Admin", Category: "Super Admin", views: '70', like: '56', location: 'mexico, addis abeba' },
];

const columns = [
    { field: "title", headerName: "Title", width: 100, filterable: true, sortable: false, },   // filter enabled
    { field: "Category", headerName: "Category", width: 150, filterable: false, sortable: false, },
    { field: "views", headerName: "View", width: 100, filterable: false, },
    { field: "like", headerName: "Like", width: 100, filterable: false, },
    { field: "location", headerName: "Location", width: 100, filterable: false, sortable: false, },
]
function Analyticsres() {

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
            <div className="analytics-resources-conatiner">
                <h1 className="analytics-title">Resources- analytics</h1>
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
                        <div className="table-performance">
                            <ThemeProvider theme={darkTheme}>
                                <Paper sx={{
                                    height: 400,
                                    width: "600px",
                                    bgcolor: "background.default"
                                }}>
                                    <DataGrid
                                        rows={rows}
                                        columns={columns}
                                        pageSizeOptions={[10]}
                                        sx={{
                                            border: 0,
                                            color: "text.primary",
                                            backgroundColor: "background.default",

                                            "& .MuiDataGrid-columnHeaders": {
                                                backgroundColor: "#1e1e1e",
                                                color: "#fff",
                                                fontWeight: 600,
                                            },
                                            "& .MuiDataGrid-columnHeader, & .MuiDataGrid-columnHeadersInner": {
                                                backgroundColor: "#00000086 !important",
                                            },
                                            "& .MuiDataGrid-topContainer, & .MuiDataGrid-topRightContainer": {
                                                backgroundColor: "#1e1e1e !important",
                                            },
                                            "& .MuiDataGrid-cell": {
                                                borderColor: "#111",
                                            },
                                            "& .MuiDataGrid-row:hover": {
                                                backgroundColor: "#1a1a1a",
                                            },
                                            "& .MuiCheckbox-root svg": {
                                                fill: "#fff",
                                            },
                                            "& .MuiDataGrid-scrollbarFiller, & .MuiDataGrid-filler": {
                                                backgroundColor: "#111",
                                            },
                                        }}
                                    />
                                </Paper>
                            </ThemeProvider>
                        </div>
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

                    <div className="top-3-reso iv">
                        <div className="top-3-cards">
                            <ThemeProvider theme={darkTheme}>

                                <Box sx={{ p: 3, bgcolor: "background.default", borderRadius: 2 }}>
                                    <Typography variant="h6" gutterBottom>
                                        Top 3 Resources
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
export default Analyticsres;