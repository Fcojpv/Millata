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
const allUsersDashboard = document.getElementById('allUsersDashboard');
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
    allUsersDashboard.style.display = 'none';
});

document.getElementById('registerBtn').addEventListener('click', () => {
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
    dashboard.style.display = 'none';
    allUsersDashboard.style.display = 'none';
});

document.getElementById('allUsersBtn').addEventListener('click', () => {
    loginForm.style.display = 'none';
    registerForm.style.display = 'none';
    dashboard.style.display = 'none';
    allUsersDashboard.style.display = 'block';
    updateAllUsersDashboard();
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
    allUsersDashboard.style.display = 'none';
    updateDashboard();
}

function updateDashboard() {
    document.getElementById('userName').textContent = currentAccount.username;
    document.getElementById('balance').textContent = `$${Math.round(currentAccount.balance).toLocaleString('es-CL')} CLP`;
    
    const transactionHistory = document.getElementById('transactionHistory');
    transactionHistory.innerHTML = '';
    
    currentAccount.transactions.reverse().forEach(transaction => {
        const item = document.createElement('div');
        item.className = 'transaction-item';
        
        const details = document.createElement('div');
        details.textContent = `${transaction.type === 'deposit' ? 'Ingreso' : 'Retiro'} - ${transaction.date}`;
        
        const amount = document.createElement('div');
        amount.className = `transaction-amount ${transaction.type === 'deposit' ? 'positive' : 'negative'}`;
        amount.textContent = `${transaction.type === 'deposit' ? '+' : '-'}$${Math.round(transaction.amount).toLocaleString('es-CL')} CLP`;
        
        item.appendChild(details);
        item.appendChild(amount);
        transactionHistory.appendChild(item);
    });
}

function updateAllUsersDashboard() {
    const accounts = JSON.parse(localStorage.getItem('bankAccounts') || '{}');
    const allUsersTable = document.getElementById('allUsersTable');
    allUsersTable.innerHTML = '';
    
    let totalBalance = 0;
    let userCount = 0;
    
    Object.entries(accounts).forEach(([username, data]) => {
        const row = document.createElement('tr');
        
        const usernameCell = document.createElement('td');
        usernameCell.textContent = username;
        
        const balanceCell = document.createElement('td');
        balanceCell.textContent = `$${Math.round(data.balance).toLocaleString('es-CL')} CLP`;
        
        const lastTransactionCell = document.createElement('td');
        if (data.transactions && data.transactions.length > 0) {
            const lastTransaction = data.transactions[data.transactions.length - 1];
            lastTransactionCell.textContent = `${lastTransaction.type === 'deposit' ? 'Ingreso' : 'Retiro'} - ${lastTransaction.date}`;
        } else {
            lastTransactionCell.textContent = 'Sin transacciones';
        }
        
        row.appendChild(usernameCell);
        row.appendChild(balanceCell);
        row.appendChild(lastTransactionCell);
        allUsersTable.appendChild(row);
        
        totalBalance += data.balance;
        userCount++;
    });
    
    // Actualizar estadísticas
    document.getElementById('totalUsers').textContent = userCount;
    document.getElementById('totalBalance').textContent = `$${Math.round(totalBalance).toLocaleString('es-CL')} CLP`;
    document.getElementById('averageBalance').textContent = userCount > 0 ? `$${Math.round(totalBalance / userCount).toLocaleString('es-CL')} CLP` : '$0 CLP';
}

// Inicialización
if (localStorage.getItem('bankAccounts') === null) {
    localStorage.setItem('bankAccounts', JSON.stringify({}));
} 