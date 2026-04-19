// Dados estáticos
const IMG_BASE = 'imagens/lixeiras_e_cartas/';
const lixeiras = {
    plastico: { imagem: 'lixeira_plastico.png' },
    papel:    { imagem: 'lixeira_papel.png' },
    vidro:    { imagem: 'lixeira_vidro.png' },
    organico: { imagem: 'lixeira_organico.png' },
    metal:    { imagem: 'lixeira_metal.png' }
};

const itensDisponiveis = [
    { nome: 'Garrafas PET',          tipo: 'plastico', imagem: 'garrafa_pet.png' },
    { nome: 'Sacolas Plásticas',     tipo: 'plastico', imagem: 'sacola_plastica.png' },
    { nome: 'Copo Plástico',         tipo: 'plastico', imagem: 'copo_plastico.png' },
    { nome: 'Embalagens Plásticas',  tipo: 'plastico', imagem: 'embalagens_plasticas.png' },
    { nome: 'Embalagem de Papel',    tipo: 'papel',    imagem: 'embalagens_papel.png' },
    { nome: 'Folhas de Papel',       tipo: 'papel',    imagem: 'folhas.png' },
    { nome: 'Caixa de Papelão',      tipo: 'papel',    imagem: 'papelao.png' },
    { nome: 'Revistas e Jornais',    tipo: 'papel',    imagem: 'revistas_e_jornal.png' },
    { nome: 'Cuba de Ovo',           tipo: 'papel',    imagem: 'cuba_limpa.png' },
    { nome: 'Copos de Vidro',        tipo: 'vidro',    imagem: 'copos_vidro.png' },
    { nome: 'Garrafas de Vidro',     tipo: 'vidro',    imagem: 'garrafas_de_vidro.png' },
    { nome: 'Frascos de Vidro',      tipo: 'vidro',    imagem: 'frascos_de_vidro.png' },
    { nome: 'Latas de Alumínio',     tipo: 'metal',    imagem: 'latas_aluminio.png' },
    { nome: 'Lacres de Latinha',     tipo: 'metal',    imagem: 'lacres_latinha.png' },
    { nome: 'Parafusos',             tipo: 'metal',    imagem: 'parafusos.png' },
    { nome: 'Tampas de Garrafas e Potes', tipo: 'metal', imagem: 'tampas_garrafa_pote.png' },
    { nome: 'Lata de Alimento',      tipo: 'metal',    imagem: 'lata_alimento.png' },
    { nome: 'Papel Alumínio',        tipo: 'metal',    imagem: 'papel_aluminio.png' },
    { nome: 'Caixa de Pizza',        tipo: 'organico', imagem: 'caixa_pizza.png' },
    { nome: 'Caixa de Ovo quebrado', tipo: 'organico', imagem: 'caixa_ovo.png' },
    { nome: 'Cascas de Alimentos',   tipo: 'organico', imagem: 'cascas.png' },
    { nome: 'Coador com Borra',      tipo: 'organico', imagem: 'borra_cafe.png' }
];

// Variáveis do jogo
let cartasAtuais = [];
let cartasDOM = [];
let primeiraCarta = null, segundaCarta = null;
let bloqueioTabuleiro = false;
let itemPendenteParaReciclar = null;
let errosCombinacao = 0, errosLixeira = 0;
let tempoRestante = 90;
let temporizadorInterval = null;
let jogoAtivo = false;

// Áudio
let audioCtx = null;
let somAtivado = false;
let somMudo = false;

function ativarSom() {
    if (!somAtivado && window.AudioContext) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        somAtivado = true;
    }
}

function playBeep(freq, duracao, vol = 0.05) {
    if (somMudo || !somAtivado || !audioCtx) return;
    try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.value = vol;
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + duracao);
        osc.stop(audioCtx.currentTime + duracao);
    } catch(e) { console.warn("Erro no áudio", e); }
}

function somVirar() { playBeep(800, 0.1, 0.03); }
function somAcertoPar() { playBeep(1200, 0.2, 0.05); }
function somErroPar() { playBeep(400, 0.3, 0.04); }
function somAcertoLixeira() { playBeep(1500, 0.25, 0.05); }
function somErroLixeira() { playBeep(300, 0.4, 0.04); }
function somVitoria() { 
    playBeep(1047, 0.2, 0.06);
    setTimeout(() => playBeep(1319, 0.2, 0.06), 200);
    setTimeout(() => playBeep(1568, 0.4, 0.06), 400);
}
function somGameOver() { 
    playBeep(220, 0.8, 0.06);
    setTimeout(() => playBeep(196, 0.6, 0.06), 400);
}

// Elementos DOM
const muteBtn = document.getElementById('muteBtn');
const homeBtn = document.getElementById('homeBtn');
const tabuleiroEl = document.getElementById('tabuleiro');
const lixeirasContainer = document.getElementById('lixeiras-container');
const mensagemEl = document.getElementById('mensagem');
const timerEl = document.getElementById('timer');
const errosCombinacaoEl = document.getElementById('errosCombinacao');
const errosLixeiraEl = document.getElementById('errosLixeira');
const btnReiniciarManual = document.getElementById('btnReiniciarManual');
const modalIntro = document.getElementById('modalIntro');
const btnProsseguir = document.getElementById('btnProsseguir');
const modalGameOver = document.getElementById('modalGameOver');
const btnRestartGame = document.getElementById('btnRestartGame');
const btnExitGame = document.getElementById('btnExitGame');
const gameoverMessage = document.getElementById('gameoverMessage');

// Eventos de áudio e home
if (muteBtn) {
    muteBtn.addEventListener('click', () => {
        somMudo = !somMudo;
        muteBtn.textContent = somMudo ? "🔇" : "🔊";
    });
}
if (homeBtn) {
    homeBtn.addEventListener('click', () => {
        if (confirm("Deseja sair do jogo e voltar ao site principal?")) {
            window.location.href = "index.html";
        }
    });
}
if (btnExitGame) {
    btnExitGame.addEventListener('click', () => {
        if (confirm("Deseja sair do jogo e voltar ao site principal?")) {
            window.location.href = "index.html";
        }
    });
}

// Funções do jogo
function formatarTempo(seg) {
    const mins = Math.floor(seg / 60);
    const secs = seg % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function atualizarInterface() {
    timerEl.textContent = formatarTempo(tempoRestante);
    errosCombinacaoEl.textContent = errosCombinacao;
    errosLixeiraEl.textContent = errosLixeira;
}

function pararTemporizador() {
    if (temporizadorInterval) clearInterval(temporizadorInterval);
    temporizadorInterval = null;
}

function iniciarTemporizador() {
    pararTemporizador();
    temporizadorInterval = setInterval(() => {
        if (!jogoAtivo) return;
        if (tempoRestante <= 1) {
            pararTemporizador();
            jogoAtivo = false;
            mostrarGameOver("⏰ Tempo esgotado! Você não conseguiu reciclar a tempo.");
        } else {
            tempoRestante--;
            timerEl.textContent = formatarTempo(tempoRestante);
        }
    }, 1000);
}

function embaralhar(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function selecionarItensAleatorios(qtd) {
    if (qtd > itensDisponiveis.length) qtd = itensDisponiveis.length;
    const copia = [...itensDisponiveis];
    const selecionados = [];
    for (let i = 0; i < qtd && copia.length > 0; i++) {
        const idx = Math.floor(Math.random() * copia.length);
        selecionados.push(copia[idx]);
        copia.splice(idx, 1);
    }
    return selecionados;
}

function construirTabuleiro() {
    tabuleiroEl.innerHTML = '';
    cartasDOM = [];
    cartasAtuais.forEach((carta, idx) => {
        const div = document.createElement('div');
        div.className = 'carta';
        div.setAttribute('data-idx', idx);
        div.setAttribute('data-tipo', carta.tipo);
        div.setAttribute('data-nome', carta.nome);
        div.setAttribute('data-imagem', carta.imagem);
        div.textContent = '?';
        div.style.backgroundImage = '';
        div.onclick = () => virarCarta(div);
        tabuleiroEl.appendChild(div);
        cartasDOM.push(div);
    });
}

function construirLixeiras() {
    lixeirasContainer.innerHTML = '';
    for (const [tipo, dados] of Object.entries(lixeiras)) {
        const div = document.createElement('div');
        div.className = 'lixeira';
        div.style.backgroundImage = `url('${IMG_BASE}lixeiras/${dados.imagem}')`;
        div.style.backgroundColor = 'transparent';
        div.textContent = '';
        div.onclick = () => escolherLixeira(tipo);
        lixeirasContainer.appendChild(div);
    }
}

function mostrarGameOver(motivo) {
    somGameOver();
    let mensagem = '';
    if (motivo.includes('tempo')) {
        mensagem = '⏰ O tempo acabou! Tente ser mais rápido na próxima.';
    } else if (motivo.includes('lixeira')) {
        mensagem = '🗑️ Você errou a lixeira 3 vezes. Fique de olho nas cores!';
    } else {
        mensagem = '❌ 10 erros de combinação. Encontre os pares antes de reciclar.';
    }
    gameoverMessage.textContent = mensagem;
    modalGameOver.style.display = 'flex';
}

function reiniciarJogo() {
    modalIntro.style.display = 'none';
    modalGameOver.style.display = 'none';
    pararTemporizador();
    jogoAtivo = false;

    primeiraCarta = segundaCarta = null;
    bloqueioTabuleiro = false;
    itemPendenteParaReciclar = null;
    errosCombinacao = 0;
    errosLixeira = 0;
    tempoRestante = 90;
    atualizarInterface();

    const itensSelecionados = selecionarItensAleatorios(8);
    let cartasDuplicadas = [...itensSelecionados, ...itensSelecionados];
    cartasAtuais = embaralhar(cartasDuplicadas);
    construirTabuleiro();

    mensagemEl.innerHTML = "Jogo reiniciado! Encontre os pares.";
    mensagemEl.style.color = "#d9534f";

    if (modalIntro.style.display === 'none') {
        jogoAtivo = true;
        iniciarTemporizador();
    }
}


function verificarVitoria() {
    const todasResolvidas = cartasDOM.every(carta => carta.classList.contains('resolvida'));
    if (todasResolvidas) {
        somVitoria();
        pararTemporizador();
        jogoAtivo = false;
        mensagemEl.innerHTML = "🎉 PARABÉNS! Você reciclou todos os itens! 🎉";
        mensagemEl.style.color = "green";
        setTimeout(() => {
            reiniciarJogo();
            jogoAtivo = true;
            iniciarTemporizador();
        }, 3000);
    }
}

function adicionarErroCombinacao() {
    if (!jogoAtivo) return false;
    errosCombinacao++;
    errosCombinacaoEl.textContent = errosCombinacao;
    if (errosCombinacao >= 10) {
        pararTemporizador();
        jogoAtivo = false;
        mostrarGameOver("❌ Você atingiu 10 erros de combinação! Tente novamente.");
        return false;
    }
    return true;
}

function adicionarErroLixeira() {
    if (!jogoAtivo) return false;
    errosLixeira++;
    errosLixeiraEl.textContent = errosLixeira;
    if (errosLixeira >= 3) {
        pararTemporizador();
        jogoAtivo = false;
        mostrarGameOver("🗑️ Você atingiu 3 erros de lixeira! Recicle com mais atenção.");
        return false;
    }
    return true;
}

function virarCarta(carta) {
    if (!somAtivado) ativarSom();

    if (!jogoAtivo || bloqueioTabuleiro || carta === primeiraCarta) return;
    if (itemPendenteParaReciclar) {
        mensagemEl.innerHTML = "Você já tem um par! Clique na lixeira correta.";
        return;
    }
    if (carta.classList.contains('virada') || carta.classList.contains('resolvida')) return;

    somVirar();

    carta.textContent = '';
    const img = carta.getAttribute('data-imagem');
    carta.style.backgroundImage = `url('${IMG_BASE}itens/${img}')`;
    carta.classList.add('virada');

    if (!primeiraCarta) {
        primeiraCarta = carta;
        return;
    }
    segundaCarta = carta;
    verificarPar();
}

function verificarPar() {
    const nome1 = primeiraCarta.getAttribute('data-nome');
    const nome2 = segundaCarta.getAttribute('data-nome');

    if (nome1 === nome2) {
        somAcertoPar();
        const tipo = primeiraCarta.getAttribute('data-tipo');
        itemPendenteParaReciclar = { nome: nome1, tipo: tipo };
        mensagemEl.innerHTML = `Par de ${nome1} encontrado! Clique na lixeira correta.`;
        mensagemEl.style.color = "green";
    } else {
        somErroPar();
        bloqueioTabuleiro = true;
        mensagemEl.innerHTML = "Não formou par! -1 erro de combinação";
        mensagemEl.style.color = "red";
        const continua = adicionarErroCombinacao();
        if (!continua) {
            resetarTurno();
            return;
        }
        setTimeout(() => {
            primeiraCarta.textContent = '?';
            primeiraCarta.style.backgroundImage = '';
            primeiraCarta.classList.remove('virada');
            segundaCarta.textContent = '?';
            segundaCarta.style.backgroundImage = '';
            segundaCarta.classList.remove('virada');
            resetarTurno();
            mensagemEl.innerHTML = "Encontre os pares!";
            mensagemEl.style.color = "#d9534f";
        }, 1000);
    }
}

function resetarTurno() {
    primeiraCarta = null;
    segundaCarta = null;
    bloqueioTabuleiro = false;
}

function escolherLixeira(tipoLixeira) {
    if (!jogoAtivo) return;
    if (!itemPendenteParaReciclar) {
        mensagemEl.innerHTML = "Primeiro encontre um par!";
        return;
    }

    if (tipoLixeira === itemPendenteParaReciclar.tipo) {
        somAcertoLixeira();
        mensagemEl.innerHTML = `✅ Correto! ${itemPendenteParaReciclar.nome} reciclado.`;
        mensagemEl.style.color = "green";
        primeiraCarta.classList.add('resolvida');
        segundaCarta.classList.add('resolvida');
        itemPendenteParaReciclar = null;
        resetarTurno();
        verificarVitoria();
    } else {
        somErroLixeira();
        mensagemEl.innerHTML = `❌ Lixeira incorreta! ${itemPendenteParaReciclar.nome} não vai aí. -1 erro`;
        mensagemEl.style.color = "red";
        const continua = adicionarErroLixeira();
        if (!continua) {
            itemPendenteParaReciclar = null;
            resetarTurno();
            return;
        }
        mensagemEl.innerHTML = `Tente novamente! ${itemPendenteParaReciclar.nome} precisa da lixeira certa.`;
    }
}

function iniciarJogo() {
    ativarSom();
    modalIntro.style.display = 'none';
    reiniciarJogo();
    jogoAtivo = true;
    iniciarTemporizador();
    mensagemEl.innerHTML = "Jogo iniciado! Encontre os pares.";
}

// Registrar eventos
btnProsseguir.addEventListener('click', iniciarJogo);
btnReiniciarManual.addEventListener('click', () => {
    if (modalIntro.style.display !== 'none') iniciarJogo();
    else {
        reiniciarJogo();
        if (!jogoAtivo) {
            jogoAtivo = true;
            iniciarTemporizador();
        }
        mensagemEl.innerHTML = "Jogo reiniciado manualmente!";
    }
});
btnRestartGame.addEventListener('click', () => {
    reiniciarJogo();
    jogoAtivo = true;
    iniciarTemporizador();
    mensagemEl.innerHTML = "Jogo reiniciado!";
});

// Inicialização
construirLixeiras();
cartasAtuais = [];
construirTabuleiro();