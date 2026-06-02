import React, { useState } from "react";

export default function FilterPopover({
  jogadores,
  selecionados,
  toggleJogador,
  selecionarTodos,
  deselecionarTodos,
}) {
  const [filtroPosicao, setFiltroPosicao] = useState("Todas");

  // Lógica de agrupamento por posições
  const posicoesOrdem = [
    "Treinador",
    "Goleiro",
    "Defensor",
    "Meio-campista",
    "Atacante",
    "Outros",
  ];

  const jogadoresAgrupados = jogadores.reduce((acc, jogador) => {
    const pos = jogador.posicao || "Outros";
    if (!acc[pos]) acc[pos] = [];
    acc[pos].push(jogador);
    return acc;
  }, {});

  return (
    <div
      className="position-absolute top-100 start-0 mt-3 p-4 rounded shadow-lg z-3"
      style={{
        backgroundColor: "var(--bg-popover)",
        border: "1px solid var(--border-color)",
        width: "350px",
        maxHeight: "550px",
        overflowY: "auto",
        boxShadow: "0px 15px 50px rgba(0,0,0,0.9)",
      }}
    >
      <header className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="mb-0 fw-bold text-white">Filtrar Jogadores</h6>
      </header>

      {/* Novo Select para Filtrar por Posição */}
      <select
        className="form-select form-select-sm bg-dark text-white mb-3 shadow-none"
        style={{ borderColor: "var(--border-color)", cursor: "pointer" }}
        value={filtroPosicao}
        onChange={(e) => setFiltroPosicao(e.target.value)}
      >
        <option value="Todas">Mostrar Todas as Posições</option>
        {posicoesOrdem.map((pos) => {
          if (!jogadoresAgrupados[pos] || jogadoresAgrupados[pos].length === 0)
            return null;
          return (
            <option key={pos} value={pos}>
              {pos === "Treinador"
                ? "Treinadores"
                : pos + (pos === "Outros" ? "" : "s")}
            </option>
          );
        })}
      </select>

      {/* Botões de Seleção em Massa */}
      <div className="d-flex gap-2 mb-4 pb-3 border-bottom border-dark">
        <button
          className="btn btn-sm btn-outline-light flex-grow-1 fw-bold"
          onClick={selecionarTodos}
          style={{ fontSize: "0.8rem" }}
        >
          Selecionar Todos
        </button>
        <button
          className="btn btn-sm btn-outline-danger flex-grow-1 fw-bold"
          onClick={deselecionarTodos}
          style={{ fontSize: "0.8rem" }}
        >
          Limpar Tudo
        </button>
      </div>

      <div className="pe-1">
        {posicoesOrdem.map((pos) => {
          if (!jogadoresAgrupados[pos] || jogadoresAgrupados[pos].length === 0)
            return null;

          // Esconde a categoria se ela não corresponder ao filtro selecionado
          if (filtroPosicao !== "Todas" && filtroPosicao !== pos) return null;

          return (
            <div key={pos} className="mb-4">
              <div
                className={`small fw-bold mb-3 border-bottom pb-1 ${
                  pos === "Treinador"
                    ? "text-warning border-warning"
                    : "text-secondary border-secondary"
                }`}
              >
                {pos === "Treinador"
                  ? "🌟 Treinador"
                  : pos + (pos === "Outros" ? "" : "s")}
              </div>
              <div className="d-flex flex-column gap-2">
                {jogadoresAgrupados[pos].map((jogador) => (
                  <label
                    key={jogador.id}
                    className="d-flex align-items-center gap-2 cursor-pointer m-0"
                  >
                    <input
                      className="form-check-input m-0 bg-dark border-secondary"
                      type="checkbox"
                      checked={selecionados.includes(jogador.id)}
                      onChange={() => toggleJogador(jogador.id)}
                      style={{ cursor: "pointer" }}
                    />
                    <span
                      className="text-white"
                      style={{
                        fontSize: "0.85rem",
                        cursor: "pointer",
                        userSelect: "none",
                      }}
                    >
                      {jogador.nome}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          );
        })}

        {jogadores.length === 0 && (
          <p className="text-secondary small mb-0 text-center">
            Nenhum jogador cadastrado.
          </p>
        )}
      </div>
    </div>
  );
}
