import './SearchBar.css'

export function SearchBar({ value, onChange }) {
  return (
    <div className="search-bar">
      <span className="search-bar-icon" aria-hidden="true">⌕</span>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search movies, manga, books…"
        aria-label="Search the catalog"
      />
    </div>
  )
}
