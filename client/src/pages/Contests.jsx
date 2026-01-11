import React, { useEffect, useMemo, useState } from "react"
import { Box, Grid, TextField, Button, Stack, Typography, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Chip, Divider, Slider } from "@mui/material"
import { Flag as FlagIcon, Add, Close, Gavel, Link as LinkIcon, CalendarMonth } from "@mui/icons-material"
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker"
import dayjs from "dayjs"
import NeonCard from "../components/NeonCard.jsx"
import SectionHeader from "../components/SectionHeader.jsx"
import { http } from "../api/http.js"

export default function Contests({ me, caps }) {
  const [items, setItems] = useState([])
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [notifyRoleId, setNotifyRoleId] = useState("")
  const [submissionOpensAt, setSubmissionOpensAt] = useState(dayjs().add(1, "day").hour(10).minute(0))
  const [submissionClosesAt, setSubmissionClosesAt] = useState(dayjs().add(8, "day").hour(22).minute(0))
  const [judgingClosesAt, setJudgingClosesAt] = useState(dayjs().add(12, "day").hour(22).minute(0))

  const [active, setActive] = useState(null)
  const [submitOpen, setSubmitOpen] = useState(false)
  const [subTitle, setSubTitle] = useState("")
  const [subUrl, setSubUrl] = useState("")
  const [subNote, setSubNote] = useState("")
  const [gradeOpen, setGradeOpen] = useState(false)
  const [gradeSubmission, setGradeSubmission] = useState(null)
  const [gradeScore, setGradeScore] = useState(75)
  const [gradeNote, setGradeNote] = useState("")
  const canCreate = !!me && (caps?.canOrganizeContests || caps?.isAdmin)

  async function refresh() {
    const { data } = await http.get("/api/contests")
    setItems(data.contests || [])
  }

  useEffect(() => {
    refresh().catch(() => {})
  }, [])

  async function createContest() {
    await http.post("/api/contests", {
      title,
      description,
      notifyRoleId,
      submissionOpensAt: submissionOpensAt.toISOString(),
      submissionClosesAt: submissionClosesAt.toISOString(),
      judgingClosesAt: judgingClosesAt.toISOString(),
      judges: []
    })
    setOpen(false)
    setTitle("")
    setDescription("")
    setNotifyRoleId("")
    await refresh()
  }

  async function openSubmit(c) {
    setActive(c)
    setSubTitle("")
    setSubUrl("")
    setSubNote("")
    setSubmitOpen(true)
  }

  async function submitEntry() {
    if (!active) return
    await http.post(`/api/contests/${active.id}/submissions`, {
      title: subTitle,
      url: subUrl,
      note: subNote
    })
    setSubmitOpen(false)
    await refresh()
  }

  async function openGrade(c, s) {
    setActive(c)
    setGradeSubmission(s)
    setGradeScore(75)
    setGradeNote("")
    setGradeOpen(true)
  }

  async function submitGrade() {
    if (!active || !gradeSubmission) return
    await http.post(`/api/contests/${active.id}/grade`, {
      submissionId: gradeSubmission._id,
      score: gradeScore,
      note: gradeNote
    })
    setGradeOpen(false)
    await refresh()
  }

  const scoreMap = useMemo(() => {
    const map = new Map()
    for (const c of items) {
      const subScores = new Map()
      for (const sc of c.scores || []) {
        const list = subScores.get(sc.submissionId) || []
        list.push(sc.score)
        subScores.set(sc.submissionId, list)
      }
      map.set(c.id, subScores)
    }
    return map
  }, [items])

  function avg(list) {
    if (!list || list.length === 0) return null
    const s = list.reduce((a, b) => a + b, 0)
    return Math.round((s / list.length) * 10) / 10
  }

  return (
    <Box>
      <SectionHeader
        title="Contests"
        subtitle="Collaborative judging with averages, submissions, and Discord announcements—all through a clean UX layer."
        icon={<FlagIcon />}
      />

      <NeonCard sx={{ mb: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ xs: "stretch", md: "center" }}>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontWeight: 1000, fontSize: 16 }}>Submission + judging pipelines</Typography>
            <Typography sx={{ opacity: 0.78, mt: 0.4 }}>
              Participants submit links. Organizers and judges grade. The dashboard computes averages per entry.
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
            Create contest
          </Button>
        </Stack>
      </NeonCard>

      <Grid container spacing={2.2}>
        {items.map((c) => (
          <Grid item xs={12} md={6} key={c.id}>
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
                    <Gavel />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 1000, lineHeight: 1.1 }}>
                      {c.title}
                    </Typography>
                    <Typography sx={{ opacity: 0.78, fontSize: 13 }} noWrap>
                      {c.description || "—"}
                    </Typography>
                  </Box>
                  <Chip size="small" label={`${c.submissions?.length || 0} submissions`} sx={{ borderRadius: 999, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }} />
                </Stack>

                <Stack spacing={0.6} sx={{ opacity: 0.9 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CalendarMonth fontSize="small" />
                    <Typography sx={{ fontWeight: 800, fontSize: 13 }}>
                      Opens {dayjs(c.submissionOpensAt).format("MMM D, HH:mm")} • Closes {dayjs(c.submissionClosesAt).format("MMM D, HH:mm")}
                    </Typography>
                  </Stack>
                  <Typography sx={{ opacity: 0.75, fontSize: 12 }}>
                    Judging closes {dayjs(c.judgingClosesAt).format("MMM D, HH:mm")}
                  </Typography>
                </Stack>

                <Divider sx={{ borderColor: "rgba(255,255,255,0.10)" }} />

                <Stack direction={{ xs: "column", md: "row" }} spacing={1} alignItems={{ xs: "stretch", md: "center" }}>
                  <Button
                    onClick={() => openSubmit(c)}
                    variant="outlined"
                    startIcon={<LinkIcon />}
                    sx={{ borderRadius: 3, borderColor: "rgba(255,255,255,0.18)" }}
                    fullWidth
                  >
                    Submit entry
                  </Button>
                </Stack>

                <Stack spacing={1} sx={{ pt: 0.5 }}>
                  {(c.submissions || []).slice(0, 4).map((s) => {
                    const scores = scoreMap.get(c.id)?.get(s._id) || []
                    const a = avg(scores)
                    return (
                      <Box key={s._id} sx={{ p: 1.1, borderRadius: 3, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.04)", display: "flex", gap: 1, alignItems: "center" }}>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontWeight: 900 }} noWrap>{s.title}</Typography>
                          <Typography sx={{ opacity: 0.75, fontSize: 12 }} noWrap>{s.url}</Typography>
                        </Box>
                        <Chip size="small" label={a === null ? "No scores" : `Avg ${a}`} sx={{ borderRadius: 999, background: "rgba(0,229,255,0.10)", border: "1px solid rgba(0,229,255,0.20)" }} />
                        <Button
                          disabled={!me || !(caps?.canOrganizeContests || caps?.isAdmin)}
                          onClick={() => openGrade(c, s)}
                          variant="contained"
                          sx={{ borderRadius: 3, background: "linear-gradient(135deg, rgba(124,92,255,1), rgba(0,229,255,1))" }}
                        >
                          Grade
                        </Button>
                      </Box>
                    )
                  })}
                </Stack>
              </Stack>
            </NeonCard>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: 4, background: "rgba(12,14,28,0.92)", border: "1px solid rgba(255,255,255,0.10)", backdropFilter: "blur(18px)" } }}>
        <DialogTitle sx={{ fontWeight: 1000, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          Create contest
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
            <Grid item xs={12} md={4}>
              <DateTimePicker label="Submission opens" value={submissionOpensAt} onChange={(v) => setSubmissionOpensAt(v)} sx={{ width: "100%" }} />
            </Grid>
            <Grid item xs={12} md={4}>
              <DateTimePicker label="Submission closes" value={submissionClosesAt} onChange={(v) => setSubmissionClosesAt(v)} sx={{ width: "100%" }} />
            </Grid>
            <Grid item xs={12} md={4}>
              <DateTimePicker label="Judging closes" value={judgingClosesAt} onChange={(v) => setJudgingClosesAt(v)} sx={{ width: "100%" }} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpen(false)} sx={{ borderRadius: 3 }}>Cancel</Button>
          <Button
            onClick={createContest}
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

      <Dialog open={submitOpen} onClose={() => setSubmitOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 4, background: "rgba(12,14,28,0.92)", border: "1px solid rgba(255,255,255,0.10)", backdropFilter: "blur(18px)" } }}>
        <DialogTitle sx={{ fontWeight: 1000, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          Submit entry
          <IconButton onClick={() => setSubmitOpen(false)} sx={{ color: "rgba(255,255,255,0.78)" }}><Close /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 1.5 }}>
          <Stack spacing={2}>
            <TextField value={subTitle} onChange={(e) => setSubTitle(e.target.value)} label="Entry title" fullWidth />
            <TextField value={subUrl} onChange={(e) => setSubUrl(e.target.value)} label="Link (URL)" fullWidth />
            <TextField value={subNote} onChange={(e) => setSubNote(e.target.value)} label="Note (optional)" fullWidth multiline minRows={3} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setSubmitOpen(false)} sx={{ borderRadius: 3 }}>Cancel</Button>
          <Button
            onClick={submitEntry}
            variant="contained"
            startIcon={<LinkIcon />}
            sx={{
              borderRadius: 3,
              background: "linear-gradient(135deg, rgba(124,92,255,1), rgba(0,229,255,1))"
            }}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={gradeOpen} onClose={() => setGradeOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 4, background: "rgba(12,14,28,0.92)", border: "1px solid rgba(255,255,255,0.10)", backdropFilter: "blur(18px)" } }}>
        <DialogTitle sx={{ fontWeight: 1000, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          Grade entry
          <IconButton onClick={() => setGradeOpen(false)} sx={{ color: "rgba(255,255,255,0.78)" }}><Close /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 1.5 }}>
          <Stack spacing={2}>
            <Box>
              <Typography sx={{ fontWeight: 1000 }}>{gradeSubmission?.title || ""}</Typography>
              <Typography sx={{ opacity: 0.75, fontSize: 12 }} noWrap>{gradeSubmission?.url || ""}</Typography>
            </Box>
            <Box sx={{ p: 1.2, borderRadius: 3, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.04)" }}>
              <Typography sx={{ fontWeight: 900, mb: 1 }}>Score: {gradeScore}</Typography>
              <Slider value={gradeScore} onChange={(e, v) => setGradeScore(v)} min={0} max={100} />
            </Box>
            <TextField value={gradeNote} onChange={(e) => setGradeNote(e.target.value)} label="Judge note (optional)" fullWidth multiline minRows={3} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setGradeOpen(false)} sx={{ borderRadius: 3 }}>Cancel</Button>
          <Button
            onClick={submitGrade}
            variant="contained"
            sx={{
              borderRadius: 3,
              background: "linear-gradient(135deg, rgba(124,92,255,1), rgba(0,229,255,1))"
            }}
          >
            Save grade
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
