// Navbar Scroll Effect
const nav = document.getElementById('main-nav');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
});

// Mobile Menu Toggle (Basic implementation)
const mobileToggle = document.getElementById('mobileToggle');
const navLinks = document.getElementById('navLinks');

mobileToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    // Add mobile menu styles dynamically if needed or handle via CSS
});

// Scroll Reveal Observer
const revealCallback = (entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
        }
    });
};

const revealOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver(revealCallback, revealOptions);

document.querySelectorAll('.scroll-reveal').forEach(el => {
    observer.observe(el);
});

// Reservation Form Handler
const reservationForm = document.getElementById('reservationForm');
if (reservationForm) {
    reservationForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const formData = new FormData(this);
        const reservation = {
            id: Date.now(),
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            date: formData.get('date'),
            time: formData.get('time'),
            guests: formData.get('guests'),
            message: formData.get('message'),
            status: 'pending',
            submittedAt: new Date().toISOString()
        };

        // Store reservation in localStorage
        const reservations = JSON.parse(localStorage.getItem('reservations') || '[]');
        reservations.push(reservation);
        localStorage.setItem('reservations', JSON.stringify(reservations));

        // Show success message
        alert('Votre réservation a été soumise avec succès! Nous vous contacterons bientôt pour confirmation.');

        // Reset form
        this.reset();
    });
}

// Order Form Handler
const orderForm = document.getElementById('orderForm');
if (orderForm) {
    orderForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const formData = new FormData(this);

        // Get selected items from checkboxes
        const selectedItems = [];
        const checkboxes = this.querySelectorAll('input[name="items"]:checked');
        checkboxes.forEach(checkbox => {
            selectedItems.push(checkbox.value);
        });

        // Validate that at least one item is selected
        if (selectedItems.length === 0) {
            alert('Veuillez sélectionner au moins un article à commander.');
            return;
        }

        const order = {
            id: Date.now(),
            name: formData.get('name'),
            phone: formData.get('phone'),
            orderType: formData.get('orderType'),
            time: formData.get('time'),
            items: selectedItems,
            address: formData.get('address') || null,
            status: 'pending',
            submittedAt: new Date().toISOString()
        };

        // Store order in localStorage
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        orders.push(order);
        localStorage.setItem('orders', JSON.stringify(orders));

        // Show success message
        alert('Votre commande a été soumise avec succès! Nous vous contacterons bientôt pour confirmation.');

        // Reset form
        this.reset();
    });
}

// Background Music Control
const backgroundMusic = document.getElementById('backgroundMusic');
const musicToggle = document.getElementById('musicToggle');
const musicControl = document.getElementById('musicControl');

let isMusicPlaying = false;

// Function to start music (requires user interaction)
function startMusic() {
    if (backgroundMusic && !isMusicPlaying) {
        backgroundMusic.volume = 0.3; // Set volume to 30%
        backgroundMusic.play().then(() => {
            isMusicPlaying = true;
            musicToggle.innerHTML = '<i class="fas fa-volume-up"></i>';
            musicControl.classList.add('playing');
        }).catch(error => {
            console.log('Audio playback failed:', error);
        });
    }
}

// Function to pause music
function pauseMusic() {
    if (backgroundMusic && isMusicPlaying) {
        backgroundMusic.pause();
        isMusicPlaying = false;
        musicToggle.innerHTML = '<i class="fas fa-music"></i>';
        musicControl.classList.remove('playing');
    }
}

// Toggle music on button click
if (musicToggle) {
    musicToggle.addEventListener('click', function() {
        if (isMusicPlaying) {
            pauseMusic();
        } else {
            startMusic();
        }
    });
}

// Auto-start music on first user interaction (due to browser autoplay policies)
document.addEventListener('click', function startOnFirstClick() {
    startMusic();
    document.removeEventListener('click', startOnFirstClick);
}, { once: true });

// Add some basic CSS for scroll reveal
const style = document.createElement('style');
style.textContent = `
    .scroll-reveal {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .scroll-reveal.revealed {
        opacity: 1;
        transform: translateY(0);
    }

    /* Music Control Styles */
    .music-control {
        position: fixed;
        bottom: 30px;
        right: 30px;
        z-index: 1000;
        transition: all 0.3s ease;
    }

    .music-btn {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: var(--primary);
        color: white;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
        box-shadow: 0 4px 15px rgba(195, 161, 109, 0.3);
        transition: all 0.3s ease;
    }

    .music-btn:hover {
        background: var(--primary-dark);
        transform: scale(1.1);
        box-shadow: 0 6px 20px rgba(195, 161, 109, 0.4);
    }

    .music-control.playing .music-btn {
        background: var(--success);
        animation: pulse 2s infinite;
    }

    @keyframes pulse {
        0% { box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3); }
        50% { box-shadow: 0 4px 15px rgba(40, 167, 69, 0.6); }
        100% { box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3); }
    }

    @media (max-width: 768px) {
        .nav-links.active {
            display: flex;
            flex-direction: column;
            position: absolute;
            top: 100%;
            left: 0;
            width: 100%;
            background: white;
            padding: 2rem;
            box-shadow: 0 10px 20px rgba(0,0,0,0.1);
            gap: 1.5rem;
        }
        .nav-links.active a {
            color: var(--secondary) !important;
        }

        .music-control {
            bottom: 20px;
            right: 20px;
        }

        .music-btn {
            width: 50px;
            height: 50px;
            font-size: 1rem;
        }
    }
`;
document.head.appendChild(style);
