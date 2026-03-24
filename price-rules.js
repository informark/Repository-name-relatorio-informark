const fs = require("fs");

const MIN_REGISTROS = 5; // mínimo de preços por grupo para confiar no cálculo

function calcularP25(valores) {
  if (!valores.length) return null;
  const sorted = [...valores].sort((a, b) => a - b);
  const idx = Math.floor(sorted.length * 0.25);
  return sorted[idx];
}

function calcularMedia(valores) {
  if (!valores.length) return null;
  return valores.reduce((a, b) => a + b, 0) / valores.length;
}

function carregarLimitesDinamicos(arquivoCsv) {
  const limites = {}; // { "iPhone|16|128GB|Novo": { media, p25, total } }

  try {
    if (!fs.existsSync(arquivoCsv)) return limites;

    const linhas = fs.readFileSync(arquivoCsv, "utf8").split("\n");
    if (linhas.length < 2) return limites;

    const header = linhas[0].split(",").map(h => h.replace(/"/g, "").trim());
    const iProduto  = header.indexOf("Produto");
    const iModelo   = header.indexOf("Modelo");
    const iStorage  = header.indexOf("Armazenamento");
    const iCondicao = header.indexOf("Condicao");
    const iPreco    = header.indexOf("Preco");

    if ([iProduto, iModelo, iStorage, iCondicao, iPreco].includes(-1)) return limites;

    const grupos = {};

    for (let i = 1; i < linhas.length; i++) {
      const cols = linhas[i].match(/("([^"]*)"|[^,]*)/g)
        ?.map(c => c.replace(/"/g, "").trim()) || [];
      if (cols.length < header.length) continue;

      const produto  = cols[iProduto];
      const modelo   = cols[iModelo];
      const storage  = cols[iStorage];
      const condicao = cols[iCondicao];
      const preco    = parseFloat(cols[iPreco].replace(",", "."));

      if (!produto || isNaN(preco) || preco <= 0) continue;

      const key = `${produto}|${modelo}|${storage}|${condicao}`;
      if (!grupos[key]) grupos[key] = [];
      grupos[key].push(preco);
    }

    for (const [key, valores] of Object.entries(grupos)) {
      if (valores.length < MIN_REGISTROS) continue;
      limites[key] = {
        p25:   calcularP25(valores),
        media: calcularMedia(valores),
        total: valores.length,
      };
    }
  } catch (e) {
    console.log("⚠️ Falha ao carregar limites dinâmicos:", e.message);
  }

  return limites;
}

function obterLimiteDinamico(limites, produto, modelo, armazenamento, condicao) {
  const key = `${produto}|${modelo}|${armazenamento}|${condicao}`;
  return limites[key] || null; // { p25, media, total } ou null
}

module.exports = { carregarLimitesDinamicos, obterLimiteDinamico };