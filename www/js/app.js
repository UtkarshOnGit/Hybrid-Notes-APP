/**
 * NoteFlow - Modern Hybrid Mobile Notes App Logic
 * Features: Complete CRUD, LocalStorage Persistence, Search, Filtering, Dark Theme
 */

(function () {
  'use strict';

  // --- Constants & Storage Keys ---
  const STORAGE_KEY_NOTES = 'noteflow_notes_v1';
  const STORAGE_KEY_THEME = 'noteflow_theme_v1';

  // Seed data for initial demo
  const INITIAL_SEED_NOTES = [
    {
      id: 'demo-1',
      title: '🚀 Welcome to NoteFlow!',
      content: 'NoteFlow is a hybrid notes app built with modern web standards and packaged for Android using Capacitor.\n\n• Works completely offline with local storage.\n• Tap the pencil icon to edit this note.\n• Tap the pin to keep important notes on top.',
      category: 'Work',
      color: 'indigo',
      pinned: true,
      updatedAt: Date.now() - 1000 * 60 * 30 // 30 mins ago
    },
    {
      id: 'demo-2',
      title: '💡 Hybrid Mobile Development Checklist',
      content: '1. Build responsive mobile-first UI with HTML/CSS/JS.\n2. Verify local state and persistent storage.\n3. Integrate Capacitor Android container.\n4. Build and test .apk on Android device.',
      category: 'Study',
      color: 'emerald',
      pinned: false,
      updatedAt: Date.now() - 1000 * 60 * 120 // 2 hours ago
    },
    {
      id: 'demo-3',
      title: '🛒 Weekend Groceries & Ideas',
      content: 'Almond milk, avocados, dark roast coffee beans, sourdough bread, and fresh rosemary.',
      category: 'Personal',
      color: 'amber',
      pinned: false,
      updatedAt: Date.now() - 1000 * 60 * 60 * 24 // 1 day ago
    }
  ];

  // --- State ---
  let notes = [];
  let selectedCategory = 'all';
  let searchQuery = '';
  let activeColor = 'indigo';
  let pendingDeleteId = null;

  // --- DOM Elements ---
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

  // Modals
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

  // Delete Modal
  const deleteModal = document.getElementById('deleteModal');
  const deleteNoteTitlePreview = document.getElementById('deleteNoteTitlePreview');
  const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

  // Toast Container
  const toastContainer = document.getElementById('toastContainer');

  // --- Initializer ---
  function init() {
    loadTheme();
    loadNotes();
    attachEventListeners();
    render();
  }

  // --- Storage & Data Operations ---
  function loadNotes() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_NOTES);
      if (stored) {
        notes = JSON.parse(stored);
      } else {
        notes = INITIAL_SEED_NOTES;
        saveNotesToStorage();
      }
    } catch (err) {
      console.error('Failed to load notes from localStorage:', err);
      notes = INITIAL_SEED_NOTES;
    }
  }

  function saveNotesToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(notes));
    } catch (err) {
      console.error('Failed to save notes to localStorage:', err);
      showToast('⚠️ Storage limit reached or error saving.');
    }
  }

  // --- Theme Management ---
  function loadTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEY_THEME);
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      // Respect system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }

  function setTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY_THEME, theme);
  }

  function toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    showToast(`Switched to ${newTheme} theme`);
  }

  // --- Date Formatter ---
  function formatDate(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return 'Today, ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
  }

  // --- Filter & Search Logic ---
  function getFilteredNotes() {
    return notes
      .filter((note) => {
        // Category filter
        const matchesCategory =
          selectedCategory === 'all' ||
          note.category.toLowerCase() === selectedCategory.toLowerCase();

        // Search filter
        const query = searchQuery.trim().toLowerCase();
        const matchesSearch =
          !query ||
          note.title.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query);

        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        // Pinned notes first
        if (a.pinned !== b.pinned) {
          return b.pinned ? 1 : -1;
        }
        // Then by last modified date descending
        return (b.updatedAt || 0) - (a.updatedAt || 0);
      });
  }

  // --- Render UI ---
  function render() {
    const filtered = getFilteredNotes();

    // Update count text
    const totalCount = notes.length;
    const showingCount = filtered.length;
    if (searchQuery || selectedCategory !== 'all') {
      notesCountText.textContent = `Showing ${showingCount} of ${totalCount} notes`;
    } else {
      notesCountText.textContent = `${totalCount} ${totalCount === 1 ? 'note' : 'notes'} stored locally`;
    }

    // Toggle Empty State vs Grid
    if (filtered.length === 0) {
      notesContainer.innerHTML = '';
      emptyState.classList.remove('hidden');

      if (searchQuery || selectedCategory !== 'all') {
        emptyTitle.textContent = 'No matching notes found';
        emptySubtitle.textContent = 'Try searching with different keywords or switch category filter.';
        emptyAddBtn.classList.add('hidden');
      } else {
        emptyTitle.textContent = 'No notes yet';
        emptySubtitle.textContent = 'Tap the + button below to create your very first note.';
        emptyAddBtn.classList.remove('hidden');
      }
      return;
    }

    emptyState.classList.add('hidden');
    notesContainer.innerHTML = '';

    filtered.forEach((note) => {
      const card = document.createElement('article');
      card.className = `note-card color-${note.color || 'indigo'} ${note.pinned ? 'pinned' : ''}`;
      card.setAttribute('data-id', note.id);

      // Card Header
      const headerRow = document.createElement('div');
      headerRow.className = 'note-header-row';

      const titleEl = document.createElement('h3');
      titleEl.className = 'note-title';
      titleEl.textContent = note.title;

      const topActions = document.createElement('div');
      topActions.className = 'card-top-actions';

      const pinBtn = document.createElement('button');
      pinBtn.className = `pin-btn ${note.pinned ? 'active' : ''}`;
      pinBtn.title = note.pinned ? 'Unpin note' : 'Pin note';
      pinBtn.setAttribute('aria-label', note.pinned ? 'Unpin note' : 'Pin note');
      pinBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="${note.pinned ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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

      // Card Body
      const bodyEl = document.createElement('div');
      bodyEl.className = 'note-body';
      bodyEl.textContent = note.content;

      // Card Footer
      const footerEl = document.createElement('div');
      footerEl.className = 'note-footer';

      const metaLeft = document.createElement('div');
      metaLeft.style.display = 'flex';
      metaLeft.style.alignItems = 'center';
      metaLeft.style.gap = '8px';

      const catBadge = document.createElement('span');
      catBadge.className = 'category-badge';
      catBadge.textContent = note.category || 'General';

      const dateSpan = document.createElement('span');
      dateSpan.textContent = formatDate(note.updatedAt);

      metaLeft.appendChild(catBadge);
      metaLeft.appendChild(dateSpan);

      // Action Buttons (Edit & Delete)
      const actionsEl = document.createElement('div');
      actionsEl.className = 'note-card-actions';

      const editBtn = document.createElement('button');
      editBtn.className = 'card-action-btn';
      editBtn.title = 'Edit Note';
      editBtn.setAttribute('aria-label', 'Edit note');
      editBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
      deleteBtn.title = 'Delete Note';
      deleteBtn.setAttribute('aria-label', 'Delete note');
      deleteBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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

      // Card Click: also opens editor
      card.addEventListener('click', () => {
        openEditModal(note.id);
      });

      card.appendChild(headerRow);
      card.appendChild(bodyEl);
      card.appendChild(footerEl);

      notesContainer.appendChild(card);
    });
  }

  // --- CRUD Actions ---

  function openCreateModal() {
    noteForm.reset();
    noteIdInput.value = '';
    modalTitle.textContent = 'Create Note';
    setActiveColor('indigo');
    notePinnedInput.checked = false;
    noteModal.classList.remove('hidden');
    setTimeout(() => noteTitleInput.focus(), 150);
  }

  function openEditModal(id) {
    const note = notes.find((n) => n.id === id);
    if (!note) return;

    noteIdInput.value = note.id;
    noteTitleInput.value = note.title;
    noteContentInput.value = note.content;
    noteCategorySelect.value = note.category || 'Personal';
    notePinnedInput.checked = !!note.pinned;
    setActiveColor(note.color || 'indigo');

    modalTitle.textContent = 'Edit Note';
    noteModal.classList.remove('hidden');
    setTimeout(() => noteTitleInput.focus(), 150);
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
      showToast('Please enter a note title.');
      noteTitleInput.focus();
      return;
    }

    if (existingId) {
      // UPDATE Note
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
        showToast('✓ Note updated successfully');
      }
    } else {
      // CREATE Note
      const newNote = {
        id: 'note_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
        title,
        content,
        category,
        pinned,
        color,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      notes.unshift(newNote);
      showToast('✓ Note created successfully');
    }

    saveNotesToStorage();
    closeNoteModal();
    render();
  }

  function togglePinNote(id) {
    const note = notes.find((n) => n.id === id);
    if (!note) return;

    note.pinned = !note.pinned;
    note.updatedAt = Date.now();
    saveNotesToStorage();
    render();
    showToast(note.pinned ? '📌 Note pinned to top' : 'Note unpinned');
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

    // DELETE Note
    notes = notes.filter((n) => n.id !== pendingDeleteId);
    saveNotesToStorage();
    closeDeleteModal();
    render();
    showToast('🗑️ Note deleted');
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

  // --- Toast System ---
  function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 3000);
  }

  // --- Event Listeners ---
  function attachEventListeners() {
    // Theme toggle
    themeToggleBtn.addEventListener('click', toggleTheme);

    // FAB & Empty State Add
    addNoteFab.addEventListener('click', openCreateModal);
    emptyAddBtn.addEventListener('click', openCreateModal);

    // Modal Form & Close
    noteForm.addEventListener('submit', handleSaveNote);
    closeModalBtn.addEventListener('click', closeNoteModal);
    cancelModalBtn.addEventListener('click', closeNoteModal);

    // Close on backdrop click
    noteModal.addEventListener('click', (e) => {
      if (e.target === noteModal) closeNoteModal();
    });

    // Delete Modal
    cancelDeleteBtn.addEventListener('click', closeDeleteModal);
    confirmDeleteBtn.addEventListener('click', handleConfirmDelete);
    deleteModal.addEventListener('click', (e) => {
      if (e.target === deleteModal) closeDeleteModal();
    });

    // Keyboard Shortcuts (Esc to close modal)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (!noteModal.classList.contains('hidden')) closeNoteModal();
        if (!deleteModal.classList.contains('hidden')) closeDeleteModal();
      }
    });

    // Color picker
    colorPicker.addEventListener('click', (e) => {
      const dot = e.target.closest('.color-dot');
      if (dot) {
        const color = dot.getAttribute('data-color');
        if (color) setActiveColor(color);
      }
    });

    // Search input
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

    // Category chips
    categoryChips.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (!chip) return;

      categoryChips.querySelectorAll('.chip').forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');

      selectedCategory = chip.getAttribute('data-category') || 'all';
      render();
    });
  }

  // Start app
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
