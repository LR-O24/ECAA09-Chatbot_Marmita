// eliza.js - Motor Conversacional baseado no clássico ELIZA (1966) com Regex e Decomposição de Padrões
// Adaptado para atendimento do restaurante de marmitas com foco conversacional empático e amigável.

const ElizaEngine = {
  // Tabela de reflexões de pronomes (técnica clássica de Joseph Weizenbaum)
  reflections: {
    "eu": "você",
    "voce": "eu",
    "você": "eu",
    "meu": "seu",
    "minha": "sua",
    "meus": "seus",
    "minhas": "suas",
    "estou": "está",
    "sou": "é",
    "quero": "deseja",
    "queria": "desejava",
    "gostaria": "gostaria",
    "me": "te",
    "te": "me"
  },

  // Dicionário de Padrões Regex clássicos com respostas empáticas de atendimento
  rules: [
    {
      padrao: /\b(oi|ola|olá|opa|bom dia|boa tarde|boa noite|e ai|e aí)\b/i,
      respostas: [
        "Olá! Seja muito bem-vindo ao Marmita do Chef! Como posso ajudar você a montar seu almoço hoje?",
        "Oi, tudo ótimo! É um prazer atender você. Gostaria de ver o cardápio do dia ou já sabe qual prato deseja pedir?",
        "Olá! Bateu aquela fome de comida caseira quentinha? Estou à disposição para anotar seu pedido!"
      ]
    },
    {
      padrao: /\b(cardapio|cardápio|menu|opcoes|opções|o que tem|quais pratos|o que servem)\b/i,
      tipo: "ACAO_CARDAPIO",
      respostas: [
        "Aqui está o nosso cardápio fresquinho preparado com todo carinho para hoje:",
        "Com certeza! Veja as delícias disponíveis hoje:"
      ]
    },
    {
      padrao: /\b(preco|preço|quanto custa|qual o valor|valores)\b/i,
      respostas: [
        "Nossas marmitas variam de R$ 22,00 a R$ 32,00 dependendo do prato escolhido, e nossa taxa fixa de entrega é apenas R$ 5,00. Deseja conferir o cardápio detalhado?",
        "Trabalhamos com preços muito justos e comida de altíssima qualidade! Diga qual prato você tem interesse ou peça para ver o cardápio completo."
      ]
    },
    {
      padrao: /\b(entrega|taxa|frete|entregam|onde entregam|tempo|demora)\b/i,
      respostas: [
        "Nossa entrega tem uma taxa fixa de R$ 5,00 para toda a nossa região, com tempo médio estimado de 35 a 50 minutos. Gostaria de adiantar seu pedido?",
        "Sim! Fazemos entregas com taxa única de R$ 5,00 e garantimos que a comida chegue super quentinha!"
      ]
    },
    {
      padrao: /\b(como funciona|como pedir|ajuda|socorro)\b/i,
      respostas: [
        "É super simples: 1) Você confere o cardápio do dia; 2) Me diz qual marmita deseja; 3) Avisa se quer alguma customização (ex: tirar a cebola, trocar tempero ou escolher o ponto da carne); 4) Confirma o endereço e valor final com entrega!",
        "Estou aqui para guiar todo o seu pedido! Basta me dizer o que tem vontade de comer ou pedir o cardápio."
      ]
    },
    {
      padrao: /\b(obrigad[oa]|valeu|agradecido|perfeito|otimo|ótimo|maravilha)\b/i,
      respostas: [
        "De nada! É uma alegria enorme poder te ajudar. Se precisar de mais alguma coisa, é só me chamar!",
        "Por nada! Estamos preparando tudo com muito amor para você!",
        "Disponha sempre! Qualquer detalhe do seu pedido, conte comigo."
      ]
    },
    {
      padrao: /\b(fechar|finalizar|encerrar|concluir|pagar|fechamento)\b/i,
      tipo: "ACAO_FINALIZAR",
      respostas: [
        "Vamos conferir e finalizar o seu pedido agora mesmo:",
        "Perfeito! Vou gerar o resumo final com a taxa de entrega:"
      ]
    },
    {
      padrao: /\b(cancelar|limpar|recomecar|recomeçar|apagar)\b/i,
      tipo: "ACAO_LIMPAR",
      respostas: [
        "Seu pedido foi reiniciado com sucesso. Fique à vontade para escolher novamente quando desejar!",
        "Tudo zerado! Como posso começar o seu novo pedido?"
      ]
    }
  ],

  // Respostas de fallback inspiradas no estilo reflexivo de ELIZA quando o contexto não é claro
  fallbacks: [
    "Entendi perfeitamente. Você gostaria de adicionar essa marmita ao seu pedido ou deseja tirar mais alguma dúvida do cardápio?",
    "Que ótima escolha! Quer que eu prepare com algum tempero especial ou no ponto que você mais gosta?",
    "Compreendo. Gostaria de conferir nosso cardápio do dia ou prefere já me dizer os detalhes da sua marmita?",
    "Poderia me detalhar um pouco mais sobre como prefere sua refeição? Estou aqui para deixar do seu jeitinho!",
    "Anotei suas observações! Deseja mais algum item ou podemos fechar o seu pedido com a entrega?"
  ],

  // Aplica reflexões de pronomes
  reflect(frase) {
    const palavras = frase.toLowerCase().split(/\s+/);
    const refletidas = palavras.map(palavra => this.reflections[palavra] || palavra);
    return refletidas.join(" ");
  },

  // Processa a mensagem no estilo ELIZA
  responder(texto) {
    for (const regra of this.rules) {
      if (regra.padrao.test(texto)) {
        const respostaSorteada = regra.respostas[Math.floor(Math.random() * regra.respostas.length)];
        return {
          texto: respostaSorteada,
          tipo: regra.tipo || "CONVERSA_PADRAO"
        };
      }
    }

    // Se nenhuma regra der match, seleciona um fallback reflexivo
    const fallbackSorteado = this.fallbacks[Math.floor(Math.random() * this.fallbacks.length)];
    return {
      texto: fallbackSorteado,
      tipo: "FALLBACK"
    };
  }
};

