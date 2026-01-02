// DOM Elements
const authSection = document.getElementById('auth-section');
const adminPanel = document.getElementById('admin-panel');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const showRegisterLink = document.getElementById('show-register');
const showLoginLink = document.getElementById('show-login');
const logoutBtn = document.getElementById('logout-btn');

// Stats elements
const totalReservationsEl = document.getElementById('total-reservations');
const pendingReservationsEl = document.getElementById('pending-reservations');
const confirmedReservationsEl = document.getElementById('confirmed-reservations');
const cancelledReservationsEl = document.getElementById('cancelled-reservations');
const totalOrdersEl = document.getElementById('total-orders');
const pendingOrdersEl = document.getElementById('pending-orders');

// Table elements
const reservationsBody = document.getElementById('reservations-body');
const ordersBody = document.getElementById('orders-body');

// Check if user is logged in on page load
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        showAdminPanel();
    } else {
        showAuthSection();
    }
});

// Form switching
showRegisterLink.addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('register-form').classList.remove('hidden');
});

showLoginLink.addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('register-form').classList.add('hidden');
    document.getElementById('login-form').classList.remove('hidden');
});

// Login form submission
loginForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('adminUsers') || '[]');

    // Check if user exists and password matches
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        showAdminPanel();
        alert('Connexion réussie!');
    } else {
        alert('Nom d\'utilisateur ou mot de passe incorrect.');
    }

    // Reset form
    this.reset();
});

// Register form submission
registerForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;

    // Validation
    if (password !== confirmPassword) {
        alert('Les mots de passe ne correspondent pas.');
        return;
    }

    if (password.length < 6) {
        alert('Le mot de passe doit contenir au moins 6 caractères.');
        return;
    }

    // Get existing users
    const users = JSON.parse(localStorage.getItem('adminUsers') || '[]');

    // Check if username already exists
    if (users.find(u => u.username === username)) {
        alert('Ce nom d\'utilisateur existe déjà.');
        return;
    }

    // Create new user
    const newUser = {
        id: Date.now(),
        username: username,
        email: email,
        password: password,
        createdAt: new Date().toISOString()
    };

    // Add to users array
    users.push(newUser);
    localStorage.setItem('adminUsers', JSON.stringify(users));

    // Auto login
    localStorage.setItem('currentUser', JSON.stringify(newUser));

    showAdminPanel();
    alert('Inscription réussie! Bienvenue dans le panneau d\'administration.');

    // Reset form
    this.reset();
});

// Logout
logoutBtn.addEventListener('click', function() {
    localStorage.removeItem('currentUser');
    showAuthSection();
    alert('Déconnexion réussie.');
});

// Show auth section
function showAuthSection() {
    authSection.classList.remove('hidden');
    adminPanel.classList.add('hidden');
}

// Show admin panel
function showAdminPanel() {
    authSection.classList.add('hidden');
    adminPanel.classList.remove('hidden');
    loadReservations();
    loadOrders();
    updateStats();
    startAutoRefresh();
}

// Load and display reservations
function loadReservations() {
    const reservations = JSON.parse(localStorage.getItem('reservations') || '[]');

    if (reservations.length === 0) {
        reservationsBody.innerHTML = '<tr><td colspan="9" class="no-data">Aucune réservation trouvée.</td></tr>';
        return;
    }

    reservationsBody.innerHTML = '';

    reservations.forEach(reservation => {
        const row = document.createElement('tr');

        const statusClass = `status-${reservation.status}`;

        row.innerHTML = `
            <td>${reservation.id}</td>
            <td>${reservation.name}</td>
            <td>${reservation.email}</td>
            <td>${reservation.phone}</td>
            <td>${formatDate(reservation.date)}</td>
            <td>${reservation.time}</td>
            <td>${reservation.guests}</td>
            <td><span class="status ${statusClass}">${getStatusText(reservation.status)}</span></td>
            <td>
                <div class="action-buttons">
                    ${reservation.status === 'pending' ? `
                        <button class="btn-action btn-confirm" onclick="updateReservationStatus(${reservation.id}, 'confirmed')" title="Confirmer">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="btn-action btn-cancel" onclick="updateReservationStatus(${reservation.id}, 'cancelled')" title="Annuler">
                            <i class="fas fa-times"></i>
                        </button>
                    ` : ''}
                    <button class="btn-action btn-view" onclick="viewReservationDetails(${reservation.id})" title="Voir détails">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </td>
        `;

        reservationsBody.appendChild(row);
    });
}

// Update reservation status
function updateReservationStatus(id, status) {
    const reservations = JSON.parse(localStorage.getItem('reservations') || '[]');
    const reservation = reservations.find(r => r.id === id);

    if (reservation) {
        reservation.status = status;
        localStorage.setItem('reservations', JSON.stringify(reservations));
        loadReservations();
        updateStats();

        const statusText = status === 'confirmed' ? 'confirmée' : 'annulée';
        alert(`Réservation ${statusText} avec succès.`);
    }
}

// View reservation details
function viewReservationDetails(id) {
    const reservations = JSON.parse(localStorage.getItem('reservations') || '[]');
    const reservation = reservations.find(r => r.id === id);

    if (reservation) {
        const details = `
ID: ${reservation.id}
Nom: ${reservation.name}
Email: ${reservation.email}
Téléphone: ${reservation.phone}
Date: ${formatDate(reservation.date)}
Heure: ${reservation.time}
Nombre de personnes: ${reservation.guests}
Message: ${reservation.message || 'Aucun'}
Statut: ${getStatusText(reservation.status)}
Soumise le: ${new Date(reservation.submittedAt).toLocaleString('fr-FR')}
        `;

        alert(details);
    }
}

// Load and display orders
function loadOrders() {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');

    if (orders.length === 0) {
        ordersBody.innerHTML = '<tr><td colspan="8" class="no-data">Aucune commande trouvée.</td></tr>';
        return;
    }

    ordersBody.innerHTML = '';

    orders.forEach(order => {
        const row = document.createElement('tr');

        const statusClass = `status-${order.status}`;

        row.innerHTML = `
            <td>${order.id}</td>
            <td>${order.name}</td>
            <td>${order.phone}</td>
            <td>${order.orderType === 'pickup' ? 'À Emporter' : 'Livraison'}</td>
            <td>${order.time}</td>
            <td>${order.items.length} article${order.items.length > 1 ? 's' : ''}</td>
            <td><span class="status ${statusClass}">${getStatusText(order.status)}</span></td>
            <td>
                <div class="action-buttons">
                    ${order.status === 'pending' ? `
                        <button class="btn-action btn-confirm" onclick="updateOrderStatus(${order.id}, 'confirmed')" title="Confirmer">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="btn-action btn-cancel" onclick="updateOrderStatus(${order.id}, 'cancelled')" title="Annuler">
                            <i class="fas fa-times"></i>
                        </button>
                    ` : ''}
                    <button class="btn-action btn-view" onclick="viewOrderDetails(${order.id})" title="Voir détails">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </td>
        `;

        ordersBody.appendChild(row);
    });
}

// Update order status
function updateOrderStatus(id, status) {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const order = orders.find(o => o.id === id);

    if (order) {
        order.status = status;
        localStorage.setItem('orders', JSON.stringify(orders));
        loadOrders();
        updateStats();

        const statusText = status === 'confirmed' ? 'confirmée' : 'annulée';
        alert(`Commande ${statusText} avec succès.`);
    }
}

// View order details
function viewOrderDetails(id) {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const order = orders.find(o => o.id === id);

    if (order) {
        const itemsList = order.items.join(', ');
        const details = `
ID: ${order.id}
Nom: ${order.name}
Téléphone: ${order.phone}
Type: ${order.orderType === 'pickup' ? 'À Emporter' : 'Livraison'}
Heure: ${order.time}
Articles: ${itemsList}
Adresse: ${order.address || 'Non spécifiée'}
Statut: ${getStatusText(order.status)}
Soumise le: ${new Date(order.submittedAt).toLocaleString('fr-FR')}
        `;

        alert(details);
    }
}

// Update statistics
function updateStats() {
    const reservations = JSON.parse(localStorage.getItem('reservations') || '[]');
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');

    const totalReservations = reservations.length;
    const pendingReservations = reservations.filter(r => r.status === 'pending').length;
    const confirmedReservations = reservations.filter(r => r.status === 'confirmed').length;
    const cancelledReservations = reservations.filter(r => r.status === 'cancelled').length;

    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;

    totalReservationsEl.textContent = totalReservations;
    pendingReservationsEl.textContent = pendingReservations;
    confirmedReservationsEl.textContent = confirmedReservations;
    cancelledReservationsEl.textContent = cancelledReservations;
    totalOrdersEl.textContent = totalOrders;
    pendingOrdersEl.textContent = pendingOrders;
}

// Auto refresh functionality
let autoRefreshInterval;

function startAutoRefresh() {
    // Clear any existing interval
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
    }

    // Check for updates every 5 seconds
    autoRefreshInterval = setInterval(() => {
        const currentReservations = JSON.parse(localStorage.getItem('reservations') || '[]');
        const currentOrders = JSON.parse(localStorage.getItem('orders') || '[]');
        const currentReservationCount = currentReservations.length;
        const currentOrderCount = currentOrders.length;

        // Store the last known counts
        if (typeof window.lastReservationCount === 'undefined') {
            window.lastReservationCount = currentReservationCount;
        }
        if (typeof window.lastOrderCount === 'undefined') {
            window.lastOrderCount = currentOrderCount;
        }

        let hasChanges = false;

        // Check reservations
        if (currentReservationCount > window.lastReservationCount) {
            const newReservations = currentReservationCount - window.lastReservationCount;
            showNotification(`Nouvelle réservation reçue! (${newReservations} nouvelle${newReservations > 1 ? 's' : ''})`, 'success');
            hasChanges = true;
            window.lastReservationCount = currentReservationCount;
        } else if (currentReservationCount !== window.lastReservationCount) {
            hasChanges = true;
            window.lastReservationCount = currentReservationCount;
        }

        // Check orders
        if (currentOrderCount > window.lastOrderCount) {
            const newOrders = currentOrderCount - window.lastOrderCount;
            showNotification(`Nouvelle commande reçue! (${newOrders} nouvelle${newOrders > 1 ? 's' : ''})`, 'success');
            hasChanges = true;
            window.lastOrderCount = currentOrderCount;
        } else if (currentOrderCount !== window.lastOrderCount) {
            hasChanges = true;
            window.lastOrderCount = currentOrderCount;
        }

        // Refresh display if there are changes
        if (hasChanges) {
            loadReservations();
            loadOrders();
            updateStats();
        }
    }, 5000); // 5 seconds
}

function stopAutoRefresh() {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
        autoRefreshInterval = null;
    }
}

// Notification system
function showNotification(message, type = 'info', duration = 5000) {
    const container = document.getElementById('notification-container');

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;

    // Icon based on type
    const iconMap = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };

    notification.innerHTML = `
        <i class="fas ${iconMap[type] || iconMap.info}"></i>
        <span>${message}</span>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;

    // Add to container
    container.appendChild(notification);

    // Auto remove after duration
    if (duration > 0) {
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOut 0.3s ease-in forwards';
                setTimeout(() => notification.remove(), 300);
            }
        }, duration);
    }

    // Click to dismiss
    notification.addEventListener('click', () => {
        notification.style.animation = 'slideOut 0.3s ease-in forwards';
        setTimeout(() => notification.remove(), 300);
    });
}

// Helper functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
}

function getStatusText(status) {
    switch (status) {
        case 'pending': return 'En attente';
        case 'confirmed': return 'Confirmée';
        case 'cancelled': return 'Annulée';
        default: return status;
    }
}
