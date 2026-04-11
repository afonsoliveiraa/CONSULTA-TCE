import { type FunctionalComponent } from "preact";

export const SearchIcon: FunctionalComponent = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M15.5 14h-.79l-.28-.27a6 6 0 10-.71.71l.27.28v.79L20 20.5 21.5 19l-6-5zm-5.5 0A4.5 4.5 0 1114.5 9 4.5 4.5 0 0110 14z"
      fill="currentColor"
    />
  </svg>
);

export const ColumnsIcon: FunctionalComponent = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M3 5h5v14H3V5zm6.5 0h5v14h-5V5zM16 5h5v14h-5V5z" fill="currentColor" />
  </svg>
);

export const DownloadIcon: FunctionalComponent = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 20h14v-2H5v2zm7-18v10.17l3.59-3.58L17 10l-5 5-5-5 1.41-1.41L11 12.17V2h1z" fill="currentColor" />
  </svg>
);

export const SortIcon: FunctionalComponent<{ active?: boolean }> = ({ active }) => (
  <svg class={`grid-demo__sort-svg${active ? " is-active" : ""}`} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M7 14l5 5 5-5H7z" fill="currentColor" opacity={active ? "1" : "0.42"} />
    <path d="M7 10l5-5 5 5H7z" fill="currentColor" opacity="0.42" />
  </svg>
);
