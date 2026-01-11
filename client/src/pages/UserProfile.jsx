import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { Box, Stack, Typography, Avatar } from "@mui/material"
import NeonCard from "../components/NeonCard.jsx"
import { http } from "../api/http.js"

export default function UserProfile() {
  const { id } = useParams()
  const [user, setUser] = useState(null)

  useEffect(() => {
    http.get(`/api/users/${id}`).then(({ data }) => setUser(data.user)).catch(() => {})
  }, [id])

  if (!user) return <Box />

  return (
    <Box>
      <NeonCard>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "flex-start", md: "center" }}>
          <Avatar src={user.avatar || ""} sx={{ width: 88, height: 88, border: "1px solid rgba(255,255,255,0.18)" }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 1000 }}>
              {user.globalName || user.username}
            </Typography>
            <Typography sx={{ opacity: 0.8 }}>Discord ID: {user.discordId}</Typography>
          </Box>
        </Stack>
      </NeonCard>
    </Box>
  )
}
