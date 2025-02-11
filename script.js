// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyC3U_lv4GMuWVff5_R6zzeKUKx865oAgME",
    authDomain: "msoares-abcb9.firebaseapp.com",
    databaseURL: "https://msoares-abcb9-default-rtdb.firebaseio.com/",
    projectId: "msoares-abcb9",
    storageBucket: "msoares-abcb9.appspot.com",
    messagingSenderId: "785462040112",
    appId: "1:785462040112:web:54ae728a8c4e4d2ae17ff5"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Teste de conexão ao Firebase
database.ref('.info/connected').on('value', (snapshot) => {
    if (snapshot.val() === true) {
        console.log("Conectado ao Firebase");
    } else {
        console.error("Não foi possível conectar ao Firebase");
    }
});

// Seleciona elementos do DOM
const inputNome = document.querySelector('#nome');
const inputCarro = document.querySelector('#carro');
const inputPlaca = document.querySelector('#placa');
const inputQuilometragem = document.querySelector('#quilometragem');
const inputValor = document.querySelector('#valor');
const inputServico = document.querySelector('#servico');
const inputObservacao = document.querySelector('#observacao');
const btnTarefa = document.querySelector('.btn-submit');
const tarefas = document.querySelector('.clients-table tbody');

// Função para formatar o valor em Reais (R$)
function formatarValor(valor) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor);
}

// Limpa os inputs após adicionar
function limpaInputs() {
    inputNome.value = '';
    inputCarro.value = '';
    inputPlaca.value = '';
    inputQuilometragem.value = '';
    inputValor.value = '';
    inputServico.value = '';
    inputObservacao.value = '';
    inputNome.focus();
}

// Adiciona cliente com ID sequencial
function criaClienteFirebase(cliente) {
    const clientesRef = database.ref('clientes'); // Referência ao nó "clientes"

    // Busca o maior ID existente
    clientesRef.orderByKey().limitToLast(1).once('value', (snapshot) => {
        let novoId = 1; // Valor inicial caso o banco esteja vazio

        snapshot.forEach((childSnapshot) => {
            const maiorIdAtual = parseInt(childSnapshot.key, 10); // Converte para número
            if (!isNaN(maiorIdAtual)) {
                novoId = maiorIdAtual + 1; // Incrementa o ID
            }
        });

        // Adiciona a data e hora do cadastro como log
        cliente.dataCadastro = new Date().toLocaleString('pt-BR');

        // Salva o cliente com o novo ID
        clientesRef.child(novoId).set(cliente);
        alert(`Cliente adicionado com sucesso! ID: ${novoId}`);
        limpaInputs();
    });
}

// Renderiza cliente na tabela
function criaTarefa(nome, carro, placa, quilometragem, valor, servico, observacao, dataCadastro, id) {
    const tr = document.createElement('tr');
    tr.dataset.id = id; // Define o ID no dataset da linha
    tr.innerHTML = `
        <td>${id}</td>
        <td>${nome}</td>
        <td>${carro}</td>
        <td>${placa}</td>
        <td>${quilometragem}</td>
        <td>${formatarValor(valor)}</td>
        <td>${servico}</td>
        <td>${observacao}</td>
        <td>${dataCadastro}</td>
        <td>
            <button class="editar">Editar</button>
            <button class="apagar">Apagar</button>
        </td>
    `;
    tarefas.appendChild(tr);
}

// Carrega clientes do Firebase
function carregaClientesFirebase() {
    const clientesRef = database.ref('clientes');
    clientesRef.orderByKey().on('value', (snapshot) => {
        tarefas.innerHTML = ''; // Limpa a tabela
        snapshot.forEach((childSnapshot) => {
            const cliente = childSnapshot.val();
            const id = childSnapshot.key; // O ID agora será sequencial
            criaTarefa(
                cliente.nome,
                cliente.carro,
                cliente.placa,
                cliente.quilometragem,
                cliente.valor,
                cliente.servico,
                cliente.observacao,
                cliente.dataCadastro,
                id
            );
        });
    });
}

// Adiciona cliente ao clicar no botão
btnTarefa.addEventListener('click', function () {
    if (!inputNome.value || !inputCarro.value || !inputPlaca.value || !inputQuilometragem.value || !inputValor.value || !inputServico.value || !inputObservacao.value) {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    const cliente = {
        nome: inputNome.value,
        carro: inputCarro.value,
        placa: inputPlaca.value,
        quilometragem: inputQuilometragem.value,
        valor: parseFloat(inputValor.value.replace(/\D/g, '')) / 100, // Converte para número
        servico: inputServico.value,
        observacao: inputObservacao.value
    };

    criaClienteFirebase(cliente); // Salva no Firebase
});

// Eventos de edição e remoção
document.addEventListener('click', function (e) {
    const tr = e.target.closest('tr');
    const id = tr ? tr.dataset.id : null;

    if (e.target.classList.contains('editar')) {
        const tdValores = tr.querySelectorAll('td');
        inputNome.value = tdValores[1].innerText;
        inputCarro.value = tdValores[2].innerText;
        inputPlaca.value = tdValores[3].innerText;
        inputQuilometragem.value = tdValores[4].innerText;
        inputValor.value = tdValores[5].innerText.replace(/[^\d,]/g, '').replace(',', '.'); // Formata para edição
        inputServico.value = tdValores[6].innerText;
        inputObservacao.value = tdValores[7].innerText;

        apagaClienteFirebase(id); // Remove enquanto edita
    } else if (e.target.classList.contains('apagar')) {
        if (confirm("Deseja realmente apagar este cliente?")) {
            apagaClienteFirebase(id);
            alert("Cliente apagado com sucesso!");
        }
    }
});

// Remove cliente do Firebase
function apagaClienteFirebase(id) {
    const clienteRef = database.ref(`clientes/${id}`);
    clienteRef.remove(); // Remove do banco de dados
}

// Carrega clientes ao abrir a página
carregaClientesFirebase();