import * as React from "react";
import Stack from "@mui/material/Stack";
import "./Header.css";

export default function Header() {
  return (
    <Stack spacing={2} sx={{ flexGrow: 1 }}>
      <div className="header-outer-container">
        <section className="header-container">
          <img src="assets/conrad-labs-logo.png" alt="" />
          <div className="heading">Voice Assistant</div>
          <div className="beta">BETA</div>
        </section>
        <div className="bot-version">v1.5</div>
      </div>
    </Stack>
  );
}
