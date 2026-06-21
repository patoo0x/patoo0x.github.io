/* ═══════════════════════════════════════
   Patoo Ventures Dashboard — JavaScript
   Vanilla, no dependencies
   ═══════════════════════════════════════ */

let allVentures = [];
let currentPath = 'all';
let currentFilter = 'all';
let currentSort = 'recent';
let currentView = 'grid';
let lastDetailsTrigger = null;

const statusIcons = { idea: '○', assessed: '◎', building: '⚙', live: '✓', dead: '✗', released: '✓', deprecated: '✗' };
const statusOrder = { idea: 0, assessed: 1, building: 2, live: 3, released: 3, dead: 4, deprecated: 4 };
const developedOrder = { live: 0, released: 0, building: 1, assessed: 2, idea: 3, dead: 4, deprecated: 4 };
const shippedStatuses = new Set(['live', 'released']);
const activeStatuses = new Set(['idea', 'assessed', 'building']);
const parkedStatuses = new Set(['dead', 'deprecated']);
const decisionStatuses = new Set(['assessed', 'idea']);

// Which statuses belong to which path
const pathStatuses = {
  all: ['idea', 'assessed', 'building', 'live', 'dead', 'released', 'deprecated'],
  venture: ['idea', 'assessed', 'building', 'live', 'dead'],
  'open-source': ['idea', 'assessed', 'building', 'released', 'deprecated'],
};

// ── Init ─────────────────────────

document.addEventListener('DOMContentLoaded', init);

async function init() {
  // Check URL hash for initial path or filter
  const hash = window.location.hash.replace('#', '');
  if (['venture', 'open-source'].includes(hash)) {
    currentPath = hash;
  } else if (['idea', 'assessed', 'building', 'live', 'dead', 'released', 'deprecated'].includes(hash)) {
    currentFilter = hash;
  }

  await loadVentures();
  setupEventListeners();
  syncFilterButtons();
  filterAndRender();
}

// ── Load Data ────────────────────

async function loadVentures() {
  try {
    const res = await fetch('/ideas.json');
    const data = await res.json();
    allVentures = data.ventures || [];
  } catch (err) {
    console.error('Failed to load ventures:', err);
    allVentures = [];
  }
}

// ── Event Listeners ──────────────

function setupEventListeners() {
  // Path filter buttons
  document.querySelectorAll('.path-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setPathFilter(btn.dataset.path);
    });
  });

  // Status filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setFilter(btn.dataset.filter);
    });
  });

  // Sort select
  document.getElementById('sort-select').addEventListener('change', (e) => {
    currentSort = e.target.value;
    filterAndRender();
  });

  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentView = btn.dataset.view;
      document.querySelectorAll('.view-btn').forEach(viewBtn => {
        viewBtn.classList.toggle('active', viewBtn.dataset.view === currentView);
      });
      filterAndRender();
    });
  });

  document.getElementById('reset-filters').addEventListener('click', resetFilters);
  document.getElementById('ventures-grid').addEventListener('click', (event) => {
    const trigger = event.target.closest('.details-button');
    if (!trigger) return;
    const venture = allVentures.find(v => v.slug === trigger.dataset.slug);
    if (!venture) return;
    lastDetailsTrigger = trigger;
    openDetailsModal(venture);
  });

  document.getElementById('modal-close').addEventListener('click', closeDetailsModal);
  document.getElementById('modal-backdrop').addEventListener('click', closeDetailsModal);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeDetailsModal();
  });

  // URL hash changes
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '');
    if (['venture', 'open-source'].includes(hash)) {
      setPathFilter(hash);
    } else if (['idea', 'assessed', 'building', 'live', 'dead', 'released', 'deprecated', 'all'].includes(hash)) {
      setFilter(hash);
    }
  });
}

// ── Path Filter ──────────────────

function setPathFilter(path) {
  currentPath = path;
  currentFilter = 'all';

  // Update path button active state
  document.querySelectorAll('.path-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.path === path);
  });

  syncFilterButtons();
  window.location.hash = path === 'all' ? '' : path;
  filterAndRender();
}

function resetFilters() {
  currentPath = 'all';
  currentFilter = 'all';
  currentSort = 'recent';

  document.querySelectorAll('.path-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.path === 'all');
  });
  document.getElementById('sort-select').value = currentSort;

  syncFilterButtons();
  window.location.hash = '';
  filterAndRender();
}

function syncFilterButtons() {
  const visible = pathStatuses[currentPath] || pathStatuses.all;

  document.querySelectorAll('.filter-btn').forEach(btn => {
    const f = btn.dataset.filter;
    if (f === 'all') {
      btn.hidden = false;
    } else {
      btn.hidden = !visible.includes(f);
    }
  });

  // Mark "all" as active when path resets filter
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === currentFilter);
  });
}

// ── Filter State ─────────────────

function setFilter(filter) {
  currentFilter = filter;

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });

  window.location.hash = filter === 'all' ? currentPath : filter;
  filterAndRender();
}

// ── Filter + Sort + Render ───────

function filterAndRender() {
  let filtered = allVentures;

  // Apply path filter
  if (currentPath !== 'all') {
    filtered = filtered.filter(v => v.path === currentPath);
  }

  // Apply status filter
  if (currentFilter !== 'all') {
    filtered = filtered.filter(v => v.status === currentFilter);
  }

  // Sort
  const sortFns = {
    decision: (a, b) => scoreDecision(a) - scoreDecision(b),
    developed: (a, b) => (developedOrder[a.status] ?? 9) - (developedOrder[b.status] ?? 9),
    recent: (a, b) => (b.lastUpdated || b.created).localeCompare(a.lastUpdated || a.created),
    shipped: (a, b) => scoreShipped(a) - scoreShipped(b),
    title: (a, b) => a.title.localeCompare(b.title),
  };
  filtered.sort(sortFns[currentSort] || sortFns.recent);

  renderGrid(filtered);
  updateCounts();
}

// ── Render ───────────────────────

function renderGrid(ventures) {
  const grid = document.getElementById('ventures-grid');

  if (ventures.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">🔥</span>
        <h3>Nothing here yet</h3>
        <p>First entry goes here when an idea gets committed.</p>
      </div>
    `;
    return;
  }

  const viewClass = currentView === 'list' ? 'list' : 'grid';
  grid.innerHTML = `<div class="${viewClass}">${ventures.map(v => renderCard(v)).join('')}</div>`;
}

function renderCard(v) {
  const icon = statusIcons[v.status] || '○';
  const pathLabel = v.path === 'open-source' ? '🧩' : '💰';
  const tags = v.tags && v.tags.length
    ? `<div class="card-tags">${v.tags.map(t => `<span>${escapeHtml(t)}</span>`).join('')}</div>`
    : '';
  const link = v.link
    ? `<a class="card-action" href="${escapeHtml(v.link)}" target="_blank" rel="noopener">Open</a>`
    : '';
  const date = v.lastUpdated || v.created;
  const decisionMarker = decisionStatuses.has(v.status) ? '<span class="decision-marker">Decision</span>' : '';

  const imgSrc = v.cardImage || v.image || '';
  const imageHtml = imgSrc ? `<div class="card-image"><img src="${escapeHtml(imgSrc)}" alt="${escapeHtml(v.title)}" loading="lazy"></div>` : '';

  const isTerminalDead = v.status === 'dead' || v.status === 'deprecated';
  const isReleased = v.status === 'released' || v.status === 'live';

  let extras = '';

  if (isTerminalDead && v.killReason) {
    const killLabel = v.status === 'deprecated' ? 'Why deprecated' : 'Why it died';
    extras += `
      <details class="card-kill-reason">
        <summary>${killLabel}</summary>
        <p>${escapeHtml(v.killReason)}</p>
        ${v.lessons ? `<p class="card-lessons"><strong>Lessons:</strong> ${escapeHtml(v.lessons)}</p>` : ''}
      </details>
    `;
  } else if (isReleased && v.lessons) {
    extras += `
      <details class="card-lessons">
        <summary>Lessons</summary>
        <p>${escapeHtml(v.lessons)}</p>
      </details>
    `;
  } else if (!isTerminalDead && !isReleased && v.lessons) {
    extras += `
      <details class="card-lessons">
        <summary>Notes</summary>
        <p>${escapeHtml(v.lessons)}</p>
      </details>
    `;
  }

  return `
    <div class="venture-card path-${v.path}" data-status="${v.status}" data-path="${v.path}" data-created="${v.created}">
      ${imageHtml}
      <div class="card-content">
      <div class="card-header-row">
        <span class="card-path-badge path-${v.path}">${pathLabel}</span>
        <div class="card-badge badge-${v.status}">${icon} ${v.status}</div>
      </div>
      <h3 class="card-title">${escapeHtml(v.title)}</h3>
      ${v.tagline ? `<p class="card-tagline">${escapeHtml(v.tagline)}</p>` : ''}
      ${tags}
      <div class="card-footer">
        <span class="card-date">${date}</span>
        <div class="card-footer-actions">
          ${decisionMarker}
          <button class="details-button" type="button" data-slug="${escapeHtml(v.slug)}">Details</button>
          ${link}
        </div>
      </div>
      ${extras}
      </div>
    </div>
  `;
}

// ── Update Filter Counts ─────────

function updateCounts() {
  const pool = currentPath === 'all' ? allVentures : allVentures.filter(v => v.path === currentPath);
  const allStatuses = ['idea', 'assessed', 'building', 'live', 'dead', 'released', 'deprecated'];

  document.getElementById('count-all').textContent = pool.length;
  allStatuses.forEach(status => {
    const count = pool.filter(v => v.status === status).length;
    const el = document.getElementById(`count-${status}`);
    if (el) el.textContent = count;
  });

  document.getElementById('stat-total').textContent = pool.length;
  document.getElementById('stat-active').textContent = pool.filter(v => activeStatuses.has(v.status)).length;
  document.getElementById('stat-decision').textContent = pool.filter(v => decisionStatuses.has(v.status)).length;
  document.getElementById('stat-shipped').textContent = pool.filter(v => shippedStatuses.has(v.status)).length;
  document.getElementById('stat-parked').textContent = pool.filter(v => parkedStatuses.has(v.status)).length;
}

// ── Details Modal ────────────────

function openDetailsModal(v) {
  const modal = document.getElementById('details-modal');
  const icon = statusIcons[v.status] || '○';
  const pathLabel = v.path === 'open-source' ? '🧩 Commons' : '💰 Venture';
  const imgSrc = v.cardImage || v.image || '';
  const modalImage = document.getElementById('modal-image');
  const modalPath = document.getElementById('modal-path');
  const modalStatus = document.getElementById('modal-status');
  const modalLink = document.getElementById('modal-link');
  const modalExtra = document.getElementById('modal-extra');
  const modalTags = document.getElementById('modal-tags');

  if (imgSrc) {
    modalImage.hidden = false;
    modalImage.innerHTML = `<img src="${escapeHtml(imgSrc)}" alt="${escapeHtml(v.title)}">`;
  } else {
    modalImage.hidden = true;
    modalImage.innerHTML = '';
  }

  modalPath.className = `card-path-badge path-${v.path}`;
  modalPath.textContent = pathLabel;
  modalStatus.className = `card-badge badge-${v.status}`;
  modalStatus.textContent = `${icon} ${v.status}`;

  document.getElementById('modal-title').textContent = v.title || '';
  document.getElementById('modal-tagline').textContent = v.tagline || '';
  document.getElementById('modal-description').textContent = v.description || '';
  document.getElementById('modal-date').textContent = v.lastUpdated || v.created || '';

  modalTags.innerHTML = v.tags && v.tags.length
    ? v.tags.map(tag => `<span>${escapeHtml(tag)}</span>`).join('')
    : '';

  const extraBlocks = [];
  if ((v.status === 'dead' || v.status === 'deprecated') && v.killReason) {
    extraBlocks.push(`<p><strong>${v.status === 'deprecated' ? 'Why deprecated' : 'Why it died'}:</strong> ${escapeHtml(v.killReason)}</p>`);
  }
  if (v.lessons) {
    extraBlocks.push(`<p><strong>${v.status === 'live' || v.status === 'released' ? 'Lessons' : 'Notes'}:</strong> ${escapeHtml(v.lessons)}</p>`);
  }
  modalExtra.innerHTML = extraBlocks.join('');

  if (v.link) {
    modalLink.hidden = false;
    modalLink.href = v.link;
  } else {
    modalLink.hidden = true;
    modalLink.removeAttribute('href');
  }

  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  document.getElementById('modal-close').focus();
}

function closeDetailsModal() {
  const modal = document.getElementById('details-modal');
  if (!modal.classList.contains('open')) return;

  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');

  if (lastDetailsTrigger && document.contains(lastDetailsTrigger)) {
    lastDetailsTrigger.focus();
  }
}

// ── Utils ────────────────────────

function scoreDecision(v) {
  const base = decisionStatuses.has(v.status) ? 0 : 10;
  return base + (statusOrder[v.status] ?? 9);
}

function scoreShipped(v) {
  const base = shippedStatuses.has(v.status) ? 0 : 10;
  return base + (statusOrder[v.status] ?? 9);
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
