import React from "react"
import { Card, CardContent } from "@mui/material"
import { fx } from "../styles/fx.js"

export default function NeonCard({ children, sx }) {
  return (
    <Card
      elevation={0}
      sx={{
        ...fx.glass,
        ...fx.glowBorder,
        borderRadius: 4,
        overflow: "hidden",
        position: "relative",
        "&:before": {
          content: '""',
          position: "absolute",
          inset: 0,
          background: "radial-gradient(800px 220px at 20% 0%, rgba(124,92,255,0.22), transparent 60%), radial-gradient(700px 220px at 80% 100%, rgba(0,229,255,0.18), transparent 60%)",
          pointerEvents: "none"
        },
        ...sx
      }}
    >
      <CardContent sx={{ position: "relative" }}>{children}</CardContent>
    </Card>
  )
}
