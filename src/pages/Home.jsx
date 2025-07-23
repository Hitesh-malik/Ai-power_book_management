import { useEffect, useState } from "react";
import BookCard from "../components/BookCard";
import BookLoader from "../components/BookLoader";

const API_BASE_URL = "http://localhost:8080/api/books";

function ConfirmModal({ open, onClose, onConfirm, book }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg text-center">
        <p>Are you sure you want to delete <b>{book.title}</b>?</p>
        <div className="mt-6 flex justify-center gap-4">
          <button className="bg-gray-300 px-4 py-2 rounded" onClick={onClose}>Cancel</button>
          <button className="bg-red-600 text-white px-4 py-2 rounded" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}

import { FaTimes } from "react-icons/fa";

export function EditModal({ open, book, onSave, onClose }) {
  const [form, setForm] = useState(book || {});

  useEffect(() => {
    setForm(book || {});
  }, [book]);

  if (!open || !book) return null;

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave(form);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-2xl min-w-[340px] max-w-full w-[95vw] relative">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-red-400 text-xl"
          onClick={onClose}
          title="Close"
        >
          <FaTimes />
        </button>
        <h2 className="text-xl font-bold mb-4 text-green-700">Edit Book</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            name="title"
            className="border px-3 py-2 rounded-lg focus:ring focus:ring-green-100"
            value={form.title || ""}
            onChange={handleChange}
            required
            placeholder="Title"
          />
          <input
            name="author"
            className="border px-3 py-2 rounded-lg focus:ring focus:ring-green-100"
            value={form.author || ""}
            onChange={handleChange}
            required
            placeholder="Author"
          />
          <input
            name="genre"
            className="border px-3 py-2 rounded-lg focus:ring focus:ring-green-100"
            value={form.genre || ""}
            onChange={handleChange}
            required
            placeholder="Genre"
          />
          <input
            name="pageCount"
            type="number"
            min="1"
            className="border px-3 py-2 rounded-lg focus:ring focus:ring-green-100"
            value={form.pageCount || ""}
            onChange={handleChange}
            required
            placeholder="Page Count"
          />
          <textarea
            name="description"
            className="border px-3 py-2 rounded-lg focus:ring focus:ring-green-100"
            value={form.description || ""}
            onChange={handleChange}
            required
            placeholder="Description"
            rows={3}
          />
          <label className="flex gap-2 items-center">
            <input
              type="checkbox"
              name="read"
              checked={!!form.read}
              onChange={handleChange}
              className="accent-green-600"
            />
            <span className="text-gray-600 text-sm">Already read?</span>
          </label>
          <div className="flex gap-4 mt-3">
            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              Save Changes
            </button>
            <button
              type="button"
              className="bg-gray-300 px-6 py-2 rounded-lg text-gray-700 font-semibold hover:bg-gray-400 transition"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


export default function Home() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteBook, setDeleteBook] = useState(null);
  const [editBook, setEditBook] = useState(null);

  function fetchBooks() {
    setLoading(true);
    setError("");
    fetch(`${API_BASE_URL}/get-books`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch books.");
        return res.json();
      })
      .then(data => setBooks(data))
      .catch(err => setError(err.message || "Error fetching books"))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchBooks(); }, []);

  function handleDeleteConfirm() {
    fetch(`${API_BASE_URL}/${deleteBook.id}`, { method: "DELETE" })
      .then(() => {
        setDeleteBook(null);
        fetchBooks();
      });
  }

  async function handleEditSave(updated) {
    const formData = new FormData();
    formData.append(
      "book",
      new Blob([JSON.stringify(updated)], { type: "application/json" })
    );
    await fetch(API_BASE_URL, { method: "PUT", body: formData });
    setEditBook(null);
    fetchBooks();
  }

  return (
    <div className="min-h-[90vh] bg-gray-100 py-8 px-4">
      <h2 className="text-3xl font-bold mb-7 text-center text-gray-900">My Book Library</h2>
      {error && (
        <div className="text-center text-red-600 mb-6 font-semibold">{error}</div>
      )}
      <div className="flex flex-wrap gap-8 justify-center">
        {loading
          ? Array.from({ length: 4 }).map((_, idx) => <BookLoader key={idx} />)
          : books.length
            ? books.map(book => (
                <BookCard
                  key={book.id}
                  book={book}
                  onEdit={setEditBook}
                  onDelete={setDeleteBook}
                />
              ))
            : <div className="text-gray-400 text-lg mt-10">No books found.</div>
        }
      </div>
      {/* Confirm & Edit Modals */}
      <ConfirmModal
        open={!!deleteBook}
        onClose={() => setDeleteBook(null)}
        onConfirm={handleDeleteConfirm}
        book={deleteBook || {}}
      />
      <EditModal
        open={!!editBook}
        book={editBook}
        onSave={handleEditSave}
        onClose={() => setEditBook(null)}
      />
    </div>
  );
}
