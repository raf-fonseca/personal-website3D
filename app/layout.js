import "./globals.css";
import { CoinProvider } from "../contexts/CoinContext";
import GoogleAnalytics from "../components/GoogleAnalytics";

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
        <GoogleAnalytics />
        <CoinProvider>{children}</CoinProvider>
      </body>
    </html>
  );
}
