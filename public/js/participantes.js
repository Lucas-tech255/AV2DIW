import { listarParticipantes, registrarVoto } from './api.js';

const mensagem = document.querySelector('#mensagem');
const paginaVotacao = location.pathname.endsWith('/votacao.html');
let meusVotos = 0;

function criarCard(peao, naRoca) {
  const coluna = document.createElement('div');
  coluna.className = 'col';
  coluna.innerHTML = `
    <article class="card h-100">
      <div class="ratio ratio-16x9">
        <img class="card-img-top object-fit-cover" alt="">
      </div>
      <div class="card-body text-center">
        <h3 class="card-title fs-6"></h3>
      </div>
    </article>
  `;

  coluna.querySelector('img').src = peao.foto;
  coluna.querySelector('h3').textContent = peao.nome;
  const corpo = coluna.querySelector('.card-body');

  if (naRoca) {
    corpo.insertAdjacentHTML('afterbegin', '<span class="badge bg-danger mb-2">Na roça</span>');
  }

  if (naRoca && paginaVotacao) {
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.className = 'btn btn-danger w-100';
    botao.textContent = 'Votar para eliminar';
    botao.addEventListener('click', async () => {
      botao.disabled = true;
      try {
        await registrarVoto(peao.id);
        meusVotos++;
        mensagem.className = 'alert alert-success';
        const unidade = meusVotos === 1 ? 'voto' : 'votos';
        mensagem.textContent = `Voto registrado em ${peao.nome}. Você deu ${meusVotos} ${unidade} nesta visita.`;
      } catch {
        mensagem.className = 'alert alert-danger';
        mensagem.textContent = 'Falha ao registrar o voto.';
      } finally {
        botao.disabled = false;
      }
    });
    corpo.append(botao);
  }

  return coluna;
}

async function carregarParticipantes() {
  try {
    const [roca, demais] = await Promise.all([
      listarParticipantes(true),
      listarParticipantes(false)
    ]);
    document.querySelector('#roca').append(...roca.map(peao => criarCard(peao, true)));
    document.querySelector('#demais').append(...demais.map(peao => criarCard(peao, false)));
  } catch (erro) {
  console.error(erro);
}
}

carregarParticipantes();
