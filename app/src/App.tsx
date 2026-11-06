import './App.css'

function App() {
  return (
    <main className="page">
      <header className="brand">
        <span className="brand-mark" aria-hidden="true">
          F
        </span>
        <span>Fest Check-in</span>
      </header>

      <section className="empty-state" aria-labelledby="page-title">
        <p className="eyebrow">EVENT ENTRY</p>
        <h1 id="page-title">Your event starts here.</h1>
        <p className="description">
          Event details will appear here once an organizer sets up the event.
        </p>
      </section>
    </main>
  )
}

export default App
