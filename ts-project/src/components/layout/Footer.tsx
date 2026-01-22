import "./css/Footer.css"
import XIcon from "@mui/icons-material/X";
import InstagramIcon from "@mui/icons-material/Instagram";
import GitHubIcon from "@mui/icons-material/GitHub";


export default function Footer() {
  return (
    <footer className="mv-footer">
      <div className="mv-footer-links">
        <div>
          <h4>Keşfet</h4>
          <a href="/movies">Filmler</a>
          <a href="/series">Diziler</a>
          <a href="/mylist">Listem</a>
        </div>

        <div>
          <h4>Hakkında</h4>
          <a href="#">Hakkımızda</a>
          <a href="#">Gizlilik</a>
          <a href="#">Şartlar</a>
        </div>

        <div>
          <h4>MovieVerse</h4>
          <a href="#">Destek</a>
          <a href="#">İletişim</a>
        </div>
      </div>

      <div className="mv-footer-meta">
        <span>© 2026 MovieVerse</span>

        <div className="mv-footer-social">
          <a href="#" aria-label="X (Twitter)">
            <XIcon fontSize="large" />
          </a>
          <a href="#" aria-label="Instagram">
            <InstagramIcon fontSize="large" />
          </a>
          <a href="#" aria-label="GitHub">
            <GitHubIcon fontSize="large" />
          </a>
        </div>
      </div>
    </footer>
  );
}