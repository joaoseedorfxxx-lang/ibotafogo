import React, { useState, useEffect } from "react";
import LineChartContainer from "./LineChartContainer";
import FilterPopover from "./FilterPopover";
import ActionToolbar from "./ActionToolbar";
import {
  BarChart2,
  Users,
  CalendarDays,
  Activity,
  Trophy,
  Award,
  XCircle,
  Search,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

const dashboardData = {
  estatisticasGerais: {
    titulo: "Estatísticas Gerais",
    dados: [
      { label: "Jogadores", valor: 37 },
      { label: "Partidas", valor: 31 },
      { label: "Avaliações", valor: 517 },
      { label: "Premiações", valor: 50 },
    ],
  },
  premiacoes: {
    titulo: "Premiações",
    destaques: [
      {
        categoria: 'Mais "Craques da partida"',
        jogador: "Thiago Mendes",
        valor: 6,
        tipoBadge: "success",
      },
      {
        categoria: 'Mais "Bagres da partida"',
        jogador: "Brenner",
        valor: 4,
        tipoBadge: "danger",
      },
    ],
  },
  rankingPerformance: {
    titulo: "Ranking de Performance",
    rankings: [
      {
        categoria: "Melhor Média",
        jogador: "Thiago Mendes",
        valor: "+0.52",
        tipoBadge: "success",
      },
      {
        categoria: "Pior Média",
        jogador: "Brenner",
        valor: "-0.74",
        tipoBadge: "danger",
      },
      {
        categoria: "Mais Ativo",
        jogador: "Léo Jardim",
        valor: "29 jogos",
        tipoBadge: "primary",
      },
    ],
  },
  melhoresPartidas: {
    titulo: "Melhores Partidas",
    partidas: [
      {
        adversario: "Palmeiras",
        resultado: "2x1",
        data: "12/03/2026",
        mando: "Casa",
        pontuacao: "+0.59",
        tipoBadge: "success",
      },
      {
        adversario: "Athlético Paranaense",
        resultado: "1x0",
        data: "10/05/2026",
        mando: "Casa",
        pontuacao: "+0.47",
        tipoBadge: "success",
      },
      {
        adversario: "Grêmio",
        resultado: "2x1",
        data: "22/03/2026",
        mando: "Casa",
        pontuacao: "+0.35",
        tipoBadge: "success",
      },
    ],
  },
  pioresPartidas: {
    titulo: "Piores Partidas",
    partidas: [
      {
        adversario: "Red Bull Bragantino",
        resultado: "0x3",
        data: "24/05/2026",
        mando: "Casa",
        pontuacao: "-1.06",
        tipoBadge: "danger",
      },
      {
        adversario: "Internacional",
        resultado: "4x1",
        data: "16/05/2026",
        mando: "Fora",
        pontuacao: "-1.06",
        tipoBadge: "danger",
      },
      {
        adversario: "Botafogo",
        resultado: "1x2",
        data: "04/04/2026",
        mando: "Casa",
        pontuacao: "-0.80",
        tipoBadge: "danger",
      },
    ],
  },
};

export default function Dashboard() {
  const [dadosGrafico, setDadosGrafico] = useState([]);
  const [jogadores, setJogadores] = useState([]);
  const [jogadoresSelecionados, setJogadoresSelecionados] = useState([]);
  const [mostrarFiltro, setMostrarFiltro] = useState(false);

  // Cálculos dinâmicos para Estatísticas Gerais com base no banco de dados
  const totalJogadores = jogadores.length;
  const totalPartidas = dadosGrafico.length;
  const totalAvaliacoes = dadosGrafico.reduce((acc, rodada) => {
    return (
      acc +
      jogadores.filter((j) => rodada[j.id] != null && !isNaN(rodada[j.id]))
        .length
    );
  }, 0);
  const totalPremiacoes = dadosGrafico.reduce((acc, rodada) => {
    return acc + jogadores.filter((j) => rodada[j.id] >= 8.0).length; // Considera "Premiação" notas >= 8.0
  }, 0);

  const estatisticasDinamicas = [
    { label: "Jogadores", valor: totalJogadores },
    { label: "Partidas", valor: totalPartidas },
    { label: "Avaliações", valor: totalAvaliacoes },
    { label: "Premiações (8.0+)", valor: totalPremiacoes },
  ];

  useEffect(() => {
    fetch("http://localhost:3000/api/dados", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        // Ordena os dados pela data de forma crescente (DD/MM/AAAA)
        const dadosOrdenados = (data.dados || []).sort((a, b) => {
          const parseData = (dataStr) => {
            if (!dataStr) return 0;
            const partes = dataStr.split("/");
            if (partes.length === 3) {
              return new Date(partes[2], partes[1] - 1, partes[0]).getTime();
            }
            return 0;
          };
          return parseData(a.data) - parseData(b.data);
        });

        // Formata os dados para garantir que o gráfico reconheça o adversário
        const dadosFormatados = dadosOrdenados.map((rodada) => ({
          ...rodada,
          name: rodada.partida, // Atributo padrão lido por bibliotecas como Recharts no eixo X
        }));
        setDadosGrafico(dadosFormatados);
        setJogadores(data.jogadoresDisponiveis);
        // Seleciona todos por padrão
        setJogadoresSelecionados(data.jogadoresDisponiveis.map((j) => j.id));
      });
  }, []);

  const toggleJogador = (id) => {
    setJogadoresSelecionados((prev) =>
      prev.includes(id) ? prev.filter((j) => j !== id) : [...prev, id],
    );
  };

  const selecionarTodos = () => {
    setJogadoresSelecionados(jogadores.map((j) => j.id));
  };

  const deselecionarTodos = () => {
    setJogadoresSelecionados([]);
  };

  const selecionarAtivosUltimas10 = () => {
    const ultimas10 = dadosGrafico.slice(-10);
    const ativos = jogadores
      .filter((j) =>
        ultimas10.some(
          (rodada) => rodada[j.id] != null && !isNaN(rodada[j.id]),
        ),
      )
      .map((j) => j.id);
    setJogadoresSelecionados(ativos);
  };

  return (
    <div className="container-fluid p-4">
      {/* 1. Header Principal */}
      <header className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center gap-4">
          <div className="text-center">
            <h1
              className="fw-bold mb-0 text-white"
              style={{ fontSize: "1.5rem", letterSpacing: "-1px" }}
            >
              IBOTAFOGO.
            </h1>
            <span
              className="text-secondary small fw-bold"
              style={{ fontSize: "0.8rem" }}
            >
              TEMPORADA 2026
            </span>
          </div>

          {/* Botões de Alternância (Toggles) */}
          <div className="btn-group btn-toggle-group" role="group">
            <button type="button" className="btn btn-sm btn-dark active px-3">
              IBOTAFOGO
            </button>
            <button type="button" className="btn btn-sm btn-dark px-3">
              DataGol
            </button>
          </div>

          <div className="btn-group btn-toggle-group" role="group">
            <button type="button" className="btn btn-sm btn-dark px-3">
              2025
            </button>
            <button type="button" className="btn btn-sm btn-dark active px-3">
              2026
            </button>
          </div>
        </div>

        {/* Logotipos de Parceria */}
        <div className="d-flex align-items-center gap-2">
          {/* Logo Principal do Botafogo */}
          <img
            src="/src/assets/botafogo-logo.png"
            alt="Botafogo"
            height="40"
            onError={(e) => (e.target.style.display = "none")}
          />

          {/* Logo do Parceiro - Expresso 1923 */}
          <div
            className="d-flex align-items-center gap-1 border border-secondary rounded p-2"
            style={{ borderColor: "#333 !important" }}
          >
            <img
              src="/src/assets/expresso-logo.png"
              alt="Expresso"
              height="20"
              onError={(e) => (e.target.style.display = "none")}
            />
            <span
              className="fw-bold text-white small"
              style={{ fontStyle: "italic", fontSize: "0.8rem" }}
            >
              Expresso 1923
            </span>
          </div>
        </div>
      </header>

      {/* 2. Barra de Ações Dedicada */}
      <div className="position-relative mb-3">
        <div className="d-flex align-items-center gap-2">
          <ActionToolbar
            setMostrarFiltro={setMostrarFiltro}
            mostrarFiltro={mostrarFiltro}
          />
          <button
            className="btn btn-outline-info btn-sm d-flex align-items-center gap-2 fw-bold"
            onClick={selecionarAtivosUltimas10}
            title="Mostrar apenas atletas que atuaram nas últimas 10 rodadas"
          >
            <Activity size={16} />
            Ativos (Últimos 10 Jogos)
          </button>
        </div>

        {mostrarFiltro && (
          <FilterPopover
            jogadores={jogadores}
            selecionados={jogadoresSelecionados}
            toggleJogador={toggleJogador}
            selecionarTodos={selecionarTodos}
            deselecionarTodos={deselecionarTodos}
          />
        )}
      </div>

      {/* 3. Gráfico Polido */}
      <div
        className="chart-wrapper p-3"
        style={{ minHeight: "1200px", width: "100%" }}
      >
        <LineChartContainer
          dados={dadosGrafico}
          jogadores={jogadores}
          selecionados={jogadoresSelecionados}
        />
      </div>

      {/* 4. Dashboard Stats / Cards Inferiores */}
      <div className="row mt-4">
        {/* Bloco 1: Estatísticas Gerais */}
        <div className="col-lg-2 col-md-4 mb-3">
          <div
            className="card bg-dark text-white border-secondary h-100"
            style={{ borderColor: "var(--border-color) !important" }}
          >
            <div className="card-body p-3">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h6
                  className="card-title mb-0 fw-bold"
                  style={{ fontSize: "0.85rem" }}
                >
                  {dashboardData.estatisticasGerais.titulo}
                </h6>
                <BarChart2 size={16} className="text-secondary" />
              </div>
              <ul className="list-unstyled mb-0 small">
                {estatisticasDinamicas.map((item, i) => {
                  const Icon =
                    i === 0
                      ? Users
                      : i === 1
                        ? CalendarDays
                        : i === 2
                          ? Activity
                          : Trophy;
                  return (
                    <li
                      key={i}
                      className="d-flex justify-content-between align-items-center mb-3"
                    >
                      <span className="text-secondary d-flex align-items-center gap-2">
                        <Icon size={14} /> {item.label}
                      </span>
                      <span className="badge text-bg-secondary rounded-1">
                        {item.valor}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>

        {/* Bloco 2: Premiações */}
        <div className="col-lg-2 col-md-4 mb-3">
          <div
            className="card bg-dark text-white border-secondary h-100"
            style={{ borderColor: "var(--border-color) !important" }}
          >
            <div className="card-body p-3">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h6
                  className="card-title mb-0 fw-bold"
                  style={{ fontSize: "0.85rem" }}
                >
                  {dashboardData.premiacoes.titulo}
                </h6>
                <Trophy size={16} className="text-warning" />
              </div>
              {dashboardData.premiacoes.destaques.map((item, i) => (
                <div key={i} className="mb-4">
                  <p className="text-secondary small mb-1 d-flex align-items-center gap-1">
                    {i === 0 ? (
                      <Award size={14} className="text-success" />
                    ) : (
                      <XCircle size={14} className="text-danger" />
                    )}
                    {item.categoria}
                  </p>
                  <div className="d-flex justify-content-between align-items-center">
                    <span
                      className="fw-bold text-white"
                      style={{ fontSize: "0.85rem" }}
                    >
                      {item.jogador}
                    </span>
                    <span
                      className={`badge text-bg-${item.tipoBadge} rounded-1`}
                    >
                      {item.valor}
                    </span>
                  </div>
                  <a
                    href="#"
                    className="text-secondary small text-decoration-none d-flex align-items-center gap-1 mt-2"
                    style={{ fontSize: "0.75rem" }}
                  >
                    <Search size={12} /> Ver ranking
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bloco 3: Ranking de Performance */}
        <div className="col-lg-2 col-md-4 mb-3">
          <div
            className="card bg-dark text-white border-secondary h-100"
            style={{ borderColor: "var(--border-color) !important" }}
          >
            <div className="card-body p-3">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h6
                  className="card-title mb-0 fw-bold"
                  style={{ fontSize: "0.85rem" }}
                >
                  {dashboardData.rankingPerformance.titulo}
                </h6>
                <Activity size={16} className="text-info" />
              </div>
              {dashboardData.rankingPerformance.rankings.map((item, i) => (
                <div key={i} className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="text-secondary small">
                      {item.categoria}
                    </span>
                    <span
                      className={`badge text-bg-${item.tipoBadge} rounded-1`}
                    >
                      {item.valor}
                    </span>
                  </div>
                  <span
                    className="fw-bold text-white"
                    style={{ fontSize: "0.85rem" }}
                  >
                    {item.jogador}
                  </span>
                  {i < dashboardData.rankingPerformance.rankings.length - 1 && (
                    <hr
                      className="my-2 border-secondary"
                      style={{ opacity: 0.2 }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bloco 4: Melhores Partidas */}
        <div className="col-lg-3 col-md-6 mb-3">
          <div
            className="card bg-dark text-white border-secondary h-100"
            style={{ borderColor: "var(--border-color) !important" }}
          >
            <div className="card-body p-3">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h6
                  className="card-title mb-0 fw-bold"
                  style={{ fontSize: "0.85rem" }}
                >
                  {dashboardData.melhoresPartidas.titulo}
                </h6>
                <TrendingUp size={16} className="text-success" />
              </div>
              {dashboardData.melhoresPartidas.partidas.map((item, i) => (
                <div key={i} className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span
                      className="fw-bold text-white"
                      style={{ fontSize: "0.85rem" }}
                    >
                      {item.adversario}{" "}
                      <span className="text-secondary fw-normal">
                        ({item.mando === "Casa" ? "C" : "F"})
                      </span>
                    </span>
                    <span
                      className={`badge text-bg-${item.tipoBadge} rounded-1`}
                    >
                      {item.pontuacao}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center text-secondary small">
                    <span>{item.data}</span>
                    <span className="fw-bold text-white">{item.resultado}</span>
                  </div>
                  {i < dashboardData.melhoresPartidas.partidas.length - 1 && (
                    <hr
                      className="my-2 border-secondary"
                      style={{ opacity: 0.2 }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bloco 5: Piores Partidas */}
        <div className="col-lg-3 col-md-6 mb-3">
          <div
            className="card bg-dark text-white border-secondary h-100"
            style={{ borderColor: "var(--border-color) !important" }}
          >
            <div className="card-body p-3">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h6
                  className="card-title mb-0 fw-bold"
                  style={{ fontSize: "0.85rem" }}
                >
                  {dashboardData.pioresPartidas.titulo}
                </h6>
                <TrendingDown size={16} className="text-danger" />
              </div>
              {dashboardData.pioresPartidas.partidas.map((item, i) => (
                <div key={i} className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span
                      className="fw-bold text-white"
                      style={{ fontSize: "0.85rem" }}
                    >
                      {item.adversario}{" "}
                      <span className="text-secondary fw-normal">
                        ({item.mando === "Casa" ? "C" : "F"})
                      </span>
                    </span>
                    <span
                      className={`badge text-bg-${item.tipoBadge} rounded-1`}
                    >
                      {item.pontuacao}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center text-secondary small">
                    <span>{item.data}</span>
                    <span className="fw-bold text-white">{item.resultado}</span>
                  </div>
                  {i < dashboardData.pioresPartidas.partidas.length - 1 && (
                    <hr
                      className="my-2 border-secondary"
                      style={{ opacity: 0.2 }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
