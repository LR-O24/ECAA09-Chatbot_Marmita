// guardrails.js - Camadas de Proteção contra Injeção de Prompt, Jailbreak e XSS

const Guardrails = {
  // Padrões de ataque clássicos e modernos contra LLMs / Bots
  jailbreakPatterns: [
    /ignore\s+(all\s+)?(previous|prior|above)\s+(instructions|prompts|rules)/i,
    // Variantes PT-BR com e sem acentos (normalização Unicode)
    /desconsidere\s+(todas\s+as\s+)?(instru[çc][õo]es|regras|ordens)/i,
    /desconsidera\s+(todas\s+as\s+)?(instru[çc][õo]es|regras|ordens)/i,
    // "desconsidere suas instruções" sem acentos: "desconsidere suas instrucoes"
    /desconsider[ea]\s+\S+/i,
    /esque[çc][ae]\s+(tudo|suas\s+instru[çc][õo]es|o\s+que\s+voc[êe]\s+[ée])/i,
    // "esqueça tudo" sem acento: "esqueca tudo"
    /esquec[ae]\s+tudo/i,
    /voc[êe]\s+agora\s+[ée]\s+(um|uma|o|a)?/i,
    /you\s+are\s+now\s+(a|an)?/i,
    /act\s+as\s+(a|an)?/i,
    /finja\s+que\s+[ée]/i,
    /modo\s+(dan|developer|god|jailbreak|desenvolvedor|irrestrito)/i,
    /jailbreak/i,
    /system\s*prompt/i,
    /prompt\s+do\s+sistema/i,
    /revele\s+(suas|o)\s+(instru[çc][õo]es|prompt)/i,
    /print\s+your\s+instructions/i,
    // bypass como palavra isolada (evita falso positivo em "gordura bypass" de texto inocente, mas bloqueia ataques diretos)
    /\bbypass\b/i,
    /\bsudo\b/i,
    /qual\s+[ée]\s+sua\s+chave/i,
    /api[-_ ]?key\b/i
  ],

  // Padrões maliciosos de código (XSS, scripts, injeções)
  maliciousPatterns: [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /onerror\s*=/gi,
    /onload\s*=/gi,
    /onclick\s*=/gi,
    /<iframe/gi,
    /<img\b[^>]*src[^>]*>/gi,
    /eval\s*\(/gi,
    /Function\s*\(/gi,
    /document\.cookie/gi,
    /window\.localStorage/gi
  ],

  // Validação de entrada (Camada 1: Client-Side Input Filter)
  validateInput(input) {
    if (typeof input !== 'string') {
      return { isValid: false, sanitized: '', reason: 'Entrada inválida' };
    }

    const trimmed = input.trim();

    if (trimmed.length === 0) {
      return { isValid: false, sanitized: '', reason: 'Mensagem vazia.' };
    }

    // Limite de caracteres para evitar estouro de buffer/contexto
    if (trimmed.length > 500) {
      return {
        isValid: false,
        sanitized: trimmed.substring(0, 500),
        reason: 'Mensagem muito longa! Por favor, envie mensagens com até 500 caracteres.'
      };
    }

    // CAMADA 1a: Verificação de código malicioso (ANTES do escapeHtml para detectar tags HTML originais)
    for (const pattern of this.maliciousPatterns) {
      if (pattern.test(trimmed)) {
        return {
          isValid: false,
          sanitized: '',
          isAttack: true,
          reason: '🛡️ **Alerta de Segurança:** Caracteres e scripts potencialmente maliciosos foram bloqueados.'
        };
      }
    }

    // CAMADA 1b: Verificação de Jailbreak / Prompt Injection (após chk de código mas antes de escape)
    for (const pattern of this.jailbreakPatterns) {
      pattern.lastIndex = 0; // reset de flags globais
      if (pattern.test(trimmed)) {
        return {
          isValid: false,
          sanitized: '',
          isAttack: true,
          reason: '🛡️ **Alerta de Segurança (Guardrail Ativado):** Detectamos uma tentativa de manipulação de instruções ou comando não permitido. O assistente foi programado exclusivamente para atendimento e venda de marmitas.'
        };
      }
    }

    // Sanitização de HTML / XSS — aplicada APÓS todas as verificações
    const sanitized = this.escapeHtml(trimmed);

    return {
      isValid: true,
      sanitized: sanitized,
      rawText: trimmed
    };
  },

  // Validação da saída do modelo (Camada 3: Output Filter)
  filterOutput(output) {
    if (!output || typeof output !== 'string') return '';

    // Remove qualquer tag script acidental ou perigosa
    let safe = output.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "[código removido]");

    // Bloqueia vazamento acidental de tokens/chaves se houver
    safe = safe.replace(/AIza[0-9A-Za-z-_]{35}/g, "[CHAVE_PROTEGIDA]");
    safe = safe.replace(/sk-[0-9A-Za-z-_]{32,}/g, "[CHAVE_PROTEGIDA]");

    return safe;
  },

  // Escape seguro de caracteres HTML
  escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
};

