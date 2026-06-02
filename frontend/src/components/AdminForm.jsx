import React, { useState } from 'react';

export default function AdminForm({ onAtualizar }) {
  // Estado inicial do formulário
  const [formData, setFormData] = useState({
    partida: '',
    data: '',
    resultado: '',
    Luiz_Henrique: 0,
    Luiz_Henrique_variacao: '',
    Bastos: 0,
    Bastos_variacao: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Se for um campo de pontuação (número), converte para Float
    const parsedValue = name.includes('variacao') || name === 'partida' || name === 'data' || name === 'resultado' 
      ? value 
      : parseFloat(value);
      
    setFormData({ ...formData, [name]: parsedValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:3000/api/dados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        alert("Dados salvos com sucesso!");
        if (onAtualizar) onAtualizar(); // Atualiza o gráfico na tela principal
      }
    } catch (error) {
      alert("Erro ao conectar com o servidor.");
    }
  };

  return (
    <div className="card bg-dark text-white border-secondary p-4 mt-4">
      <h4 className="mb-4 fw-bold">Adicionar Nova Rodada</h4>
      
      <form onSubmit={handleSubmit}>
        <div className="row mb-3">
          <div className="col-md-4">
            <label className="form-label text-secondary small">Adversário (Ex: Vasco (C))</label>
            <input type="text" className="form-control bg-dark text-white border-secondary" name="partida" onChange={handleChange} required />
          </div>
          <div className="col-md-4">
            <label className="form-label text-secondary small">Data</label>
            <input type="text" className="form-control bg-dark text-white border-secondary" name="data" placeholder="DD/MM/AAAA" onChange={handleChange} required />
          </div>
          <div className="col-md-4">
            <label className="form-label text-secondary small">Resultado</label>
            <input type="text" className="form-control bg-dark text-white border-secondary" name="resultado" placeholder="Ex: 2x0" onChange={handleChange} required />
          </div>
        </div>

        <hr className="border-secondary my-4" />

        <h6 className="text-secondary mb-3">Estatísticas dos Jogadores</h6>
        
        {/* Bloco do Luiz Henrique */}
        <div className="row mb-3 align-items-center">
          <div className="col-md-3 fw-bold">Luiz Henrique</div>
          <div className="col-md-4">
            <input type="number" step="0.1" className="form-control bg-dark text-white border-secondary" name="Luiz_Henrique" placeholder="Pontuação Total" onChange={handleChange} />
          </div>
          <div className="col-md-4">
            <input type="text" className="form-control bg-dark text-white border-secondary" name="Luiz_Henrique_variacao" placeholder="Variação (Ex: +2.5)" onChange={handleChange} />
          </div>
        </div>

        {/* Bloco do Bastos */}
        <div className="row mb-4 align-items-center">
          <div className="col-md-3 fw-bold">Bastos</div>
          <div className="col-md-4">
            <input type="number" step="0.1" className="form-control bg-dark text-white border-secondary" name="Bastos" placeholder="Pontuação Total" onChange={handleChange} />
          </div>
          <div className="col-md-4">
            <input type="text" className="form-control bg-dark text-white border-secondary" name="Bastos_variacao" placeholder="Variação (Ex: -1.0)" onChange={handleChange} />
          </div>
        </div>

        <button type="submit" className="btn btn-danger w-100 fw-bold">Salvar no Banco de Dados</button>
      </form>
    </div>
  );
}