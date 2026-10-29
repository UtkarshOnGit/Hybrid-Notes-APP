/**
 * Personal Notes App
 * Local persistence, full CRUD, search, category filtering, theme toggle.
 */

(function () {
  'use strict';

  const STORAGE_KEY_NOTES = 'notes_app_data_v2';
  const STORAGE_KEY_THEME = 'notes_app_theme_v2';

  // Single initial note as requested
  const INITIAL_SEED_NOTES = [
    {
      id: 'welcome-note',
      title: 'Hey you can create notes here',
      content: 'Tap the plus button below to create a new note. You can edit, search, categorize, or delete notes anytime.',
      category: 'Personal',
      color: 'slate',
      pinned: false,
      updatedAt: Date.now()
    }
  ];

  // App State
  let notes = [];
  let selectedCategory = 'all';
  let searchQuery = '';
  let activeColor = 'slate';
  let pendingDeleteId = null;

  // DOM Elements
  const notesContainer = document.getElementById('notesContainer');
  const emptyState = document.getElementById('emptyState');
  const emptyTitle = document.getElementById('emptyTitle');
  const emptySubtitle = document.getElementById('emptySubtitle');
  const notesCountText = document.getElementById('notesCountText');
  const searchInput = document.getElementById('searchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const categoryChips = document.getElementById('categoryChips');
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const addNoteFab = document.getElementById('addNoteFab');
  const emptyAddBtn = document.getElementById('emptyAddBtn');

  // Modal Elements
  const noteModal = document.getElementById('noteModal');
  const noteForm = document.getElementById('noteForm');
  const modalTitle = document.getElementById('modalTitle');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const cancelModalBtn = document.getElementById('cancelModalBtn');
  const noteIdInput = document.getElementById('noteId');
  const noteTitleInput = document.getElementById('noteTitleInput');
  const noteContentInput = document.getElementById('noteContentInput');
  const noteCategorySelect = document.getElementById('noteCategorySelect');
  const notePinnedInput = document.getElementById('notePinnedInput');
  const colorPicker = document.getElementById('colorPicker');

  // Delete Modal Elements
  const deleteModal = document.getElementById('deleteModal');
  const deleteNoteTitlePreview = document.getElementById('deleteNoteTitlePreview');
  const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

  // Toast Container
  const toastContainer = document.getElementById('toastContainer');

  function init() {
    loadTheme();
    loadNotes();
    attachEventListeners();
    render();
  }

  function loadNotes() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_NOTES);
      if (stored) {
        notes = JSON.parse(stored);
      } else {
        notes = INITIAL_SEED_NOTES;
        saveNotes();
      }
    } catch (err) {
      console.error(err);
      notes = INITIAL_SEED_NOTES;
    }
  }

  function saveNotes() {
    try {
      localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(notes));
    } catch (err) {
      console.error(err);
      showToast('Storage error');
    }
  }

  function loadTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEY_THEME);
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }

  function setTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY_THEME, theme);
  }

  function toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme') || 'light';
    const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
  }

  function formatDate(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }

  function getFilteredNotes() {
    return notes
      .filter((note) => {
        const matchesCat =
          selectedCategory === 'all' ||
          (note.category && note.category.toLowerCase() === selectedCategory.toLowerCase());

        const q = searchQuery.trim().toLowerCase();
        const matchesQuery =
          !q ||
          (note.title && note.title.toLowerCase().includes(q)) ||
          (note.content && note.content.toLowerCase().includes(q));

        return matchesCat && matchesQuery;
      })
      .sort((a, b) => {
        if (a.pinned !== b.pinned) {
          return b.pinned ? 1 : -1;
        }
        return (b.updatedAt || 0) - (a.updatedAt || 0);
      });
  }

  function render() {
    const filtered = getFilteredNotes();

    const count = filtered.length;
    notesCountText.textContent = `${count} ${count === 1 ? 'note' : 'notes'}`;

    if (filtered.length === 0) {
      notesContainer.innerHTML = '';
      emptyState.classList.remove('hidden');

      if (searchQuery || selectedCategory !== 'all') {
        emptyTitle.textContent = 'No matching notes';
        emptySubtitle.textContent = 'Try another search or filter.';
        emptyAddBtn.classList.add('hidden');
      } else {
        emptyTitle.textContent = 'No notes';
        emptySubtitle.textContent = 'Tap the button below to add your first note.';
        emptyAddBtn.classList.remove('hidden');
      }
      return;
    }

    emptyState.classList.add('hidden');
    notesContainer.innerHTML = '';

    filtered.forEach((note) => {
      const card = document.createElement('article');
      card.className = `note-card color-${note.color || 'slate'} ${note.pinned ? 'pinned' : ''}`;
      card.setAttribute('data-id', note.id);

      // Header row
      const headerRow = document.createElement('div');
      headerRow.className = 'note-header-row';

      const titleEl = document.createElement('h3');
      titleEl.className = 'note-title';
      titleEl.textContent = note.title;

      const topActions = document.createElement('div');
      topActions.className = 'card-top-actions';

      const pinBtn = document.createElement('button');
      pinBtn.className = `pin-btn ${note.pinned ? 'active' : ''}`;
      pinBtn.title = note.pinned ? 'Unpin' : 'Pin';
      pinBtn.setAttribute('aria-label', note.pinned ? 'Unpin' : 'Pin');
      pinBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="${note.pinned ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="17" x2="12" y2="22"></line>
          <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a1 1 0 0 0 0-2H8a1 1 0 0 0 0 2h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"></path>
        </svg>
      `;
      pinBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        togglePinNote(note.id);
      });

      topActions.appendChild(pinBtn);
      headerRow.appendChild(titleEl);
      headerRow.appendChild(topActions);

      // Body text
      const bodyEl = document.createElement('div');
      bodyEl.className = 'note-body';
      bodyEl.textContent = note.content;

      // Footer
      const footerEl = document.createElement('div');
      footerEl.className = 'note-footer';

      const metaLeft = document.createElement('div');
      metaLeft.className = 'note-meta-left';

      const catBadge = document.createElement('span');
      catBadge.className = 'category-badge';
      catBadge.textContent = note.category || 'Personal';

      const dateSpan = document.createElement('span');
      dateSpan.textContent = formatDate(note.updatedAt);

      metaLeft.appendChild(catBadge);
      metaLeft.appendChild(dateSpan);

      const actionsEl = document.createElement('div');
      actionsEl.className = 'note-card-actions';

      const editBtn = document.createElement('button');
      editBtn.className = 'card-action-btn';
      editBtn.title = 'Edit';
      editBtn.setAttribute('aria-label', 'Edit');
      editBtn.innerHTML = `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 20h9"></path>
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
        </svg>
      `;
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openEditModal(note.id);
      });

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'card-action-btn delete-btn';
      deleteBtn.title = 'Delete';
      deleteBtn.setAttribute('aria-label', 'Delete');
      deleteBtn.innerHTML = `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
      `;
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openDeleteModal(note.id);
      });

      actionsEl.appendChild(editBtn);
      actionsEl.appendChild(deleteBtn);

      footerEl.appendChild(metaLeft);
      footerEl.appendChild(actionsEl);

      card.addEventListener('click', () => {
        openEditModal(note.id);
      });

      card.appendChild(headerRow);
      card.appendChild(bodyEl);
      card.appendChild(footerEl);

      notesContainer.appendChild(card);
    });
  }

  // Actions
  function openCreateModal() {
    noteForm.reset();
    noteIdInput.value = '';
    modalTitle.textContent = 'New Note';
    setActiveColor('slate');
    notePinnedInput.checked = false;
    noteModal.classList.remove('hidden');
    setTimeout(() => noteTitleInput.focus(), 120);
  }

  function openEditModal(id) {
    const note = notes.find((n) => n.id === id);
    if (!note) return;

    noteIdInput.value = note.id;
    noteTitleInput.value = note.title;
    noteContentInput.value = note.content;
    noteCategorySelect.value = note.category || 'Personal';
    notePinnedInput.checked = !!note.pinned;
    setActiveColor(note.color || 'slate');

    modalTitle.textContent = 'Edit Note';
    noteModal.classList.remove('hidden');
    setTimeout(() => noteTitleInput.focus(), 120);
  }

  function closeNoteModal() {
    noteModal.classList.add('hidden');
    noteForm.reset();
  }

  function handleSaveNote(e) {
    e.preventDefault();

    const title = noteTitleInput.value.trim();
    const content = noteContentInput.value.trim();
    const category = noteCategorySelect.value;
    const pinned = notePinnedInput.checked;
    const color = activeColor;
    const existingId = noteIdInput.value;

    if (!title) {
      noteTitleInput.focus();
      return;
    }

    if (existingId) {
      const index = notes.findIndex((n) => n.id === existingId);
      if (index !== -1) {
        notes[index] = {
          ...notes[index],
          title,
          content,
          category,
          pinned,
          color,
          updatedAt: Date.now()
        };
        showToast('Note updated');
      }
    } else {
      const newNote = {
        id: 'note_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        title,
        content,
        category,
        pinned,
        color,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      notes.unshift(newNote);
      showToast('Note saved');
    }

    saveNotes();
    closeNoteModal();
    render();
  }

  function togglePinNote(id) {
    const note = notes.find((n) => n.id === id);
    if (!note) return;

    note.pinned = !note.pinned;
    note.updatedAt = Date.now();
    saveNotes();
    render();
    showToast(note.pinned ? 'Note pinned' : 'Note unpinned');
  }

  function openDeleteModal(id) {
    const note = notes.find((n) => n.id === id);
    if (!note) return;

    pendingDeleteId = id;
    deleteNoteTitlePreview.textContent = note.title;
    deleteModal.classList.remove('hidden');
  }

  function closeDeleteModal() {
    pendingDeleteId = null;
    deleteModal.classList.add('hidden');
  }

  function handleConfirmDelete() {
    if (!pendingDeleteId) return;

    notes = notes.filter((n) => n.id !== pendingDeleteId);
    saveNotes();
    closeDeleteModal();
    render();
    showToast('Note deleted');
  }

  function setActiveColor(color) {
    activeColor = color;
    const dots = colorPicker.querySelectorAll('.color-dot');
    dots.forEach((dot) => {
      if (dot.getAttribute('data-color') === color) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }

  function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 2200);
  }

  function attachEventListeners() {
    themeToggleBtn.addEventListener('click', toggleTheme);

    addNoteFab.addEventListener('click', openCreateModal);
    emptyAddBtn.addEventListener('click', openCreateModal);

    noteForm.addEventListener('submit', handleSaveNote);
    closeModalBtn.addEventListener('click', closeNoteModal);
    cancelModalBtn.addEventListener('click', closeNoteModal);

    noteModal.addEventListener('click', (e) => {
      if (e.target === noteModal) closeNoteModal();
    });

    cancelDeleteBtn.addEventListener('click', closeDeleteModal);
    confirmDeleteBtn.addEventListener('click', handleConfirmDelete);
    deleteModal.addEventListener('click', (e) => {
      if (e.target === deleteModal) closeDeleteModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (!noteModal.classList.contains('hidden')) closeNoteModal();
        if (!deleteModal.classList.contains('hidden')) closeDeleteModal();
      }
    });

    colorPicker.addEventListener('click', (e) => {
      const dot = e.target.closest('.color-dot');
      if (dot) {
        const color = dot.getAttribute('data-color');
        if (color) setActiveColor(color);
      }
    });

    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      if (searchQuery.trim().length > 0) {
        clearSearchBtn.classList.remove('hidden');
      } else {
        clearSearchBtn.classList.add('hidden');
      }
      render();
    });

    clearSearchBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchQuery = '';
      clearSearchBtn.classList.add('hidden');
      searchInput.focus();
      render();
    });

    categoryChips.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (!chip) return;

      categoryChips.querySelectorAll('.chip').forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');

      selectedCategory = chip.getAttribute('data-category') || 'all';
      render();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
