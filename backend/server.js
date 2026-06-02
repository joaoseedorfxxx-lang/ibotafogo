const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const dbPath = path.join(__dirname, "database.json");

// Função auxiliar para ler o banco
const lerBanco = () => JSON.parse(fs.readFileSync(dbPath, "utf-8"));
// Função auxiliar para salvar no banco
const salvarBanco = (dados) =>
  fs.writeFileSync(dbPath, JSON.stringify(dados, null, 2), "utf-8");

// Função auxiliar para recalcular variações quando inserimos, editamos ou apagamos
const recalcularVariacoes = (db, startIndex) => {
  for (let i = Math.max(0, startIndex); i < db.historicoRodadas.length; i++) {
    const rodadaAtual = db.historicoRodadas[i];
    const rodadaAnterior = i > 0 ? db.historicoRodadas[i - 1] : {};

    db.jogadoresDisponiveis.forEach((jogador) => {
      if (rodadaAtual[jogador.id] !== undefined) {
        const notaAtualNum = parseFloat(rodadaAtual[jogador.id]);
        const notaAnteriorNum =
          rodadaAnterior[jogador.id] !== undefined
            ? parseFloat(rodadaAnterior[jogador.id])
            : notaAtualNum;
        let variacao = notaAtualNum - notaAnteriorNum;

        if (variacao > 0)
          rodadaAtual[`${jogador.id}_variacao`] = `+${variacao.toFixed(1)}`;
        else if (variacao < 0)
          rodadaAtual[`${jogador.id}_variacao`] = variacao.toFixed(1);
        else rodadaAtual[`${jogador.id}_variacao`] = "0.0";
      }
    });
  }
};

// 1. Rota para LER os dados
app.get("/api/dados", (req, res) => {
  try {
    const db = lerBanco();
    res.json({
      sucesso: true,
      dados: db.historicoRodadas,
      jogadoresDisponiveis: db.jogadoresDisponiveis,
    });
  } catch (error) {
    res.status(500).json({ sucesso: false, mensagem: "Erro ao ler o banco." });
  }
});

// 2. Rota para CADASTRAR novo jogador
app.post("/api/jogadores", (req, res) => {
  try {
    const { id, nome, posicao } = req.body;
    const db = lerBanco();

    // Evita duplicidade
    if (!db.jogadoresDisponiveis.find((j) => j.id === id)) {
      db.jogadoresDisponiveis.push({ id, nome, posicao: posicao || "Outros" });
      salvarBanco(db);
    }
    res.json({ sucesso: true, mensagem: "Jogador adicionado!" });
  } catch (error) {
    res
      .status(500)
      .json({ sucesso: false, mensagem: "Erro ao salvar jogador." });
  }
});

// 3. Rota para SALVAR nova rodada (COM CÁLCULO AUTOMÁTICO DE VARIAÇÃO)
app.post("/api/dados", (req, res) => {
  try {
    const novaRodada = req.body;
    const db = lerBanco();

    const rodadaProcessada = {
      partida: novaRodada.partida,
      data: novaRodada.data,
      resultado: novaRodada.resultado,
    };

    db.jogadoresDisponiveis.forEach((jogador) => {
      const notaAtual = novaRodada[jogador.id];

      if (notaAtual !== undefined && notaAtual !== "") {
        rodadaProcessada[jogador.id] = parseFloat(notaAtual);
      }
    });

    db.historicoRodadas.push(rodadaProcessada);
    recalcularVariacoes(db, db.historicoRodadas.length - 1);
    salvarBanco(db);

    res.json({ sucesso: true, mensagem: "Rodada salva com sucesso!" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ sucesso: false, mensagem: "Erro ao salvar a rodada." });
  }
});

// 4. Rota para ATUALIZAR uma rodada
app.put("/api/dados/:index", (req, res) => {
  try {
    const index = parseInt(req.params.index, 10);
    const dadosAtualizados = req.body;
    const db = lerBanco();

    if (index >= 0 && index < db.historicoRodadas.length) {
      const rodadaProcessada = {
        partida: dadosAtualizados.partida,
        data: dadosAtualizados.data,
        resultado: dadosAtualizados.resultado,
      };

      db.jogadoresDisponiveis.forEach((jogador) => {
        const notaAtual = dadosAtualizados[jogador.id];
        if (notaAtual !== undefined && notaAtual !== "") {
          rodadaProcessada[jogador.id] = parseFloat(notaAtual);
        }
      });

      db.historicoRodadas[index] = rodadaProcessada;
      recalcularVariacoes(db, index); // Recalcula a partir da rodada editada
      salvarBanco(db);

      res.json({ sucesso: true, mensagem: "Rodada atualizada com sucesso!" });
    } else {
      res
        .status(404)
        .json({ sucesso: false, mensagem: "Rodada não encontrada." });
    }
  } catch (error) {
    res
      .status(500)
      .json({ sucesso: false, mensagem: "Erro ao atualizar a rodada." });
  }
});

// 5. Rota para DELETAR uma rodada
app.delete("/api/dados/:index", (req, res) => {
  try {
    const index = parseInt(req.params.index, 10);
    const db = lerBanco();

    if (index >= 0 && index < db.historicoRodadas.length) {
      db.historicoRodadas.splice(index, 1);
      recalcularVariacoes(db, index); // Recalcula as rodadas após a apagada
      salvarBanco(db);

      res.json({ sucesso: true, mensagem: "Rodada deletada com sucesso!" });
    } else {
      res
        .status(404)
        .json({ sucesso: false, mensagem: "Rodada não encontrada." });
    }
  } catch (error) {
    res
      .status(500)
      .json({ sucesso: false, mensagem: "Erro ao deletar a rodada." });
  }
});

// 6. Rota para DELETAR um jogador
app.delete("/api/jogadores/:id", (req, res) => {
  try {
    const { id } = req.params;
    const db = lerBanco();

    const index = db.jogadoresDisponiveis.findIndex((j) => j.id === id);
    if (index !== -1) {
      db.jogadoresDisponiveis.splice(index, 1);
      salvarBanco(db);
      res.json({ sucesso: true, mensagem: "Jogador removido com sucesso!" });
    } else {
      res
        .status(404)
        .json({ sucesso: false, mensagem: "Jogador não encontrado." });
    }
  } catch (error) {
    res
      .status(500)
      .json({ sucesso: false, mensagem: "Erro ao remover jogador." });
  }
});

// 7. Rota para LIMPAR todo o banco de dados
app.delete("/api/reset", (req, res) => {
  try {
    const db = lerBanco();
    db.historicoRodadas = [];
    db.jogadoresDisponiveis = [];
    salvarBanco(db);

    res.json({ sucesso: true, mensagem: "Banco de dados limpo com sucesso!" });
  } catch (error) {
    res
      .status(500)
      .json({ sucesso: false, mensagem: "Erro ao limpar o banco de dados." });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
