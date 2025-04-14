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

// Función para formatear la fecha
function formatDate(date) {
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return date.toLocaleDateString('es-CL', options);
}

// Función para actualizar la fecha
function updateDate() {
    const currentDate = new Date();
    document.getElementById('currentDate').textContent = formatDate(currentDate);
}

// Actualizar la fecha cada día a medianoche
function scheduleDateUpdate() {
    const now = new Date();
    const midnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        0, 0, 0
    );
    const timeUntilMidnight = midnight - now;
    
    setTimeout(() => {
        updateDate();
        // Programar la próxima actualización
        setInterval(updateDate, 24 * 60 * 60 * 1000);
    }, timeUntilMidnight);
}

// Función para obtener la hora del atardecer
async function getSunsetTime() {
    const lat = -41.4717; // Latitud de Puerto Montt
    const lng = -72.9369; // Longitud de Puerto Montt
    const today = new Date().toISOString().split('T')[0];
    
    try {
        const response = await fetch(`https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&date=${today}&formatted=0`);
        const data = await response.json();
        
        if (data.status === 'OK') {
            const sunsetTime = new Date(data.results.sunset);
            return sunsetTime;
        }
    } catch (error) {
        console.error('Error al obtener la hora del atardecer:', error);
    }
    return null;
}

// Función para mostrar la advertencia
function showSunsetWarning() {
    const warningDiv = document.createElement('div');
    warningDiv.className = 'alert alert-warning alert-dismissible fade show';
    warningDiv.innerHTML = `
        <strong>¡Atención!</strong> Nuestra atención cerrará por Shabat desde el atardecer de hoy (${new Date().toLocaleTimeString('es-CL', {hour: '2-digit', minute:'2-digit'})}) hasta las 9:00 AM del domingo. 
        <br>Recuerda revisar tu saldo antes del cierre. Shabat Shalom! ♥️.
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Insertar la advertencia después de la barra de navegación
    document.querySelector('nav').after(warningDiv);
}

// Función para verificar si es viernes y está cerca del atardecer
async function checkSunsetWarning() {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 es domingo, 5 es viernes
    
    if (dayOfWeek === 5) { // Si es viernes
        const sunsetTime = await getSunsetTime();
        if (sunsetTime) {
            const currentTime = new Date();
            const timeUntilSunset = sunsetTime - currentTime;
            
            // Mostrar advertencia si faltan 2 horas o menos para el atardecer
            if (timeUntilSunset > 0 && timeUntilSunset <= 2 * 60 * 60 * 1000) {
                showSunsetWarning();
            }
        }
    }
}

// Función para simular diferentes momentos
function simulateTime(scenario) {
    const now = new Date();
    
    switch(scenario) {
        case 'friday_before':
            // Simular viernes 2 horas antes del atardecer (16:00)
            now.setHours(16, 0, 0);
            now.setDate(now.getDate() + ((5 + 7 - now.getDay()) % 7)); // Próximo viernes
            break;
        case 'friday_sunset':
            // Simular viernes al atardecer (18:00)
            now.setHours(18, 0, 0);
            now.setDate(now.getDate() + ((5 + 7 - now.getDay()) % 7));
            break;
        case 'saturday':
            // Simular sábado al mediodía
            now.setHours(12, 0, 0);
            now.setDate(now.getDate() + ((6 + 7 - now.getDay()) % 7));
            break;
        case 'sunday_before_9':
            // Simular domingo antes de las 9 AM
            now.setHours(8, 0, 0);
            now.setDate(now.getDate() + ((0 + 7 - now.getDay()) % 7));
            break;
        case 'sunday_after_9':
            // Simular domingo después de las 9 AM
            now.setHours(10, 0, 0);
            now.setDate(now.getDate() + ((0 + 7 - now.getDay()) % 7));
            break;
        default:
            return new Date(); // Hora actual
    }
    return now;
}

// Modificar la función isShabbatTime para usar tiempo simulado
let simulatedScenario = null; // Variable global para el escenario simulado

function isShabbatTime() {
    const now = simulatedScenario ? simulateTime(simulatedScenario) : new Date();
    const day = now.getDay();
    const hour = now.getHours();
    const minutes = now.getMinutes();
    
    const currentTimeInMinutes = hour * 60 + minutes;

    if (day === 5) { // Viernes
        return currentTimeInMinutes >= (18 * 60); // Después de las 18:00
    } else if (day === 6) { // Sábado
        return true;
    } else if (day === 0) { // Domingo
        return currentTimeInMinutes < (9 * 60); // Antes de las 9:00
    }

    return false;
}

// Función para controlar la simulación
function setSimulation(scenario) {
    simulatedScenario = scenario;
    updateShabbatDisplay();
    checkSunsetWarning();
    
    // Actualizar el estado visual del botón de engranaje
    const gear = document.querySelector('.simulation-gear i');
    if (scenario) {
        gear.classList.add('text-warning');
    } else {
        gear.classList.remove('text-warning');
    }
}

// Función para mostrar u ocultar elementos según el horario
function updateShabbatDisplay() {
    const isShabbat = isShabbatTime();
    const mainElements = [
        loginForm,
        registerForm,
        dashboard,
        allUsersDashboard,
        document.querySelector('.navbar-nav')
    ];
    const shabatMessage = document.getElementById('shabatMessage');

    if (isShabbat) {
        // Ocultar elementos principales
        mainElements.forEach(element => {
            if (element) element.style.display = 'none';
        });
        // Mostrar mensaje de Shabat
        shabatMessage.style.display = 'block';
    } else {
        // Mostrar elementos principales (solo si no hay un usuario logueado)
        if (!currentAccount) {
            loginForm.style.display = 'block';
        }
        // Ocultar mensaje de Shabat
        shabatMessage.style.display = 'none';
    }
}

// Función para programar la próxima actualización
function scheduleNextUpdate() {
    const now = new Date();
    let nextUpdate;

    if (isShabbatTime()) {
        // Si estamos en Shabat, la próxima actualización será el domingo a las 9:00 AM
        if (now.getDay() === 0 && now.getHours() < 9) {
            nextUpdate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0, 0);
        } else {
            nextUpdate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 9, 0, 0);
        }
    } else {
        // Si no estamos en Shabat, la próxima actualización será al atardecer del viernes
        const daysUntilFriday = (5 + 7 - now.getDay()) % 7;
        nextUpdate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntilFriday, 18, 0, 0);
    }

    const timeUntilUpdate = nextUpdate - now;
    setTimeout(() => {
        updateShabbatDisplay();
        scheduleNextUpdate();
    }, timeUntilUpdate);
}

// Inicialización
if (localStorage.getItem('bankAccounts') === null) {
    localStorage.setItem('bankAccounts', JSON.stringify({}));
}

// Mostrar la fecha actual
updateDate();
scheduleDateUpdate();

// Verificar la advertencia del atardecer y el estado de Shabat
checkSunsetWarning();
updateShabbatDisplay();
scheduleNextUpdate();

// Verificar cada hora la advertencia del atardecer
setInterval(checkSunsetWarning, 60 * 60 * 1000); 