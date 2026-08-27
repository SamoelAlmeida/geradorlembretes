const inputTexto = document.querySelector('#input-texto');
const selectPrioridade = document.querySelector('#select-prioridade'); 
const inputData = document.querySelector('#input-data');
const btnAdicionar = document.querySelector('#btn-adicionar');
const listaLembrete = document.querySelector('#lista-lembretes');
const msgErro = document.querySelector('#msg-erro');
const selectFiltro = document.querySelector('#select-filtro');
const btnTema = document.querySelector('#btn-tema');

const PRIORIDADE_PADRAO = 'baixa';
let filtroAtual = 'todos';

document.addEventListener('DOMContentLoaded', () => {
    carregarLembretes();
    carregarTema();
});

btnTema.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    if (document.body.classList.contains('dark-mode')) {
        btnTema.textContent = '☀️';
        localStorage.setItem('tema', 'escuro');
    } else {
        btnTema.textContent = '🌙';
        localStorage.setItem('tema', 'claro');
    }
});

function carregarTema() {
    const temaSalvo = localStorage.getItem('tema');
    if (temaSalvo === 'escuro') {
        document.body.classList.add('dark-mode');
        btnTema.textContent = '☀️';
    } else {
        btnTema.textContent = '🌙';
    }
}

selectFiltro.addEventListener('change', (e) => {
    filtroAtual = e.target.value;
    aplicarFiltroAtual();
});

function adicionarLembrete() {
    const texto = inputTexto.value.trim();
    const prioridade = selectPrioridade.value;
    const data = inputData.value;

    if (texto === '') {
        msgErro.textContent = 'Por favor, digite a descrição do lembrete';
        inputTexto.focus();
        return;
    }

    msgErro.textContent = '';

    const novoCard = criarCardLembrete(texto, prioridade, data, false);
    listaLembrete.appendChild(novoCard);

    salvarLembretesNoStorage();
    aplicarFiltroAtual();

    inputTexto.value = '';
    selectPrioridade.value = PRIORIDADE_PADRAO;
    inputData.value = '';
    inputTexto.focus();
}

function criarCardLembrete(texto, prioridade, data, concluido = false) {
    const card = document.createElement('div');
    card.classList.add('card-item', prioridade);

    if (concluido) {
        card.classList.add('concluido');
    }

    const infoWrapper = document.createElement('div'); 
    infoWrapper.classList.add('info-wrapper');

    const labelCheckbox = document.createElement('label');
    labelCheckbox.classList.add('checkbox-container');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.classList.add('checkbox-concluido');
    checkbox.checked = concluido;
    checkbox.setAttribute('aria-label', `Marcar lembrete como concluído: ${texto}`);

    const customCheckbox = document.createElement('span');
    customCheckbox.classList.add('checkmark-circulo');

    labelCheckbox.appendChild(checkbox);
    labelCheckbox.appendChild(customCheckbox);

    const paragrafo = document.createElement('p');
    const strong = document.createElement('strong');
    strong.textContent = texto;
    paragrafo.appendChild(strong); 

    const pequeno = document.createElement('small');
    pequeno.classList.add('info-card-small');
    pequeno.dataset.rawDate = data || '';

    let dataFormatada = '';
    if (data) {
        const [ano, mes, dia] = data.split('-');
        dataFormatada = ` | Data: ${dia}/${mes}/${ano}`;
    }
    
    pequeno.textContent = `Prioridade: ${prioridade.toUpperCase()}${dataFormatada}`; 

    infoWrapper.appendChild(paragrafo);
    infoWrapper.appendChild(pequeno);

    const esquerdaWrapper = document.createElement('div');
    esquerdaWrapper.classList.add('esquerda-wrapper');
    esquerdaWrapper.appendChild(labelCheckbox);
    esquerdaWrapper.appendChild(infoWrapper);

    const botoesWrapper = document.createElement('div');
    botoesWrapper.classList.add('botoes-wrapper');

    const btnEditar = document.createElement('button');
    btnEditar.type = 'button';
    btnEditar.classList.add('btn-editar');
    btnEditar.textContent = 'Editar';
    btnEditar.setAttribute('aria-label', `Editar lembrete: ${texto}`);

    if (concluido) {
        btnEditar.disabled = true;
    }

    const btnDeletar = document.createElement('button');
    btnDeletar.type = 'button';
    btnDeletar.classList.add('btn-deletar');
    btnDeletar.textContent = 'Excluir';
    btnDeletar.setAttribute('aria-label', `Excluir lembrete: ${texto}`);

    btnDeletar.addEventListener('click', () => {
        card.remove();
        salvarLembretesNoStorage();
    });

    checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
            card.classList.add('concluido');
            btnEditar.disabled = true; 
        } else {
            card.classList.remove('concluido');
            btnEditar.disabled = false;
        }
        salvarLembretesNoStorage();
        aplicarFiltroAtual();
    });

    btnEditar.addEventListener('click', () => {
        if (btnEditar.textContent === 'Editar') {
            const inputEdicao = document.createElement('input');
            inputEdicao.type = 'text';
            inputEdicao.value = strong.textContent;
            inputEdicao.classList.add('input-edicao');

            paragrafo.replaceChild(inputEdicao, strong);
            inputEdicao.focus();

            btnEditar.textContent = 'Salvar';
            btnDeletar.disabled = true;
            checkbox.disabled = true;
        } else {
            const inputEdicao = paragrafo.querySelector('input');
            const novoTexto = inputEdicao.value.trim();

            if (novoTexto === '') {
                alert('A descrição não pode ficar vazia!');
                inputEdicao.focus();
                return;
            }

            strong.textContent = novoTexto;
            paragrafo.replaceChild(strong, inputEdicao);

            btnEditar.textContent = 'Editar';
            btnDeletar.disabled = false;
            checkbox.disabled = false;
            btnEditar.setAttribute('aria-label', `Editar lembrete: ${novoTexto}`);
            btnDeletar.setAttribute('aria-label', `Excluir lembrete: ${novoTexto}`);

            salvarLembretesNoStorage();
        }
    });

    botoesWrapper.appendChild(btnEditar);
    botoesWrapper.appendChild(btnDeletar);

    card.appendChild(esquerdaWrapper);
    card.appendChild(botoesWrapper);

    return card;
}

function aplicarFiltroAtual() {
    const cards = document.querySelectorAll('.card-item');

    cards.forEach(card => {
        const estaConcluido = card.classList.contains('concluido');
        const prioridadeCard = Array.from(card.classList).find(c => c !== 'card-item' && c !== 'concluido');

        let mostrar = true;

        if (filtroAtual === 'pendentes') {
            mostrar = !estaConcluido;
        } else if (filtroAtual === 'concluidos') {
            mostrar = estaConcluido;
        } else if (filtroAtual === 'alta' || filtroAtual === 'media' || filtroAtual === 'baixa') {
            mostrar = prioridadeCard === filtroAtual;
        } else {
            mostrar = true;
        }

        if (mostrar) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}

function salvarLembretesNoStorage() {
    const cards = document.querySelectorAll('.card-item');
    const lembretesArray = [];

    cards.forEach(card => {
        const texto = card.querySelector('strong').textContent;
        const prioridade = Array.from(card.classList).find(c => c !== 'card-item' && c !== 'concluido');
        const concluido = card.classList.contains('concluido');
        const data = card.querySelector('.info-card-small').dataset.rawDate;

        lembretesArray.push({ texto, prioridade, data, concluido });
    });

    localStorage.setItem('lembretes', JSON.stringify(lembretesArray));
}

function carregarLembretes() {
    const lembretesSalvos = localStorage.getItem('lembretes');
    if (!lembretesSalvos) return;

    const lembretesArray = JSON.parse(lembretesSalvos);

    lembretesArray.forEach(item => {
        const card = criarCardLembrete(item.texto, item.prioridade, item.data, item.concluido);
        listaLembrete.appendChild(card);
    });
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