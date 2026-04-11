import { type FunctionalComponent } from "preact";

export type IconName =
  | "menu"
  | "upload"
  | "home"
  | "file"
  | "bank"
  | "search"
  | "chart"
  | "user"
  | "bell"
  | "globe"
  | "settings"
  | "logout";

export const Icon: FunctionalComponent<{ name: IconName; className?: string }> = ({ name, className }) => {
  const filled = {
    viewBox: "0 0 24 24",
    fill: "currentColor",
    class: className,
    "aria-hidden": "true",
  };

  switch (name) {
    case "menu":
      return <svg {...filled}><path d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z" /></svg>;
    case "upload":
      return <svg {...filled}><path d="M5 20h14v-2H5zm7-18-5 5 1.41 1.41L11 5.83V16h2V5.83l2.59 2.58L17 7z" /></svg>;
    case "home":
      return <svg {...filled}><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg>;
    case "file":
      return <svg {...filled}><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8zm0 7V3.5L19.5 9zM8 13h8v2H8zm0 4h8v2H8z" /></svg>;
    case "bank":
      return <svg {...filled}><path d="M12 3 1 9v2h22V9zm2 10h3v6h-3zm-7 0h3v6H7zm12 8H3v-2h18z" /></svg>;
    case "search":
      return <svg {...filled}><path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16a6.47 6.47 0 0 0 4.23-1.57l.27.28v.79L19 20.5 20.5 19zM9.5 14A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14" /></svg>;
    case "chart":
      return <svg {...filled}><path d="M3 13h4v8H3zm7-6h4v14h-4zm7 3h4v11h-4z" /></svg>;
    case "user":
      return <svg {...filled}><path d="M12 12c2.76 0 5-2.24 5-5S14.76 2 12 2 7 4.24 7 7s2.24 5 5 5m0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5" /></svg>;
    case "bell":
      return <svg {...filled}><path d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22m6-6V11a6 6 0 1 0-12 0v5L4 18v1h16v-1z" /></svg>;
    case "globe":
      return <svg {...filled}><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2m6.93 6h-2.95a15.7 15.7 0 0 0-1.38-3.56A8.04 8.04 0 0 1 18.93 8M12 4.04A13.6 13.6 0 0 1 13.89 8h-3.78A13.6 13.6 0 0 1 12 4.04M4.25 14A7.9 7.9 0 0 1 4 12c0-.69.09-1.35.25-2h3.22A16.5 16.5 0 0 0 7.3 12c0 .69.06 1.36.17 2zm.82 2h2.95a15.7 15.7 0 0 0 1.38 3.56A8.04 8.04 0 0 1 5.07 16M8.02 8H5.07a8.04 8.04 0 0 1 4.33-3.56A15.7 15.7 0 0 0 8.02 8M12 19.96A13.6 13.6 0 0 1 10.11 16h3.78A13.6 13.6 0 0 1 12 19.96M14.32 14H9.68A14.7 14.7 0 0 1 9.5 12c0-.68.07-1.35.18-2h4.64c.11.65.18 1.32.18 2 0 .68-.07 1.35-.18 2m.28 5.56A15.7 15.7 0 0 0 15.98 16h2.95a8.04 8.04 0 0 1-4.33 3.56M16.53 14c.11-.64.17-1.31.17-2s-.06-1.36-.17-2h3.22c.16.65.25 1.31.25 2s-.09 1.35-.25 2z" /></svg>;
    case "settings":
      return <svg {...filled}><path d="m19.14 12.94.04-.94-.04-.94 2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.3 7.3 0 0 0-1.63-.94L14.4 2.8a.5.5 0 0 0-.49-.4h-3.82a.5.5 0 0 0-.49.4l-.36 2.52c-.57.22-1.11.53-1.63.94l-2.39-.96a.5.5 0 0 0-.6.22L2.7 8.84a.5.5 0 0 0 .12.64l2.03 1.58-.04.94.04.94-2.03 1.58a.5.5 0 0 0-.12.64l1.92 3.32c.13.22.39.31.6.22l2.39-.96c.5.4 1.05.72 1.63.94l.36 2.52c.04.24.25.4.49.4h3.82c.24 0 .45-.16.49-.4l.36-2.52c.57-.22 1.12-.54 1.63-.94l2.39.96c.22.09.47 0 .6-.22l1.92-3.32a.5.5 0 0 0-.12-.64zM12 15.5A3.5 3.5 0 1 1 15.5 12 3.5 3.5 0 0 1 12 15.5" /></svg>;
    case "logout":
      return <svg {...filled}><path d="M10.09 15.59 11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67z" /><path d="M19 3H5a2 2 0 0 0-2 2v4h2V5h14v14H5v-4H3v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2" /></svg>;
  }
};
