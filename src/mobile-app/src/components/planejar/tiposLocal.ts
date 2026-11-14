import type { NomeIcone } from '@/components/Icone';
import type { TipoLocal } from '@/locais';
import type { ChaveImagem } from '@/theme/imagens';
import { hipotesesMapa as h } from '@/textos/hipotesesMapa';

export const infoTipo: Record<TipoLocal, { rotulo: string; icone: NomeIcone; imagem: ChaveImagem }> = {
  casa: { rotulo: h.tipoCasa, icone: 'home-outline', imagem: 'localCasa' },
  trabalho: { rotulo: h.tipoTrabalho, icone: 'briefcase-outline', imagem: 'localTrabalho' },
  estudo: { rotulo: h.tipoEstudo, icone: 'school-outline', imagem: 'localEstudo' },
  outro: { rotulo: h.tipoOutro, icone: 'map-marker-outline', imagem: 'localOutro' },
};

export const tiposLocal: readonly TipoLocal[] = ['casa', 'trabalho', 'estudo', 'outro'];
