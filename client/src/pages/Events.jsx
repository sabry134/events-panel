import React, { useEffect, useState } from "react"
import { Box, Grid, TextField, Button, Stack, Typography, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Chip } from "@mui/material"
import { Event as EventIcon, Add, Close, Campaign, Place, CalendarMonth } from "@mui/icons-material"
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker"
import dayjs from "dayjs"
import NeonCard from "../components/NeonCard.jsx"
import SectionHeader from "../components/SectionHeader.jsx"
import { http } from "../api/http.js"

export default function Events({ me, caps }) {
  const [items, setItems] = useState([])
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [notifyRoleId, setNotifyRoleId] = useState("")
  const [startsAt, setStartsAt] = useState(dayjs().add(1, "day").hour(19).minute(0))
  const [endsAt, setEndsAt] = useState(dayjs().add(1, "day").hour(22).minute(0))

  const canCreate = !!me && (caps?.canOrganizeEvents || caps?.isAdmin)

  async function refresh() {
    const { data } = await http.get("/api/events")
    setItems(data.events || [])
  }

  useEffect(() => {
    refresh().catch(() => {})
  }, [])

  async function createEvent() {
    await http.post("/api/events", {
      title,
      description,
      location,
      notifyRoleId,
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString()
    })
    setOpen(false)
    setTitle("")
    setDescription("")
    setLocation("")
    setNotifyRoleId("")
    setStartsAt(dayjs().add(1, "day").hour(19).minute(0))
    setEndsAt(dayjs().add(1, "day").hour(22).minute(0))
    await refresh()
  }

  return (
    <Box>
      <SectionHeader
        title="Events"
        subtitle="Create events with calendar-grade UX and Discord-linked announcements via notification roles."
        icon={<EventIcon />}
      />

      <NeonCard sx={{ mb: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ xs: "stretch", md: "center" }}>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontWeight: 1000, fontSize: 16 }}>UX-first scheduling</Typography>
            <Typography sx={{ opacity: 0.78, mt: 0.4 }}>
              Date pickers, clean cards, and Discord announcements sent automatically on creation and updates.
            </Typography>
          </Box>
          <Button
            disabled={!canCreate}
            onClick={() => setOpen(true)}
            variant="contained"
            startIcon={<Add />}
            sx={{
              borderRadius: 3,
              background: "linear-gradient(135deg, rgba(124,92,255,1), rgba(0,229,255,1))",
              boxShadow: "0 18px 60px rgba(124,92,255,0.22)",
              px: 2.4
            }}
          >
            Create event
          </Button>
        </Stack>
      </NeonCard>

      <Grid container spacing={2.2}>
        {items.map((e) => (
          <Grid item xs={12} md={6} key={e.id}>
            <NeonCard>
              <Stack spacing={1.2}>
                <Stack direction="row" spacing={1.2} alignItems="center">
                  <Box
                    sx={{
                      width: 46,
                      height: 46,
                      borderRadius: 3,
                      display: "grid",
                      placeItems: "center",
                      background: "linear-gradient(135deg, rgba(124,92,255,0.26), rgba(0,229,255,0.16))",
                      border: "1px solid rgba(255,255,255,0.14)"
                    }}
                  >
                    <Campaign />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 1000, lineHeight: 1.1 }}>
                      {e.title}
                    </Typography>
                    <Typography sx={{ opacity: 0.78, fontSize: 13 }} noWrap>
                      {e.description || "—"}
                    </Typography>
                  </Box>
                  <Chip size="small" label="Discord announced" sx={{ borderRadius: 999, background: "rgba(0,229,255,0.10)", border: "1px solid rgba(0,229,255,0.20)" }} />
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center" sx={{ opacity: 0.85 }}>
                  <CalendarMonth fontSize="small" />
                  <Typography sx={{ fontWeight: 800 }}>
                    {dayjs(e.startsAt).format("ddd, MMM D • HH:mm")} → {dayjs(e.endsAt).format("HH:mm")}
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center" sx={{ opacity: 0.85 }}>
                  <Place fontSize="small" />
                  <Typography sx={{ fontWeight: 700 }}>{e.location || "No location"}</Typography>
                </Stack>
              </Stack>
            </NeonCard>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: 4, background: "rgba(12,14,28,0.92)", border: "1px solid rgba(255,255,255,0.10)", backdropFilter: "blur(18px)" } }}>
        <DialogTitle sx={{ fontWeight: 1000, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          Create event
          <IconButton onClick={() => setOpen(false)} sx={{ color: "rgba(255,255,255,0.78)" }}><Close /></IconButton>
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
              <TextField value={description} onChange={(e) => setDescription(e.target.value)} label="Description" fullWidth multiline minRows={3} />
            </Grid>
            <Grid item xs={12} md={6}>
              <DateTimePicker label="Starts" value={startsAt} onChange={(v) => setStartsAt(v)} sx={{ width: "100%" }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <DateTimePicker label="Ends" value={endsAt} onChange={(v) => setEndsAt(v)} sx={{ width: "100%" }} />
            </Grid>
            <Grid item xs={12}>
              <TextField value={location} onChange={(e) => setLocation(e.target.value)} label="Location" fullWidth />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpen(false)} sx={{ borderRadius: 3 }}>Cancel</Button>
          <Button
            onClick={createEvent}
            variant="contained"
            startIcon={<Add />}
            sx={{
              borderRadius: 3,
              background: "linear-gradient(135deg, rgba(124,92,255,1), rgba(0,229,255,1))",
              boxShadow: "0 18px 60px rgba(124,92,255,0.20)"
            }}
          >
            Create & announce
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
