import { type ComponentChildren, type FunctionalComponent } from "preact";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { PageTitleProvider, usePageTitleSafe } from "./PageTitleContext";
import { useEffect, useState } from "preact/hooks";

interface MainLayoutProps {
  children: ComponentChildren;
  pageTitle?: string;
}

const SIDEBAR_COMPACT_BREAKPOINT = 980;
const SIDEBAR_STORAGE_KEY = "consultaTce.sidebarOpen";

const MainLayoutFrame: FunctionalComponent<{ children: ComponentChildren }> = ({ children }) => {
  const pageTitle = usePageTitleSafe();
  const [isCompactViewport, setIsCompactViewport] = useState(() => window.innerWidth <= SIDEBAR_COMPACT_BREAKPOINT);
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (window.innerWidth <= SIDEBAR_COMPACT_BREAKPOINT) {
      return false;
    }

    const savedValue = window.localStorage.getItem(SIDEBAR_STORAGE_KEY);
    return savedValue === "true";
  });

  useEffect(() => {
    const syncViewportState = () => {
      const compactViewport = window.innerWidth <= SIDEBAR_COMPACT_BREAKPOINT;
      setIsCompactViewport(compactViewport);

      // Em telas menores, a sidebar inicia e volta recolhida para preservar a area util.
      if (compactViewport) {
        setSidebarOpen(false);
      }
    };

    syncViewportState();
    window.addEventListener("resize", syncViewportState);

    return () => window.removeEventListener("resize", syncViewportState);
  }, []);

  useEffect(() => {
    if (!isCompactViewport) {
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(sidebarOpen));
    }
  }, [isCompactViewport, sidebarOpen]);

  return (
    <div class="app-frame">
      <Header pageTitle={pageTitle} />
      <div class={`decision-layout${sidebarOpen ? "" : " decision-layout--collapsed"}`}>
        <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen((current) => !current)} />
        <div class="decision-main">
          <main class="decision-content">{children}</main>
        </div>
      </div>
    </div>
  );
};

export const MainLayout: FunctionalComponent<MainLayoutProps> = ({ children, pageTitle }) => {
  return (
    <PageTitleProvider initialPageTitle={pageTitle}>
      <MainLayoutFrame>{children}</MainLayoutFrame>
    </PageTitleProvider>
  );
};
