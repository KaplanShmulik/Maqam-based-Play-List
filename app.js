let allRows = [];
let sortStack = []; // supports stable multi-level sorting

function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = lines.shift().split(',');

  return lines.map((line, idx) => {
    const obj = { __index: idx };
    line.split(',').forEach((v, i) => obj[headers[i]] = v);
    return obj;
  });
}

function stableSort(rows) {
  if (sortStack.length === 0) return rows;

  return rows.slice().sort((a, b) => {
    for (const { field, asc } of sortStack) {
      const va = (a[field] || '').trim();
      const vb = (b[field] || '').trim();
      const cmp = va.localeCompare(vb, 'he');
      if (cmp !== 0) return asc ? cmp : -cmp;
    }
    return a.__index - b.__index; // stability guarantee
  });
}

function renderTable() {
  const tbody = document.querySelector('#musicTable tbody');
  tbody.innerHTML = '';

  const rows = stableSort(allRows);

  rows.forEach(row => {
    const base = row.base_path;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${row.maqam}</td>
      <td>${row.title}</td>
      <td>${row.composer}</td>
      <td>${row.performer}</td>
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

function setupSorting() {
  document.querySelectorAll('th[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
      const field = th.dataset.sort;
      const existing = sortStack.find(s => s.field === field);

      if (existing) {
        existing.asc = !existing.asc;
      } else {
        sortStack.push({ field, asc: true });
      }

      renderTable();
    });
  });
}

fetch('pieces.csv')
  .then(res => res.text())
  .then(text => {
    allRows = parseCSV(text);
    setupSorting();
    renderTable();
  });
