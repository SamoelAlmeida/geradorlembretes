const inputTexto = document.querySelector('#input-texto');
const selectPrioridade = document.querySelector('#select-prioridade'); 
const btnAdicionar = document.querySelector('#btn-adicionar');
const listaLembrete = document.querySelector('#lista-lembretes');
const msgErro = document.querySelector('#msg-erro');

const PRIORIDADE_PADRAO = 'baixa';

function adicionarLembrete() {
    const texto = inputTexto.value.trim();
    const prioridade = selectPrioridade.value;

    if (texto === '') {
        msgErro.textContent = 'Por favor, digite a descrição do lembrete';
        inputTexto.focus();
        return;
    }

    msgErro.textContent = '';

    const novoCard = criarCardLembrete(texto, prioridade);
    listaLembrete.appendChild(novoCard);

    inputTexto.value = '';
    selectPrioridade.value = PRIORIDADE_PADRAO;
    inputTexto.focus();
}

function criarCardLembrete(texto, prioridade) {
    const card = document.createElement('div');
    card.classList.add('card-item', prioridade);

    const infoWrapper = document.createElement('div'); 

    const paragrafo = document.createElement('p');
    const strong = document.createElement('strong');
    strong.textContent = texto;
    paragrafo.appendChild(strong); 

    const pequeno = document.createElement('small');
    pequeno.textContent = `Prioridade: ${prioridade.toUpperCase()}`; 

    infoWrapper.appendChild(paragrafo);
    infoWrapper.appendChild(pequeno);

    const btnDeletar = document.createElement('button');
    btnDeletar.type = 'button';
    btnDeletar.classList.add('btn-deletar');
    btnDeletar.textContent = 'Excluir';
    btnDeletar.setAttribute('aria-label', `Excluir lembrete: ${texto}`);

    btnDeletar.addEventListener('click', () => {
        card.remove();
    });

    card.appendChild(infoWrapper);
    card.appendChild(btnDeletar);

    return card;
}

btnAdicionar.addEventListener('click', adicionarLembrete);

inputTexto.addEventListener('keydown', (evento) => {
  if (evento.key === 'Enter') {
    evento.preventDefault();
    adicionarLembrete();
  }
});

inputTexto.addEventListener('input', () => {
  if (msgErro.textContent) msgErro.textContent = '';
});