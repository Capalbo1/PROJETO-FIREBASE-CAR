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

// Verifica o estado da conexão
database.ref('.info/connected').on('value', (snapshot) => {
    if (snapshot.val() === true) {
        console.log("Conectado ao Firebase");
    } else {
        console.error("Conexão com o Firebase perdida.");
        // Tenta reconectar após 5 segundos
        setTimeout(() => {
            console.log("Tentando reconectar ao Firebase...");
            verificarConexao();
        }, 5000);
    }
});

// Função para verificar a conexão
function verificarConexao() {
    database.ref('.info/connected').once('value')
        .then((snapshot) => {
            if (snapshot.val() === true) {
                console.log("Reconectado ao Firebase.");
            } else {
                console.error("Ainda não conectado ao Firebase.");
            }
        })
        .catch((error) => {
            console.error("Erro ao verificar conexão: ", error);
        });
}

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
    const clientesRef = database.ref('clientes');
    const novoIdRef = database.ref('ultimoId'); // Referência para armazenar o último ID usado

    // Usamos uma transação para garantir que o ID seja único e sequencial
    novoIdRef.transaction((ultimoId) => {
        if (ultimoId === null) {
            // Se não houver último ID, começamos com 1
            return 1;
        } else {
            // Incrementa o último ID
            return ultimoId + 1;
        }
    }, (error, committed, snapshot) => {
        if (error) {
            console.error("Erro ao gerar novo ID: ", error);
            alert("Erro ao adicionar cliente. Tente novamente.");
        } else if (committed) {
            const novoId = snapshot.val(); // Novo ID gerado
            cliente.dataCadastro = new Date().toLocaleString('pt-BR'); // Adiciona a data de cadastro

            // Salva o cliente com o novo ID
            clientesRef.child(novoId).set(cliente)
                .then(() => {
                    alert(`Cliente adicionado com sucesso! ID: ${novoId}`);
                    limpaInputs();
                })
                .catch((error) => {
                    console.error("Erro ao salvar cliente: ", error);
                    alert("Erro ao salvar cliente. Tente novamente.");
                });
        }
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
    clienteRef.remove() // Remove do banco de dados
        .then(() => {
            console.log("Cliente removido com sucesso.");
        })
        .catch((error) => {
            console.error("Erro ao remover cliente: ", error);
        });
}

// Carrega clientes ao abrir a página
carregaClientesFirebase();