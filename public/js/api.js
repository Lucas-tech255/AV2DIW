async function requisitar(rota, opcoes) {
  const resposta = await fetch(rota, opcoes);
  if (!resposta.ok) {
    throw new Error(`Erro na requisição: ${resposta.status}`);
  }
  return resposta;
}

export async function listarParticipantes(naRoca) {
  const resposta = await requisitar(`/participantes?naRoca=${naRoca}`);
  return resposta.json();
}

export async function listarVotos() {
  const resposta = await requisitar('/votos');
  return resposta.json();
}

export async function registrarVoto(participanteId) {
  await requisitar('/votos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ participanteId, data: new Date().toISOString() })
  });
}

export async function zerarVotos() {
  const votos = await listarVotos();
  for (const voto of votos) {
    await requisitar(`/votos/${encodeURIComponent(voto.id)}`, { method: 'DELETE' });
  }
}
