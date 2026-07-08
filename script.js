'use strict';

// ===== PRELOADER =====
window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('preloader').classList.add('hidden');
    }, 1800);
});

// ===== NAVBAR =====
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
const navLinkItems = navLinks.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 80);
    document.getElementById('backToTop').classList.toggle('visible', window.scrollY > 500);
    updateActiveNav();
});

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
    document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
});

navLinkItems.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        navLinks.classList.remove('open');
        document.body.style.overflow = '';
    });
});

function updateActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPos = window.scrollY + 100;
    sections.forEach(section => {
        const top = section.offsetTop;
        const bottom = top + section.offsetHeight;
        const id = section.getAttribute('id');
        const link = document.querySelector(`.nav-link[href="#${id}"]`);
        if (link) {
            link.classList.toggle('active', scrollPos >= top && scrollPos < bottom);
        }
    });
}

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            const offset = 80;
            window.scrollTo({
                top: target.offsetTop - offset,
                behavior: 'smooth'
            });
        }
    });
});

// ===== HERO SLIDER =====
const heroSlides = document.querySelectorAll('.hero-slide');
const heroDots = document.querySelectorAll('.hero-dot');
let currentHero = 0;
let heroTimer;

function goToHeroSlide(index) {
    heroSlides[currentHero].classList.remove('active');
    heroDots[currentHero].classList.remove('active');
    currentHero = index;
    heroSlides[currentHero].classList.add('active');
    heroDots[currentHero].classList.add('active');
    resetHeroTimer();
}

function nextHeroSlide() {
    goToHeroSlide((currentHero + 1) % heroSlides.length);
}

function resetHeroTimer() {
    clearInterval(heroTimer);
    heroTimer = setInterval(nextHeroSlide, 5500);
}

resetHeroTimer();

// ===== AOS (SCROLL ANIMATIONS) =====
function initAOS() {
    const elements = document.querySelectorAll('[data-aos]');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('aos-visible');
                }, i * 80);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    elements.forEach(el => observer.observe(el));
}
initAOS();

// ===== COUNTER ANIMATION =====
let counted = false;
const statNumbers = document.querySelectorAll('.stat-number');

function animateCounters() {
    if (counted) return;
    counted = true;
    statNumbers.forEach(el => {
        const target = +el.getAttribute('data-target');
        const duration = 2200;
        const steps = 60;
        const increment = target / steps;
        let current = 0;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                el.textContent = target;
                clearInterval(timer);
            } else {
                el.textContent = Math.floor(current);
            }
        }, duration / steps);
    });
}

const statsObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) animateCounters();
}, { threshold: 0.4 });
const statsSection = document.querySelector('.stats-section');
if (statsSection) statsObserver.observe(statsSection);

// ===== PORTFOLIO FILTER =====
const filterBtns = document.querySelectorAll('.filter-btn');
const portfolioItems = document.querySelectorAll('.portfolio-item');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.getAttribute('data-filter');
        portfolioItems.forEach(item => {
            const category = item.getAttribute('data-category');
            if (filter === 'all' || category === filter) {
                item.style.display = 'block';
                item.style.opacity = '0';
                item.style.transform = 'scale(0.95)';
                requestAnimationFrame(() => {
                    item.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                    item.style.opacity = '1';
                    item.style.transform = 'scale(1)';
                });
            } else {
                item.style.transition = 'opacity 0.3s ease';
                item.style.opacity = '0';
                setTimeout(() => { item.style.display = 'none'; }, 300);
            }
        });
    });
});

// ===== TESTIMONIALS =====
let currentTestimonial = 0;
const testimonialsTrack = document.getElementById('testimonialsTrack');
const totalTestimonials = document.querySelectorAll('.testimonial-card').length;
const tDotsContainer = document.getElementById('tDots');
let tTimer;

// Create dots
for (let i = 0; i < totalTestimonials; i++) {
    const dot = document.createElement('div');
    dot.className = 't-dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => setTestimonial(i));
    tDotsContainer.appendChild(dot);
}

function setTestimonial(index) {
    currentTestimonial = (index + totalTestimonials) % totalTestimonials;
    testimonialsTrack.style.transform = `translateX(-${currentTestimonial * 100}%)`;
    document.querySelectorAll('.t-dot').forEach((d, i) => {
        d.classList.toggle('active', i === currentTestimonial);
    });
    resetTTimer();
}

function changeTestimonial(dir) {
    setTestimonial(currentTestimonial + dir);
}

function resetTTimer() {
    clearInterval(tTimer);
    tTimer = setInterval(() => changeTestimonial(1), 6000);
}
resetTTimer();

// Touch support for testimonials
let tStartX = 0;
testimonialsTrack.addEventListener('touchstart', e => { tStartX = e.touches[0].clientX; });
testimonialsTrack.addEventListener('touchend', e => {
    const diff = tStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) changeTestimonial(diff > 0 ? 1 : -1);
});

// ===== BACK TO TOP =====
document.getElementById('backToTop').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ===== FORM VALIDATION & SUBMISSION =====
const form = document.getElementById('consultationForm');
const submitBtn = document.getElementById('submitBtn');
const formSuccess = document.getElementById('formSuccess');
const formErrorMsg = document.getElementById('formErrorMsg');
const formErrorText = document.getElementById('formErrorText');

const validators = {
    fullName: (val) => {
        if (!val.trim()) return 'Full name is required.';
        if (val.trim().length < 2) return 'Name must be at least 2 characters.';
        return '';
    },
    email: (val) => {
        if (!val.trim()) return 'Email address is required.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return 'Please enter a valid email address.';
        return '';
    },
    phone: (val) => {
        if (!val.trim()) return 'Phone number is required.';
        if (!/^[6-9]\d{9}$/.test(val.trim())) return 'Enter a valid 10-digit Indian mobile number.';
        return '';
    },
    requirements: (val) => {
        if (!val.trim()) return 'Please describe your requirements.';
        if (val.trim().length < 20) return 'Please provide at least 20 characters.';
        return '';
    }
};

// Real-time validation
['fullName', 'email', 'phone', 'requirements'].forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (!field) return;
    field.addEventListener('blur', () => validateField(fieldId, field.value));
    field.addEventListener('input', () => {
        if (document.getElementById(`${fieldId}-error`).textContent) {
            validateField(fieldId, field.value);
        }
    });
});

function validateField(fieldId, value) {
    const error = validators[fieldId] ? validators[fieldId](value) : '';
    const errorEl = document.getElementById(`${fieldId}-error`);
    const wrapper = document.getElementById(fieldId).closest('.input-wrapper');
    if (errorEl) errorEl.textContent = error;
    if (wrapper) wrapper.classList.toggle('has-error', !!error);
    return !error;
}

function validateAll() {
    const fields = ['fullName', 'email', 'phone', 'requirements'];
    return fields.map(id => {
        const el = document.getElementById(id);
        return el ? validateField(id, el.value) : true;
    }).every(Boolean);
}

function getFormData() {
    const budget = document.querySelector('input[name="budget"]:checked');
    return {
        fullName: document.getElementById('fullName').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        city: document.getElementById('city').value.trim(),
        propertyType: document.getElementById('propertyType').value,
        propertySize: document.getElementById('propertySize').value.trim(),
        serviceRequired: document.getElementById('serviceRequired').value,
        budget: budget ? budget.value : '',
        designStyle: document.getElementById('designStyle').value,
        timeline: document.getElementById('timeline').value,
        requirements: document.getElementById('requirements').value.trim(),
        hearAboutUs: document.getElementById('hearAboutUs').value
    };
}

function setLoading(loading) {
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    submitBtn.disabled = loading;
    btnText.style.display = loading ? 'none' : 'flex';
    btnLoading.style.display = loading ? 'inline-flex' : 'none';
}

function showError(msg) {
    formErrorText.textContent = msg;
    formErrorMsg.style.display = 'flex';
    formErrorMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    setTimeout(() => { formErrorMsg.style.display = 'none'; }, 6000);
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    formErrorMsg.style.display = 'none';

    if (!validateAll()) {
        showError('Please fix the errors above before submitting.');
        return;
    }

    const data = getFormData();
    setLoading(true);

    try {
        const response = await fetch('/api/consultation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            form.style.display = 'none';
            formSuccess.style.display = 'block';
            formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            showError(result.message || 'Submission failed. Please try again.');
        }
    } catch (error) {
        showError('Network error. Please check your connection and try again.');
    } finally {
        setLoading(false);
    }
});

// Phone number - only digits
document.getElementById('phone').addEventListener('keypress', (e) => {
    if (!/\d/.test(e.key)) e.preventDefault();
});