import { describe, expect, it } from "@jest/globals";
import { fixtures } from ".";
import type { FocoRota } from "../tipos";

const nomes = [
  "conclusivo",
  "sem_diferenca",
  "mistos",
  "insuficiente_amostra",
  "insuficiente_cobertura",
  "insuficiente_largura",
  "nao_aplicavel",
  "uma_rota",
  "outra_opcao",
  "sem_servico",
  "indisponivel",
] as const;
const focosValidos: FocoRota[] = [
  "MENOR_TEMPO",
  "MENOS_CAMINHADA",
  "MENOR_EXPOSICAO",
  "OUTRA_OPCAO",
];
const termosProibidos = /segur|perigos|risco|zona vermelha/i;

function stringsRecursivas(valor: unknown): string[] {
  if (typeof valor === "string") return [valor];
  if (Array.isArray(valor)) return valor.flatMap(stringsRecursivas);
  if (valor !== null && typeof valor === "object") {
    return Object.values(valor).flatMap(stringsRecursivas);
  }
  return [];
}

describe("fixtures da consulta", () => {
  it("exporta os onze casos esperados", () => {
    expect(Object.keys(fixtures).sort()).toEqual([...nomes].sort());
  });

  it.each(nomes)("mantém invariantes e linguagem em %s", (nome) => {
    const resposta = fixtures[nome];
    expect(resposta.exemplo).toBe(true);

    const rotas = resposta.rotas;
    expect(rotas.length).toBeLessThanOrEqual(3);
    expect(new Set(rotas.map((rota) => rota.id)).size).toBe(rotas.length);
    for (const rota of rotas) {
      expect(rota.focos.every((foco) => focosValidos.includes(foco))).toBe(true);
    }

    const rotasComMenorExposicao = rotas.filter((rota) =>
      rota.focos.includes("MENOR_EXPOSICAO"),
    );
    if (nome === "conclusivo") {
      expect(rotasComMenorExposicao).toHaveLength(1);
      expect(rotas[0]).toBe(rotasComMenorExposicao[0]);
    } else {
      expect(rotasComMenorExposicao).toHaveLength(0);
      expect(rotas.map((rota) => rota.duracaoMin)).toEqual(
        [...rotas.map((rota) => rota.duracaoMin)].sort((a, b) => a - b),
      );
    }

    if (nome === "sem_servico" || nome === "indisponivel") {
      expect(rotas).toHaveLength(0);
    }
    if (nome === "nao_aplicavel") {
      expect(
        rotas.some(
          (rota) =>
            rota.caminhadaKm === 0 && rota.exposicao.registrosPorKm === null,
        ),
      ).toBe(true);
    }
    if (nome === "outra_opcao") {
      expect(rotas.some((rota) => rota.focos.includes("OUTRA_OPCAO"))).toBe(true);
      expect(rotas[0]?.focos).toEqual(["MENOR_TEMPO", "MENOS_CAMINHADA"]);
      expect(rotas[1]?.focos).toEqual(["OUTRA_OPCAO"]);
    }

    for (const texto of stringsRecursivas(resposta)) {
      expect(texto).not.toMatch(termosProibidos);
    }
  });
});

const minutos = (iso: string) => new Date(iso).getTime() / 60000;
const comRotas = nomes.filter((nome) => fixtures[nome].rotas.length > 0);

/**
 * Coerência interna das fixtures (D-12, D-16, D-23, US-08 AC3, US-10 AC5).
 * Os números são de exemplo, mas devem fechar entre si: a tela mostra todos eles.
 */
describe("coerência das fixtures", () => {
  it.each(comRotas)("focos batem com os números em %s", (nome) => {
    const rotas = fixtures[nome].rotas;
    const menorDuracao = Math.min(...rotas.map((r) => r.duracaoMin));
    const menorCaminhada = Math.min(...rotas.map((r) => r.caminhadaKm));
    for (const rota of rotas) {
      if (rota.focos.includes("MENOR_TEMPO")) {
        expect(rota.duracaoMin).toBe(menorDuracao);
      }
      if (rota.focos.includes("MENOS_CAMINHADA")) {
        expect(rota.caminhadaKm).toBe(menorCaminhada);
      }
    }
  });

  it.each(comRotas)("só aparecem rotas com foco em %s (D-12)", (nome) => {
    const { rotas, caso } = fixtures[nome];
    if (rotas.length > 1) {
      for (const rota of rotas) expect(rota.focos.length).toBeGreaterThan(0);
    }
    // Sem foco de exposição só existem dois focos, então no máximo duas rotas.
    if (caso !== "CONCLUSIVO") expect(rotas.length).toBeLessThanOrEqual(2);
  });

  it("conclusivo: menor exposição vem primeiro e tem a menor taxa; as demais por tempo (D-23)", () => {
    const { rotas } = fixtures.conclusivo;
    expect(rotas).toHaveLength(3);
    const taxas = rotas.map((r) => r.exposicao.registrosPorKm as number);
    expect(rotas[0]?.exposicao.registrosPorKm).toBe(Math.min(...taxas));
    const demais = rotas.slice(1).map((r) => r.duracaoMin);
    expect(demais).toEqual([...demais].sort((a, b) => a - b));
  });

  it.each(comRotas)("tempos, trechos e horários fecham em %s", (nome) => {
    for (const rota of fixtures[nome].rotas) {
      const trechos = rota.trechos;
      expect(trechos.map((t) => t.ordem)).toEqual(trechos.map((_, i) => i + 1));
      expect(trechos.reduce((s, t) => s + t.duracaoMin, 0)).toBe(rota.duracaoMin);
      expect(minutos(rota.chegadaPrevista) - minutos(rota.saidaPrevista)).toBe(
        rota.duracaoMin,
      );
      const km = trechos
        .filter((t) => t.modo === "A_PE")
        .reduce((s, t) => s + t.distanciaKm, 0);
      expect(km).toBeCloseTo(rota.caminhadaKm, 5);
      expect(rota.exposicao.kmAPe).toBe(rota.caminhadaKm);
      // Cada trecho parte só depois de o anterior terminar (US-08 AC3).
      trechos.forEach((t, i) => {
        if (t.partidaPrevista === null) return;
        if (i === 0) expect(t.partidaPrevista).toBe(rota.saidaPrevista);
        const anterior = trechos[i - 1];
        if (anterior?.partidaPrevista) {
          expect(minutos(t.partidaPrevista)).toBeGreaterThanOrEqual(
            minutos(anterior.partidaPrevista) + anterior.duracaoMin,
          );
        }
      });
      for (const t of trechos) {
        expect(t.faixaDoDia === null).toBe(t.modo !== "A_PE");
      }
    }
  });

  it.each(comRotas)("exposição é coerente em %s (US-10 AC5)", (nome) => {
    for (const rota of fixtures[nome].rotas) {
      const { registros, kmAPe, registrosPorKm } = rota.exposicao;
      if (kmAPe === 0) {
        expect(registrosPorKm).toBeNull();
      } else if (registros !== null && registrosPorKm !== null) {
        expect(Math.abs(registros / kmAPe - registrosPorKm)).toBeLessThanOrEqual(0.06);
      }
    }
  });

  it("nao_aplicavel: nenhuma rota recebe foco de exposição e há uma sem trecho a pé (D-13)", () => {
    const { rotas } = fixtures.nao_aplicavel;
    const semCaminhada = rotas.filter((r) => r.caminhadaKm === 0);
    expect(semCaminhada.length).toBeGreaterThan(0);
    for (const r of semCaminhada) {
      expect(r.trechos.some((t) => t.modo === "A_PE")).toBe(false);
      expect(r.exposicao.registrosPorKm).toBeNull();
    }
  });

  it("outra_opcao: a rápida leva os dois focos e a segunda é mais lenta e com mais caminhada (D-16)", () => {
    const [a, b] = fixtures.outra_opcao.rotas;
    expect(b?.duracaoMin).toBeGreaterThan(a?.duracaoMin ?? Infinity);
    expect(b?.caminhadaKm).toBeGreaterThanOrEqual(a?.caminhadaKm ?? Infinity);
  });
});
