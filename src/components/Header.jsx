export default function Header() {
  return (
    <header className="header">
      <div className="logo">
        <img src="/icon.svg" alt="KeyScrub logo" className="logo-icon" />
        <span className="logo-text">KeyScrub</span>
      </div>
      <p className="tagline">Paste text. Get clean ASCII.</p>
    </header>
  );
}
