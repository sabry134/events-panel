import React from "react"
import { Box, Grid, Typography, Button, Stack, Chip } from "@mui/material"
import { EmojiEvents, Event, Flag, ArrowForward } from "@mui/icons-material"
import NeonCard from "../components/NeonCard.jsx"

export default function Dashboard({ me, caps, navTo }) {
  const tiles = [
    {
      title: "Tournaments",
      desc: "Auto roles + channels per match, permissions synced on update, and UI-first result reporting.",
      icon: <EmojiEvents />,
      path: "/tournaments",
      enabled: true
    },
    {
      title: "Events",
      desc: "Schedule, announce, and track events with Discord-linked notification roles.",
      icon: <Event />,
      path: "/events",
      enabled: true
    },
    {
      title: "Contests",
      desc: "Collaborative judging, scoring averages, personal judge deadlines, and submission flows.",
      icon: <Flag />,
      path: "/contests",
      enabled: true
    }
  ]

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h3" sx={{ fontWeight: 1000, letterSpacing: -0.6, lineHeight: 1.0 }}>
          A flawless bridge between Discord and organized competition
        </Typography>
        <Typography sx={{ opacity: 0.82, mt: 1.2, maxWidth: 860, fontSize: 16 }}>
          Everything you create here becomes a living structure on your Discord server: announcement channels, match channels, team roles, and permission sets that stay synchronized.
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: "wrap" }}>
          <Chip label={me ? "Discord OAuth Connected" : "Not connected"} sx={{ borderRadius: 999, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }} />
          <Chip label={caps?.isAdmin ? "Admin" : "Role-based access"} sx={{ borderRadius: 999, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }} />
          <Chip label="Gradient Neon UI" sx={{ borderRadius: 999, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }} />
        </Stack>
      </Box>

      <Grid container spacing={2.2}>
        {tiles.map((t) => (
          <Grid key={t.title} item xs={12} md={4}>
            <NeonCard sx={{ height: "100%" }}>
              <Stack spacing={1.4}>
                <Stack direction="row" spacing={1.2} alignItems="center">
                  <Box
                    sx={{
                      width: 46,
                      height: 46,
                      borderRadius: 3,
                      display: "grid",
                      placeItems: "center",
                      background: "linear-gradient(135deg, rgba(124,92,255,0.28), rgba(0,229,255,0.18))",
                      border: "1px solid rgba(255,255,255,0.14)"
                    }}
                  >
                    {t.icon}
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 900 }}>
                      {t.title}
                    </Typography>
                    <Typography sx={{ opacity: 0.72, fontSize: 13 }}>Discord-native automation</Typography>
                  </Box>
                </Stack>

                <Typography sx={{ opacity: 0.86, lineHeight: 1.55 }}>{t.desc}</Typography>

                <Box sx={{ pt: 1 }}>
                  <Button
                    onClick={() => navTo(t.path)}
                    variant="contained"
                    endIcon={<ArrowForward />}
                    sx={{
                      borderRadius: 3,
                      background: "linear-gradient(135deg, rgba(124,92,255,1), rgba(0,229,255,1))",
                      boxShadow: "0 18px 60px rgba(124,92,255,0.24)"
                    }}
                    fullWidth
                  >
                    Open {t.title}
                  </Button>
                </Box>
              </Stack>
            </NeonCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
