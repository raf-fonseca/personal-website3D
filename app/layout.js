import "./globals.css";
import { StepProvider } from "../contexts/StepContext";
import { CoinProvider } from "../contexts/CoinContext";

export const metadata = {
  title: "Raf's Personal Website",
  description: "Raf's 3D personal website!",
  icons: {
    icon: "/personal.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <StepProvider>
          <CoinProvider>{children}</CoinProvider>
        </StepProvider>
      </body>
    </html>
  );
}
