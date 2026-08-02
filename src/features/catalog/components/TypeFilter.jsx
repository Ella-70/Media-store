import './TypeFilter.css'

const TYPES = [
  { value: 'movie', label: 'Movies' },
  { value: 'book', label: 'Books' },
  { value: 'manga', label: 'Manga' },
  { value: 'comic', label: 'Comics' },
]

export function TypeFilter({ active, onChange }) {
  function selectType(type) {
    // If the clicked type is already the only active type, toggle back to All (empty array),
    // otherwise set active to just this single selected type.
    onChange(active.includes(type) && active.length === 1 ? [] : [type])
  }

  return (
    <div className="type-filter" role="group" aria-label="Filter by media type">
      <button
        type="button"
        className={`type-chip ${active.length === 0 ? 'is-active' : ''}`}
        onClick={() => onChange([])}
      >
        All
      </button>
      {TYPES.map((t) => (
        <button
          key={t.value}
          type="button"
          className={`type-chip type-chip-${t.value} ${active.includes(t.value) ? 'is-active' : ''}`}
          aria-pressed={active.includes(t.value)}
          onClick={() => selectType(t.value)}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}
