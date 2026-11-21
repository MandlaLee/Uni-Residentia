/* ============================================
   UNI RESIDENTIA - Main JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {

    // ---------- Navbar Scroll Effect ----------
    const navbar = document.getElementById('navbar');

    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                navbar.classList.add('navbar--scrolled');
            } else {
                navbar.classList.remove('navbar--scrolled');
            }
        });

        // Set initial state
        if (window.scrollY > 50) {
            navbar.classList.add('navbar--scrolled');
        }
    }

    // ---------- Mobile Menu ----------
    const mobileToggle = document.getElementById('mobileToggle');
    const navMenu = document.getElementById('navMenu');

    if (mobileToggle && navMenu) {
        // Create mobile menu element
        const mobileMenu = document.createElement('div');
        mobileMenu.className = 'mobile-menu';
        mobileMenu.id = 'mobileMenu';

        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'mobile-menu__overlay';
        overlay.id = 'mobileOverlay';

        // Clone nav links into mobile menu
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            const mobileLink = document.createElement('a');
            mobileLink.href = link.getAttribute('href');
            mobileLink.className = 'mobile-menu__link';
            mobileLink.textContent = link.textContent;
            mobileMenu.appendChild(mobileLink);
        });

        document.body.appendChild(mobileMenu);
        document.body.appendChild(overlay);

        function openMobileMenu() {
            mobileMenu.classList.add('mobile-menu--open');
            overlay.classList.add('mobile-menu__overlay--active');
            document.body.style.overflow = 'hidden';
        }

        function closeMobileMenu() {
            mobileMenu.classList.remove('mobile-menu--open');
            overlay.classList.remove('mobile-menu__overlay--active');
            document.body.style.overflow = '';
        }

        mobileToggle.addEventListener('click', function() {
            if (mobileMenu.classList.contains('mobile-menu--open')) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });

        overlay.addEventListener('click', closeMobileMenu);

        // Close on mobile link click
        mobileMenu.querySelectorAll('.mobile-menu__link').forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });
    }

    // ---------- FAQ Accordion ----------
    const faqItems = document.querySelectorAll('.faq-item__question');

    faqItems.forEach(button => {
        button.addEventListener('click', function() {
            const answer = this.nextElementSibling;
            const isOpen = this.getAttribute('aria-expanded') === 'true';

            // Close all other answers
            faqItems.forEach(otherButton => {
                if (otherButton !== button) {
                    otherButton.setAttribute('aria-expanded', 'false');
                    otherButton.nextElementSibling.classList.remove('faq-item__answer--open');
                }
            });

            // Toggle current answer
            if (isOpen) {
                this.setAttribute('aria-expanded', 'false');
                answer.classList.remove('faq-item__answer--open');
            } else {
                this.setAttribute('aria-expanded', 'true');
                answer.classList.add('faq-item__answer--open');
            }
        });
    });

    // ---------- Smooth Scroll for Anchor Links ----------
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Secure authentication and forms implemented in js/app.js.
    // ---------- Intersection Observer for Animations ----------
    const animateElements = document.querySelectorAll(
        '.feature-card, .residence-card, .room-card, .testimonial-card, .amenity-card, .value-card, .pricing-card, .blog-card'
    );

    if ('IntersectionObserver' in window) {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        animateElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    } else {
        // Fallback for browsers without IntersectionObserver
        animateElements.forEach(el => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        });
    }

    // ---------- Current Year for Footer ----------
    const yearElements = document.querySelectorAll('.footer__bottom p');
    yearElements.forEach(el => {
        if (el.textContent.includes('2025')) {
            // Keep as 2025 (EST. MMXXV) - brand established date
        }
    });

});
