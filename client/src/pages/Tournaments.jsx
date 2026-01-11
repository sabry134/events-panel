import React, { useEffect, useMemo, useState } from "react"
import { Box, Grid, TextField, Button, Stack, Typography, Divider, Dialog, DialogTitle, DialogContent, DialogActions, Chip, MenuItem, IconButton } from "@mui/material"
import { EmojiEvents, Add, Shuffle, AutoAwesome, CalendarMonth, SportsEsports, Close } from "@mui/icons-material"
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker"
import dayjs from "dayjs"
import NeonCard from "../components/NeonCard.jsx"
import SectionHeader from "../components/SectionHeader.jsx"
import { http } from "../api/http.js"

function parseTeams(s) {
  return String(s || "")
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean)
}

export default function Tournaments({ me, caps }) {
  const [items, setItems] = useState([])
  const [openCreate, setOpenCreate] = useState(false)
  const [title, setTitle] = useState("")
  const [desc, setDesc] = useState("")
  const [teamsText, setTeamsText] = useState("")
  const [randomShuffle, setRandomShuffle] = useState(true)
  const [notifyRoleId, setNotifyRoleId] = useState("")
  const [activeTournament, setActiveTournament] = useState(null)
  const [reportOpen, setReportOpen] = useState(false)
  const [reportMatch, setReportMatch] = useState(null)
  const [scoreA, setScoreA] = useState(0)
  const [scoreB, setScoreB] = useState(0)
  const [scheduledAt, setScheduledAt] = useState(dayjs().add(1, "hour"))

  const canCreate = !!me && (caps?.canOrganizeTournaments || caps?.isAdmin)

  async function refresh() {
    const { data } = await http.get("/api/tournaments")
    setItems(data.tournaments || [])
  }

  useEffect(() => {
    refresh().catch(() => {})
  }, [])

  async function createTournament() {
    const teamNames = parseTeams(teamsText)
    const { data } = await http.post("/api/tournaments", {
      title,
      description: desc,
      teamNames,
      randomShuffle,
      notifyRoleId
    })
    setOpenCreate(false)
    setTitle("")
    setDesc("")
    setTeamsText("")
    setNotifyRoleId("")
    setRandomShuffle(true)
    await refresh()
    setActiveTournament(data.tournament)
  }

  async function openReport(t, m) {
    setActiveTournament(t)
    setReportMatch(m)
    setScoreA(m?.result?.scoreA || 0)
    setScoreB(m?.result?.scoreB || 0)
    setScheduledAt(m?.scheduledAt ? dayjs(m.scheduledAt) : dayjs().add(1, "hour"))
    setReportOpen(true)
  }

  async function submitReport() {
    const t = activeTournament
    const m = reportMatch
    if (!t || !m) return
    await http.post(`/api/tournaments/${t.id}/report`, {
      matchId: m._id,
      scoreA: Number(scoreA),
      scoreB: Number(scoreB),
      scheduledAt: scheduledAt ? scheduledAt.toISOString() : ""
    })
    setReportOpen(false)
    setReportMatch(null)
    await refresh()
  }

  const byId = useMemo(() => {
    const map = new Map()
    for (const t of items) map.set(t.id, t)
    return map
  }, [items])

  return (
    <Box>
      <SectionHeader
        title="Tournaments"
        subtitle="Create a tournament and the system builds team roles + match channels on Discord, then keeps everything synchronized."
        icon={<EmojiEvents />}
      />

      <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} sx={{ mb: 2 }}>
        <NeonCard sx={{ flex: 1 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ xs: "stretch", md: "center" }}>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 900, fontSize: 16 }}>Discord-native tournament automation</Typography>
              <Typography sx={{ opacity: 0.78, mt: 0.4 }}>
                Roles per team name, one channel per match, and permission sets updated on every tournament update.
              </Typography>
            </Box>
            <Button
              disabled={!canCreate}
              onClick={() => setOpenCreate(true)}
              variant="contained"
              startIcon={<Add />}
              sx={{
                borderRadius: 3,
                background: "linear-gradient(135deg, rgba(124,92,255,1), rgba(0,229,255,1))",
                boxShadow: "0 18px 60px rgba(124,92,255,0.22)",
                px: 2.4
              }}
            >
              Create tournament
            </Button>
          </Stack>
        </NeonCard>
      </Stack>

      <Grid container spacing={2.2}>
        {items.map((t) => (
          <Grid key={t.id} item xs={12} md={6}>
            <NeonCard>
              <Stack spacing={1.2}>
                <Stack direction="row" spacing={1.2} alignItems="center">
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 3,
                      display: "grid",
                      placeItems: "center",
                      background: "linear-gradient(135deg, rgba(124,92,255,0.26), rgba(0,229,255,0.16))",
                      border: "1px solid rgba(255,255,255,0.14)"
                    }}
                  >
                    <SportsEsports />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 1000, lineHeight: 1.1 }}>
                      {t.title}
                    </Typography>
                    <Typography sx={{ opacity: 0.78, fontSize: 13 }} noWrap>
                      {t.description || "—"}
                    </Typography>
                  </Box>
                  <Chip
                    size="small"
                    label={`${t.teams?.length || 0} teams`}
                    sx={{ borderRadius: 999, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}
                  />
                  <Chip
                    size="small"
                    label={`${t.matches?.length || 0} matches`}
                    sx={{ borderRadius: 999, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}
                  />
                </Stack>

                <Divider sx={{ borderColor: "rgba(255,255,255,0.10)" }} />

                <Typography sx={{ fontWeight: 900, opacity: 0.9 }}>Matches</Typography>

                <Stack spacing={1}>
                  {(t.matches || []).map((m) => (
                    <Box
                      key={m._id}
                      sx={{
                        p: 1.2,
                        borderRadius: 3,
                        border: "1px solid rgba(255,255,255,0.10)",
                        background: "rgba(255,255,255,0.04)",
                        display: "flex",
                        alignItems: "center",
                        gap: 1
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontWeight: 900 }}>{m.teamA} vs {m.teamB}</Typography>
                        <Typography sx={{ opacity: 0.75, fontSize: 12 }}>
                          {m.scheduledAt ? dayjs(m.scheduledAt).format("ddd, MMM D • HH:mm") : "No scheduled time"}
                        </Typography>
                      </Box>
                      <Chip
                        size="small"
                        label={m?.result?.winner ? `Winner: ${m.result.winner}` : "No winner"}
                        sx={{ borderRadius: 999, background: "rgba(124,92,255,0.12)", border: "1px solid rgba(124,92,255,0.22)" }}
                      />
                      <Button
                        onClick={() => openReport(byId.get(t.id) || t, m)}
                        variant="outlined"
                        startIcon={<AutoAwesome />}
                        sx={{ borderRadius: 3, borderColor: "rgba(255,255,255,0.18)" }}
                      >
                        Report
                      </Button>
                    </Box>
                  ))}
                </Stack>

                <Typography sx={{ opacity: 0.7, fontSize: 12, pt: 1 }}>
                  Discord: team roles + match channels are automatically created and kept in sync when you update this tournament.
                </Typography>
              </Stack>
            </NeonCard>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: 4, background: "rgba(12,14,28,0.92)", border: "1px solid rgba(255,255,255,0.10)", backdropFilter: "blur(18px)" } }}>
        <DialogTitle sx={{ fontWeight: 1000, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          Create tournament
          <IconButton onClick={() => setOpenCreate(false)} sx={{ color: "rgba(255,255,255,0.78)" }}><Close /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 1.5 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField value={title} onChange={(e) => setTitle(e.target.value)} label="Title" fullWidth />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField value={notifyRoleId} onChange={(e) => setNotifyRoleId(e.target.value)} label="Discord role ID to mention (optional)" fullWidth />
            </Grid>
            <Grid item xs={12}>
              <TextField value={desc} onChange={(e) => setDesc(e.target.value)} label="Description" fullWidth multiline minRows={3} />
            </Grid>
            <Grid item xs={12}>
              <TextField value={teamsText} onChange={(e) => setTeamsText(e.target.value)} label="Teams (one per line)" fullWidth multiline minRows={7} />
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                label="Seeding"
                value={randomShuffle ? "shuffle" : "ordered"}
                onChange={(e) => setRandomShuffle(e.target.value === "shuffle")}
                fullWidth
              >
                <MenuItem value="shuffle">
                  Random Shuffle
                </MenuItem>
                <MenuItem value="ordered">
                  Keep Order
                </MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenCreate(false)} sx={{ borderRadius: 3 }}>Cancel</Button>
          <Button
            onClick={createTournament}
            variant="contained"
            startIcon={<Shuffle />}
            sx={{
              borderRadius: 3,
              background: "linear-gradient(135deg, rgba(124,92,255,1), rgba(0,229,255,1))",
              boxShadow: "0 18px 60px rgba(124,92,255,0.20)"
            }}
          >
            Create & sync Discord
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={reportOpen} onClose={() => setReportOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 4, background: "rgba(12,14,28,0.92)", border: "1px solid rgba(255,255,255,0.10)", backdropFilter: "blur(18px)" } }}>
        <DialogTitle sx={{ fontWeight: 1000, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          Report match result
          <IconButton onClick={() => setReportOpen(false)} sx={{ color: "rgba(255,255,255,0.78)" }}><Close /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 1.5 }}>
          <Stack spacing={2}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CalendarMonth />
              <Typography sx={{ fontWeight: 900 }}>
                {reportMatch ? `${reportMatch.teamA} vs ${reportMatch.teamB}` : ""}
              </Typography>
            </Box>
            <DateTimePicker
              label="Match time"
              value={scheduledAt}
              onChange={(v) => setScheduledAt(v)}
              sx={{ width: "100%" }}
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField type="number" value={scoreA} onChange={(e) => setScoreA(e.target.value)} label={reportMatch?.teamA || "Team A"} fullWidth />
              </Grid>
              <Grid item xs={6}>
                <TextField type="number" value={scoreB} onChange={(e) => setScoreB(e.target.value)} label={reportMatch?.teamB || "Team B"} fullWidth />
              </Grid>
            </Grid>
            <Typography sx={{ opacity: 0.78, fontSize: 12 }}>
              Submitting sends a Discord message to the match channel with a Confirm / Cross-out workflow for organizers.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setReportOpen(false)} sx={{ borderRadius: 3 }}>Cancel</Button>
          <Button
            onClick={submitReport}
            variant="contained"
            startIcon={<AutoAwesome />}
            sx={{
              borderRadius: 3,
              background: "linear-gradient(135deg, rgba(124,92,255,1), rgba(0,229,255,1))",
              boxShadow: "0 18px 60px rgba(124,92,255,0.20)"
            }}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
