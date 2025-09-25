// ===== Utilities =====
const $ = (sel, parent = document) => parent.querySelector(sel);
const $$ = (sel, parent = document) => Array.from(parent.querySelectorAll(sel));

// ===== Typing Effect =====
document.addEventListener("DOMContentLoaded", () => {
    const typingElement = $(".header h1");
    const fullText = typingElement ? typingElement.textContent.trim() : "";
    if (!typingElement || !fullText) return;
    typingElement.textContent = "";
    let index = 0;
    const type = () => {
        if (index < fullText.length) {
            typingElement.textContent += fullText.charAt(index);
            index++;
            setTimeout(type, 80);
        }
    };
    type();
});

// ===== IntersectionObserver reveal and active nav =====
const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            const id = entry.target.getAttribute("id");
            if (id) setActiveNav(`#${id}`);
        }
    });
}, { threshold: 0.25 });

function observeSections() {
    $$(".section").forEach(sec => io.observe(sec));
}

function setActiveNav(hash) {
    $$(".nav__links a").forEach(a => {
        a.classList.toggle("active", a.getAttribute("href") === hash);
    });
}

// ===== Skills micro-animation on reveal =====
function animateSkills() {
    $$(".skills ul li").forEach((skill, i) => {
        skill.style.transition = "transform .4s ease";
        setTimeout(() => {
            skill.style.transform = "scale(1.06)";
            setTimeout(() => (skill.style.transform = "scale(1)"), 300);
        }, i * 30);
    });
}

const skillsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateSkills();
            skillsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.35 });

function observeSkills() {
    const section = $(".skills");
    if (section) skillsObserver.observe(section);
}

// ===== Smooth scroll =====
document.addEventListener("click", (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const target = $(link.getAttribute("href"));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
});

// ===== Theme toggle (persisted) =====
const THEME_KEY = "theme";
function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    const btn = $(".theme-toggle");
    if (btn) btn.setAttribute("aria-pressed", String(theme === "dark"));
}

function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(saved || (prefersDark ? "dark" : "light"));
}

function bindThemeToggle() {
    const btn = $(".theme-toggle");
    if (!btn) return;
    btn.addEventListener("click", () => {
        const current = document.documentElement.getAttribute("data-theme") || "light";
        const next = current === "dark" ? "light" : "dark";
        applyTheme(next);
        localStorage.setItem(THEME_KEY, next);
    });
}

// ===== Init =====
document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    bindThemeToggle();
    observeSections();
    observeSkills();
});
