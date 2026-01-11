import React, { useEffect, useMemo, useState } from "react"
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom"
import { CssBaseline, GlobalStyles, ThemeProvider, createTheme, Box, Container } from "@mui/material"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { http } from "./api/http.js"
import TopBar from "./components/TopBar.jsx"
import Dashboard from "./pages/Dashboard.jsx"
import Tournaments from "./pages/Tournaments.jsx"
import Events from "./pages/Events.jsx"
import Contests from "./pages/Contests.jsx"
import UserProfile from "./pages/UserProfile.jsx"

dayjs.extend(relativeTime)

function Shell() {
  const nav = useNavigate()
  const [me, setMe] = useState(null)
  const [caps, setCaps] = useState(null)

  async function loadMe() {
    const { data } = await http.get("/api/me")
    setMe(data.user)
    setCaps(data.caps)
  }

  useEffect(() => {
    loadMe().catch(() => {})
  }, [])

  function login() {
    window.location.href = "http://localhost:4000/auth/discord"
  }

  async function logout() {
    await http.post("/auth/logout")
    setMe(null)
    setCaps(null)
    nav("/")
  }

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <TopBar me={me} caps={caps} onLogin={login} onLogout={logout} navTo={nav} />
      <Container maxWidth="lg" sx={{ py: 3.2 }}>
        <Routes>
          <Route path="/" element={<Dashboard me={me} caps={caps} navTo={nav} />} />
          <Route path="/tournaments" element={<Tournaments me={me} caps={caps} />} />
          <Route path="/events" element={<Events me={me} caps={caps} />} />
          <Route path="/contests" element={<Contests me={me} caps={caps} />} />
          <Route path="/users/:id" element={<UserProfile />} />
        </Routes>
      </Container>
    </Box>
  )
}

export default function App() {
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: "dark",
          primary: { main: "#7c5cff" },
          secondary: { main: "#00e5ff" },
          background: { default: "#070812", paper: "rgba(255,255,255,0.06)" },
          text: { primary: "#f4f6ff", secondary: "rgba(244,246,255,0.70)" }
        },
        shape: { borderRadius: 14 },
        typography: {
          fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
          h3: { fontWeight: 1000 },
          button: { textTransform: "none", fontWeight: 900 }
        },
        components: {
          MuiPaper: {
            styleOverrides: {
              root: {
                border: "1px solid rgba(255,255,255,0.10)"
              }
            }
          },
          MuiTextField: {
            defaultProps: {
              variant: "outlined"
            }
          },
          MuiOutlinedInput: {
            styleOverrides: {
              root: {
                borderRadius: 16,
                background: "rgba(255,255,255,0.05)",
                backdropFilter: "blur(12px)"
              },
              notchedOutline: {
                borderColor: "rgba(255,255,255,0.12)"
              }
            }
          },
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 16
              }
            }
          }
        }
      }),
    []
  )

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <CssBaseline />
        <GlobalStyles
          styles={{
            html: { height: "100%" },
            body: {
              height: "100%",
              background:
                "radial-gradient(1200px 700px at 20% 0%, rgba(124,92,255,0.26), transparent 55%), radial-gradient(900px 520px at 80% 10%, rgba(0,229,255,0.18), transparent 60%), radial-gradient(900px 700px at 50% 110%, rgba(255,60,170,0.10), transparent 55%), linear-gradient(180deg, #050612 0%, #070812 40%, #050612 100%)",
              backgroundAttachment: "fixed"
            },
            "#root": { height: "100%" },
            "*": { boxSizing: "border-box" },
            "::-webkit-scrollbar": { width: 10 },
            "::-webkit-scrollbar-thumb": {
              background: "linear-gradient(180deg, rgba(124,92,255,0.55), rgba(0,229,255,0.35))",
              borderRadius: 999,
              border: "2px solid rgba(5,6,18,0.55)"
            },
            "::selection": { background: "rgba(124,92,255,0.35)" }
          }}
        />
        <BrowserRouter>
          <Shell />
        </BrowserRouter>
      </LocalizationProvider>
    </ThemeProvider>
  )
}
