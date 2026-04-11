import { type ComponentChildren, type FunctionalComponent } from "preact";

export const Panel: FunctionalComponent<{
  title: string;
  subtitle?: string;
  children: ComponentChildren;
}> = ({ title, subtitle, children }) => (
  <section class="panel">
    <div class="panel-heading">
      <h2>{title}</h2>
      {subtitle ? <p>{subtitle}</p> : null}
    </div>
    {children}
  </section>
);
