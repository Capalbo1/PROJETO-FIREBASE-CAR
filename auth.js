// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyC3U_lv4GMuWVff5_R6zzeKUKx865oAgME",
    authDomain: "msoares-abcb9.firebaseapp.com",
    databaseURL: "https://msoares-abcb9-default-rtdb.firebaseio.com",
    projectId: "msoares-abcb9",
    storageBucket: "msoares-abcb9.appspot.com",
    messagingSenderId: "785462040112",
    appId: "1:785462040112:web:54ae728a8c4e4d2ae17ff5"
};

// Inicializa o Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Lógica de Login
document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault(); // Evita o comportamento padrão de envio do formulário
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            console.log('Usuário logado:', userCredential.user);
            window.location.href = 'index.html'; // Redireciona para a página principal
        })
        .catch((error) => {
            alert(error.message); // Exibe o erro em um alerta
        });
});

// Lógica de Registro
document.getElementById('register-btn').addEventListener('click', (e) => {
    e.preventDefault(); // Evita o comportamento de envio do formulário
    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email-register').value;
    const password = document.getElementById('password-register').value;

    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            console.log('Usuário registrado:', userCredential.user);
            alert('Cadastro realizado com sucesso!');
            window.location.href = 'index.html'; // Redireciona para a página principal
        })
        .catch((error) => {
            alert(error.message); // Exibe o erro em um alerta
        });
});

// Verifica se o usuário está logado
auth.onAuthStateChanged((user) => {
    if (user) {
        console.log('Usuário logado:', user);
    } else {
        console.log('Nenhum usuário logado');
        // Redireciona para o login caso não esteja autenticado
        if (window.location.pathname !== '/login.html') {
            window.location.href = 'login.html';
        }
    }
});