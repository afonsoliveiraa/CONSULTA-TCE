import { type FunctionalComponent } from "preact";

// Tela padrao para rotas desconhecidas dentro do frontend.
export const NotFoundPage: FunctionalComponent = () => (
  <>
    <div class="contracts-page__title">
      <div>
        <span class="contracts-card__kicker">ConsultaTCE</span>
        <h1>Pagina nao encontrada</h1>
        <p>A rota solicitada nao existe neste frontend.</p>
      </div>
    </div>

    <div class="contracts-empty">
      <strong>Rota nao encontrada.</strong>
      <p>Acesse a tela pelo menu lateral.</p>
    </div>
  </>
);
