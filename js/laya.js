// laya.js - Módulo Especialista de Especificações de Marmita (Parser de Aspectos, Temperos e Pontos)
// Responsável por extrair com precisão itens, remoções/adições de temperos e ponto de carne.

const LayaExtractor = {
  // Dicionário de ingredientes e temperos comuns
  temperosConhecidos: [
    "cebola", "cebolas", "alho", "sal", "pimenta", "pimenta-do-reino",
    "cheiro-verde", "salsinha", "cebolinha", "coentro", "oregano", "orégano",
    "limao", "limão", "louro", "bacon", "azeite", "manteiga", "molho", 
    "tomate", "vinagrete", "maionese", "queijo", "champignon", "alecrim"
  ],

  // Dicionário de pontos de carne / preparo
  pontosConhecidos: [
    { termo: "mal passado", padrao: /mal\s*passad[oa]/i },
    { termo: "ao ponto", padrao: /ao\s*ponto/i },
    { termo: "bem passado", padrao: /bem\s*passad[oa]/i },
    { termo: "crocante", padrao: /bem\s*crocante|crocante/i },
    { termo: "bem assado", padrao: /bem\s*assad[oa]/i }
  ],

  // Analisa uma mensagem do usuário e extrai especificações
  analisarMensagem(texto, diaAtual) {
    const textoLimpo = texto.toLowerCase();
    const diaInfo = MenuManager.getMenuPorDia(diaAtual);
    const pratosDisponiveis = diaInfo ? diaInfo.pratos : [];

    const resultado = {
      pratoIdentificado: null,
      remocoes: [],
      adicoes: [],
      pontoEscolhido: null,
      observacoesGerais: []
    };

    // 1. Identificar Prato
    for (const prato of pratosDisponiveis) {
      const nomeLimpo = prato.nome.toLowerCase();
      // Casos específicos comuns: "bife", "frango", "feijoada", "virado", "panqueca", "lasanha", "peixe", "alcatra", "estrogonofe", "parmegiana"
      const palavrasChave = nomeLimpo.split(" ").filter(w => w.length > 3);
      const match = palavrasChave.some(palavra => textoLimpo.includes(palavra)) || textoLimpo.includes(nomeLimpo);

      if (match) {
        resultado.pratoIdentificado = { ...prato };
        break;
      }
    }

    // Se não encontrou no dia atual, busca em todo o cardápio
    if (!resultado.pratoIdentificado) {
      const pratoGeral = MenuManager.buscarPratoPorNome(texto);
      if (pratoGeral) {
        resultado.pratoIdentificado = { ...pratoGeral };
      }
    }

    // 2. Extrair Remoções de temperos/ingredientes (Ex: "sem cebola", "tirar o alho", "sem sal")
    const regexSem = /(?:sem|tirar|tire|retirar|retire|sem\s+adicionar)\s+([a-zá-ú\s-]+?)(?=[,.]|\se\s|\bcom\b|\bponto\b|$)/gi;
    let matchSem;
    while ((matchSem = regexSem.exec(textoLimpo)) !== null) {
      const itemRemovido = matchSem[1].trim();
      if (itemRemovido.length > 2) {
        resultado.remocoes.push(itemRemovido);
      }
    }

    // Fallback para temperos específicos conhecidos com "sem" ou "pouco"
    this.temperosConhecidos.forEach(tempero => {
      const reg = new RegExp(`\\b(sem|pouco|pouca)\\s+${tempero}\\b`, "i");
      if (reg.test(textoLimpo) && !resultado.remocoes.includes(tempero)) {
        resultado.remocoes.push(tempero);
      }
    });

    // 3. Extrair Adições / Preferências (Ex: "com bastante alho", "com mais cebola", "capricha no queijo")
    const regexCom = /(?:com\s+mais|com\s+bastante|capricha\s+no|caprichar\s+no|adicionar|extra\s+de)\s+([a-zá-ú\s-]+?)(?=[,.]|\se\s|\bsem\b|\bponto\b|$)/gi;
    let matchCom;
    while ((matchCom = regexCom.exec(textoLimpo)) !== null) {
      const itemAdicionado = matchCom[1].trim();
      if (itemAdicionado.length > 2) {
        resultado.adicoes.push(itemAdicionado);
      }
    }

    // 4. Identificar Ponto da Carne
    for (const ponto of this.pontosConhecidos) {
      if (ponto.padrao.test(textoLimpo)) {
        resultado.pontoEscolhido = ponto.termo;
        break;
      }
    }

    return resultado;
  },

  // Gera texto amigável com a descrição das customizações
  formatarCustomizacoes(especificacoes) {
    const partes = [];
    if (especificacoes.pontoEscolhido) {
      partes.push(`Ponto: ${especificacoes.pontoEscolhido}`);
    }
    if (especificacoes.remocoes.length > 0) {
      partes.push(`Sem: ${especificacoes.remocoes.join(', ')}`);
    }
    if (especificacoes.adicoes.length > 0) {
      partes.push(`Preferências extras: ${especificacoes.adicoes.join(', ')}`);
    }
    return partes.length > 0 ? partes.join(' | ') : 'Padrão da casa (sem alterações)';
  }
};

