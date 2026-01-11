import React from "react"
import { Box, Typography } from "@mui/material"

export default function SectionHeader({ title, subtitle, icon }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mb: 2 }}>
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: 3,
          display: "grid",
          placeItems: "center",
          background: "linear-gradient(135deg, rgba(124,92,255,0.25), rgba(0,229,255,0.15))",
          border: "1px solid rgba(255,255,255,0.14)",
          boxShadow: "0 18px 60px rgba(0,0,0,0.42)"
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: 0.2 }}>
          {title}
        </Typography>
        <Typography sx={{ opacity: 0.78 }}>{subtitle}</Typography>
      </Box>
    </Box>
  )
}
