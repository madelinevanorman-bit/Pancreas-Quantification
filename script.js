// Fetch events.json and render a simple starred repositories list
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('starred-list');
  const loading = document.createElement('div');
  loading.className = 'small';
  loading.textContent = 'Loading starred repositories…';
  container.appendChild(loading);

  fetchEvents()
    .then(renderList)
    .catch(err => {
      console.error(err);
      container.innerHTML = '';
      const errEl = document.createElement('div');
      errEl.className = 'small';
      errEl.textContent = 'Failed to load starred repositories.';
      container.appendChild(errEl);
    });
});

async function fetchEvents() {
  const res = await fetch('events.json', {cache: 'no-store'});
  if (!res.ok) throw new Error('Network response was not ok: ' + res.status);
  const data = await res.json();
  // Expecting an array of repo objects
  if (!Array.isArray(data)) throw new Error('Invalid events.json format');
  return data;
}

function renderList(repos) {
  const container = document.getElementById('starred-list');
  container.innerHTML = '';

  if (!repos.length) {
    container.textContent = 'No starred repositories found.';
    return;
  }

  // Sort by starred_at (newest first) if available
  repos.sort((a, b) => {
    const da = a.starred_at ? new Date(a.starred_at) : new Date(0);
    const db = b.starred_at ? new Date(b.starred_at) : new Date(0);
    return db - da;
  });

  const ul = document.createElement('ul');
  ul.className = 'starred-list';

  repos.forEach(r => {
    const li = document.createElement('li');
    li.className = 'repo';

    const avatar = document.createElement('img');
    avatar.className = 'avatar';
    avatar.src = r.owner_avatar_url || '';
    avatar.alt = `${r.owner} avatar`;

    const main = document.createElement('div');
    main.className = 'repo-main';

    const title = document.createElement('a');
    title.className = 'repo-title';
    title.href = r.html_url || '#';
    title.textContent = `${r.owner}/${r.name}`;
    title.target = '_blank';
    title.rel = 'noopener noreferrer';

    const desc = document.createElement('div');
    desc.className = 'repo-desc';
    desc.textContent = r.description || '';

    const meta = document.createElement('div');
    meta.className = 'repo-meta';

    const lang = document.createElement('div');
    lang.textContent = r.language ? r.language : '—';
    const stars = document.createElement('div');
    stars.textContent = `★ ${r.stargazers_count ?? 0}`;
    const when = document.createElement('div');
    if (r.starred_at) {
      const d = new Date(r.starred_at);
      when.textContent = `starred ${formatRelativeDate(d)}`;
    }

    meta.appendChild(lang);
    meta.appendChild(stars);
    if (when.textContent) meta.appendChild(when);

    main.appendChild(title);
    if (r.description) main.appendChild(desc);
    main.appendChild(meta);

    li.appendChild(avatar);
    li.appendChild(main);
    ul.appendChild(li);
  });

  container.appendChild(ul);
}

function formatRelativeDate(d) {
  try {
    const now = new Date();
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 7 * 86400) return `${Math.floor(diff / 86400)}d ago`;
    return d.toLocaleDateString();
  } catch {
    return d.toISOString();
  }
}
