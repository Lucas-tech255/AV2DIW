import { listarParticipantes, listarVotos, zerarVotos } from './api.js';

const placar = document.querySelector('#placar');
const mensagem = document.querySelector('#mensagem');
const botaoZerar = document.querySelector('#zerar');

function criarResultado(peao, total, lider) {
  const percentual = 100 * peao.votos / total;
  const card = document.createElement('article');
  card.className = 'card';
  card.innerHTML = `
    <div class="card-body d-flex flex-column flex-sm-row align-items-sm-center gap-3">
      <img class="rounded object-fit-cover" alt="" width="160" height="90">
      <div class="flex-grow-1">
        <h2 class="fs-5 d-inline"></h2>
        ${lider ? '<span class="badge bg-danger">Sairia hoje</span>' : ''}
        <div class="progress mt-2" role="progressbar" aria-valuemin="0" aria-valuemax="100">
          <div class="progress-bar"></div>
        </div>
        <p class="mb-0"></p>
      </div>
    </div>
  `;
  card.querySelector('img').src = peao.foto;
  card.querySelector('h2').textContent = peao.nome;
  
  const progresso = card.querySelector('.progress');
  progresso.setAttribute('aria-label', peao.nome);
  progresso.setAttribute('aria-valuenow', percentual.toFixed(1));
  card.querySelector('.progress-bar').style.width = `${percentual}%`;
  const unidade = peao.votos === 1 ? 'voto' : 'votos';
  card.querySelector('p').textContent = `${percentual.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}% (${peao.votos} ${unidade})`;
  return card;
}


async function atualizarPlacar() {
  const [roca, votos] = await Promise.all([listarParticipantes(true), listarVotos()]);
  const ranking = roca.map(peao => ({
    ...peao,
    votos: votos.filter(voto => voto.participanteId === peao.id).length
  }));
  ranking.sort((a, b) => b.votos - a.votos);
  const total = ranking.reduce((soma, peao) => soma + peao.votos, 0);

  document.querySelector('#total').textContent = total;
  placar.replaceChildren();
  botaoZerar.classList.toggle('d-none', votos.length === 0);

  if (total === 0) {
    placar.innerHTML = `
      <div class="card card-body text-center">
        <p>Nenhum voto ainda</p>
        <div><a class="btn btn-danger" href="votacao.html">Ir para a votação</a></div>
      </div>
    `;
    return;
  }

  const liderIsolado = ranking[0].votos > (ranking[1]?.votos ?? 0);
  placar.append(...ranking.map((peao, i) => criarResultado(peao, total, i === 0 && liderIsolado)));
}

function mostrarErro(erro) {
  console.error(erro);
}

document.querySelector('#confirmar').addEventListener('click', async () => {
  botaoZerar.disabled = true;
  mensagem.className = '';
  mensagem.textContent = '';
  try {
    await zerarVotos();
  } catch (erro) {
    mostrarErro(erro);
  } finally {
    await atualizarPlacar().catch(mostrarErro);
    botaoZerar.disabled = false;
  }
});

atualizarPlacar().catch(mostrarErro);
