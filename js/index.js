// Tooltip para as lixeiras da página inicial
document.addEventListener('DOMContentLoaded', function() {
    const descricoes = {
        // Lixeiras recicláveis
        papel: 'Papel: jornais, revistas, caixas, envelopes, folhas de caderno, embalagens longa vida (limpas).',
        plastico: 'Plástico: garrafas PET, potes, sacolas, embalagens de alimentos, canos, brinquedos (limpos).',
        vidro: 'Vidro: garrafas, potes, copos, frascos de medicamentos, vidros de conserva (limpos).',
        metal: 'Metal: latas de alumínio, latas de aço, tampas, clipes, pregos, panelas sem cabo de madeira.',
        organico: 'Orgânico: restos de alimentos, cascas de frutas e legumes, borra de café, saquinhos de chá, podas de jardim.',
        'nao-reciclavel': 'Não reciclável: papel carbono, papel higiênico, guardanapos sujos, fotografias, etiquetas adesivas, esponjas.',
        perigoso: 'Perigoso: pilhas, baterias, lâmpadas fluorescentes, óleo de cozinha, tintas, solventes, agrotóxicos.',
        saude: 'Saúde (resíduos hospitalares): seringas, agulhas, curativos, luvas, materiais contaminados (exigem descarte especial).',
        radioativo: 'Radioativo: materiais provenientes de atividades nucleares, exames médicos (radioterapia), indústria nuclear.',
        madeira: 'Madeira: móveis quebrados, caixotes, pallets, restos de construção (podem ser reaproveitados ou encaminhados para reciclagem específica).'
    };

    const lixeirasImgs = document.querySelectorAll('.lixeiras img');
    const tooltip = document.getElementById('tooltipLixeira');

    if (!tooltip) return;

    lixeirasImgs.forEach(img => {
        img.addEventListener('mouseenter', (e) => {
            const tipo = img.getAttribute('data-tipo');
            const desc = descricoes[tipo];
            if (desc) {
                tooltip.textContent = desc;
                tooltip.style.opacity = '1';

                const rect = img.getBoundingClientRect();
                let top = rect.bottom + 8;
                let left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2);

                // Evita que o tooltip saia da tela
                if (left < 10) left = 10;
                if (left + tooltip.offsetWidth > window.innerWidth - 10) {
                    left = window.innerWidth - tooltip.offsetWidth - 10;
                }

                tooltip.style.top = `${top}px`;
                tooltip.style.left = `${left}px`;
            }
        });

        img.addEventListener('mouseleave', () => {
            tooltip.style.opacity = '0';
        });
    });
});