/* ═══════════════════════════════════════
   Patoo Ventures Dashboard — JavaScript
   Vanilla, no dependencies
   ═══════════════════════════════════════ */

let allVentures = [];
let currentFilter = 'all';
let currentSort = 'recent';

const statusIcons = { idea: '○', assessed: '◎', building: '⚙', live: '✓', dead: '✗' };
const statusOrder = { idea: 0, assessed: 1, building: 2, live: 3, dead: 4 };

// ── Init ─────────────────────────

document.addEventListener('DOMContentLoaded', init);

async function init() {
  // Check URL hash for initial filter
  const hash = window.location.hash.replace('#', '');
  if (['idea', 'assessed', 'building', 'live', 'dead'].includes(hash)) {
    currentFilter = hash;
  }

  await loadVentures();
  setupEventListeners();
  filterAndRender();
}

// ── Load Data ────────────────────

async function loadVentures() {
  try {
    const res = await fetch('/ventures.json');
    const data = await res.json();
    allVentures = data.ventures || [];
  } catch (err) {
    console.error('Failed to load ventures:', err);
    allVentures = [];
  }
}

// ── Event Listeners ──────────────

function setupEventListeners() {
  // Filter buttons
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

  // URL hash changes
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '');
    if (['idea', 'assessed', 'building', 'live', 'dead'].includes(hash)) {
      setFilter(hash);
    }
  });
}

// ── Filter State ─────────────────

function setFilter(filter) {
  currentFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });
  window.location.hash = filter === 'all' ? '' : filter;
  filterAndRender();
}

// ── Filter + Sort + Render ───────

function filterAndRender() {
  let filtered = allVentures;

  if (currentFilter !== 'all') {
    filtered = allVentures.filter(v => v.status === currentFilter);
  }

  // Sort
  const sortFns = {
    status: (a, b) => statusOrder[a.status] - statusOrder[b.status],
    recent: (a, b) => (b.lastUpdated || b.created).localeCompare(a.lastUpdated || a.created),
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
        <h3>No ventures yet</h3>
        <p>First experiment goes here when we commit to it.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = ventures.map(v => renderCard(v)).join('');
}

function renderCard(v) {
  const icon = statusIcons[v.status] || '○';
  const tags = v.tags && v.tags.length
    ? `<div class="card-tags">${v.tags.map(t => `<span>${escapeHtml(t)}</span>`).join('')}</div>`
    : '';
  const link = v.link
    ? `<a href="${escapeHtml(v.link)}" target="_blank" rel="noopener">→ Open</a>`
    : '';
  const date = v.lastUpdated || v.created;

  let extras = '';

  if (v.status === 'dead' && v.killReason) {
    extras += `
      <details class="card-kill-reason">
        <summary>Why it died</summary>
        <p>${escapeHtml(v.killReason)}</p>
        ${v.lessons ? `<p class="card-lessons"><strong>Lessons:</strong> ${escapeHtml(v.lessons)}</p>` : ''}
      </details>
    `;
  } else if (v.status === 'live' && v.lessons) {
    extras += `
      <details class="card-lessons">
        <summary>Lessons</summary>
        <p>${escapeHtml(v.lessons)}</p>
      </details>
    `;
  } else if (v.status !== 'dead' && v.status !== 'live' && v.lessons) {
    extras += `
      <details class="card-lessons">
        <summary>Notes</summary>
        <p>${escapeHtml(v.lessons)}</p>
      </details>
    `;
  }

  return `
    <div class="venture-card" data-status="${v.status}" data-created="${v.created}">
      <div class="card-badge badge-${v.status}">${icon} ${v.status}</div>
      <h3 class="card-title">${escapeHtml(v.title)}</h3>
      ${v.tagline ? `<p class="card-tagline">${escapeHtml(v.tagline)}</p>` : ''}
      <p class="card-body">${escapeHtml(v.description)}</p>
      ${tags}
      <div class="card-footer">
        <span class="card-date">${date}</span>
        ${link}
      </div>
      ${extras}
    </div>
  `;
}

// ── Update Filter Counts ─────────

function updateCounts() {
  document.getElementById('count-all').textContent = allVentures.length;
  ['idea', 'assessed', 'building', 'live', 'dead'].forEach(status => {
    const count = allVentures.filter(v => v.status === status).length;
    const el = document.getElementById(`count-${status}`);
    if (el) el.textContent = count;
  });
}

// ── Utils ────────────────────────

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
