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

function renderTable() {
  const tbody = document.querySelector('#musicTable tbody');
  tbody.innerHTML = '';

  currentRows.forEach((row, rowIdx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${row.maqam || ''}</td>
      <td>${row.title || ''}</td>
      <td>${row.composer || ''}</td>
      <td>${row.performer || ''}</td>
      <td id="mp3-${rowIdx}"></td>
      <td id="pdf-${rowIdx}"></td>
      <td id="video-${rowIdx}"></td>
      <td id="ms-${rowIdx}"></td>
      <td>
        ${row.youtube ? `<a href="${row.youtube}" target="_blank">YouTube</a>` : ''}
        ${row.spotify ? `<a href="${row.spotify}" target="_blank">Spotify</a>` : ''}
      </td>
    `;
    tbody.appendChild(tr);

    if (row.base_path) {
      maybeAddMp3(rowIdx, row.base_path);
      maybeAddFile(rowIdx, row.base_path, 'score.pdf', 'PDF', 'pdf');
      maybeAddFile(rowIdx, row.base_path, 'video.mp4', 'וידאו', 'video');
      maybeAddFile(rowIdx, row.base_path, 'source.mscz', 'MuseScore', 'ms', true);
    }
  });
}

function maybeAddMp3(rowIdx, base) {
  const path = base + '/audio.mp3';
  fetch(path, { method: 'HEAD' }).then(res => {
    if (!res.ok) return;
    const cell = document.getElementById(`mp3-${rowIdx}`);
    if (!cell) return;

    const audioId = `audio-${rowIdx}`;
    cell.innerHTML = `
      <button class="play-btn" onclick="playPause('${audioId}', this)">▶</button>
      <a href="${path}" download>MP3</a>
      <audio id="${audioId}" src="${path}"></audio>
    `;
  });
}

function maybeAddFile(rowIdx, base, filename, label, prefix, download=false) {
  const path = base + '/' + filename;
  fetch(path, { method: 'HEAD' }).then(res => {
    if (!res.ok) return;
    const cell = document.getElementById(`${prefix}-${rowIdx}`);
    if (!cell) return;
    const attrs = download ? ' download' : ' target="_blank"';
    cell.innerHTML = `<a href="${path}"${attrs}>${label}</a>`;
  });
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

function sortBy(field, asc) {
  currentRows.sort((a, b) => {
    const va = (a[field] || '').trim();
    const vb = (b[field] || '').trim();
    const cmp = va.localeCompare(vb, 'he');
    return asc ? cmp : -cmp;
  });
  renderTable();
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
