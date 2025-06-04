/* global window */
import React from "react";
import "./NoteEaseContainer.css";
import { useState, useEffect, ChangeEvent } from "react";

/**
 * Types for Notes and Categories
 */
type Note = {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: number;
  updatedAt: number;
};

const DEFAULT_CATEGORIES = ["All", "Work", "Personal", "Ideas", "Other"];

// PUBLIC_INTERFACE
export function NoteEaseContainer() {
  /**
   * State: notes, search, selected category, modal for editing/creating, form values, etc.
   */
  const [notes, setNotes] = useState<Note[]>(() => {
    // Load notes from localStorage if present, else empty
    const data = window.localStorage.getItem("noteease_notes");
    return data ? JSON.parse(data) : [];
  });
  const [search, setSearch] = useState<string>("");
  const [categories, setCategories] = useState<string[]>(() => {
    // Load categories from localStorage if present, else default set
    const data = window.localStorage.getItem("noteease_categories");
    return data ? JSON.parse(data) : DEFAULT_CATEGORIES;
  });
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Modal state for create/edit
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editNoteId, setEditNoteId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState<string>("");
  const [formContent, setFormContent] = useState<string>("");
  const [formCategory, setFormCategory] = useState<string>("Other");

  // Save to localStorage on update
  useEffect(() => {
    // eslint-disable-next-line no-undef
    window.localStorage.setItem("noteease_notes", JSON.stringify(notes));
  }, [notes]);
  useEffect(() => {
    // eslint-disable-next-line no-undef
    window.localStorage.setItem("noteease_categories", JSON.stringify(categories));
  }, [categories]);

  // Filtered and searched notes
  const filteredNotes = notes.filter((note) => {
    const matchesCategory = selectedCategory === "All" || note.category === selectedCategory;
    const matchesSearch =
      note.title.toLowerCase().includes(search.toLowerCase()) ||
      note.content.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // ---- Note operations ----
  // PUBLIC_INTERFACE
  function openCreateNoteModal() {
    setEditNoteId(null);
    setFormTitle("");
    setFormContent("");
    setFormCategory(categories.find((cat) => cat !== "All") || "Other");
    setModalOpen(true);
  }

  // PUBLIC_INTERFACE
  function openEditNoteModal(note: Note) {
    setEditNoteId(note.id);
    setFormTitle(note.title);
    setFormContent(note.content);
    setFormCategory(note.category);
    setModalOpen(true);
  }

  // PUBLIC_INTERFACE
  function closeNoteModal() {
    setModalOpen(false);
  }

  // PUBLIC_INTERFACE
  function handleFormTitleChange(e: ChangeEvent<HTMLInputElement>) {
    setFormTitle(e.target.value);
  }
  // PUBLIC_INTERFACE
  function handleFormContentChange(e: ChangeEvent<HTMLTextAreaElement>) {
    setFormContent(e.target.value);
  }
  // PUBLIC_INTERFACE
  function handleFormCategoryChange(e: ChangeEvent<HTMLSelectElement>) {
    setFormCategory(e.target.value);
  }

  // PUBLIC_INTERFACE
  function handleSaveNote(e: React.FormEvent) {
    e.preventDefault();
    const trimmedTitle = formTitle.trim();
    const trimmedContent = formContent.trim();
    if (!trimmedTitle && !trimmedContent) return;

    if (editNoteId) {
      // Update note
      setNotes((prev) =>
        prev.map((note) =>
          note.id === editNoteId
            ? {
                ...note,
                title: trimmedTitle || "(No title)",
                content: trimmedContent,
                category: formCategory,
                updatedAt: Date.now(),
              }
            : note
        )
      );
    } else {
      // Create note
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
      setNotes((prev) => [
        {
          id,
          title: trimmedTitle || "(No title)",
          content: trimmedContent,
          category: formCategory,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        ...prev,
      ]);
    }
    setModalOpen(false);
  }

  // PUBLIC_INTERFACE
  function handleDeleteNote(id: string) {
    // eslint-disable-next-line no-undef
    if (window.confirm("Delete this note?")) {
      setNotes((prev) => prev.filter((note) => note.id !== id));
    }
  }

  // PUBLIC_INTERFACE
  function handleSearchChange(e: ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
  }

  // PUBLIC_INTERFACE
  function handleCategoryChipClick(category: string) {
    setSelectedCategory(category);
  }

  // PUBLIC_INTERFACE
  function handleAddCategory() {
    // eslint-disable-next-line no-undef
    const newCat = prompt("Enter new category name:");
    if (newCat && !categories.includes(newCat)) {
      setCategories((prev) => [...prev, newCat]);
    }
  }

  // ---- Render ----
  return (
    <div className="noteease-container">
      {/* AppBar */}
      <header className="noteease-appbar">
        <span className="noteease-logo">📝 NoteEase</span>
        <input
          className="noteease-search"
          value={search}
          placeholder="Search notes..."
          onChange={handleSearchChange}
        />
      </header>
      {/* Category Chips */}
      <div className="noteease-chipsrow">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`noteease-chip${selectedCategory === cat ? " selected" : ""}`}
            onClick={() => handleCategoryChipClick(cat)}
            type="button"
          >
            {cat}
          </button>
        ))}
        <button className="noteease-chip add" title="Add category" onClick={handleAddCategory}>
          +
        </button>
      </div>
      {/* Notes list */}
      <div className="noteease-notes-list">
        {filteredNotes.length > 0 ? (
          filteredNotes.map((note) => (
            <div className="noteease-note-card" key={note.id}>
              <div className="noteease-note-header">
                <span className="noteease-note-title" onClick={() => openEditNoteModal(note)}>
                  {note.title}
                </span>
                <span className="noteease-note-category">{note.category}</span>
              </div>
              <div
                className="noteease-note-snippet"
                onClick={() => openEditNoteModal(note)}
                title={note.content}
              >
                {note.content.length > 100
                  ? note.content.slice(0, 100) + "…"
                  : note.content || <i>No content</i>}
              </div>
              <div className="noteease-note-footer">
                <span className="noteease-note-date">
                  {new Date(note.updatedAt || note.createdAt).toLocaleString()}
                </span>
                <button
                  className="noteease-note-delete"
                  onClick={() => handleDeleteNote(note.id)}
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="noteease-empty">
            <p>No notes yet. Click <b>+</b> to add!</p>
          </div>
        )}
      </div>
      {/* Floating Action Button */}
      <button className="noteease-fab" onClick={openCreateNoteModal} title="Add Note">
        +
      </button>
      {/* Modal for edit/create */}
      {modalOpen && (
        <div className="noteease-modal-overlay" onClick={closeNoteModal}>
          <form
            className="noteease-modal"
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSaveNote}
          >
            <h2>{editNoteId ? "Edit Note" : "New Note"}</h2>
            <label>
              Title:
              <input
                value={formTitle}
                onChange={handleFormTitleChange}
                placeholder="Note title"
                maxLength={80}
                autoFocus
              />
            </label>
            <label>
              Content:
              <textarea
                value={formContent}
                onChange={handleFormContentChange}
                rows={6}
                placeholder="Write your note…"
              ></textarea>
            </label>
            <label>
              Category:
              <select value={formCategory} onChange={handleFormCategoryChange}>
                {categories.filter((cat) => cat !== "All").map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </label>
            <div className="noteease-modal-actions">
              <button type="submit" className="primary">
                Save
              </button>
              <button type="button" onClick={closeNoteModal}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
