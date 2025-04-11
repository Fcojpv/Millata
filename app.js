// Clase para manejar las cuentas bancarias
class BankAccount {
    constructor(username, password) {
        this.username = username;
        this.password = password;
        this.balance = 0;
        this.transactions = [];
    }

    deposit(amount) {
        this.balance += amount;
        this.transactions.push({
            type: 'deposit',
            amount: amount,
            date: new Date().toLocaleString()
        });
        this.saveToLocalStorage();
    }

    withdraw(amount) {
        if (amount > this.balance) {
            return false;
        }
        this.balance -= amount;
        this.transactions.push({
            type: 'withdraw',
            amount: amount,
            date: new Date().toLocaleString()
        });
        this.saveToLocalStorage();
        return true;
    }

    saveToLocalStorage() {
        const accounts = JSON.parse(localStorage.getItem('bankAccounts') || '{}');
        accounts[this.username] = {
            password: this.password,
            balance: this.balance,
            transactions: this.transactions
        };
        localStorage.setItem('bankAccounts', JSON.stringify(accounts));
    }

    static loadFromLocalStorage(username) {
        const accounts = JSON.parse(localStorage.getItem('bankAccounts') || '{}');
        if (accounts[username]) {
            const account = new BankAccount(username, accounts[username].password);
            account.balance = accounts[username].balance;
            account.transactions = accounts[username].transactions;
            return account;
        }
        return null;
    }
}

// Variables globales
let currentAccount = null;
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const dashboard = document.getElementById('dashboard');
const loginFormElement = document.getElementById('loginFormElement');
const registerFormElement = document.getElementById('registerFormElement');
const operationModal = new bootstrap.Modal(document.getElementById('operationModal'));
const operationForm = document.getElementById('operationForm');
const operationTitle = document.getElementById('operationTitle');
const operationBtn = document.getElementById('operationBtn');
const depositBtn = document.getElementById('depositBtn');
const withdrawBtn = document.getElementById('withdrawBtn');

// Event Listeners
document.getElementById('loginBtn').addEventListener('click', () => {
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
    dashboard.style.display = 'none';
});

document.getElementById('registerBtn').addEventListener('click', () => {
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
    dashboard.style.display = 'none';
});

loginFormElement.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    currentAccount = BankAccount.loadFromLocalStorage(username);
    
    if (currentAccount && currentAccount.password === password) {
        showDashboard();
    } else {
        alert('Usuario o contraseña incorrectos');
    }
});

registerFormElement.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('newUsername').value;
    const password = document.getElementById('newPassword').value;
    
    if (BankAccount.loadFromLocalStorage(username)) {
        alert('El usuario ya existe');
        return;
    }
    
    currentAccount = new BankAccount(username, password);
    currentAccount.saveToLocalStorage();
    showDashboard();
});

depositBtn.addEventListener('click', () => {
    operationTitle.textContent = 'Ingresar Dinero';
    operationBtn.textContent = 'Ingresar';
    operationForm.onsubmit = (e) => {
        e.preventDefault();
        const amount = parseFloat(document.getElementById('amount').value);
        currentAccount.deposit(amount);
        updateDashboard();
        operationModal.hide();
    };
    operationModal.show();
});

withdrawBtn.addEventListener('click', () => {
    operationTitle.textContent = 'Retirar Dinero';
    operationBtn.textContent = 'Retirar';
    operationForm.onsubmit = (e) => {
        e.preventDefault();
        const amount = parseFloat(document.getElementById('amount').value);
        if (currentAccount.withdraw(amount)) {
            updateDashboard();
            operationModal.hide();
        } else {
            alert('No tienes suficiente saldo');
        }
    };
    operationModal.show();
});

// Funciones auxiliares
function showDashboard() {
    loginForm.style.display = 'none';
    registerForm.style.display = 'none';
    dashboard.style.display = 'block';
    updateDashboard();
}

function updateDashboard() {
    document.getElementById('userName').textContent = currentAccount.username;
    document.getElementById('balance').textContent = `$${currentAccount.balance.toFixed(2)}`;
    
    const transactionHistory = document.getElementById('transactionHistory');
    transactionHistory.innerHTML = '';
    
    currentAccount.transactions.reverse().forEach(transaction => {
        const item = document.createElement('div');
        item.className = 'transaction-item';
        
        const details = document.createElement('div');
        details.textContent = `${transaction.type === 'deposit' ? 'Ingreso' : 'Retiro'} - ${transaction.date}`;
        
        const amount = document.createElement('div');
        amount.className = `transaction-amount ${transaction.type === 'deposit' ? 'positive' : 'negative'}`;
        amount.textContent = `${transaction.type === 'deposit' ? '+' : '-'}$${transaction.amount.toFixed(2)}`;
        
        item.appendChild(details);
        item.appendChild(amount);
        transactionHistory.appendChild(item);
    });
}

// Inicialización
if (localStorage.getItem('bankAccounts') === null) {
    localStorage.setItem('bankAccounts', JSON.stringify({}));
} 