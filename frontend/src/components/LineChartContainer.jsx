import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  ReferenceLine,
  Brush,
} from "recharts";

const CustomTooltip = ({ active, payload, label, linhasAtivas }) => {
  if (active && payload && payload.length) {
    const partidaInfo = payload[0].payload;

    return (
      <div
        className="custom-tooltip p-4 rounded"
        style={{
          backgroundColor: "var(--bg-tooltip)",
          border: "1px solid var(--border-color)",
          minWidth: "350px",
          boxShadow: "0px 10px 30px rgba(0,0,0,0.8)",
        }}
      >
        <p
          className="mb-2 fw-bold text-white text-center"
          style={{
            fontSize: "1.2rem",
            borderBottom: "1px solid var(--border-color)",
            paddingBottom: "8px",
          }}
        >
          {label} -{" "}
          <span style={{ color: "var(--text-secondary)" }}>
            {partidaInfo.resultado}
          </span>
        </p>

        <div className="d-flex flex-column gap-1">
          {payload
            .filter(
              (item, index, self) =>
                !item.dataKey.endsWith("_bg") &&
                index === self.findIndex((t) => t.dataKey === item.dataKey),
            )
            .sort((a, b) => {
              const jA = linhasAtivas?.find((j) => j.id === a.dataKey);
              const jB = linhasAtivas?.find((j) => j.id === b.dataKey);
              const isTrA =
                jA?.posicao === "Treinador" || a.dataKey === "Treinador";
              const isTrB =
                jB?.posicao === "Treinador" || b.dataKey === "Treinador";
              if (isTrA) return -1;
              if (isTrB) return 1;
              return b.value - a.value;
            })
            .map((entry, index) => {
              const isTreinador =
                linhasAtivas?.find((j) => j.id === entry.dataKey)?.posicao ===
                  "Treinador" || entry.dataKey === "Treinador";
              return (
                <div
                  key={index}
                  className={`d-flex justify-content-between align-items-center gap-3 ${isTreinador ? "p-1 rounded" : ""}`}
                  style={{
                    fontSize: "1rem",
                    ...(isTreinador
                      ? {
                          backgroundColor: "rgba(255, 193, 7, 0.2)",
                          border: "1px solid #ffc107",
                        }
                      : {}),
                  }}
                >
                  <div className="d-flex align-items-center gap-2">
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        backgroundColor: entry.color,
                        borderRadius: "2px",
                      }}
                    />
                    <span style={{ color: "var(--text-secondary)" }}>
                      {entry.name}:
                    </span>
                  </div>

                  <span
                    className="fw-bold d-flex align-items-center gap-2"
                    style={{ color: isTreinador ? "#ffc107" : entry.color }}
                  >
                    {entry.value}

                    {(() => {
                      const variacaoStr =
                        entry.payload[`${entry.dataKey}_variacao`] || "0.0";
                      const variacaoNum = parseFloat(variacaoStr);

                      if (variacaoNum > 0) {
                        return (
                          <span
                            className="small px-1 rounded"
                            style={{
                              fontSize: "0.7rem",
                              backgroundColor: "rgba(40, 167, 69, 0.2)",
                              color: "#28a745",
                            }}
                          >
                            ⬆ {variacaoStr}
                          </span>
                        );
                      } else if (variacaoNum < 0) {
                        return (
                          <span
                            className="small px-1 rounded"
                            style={{
                              fontSize: "0.7rem",
                              backgroundColor: "rgba(220, 53, 69, 0.2)",
                              color: "#dc3545",
                            }}
                          >
                            ⬇ {variacaoStr}
                          </span>
                        );
                      } else {
                        return (
                          <span
                            className="small text-secondary px-1"
                            style={{ fontSize: "0.7rem" }}
                          >
                            ➖ 0.0
                          </span>
                        );
                      }
                    })()}
                  </span>
                </div>
              );
            })}
        </div>

        <div
          className="text-secondary text-end mt-2 pt-1"
          style={{
            fontSize: "0.75rem",
            borderTop: "1px solid var(--border-color)",
          }}
        >
          {partidaInfo.data}
        </div>
      </div>
    );
  }
  return null;
};

export default function LineChartContainer({ dados, jogadores, selecionados }) {
  const [linhaEmDestaque, setLinhaEmDestaque] = useState(null);

  // LÓGICA MANTIDA: Escala de 0 a 10
  const yDomain = [0, 10];
  const yTicks = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  const linhasAtivas =
    jogadores?.filter((j) => selecionados?.includes(j.id)) || [];

  const cores = [
    "#28a745",
    "#0dcaf0",
    "#dc3545",
    "#fd7e14",
    "#6f42c1",
    "#e83e8c",
    "#ffc107",
    "#20c997",
    "#ffffff",
  ];

  const ultimaRodadaIndex = (dados?.length || 0) - 1;
  const dadosProcessados = dados ? dados.map((d) => ({ ...d })) : [];

  const lastValidData = [];

  if (ultimaRodadaIndex >= 0) {
    linhasAtivas.forEach((jogador) => {
      let lastVal = null;
      let firstVal = null;
      for (let i = ultimaRodadaIndex; i >= 0; i--) {
        const val = dadosProcessados[i][jogador.id];
        if (val != null && !isNaN(val)) {
          if (lastVal == null) lastVal = val;
          firstVal = val;
        }
      }

      const neverPlayed = lastVal == null;
      if (neverPlayed) {
        lastVal = 0;
        firstVal = 0;
      }

      for (let i = 0; i <= ultimaRodadaIndex; i++) {
        dadosProcessados[i][`${jogador.id}_bg`] =
          dadosProcessados[i][jogador.id];
      }

      if (
        ultimaRodadaIndex > 0 &&
        dadosProcessados[0][`${jogador.id}_bg`] == null
      ) {
        dadosProcessados[0][`${jogador.id}_bg`] = firstVal;
      }

      dadosProcessados[ultimaRodadaIndex][`${jogador.id}_bg`] = lastVal;

      if (!neverPlayed) {
        lastValidData.push({
          id: jogador.id,
          nome: jogador.nome,
          pos: jogador.posicao,
          val: lastVal,
          dataIndex: ultimaRodadaIndex,
        });
      }
    });
  }

  lastValidData.sort((a, b) => {
    if (b.val === a.val) {
      if (a.pos === "Treinador" || a.id === "Treinador") return -1;
      if (b.pos === "Treinador" || b.id === "Treinador") return 1;
      return 0;
    }
    return b.val - a.val;
  });

  const PIXELS_PER_UNIT = 74;

  const baseLabels = lastValidData.map((d) => {
    const exactY = 80 + (10 - d.val) * PIXELS_PER_UNIT;
    return {
      ...d,
      originalY: exactY,
      currentY: exactY,
    };
  });

  baseLabels.sort((a, b) => a.originalY - b.originalY);

  const LABEL_HEIGHT = 16;
  let overlap = true;
  let iterations = 0;
  while (overlap && iterations < 50) {
    overlap = false;
    for (let i = 0; i < baseLabels.length - 1; i++) {
      const l1 = baseLabels[i];
      const l2 = baseLabels[i + 1];
      if (l1.currentY + LABEL_HEIGHT > l2.currentY) {
        const diff = l1.currentY + LABEL_HEIGHT - l2.currentY;
        l1.currentY -= diff / 2;
        l2.currentY += diff / 2;
        overlap = true;
      }
    }
    iterations++;
  }

  const labelPositions = {};
  baseLabels.forEach((l) => {
    labelPositions[l.id] = l.currentY;
  });

  return (
    <div style={{ width: "100%", height: "1200px", position: "relative" }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={dadosProcessados}
          /* Margem ajustada para acomodar o Eixo Y na esquerda e as Legendas na direita */
          margin={{ top: 80, right: 180, left: 10, bottom: 80 }}
        >
          {/* DESIGN NOVO: Grid chumbo super sutil (#1a1a1a) */}
          <CartesianGrid
            strokeDasharray="none"
            stroke="#1a1a1a"
            vertical={true}
            horizontal={true}
          />

          <XAxis
            dataKey="partida"
            stroke="#333"
            angle={-45}
            textAnchor="end"
            height={100}
            tick={{ fill: "#666", fontSize: 11, fontWeight: "bold" }}
            interval={0}
            tickMargin={10}
          />

          {/* ZOOM E NAVEGAÇÃO HORIZONTAL (BRUSH) */}
          <Brush
            dataKey="partida"
            height={30}
            stroke="#495057"
            fill="#1a1a1a"
            travellerWidth={12}
            tickFormatter={() => ""}
            startIndex={Math.max(0, (dados?.length || 0) - 10)}
            endIndex={Math.max(0, (dados?.length || 0) - 1)}
          />

          {/* LINHA DE REFERÊNCIA DA MÉDIA */}
          <ReferenceLine
            y={6.0}
            stroke="#495057"
            strokeDasharray="4 4"
            label={{
              position: "insideBottomLeft",
              value: "Média Esperada (6.0)",
              fill: "#6c757d",
              fontSize: 12,
              fontWeight: "bold",
            }}
          />

          {/* EIXO Y DE VOLTA: Com as cores do projeto original */}
          <YAxis
            stroke="#333"
            ticks={yTicks}
            domain={yDomain}
            tick={{ fill: "#666", fontSize: 11, fontWeight: "bold" }}
            tickMargin={10}
          />

          <Tooltip
            content={<CustomTooltip linhasAtivas={linhasAtivas} />}
            cursor={{ stroke: "#555", strokeWidth: 1, strokeDasharray: "3 3" }}
            wrapperStyle={{ zIndex: 1000 }}
            allowEscapeViewBox={{ x: false, y: true }}
          />

          {linhasAtivas.map((jogador, index) => {
            const isTreinador =
              jogador.posicao === "Treinador" || jogador.id === "Treinador";
            const corLinha = isTreinador
              ? "#ffc107"
              : cores[index % cores.length];

            const isDestacada = linhaEmDestaque === jogador.id;
            const isEsmaecida = linhaEmDestaque !== null && !isDestacada;

            const strokeW = isDestacada
              ? isTreinador
                ? 7
                : 4
              : isTreinador
                ? 5
                : 2;
            const opacityBg = isEsmaecida ? 0.05 : isDestacada ? 0.7 : 0.4;
            const opacityFg = isEsmaecida ? 0.15 : 1;

            return (
              <React.Fragment key={jogador.id}>
                <Line
                  type="monotone"
                  dataKey={`${jogador.id}_bg`}
                  stroke={corLinha}
                  strokeWidth={strokeW}
                  strokeDasharray="7 5"
                  connectNulls={true}
                  dot={false}
                  activeDot={false}
                  opacity={opacityBg}
                  isAnimationActive={false}
                >
                  <LabelList
                    dataKey="partida"
                    content={(props) => {
                      const { x, y, index: dataIndex } = props;
                      if (
                        dataIndex === ultimaRodadaIndex &&
                        y != null &&
                        !isNaN(y)
                      ) {
                        const originalVal =
                          dadosProcessados[ultimaRodadaIndex][jogador.id];
                        const jogouNaUltima =
                          originalVal != null && !isNaN(originalVal);
                        const lastVal =
                          dadosProcessados[ultimaRodadaIndex][
                            `${jogador.id}_bg`
                          ];

                        const targetY = labelPositions[jogador.id];
                        if (targetY === undefined) return null;

                        const fontSize = isTreinador ? 14 : 12;
                        const texto = isTreinador
                          ? `🌟 ${jogador.nome}`
                          : jogador.nome;

                        return (
                          <g
                            onMouseEnter={() => setLinhaEmDestaque(jogador.id)}
                            onMouseLeave={() => setLinhaEmDestaque(null)}
                            style={{
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                            }}
                          >
                            <path
                              d={`M${x + 5},${y} C${x + 20},${y} ${x + 20},${targetY} ${x + 35},${targetY}`}
                              stroke={corLinha}
                              strokeWidth="1.5"
                              fill="none"
                              opacity={0.6}
                            />
                            {/* Bullet na última linha (rótulo) */}
                            <circle
                              cx={x + 35}
                              cy={targetY}
                              r={isTreinador ? 5 : 4}
                              fill={corLinha}
                              stroke="#1a1a1a"
                              strokeWidth={2}
                            />
                            <text
                              x={x + 45}
                              y={targetY + 4}
                              fill="none"
                              stroke="#0f1011"
                              strokeWidth={4}
                              fontSize={fontSize}
                              fontWeight="900"
                            >
                              {texto}
                            </text>
                            <text
                              x={x + 45}
                              y={targetY + 4}
                              fill={corLinha}
                              fontSize={fontSize}
                              fontWeight="900"
                            >
                              {texto}
                            </text>
                            {!jogouNaUltima && (
                              <circle
                                cx={x}
                                cy={y}
                                r={isTreinador ? 5 : 3}
                                fill="#111"
                                stroke={corLinha}
                                strokeWidth={isTreinador ? 2 : 1.5}
                                opacity={0.5}
                              />
                            )}
                            {!jogouNaUltima && (
                              <text
                                x={x}
                                y={y - 8}
                                fill={corLinha}
                                fontSize={10}
                                fontWeight="bold"
                                textAnchor="middle"
                                opacity={0.5}
                              >
                                {lastVal}
                              </text>
                            )}
                          </g>
                        );
                      }
                      return null;
                    }}
                  />
                </Line>

                <Line
                  type="monotone"
                  dataKey={jogador.id}
                  name={jogador.nome}
                  stroke={corLinha}
                  strokeWidth={strokeW}
                  connectNulls={false}
                  strokeOpacity={opacityFg}
                  onMouseEnter={() => setLinhaEmDestaque(jogador.id)}
                  onMouseLeave={() => setLinhaEmDestaque(null)}
                  dot={(props) => {
                    const { cx, cy, index: dataIndex } = props;
                    // Exibe o bullet apenas na última linha (ou se o usuário focar na linha)
                    if (dataIndex === ultimaRodadaIndex || isDestacada) {
                      return (
                        <circle
                          key={`dot-${jogador.id}-${dataIndex}`}
                          cx={cx}
                          cy={cy}
                          r={isTreinador ? 5 : 3}
                          fill="#111"
                          stroke={corLinha}
                          strokeWidth={isDestacada ? 3 : isTreinador ? 2 : 1.5}
                        />
                      );
                    }
                    return null;
                  }}
                  activeDot={{
                    r: isTreinador ? 8 : 5,
                    fill: corLinha,
                    stroke: "#fff",
                    strokeWidth: 2,
                  }}
                >
                  <LabelList
                    dataKey={jogador.id}
                    content={(props) => {
                      const { x, y, value, index: dataIndex } = props;
                      // Exibe a nota apenas na última linha (ou se o usuário focar na linha)
                      if (dataIndex === ultimaRodadaIndex || isDestacada) {
                        return (
                          <text
                            x={x}
                            y={y - 12}
                            fill={corLinha}
                            fontSize={11}
                            fontWeight="bold"
                            textAnchor="middle"
                          >
                            {value}
                          </text>
                        );
                      }
                      return null;
                    }}
                  />
                </Line>
              </React.Fragment>
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
