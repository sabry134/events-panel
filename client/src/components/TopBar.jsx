import React from "react"
import { AppBar, Toolbar, Box, Typography, Button, Avatar, Chip } from "@mui/material"
import { Dashboard, EmojiEvents, Event, Flag, Login, Logout } from "@mui/icons-material"

export default function TopBar({ me, caps, onLogin, onLogout, navTo }) {
  const label = me ? (me.globalName || me.username) : "Guest"
  return (
    <AppBar position="sticky" elevation={0} sx={{ background: "rgba(10,12,22,0.55)", backdropFilter: "blur(14px)", borderBottom: "1px solid rgba(255,255,255,0.10)" }}>
      <Toolbar sx={{ gap: 1.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, cursor: "pointer" }} onClick={() => navTo("/")}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 2,
              background: "linear-gradient(135deg, rgba(124,92,255,1), rgba(0,229,255,1))",
              boxShadow: "0 10px 40px rgba(124,92,255,0.22)"
            }}
          />
          <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: 0.4 }}>
            NexusOps
          </Typography>
        </Box>

        <Box sx={{ flex: 1 }} />

        <Button startIcon={<Dashboard />} onClick={() => navTo("/")} sx={{ borderRadius: 3 }}>
          Dashboard
        </Button>
        <Button startIcon={<EmojiEvents />} onClick={() => navTo("/tournaments")} sx={{ borderRadius: 3 }}>
          Tournaments
        </Button>
        <Button startIcon={<Event />} onClick={() => navTo("/events")} sx={{ borderRadius: 3 }}>
          Events
        </Button>
        <Button startIcon={<Flag />} onClick={() => navTo("/contests")} sx={{ borderRadius: 3 }}>
          Contests
        </Button>

        <Box sx={{ flex: 1 }} />

        {me ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Chip
              size="small"
              sx={{
                borderRadius: 999,
                background: "linear-gradient(135deg, rgba(124,92,255,0.18), rgba(0,229,255,0.12))",
                border: "1px solid rgba(255,255,255,0.12)"
              }}
              label={caps?.isAdmin ? "Admin" : (caps?.isModerator ? "Moderator" : "Connected")}
            />
            <Avatar src={me.avatar || ""} sx={{ width: 34, height: 34, border: "1px solid rgba(255,255,255,0.18)" }} />
            <Typography sx={{ fontWeight: 700, maxWidth: 180 }} noWrap>
              {label}
            </Typography>
            <Button variant="outlined" startIcon={<Logout />} onClick={onLogout} sx={{ borderRadius: 3, borderColor: "rgba(255,255,255,0.18)" }}>
              Logout
            </Button>
          </Box>
        ) : (
          <Button variant="contained" startIcon={<Login />} onClick={onLogin} sx={{ borderRadius: 3 }}>
            Login with Discord
          </Button>
        )}
      </Toolbar>
    </AppBar>
  )
}
