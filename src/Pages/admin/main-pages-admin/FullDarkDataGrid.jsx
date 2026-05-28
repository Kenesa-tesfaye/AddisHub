import * as React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Button, Paper, Stack } from "@mui/material";
import './main-pages-admin.css'
import { FaEye, FaPen, FaTrash } from "react-icons/fa";
import { MdMargin } from "react-icons/md";

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
  { id: 1, Avatar: "/logo.png", name: "kevin", email: "kevin@gmail.com", resources: "4", event: "6" },
  { id: 1, Avatar: "/logo.png", name: "kevin", email: "kevin@gmail.com", resources: "4", event: "6" },
  { id: 1, Avatar: "/logo.png", name: "kevin", email: "kevin@gmail.com", resources: "4", event: "6" },
  { id: 1, Avatar: "/logo.png", name: "kevin", email: "kevin@gmail.com", resources: "4", event: "6" },
  { id: 1, Avatar: "/logo.png", name: "kevin", email: "kevin@gmail.com", resources: "4", event: "6" },
];

const columns = [
  {
    field: "Avatar",
    headerName: "profile",
    width: 100,
    sortable: false,
    filterable: false,
    renderCell: (params) => (
      <img
        src={params.value}
        alt="local"
        style={{
          width: 40, height: 40, borderRadius: 50,
          padding: '4px'
        }}
      />
    )
  },
  { field: "name", headerName: "Name", width: 150 },
  { field: "email", headerName: "Email", width: 150 },
  { field: "resources", headerName: "Resources", width: 140 },
  { field: "event", headerName: "Events", width: 140 },
  {
    field: "actions",
    headerName: "Actions",
    width: 200,
    sortable: false,
    filterable: false,
    renderCell: (params) => (
      <Stack direction="row" spacing={1}
        sx={{

          padding: '10px',
        }}>
        <Button
          variant="contained"
          color="red"
          size="small"
          onClick={() => console.log("Edit", params.row)}
        >
          <FaPen />
        </Button>
        <Button
          variant="outlined"
          color="error"
          size="small"


          onClick={() => console.log("Delete", params.row)}
        >
          <FaTrash />
        </Button>
      </Stack>
    )
  },

  {
    field: "detail",
    headerName: "Detail",
    width: 150,
    sortable: false,
    filterable: false,
    renderCell: (params) => (
      <Stack direction="row" spacing={1}
        sx={{

          padding: '10px',
        }}>

        <Button
          variant="contained"
          color="success"
          size="small"


          onClick={() => console.log("Delete", params.row)}
        >
          <FaEye />
        </Button>
      </Stack>)
  },
];

export default function FullDarkDataGrid() {
  return (
    <div className="user-management">

      <ThemeProvider theme={darkTheme}>
        <Paper sx={{
          height: 400,
          width: "100%",
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
  );
}
