import { useEffect, useRef } from "react";

const GENRES_Movies = [
  { id: 28, name: "Aksiyon" },
  { id: 12, name: "Macera" },
  { id: 16, name: "Animasyon" },
  { id: 35, name: "Komedi" },
  { id: 80, name: "Suç" },
  { id: 99, name: "Belgesel" },
  { id: 18, name: "Dram" },
  { id: 10751, name: "Aile" },
  { id: 14, name: "Fantastik" },
  { id: 36, name: "Tarih" },
  { id: 27, name: "Korku" },
  { id: 10402, name: "Müzik" },
  { id: 9648, name: "Gizem" },
  { id: 10749, name: "Romantik" },
  { id: 878, name: "Bilim Kurgu" },
  { id: 10770, name: "TV Film" },
  { id: 53, name: "Gerilim" },
  { id: 10752, name: "Savaş" },
  { id: 37, name: "Vahşi Batı" }
];

const GENRES_TV = [
  { id: 10759, name: "Aksiyon & Macera" },
  { id: 16, name: "Animasyon" },
  { id: 35, name: "Komedi" },
  { id: 80, name: "Suç" },
  { id: 99, name: "Belgesel" },
  { id: 18, name: "Dram" },
  { id: 10751, name: "Aile" },
  { id: 10762, name: "Çocuk" },
  { id: 9648, name: "Gizem" },
  { id: 10763, name: "Haber" },
  { id: 10764, name: "Reality" },
  { id: 10765, name: "Bilim Kurgu & Fantastik" },
  { id: 10766, name: "Pembe Dizi" },
  { id: 10767, name: "Talk Show" },
  { id: 10768, name: "Savaş & Politika" },
  { id: 37, name: "Vahşi Batı" }
];


type Props = {
  selected: number | null;
  onSelect: (id: number) => void;
  type: "movies" | "series";
};

export default function GenreSidebar({ selected, onSelect, type }: Props) {
  const activeRef = useRef<HTMLLIElement | null>(null);
  useEffect(() => {
    activeRef.current?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [selected]);
  return (
    <aside className="genre-sidebar">
      <h3>Türler</h3>

      <ul>
        {(type === "movies" ? GENRES_Movies : GENRES_TV).map(g => (
          <li
            key={g.id}
            ref={g.id === selected ? activeRef : null}
            className={selected === g.id ? "active" : ""}
            onClick={() => selected !== g.id ? onSelect(g.id) : null}
          >
            {g.name}
          </li>
        ))}
      </ul>
    </aside>
  );
}
