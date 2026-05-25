// GSD Pi Config - Web application routes
// Copyright (c) 2026 Jeremy McSpadden <jeremy@fluxlabs.net>

import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { WebApp } from "./WebApp";
import { GalleryPage } from "./pages/GalleryPage";
import { OAuthCallbackPage } from "./pages/OAuthCallbackPage";
import { WizardPage } from "./pages/WizardPage";

export default function App() {
  const basename = import.meta.env.BASE_URL.replace(/\/$/, "") || "/";
  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/" element={<WebApp />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/new" element={<WizardPage />} />
        <Route path="/edit" element={<Navigate to="/" replace />} />
        <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Analytics />
    </BrowserRouter>
  );
}
