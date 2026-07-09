"use client";

import { motion } from "framer-motion";
import { RotateCcw, AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem",
          background: "#0A0A0A",
          color: "#F5F1EA",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        <motion.div
          className="relative w-full max-w-md"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ textAlign: "center" }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.03)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "16px",
              padding: "32px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                margin: "0 auto 16px",
                borderRadius: "50%",
                background: "rgba(245, 158, 11, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AlertTriangle size={20} color="#f59e0b" />
            </div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 600, margin: "0 0 8px" }}>
              Something broke.
            </h2>
            <p style={{ fontSize: "13px", opacity: 0.6, marginBottom: "24px", lineHeight: 1.5 }}>
              The app hit a critical error. Your data is safe. Try again, or reset.
            </p>
            <div style={{ display: "flex", gap: "8px", flexDirection: "column" }}>
              <button
                onClick={reset}
                style={{
                  padding: "10px 16px",
                  borderRadius: "8px",
                  background: "#39CFA2",
                  color: "#0A0A0A",
                  border: "0",
                  fontSize: "13px",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Try again
              </button>
              <button
                onClick={() => {
                  try { localStorage.clear(); } catch {}
                  window.location.reload();
                }}
                style={{
                  padding: "10px 16px",
                  borderRadius: "8px",
                  background: "rgba(255,255,255,0.04)",
                  color: "#F5F1EA",
                  border: "1px solid rgba(255,255,255,0.08)",
                  fontSize: "13px",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Reset everything
              </button>
            </div>
          </div>
          <p style={{ textAlign: "center", marginTop: "24px", fontSize: "14px", opacity: 0.4, fontStyle: "italic" }}>
            Technology disappears. Care remains.
          </p>
        </motion.div>
      </body>
    </html>
  );
}
