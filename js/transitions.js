// Page Transition System
class PageTransition {
    constructor() {
        this.init();
    }

    init() {
        // Check if we're coming from a page transition using sessionStorage
        const isFromTransition = sessionStorage.getItem('pageTransition') === 'true';
        
        // Set transition style
        document.body.style.transition = 'opacity 0.2s ease-in-out';
        
        // Fade in function
        const fadeIn = () => {
            // Use double requestAnimationFrame for smooth transition
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    document.body.style.opacity = '1';
                });
            });
        };
        
        // If coming from transition, ensure body stays at opacity 0 until ready
        if (isFromTransition) {
            // Clear the flag immediately
            sessionStorage.removeItem('pageTransition');
            // Body should already be at opacity 0 from inline style in head
            // Just ensure it stays that way
            document.body.setAttribute('data-transitioning', 'true');
            if (window.getComputedStyle(document.body).opacity !== '0') {
                document.body.style.opacity = '0';
            }
            
            // Wait for DOM to be ready, then fade in smoothly
            const doFadeIn = () => {
                // Remove the transition-prevent-flash style tag
                const preventFlashStyle = document.getElementById('transition-prevent-flash');
                if (preventFlashStyle) {
                    preventFlashStyle.remove();
                }
                // Remove data attribute
                document.body.removeAttribute('data-transitioning');
                // Ensure body is at opacity 0
                document.body.style.opacity = '0';
                // Small delay to ensure page is rendered, then fade in (longer for live server compatibility)
                setTimeout(() => {
                    fadeIn();
                }, 150);
            };
            
            if (document.readyState === 'complete' || document.readyState === 'interactive') {
                doFadeIn();
            } else {
                window.addEventListener('DOMContentLoaded', doFadeIn);
            }
        } else {
            // Fresh page load (refresh) - start visible immediately
            document.body.style.opacity = '1';
            document.body.removeAttribute('data-transitioning');
        }
        
        // Handle pageshow event for back/forward navigation
        window.addEventListener('pageshow', (e) => {
            if (e.persisted) {
                // Page loaded from cache - keep visible
                document.body.style.opacity = '1';
                document.body.removeAttribute('data-transitioning');
                sessionStorage.removeItem('pageTransition');
            }
        });

        // Handle all internal link clicks
        this.handleLinkClicks();
        
        // Handle button clicks with animations
        this.handleButtonClicks();
        
        // Handle modal animations
        this.handleModalAnimations();
        
        // Handle dynamic content animations
        this.handleDynamicContent();
    }

    // Handle page navigation with fade transition
    handleLinkClicks() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (!link) return;
            
            const href = link.getAttribute('href');
            
            // Only handle internal links
            if (href && !href.startsWith('#') && !href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
                // Check if it's a same-origin link
                try {
                    const url = new URL(href%2c%20window.location.html);
                    if (url.origin === window.location.origin) {
                        e.preventDefault();
                        this.fadeOut(() => {
                            window.location.href = href;
                        });
                    }
                } catch (e) {
                    // Invalid URL, let browser handle it
                }
            }
        });
    }

    // Fade out animation
    fadeOut(callback) {
        // Set flag for next page
        sessionStorage.setItem('pageTransition', 'true');
        
        // Only fade out if body is visible
        if (window.getComputedStyle(document.body).opacity !== '0') {
            document.body.style.transition = 'opacity 0.2s ease-in-out';
            document.body.style.opacity = '0';
            setTimeout(() => {
                if (callback) callback();
            }, 200);
        } else {
            // Already faded out, just navigate
            if (callback) callback();
        }
    }

    // Handle button click animations
    handleButtonClicks() {
        document.addEventListener('click', (e) => {
            const button = e.target.closest('button, a[class*="button"], .news-card, [role="button"]');
            if (!button) return;

            // Skip close buttons and modal close buttons
            if (button.id === 'closeModal' || button.id === 'closeNewsModal' || button.classList.contains('close') || button.getAttribute('aria-label') === 'Close') {
                return;
            }

            // Add ripple effect
            this.createRipple(e, button);
            
            // Add scale animation
            button.style.transition = 'transform 0.15s ease-out';
            button.style.transform = 'scale(0.95)';
            
            setTimeout(() => {
                button.style.transform = 'scale(1)';
            }, 150);
        });
    }

    // Create ripple effect on button click
    createRipple(event, element) {
        const ripple = document.createElement('span');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(255, 255, 255, 0.5)';
        ripple.style.transform = 'scale(0)';
        ripple.style.animation = 'ripple 0.4s ease-out';
        ripple.style.pointerEvents = 'none';
        ripple.style.zIndex = '9999';
        
        // Make sure parent has relative positioning
        const originalPosition = window.getComputedStyle(element).position;
        if (originalPosition === 'static') {
            element.style.position = 'relative';
        }
        
        element.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
            if (originalPosition === 'static') {
                element.style.position = '';
            }
        }, 600);
    }

    // Handle modal animations
    handleModalAnimations() {
        // Observe modal elements
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) {
                        // Check if it's a modal
                        if (node.classList && (node.classList.contains('modal') || node.id && node.id.includes('Modal'))) {
                            this.animateModalIn(node);
                        }
                        
                        // Check for modal content
                        const modals = node.querySelectorAll ? node.querySelectorAll('[id*="Modal"], .modal') : [];
                        modals.forEach(modal => this.animateModalIn(modal));
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Handle existing modals
        document.addEventListener('DOMContentLoaded', () => {
            const modals = document.querySelectorAll('[id*="Modal"], .modal');
            modals.forEach(modal => {
                // Watch for display changes
                const modalObserver = new MutationObserver(() => {
                    if (!modal.classList.contains('hidden')) {
                        this.animateModalIn(modal);
                    } else {
                        this.animateModalOut(modal);
                    }
                });

                modalObserver.observe(modal, {
                    attributes: true,
                    attributeFilter: ['class']
                });
            });
        });
    }

    // Animate modal in
    animateModalIn(modal) {
        if (!modal || modal.classList.contains('hidden')) return;
        
        const content = modal.querySelector('[id*="Content"], .modal-content, > div:first-child') || modal;
        
        // Reset animation
        content.style.opacity = '0';
        content.style.transform = 'scale(0.9) translateY(-20px)';
        content.style.transition = 'opacity 0.2s ease-out, transform 0.2s ease-out';
        
        // Trigger animation
        requestAnimationFrame(() => {
            content.style.opacity = '1';
            content.style.transform = 'scale(1) translateY(0)';
        });
    }

    // Animate modal out
    animateModalOut(modal) {
        const content = modal.querySelector('[id*="Content"], .modal-content, > div:first-child') || modal;
        content.style.opacity = '0';
        content.style.transform = 'scale(0.9) translateY(-20px)';
    }

    // Handle dynamic content animations
    handleDynamicContent() {
        // Intersection Observer for fade-in animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Skip if element already has opacity: 1 (like homepage news cards)
                    const currentOpacity = window.getComputedStyle(entry.target).opacity;
                    if (currentOpacity === '1' && entry.target.style.opacity === '1') {
                        observer.unobserve(entry.target);
                        return;
                    }
                    
                    entry.target.style.opacity = '0';
                    entry.target.style.transform = 'translateY(30px)';
                    // Faster animation for news page elements
                    const isNewsPage = window.location.pathname.includes('news.html');
                    const duration = isNewsPage ? '0.6s' : '0.3s';
                    entry.target.style.transition = `opacity ${duration} ease-out, transform ${duration} ease-out`;
                    
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, isNewsPage ? 50 : 30);
                    
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe elements on page load
        document.addEventListener('DOMContentLoaded', () => {
            const animatedElements = document.querySelectorAll(
                '.news-card, .news-article, article, section > div, [data-animate]'
            );
            
            animatedElements.forEach(el => {
                observer.observe(el);
            });
        });

        // Watch for dynamically added content
        const contentObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) {
                        const elements = node.querySelectorAll ? node.querySelectorAll(
                            '.news-card, .news-article, article, [data-animate]'
                        ) : [];
                        elements.forEach(el => observer.observe(el));
                        
                        if (node.matches && node.matches('.news-card, .news-article, article, [data-animate]')) {
                            observer.observe(node);
                        }
                    }
                });
            });
        });

        contentObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
}

// Initialize page transitions
const pageTransition = new PageTransition();

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
    
    @keyframes scaleIn {
        from {
            opacity: 0;
            transform: scale(0.9);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }
    
    /* Smooth transitions for all interactive elements */
    a, button {
        transition: all 0.15s ease-out;
    }
    
    /* Loading state for page transitions */
    body.page-transitioning {
        pointer-events: none;
        overflow: hidden;
    }
    
    /* Prevent flash during page transitions */
    body[data-transitioning="true"] {
        opacity: 0 !important;
    }
    
    /* News card animations - faster */
    .news-card {
        animation: fadeInUp 0.6s ease-out backwards;
    }
    
    .news-card:nth-child(1) { animation-delay: 0.1s; }
    .news-card:nth-child(2) { animation-delay: 0.2s; }
    .news-card:nth-child(3) { animation-delay: 0.3s; }
    .news-card:nth-child(4) { animation-delay: 0.4s; }
    .news-card:nth-child(5) { animation-delay: 0.5s; }
    .news-card:nth-child(6) { animation-delay: 0.6s; }
`;

document.head.appendChild(style);
