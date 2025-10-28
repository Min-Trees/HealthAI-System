// ============================================
// HealthAI App Documentation - Main JavaScript
// ============================================

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initSidebarLinks();
    initSearch();
    initCodeCopy();
    initMermaid();
    initScrollSpy();
    initMobileMenu();
});

// ========== Theme Toggle ==========
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;
    
    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    html.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
    
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = html.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
        });
    }
}

function updateThemeIcon(theme) {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        const icon = themeToggle.querySelector('i');
        if (icon) {
            icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        }
    }
}

// ========== Sidebar Navigation ==========
function initSidebarLinks() {
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    const currentPath = window.location.pathname;
    
    sidebarLinks.forEach(link => {
        // Highlight active link based on current URL
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
        
        // Smooth scroll for anchor links
        if (link.getAttribute('href').startsWith('#')) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').slice(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    // Update active state
                    sidebarLinks.forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                    
                    // Update URL without reload
                    history.pushState(null, '', `#${targetId}`);
                }
            });
        }
    });
}

// ========== Search Functionality ==========
function initSearch() {
    const searchInput = document.querySelector('.search-input');
    
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            const searchTerm = e.target.value.toLowerCase();
            performSearch(searchTerm);
        }, 300));
    }
}

function performSearch(term) {
    if (!term) {
        resetSearch();
        return;
    }
    
    // Search in sidebar links
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    let foundCount = 0;
    
    sidebarItems.forEach(item => {
        const link = item.querySelector('.sidebar-link');
        const text = link.textContent.toLowerCase();
        
        if (text.includes(term)) {
            item.style.display = 'block';
            link.style.backgroundColor = 'rgba(37, 99, 235, 0.1)';
            foundCount++;
        } else {
            item.style.display = 'none';
        }
    });
    
    // Search in main content
    const contentSections = document.querySelectorAll('.content-section');
    contentSections.forEach(section => {
        const text = section.textContent.toLowerCase();
        if (text.includes(term)) {
            highlightText(section, term);
        }
    });
}

function resetSearch() {
    // Reset sidebar
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    sidebarItems.forEach(item => {
        item.style.display = 'block';
        const link = item.querySelector('.sidebar-link');
        link.style.backgroundColor = '';
    });
    
    // Remove highlights
    const highlights = document.querySelectorAll('.search-highlight');
    highlights.forEach(highlight => {
        const text = highlight.textContent;
        highlight.outerHTML = text;
    });
}

function highlightText(element, term) {
    // Simple text highlighting (can be enhanced)
    const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        null
    );
    
    const nodesToReplace = [];
    let node;
    
    while (node = walker.nextNode()) {
        if (node.textContent.toLowerCase().includes(term)) {
            nodesToReplace.push(node);
        }
    }
    
    nodesToReplace.forEach(node => {
        const parent = node.parentNode;
        const text = node.textContent;
        const regex = new RegExp(`(${term})`, 'gi');
        const newHTML = text.replace(regex, '<mark class="search-highlight">$1</mark>');
        
        const temp = document.createElement('span');
        temp.innerHTML = newHTML;
        parent.replaceChild(temp, node);
    });
}

// ========== Code Copy Functionality ==========
function initCodeCopy() {
    const codeBlocks = document.querySelectorAll('pre code');
    
    codeBlocks.forEach(block => {
        const pre = block.parentElement;
        
        // Create copy button
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-button';
        copyButton.innerHTML = '<i class="fas fa-copy"></i> Copy';
        copyButton.style.position = 'absolute';
        copyButton.style.top = '0.5rem';
        copyButton.style.right = '0.5rem';
        
        // Make pre relative
        pre.style.position = 'relative';
        pre.appendChild(copyButton);
        
        copyButton.addEventListener('click', async () => {
            const code = block.textContent;
            
            try {
                await navigator.clipboard.writeText(code);
                copyButton.innerHTML = '<i class="fas fa-check"></i> Copied!';
                copyButton.style.backgroundColor = 'var(--accent-color)';
                
                setTimeout(() => {
                    copyButton.innerHTML = '<i class="fas fa-copy"></i> Copy';
                    copyButton.style.backgroundColor = '';
                }, 2000);
            } catch (err) {
                console.error('Failed to copy:', err);
                copyButton.innerHTML = '<i class="fas fa-times"></i> Failed';
            }
        });
    });
}

// ========== Mermaid Initialization ==========
function initMermaid() {
    if (typeof mermaid !== 'undefined') {
        mermaid.initialize({
            startOnLoad: true,
            theme: document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'default',
            securityLevel: 'loose',
            fontFamily: 'Inter, sans-serif',
            flowchart: {
                useMaxWidth: true,
                htmlLabels: true,
                curve: 'basis'
            },
            sequence: {
                useMaxWidth: true,
                wrap: true,
                actorMargin: 50,
                boxMargin: 10,
                boxTextMargin: 5,
                noteMargin: 10,
                messageMargin: 35
            },
            er: {
                useMaxWidth: true
            }
        });
        
        // Re-render on theme change
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'data-theme') {
                    const newTheme = document.documentElement.getAttribute('data-theme');
                    mermaid.initialize({
                        theme: newTheme === 'dark' ? 'dark' : 'default'
                    });
                    
                    // Re-render all diagrams
                    const diagrams = document.querySelectorAll('.mermaid');
                    diagrams.forEach((diagram, index) => {
                        const code = diagram.textContent;
                        diagram.removeAttribute('data-processed');
                        diagram.innerHTML = code;
                    });
                    
                    mermaid.init(undefined, '.mermaid');
                }
            });
        });
        
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        });
    }
}

// ========== Scroll Spy ==========
function initScrollSpy() {
    const sections = document.querySelectorAll('.content-section[id]');
    const sidebarLinks = document.querySelectorAll('.sidebar-link[href^="#"]');
    
    if (sections.length === 0) return;
    
    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -70% 0px',
        threshold: 0
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                
                // Update active link
                sidebarLinks.forEach(link => {
                    if (link.getAttribute('href') === `#${id}`) {
                        sidebarLinks.forEach(l => l.classList.remove('active'));
                        link.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);
    
    sections.forEach(section => observer.observe(section));
}

// ========== Mobile Menu Toggle ==========
function initMobileMenu() {
    // Create mobile menu button if not exists
    const header = document.querySelector('.header-content');
    if (!header) return;
    
    if (window.innerWidth <= 768) {
        const menuButton = document.createElement('button');
        menuButton.className = 'mobile-menu-toggle';
        menuButton.innerHTML = '<i class="fas fa-bars"></i>';
        menuButton.style.cssText = `
            display: block;
            background: var(--primary-color);
            color: white;
            border: none;
            padding: 0.75rem;
            border-radius: var(--radius-md);
            cursor: pointer;
            font-size: 1.25rem;
        `;
        
        header.appendChild(menuButton);
        
        menuButton.addEventListener('click', () => {
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) {
                sidebar.style.display = sidebar.style.display === 'none' ? 'block' : 'none';
            }
        });
    }
}

// ========== Utility Functions ==========
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ========== Animation on Scroll ==========
const animateOnScroll = () => {
    const elements = document.querySelectorAll('.fade-in');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1
    });
    
    elements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
};

// Initialize animations
animateOnScroll();

// ========== Export for use in other files ==========
window.HealthAIDocs = {
    initThemeToggle,
    initSidebarLinks,
    initSearch,
    initCodeCopy,
    initMermaid,
    debounce
};
