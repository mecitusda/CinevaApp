import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useMeQuery } from '../../features/auth/useMeQuery';
import { logout } from '../../api/auth.api';
import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { searchMovies } from '../../api/movies.api';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import "./css/header.css"

function SearchSkeletonItem() {
  return (
    <div className="hdr__search-item">
      <div
        className="skeleton"
        style={{ width: 56, height: 84, borderRadius: 6 }}
      />

      <div className="hdr__search-item-meta">
        <div
          className="skeleton"
          style={{ width: '70%', height: 14, marginBottom: 8 }}
        />
        <div
          className="skeleton"
          style={{ width: '40%', height: 12, marginBottom: 6 }}
        />
        <div
          className="skeleton"
          style={{ width: '90%', height: 12 }}
        />
      </div>
    </div>
  );
}

export default function Header() {

  const { data: me , isLoading } = useMeQuery();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState<boolean> (false);
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchInputRef = useRef<HTMLDivElement | null>(null);
  const searchDropdownRef = useRef<HTMLDivElement | null>(null);
  const debounceRef = useRef<number | null>(null);
  const cacheRef = useRef<Map<string, any[]>>(new Map());
  const abortRef = useRef<AbortController | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [isSticky, setIsSticky] = useState(false);
  
  const avatar =
    me?.avatar ||
    '/images/default-avatar.jpg';

  const activePage = location.pathname;
  // dışarı tıklayınca kapat

  useEffect(() => {    
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsSticky(window.scrollY > 0);
          ticking = false;
        });
        ticking = true;
      }
    };
  
    // İlk yükleme kontrolü
    handleScroll();
  
    window.addEventListener('scroll', handleScroll, { passive: true });
  
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activePage]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!open) return;
      const target = e.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  useEffect(() => {
  function onDocClick(e: MouseEvent) {
    const target = e.target as Node;

    if (
      searchInputRef.current?.contains(target) ||
      searchDropdownRef.current?.contains(target)
    ) {
      return; // 👈 input veya dropdown → KAPATMA
    }

    setShowDropdown(false); // 👈 her şeyin dışı
  }

  document.addEventListener('mousedown', onDocClick);
  return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  useEffect(() => {
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') setShowDropdown(false);
  };
  document.addEventListener('keydown', onKey);
  return () => document.removeEventListener('keydown', onKey);
  }, []);

  const handleLogout = async () => {
    try {
      setOpen(false);
      await logout(); // HttpOnly cookie temizleme
      queryClient.setQueryData(['me'], null);
      queryClient.removeQueries({ queryKey: ['home'] });
      queryClient.removeQueries({ queryKey: ['movie'] });
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      navigate('/login'); // Hata olsa bile login'e yönlendir
    }
  };

  const onSearchChange = (v: string) => {
  setSearchTerm(v);

  if (debounceRef.current) {
    window.clearTimeout(debounceRef.current);
  }

  if (v.trim().length < 3) {
    setResults([]);
    setShowDropdown(false);
    setLoading(false);
    return;
  }

  debounceRef.current = window.setTimeout(async () => {
    // cache varsa API çağırma
    if (cacheRef.current.has(v.trim().toLowerCase())) {
      setResults(cacheRef.current.get(v.trim().toLowerCase())!);
      setShowDropdown(true);
      setLoading(false);
      return;
    }

    // önceki isteği iptal et
    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);

    try {
      const data = await searchMovies(v, {
      signal: controller.signal,
      });

      const items = data.results;

      const sliced = items.slice(0, 5);
      cacheRef.current.set(v.trim().toLowerCase(), sliced);

      setResults(sliced);
      setShowDropdown(true);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Search failed', err);
        setResults([]);
      }
    } finally {
      setLoading(false);
    }
  }, 350); // biraz daha insani
  };


  const goToSearchPage = () => {
    setResults([]);
    navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    setShowDropdown(false);
  };

  return (
    <header className={`nav`}>
      <nav className={`hdr hdr_inner ${isSticky ? "sticky-active" : ""}`}>
     <div className="hdr__left">
  {/* HAMBURGER (mobil) */}
  <button
    className="hdr__hamburger"
    onClick={() => setMobileMenuOpen(true)}
    aria-label="Menu"
  >
    <MenuIcon style={{fontSize:"2.4rem"}} />
  </button>

  <Link to="/" className={`hdr__logo-outer`}>
    <img src="/images/header-icon.png" alt="MovieReco" className='hdr__logo-img' />
  </Link>
  
  {/* DESKTOP LINKLER */}
  <nav className="hdr__nav">
    <Link className={`hdr__link ${activePage === '/' ? 'active' : ''}`} to="/">Anasayfa</Link>
    <Link className={`hdr__link ${activePage === '/movies' ? 'active' : ''}`} to="/movies">Filmler</Link>
    <Link className={`hdr__link ${activePage === '/series' ? 'active' : ''}`} to="/series">Diziler</Link>
    <Link className={`hdr__link ${activePage === '/mylist' ? 'active' : ''}`} to="/mylist">Listem</Link>
  </nav>
     </div>

    

      <div className="hdr__right">
        {/* header search - placed here so it appears left of avatar/menu */}
        {location.pathname !== '/search' && (
          <div className="hdr__search floating" ref={searchInputRef}>
            <span className="hdr__search-icon">
              <SearchIcon sx={{fontSize: 20}} />
            </span>
            <input
              className="hdr__search-input"
              placeholder="Film ara..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => { if (results.length) setShowDropdown(true); }}
            />
          </div>
        )}
        {showDropdown && (
          <div className="hdr__search-dropdown" ref={searchDropdownRef}>
            {loading ? (
            <>
              <SearchSkeletonItem />
              <SearchSkeletonItem />
              <SearchSkeletonItem />
            </>
          ) : results.length === 0 ? (
              <div className="hdr__search-empty">Sonuç yok</div>
            ) : (
              <>
                {results.map((m: any) => (
                  <div
            key={m.tmdbId}
            className="hdr__search-item"
            onClick={() => {
              setShowDropdown(false);
              setSearchTerm('');
              setResults([]);
              navigate(`/${m.mediaType}/${m.tmdbId}`);
            }}
          >
            <img
              src={
                m.posterPath
                  ? `https://image.tmdb.org/t/p/w92${m.posterPath}`
                  : '/images/default-poster.png'
              }
              alt={m.title}
            />
            <div className="hdr__search-item-meta">
              <div className="title">{m.title}</div>
              <div className="meta">
                {m.year}
                <span className="badge">{m.mediaType === 'tv' ? 'Dizi' : 'Film'}</span>
              </div>
              {m.overview && <p className="overview">{m.overview}</p>}
            </div>
                  </div>
                ))}

                <div
                  className="hdr__search-more"
                  onClick={goToSearchPage}
                  role="button"
                  tabIndex={0}
                >
                  Daha fazla bul
                </div>
              </>
            )}
          </div>
        )}
        {isLoading ? null : !me ? (
          <div className="hdr__auth">
            <button className="btn btn--join-secondary" onClick={() => navigate('/login')}>
              Bize Katılın
            </button>
          </div>
        ) : (
          <div className="hdr__menu" ref={menuRef}>
            <button
              className="hdr__avatarBtn"
              onClick={() => setOpen((v) => !v)}
              aria-label="User menu"
            >
              <img className="hdr__avatar" src={avatar} alt="avatar" />
            </button>

            {open && (
              <div className="menu">
                <div className="menu__arrow" />
                <div className="menu__header">
                  <div className="menu__name">{me?.username || 'Kullanıcı'}</div>
                  <div className="menu__email">{me?.email}</div>
                </div>

                <div className="menu__sep" />

                <button className="menu__item" onClick={() => { setOpen(false); navigate('/profile'); }}>
                  Profil
                </button>

             

                <div className="menu__sep" />

                <button className="menu__item menu__item--danger" onClick={handleLogout}>
                  Çıkış Yap
                </button>
              </div>
            )}
          </div>
        )} 
        
      </div>
        <div className={`mobile-menu ${mobileMenuOpen ? 'open' : 'closed'}`}>
    <nav className="mobile-nav">
      <div className="mobile-nav-header">
        <img src="/images/header-icon.png" alt="MovieReco" className='hdr__logo-img-inner' />
        <button className='mobile-nav-close' onClick={() => setMobileMenuOpen(false)}>
          <CloseIcon style={{fontSize:"30px", background:"transparent"}}/></button>
      </div>
      <Link to="/" className={`${activePage === '/' ? 'active' : ''}`}>Anasayfa</Link>
      <Link to="/movies" className={`${activePage === '/movies' ? 'active' : ''}`}>Filmler</Link>
      <Link to="/series" className={`${activePage === '/series' ? 'active' : ''}`}>Diziler</Link>
      <Link to="/mylist" className={`${activePage === '/mylist' ? 'active' : ''}`}>Listem</Link>
    </nav>
  </div>

  <div
    className={`mobile-menu-backdrop ${mobileMenuOpen ? 'open' : ''}`}
    onClick={() => setMobileMenuOpen(false)}
  />
  </nav>
    </header>
  );
}
