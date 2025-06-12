async function carregarVoos() {
    try {
        const response = await fetch('../database.json');
        const data = await response.json();

        const select = document.querySelector('.voos-selecionados');
        select.innerHTML = '';

        console.log(data);
        data.forEach(voo => {
            const option = document.createElement('option');
            option.value = voo.id_voo;
            option.textContent = voo.data_lancamento + ' - ' + voo.id_voo;
            select.appendChild(option);
        });
    } catch (error) {
        console.error("Erro ao carregar voos:", error);
    }
}

function selecionar_voos() {
    document.getElementById('popup-voos').classList.remove('oculto');
}

function confirmarVoos() {
    const select = document.querySelector('.voos-selecionados');
    const label = document.querySelector('.numero-voos');
    const selecionados = Array.from(select.selectedOptions);

    label.textContent = `${selecionados.length} voos selecionados`;

    document.getElementById('popup-voos').classList.add('oculto');
}

function iniciar() {
    console.log("Iniciar voos");
}

function excluir() {
    console.log("Excluir voos");
}

function exportar() {
    console.log("Exportar dados");
}

window.onload = carregarVoos;
