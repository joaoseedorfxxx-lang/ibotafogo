import React, { useState, useEffect } from "react";
import {
  Database,
  PlusCircle,
  UserPlus,
  Edit2,
  Trash2,
  Users,
  AlertTriangle,
} from "lucide-react";

export default function AdminArea() {
  const [mensagem, setMensagem] = useState("");
  const [jogadoresDb, setJogadoresDb] = useState([]);
  const [historico, setHistorico] = useState([]);
  const [editandoIndex, setEditandoIndex] = useState(null);

  const [formData, setFormData] = useState({
    partida: "",
    data: "",
    resultado: "",
  });

  const [novoJogador, setNovoJogador] = useState({
    nome: "",
    posicao: "Atacante",
  });

  const carregarDados = () => {
    fetch("http://localhost:3000/api/dados", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        // Trava de segurança: garante que seja um array para não dar tela branca
        if (data && data.jogadoresDisponiveis) {
          setJogadoresDb(data.jogadoresDisponiveis);
          setHistorico(data.dados || []);
        }
      })
      .catch((err) => console.error("Erro na API:", err));
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleRodadaChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSalvarRodada = async (e) => {
    e.preventDefault();
    setMensagem(
      editandoIndex !== null ? "Atualizando rodada..." : "Salvando rodada...",
    );

    const url =
      editandoIndex !== null
        ? `http://localhost:3000/api/dados/${editandoIndex}`
        : "http://localhost:3000/api/dados";
    const method = editandoIndex !== null ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMensagem(
          editandoIndex !== null
            ? "✅ Rodada atualizada com sucesso!"
            : "✅ Rodada salva! Cálculo automático realizado.",
        );
        setFormData({ partida: "", data: "", resultado: "" });
        setEditandoIndex(null);
        carregarDados();
      }
    } catch (error) {
      setMensagem("❌ Erro ao processar a rodada.");
    }
    setTimeout(() => setMensagem(""), 5000);
  };

  const handleAdicionarJogador = async (e) => {
    e.preventDefault();
    if (!novoJogador.nome) return;

    const id = novoJogador.nome.trim().replace(/\s+/g, "_");

    try {
      const response = await fetch("http://localhost:3000/api/jogadores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          nome: novoJogador.nome,
          posicao: novoJogador.posicao,
        }),
      });

      if (response.ok) {
        setMensagem(`✅ ${novoJogador.nome} adicionado ao banco!`);
        setNovoJogador({ nome: "", posicao: "Atacante" });
        carregarDados();
      }
    } catch (error) {
      setMensagem("❌ Erro ao adicionar jogador.");
    }
    setTimeout(() => setMensagem(""), 4000);
  };

  const handleEditarRodada = (index, rodada) => {
    setEditandoIndex(index);
    const novoFormData = {
      partida: rodada.partida || "",
      data: rodada.data || "",
      resultado: rodada.resultado || "",
    };

    jogadoresDb.forEach((jogador) => {
      if (rodada[jogador.id] !== undefined) {
        novoFormData[jogador.id] = rodada[jogador.id];
      }
    });

    setFormData(novoFormData);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeletarRodada = async (index) => {
    if (
      !window.confirm(
        "Tem certeza que deseja deletar esta rodada? O cálculo das variações será refeito automaticamente.",
      )
    )
      return;

    try {
      const response = await fetch(`http://localhost:3000/api/dados/${index}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setMensagem("✅ Rodada deletada e cálculos refeitos!");
        carregarDados();
      }
    } catch (error) {
      setMensagem("❌ Erro ao deletar rodada.");
    }
    setTimeout(() => setMensagem(""), 5000);
  };

  const handleDeletarJogador = async (id) => {
    if (
      !window.confirm(
        "Deseja realmente excluir este jogador? Ele não aparecerá mais como opção nas próximas rodadas.",
      )
    )
      return;

    try {
      const response = await fetch(
        `http://localhost:3000/api/jogadores/${id}`,
        {
          method: "DELETE",
        },
      );
      if (response.ok) {
        setMensagem("✅ Jogador removido!");
        carregarDados();
      }
    } catch (error) {
      setMensagem("❌ Erro ao remover jogador.");
    }
    setTimeout(() => setMensagem(""), 4000);
  };

  const handleLimparBanco = async () => {
    if (
      !window.confirm(
        "⚠️ ATENÇÃO: Tem certeza que deseja apagar TODOS os dados (jogadores e rodadas)? Esta ação não pode ser desfeita.",
      )
    )
      return;

    try {
      const response = await fetch("http://localhost:3000/api/reset", {
        method: "DELETE",
      });
      if (response.ok) {
        setMensagem("✅ Banco de dados completamente limpo!");
        carregarDados(); // Recarrega os dados imediatamente na tela
      }
    } catch (error) {
      setMensagem("❌ Erro ao limpar o banco de dados.");
    }
    setTimeout(() => setMensagem(""), 5000);
  };

  // Lógica de agrupamento por posições
  const posicoesOrdem = [
    "Treinador",
    "Goleiro",
    "Defensor",
    "Meio-campista",
    "Atacante",
    "Outros",
  ];
  const jogadoresAgrupados = jogadoresDb.reduce((acc, jogador) => {
    const pos = jogador.posicao || "Outros";
    if (!acc[pos]) acc[pos] = [];
    acc[pos].push(jogador);
    return acc;
  }, {});

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-2">
          <Database size={24} className="text-danger" />
          <h2 className="fw-bold mb-0 text-white">Gerenciador de Dados</h2>
        </div>
        <button
          className="btn btn-outline-danger btn-sm d-flex align-items-center gap-2 fw-bold"
          onClick={handleLimparBanco}
          title="Limpar todos os dados"
        >
          <AlertTriangle size={16} />
          Limpar Banco
        </button>
      </div>

      <div className="row">
        <div className="col-md-4 mb-4">
          <div
            className="card bg-dark text-white p-4 h-100"
            style={{ border: "1px solid var(--border-color)" }}
          >
            <h6 className="mb-3 d-flex align-items-center gap-2 text-secondary fw-bold">
              <UserPlus size={16} /> Adicionar ao Elenco
            </h6>
            <form onSubmit={handleAdicionarJogador}>
              <label className="form-label text-secondary small">
                Nome do Jogador
              </label>
              <input
                type="text"
                className="form-control bg-dark text-white mb-3"
                style={{ borderColor: "var(--border-color)" }}
                placeholder="Ex: Tiquinho Soares"
                value={novoJogador.nome}
                onChange={(e) =>
                  setNovoJogador({ ...novoJogador, nome: e.target.value })
                }
                required
              />

              <label className="form-label text-secondary small">Posição</label>
              <select
                className="form-select bg-dark text-white mb-4"
                style={{ borderColor: "var(--border-color)" }}
                value={novoJogador.posicao}
                onChange={(e) =>
                  setNovoJogador({ ...novoJogador, posicao: e.target.value })
                }
              >
                <option value="Treinador">Treinador</option>
                <option value="Goleiro">Goleiro</option>
                <option value="Defensor">Defensor</option>
                <option value="Meio-campista">Meio-campista</option>
                <option value="Atacante">Atacante</option>
              </select>

              <button
                type="submit"
                className="btn btn-outline-light w-100 btn-sm fw-bold mb-4"
              >
                Cadastrar Jogador
              </button>
            </form>

            <hr
              style={{ borderColor: "var(--border-color)" }}
              className="my-2"
            />

            <h6 className="mt-4 mb-3 d-flex align-items-center gap-2 text-secondary fw-bold">
              <Users size={16} /> Elenco Cadastrado ({jogadoresDb.length})
            </h6>
            <div className="pe-2">
              {posicoesOrdem.map((pos) => {
                if (
                  !jogadoresAgrupados[pos] ||
                  jogadoresAgrupados[pos].length === 0
                )
                  return null;
                return (
                  <div key={pos} className="mb-3">
                    <span
                      className={`small fw-bold text-uppercase ${pos === "Treinador" ? "text-warning" : "text-secondary"}`}
                    >
                      {pos === "Treinador"
                        ? "🌟 Treinador"
                        : pos + (pos === "Outros" ? "" : "s")}
                    </span>
                    <ul className="list-group list-group-flush mt-1">
                      {jogadoresAgrupados[pos].map((jogador) => (
                        <li
                          key={jogador.id}
                          className="list-group-item bg-transparent text-white border-secondary px-0 py-1 d-flex justify-content-between align-items-center"
                        >
                          <span style={{ fontSize: "0.9rem" }}>
                            {jogador.nome}
                          </span>
                          <button
                            type="button"
                            className="btn btn-sm btn-link text-danger p-0"
                            onClick={() => handleDeletarJogador(jogador.id)}
                            title="Deletar Jogador"
                          >
                            <Trash2 size={14} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
              {jogadoresDb.length === 0 && (
                <span className="text-secondary small">
                  Nenhum jogador cadastrado.
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-8">
          <div
            className="card bg-dark text-white p-4"
            style={{ border: "1px solid var(--border-color)" }}
          >
            <h5 className="mb-4 d-flex align-items-center gap-2">
              <PlusCircle size={18} className="text-secondary" />{" "}
              {editandoIndex !== null ? "Editar Rodada" : "Lançar Nova Rodada"}
            </h5>

            <form onSubmit={handleSalvarRodada}>
              <div className="row mb-4">
                <div className="col-md-4">
                  <label className="form-label text-secondary small fw-bold">
                    Adversário
                  </label>
                  <input
                    type="text"
                    className="form-control bg-dark text-white"
                    style={{ borderColor: "var(--border-color)" }}
                    name="partida"
                    value={formData.partida}
                    onChange={handleRodadaChange}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label text-secondary small fw-bold">
                    Data
                  </label>
                  <input
                    type="text"
                    className="form-control bg-dark text-white"
                    style={{ borderColor: "var(--border-color)" }}
                    name="data"
                    value={formData.data}
                    placeholder="DD/MM/AAAA"
                    onChange={handleRodadaChange}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label text-secondary small fw-bold">
                    Placar Final
                  </label>
                  <input
                    type="text"
                    className="form-control bg-dark text-white"
                    style={{ borderColor: "var(--border-color)" }}
                    name="resultado"
                    value={formData.resultado}
                    placeholder="Ex: 2x0"
                    onChange={handleRodadaChange}
                    required
                  />
                </div>
              </div>

              <hr
                style={{ borderColor: "var(--border-color)" }}
                className="my-4"
              />

              <h6 className="text-secondary mb-4 fw-bold">
                Notas da Partida (0 a 10)
              </h6>

              {posicoesOrdem.map((pos) => {
                if (
                  !jogadoresAgrupados[pos] ||
                  jogadoresAgrupados[pos].length === 0
                )
                  return null;
                return (
                  <div
                    key={pos}
                    className={`mb-4 ${pos === "Treinador" ? "p-3 rounded" : ""}`}
                    style={
                      pos === "Treinador"
                        ? {
                            backgroundColor: "rgba(255, 193, 7, 0.1)",
                            border: "1px solid #ffc107",
                          }
                        : {}
                    }
                  >
                    <h6
                      className={`mb-3 border-bottom pb-2 fw-bold ${pos === "Treinador" ? "text-warning border-warning" : "text-secondary border-secondary"}`}
                    >
                      {pos === "Treinador"
                        ? "🌟 Avaliação do Treinador"
                        : pos + (pos === "Outros" ? "" : "s")}
                    </h6>
                    <div className="row">
                      {jogadoresAgrupados[pos].map((jogador) => (
                        <div className="col-md-6 mb-3" key={jogador.id}>
                          <label className="form-label text-white small fw-bold">
                            {jogador.nome}
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="10"
                            className="form-control bg-dark text-white"
                            style={{ borderColor: "var(--border-color)" }}
                            name={jogador.id}
                            value={formData[jogador.id] || ""}
                            placeholder="Nota (Ex: 8.5)"
                            onChange={handleRodadaChange}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              <div className="mt-4 d-flex align-items-center gap-4">
                <button type="submit" className="btn btn-danger px-5 fw-bold">
                  {editandoIndex !== null
                    ? "Salvar Alterações"
                    : "Salvar Rodada no Banco"}
                </button>

                {editandoIndex !== null && (
                  <button
                    type="button"
                    className="btn btn-outline-light px-4 fw-bold"
                    onClick={() => {
                      setEditandoIndex(null);
                      setFormData({ partida: "", data: "", resultado: "" });
                    }}
                  >
                    Cancelar Edição
                  </button>
                )}

                {mensagem && (
                  <span className="fw-bold text-success">{mensagem}</span>
                )}
              </div>
            </form>
          </div>

          {/* Nova Área: Lista de Rodadas Salvas para Edição/Exclusão */}
          <div
            className="card bg-dark text-white p-4 mt-4"
            style={{ border: "1px solid var(--border-color)" }}
          >
            <h5 className="mb-4 d-flex align-items-center gap-2">
              <Database size={18} className="text-secondary" /> Histórico de
              Rodadas Salvas
            </h5>
            <div className="table-responsive">
              <table
                className="table table-dark table-hover mb-0"
                style={{ borderTop: "1px solid var(--border-color)" }}
              >
                <thead>
                  <tr>
                    <th className="text-secondary small fw-bold">Adversário</th>
                    <th className="text-secondary small fw-bold">Data</th>
                    <th className="text-secondary small fw-bold">Placar</th>
                    <th className="text-secondary small fw-bold text-end">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {historico.map((rodada, idx) => (
                    <tr key={idx}>
                      <td className="align-middle">{rodada.partida}</td>
                      <td className="align-middle">{rodada.data}</td>
                      <td className="align-middle">{rodada.resultado}</td>
                      <td className="align-middle text-end">
                        <button
                          className="btn btn-sm btn-outline-light me-2"
                          onClick={() => handleEditarRodada(idx, rodada)}
                          title="Editar"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeletarRodada(idx)}
                          title="Deletar"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {historico.length === 0 && (
                    <tr>
                      <td
                        colSpan="4"
                        className="text-center text-secondary py-3"
                      >
                        Nenhuma rodada registrada.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
