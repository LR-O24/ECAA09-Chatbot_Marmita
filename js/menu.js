// menu.js - Gestão do Cardápio Semanal e Utilitários de Dias
const MENU_DATA = {
  taxa_entrega: 5.00,
  dias: {
    domingo: {
      nome: "Domingo",
      pratos: [
        {
          id: "feijoada_dom",
          nome: "Feijoada Completa Especial",
          descricao: "Feijoada artesanal com carnes nobres, arroz, couve refogada e farofa crocante",
          preco: 32.00,
          temperos: ["alho", "cebola", "louro", "pimenta"],
          pontos: ["ao ponto"]
        },
        {
          id: "frango_assado",
          nome: "Frango Assado com Batatas Coradas",
          descricao: "Sobrecoxa e coxa assadas douradas, arroz branco e salada de maionese",
          preco: 24.00,
          temperos: ["alho", "cebola", "alecrim", "sal"],
          pontos: ["bem passado", "ao ponto"]
        }
      ]
    },
    segunda: {
      nome: "Segunda-feira",
      pratos: [
        {
          id: "virado_paulista",
          nome: "Virado Paulista",
          descricao: "Bisteca suína, tutu de feijão, arroz, couve refogada e ovo frito",
          preco: 25.00,
          temperos: ["alho", "cebola", "sal", "cheiro-verde"],
          pontos: ["ao ponto", "bem passado"]
        },
        {
          id: "frango_grelhado",
          nome: "Filé de Frango Grelhado Light",
          descricao: "Peito de frango grelhado suculento, arroz integral ou branco e legumes no vapor",
          preco: 22.00,
          temperos: ["alho", "cebola", "limão", "orégano", "sal"],
          pontos: ["ao ponto", "bem passado"]
        }
      ]
    },
    terca: {
      nome: "Terça-feira",
      pratos: [
        {
          id: "bife_vaca",
          nome: "Bife de Vaca Acebolado",
          descricao: "Contrafilé macio grelhado na chapa, arroz branco, feijão carioca e purê de batatas",
          preco: 26.00,
          temperos: ["cebola", "alho", "sal", "pimenta-do-reino"],
          pontos: ["mal passado", "ao ponto", "bem passado"]
        },
        {
          id: "panqueca_carne",
          nome: "Panquecas de Carne com Molho Caseiro",
          descricao: "Duas panquecas recheadas com carne moída selecionada, arroz branco e queijo ralado",
          preco: 23.00,
          temperos: ["cebola", "alho", "cheiro-verde", "sal", "molho de tomate"],
          pontos: ["ao ponto"]
        }
      ]
    },
    quarta: {
      nome: "Quarta-feira",
      pratos: [
        {
          id: "feijoada_tradicional",
          nome: "Feijoada Tradicional da Quarta",
          descricao: "Feijoada suculenta, arroz branco, couve fresca refogada, farofa da casa e laranja",
          preco: 28.00,
          temperos: ["alho", "cebola", "louro", "bacon"],
          pontos: ["ao ponto"]
        },
        {
          id: "peito_frango_ervas",
          nome: "Peito de Frango ao Molho de Ervas Finas",
          descricao: "Frango grelhado regado com azeite de ervas finas, arroz e purê de mandioquinha",
          preco: 24.00,
          temperos: ["alho", "ervas finas", "azeite", "sal"],
          pontos: ["ao ponto", "bem passado"]
        }
      ]
    },
    quinta: {
      nome: "Quinta-feira",
      pratos: [
        {
          id: "massa_bolonhesa",
          nome: "Lasanha à Bolonhesa Especial",
          descricao: "Massa artesanal com molho bolonhesa, presunto e queijo mussarela gratinado",
          preco: 27.00,
          temperos: ["cebola", "alho", "orégano", "manjericão", "sal"],
          pontos: ["bem assado", "ao ponto"]
        },
        {
          id: "alcatra_grelhada",
          nome: "Alcatra Grelhada com Fritas",
          descricao: "Bife de alcatra de primeira, arroz branco, feijão e batatas fritas crocantes",
          preco: 28.00,
          temperos: ["sal", "alho", "cebola", "manteiga"],
          pontos: ["mal passado", "ao ponto", "bem passado"]
        }
      ]
    },
    sexta: {
      nome: "Sexta-feira",
      pratos: [
        {
          id: "peixe_grelhado",
          nome: "Filé de Peixe Empanado ou Grelhado",
          descricao: "Tilápia temperada, arroz branco, pirão cremoso e salada crocante",
          preco: 27.00,
          temperos: ["limão", "alho", "sal", "coentro", "cebola"],
          pontos: ["ao ponto", "bem crocante"]
        },
        {
          id: "estrogonofe_carne",
          nome: "Estrogonofe Clássico de Carne",
          descricao: "Iscas de carne macia em molho cremoso com champignon, arroz e batata palha",
          preco: 26.00,
          temperos: ["cebola", "alho", "champignon", "mostarda", "sal"],
          pontos: ["ao ponto"]
        }
      ]
    },
    sabado: {
      nome: "Sábado",
      pratos: [
        {
          id: "parmegiana_carne",
          nome: "Bife à Parmegiana da Casa",
          descricao: "Contrafilé empanado com queijo e molho de tomate artesanal, arroz e fritas",
          preco: 30.00,
          temperos: ["alho", "orégano", "queijo", "molho de tomate"],
          pontos: ["ao ponto", "bem crocante"]
        },
        {
          id: "feijoada_sabado",
          nome: "Feijoada Nobre de Sábado",
          descricao: "Feijoada premium com carnes selecionadas, arroz, couve e torresmo",
          preco: 32.00,
          temperos: ["alho", "cebola", "louro", "bacon"],
          pontos: ["ao ponto"]
        }
      ]
    }
  }
};

const MenuManager = {
  getDiaSemanaChave(data = new Date()) {
    const chaves = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"];
    return chaves[data.getDay()];
  },

  getMenuPorDia(chaveDia) {
    const diaNormalizado = this.normalizarDia(chaveDia);
    return MENU_DATA.dias[diaNormalizado] || MENU_DATA.dias[this.getDiaSemanaChave()];
  },

  getMenuHoje() {
    const chave = this.getDiaSemanaChave();
    return {
      chave,
      ...MENU_DATA.dias[chave],
      taxa_entrega: MENU_DATA.taxa_entrega
    };
  },

  getTaxaEntrega() {
    return MENU_DATA.taxa_entrega;
  },

  formatarPreco(valor) {
    return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  },

  normalizarDia(texto) {
    if (!texto) return this.getDiaSemanaChave();
    const t = texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (t.includes("dom")) return "domingo";
    if (t.includes("seg")) return "segunda";
    if (t.includes("ter")) return "terca";
    if (t.includes("qua")) return "quarta";
    if (t.includes("qui")) return "quinta";
    if (t.includes("sex")) return "sexta";
    if (t.includes("sab")) return "sabado";
    return this.getDiaSemanaChave();
  },

  buscarPratoPorNome(termo) {
    const termoNorm = termo.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const todosPratos = [];
    Object.keys(MENU_DATA.dias).forEach(dia => {
      MENU_DATA.dias[dia].pratos.forEach(p => todosPratos.push({ ...p, dia }));
    });

    return todosPratos.find(p => {
      const pNorm = p.nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return pNorm.includes(termoNorm) || termoNorm.includes(pNorm);
    });
  },

  formatarCardapioDiaTexto(chaveDia) {
    const dia = this.getMenuPorDia(chaveDia);
    let str = `📅 **Cardápio de ${dia.nome}**:\n`;
    dia.pratos.forEach((prato, idx) => {
      str += `\n${idx + 1}. **${prato.nome}** - ${this.formatarPreco(prato.preco)}`;
      str += `\n   *Ingredientes/Temperos:* ${prato.temperos.join(", ")}`;
      if (prato.pontos && prato.pontos.length > 0) {
        str += `\n   *Pontos de cozimento:* ${prato.pontos.join(", ")}`;
      }
      str += `\n   _${prato.descricao}_\n`;
    });
    str += `\n🛵 **Taxa de entrega:** ${this.formatarPreco(MENU_DATA.taxa_entrega)} para toda a região.`;
    return str;
  }
};

