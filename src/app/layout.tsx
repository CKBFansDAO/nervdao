import "./globals.css";
import { Work_Sans, Play } from "next/font/google";
import { Metadata } from "next";
import Script from "next/script";
import { LayoutProvider } from "./layoutProvider";

export const metadata: Metadata = {
  title: "NervDAO",
  description: "A Universal Wallet-Interfaced Nervos DAO Portal",
  icons: "/favicon.svg",
};

const workSans = Work_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-work-sans",
});

const play = Play({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-play",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/*
          cross-fetch's browser ponyfill exports a detached reference to
          `window.fetch`. Some bundled RPC libraries (e.g. @ckb-lumos/rpc)
          invoke it as `someObject.fetch(...)`, which sets `this` to that
          object instead of `window`, causing native fetch's brand check to
          throw "Failed to execute 'fetch' on 'Window': Illegal invocation".
          Re-binding `window.fetch` here, before any bundled JS runs, makes
          the reference safe to call regardless of its receiver.
        */}
        <Script id="fetch-rebind" strategy="beforeInteractive">
          {`if (window.fetch) { window.fetch = window.fetch.bind(window); }`}
        </Script>
      </head>
      <body className={`${workSans.variable} ${play.variable}`}>
        <LayoutProvider>{children}</LayoutProvider>
      </body>
    </html>
  );
}
