import { useEffect, useMemo, useRef, useState } from 'react'

const THEME_KEY = 'theme'
const AVATAR_KEY = 'avatar-data-url'

const base = import.meta.env.BASE_URL || '/';
const PROJECTS = {
  proj1: {
    title: 'Дипломный проект: онлайн‑пиццерия (PERN)',
    desc: 'Полноценный веб‑сервис на PERN: регистрация и вход, корзина, оформление заказов. В dev‑режиме есть безопасная симуляция оплаты Stripe.',
    link: 'https://github.com/casioneer/diploma_RIS',
    images: [`${base}images/diploma-1.jpg`,`${base}images/diploma-2.jpg`,`${base}images/diploma-3.jpg`]
  },
  proj2: {
    title: 'Mesto на React',
    desc: 'Небольшое приложение с карточками и профилем: редактирование, лайки, модальные окна. Уделял внимание чистоте UI и адаптивности.',
    link: 'https://github.com/casioneer/mesto-project',
    images: [`${base}images/mesto-1.jpg`,`${base}images/mesto-2.jpg`,`${base}images/mesto-3.jpg`]
  },
  proj3: {
    title: 'Путешествия по России',
    desc: 'Адаптивный лендинг о поездках по стране. Ставка на аккуратную вёрстку, сетки и типографику.',
    link: 'https://github.com/casioneer/russian-travel',
    images: [`${base}images/travel-1.jpg`,`${base}images/travel-2.jpg`,`${base}images/travel-3.jpg`]
  },
  proj4: {
    title: 'Производственная практика',
    desc: 'Опыт командной разработки: планирование задач, разбор требований и реализация фронтенд‑функционала на JavaScript.',
    link: 'https://github.com/casioneer/industrial-internship',
    images: [`${base}images/intern-1.jpg`,`${base}images/intern-2.jpg`,`${base}images/intern-3.jpg`]
  },
}

function useTheme() {
  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY)
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const theme = saved || (prefersDark ? 'dark' : 'light')
    document.documentElement.setAttribute('data-theme', theme)
  }, [])
  const toggle = () => {
    const current = document.documentElement.getAttribute('data-theme') || 'light'
    const next = current === 'dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem(THEME_KEY, next)
  }
  return { toggle }
}

function Nav() {
  const { toggle } = useTheme()
  const [active, setActive] = useState('#contacts')
  const links = useMemo(() => [
    ['#contacts','Контакты'],
    ['#projects','Проекты'],
    ['#languages','Языки'],
    ['#skills','Навыки'],
    ['#education','Образование'],
    ['#experience','Опыт'],
    ['#about','О себе'],
  ], [])

  useEffect(() => {
    const onScroll = () => {
      const nav = document.querySelector('.nav')
      const navH = nav ? nav.getBoundingClientRect().height : 0
      const y = window.scrollY
      let current = links[0][0]
      for (const [hash] of links) {
        const el = document.querySelector(hash)
        if (!el) continue
        const boundary = el.offsetTop - navH - 6
        if (boundary <= y) current = hash
      }
      // bottom clamp
      if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
        current = links[links.length - 1][0]
      }
      setActive(current)
    }
    window.addEventListener('scroll', onScroll)
    window.addEventListener('resize', onScroll)
    onScroll()
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll) }
  }, [links])

  const onLink = (e, hash) => {
    e.preventDefault()
    const el = document.querySelector(hash)
    const nav = document.querySelector('.nav')
    const navH = nav ? nav.getBoundingClientRect().height : 0
    const docH = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight)
    const viewport = window.innerHeight
    let top = el.getBoundingClientRect().top + window.scrollY - navH - 6
    const max = docH - viewport
    if (top > max) top = max
    window.scrollTo({ top, behavior: 'smooth' })
    setActive(hash)
  }

  return (
    <nav className="nav" aria-label="Основная навигация">
      <div className="container nav__inner">
        <a className="nav__brand" href="#top" aria-label="На главную">Хомутов</a>
        <ul className="nav__links">
          {links.map(([hash, label]) => (
            <li key={hash}><a href={hash} className={active===hash?'active':''} onClick={(e)=>onLink(e,hash)}>{label}</a></li>
          ))}
        </ul>
        <button className="theme-toggle" onClick={toggle} aria-label="Переключить тему">
          <i className="fas fa-moon"></i>
        </button>
      </div>
    </nav>
  )
}

function Header() {
  const inputRef = useRef(null)
  const [src, setSrc] = useState(`${base}images/resume_photo.jpg`)
  useEffect(()=>{ const saved = localStorage.getItem(AVATAR_KEY); if (saved) setSrc(saved) },[])
  const onChange = (e) => {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => { const url = String(reader.result||''); setSrc(url); try { localStorage.setItem(AVATAR_KEY, url) } catch {} }
    reader.readAsDataURL(file)
  }
  return (
    <header className="header">
      <div className="container">
        <div className="avatar" aria-label="Фото профиля">
          <img src={src} alt="Фото профиля" onClick={()=>inputRef.current?.click()} />
          <input ref={inputRef} type="file" accept="image/*" hidden onChange={onChange} />
        </div>
        <h1>Хомутов Андрей Алексеевич</h1>
        <p className="subtitle">Фронтенд‑разработчик</p>
        <p className="location"><i className="fas fa-map-marker-alt"></i> Санкт‑Петербург</p>
        <p className="age"><i className="fas fa-birthday-cake"></i> 23 года</p>
      </div>
    </header>
  )
}

function Section({ id, title, children, className }) {
  const ref = useRef(null)
  useEffect(()=>{
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{ if(e.isIntersecting) { el.classList.add('visible'); obs.unobserve(el) } })
    }, { threshold: .15 })
    obs.observe(el)
    return ()=>obs.disconnect()
  },[])
  return (
    <section id={id} ref={ref} className={`section ${className||''}`}>
      <div className="container">
        <h2>{title}</h2>
        {children}
      </div>
    </section>
  )
}

function Projects() {
  return (
    <div className="projects-grid">
      {Object.entries(PROJECTS).map(([key, cfg]) => (
        <ProjectCard key={key} cfg={cfg} />
      ))}
    </div>
  )
}

function ProjectCard({ cfg }) {
  const [index, setIndex] = useState(0)
  const imgRef = useRef(null)
  const setSlide = (i) => {
    const next = (i + cfg.images.length) % cfg.images.length
    if (imgRef.current) imgRef.current.classList.add('fading')
    setTimeout(()=>{
      setIndex(next)
      if (imgRef.current) imgRef.current.onload = ()=> imgRef.current?.classList.remove('fading')
    },120)
  }
  return (
    <article className="project-card">
      <div className="project-media" onClick={()=>setSlide(index+1)}>
        <button className="arrow left" aria-label="Предыдущий" onClick={(e)=>{e.stopPropagation(); setSlide(index-1)}}>
          <i className="fas fa-chevron-left"></i>
        </button>
        <img ref={imgRef} alt={cfg.title} src={cfg.images[index]} />
        <button className="arrow right" aria-label="Следующий" onClick={(e)=>{e.stopPropagation(); setSlide(index+1)}}>
          <i className="fas fa-chevron-right"></i>
        </button>
      </div>
      <div className="project-info">
        <h3>{cfg.title}</h3>
        <p>{cfg.desc}</p>
        <a className="project-link" href={cfg.link} target="_blank" rel="noopener">Открыть на GitHub</a>
      </div>
    </article>
  )
}

export default function App() {
  return (
    <>
      <Nav />
      <Header />
      <Section id="contacts" title="Контакты">
        <ul>
          <li><i className="fas fa-phone"></i> +7 921 820-77-05</li>
          <li><i className="fas fa-envelope"></i> <a href="mailto:xomutman@gmail.com">xomutman@gmail.com</a></li>
          <li><i className="fab fa-telegram"></i> @casioneer</li>
          <li><i className="fab fa-github"></i> <a href="https://github.com/casioneer" target="_blank">GitHub</a></li>
        </ul>
        <p>Гражданство: РФ</p>
        <p>Занятость: Полная занятость, полный день</p>
      </Section>
      <Section id="projects" title="Проекты" className="projects">
        <Projects />
      </Section>
      <Section id="languages" title="Языки">
        <ul>
          <li>Русский – Родной</li>
          <li>Английский – B2 (Выше среднего)</li>
        </ul>
      </Section>
      <Section id="skills" title="Навыки" className="skills">
        <ul>
          <li>JavaScript</li><li>React.js</li><li>TypeScript</li><li>HTML, CSS</li><li>Git</li><li>Node.js</li><li>REST API</li><li>Express.js</li><li>Webpack</li><li>PostgreSQL</li><li>Docker</li>
        </ul>
      </Section>
      <Section id="education" title="Образование">
        <ul>
          <li>СПбГУАП, Бакалавр (2024) — ИИТиП, 09.03.02 Информационные системы и технологии</li>
          <li>СПбГУАП, Магистр (2026) — ИИТиП, 09.04.02 Информационные системы и технологии</li>
        </ul>
      </Section>
      <Section id="experience" title="Опыт работы">
        <ul>
          <li>Информационная система на стеке PERN для сайта ресторана (PostgreSQL, Express, ReactJS, Node.js, Docker)</li>
          <li>Интерактивный сайт‑портфолио (HTML5, CSS3, JavaScript, ReactJS, Git)</li>
          <li>Практика в КБ «Электроавтоматика»: командная разработка и планирование задач</li>
        </ul>
      </Section>
      <Section id="about" title="О себе" className="about">
        <p>Мне нравится создавать удобные и современные интерфейсы, которые решают реальные задачи. Быстро адаптируюсь и открыт к новым технологиям.</p>
      </Section>
      <footer className="footer"><div className="container">© 2025 Хомутов Андрей. Все права защищены.</div></footer>
    </>
  )
}
