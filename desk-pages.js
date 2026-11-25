const entries = window.deskEntries;

for (const list of document.querySelectorAll('[data-entries]')) {
  if (!Array.isArray(entries)) {
    list.textContent = 'Entries could not be loaded.';
    continue;
  }
  const matches = entries.filter(entry => entry.group === list.dataset.entries);
  if (!matches.length) continue;
  list.replaceChildren();
  for (const entry of matches) {
    const article = document.createElement('article');
    article.className = 'desk-entry';
    const heading = document.createElement('h3');
    heading.textContent = entry.title;
    heading.dir = 'auto';
    const text = document.createElement('p');
    text.textContent = entry.body;
    text.dir = 'auto';
    article.append(heading, text);
    list.append(article);
  }
}

const editor = document.querySelector('#desk-edit');
if (editor) {
  const status = document.querySelector('#edit-status');
  if (Array.isArray(entries)) {
    const list = document.querySelector('#edit-entries');
    const fields = document.querySelector('#entry-fields');
    const add = document.querySelector('#add-entry');
    const warnBeforeLeaving = event => event.preventDefault();
    const markChanged = () => {
      status.textContent = '';
      window.addEventListener('beforeunload', warnBeforeLeaving);
    };

    function addEntry(entry) {
      const row = fields.content.firstElementChild.cloneNode(true);
      row.querySelector('[name=group]').value = entry.group;
      row.querySelector('[name=title]').value = entry.title;
      row.querySelector('[name=body]').value = entry.body;
      row.querySelector('.remove-entry').addEventListener('click', () => {
        const next = row.nextElementSibling || row.previousElementSibling;
        row.remove();
        (next?.querySelector('[name=title]') || add).focus();
        markChanged();
      });
      list.append(row);
      return row;
    }

    for (const entry of entries) addEntry(entry);
    editor.hidden = false;
    editor.addEventListener('input', markChanged);
    add.addEventListener('click', () => {
      addEntry({group:'notebook', title:'', body:''}).querySelector('[name=title]').focus();
      markChanged();
    });
    editor.addEventListener('submit', event => {
      event.preventDefault();
      const updated = [];
      for (const row of list.children) {
        const group = row.querySelector('[name=group]').value;
        const title = row.querySelector('[name=title]');
        const body = row.querySelector('[name=body]');
        if (!title.value.trim() || !body.value.trim()) {
          status.textContent = 'Enter a title and text for each entry.';
          (!title.value.trim() ? title : body).focus();
          return;
        }
        updated.push({group, title:title.value.trim(), body:body.value.trim()});
      }
      const source = 'window.deskEntries = ' + JSON.stringify(updated, null, 2) + ';\n';
      const url = URL.createObjectURL(new Blob([source], {type:'text/javascript;charset=utf-8'}));
      const download = document.createElement('a');
      download.href = url;
      download.download = 'desk-content.js';
      download.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      window.removeEventListener('beforeunload', warnBeforeLeaving);
      status.textContent = 'Replace the existing desk-content.js with the downloaded file.';
    });
  } else {
    status.textContent = 'Entries could not be loaded. Check that desk-content.js is next to this page.';
  }
}
