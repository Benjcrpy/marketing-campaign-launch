import type { ReactNode } from "react";

export const metadata = {
  title: "Scenario 2 – Marketing Campaign Launch",
  description: "Setup + multi-agent chat for a marketing campaign launch team."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "ui-sans-serif, system-ui, -apple-system" }}>
        {children}
      </body>
    </html>
  );
}

