let currentRows = [];
let currentSort = { field: null, asc: true };
let currentlyPlaying = null;

function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = lines.shift().split(',').map(h => h.trim());

  return lines.map(line => {
    const values = line.split(',');
    const obj = {};
    headers.forEach((h, i) => obj[h] = values[i] || '');
    return obj;
  });
}

function emptyCell() {
  return '<span></span>';
}

function checkExistsAndReplace(id, path) {
  fetch(path, { method: 'HEAD' })
    .then(res => {
      if (!res.ok) {
        const el = document.getElementById(id);
        if (el) el.replaceWith(document.createElement('span'));
      }
    })
    .catch(() => {
      const el = document.getElementById(id);
      if (el) el.replaceWith(document.createElement('span'));
    });
}

function mp3Cell(base) {
  if (!base) return emptyCell();
  const playId = 'play_' + Math.random().toString(36).slice(2);
  const audioId = 'audio_' + Math.random().toString(36).slice(2);
  const mp3Path = base + '/audio.mp3';

  setTimeout(() => checkExistsAndReplace(playId, mp3Path), 0);

  return `
    <button id="${playId}" class="play-btn" onclick="playPause('${audioId}', this)">▶</button>
    <audio id="${audioId}" src="${mp3Path}"></audio>
  `;
}

function fileLinkCell(base, filename, label, download=false) {
  if (!base) return emptyCell();
  const id = 'link_' + Math.random().toString(36).slice(2);
  const path = base + '/' + filename;
  const attrs = download ? ' download' : ' target="_blank"';
  setTimeout(() => checkExistsAndReplace(id, path), 0);
  return `<a id="${id}" href="${path}"${attrs}>${label}</a>`;
}

function playPause(audioId, btn) {
  const audio = document.getElementById(audioId);
  if (!audio) return;

  if (currentlyPlaying && currentlyPlaying !== audio) {
    currentlyPlaying.pause();
    document.querySelectorAll('.play-btn').forEach(b => b.textContent = '▶');
  }

  if (audio.paused) {
    audio.play();
    btn.textContent = '❚❚';
    currentlyPlaying = audio;
  } else {
    audio.pause();
    btn.textContent = '▶';
  }

  audio.onended = () => {
    btn.textContent = '▶';
    if (currentlyPlaying === audio) currentlyPlaying = null;
  };
}

function renderTable() {
  const tbody = document.querySelector('#musicTable tbody');
  tbody.innerHTML = '';

  currentRows.forEach(row => {
    const base = row.base_path;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${row.maqam || ''}</td>
      <td>${row.title || ''}</td>
      <td>${row.composer || ''}</td>
      <td>${row.performer || ''}</td>
      <td>${mp3Cell(base)}</td>
      <td>${fileLinkCell(base, 'score.pdf', 'PDF')}</td>
      <td>${fileLinkCell(base, 'video.mp4', 'וידאו')}</td>
      <td>${fileLinkCell(base, 'source.mscz', 'MuseScore', true)}</td>
      <td>
        ${row.youtube ? `<a href="${row.youtube}" target="_blank">YouTube</a>` : emptyCell()}
        ${row.spotify ? `<a href="${row.spotify}" target="_blank">Spotify</a>` : emptyCell()}
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function sortBy(field, asc) {
  currentRows.sort((a, b) => {
    const va = (a[field] || '').trim();
    const vb = (b[field] || '').trim();
    const cmp = va.localeCompare(vb, 'he');
    return asc ? cmp : -cmp;
  });
}

function setupSorting() {
  document.querySelectorAll('th[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
      const field = th.dataset.sort;

      if (currentSort.field === field) {
        currentSort.asc = !currentSort.asc;
      } else {
        currentSort.field = field;
        currentSort.asc = true;
      }

      sortBy(currentSort.field, currentSort.asc);
      renderTable();
    });
  });
}

fetch('pieces.csv')
  .then(res => res.text())
  .then(text => {
    currentRows = parseCSV(text);
    setupSorting();
    renderTable();
  });
