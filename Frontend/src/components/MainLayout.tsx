import { type ComponentChildren, type FunctionalComponent } from "preact";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { PageTitleProvider, usePageTitleSafe } from "./PageTitleContext";
import { useEffect, useState } from "preact/hooks";

interface MainLayoutProps {
  children: ComponentChildren;
  pageTitle?: string;
}

const MainLayoutFrame: FunctionalComponent<{ children: ComponentChildren }> = ({ children }) => {
  const pageTitle = usePageTitleSafe();
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const savedValue = window.localStorage.getItem("consultaTce.sidebarOpen");
    return savedValue === "true";
  });

  useEffect(() => {
    window.localStorage.setItem("consultaTce.sidebarOpen", String(sidebarOpen));
  }, [sidebarOpen]);

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
