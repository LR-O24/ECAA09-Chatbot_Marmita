// chat.js - Orquestrador Principal do Chatbot Híbrido (Eliza + Laya + LLM + Guardrails)

const ChatApp = {
  // Estado da aplicação
  diaSelecionado: MenuManager.getDiaSemanaChave(),
  carrinho: [],
  historicoMensagens: [],
  usandoLLM: false,

  init() {
    this.carregarPreferencias();
    this.configurarDia();
    this.bindEvents();
    this.renderizarResumoPedido();
    this.atualizarStatusModo();
    this.enviarMensagemBoasVindas();
  },

  carregarPreferencias() {
    this.usandoLLM = LLMClient.hasApiKey();
  },

  configurarDia() {
    const selectDia = document.getElementById('selectDia');
    if (selectDia) {
      selectDia.value = this.diaSelecionado;
    }
  },

  bindEvents() {
    const form = document.getElementById('chatForm');
    const input = document.getElementById('chatInput');
    const btnApiKey = document.getElementById('btnApiKey');
    const modalKey = document.getElementById('modalApiKey');
    const btnFecharModal = document.getElementById('btnFecharModal');
    const formApiKey = document.getElementById('formApiKey');
    const btnLimparKey = document.getElementById('btnLimparKey');
    const selectDia = document.getElementById('selectDia');
    const btnVerCardapio = document.getElementById('btnVerCardapio');
    const btnFecharPedido = document.getElementById('btnFecharPedido');
    const btnLimparCarrinho = document.getElementById('btnLimparCarrinho');

    // Envio de mensagem
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const texto = input.value;
      if (texto.trim()) {
        this.processarMensagemUsuario(texto);
        input.value = '';
      }
    });

    // Mudança de dia da semana
    if (selectDia) {
      selectDia.addEventListener('change', (e) => {
        this.diaSelecionado = e.target.value;
        const diaInfo = MenuManager.getMenuPorDia(this.diaSelecionado);
        this.adicionarMensagemBot(`📅 Você alterou o dia de consulta para **${diaInfo.nome}**.`);
        this.adicionarMensagemBot(MenuManager.formatarCardapioDiaTexto(this.diaSelecionado));
      });
    }

    // Botões de ação rápida
    if (btnVerCardapio) {
      btnVerCardapio.addEventListener('click', () => {
        this.adicionarMensagemUsuario("Gostaria de ver o cardápio de hoje");
        this.adicionarMensagemBot(MenuManager.formatarCardapioDiaTexto(this.diaSelecionado));
      });
    }

    if (btnFecharPedido) {
      btnFecharPedido.addEventListener('click', () => {
        this.finalizarPedido();
      });
    }

    if (btnLimparCarrinho) {
      btnLimparCarrinho.addEventListener('click', () => {
        this.limparCarrinho();
      });
    }

    // Modal de API Key
    if (btnApiKey && modalKey) {
      btnApiKey.addEventListener('click', () => {
        this.abrirModalApiKey();
      });
    }

    if (btnFecharModal && modalKey) {
      btnFecharModal.addEventListener('click', () => {
        modalKey.classList.remove('ativo');
      });
    }

    if (formApiKey) {
      formApiKey.addEventListener('submit', (e) => {
        e.preventDefault();
        const provider = document.getElementById('apiProvider').value;
        const key = document.getElementById('apiKeyInput').value;
        const model = document.getElementById('apiModelInput').value;

        LLMClient.saveConfig(provider, key, model);
        this.usandoLLM = true;
        this.atualizarStatusModo();
        modalKey.classList.remove('ativo');
        this.adicionarMensagemBot(`✨ **Modo LLM Ativado!** Chave configurada com sucesso para o provedor **${provider.toUpperCase()}**.`);
      });
    }

    if (btnLimparKey) {
      btnLimparKey.addEventListener('click', () => {
        LLMClient.clearConfig();
        this.usandoLLM = false;
        this.atualizarStatusModo();
        modalKey.classList.remove('ativo');
        this.adicionarMensagemBot(`🔄 **Modo Local Ativo:** A chave foi removida. O chatbot agora está utilizando o motor local **ELIZA 1966 + Laya Extractor** (100% offline).`);
      });
    }
  },

  abrirModalApiKey() {
    const modalKey = document.getElementById('modalApiKey');
    const config = LLMClient.getStoredConfig();
    document.getElementById('apiProvider').value = config.provider;
    document.getElementById('apiKeyInput').value = config.apiKey;
    document.getElementById('apiModelInput').value = config.model;
    modalKey.classList.add('ativo');
  },

  atualizarStatusModo() {
    const badge = document.getElementById('engineBadge');
    if (badge) {
      if (this.usandoLLM) {
        badge.innerHTML = '🤖 Modo LLM (Nuvem)';
        badge.className = 'badge badge-llm';
      } else {
        badge.innerHTML = '🧠 Modo Elisa + Laya (Local)';
        badge.className = 'badge badge-local';
      }
    }
  },

  enviarMensagemBoasVindas() {
    const diaInfo = MenuManager.getMenuHoje();
    const mensagem = `👋 **Olá! Bem-vindo(a) ao Marmita do Chef!**\n\nEu sou seu assistente virtual especializado. Hoje é **${diaInfo.nome}** e já estamos preparando marmitas deliciosas!\n\n💡 *Você pode digitar pedidos como:*\n• "Quero o bife de vaca acebolado sem cebola e bem passado"\n• "Ver o cardápio de hoje"\n• "Qual o valor da entrega?"\n• "Finalizar meu pedido"`;
    this.adicionarMensagemBot(mensagem);
  },

  async processarMensagemUsuario(textoBruto) {
    // CAMADA 1 DE SEGURANÇA: GUARDRAILS
    const validacao = Guardrails.validateInput(textoBruto);

    if (!validacao.isValid) {
      this.adicionarMensagemUsuario(Guardrails.escapeHtml(textoBruto));
      this.adicionarMensagemBot(validacao.reason, true);
      return;
    }

    const textoTratado = validacao.rawText;
    this.adicionarMensagemUsuario(validacao.sanitized);
    this.mostrarDigitando(true);

    try {
      // 1. Extração estruturada de pratos, temperos e ponto de carne com o módulo LAYA
      const specs = LayaExtractor.analisarMensagem(textoTratado, this.diaSelecionado);

      // Se LAYA detectou um prato e/ou customizações
      if (specs.pratoIdentificado) {
        this.adicionarItemAoCarrinho(specs.pratoIdentificado, specs);
      }

      // 2. Se o usuário tem chave configurada, tenta responder via LLM com System Prompt enriquecido
      if (this.usandoLLM) {
        try {
          const respostaLLM = await LLMClient.enviarMensagem(
            textoTratado,
            this.historicoMensagens,
            this.diaSelecionado,
            this.carrinho
          );
          // CAMADA 3 DE SEGURANÇA: OUTPUT FILTER
          const respostaSegura = Guardrails.filterOutput(respostaLLM);
          this.mostrarDigitando(false);
          this.adicionarMensagemBot(respostaSegura);
          return;
        } catch (erroLLM) {
          console.warn("Falha no LLM, caindo para motor Elisa + Laya:", erroLLM);
          // Fallback gracioso: esconde o indicador antes de continuar para o motor local
          this.mostrarDigitando(false);
        }
      }

      // 3. Motor Conversacional Local: ELIZA + LAYA
      setTimeout(() => {
        this.mostrarDigitando(false);
        this.executarRespostaElizaLaya(textoTratado, specs);
      }, 450);

    } catch (err) {
      console.error(err);
      this.mostrarDigitando(false);
      this.adicionarMensagemBot("Desculpe, ocorreu uma instabilidade passageira ao processar sua solicitação. Por favor, tente novamente.");
    }
  },

  executarRespostaElizaLaya(texto, specs) {
    // Se Laya identificou a inclusão de um prato na marmita
    if (specs.pratoIdentificado) {
      const customizacaoDesc = LayaExtractor.formatarCustomizacoes(specs);
      let rep = `🍛 **Excelente escolha! Adicionei ao seu pedido:**\n`;
      rep += `• **1x ${specs.pratoIdentificado.nome}** (${MenuManager.formatarPreco(specs.pratoIdentificado.preco)})\n`;
      rep += `• **Especificações:** ${customizacaoDesc}\n\n`;
      rep += `Deseja adicionar mais alguma marmita ou gostaria de fechar o pedido para entrega?`;
      this.adicionarMensagemBot(rep);
      return;
    }

    // Se o usuário solicitou apenas customização em itens já no carrinho
    if ((specs.remocoes.length > 0 || specs.pontoEscolhido) && this.carrinho.length > 0) {
      const ultimoItem = this.carrinho[this.carrinho.length - 1];
      if (specs.pontoEscolhido) ultimoItem.customizacoes.pontoEscolhido = specs.pontoEscolhido;
      if (specs.remocoes.length > 0) {
        ultimoItem.customizacoes.remocoes = [...new Set([...ultimoItem.customizacoes.remocoes, ...specs.remocoes])];
      }
      this.renderizarResumoPedido();
      this.adicionarMensagemBot(`✅ Perfeito! Atualizei as observações do seu **${ultimoItem.prato.nome}**:\n*${LayaExtractor.formatarCustomizacoes(ultimoItem.customizacoes)}*`);
      return;
    }

    // Processamento conversacional clássico via Eliza
    const elizaRes = ElizaEngine.responder(texto);

    if (elizaRes.tipo === "ACAO_CARDAPIO") {
      this.adicionarMensagemBot(elizaRes.texto);
      this.adicionarMensagemBot(MenuManager.formatarCardapioDiaTexto(this.diaSelecionado));
    } else if (elizaRes.tipo === "ACAO_FINALIZAR") {
      this.finalizarPedido();
    } else if (elizaRes.tipo === "ACAO_LIMPAR") {
      this.limparCarrinho();
      this.adicionarMensagemBot(elizaRes.texto);
    } else {
      this.adicionarMensagemBot(elizaRes.texto);
    }
  },

  adicionarItemAoCarrinho(prato, specs) {
    this.carrinho.push({
      id: Date.now() + Math.random(),
      prato: prato,
      customizacoes: {
        remocoes: [...specs.remocoes],
        adicoes: [...specs.adicoes],
        pontoEscolhido: specs.pontoEscolhido
      }
    });
    this.renderizarResumoPedido();
  },

  removerItemCarrinho(index) {
    this.carrinho.splice(index, 1);
    this.renderizarResumoPedido();
  },

  limparCarrinho() {
    this.carrinho = [];
    this.renderizarResumoPedido();
  },

  calcularTotal() {
    const subtotal = this.carrinho.reduce((acc, item) => acc + item.prato.preco, 0);
    const taxa = this.carrinho.length > 0 ? MenuManager.getTaxaEntrega() : 0;
    return {
      subtotal,
      taxa,
      total: subtotal + taxa
    };
  },

  finalizarPedido() {
    if (this.carrinho.length === 0) {
      this.adicionarMensagemBot("🛒 Seu carrinho de marmitas ainda está vazio! Que tal conferir o cardápio de hoje e escolher sua refeição?");
      return;
    }

    const totais = this.calcularTotal();
    let msg = `🎉 **Resumo Final do Pedido:**\n\n`;
    this.carrinho.forEach((item, idx) => {
      msg += `**${idx + 1}. ${item.prato.nome}** — ${MenuManager.formatarPreco(item.prato.preco)}\n`;
      msg += `   └ *Detalhes:* ${LayaExtractor.formatarCustomizacoes(item.customizacoes)}\n`;
    });

    msg += `\n─────────────────────\n`;
    msg += `• Subtotal das marmitas: **${MenuManager.formatarPreco(totais.subtotal)}**\n`;
    msg += `• Taxa fixa de entrega: **${MenuManager.formatarPreco(totais.taxa)}**\n`;
    msg += `• 💰 **VALOR TOTAL: ${MenuManager.formatarPreco(totais.total)}**\n\n`;
    msg += `🛵 Seu pedido foi registrado com sucesso! Por favor, confirme seu endereço de entrega e a forma de pagamento (PIX, Cartão ou Dinheiro). Bom apetite! 😋`;

    this.adicionarMensagemBot(msg);
  },

  renderizarResumoPedido() {
    const listaEl = document.getElementById('carrinhoLista');
    const subtotalEl = document.getElementById('subtotalValor');
    const taxaEl = document.getElementById('taxaValor');
    const totalEl = document.getElementById('totalValor');
    const countBadge = document.getElementById('cartCount');

    if (!listaEl) return;

    listaEl.innerHTML = '';

    if (this.carrinho.length === 0) {
      listaEl.innerHTML = '<p class="carrinho-vazio">Nenhum item selecionado até o momento.</p>';
    } else {
      this.carrinho.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'carrinho-item';
        itemDiv.innerHTML = `
          <div class="carrinho-item-info">
            <strong>${item.prato.nome}</strong>
            <span class="carrinho-custom">${LayaExtractor.formatarCustomizacoes(item.customizacoes)}</span>
            <span class="carrinho-preco">${MenuManager.formatarPreco(item.prato.preco)}</span>
          </div>
          <button class="btn-remover-item" title="Remover item" onclick="ChatApp.removerItemCarrinho(${index})">✕</button>
        `;
        listaEl.appendChild(itemDiv);
      });
    }

    const totais = this.calcularTotal();
    if (subtotalEl) subtotalEl.textContent = MenuManager.formatarPreco(totais.subtotal);
    if (taxaEl) taxaEl.textContent = MenuManager.formatarPreco(totais.taxa);
    if (totalEl) totalEl.textContent = MenuManager.formatarPreco(totais.total);
    if (countBadge) countBadge.textContent = this.carrinho.length;
  },

  adicionarMensagemUsuario(texto) {
    this.historicoMensagens.push({ autor: 'user', texto });
    this.adicionarBolha(texto, 'usuario');
  },

  adicionarMensagemBot(texto, isAlerta = false) {
    this.historicoMensagens.push({ autor: 'bot', texto });
    this.adicionarBolha(texto, 'bot', isAlerta);
  },

  adicionarBolha(texto, autor, isAlerta = false) {
    const chatContainer = document.getElementById('chatMessages');
    if (!chatContainer) return;

    const msgDiv = document.createElement('div');
    msgDiv.className = `mensagem mensagem-${autor}${isAlerta ? ' mensagem-alerta' : ''}`;

    const avatar = autor === 'usuario' ? '👤' : '🍱';
    const nomeAutor = autor === 'usuario' ? 'Você' : 'Chef Virtual';

    // Conversão simples e segura de Markdown para visualização
    let formatado = this.formatarMarkdown(texto);

    msgDiv.innerHTML = `
      <div class="mensagem-avatar">${avatar}</div>
      <div class="mensagem-conteudo">
        <span class="mensagem-autor">${nomeAutor}</span>
        <div class="mensagem-texto">${formatado}</div>
      </div>
    `;

    chatContainer.appendChild(msgDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  },

  formatarMarkdown(str) {
    if (!str) return '';
    let res = str
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/_(.*?)_/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
    return res;
  },

  mostrarDigitando(visivel) {
    const el = document.getElementById('digitandoIndicador');
    if (el) {
      el.style.display = visivel ? 'flex' : 'none';
      const chatContainer = document.getElementById('chatMessages');
      if (visivel && chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }
  }
};

// Inicialização quando a página terminar de carregar
document.addEventListener('DOMContentLoaded', () => {
  ChatApp.init();
});

