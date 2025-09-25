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

// ===== IntersectionObserver reveal =====
const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            io.unobserve(entry.target);
        }
    });
}, { threshold: 0.15 });

function observeSections() {
    $$(".section").forEach(sec => io.observe(sec));
}

// ===== Active nav based on scroll position with sticky offset =====
function setActiveById(id) {
    $$(".nav__links a").forEach(a => {
        a.classList.toggle("active", a.getAttribute("href") === `#${id}`);
    });
}

function updateActiveNavOnScroll() {
    const links = $$(".nav__links a");
    if (!links.length) return;
    const items = links
        .map(a => ({ a, target: $(a.getAttribute("href")) }))
        .filter(x => x.target);

    const nav = $(".nav");
    const navHeight = nav ? nav.getBoundingClientRect().height : 0;
    const scrollYVal = window.scrollY;
    const viewport = window.innerHeight;
    const docHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);

    // If bottom reached (or nearly), force last section active
    if (scrollYVal + viewport >= docHeight - 2) {
        const last = items[items.length - 1];
        if (last) setActiveById(last.target.id);
        return;
    }

    let currentId = items[0]?.target.id;
    for (const { target } of items) {
        const boundary = target.offsetTop - navHeight - 6; // section start under sticky nav
        if (boundary <= scrollYVal) currentId = target.id;
    }
    setActiveById(currentId);
}

window.addEventListener("scroll", updateActiveNavOnScroll);
window.addEventListener("resize", updateActiveNavOnScroll);
document.addEventListener("DOMContentLoaded", updateActiveNavOnScroll);

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
    const nav = $(".nav");
    const navHeight = nav ? nav.getBoundingClientRect().height : 0;
    const docHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
    const viewport = window.innerHeight;
    let top = target.getBoundingClientRect().top + window.scrollY - navHeight - 6;
    const maxScroll = docHeight - viewport;
    if (top > maxScroll) top = maxScroll; // clamp to bottom
    window.scrollTo({ top, behavior: "smooth" });
    // Optimistically set active right away
    const id = target.id;
    if (id) setActiveById(id);
});

// ===== Theme toggle (persisted) =====
const THEME_KEY = "theme";
function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    const btn = $(".theme-toggle");
    if (btn) {
        btn.setAttribute("aria-pressed", String(theme === "dark"));
        const icon = btn.querySelector("i");
        if (icon) {
            icon.classList.remove("fa-moon", "fa-sun");
            icon.classList.add(theme === "dark" ? "fa-sun" : "fa-moon");
        }
    }
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

// ===== Avatar upload with preview + persistence =====
const AVATAR_KEY = "avatar-data-url";
function initAvatar() {
    const img = $("#avatar-img");
    const input = $("#avatar-input");
    if (!img || !input) return;

    const saved = localStorage.getItem(AVATAR_KEY);
    if (saved) img.src = saved;

    img.addEventListener("click", () => input.click());
    input.addEventListener("change", () => {
        const file = input.files && input.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            const url = String(reader.result || "");
            img.src = url;
            try { localStorage.setItem(AVATAR_KEY, url); } catch {}
        };
        reader.readAsDataURL(file);
    });
}

// ===== Init =====
document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    bindThemeToggle();
    observeSections();
    observeSkills();
    initAvatar();
    initProjects();
});

// ===== Projects mini-carousel =====
const PROJECTS = {
    proj1: {
        title: "Диплом: RIS (PERN)",
        desc: "PERN‑стек: PostgreSQL, Express, React, Node + Docker. Авторизация, корзина, заказы, Stripe dev‑фолбек.",
        link: "https://github.com/casioneer/diploma_RIS",
        images: [
            "images/diploma-1.jpg",
            "images/diploma-2.jpg",
            "images/diploma-3.jpg"
        ]
    },
    proj2: {
        title: "Mesto (React)",
        desc: "Учебный проект: профиль, карточки, лайки, попапы. Аккуратный React‑UI, адаптивность.",
        link: "https://github.com/casioneer/mesto-project",
        images: [
            "images/mesto-1.jpg",
            "images/mesto-2.jpg",
            "images/mesto-3.jpg"
        ]
    },
    proj3: {
        title: "Russian Travel", 
        desc: "Адаптивный лендинг о путешествиях по России. Чистая верстка, сетки, responsive.",
        link: "https://github.com/casioneer/russian-travel",
        images: [
            "images/travel-1.jpg",
            "images/travel-2.jpg",
            "images/travel-3.jpg"
        ]
    },
    proj4: {
        title: "Industrial Internship",
        desc: "Производственная практика: командная разработка, планирование задач, фичи на JS.",
        link: "https://github.com/casioneer/industrial-internship",
        images: [
            "images/intern-1.jpg",
            "images/intern-2.jpg",
            "images/intern-3.jpg"
        ]
    }
};

function initProjects() {
    $$(".project-card").forEach(card => {
        const key = card.getAttribute("data-project");
        const cfg = PROJECTS[key];
        if (!cfg) return;

        const img = $("img", card);
        const left = $(".arrow.left", card);
        const right = $(".arrow.right", card);
        const title = $(".project-info h3", card);
        const desc = $(".project-info p", card);
        const link = $(".project-link", card);
        let index = 0;

        const setSlide = (i) => {
            index = (i + cfg.images.length) % cfg.images.length;
            img.src = cfg.images[index];
        };

        title.textContent = cfg.title;
        desc.textContent = cfg.desc;
        link.href = cfg.link;
        setSlide(0);

        left.addEventListener("click", () => setSlide(index - 1));
        right.addEventListener("click", () => setSlide(index + 1));
        $(".project-media", card).addEventListener("click", () => window.open(cfg.link, "_blank"));
    });
}
