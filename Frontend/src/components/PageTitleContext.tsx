import { createContext } from "preact";
import { useContext, useState, type StateUpdater } from "preact/hooks";
import { type ComponentChildren, type FunctionalComponent } from "preact";

interface PageTitleContextValue {
  pageTitle: string | undefined;
  setPageTitle: StateUpdater<string | undefined>;
}

const PageTitleContext = createContext<PageTitleContextValue | undefined>(undefined);

export const PageTitleProvider: FunctionalComponent<{
  children: ComponentChildren;
  initialPageTitle?: string;
}> = ({ children, initialPageTitle }) => {
  const [pageTitle, setPageTitle] = useState<string | undefined>(initialPageTitle);

  return (
    <PageTitleContext.Provider value={{ pageTitle, setPageTitle }}>
      {children}
    </PageTitleContext.Provider>
  );
};

export const usePageTitle = () => {
  const context = useContext(PageTitleContext);

  if (!context) {
    throw new Error("usePageTitle must be used within a PageTitleProvider");
  }

  return context;
};

export const usePageTitleSafe = () => useContext(PageTitleContext)?.pageTitle;
