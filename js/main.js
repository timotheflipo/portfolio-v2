// ============================================
// NAVIGATION — injection partagée sur toutes les pages
// ============================================
function buildNav() {
  const path = window.location.pathname;
  const isIndex = path.endsWith('index.html') || path.endsWith('/') || path === '';

  const links = [
    { label: 'Accueil',     href: 'index.html' },
    { label: 'À propos',    href: 'about.html' },
    { label: 'Parcours',    href: 'parcours.html' },
    { label: 'Compétences', href: 'competences.html' },
    { label: 'Contact',     href: 'contact.html' }
  ];
  const currentPage = path.split('/').pop() || 'index.html';
  const isCurrent = l => currentPage === l.href || (isIndex && l.href === 'index.html');

  // Sur grand écran les cinq liens sont visibles : le V1 les cachait
  // tous derrière un bouton « Menu », y compris quand la place ne
  // manquait pas. Le panneau latéral reste, mais pour le mobile.
  const header = document.createElement('header');
  header.className = 'site-header';
  header.id = 'site-header';
  header.innerHTML = `
    <a class="logo" href="${isIndex ? '#hero' : 'index.html'}">
      <span class="logo-mark">TF</span>
      <span class="logo-name">Timothé Flipo</span>
    </a>
    <nav class="nav-inline" aria-label="Navigation principale">
      ${links.map(l => `<a href="${l.href}"${isCurrent(l) ? ' aria-current="page"' : ''}>${l.label}</a>`).join('')}
    </nav>
    <button class="burger-btn" id="burger" aria-label="Ouvrir le menu" aria-expanded="false" aria-controls="nav-panel">
      <span class="burger-label">Menu</span>
      <span class="burger-box">
        <span class="burger-line"></span>
        <span class="burger-line"></span>
        <span class="burger-line"></span>
      </span>
    </button>
  `;

  const overlay = document.createElement('div');
  overlay.className = 'nav-overlay';
  overlay.id = 'nav-overlay';

  const panel = document.createElement('nav');
  panel.className = 'nav-panel';
  panel.id = 'nav-panel';
  panel.setAttribute('aria-label', 'Navigation');

  // Les icônes de contour du V1 étaient, de l'aveu même du commentaire
  // qu'elles portaient, du « style Lucide » : cinq pictogrammes
  // génériques pour cinq mots parfaitement lisibles.
  panel.innerHTML = `
    <div class="nav-head">
      <span class="nav-head-mark">TF</span>
      <div class="nav-head-info">
        <span class="nav-head-name">Timothé Flipo</span>
        <span class="nav-head-mail">Portfolio · BUT GEA</span>
      </div>
    </div>
    <span class="nav-section-label">Navigation</span>
    <ul class="nav-links">
      ${links.map(l => `
        <li>
          <a class="nav-link${isCurrent(l) ? ' active' : ''}" href="${l.href}"${isCurrent(l) ? ' aria-current="page"' : ''}>
            ${l.label}
          </a>
        </li>`).join('')}
    </ul>
    <div class="nav-bottom">
      <div>Timothé Flipo — Portfolio 2025–2026</div>
      <div>BUT GEA · Parcours GEMA · Paris-Saclay</div>
    </div>
  `;

  document.body.prepend(panel);
  document.body.prepend(overlay);
  document.body.prepend(header);

  const burger = document.getElementById('burger');
  const navPanel = document.getElementById('nav-panel');
  const navOverlay = document.getElementById('nav-overlay');

  function openNav() {
    burger.classList.add('open');
    navPanel.classList.add('open');
    navOverlay.classList.add('visible');
    burger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeNav() {
    burger.classList.remove('open');
    navPanel.classList.remove('open');
    navOverlay.classList.remove('visible');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  burger.addEventListener('click', () => {
    burger.classList.contains('open') ? closeNav() : openNav();
  });
  navOverlay.addEventListener('click', closeNav);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeNav(); });

  const siteHeader = document.getElementById('site-header');
  window.addEventListener('scroll', () => {
    siteHeader.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
}

// ============================================
// FAQ ACCORDION
// ============================================
function buildFAQ(container) {
  if (!container || typeof faqItems === 'undefined') return;

  container.innerHTML = '';
  faqItems.forEach((item, i) => {
    const el = document.createElement('div');
    el.className = 'faq-item';
    el.innerHTML = `
      <button class="faq-btn" aria-expanded="false" aria-controls="faq-body-${i}">
        <span>${item.q}</span>
        <span class="faq-icon" aria-hidden="true">+</span>
      </button>
      <div class="faq-body" id="faq-body-${i}" role="region">
        <div class="faq-body-inner"><p>${item.a}</p></div>
      </div>
    `;

    const btn = el.querySelector('.faq-btn');
    btn.addEventListener('click', () => {
      const isOpen = el.classList.contains('open');
      // Fermer tous les autres
      container.querySelectorAll('.faq-item.open').forEach(other => {
        other.classList.remove('open');
        other.querySelector('.faq-btn').setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        el.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });

    container.appendChild(el);
  });
}

// ============================================
// SECTIONS THÉMATIQUES (index.html sections 3-5)
// ============================================
const projectsRegistry = [];

// --- Bandeau de titre, commun aux trois parties ---
// Chaque partie s'ouvre sur la même bande sombre : c'est elle qui dit
// « nouveau chapitre ». Le V2.1 laissait la partie 2 poser son titre dans
// une colonne latérale, donc rien ne signalait qu'on changeait de partie.
function themeBandHTML(theme, num) {
  return `
    <div class="ts-band">
      <div class="ts-band-inner reveal">
        <div class="ts-band-title">
          <span class="ts-eyebrow">${num}</span>
          <h2 class="ts-title">${theme.title}</h2>
        </div>
        <p class="ts-intro">${theme.intro || ''}</p>
      </div>
    </div>`;
}

// Carte « projet central »
function featuredCardHTML({ card, tagsHTML, preuvesChip }, revealClass = 'reveal') {
  return `
    <div class="proj-card-wrap">
      <a class="proj-card-featured ${revealClass}" href="${card.link}">
        <div class="pcf-badge">Projet central</div>
        <div class="pcf-top">
          <h3>${card.title}</h3>
          <span class="pcf-arrow">↗</span>
        </div>
        <p>${card.description}</p>
        <div class="proj-tags">${tagsHTML}</div>
        ${preuvesChip}
      </a>
    </div>`;
}

// Carte secondaire
function plainCardHTML({ card, tagsHTML, preuvesChip }, revealClass = 'reveal') {
  return `
    <div class="proj-card-wrap">
      <a class="proj-card ${revealClass}" href="${card.link}">
        <div class="proj-card-top">
          <h3>${card.title}</h3>
          <span class="proj-arrow">↗</span>
        </div>
        <p>${card.description}</p>
        <div class="proj-tags">${tagsHTML}</div>
        ${preuvesChip}
      </a>
    </div>`;
}

// --- Section 1 : un projet central, deux projets à côté ---
function buildS1HTML(theme, num, cards) {
  const [fc, ...sc] = cards;
  return `
    ${themeBandHTML(theme, num)}
    <div class="ts1-cards-area">
      ${featuredCardHTML(fc)}
      <div class="ts1-sub-grid">${sc.map(c => plainCardHTML(c)).join('')}</div>
    </div>`;
}

// --- Section 2 : deux projets centraux côte à côte ---
function buildS2HTML(theme, num, cards) {
  return `
    ${themeBandHTML(theme, num)}
    <div class="ts2-grid">
      ${cards.map(c => featuredCardHTML(c)).join('')}
    </div>`;
}

// --- Section 3 : un projet en pleine image, deux projets à côté ---
function buildS3HTML(theme, num, cards) {
  const [fc, ...sc] = cards;

  const imgAttr = theme.image
    ? `style="background-image:url('${theme.image}');background-position:${theme.bgPosition || 'center'}"`
    : '';

  const featuredHTML = theme.image ? `
    <div class="proj-card-wrap">
      <a class="proj-card-featured img-card reveal" href="${fc.card.link}">
        <div class="pcf-bg" ${imgAttr}></div>
        <div class="pcf-overlay"></div>
        <div class="pcf-img-body">
          <div class="pcf-awards">
            <span class="pcf-award">Prix innovation</span>
            <span class="pcf-award">Prix entrepreneurial</span>
          </div>
          <div class="pcf-badge">Projet central</div>
          <div class="pcf-top">
            <h3>${fc.card.title}</h3>
            <span class="pcf-arrow">↗</span>
          </div>
          <p>${fc.card.description}</p>
          <div class="proj-tags">${fc.tagsHTML}</div>
          ${fc.preuvesChip}
        </div>
      </a>
    </div>` : featuredCardHTML(fc);

  return `
    ${themeBandHTML(theme, num)}
    <div class="ts3-grid">
      ${featuredHTML}
      <div class="ts3-secondary">${sc.map(c => plainCardHTML(c)).join('')}</div>
    </div>`;
}

// --- Orchestrateur ---
function buildThematiques(container) {
  if (!container || typeof thematiquesData === 'undefined') return;
  projectsRegistry.length = 0;

  thematiquesData.forEach((theme, themeIdx) => {
    const section = document.createElement('section');
    section.className = `theme-section theme-s${themeIdx + 1}`;
    section.id = theme.id;
    const num = String(themeIdx + 1).padStart(2, '0');

    const cards = theme.cards.map(card => {
      const regIndex = projectsRegistry.length;
      projectsRegistry.push({ name: card.popupName || card.title, details: card.competencyDetails || [] });
      const hasDetails = (card.competencyDetails || []).length > 0;
      const tagsHTML = card.tags.map(t =>
        hasDetails
          ? `<button type="button" class="proj-tag proj-tag-clickable" data-reg="${regIndex}">${t}</button>`
          : `<span class="proj-tag">${t}</span>`
      ).join('');
      const slug = (card.link || '').replace(/\.html$/, '');
      const preuvesChip = preuvesChipHTML(slug);
      return { card, tagsHTML, preuvesChip };
    });

    if (themeIdx === 0)      section.innerHTML = buildS1HTML(theme, num, cards);
    else if (themeIdx === 1) section.innerHTML = buildS2HTML(theme, num, cards);
    else                     section.innerHTML = buildS3HTML(theme, num, cards);

    // Fond animé, purement décoratif — voir initSectionCurves().
    section.insertAdjacentHTML('afterbegin', '<canvas class="fx-curves" aria-hidden="true"></canvas>');

    container.appendChild(section);
  });

  // Ancre de retour : chaque carte reçoit un id "proj-<slug>" (dérivé de son lien)
  // pour que le bouton « Retour au portfolio » des pages projet ramène à sa position.
  container.querySelectorAll('.proj-card-wrap').forEach(wrap => {
    const a = wrap.querySelector('a[href$=".html"]');
    if (a) wrap.id = 'proj-' + a.getAttribute('href').replace(/\.html$/, '');
  });

  container.addEventListener('click', e => {
    const tag = e.target.closest('.proj-tag-clickable');
    if (!tag) return;
    e.preventDefault();
    e.stopPropagation();
    const project = projectsRegistry[+tag.dataset.reg];
    if (project) openCompetencyModal(project);
  });

}

// ============================================
// POP-UP COMPÉTENCES
// ============================================
function getCompetencyModal() {
  let overlay = document.getElementById('comp-modal');
  if (overlay) return overlay;

  overlay = document.createElement('div');
  overlay.className = 'comp-modal-overlay';
  overlay.id = 'comp-modal';
  overlay.innerHTML = `
    <div class="comp-modal" role="dialog" aria-modal="true" aria-labelledby="comp-modal-eyebrow">
      <button class="comp-modal-close" aria-label="Fermer la fenêtre">&times;</button>
      <div class="comp-modal-header">
        <span class="comp-modal-eyebrow" id="comp-modal-eyebrow">Compétences mobilisées</span>
        <h3 class="comp-modal-project"></h3>
      </div>
      <div class="comp-modal-body"></div>
    </div>`;
  document.body.appendChild(overlay);

  const closeModal = () => {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  };
  overlay.querySelector('.comp-modal-close').addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal();
  });

  return overlay;
}

function openCompetencyModal(project) {
  const overlay = getCompetencyModal();
  overlay.querySelector('.comp-modal-project').textContent = 'Projet · ' + project.name;

  overlay.querySelector('.comp-modal-body').innerHTML = project.details.map(d => `
    <div class="comp-detail">
      <div class="comp-detail-head">
        <span class="comp-detail-dot"></span>
        <h4>${d.name}</h4>
        <span class="comp-detail-level">${d.level}</span>
      </div>
      <p class="comp-detail-desc">${d.description}</p>
      <p class="comp-detail-example"><span class="comp-detail-ex-label">Exemple ·</span> ${d.example}</p>
    </div>
  `).join('');

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

// ============================================
// NOTION BLOCKS (index.html section 2)
// ============================================
function buildNotionBlocks(container) {
  if (!container || typeof notionBlocks === 'undefined') return;
  container.innerHTML = notionBlocks.map(b => `
    <div class="notion-block reveal reveal-delay-${b.number}">
      <div class="notion-num">${b.number}</div>
      <div class="notion-block-text">
        <h4>${b.title}</h4>
        <p>${b.text}</p>
      </div>
    </div>
  `).join('');
}

// ============================================
// TIMELINE (parcours.html)
// ============================================
function buildTimeline(container) {
  if (!container || typeof timelineItems === 'undefined') return;

  // Sous-carte d'expérience (à l'intérieur d'un groupe)
  const makeExp = (e) => `
    <div class="tl-exp reveal">
      <span class="tl-exp-dot"></span>
      <div class="tl-exp-head">
        <h4>${e.title}</h4>
        <span class="tl-chip tl-chip--${e.chipKind}">${e.chip}</span>
      </div>
      <div class="tl-exp-meta">${e.period} · <strong>${e.org}</strong></div>
      ${e.description ? `<p>${e.description}</p>` : ''}
      ${e.note ? `<span class="tl-exp-note">↳ ${e.note}</span>` : ''}
    </div>
  `;

  const chipClass = {
    formation: 'tl-chip--formation',
    central:   'tl-chip--central',
    future:    'tl-chip--future'
  };
  // La formation en cours porte la seule capsule pleine de la page.
  const chipFor = n => n.current ? 'tl-chip--current' : chipClass[n.kind];

  const html = timelineItems.map((node) => {
    const groupHTML = node.group ? `
      <div class="tl-group">
        <div class="tl-group-head">${node.group.head}</div>
        <div class="tl-exp-list">
          ${node.group.items.map(makeExp).join('')}
        </div>
      </div>
    ` : '';

    return `
      <div class="tl-node tl-node--${node.kind} reveal">
        <div class="tl-date">${node.period}</div>
        <div class="tl-rail"><span class="tl-dot"></span></div>
        <div class="tl-body">
          <article class="tl-card ${node.kind === 'central' ? 'tl-card--central' : ''}">
            <span class="tl-chip ${chipFor(node)}">${node.chip}</span>
            <h3>${node.title}</h3>
            <div class="tl-meta">${node.org}</div>
            <p>${node.description}</p>
          </article>
          ${groupHTML}
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = html;

  container.querySelectorAll('.tl-node').forEach((n, i) => {
    n.style.transitionDelay = `${i * 0.08}s`;
  });
}

// ============================================
// COMPÉTENCES INFORMATIQUES — cartes flip (competences.html)
// ============================================
function buildSoftwareSkills(container) {
  if (!container || typeof softwareSkillsData === 'undefined') return;

  // Le retournement se fait au clic, jamais au survol : sur une grille de
  // quatre cartes, le simple passage de la souris les faisait toutes tourner.
  softwareSkillsData.forEach((skill, i) => {
    const card = document.createElement('div');
    card.className = 'skill-flip-card reveal';
    card.classList.add(`reveal-delay-${(i % 4) + 1}`);

    const fillPct = Math.round((skill.level / skill.levelMax) * 100);
    let logoBlockHTML;
    if (skill.logos && skill.logos.length) {
      logoBlockHTML = `
        <div class="skill-logo skill-logo-group">
          ${skill.logos.map(src => `<img src="${src}" alt="Logo ${skill.name}" width="52" height="52" loading="lazy" decoding="async">`).join('')}
        </div>`;
    } else if (skill.logo) {
      logoBlockHTML = `<div class="skill-logo"><img src="${skill.logo}" alt="Logo ${skill.name}" width="76" height="76" loading="lazy" decoding="async"></div>`;
    } else {
      logoBlockHTML = `<div class="skill-logo"><span>${skill.initials}</span></div>`;
    }

    card.innerHTML = `
      <div class="skill-flip-inner">
        <div class="skill-flip-face skill-flip-front">
          ${logoBlockHTML}
          <h3 class="skill-name">${skill.name}</h3>
          <div class="skill-level-row">
            <span class="skill-level-label">Niveau</span>
            <span class="skill-level-value">${skill.levelDisplay}/${skill.levelMax}</span>
          </div>
          <div class="skill-level-bar"><span style="width:${fillPct}%"></span></div>
        </div>
        <div class="skill-flip-face skill-flip-back">
          <div class="skill-back-block">
            <span class="skill-back-eyebrow">Niveau de maîtrise</span>
            <p class="skill-back-desc">${skill.levelDescription}</p>
          </div>
          <div class="skill-back-block">
            <span class="skill-back-eyebrow">Exemples de travaux réalisés</span>
            <ul class="skill-example-list">
              ${skill.examples.map(ex => `<li>${ex}</li>`).join('')}
            </ul>
          </div>
        </div>
      </div>
    `;

    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `${skill.name} — voir le détail`);
    const flip = () => {
      const on = card.classList.toggle('flipped');
      card.setAttribute('aria-pressed', String(on));
    };
    card.addEventListener('click', flip);
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); }
    });

    container.appendChild(card);
  });
}

// ============================================
// COMPÉTENCES (competences.html)
// ============================================
// Pastilles de niveau d'acquisition (par sous-compétence ; défaut = acquis)
const PASTILLES = {
  'acquis':      { cls: 'acquis',      label: 'Acquis' },
  'en-cours':    { cls: 'en-cours',    label: 'En cours' },
  'a-renforcer': { cls: 'a-renforcer', label: 'À renforcer' }
};

function buildCompetences(container) {
  if (!container || typeof competencesData === 'undefined') return;

  competencesData.forEach(comp => {
    const wrap = document.createElement('div');
    wrap.className = 'comp-card-wrap';
    wrap.dataset.id = comp.id;

    const niveauxHTML = comp.niveaux.map(n => `
      <div class="comp-niveau">
        <div class="comp-niveau-head">
          <span class="comp-niveau-num">Niveau ${n.num}</span>
          <span class="comp-niveau-title">${n.title}</span>
        </div>
        <ul class="comp-items">
          ${n.items.map(item => {
            const p = PASTILLES[item.acquisition] || PASTILLES.acquis;
            return `
            <li class="comp-item">
              <span class="comp-pastille comp-pastille--${p.cls}" title="Niveau d'acquisition : ${p.label}">
                <span class="comp-pastille-dot"></span>${p.label}
              </span>
              <div class="comp-item-body">
                <span class="comp-item-text">${item.text}</span>
                <span class="comp-item-example">
                  ${item.example}${item.tags && item.tags.length ? ' — ' + item.tags.map(t => `<span class="comp-item-badge">${t}</span>`).join('') : ''}
                </span>
              </div>
            </li>`;
          }).join('')}
        </ul>
      </div>
    `).join('');

    wrap.innerHTML = `
      <div class="comp-card reveal" data-id="${comp.id}">
        <div class="comp-content">
          <span class="comp-num"><span class="sr-only">Compétence </span>${comp.number}</span>
          <div class="comp-body">
            <h3 class="comp-name">${comp.name}</h3>
            <span class="comp-level-badge">${comp.levelAchieved}</span>
            <div class="comp-desc"><span class="comp-desc-inner">${comp.levelDesc}</span></div>
            <div class="comp-cta">
              <span>Voir les apprentissages</span>
              <span aria-hidden="true">→</span>
            </div>
          </div>
        </div>
        <div class="comp-projects" id="proj-${comp.id}">
          <div class="comp-projects-inner">
            <div class="comp-niveaux">${niveauxHTML}</div>
          </div>
        </div>
      </div>
    `;

    container.appendChild(wrap);

    wrap.querySelector('.comp-card').addEventListener('click', () => {
      const isExpanded = wrap.classList.contains('expanded');
      // Fermer tous
      document.querySelectorAll('.comp-card-wrap.expanded').forEach(w => w.classList.remove('expanded'));
      if (!isExpanded) wrap.classList.add('expanded');
    });
  });
}

// ============================================
// FOND ANIMÉ — COURBES DE NIVEAU
// ============================================
// Des courbes de niveau, comme sur une carte topographique : des boucles
// fermées et emboîtées. Un champ scalaire est construit à partir de
// quinze sources, puis on en trace les lignes d'isovaleur par
// « marching squares ».
//
// Le point important est ailleurs, dans la manière dont ça bouge.
//
// La première version recalculait tout le relief à chaque image. Même
// bridée à douze images par seconde — ce qui se voyait, et saccadait —
// elle occupait le fil principal en permanence, celui-là même qui doit
// répondre aux clics et au défilement.
//
// Ici le relief n'est calculé qu'UNE fois, dans un temps mort du
// navigateur. Le mouvement est ensuite une simple translation CSS,
// composée par le processeur graphique : le fil principal n'en fait
// strictement rien. D'où une fluidité à soixante images par seconde et
// des clics qui restent instantanés, quoi qu'il arrive.
//
// Le canvas déborde volontairement de sa section : la translation ne
// peut donc jamais en découvrir le bord, et `overflow: hidden` sur la
// section masque le reste.
function initSectionCurves() {
  const canvases = [...document.querySelectorAll('.fx-curves')];
  if (!canvases.length) return;

  const css = getComputedStyle(document.documentElement);

  // Les traits reprennent l'accent et l'encre du site, jamais un gris
  // arbitraire. Une ligne sur quatre passe à l'orange, comme les courbes
  // maîtresses d'une vraie carte.
  const rgba = (hex, a) => {
    const h = hex.trim().replace('#', '');
    const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
  };
  /*
     Le canvas est rendu en pixels CSS, pas en pixels écran : sur un
     Retina il est donc étiré d'un facteur deux, et un trait d'un pixel
     s'étale sur deux en perdant la moitié de sa densité. C'est ce qui le
     rendait presque invisible.

     Le rendre à la densité de l'écran quadruplerait la mémoire du canvas
     — une soixantaine de mégaoctets pour une décoration de fond. On
     compense donc à l'encre : le trait reste doux, mais il pèse le même
     poids à l'œil sur les deux types d'écran.
  */
  const soft = 0.55 + 0.45 * Math.min(window.devicePixelRatio || 1, 2);
  const INK    = rgba(css.getPropertyValue('--ink')    || '#2b2723', 0.22 * soft);
  const ACCENT = rgba(css.getPropertyValue('--accent') || '#ff6f3c', 0.40 * soft);

  const CELL   = 11;   // finesse de la grille, en px : plus petit = plus lisse
  const LEVELS = 16;   // nombre de courbes de niveau

  // Quinze sources, petites et rapprochées. Six grosses bulles ne
  // donnaient que de vastes arcs ; il faut beaucoup de maxima locaux pour
  // obtenir le grain serré d'une vraie carte. Les amplitudes négatives
  // creusent des cuvettes entre les reliefs.
  const SOURCES = [
    { x: 0.10, y: 0.18, r: 0.16, amp:  1.00 },
    { x: 0.28, y: 0.09, r: 0.13, amp: -0.80 },
    { x: 0.44, y: 0.22, r: 0.18, amp:  0.90 },
    { x: 0.63, y: 0.11, r: 0.12, amp: -0.70 },
    { x: 0.80, y: 0.26, r: 0.17, amp:  0.95 },
    { x: 0.94, y: 0.08, r: 0.11, amp: -0.65 },
    { x: 0.06, y: 0.48, r: 0.14, amp: -0.85 },
    { x: 0.33, y: 0.55, r: 0.19, amp:  1.00 },
    { x: 0.56, y: 0.44, r: 0.12, amp: -0.75 },
    { x: 0.74, y: 0.58, r: 0.16, amp:  0.85 },
    { x: 0.92, y: 0.47, r: 0.13, amp: -0.70 },
    { x: 0.17, y: 0.82, r: 0.18, amp:  0.90 },
    { x: 0.48, y: 0.88, r: 0.14, amp: -0.80 },
    { x: 0.70, y: 0.92, r: 0.15, amp:  0.95 },
    { x: 0.88, y: 0.79, r: 0.12, amp: -0.72 }
  ];

  // Champ scalaire : somme de retombées en 1/(1+d²), sans racine carrée.
  // Il est rempli bande par bande : c'est la seule partie vraiment
  // coûteuse, et d'un bloc elle dépassait les 50ms sur machine lente.
  function sources(w, h) {
    const ref = Math.min(w, h) || 1;
    // Positions et rayons résolus une fois, pas par point de grille.
    return SOURCES.map(s => {
      const rr = s.r * ref;
      return { px: s.x * w, py: s.y * h, inv: 1 / (rr * rr), amp: s.amp };
    });
  }

  function fillBand(st, j0, j1) {
    const { grid, cols, pts } = st;
    for (let j = j0; j < j1; j++) {
      const y = j * CELL;
      let k = j * (cols + 1);
      for (let i = 0; i <= cols; i++) {
        const x = i * CELL;
        let v = 0;
        for (let n = 0; n < pts.length; n++) {
          const p = pts[n];
          const dx = x - p.px, dy = y - p.py;
          v += p.amp / (1 + (dx * dx + dy * dy) * p.inv);
        }
        grid[k++] = v;
        if (v < st.min) st.min = v;
        if (v > st.max) st.max = v;
      }
    }
  }

  // Marching squares : pour chaque cellule on regarde lesquels de ses
  // quatre coins dépassent le seuil, et on relie les points interpolés
  // sur les arêtes concernées. L'interpolation linéaire suffit à rendre
  // le trait lisse dès lors que le champ l'est.
  function contour(ctx, grid, cols, level, j0, j1) {
    const idx = (i, j) => j * (cols + 1) + i;
    for (let j = j0; j < j1; j++) {
      for (let i = 0; i < cols; i++) {
        const a = grid[idx(i, j)],         b = grid[idx(i + 1, j)];
        const c = grid[idx(i + 1, j + 1)], d = grid[idx(i, j + 1)];
        let m = 0;
        if (a > level) m |= 8;
        if (b > level) m |= 4;
        if (c > level) m |= 2;
        if (d > level) m |= 1;
        if (m === 0 || m === 15) continue;

        const x = i * CELL, y = j * CELL;
        const T = () => [x + CELL * (level - a) / (b - a), y];
        const R = () => [x + CELL, y + CELL * (level - b) / (c - b)];
        const B = () => [x + CELL * (level - d) / (c - d), y + CELL];
        const L = () => [x, y + CELL * (level - a) / (d - a)];
        const seg = (p, q) => { ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); };

        switch (m) {
          case 1: case 14: seg(L(), B()); break;
          case 2: case 13: seg(B(), R()); break;
          case 3: case 12: seg(L(), R()); break;
          case 4: case 11: seg(T(), R()); break;
          case 6: case 9:  seg(T(), B()); break;
          case 7: case 8:  seg(L(), T()); break;
          // Cas ambigus : deux courbes traversent la même cellule.
          case 5:  seg(L(), T()); seg(B(), R()); break;
          case 10: seg(L(), B()); seg(T(), R()); break;
        }
      }
    }
  }

  // Allocation seule : dimensionner le canvas et réserver la grille.
  function alloc(cv) {
    const r = cv.getBoundingClientRect();
    const w = Math.round(r.width), h = Math.round(r.height);
    if (!w || !h) return null;
    // Un pixel par pixel CSS, même sur écran à haute densité : ce sont
    // des traits très pâles sur un fond clair, le gain de finesse ne se
    // verrait pas et coûterait quatre fois plus de mémoire.
    cv.width = w; cv.height = h;
    const ctx = cv.getContext('2d');
    ctx.lineJoin = 'round';
    ctx.lineCap  = 'round';
    ctx.lineWidth = 1;
    const cols = Math.ceil(w / CELL), rows = Math.ceil(h / CELL);
    return {
      ctx, cols, rows,
      grid: new Float32Array((cols + 1) * (rows + 1)),
      pts: sources(w, h),
      min: Infinity, max: -Infinity, span: 0
    };
  }

  // Un niveau est tracé en plusieurs passes de lignes. Le résultat est
  // identique à un tracé d'un seul tenant — ce sont des segments
  // indépendants — mais aucune passe ne monopolise le fil principal.
  function drawLevel(st, n, j0, j1) {
    st.ctx.beginPath();
    contour(st.ctx, st.grid, st.cols, st.min + st.span * (n / (LEVELS + 1)), j0, j1);
    st.ctx.strokeStyle = n % 4 === 0 ? ACCENT : INK;
    st.ctx.stroke();
  }

  /*
     Le tracé est découpé en petites tâches — la grille, puis les niveaux
     deux par deux — et le navigateur en exécute autant qu'il peut dans
     chacun de ses temps morts, sans jamais dépasser le budget qu'il
     annonce.

     Une première version tracait chaque canvas d'un bloc dans un
     `requestIdleCallback` : sur un processeur bridé quatre fois, deux de
     ces blocs dépassaient les 50ms et devenaient des « tâches longues »,
     c'est-à-dire des instants où un clic aurait attendu. Découpé ainsi,
     il n'y en a plus aucune.
  */
  const steps = [];
  const BANDS = 8;         // découpe du calcul du champ
  const LEVEL_CHUNKS = 3;  // découpe du tracé de chaque niveau
  function enqueue(cv) {
    let st = null;
    steps.push(() => { st = alloc(cv); });
    for (let n = 0; n < BANDS; n++) {
      const band = n;
      steps.push(() => {
        if (!st) return;
        // La grille compte rows+1 lignes de points ; la dernière bande
        // va jusqu'au bout pour qu'aucune ligne ne reste à zéro.
        const lines = st.rows + 1;
        const from = Math.floor(lines * band / BANDS);
        const to   = band === BANDS - 1 ? lines : Math.floor(lines * (band + 1) / BANDS);
        fillBand(st, from, to);
      });
    }
    steps.push(() => { if (st) st.span = st.max - st.min; });
    // Un tiers de niveau par étape. Un niveau entier restait la plus
    // grosse étape de la file — une douzaine de millisecondes, soit
    // soixante-dix sur une machine six fois plus lente, donc au-dessus
    // de la barre des cinquante.
    for (let n = 1; n <= LEVELS; n++) {
      for (let c = 0; c < LEVEL_CHUNKS; c++) {
        const level = n, chunk = c;
        steps.push(() => {
          if (!st || st.span < 1e-6) return;
          const from = Math.floor(st.rows * chunk / LEVEL_CHUNKS);
          const to   = chunk === LEVEL_CHUNKS - 1 ? st.rows
                     : Math.floor(st.rows * (chunk + 1) / LEVEL_CHUNKS);
          drawLevel(st, level, from, to);
        });
      }
    }
    steps.push(() => { if (st) cv.classList.add('is-ready'); });
  }

  /*
     `requestIdleCallback` n'existe pas partout — Safari ne l'a ajouté
     qu'en version 17. La solution de repli doit donc annoncer un budget
     plausible, et surtout la boucle ci-dessous ne doit jamais dépendre
     de ce budget pour avancer.
  */
  const idle = window.requestIdleCallback ||
    (fn => setTimeout(() => fn({ timeRemaining: () => 14 }), 16));

  let draining = false;
  function drain(deadline) {
    /*
       Au moins une étape par appel, quoi qu'annonce le budget, puis on
       enchaîne tant qu'il reste de quoi en finir une autre.

       Le `do…while` n'est pas un détail de style. Avec un `while`, une
       implémentation qui annonce moins que le seuil ne franchissait
       jamais la condition : la file se replanifiait indéfiniment sans
       rien tracer, et l'effet restait invisible sur tout navigateur
       dépourvu de `requestIdleCallback`. Le progrès ne doit jamais être
       conditionné à une valeur qu'on ne contrôle pas.
    */
    do { steps.shift()(); } while (steps.length && deadline.timeRemaining() > 10);
    if (steps.length) idle(drain);
    else draining = false;
  }
  function schedule() {
    if (draining || !steps.length) return;
    draining = true;
    idle(drain);
  }

  canvases.forEach(enqueue);
  schedule();

  // La translation est une animation CSS, donc composée hors du fil
  // principal. Reste à l'interrompre quand la section n'est pas à
  // l'écran : une animation qui tourne pour personne reste du travail.
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => e.target.classList.toggle('is-paused', !e.isIntersecting));
  }, { rootMargin: '150px 0px' });
  canvases.forEach(cv => io.observe(cv));

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      steps.length = 0;
      canvases.forEach(cv => { cv.classList.remove('is-ready'); enqueue(cv); });
      schedule();
    }, 200);
  }, { passive: true });
}

// ============================================
// SCROLL REVEAL (Intersection Observer)
// ============================================
function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal, .reveal-l, .reveal-r').forEach(el => observer.observe(el));
}

// ============================================
// PAGE TRANSITION
// ============================================
// Le V1 mettait `body.opacity = 0` puis attendait 350ms avant de changer
// de page, à chaque lien interne. Un quart de seconde d'attente ajoutée à
// un chargement déjà instantané se ressent comme de la lenteur, pas comme
// une transition. Il ne reste que le fondu d'arrivée, qui ne retarde rien.
function initPageTransition() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.body.animate(
    [{ opacity: 0 }, { opacity: 1 }],
    { duration: 240, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' }
  );
}

// ============================================
// NOTION SCROLL ROTATION — rotation Y pilotée par le scroll
// ============================================
// ============================================
// SCROLL WORDS — titre section Notion mot par mot
// ============================================
function initScrollWords() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const header = document.querySelector('.notion-header');
  if (!header) return;
  const h2 = header.querySelector('h2');
  if (!h2) return;

  // Découpe le innerHTML en tokens : mots ou <br> — wrap chaque mot dans un <span>
  const tokens = h2.innerHTML.split(/(<br\s*\/?>)/i);
  h2.innerHTML = tokens.map(token => {
    if (/<br/i.test(token)) return token; // garde le <br>
    return token.replace(/(\S+)/g, '<span class="sw">$1</span>');
  }).join('');

  const words = [...h2.querySelectorAll('.sw')];
  const n = words.length;
  if (n === 0) return;

  // État initial : tous les mots en gris clair
  words.forEach(w => { w.style.color = 'var(--ash)'; });

  let ticking = false;

  function update() {
    const rect = header.getBoundingClientRect();
    const vh   = window.innerHeight;

    // progress 0 → quand le haut du header touche le bas du viewport
    // progress 1 → quand le haut du header atteint 25 % du viewport depuis le haut
    const raw      = (vh - rect.top) / (vh * 0.75);
    const progress = Math.min(Math.max(raw, 0), 1);

    // Nombre de mots qui doivent être noirs
    const activeCount = Math.round(progress * n);

    words.forEach((w, i) => {
      w.style.color = i < activeCount ? 'var(--ink)' : 'var(--ash)';
    });

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });

  window.addEventListener('resize', () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });

  update(); // état initial (si la page est déjà scrollée au chargement)
}

// ============================================
// PREUVES — figures en pleine largeur + visionneuse
// ============================================
// Le V1 rangeait les 36 captures et les 9 PDF derrière une modale
// ouverte depuis une puce discrète : 46 Mo de matière réelle que
// personne n'allait chercher. Or c'est la seule matière du site —
// tout le reste est une carte blanche arrondie contenant du texte.
// Les preuves sont désormais dans le flux de la page projet, en
// pleine largeur, chacune avec sa légende.

// Nom affichable d'un projet à partir de son slug
function getProjectName(slug) {
  if (typeof thematiquesData === 'undefined') return '';
  for (const t of thematiquesData) {
    for (const c of t.cards) {
      if ((c.link || '').replace(/\.html$/, '') === slug) return c.popupName || c.title;
    }
  }
  return '';
}

// Sur les cartes de l'accueil, la puce devient un lien : elle mène à la
// section preuves de la page projet plutôt qu'à une fenêtre superposée.
function preuvesChipHTML(slug) {
  const list = (typeof preuvesData !== 'undefined') ? preuvesData[slug] : null;
  if (!list || !list.length) return '';
  const n = list.length;
  return `<span class="proj-preuves">
      <span>${n} preuve${n > 1 ? 's' : ''} à l'appui</span>
      <span class="proj-preuves-arrow" aria-hidden="true">→</span>
    </span>`;
}

// Aperçu d'un PDF : même chemin, suffixe -preview.png
function preuvePdfPreview(file) { return file.replace(/\.pdf$/i, '-preview.png'); }

// Une preuve = une figure. Le visuel porte la page, la légende l'explique.
function renderPreuveFigure(p, slug, idx) {
  const isPdf = /\.pdf$/i.test(p.files[0]);
  const many  = p.files.length > 1;

  const visuals = isPdf
    ? `<a class="preuve-frame preuve-frame--pdf" href="${p.files[0]}" target="_blank" rel="noopener noreferrer">
         <img src="${preuvePdfPreview(p.files[0])}" alt="Première page de ${p.name}" loading="lazy" decoding="async" width="1200" height="1600">
         <span class="preuve-badge">PDF</span>
         <span class="preuve-zoom" aria-hidden="true">Ouvrir le document ↗</span>
       </a>`
    : p.files.map((f, i) => `
        <button type="button" class="preuve-frame" data-slug="${slug}" data-pidx="${idx}" data-img="${i}"
                aria-label="Agrandir : ${p.name} (${i + 1} sur ${p.files.length})">
          <img src="${f}" alt="${p.name} — visuel ${i + 1}" loading="lazy" decoding="async" width="1600" height="1000">
          <span class="preuve-zoom" aria-hidden="true">Agrandir ⤢</span>
        </button>`).join('');

  return `
    <figure class="preuve-figure reveal">
      <div class="preuve-visuals${many ? ' preuve-visuals--multi' : ''}">${visuals}</div>
      <figcaption class="preuve-caption">
        <p class="preuve-meta">
          <span>${p.format}</span>
          <span class="preuve-meta-sep" aria-hidden="true">·</span>
          <span class="preuve-comp">${p.competence}</span>
        </p>
        <h3 class="preuve-name">${p.name}</h3>
        <p class="preuve-desc">${p.description}</p>
      </figcaption>
    </figure>`;
}

// Section « Preuves » d'une page projet
function buildPreuvesSection(section) {
  const slug = section.dataset.slug || '';
  const list = (typeof preuvesData !== 'undefined') ? (preuvesData[slug] || []) : [];
  if (!list.length) { section.remove(); return; }
  const n = list.length;
  section.innerHTML = `
    <div class="preuves-head reveal">
      <p class="section-label">Preuves associées</p>
      <h2 class="section-title">${n} preuve${n > 1 ? 's' : ''} à l'appui de ce projet</h2>
      <p class="prose">Le récit ci-dessus s'appuie sur des réalisations concrètes. Elles sont ici en entier, dans l'ordre du projet.</p>
    </div>
    <div class="preuves-list">
      ${list.map((p, i) => renderPreuveFigure(p, slug, i)).join('')}
    </div>`;
}

// Visionneuse plein écran, conservée pour lire une capture en détail
let lightboxState = { files: [], idx: 0, caption: '' };

function getLightbox() {
  let lb = document.getElementById('preuve-lightbox');
  if (lb) return lb;

  lb = document.createElement('div');
  lb.id = 'preuve-lightbox';
  lb.className = 'preuve-lightbox';
  lb.innerHTML = `
    <button class="plb-close" aria-label="Fermer la visionneuse">&times;</button>
    <button class="plb-nav plb-prev" aria-label="Visuel précédent">‹</button>
    <figure class="plb-figure">
      <img class="plb-img" alt="">
      <figcaption class="plb-caption"></figcaption>
    </figure>
    <button class="plb-nav plb-next" aria-label="Visuel suivant">›</button>`;
  document.body.appendChild(lb);

  const close = () => {
    lb.classList.remove('open');
    document.body.style.overflow = '';
  };
  lb.querySelector('.plb-close').addEventListener('click', close);
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  lb.querySelector('.plb-prev').addEventListener('click', () => showLightbox(lightboxState.idx - 1));
  lb.querySelector('.plb-next').addEventListener('click', () => showLightbox(lightboxState.idx + 1));
  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') showLightbox(lightboxState.idx - 1);
    else if (e.key === 'ArrowRight') showLightbox(lightboxState.idx + 1);
  });

  return lb;
}

function showLightbox(i) {
  const lb = getLightbox();
  const { files, caption } = lightboxState;
  const n = files.length;
  if (!n) return;
  lightboxState.idx = (i + n) % n;
  const img = lb.querySelector('.plb-img');
  img.src = files[lightboxState.idx];
  img.alt = `${caption} — visuel ${lightboxState.idx + 1}`;
  lb.querySelector('.plb-caption').textContent = n > 1
    ? `${caption} · ${lightboxState.idx + 1} / ${n}`
    : caption;
  lb.querySelectorAll('.plb-nav').forEach(b => { b.hidden = n < 2; });
}

function openLightbox(files, startIndex, caption) {
  lightboxState = { files: files.slice(), idx: startIndex || 0, caption: caption || '' };
  const lb = getLightbox();
  showLightbox(lightboxState.idx);
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function initPreuvesGlobal() {
  document.addEventListener('click', e => {
    const frame = e.target.closest('.preuve-frame[data-slug]');
    if (!frame) return;
    e.preventDefault();
    const p = (typeof preuvesData !== 'undefined')
      ? (preuvesData[frame.dataset.slug] || [])[+frame.dataset.pidx] : null;
    if (p && p.files && p.files.length) openLightbox(p.files, +frame.dataset.img || 0, p.name);
  });
}

// ============================================
// RETOUR AU NIVEAU DU PROJET (#proj-<slug> sur l'accueil)
// ============================================
function initHashScroll() {
  const hash = window.location.hash;
  if (!hash || hash.indexOf('#proj-') !== 0) return;
  const target = document.getElementById(hash.slice(1));
  if (!target) return;
  // Révèle immédiatement la cible et ses enfants (sinon masqués par l'animation reveal)
  target.classList.add('visible');
  target.querySelectorAll('.reveal, .reveal-l, .reveal-r').forEach(el => el.classList.add('visible'));
  requestAnimationFrame(() => target.scrollIntoView({ block: 'center', behavior: 'auto' }));
}

// ============================================
// FORMULAIRE CONTACT (Web3Forms — envoi sans rechargement)
// ============================================
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const status = form.querySelector('.form-status');
  const btn = form.querySelector('.btn-submit');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const key = (form.querySelector('[name="access_key"]') || {}).value || '';
    if (key.indexOf('VOTRE_CLE') === 0 || !key) {
      status.textContent = "Formulaire pas encore activé (clé Web3Forms manquante).";
      status.className = 'form-status form-status--error';
      return;
    }
    const original = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Envoi…';
    status.textContent = '';
    status.className = 'form-status';

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form)))
      });
      const json = await res.json();
      if (json.success) {
        status.textContent = 'Merci, votre message a bien été envoyé.';
        status.className = 'form-status form-status--ok';
        form.reset();
      } else {
        status.textContent = json.message || 'Une erreur est survenue, réessayez plus tard.';
        status.className = 'form-status form-status--error';
      }
    } catch (err) {
      status.textContent = "Impossible d'envoyer le message. Vérifiez votre connexion et réessayez.";
      status.className = 'form-status form-status--error';
    } finally {
      btn.disabled = false;
      btn.textContent = original;
    }
  });
}

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  buildNav();
  initPageTransition();

  // Index
  const themeContainer = document.getElementById('themes-container');
  if (themeContainer) {
    buildThematiques(themeContainer);
    initSectionCurves();
    setTimeout(initHashScroll, 80); // retour au niveau du projet via #proj-<slug>
  }

  // Contact — formulaire Web3Forms
  initContactForm();

  const notionContainer = document.getElementById('notion-blocks');
  if (notionContainer) buildNotionBlocks(notionContainer);
  initScrollWords();   // mot par mot au scroll sur le titre Notion

  const faqContainer = document.getElementById('faq-list');
  if (faqContainer) buildFAQ(faqContainer);

  // Parcours
  const timelineContainer = document.getElementById('timeline-axis');
  if (timelineContainer) buildTimeline(timelineContainer);

  // Compétences informatiques (cartes flip)
  const skillsContainer = document.getElementById('skills-flip-grid');
  if (skillsContainer) buildSoftwareSkills(skillsContainer);

  // Compétences
  const compContainer = document.getElementById('comp-grid');
  if (compContainer) buildCompetences(compContainer);

  // Pages projet — section « Preuves associées »
  const preuvesSection = document.querySelector('.preuves[data-slug]');
  if (preuvesSection) buildPreuvesSection(preuvesSection);
  initPreuvesGlobal(); // visionneuse — sans effet si aucune preuve sur la page

  // Reveal (après injection du contenu dynamique)
  setTimeout(initReveal, 50);
});
