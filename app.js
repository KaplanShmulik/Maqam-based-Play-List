fetch('pieces.csv')
  .then(res => res.text())
  .then(text => {
    const lines = text.trim().split('\n');
    const headers = lines.shift().split(',');
    const tbody = document.querySelector('#musicTable tbody');

    lines.forEach(line => {
      const row = {};
      line.split(',').forEach((v, i) => row[headers[i]] = v);

      const base = row.base_path;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${row.title}</td>
        <td>${row.composer}</td>
        <td>${row.performer}</td>
        <td>${row.maqam}</td>
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
  });
