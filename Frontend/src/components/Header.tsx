import { type FunctionalComponent } from "preact";
import headerLogo from "../assets/images/brave_BaUXFU5hjr-removebg-preview.png";

interface HeaderProps {
  pageTitle?: string;
}

export const Header: FunctionalComponent<HeaderProps> = () => {
  return (
    <header class="app-header">
      <div class="app-header__brand">
        <img src={headerLogo} alt="Consulta TCM" />
        <strong>Consulta TCM</strong>
      </div>
    </header>
  );
};
