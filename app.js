let currentRows = [];
let currentSort = { field: null, asc: true };

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

  currentRows.forEach(row => {
    const base = row.base_path;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${row.maqam || ''}</td>
      <td>${row.title || ''}</td>
      <td>${row.composer || ''}</td>
      <td>${row.performer || ''}</td>
      <td>
        ${row.youtube ? `<a href="${row.youtube}" target="_blank">YouTube</a>` : ''}
        ${row.spotify ? `<a href="${row.spotify}" target="_blank">Spotify</a>` : ''}
      </td>
      <td>
        <a href="${base}/audio.mp3" download>MP3</a>
        <a href="${base}/score.pdf" target="_blank">PDF</a>
        <a href="${base}/video.mp4" target="_blank">וידאו</a>
        <a href="${base}/source.mscz" download>MuseScore</a>
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
