import { type FunctionalComponent } from "preact";
import { useEffect, useMemo, useState } from "preact/hooks";
import { Icon, type IconName } from "./Icon";

interface SidebarChildItem {
  label: string;
  href: string;
  icon: IconName;
}

interface SidebarItem {
  label: string;
  href?: string;
  icon: IconName;
  children?: SidebarChildItem[];
}

const processLabel = "Processos";
const consultationLabel = "Consultas";

const menuGroups: { title: string; items: SidebarItem[] }[] = [
  {
    title: "Principal",
    items: [
      { label: "Inicio", href: "/", icon: "home" },
      { label: "Upload de historico", href: "/upload-de-historico", icon: "upload" },
      {
        label: processLabel,
        icon: "file",
        children: [{ label: "Consulta do contrato", href: "/consulta-de-contrato", icon: "search" }],
      },
      {
        label: consultationLabel,
        icon: "search",
        children: [{ label: "API TCE", href: "/api-tce", icon: "search" }],
      },
      { label: "Unidades Funcionais", href: "#", icon: "bank" },
      { label: "Documentos", href: "#", icon: "file" },
      { label: "Relatorios", href: "#", icon: "chart" },
      { label: "Usuarios", href: "#", icon: "user" },
    ],
  },
];

export const Sidebar: FunctionalComponent<{ open: boolean; onToggle: () => void }> = ({ open, onToggle }) => {
  const currentPath = window.location.pathname;
  const [searchTerm, setSearchTerm] = useState("");

  // Mantem o submenu de aquisicoes aberto na rota filha ou apos interacao do usuario.
  const defaultExpanded = currentPath === "/consulta-de-contrato" || currentPath === "/api-tce";
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const savedValue = window.localStorage.getItem("consultaTce.sidebarGroups");

    if (savedValue) {
      try {
        return JSON.parse(savedValue) as Record<string, boolean>;
      } catch {
        // Cai para o estado padrao caso o localStorage esteja invalido.
      }
    }

    return {
      [processLabel]: currentPath === "/consulta-de-contrato",
      [consultationLabel]: defaultExpanded,
    };
  });

  const groups = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return menuGroups;
    }

    return menuGroups
      .map((group) => ({
        ...group,
        items: group.items.flatMap((item) => {
          const itemMatches = item.label.toLowerCase().includes(normalizedSearch);

          if (!item.children?.length) {
            return itemMatches ? [item] : [];
          }

          const matchingChildren = item.children.filter((child) =>
            child.label.toLowerCase().includes(normalizedSearch),
          );

          if (itemMatches || matchingChildren.length > 0) {
            return [
              {
                ...item,
                children: itemMatches ? item.children : matchingChildren,
              },
            ];
          }

          return [];
        }),
      }))
      .filter((group) => group.items.length > 0);
  }, [searchTerm]);

  const toggleGroup = (label: string) => {
    setOpenGroups((current) => {
      if (!open) {
        return {
          [processLabel]: false,
          [consultationLabel]: false,
          [label]: !current[label],
        };
      }

      return {
        ...current,
        [label]: !current[label],
      };
    });
  };

  useEffect(() => {
    window.localStorage.setItem("consultaTce.sidebarGroups", JSON.stringify(openGroups));
  }, [openGroups]);

  return (
    <aside class={`app-sidebar${open ? "" : " app-sidebar--collapsed"}`}>
      <div class="app-sidebar__top">
        <div class="app-sidebar__toggle">
          <button class="sidebar-toggle-button" type="button" onClick={onToggle} aria-label="Alternar menu">
            <span class="sidebar-toggle-button__icon">
              <Icon name="menu" className="sidebar-svg-icon" />
            </span>
            {open ? <span class="sidebar-toggle-button__label">Diminuir menu</span> : null}
          </button>
        </div>

        {open ? (
          <label class="app-sidebar__search">
            <span>Buscar no menu...</span>
            <input value={searchTerm} onInput={(event) => setSearchTerm(event.currentTarget.value)} />
          </label>
        ) : null}
      </div>

      <nav class="app-sidebar__nav" aria-label="Menu principal">
        {groups.map((group) => (
          <section key={group.title} class="sidebar-group">
            {open ? <small>{group.title}</small> : null}

            {group.items.map((item) => {
              const hasChildren = Boolean(item.children?.length);
              const groupOpen = hasChildren ? openGroups[item.label] ?? false : false;
              const childActive = item.children?.some((child) => child.href === currentPath) ?? false;
              const itemActive = item.href ? currentPath === item.href : childActive;

              if (hasChildren) {
                return (
                  <div key={item.label} class="sidebar-branch">
                    <button
                      class={`sidebar-link sidebar-link--branch${itemActive ? " is-active" : ""}${open ? "" : " is-icon-only"}`}
                      type="button"
                      title={item.label}
                      onClick={() => toggleGroup(item.label)}
                    >
                      <span class="sidebar-link__icon">
                        <Icon name={item.icon} className="sidebar-svg-icon" />
                      </span>

                      {open ? (
                        <>
                          <span class="sidebar-link__label">{item.label}</span>
                          <span class={`sidebar-link__caret${groupOpen ? " is-open" : ""}`} aria-hidden="true">
                            <svg viewBox="0 0 24 24">
                              <path d="M7 10l5 5 5-5z" fill="currentColor" />
                            </svg>
                          </span>
                        </>
                      ) : null}
                    </button>

                    {groupOpen ? (
                      <div class={`sidebar-submenu${open ? "" : " sidebar-submenu--floating"}`}>
                        {item.children?.map((child) => (
                          <a
                            key={child.label}
                            class={`sidebar-link sidebar-link--child${currentPath === child.href ? " is-active" : ""}`}
                            href={child.href}
                            title={child.label}
                          >
                            <span class="sidebar-link__icon">
                              <Icon name={child.icon} className="sidebar-svg-icon" />
                            </span>
                            <span class="sidebar-link__label">{child.label}</span>
                          </a>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              }

              return (
                <a
                  key={item.label}
                  class={`sidebar-link${itemActive ? " is-active" : ""}${open ? "" : " is-icon-only"}`}
                  href={item.href}
                  title={item.label}
                >
                  <span class="sidebar-link__icon">
                    <Icon name={item.icon} className="sidebar-svg-icon" />
                  </span>
                  {open ? <span class="sidebar-link__label">{item.label}</span> : null}
                </a>
              );
            })}
          </section>
        ))}
      </nav>
    </aside>
  );
};
