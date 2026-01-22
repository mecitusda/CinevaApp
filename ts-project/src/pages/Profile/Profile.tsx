import { useMeQuery } from '../../features/auth/useMeQuery';
import { useNavigate } from 'react-router-dom';
import { uploadAvatar, getProfileStats } from '../../api/profile.api';
import { useEffect, useRef, useState } from 'react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import './Profile.css';

const DEFAULT_AVATAR = '/images/default-avatar.jpg';

export default function Profile() {
  const { data: me, isLoading } = useMeQuery();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const { data: stats } = useQuery({ queryKey: ['profile-stats'], queryFn: getProfileStats, retry: false });

  useEffect(() => {
    if (!isLoading && !me) navigate('/login');
  }, [isLoading, me, navigate]);

  if (isLoading) return <div style={{ padding: 40 }}>Yükleniyor…</div>;
  if (!me) return null;

  const onChooseAvatar = () => {
    inputRef.current?.click();
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadAvatar(file);
      // res.avatar contains new avatar url — update me cache
      queryClient.setQueryData(['me'], (old: any) => ({ ...(old || {}), avatar: res.avatar }));
    } catch (err) {
      console.error('Upload failed', err);
      alert('Avatar yüklemesi başarısız oldu');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-left">
          <img
            className="profile-avatar"
            src={me.avatar || DEFAULT_AVATAR}
            alt={me.username || 'Avatar'}
          />
          <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onFileChange} />
          <button className="change-avatar-btn" onClick={onChooseAvatar} disabled={uploading}>
            {uploading ? 'Yükleniyor...' : 'Avatar Değiştir'}
          </button>
        </div>

        <div className="profile-right">
          <div className="profile-header">
            <div className="profile-details">
              <div className="detail"><span className="label">Kullanıcı adı:</span> <span className="value">{me.username || '-'}</span></div>
              <div className="detail"><span className="label">Email:</span> <span className="value">{me.email}</span></div>
              {me.createdAt && (
                <div className="detail"><span className="label">Üyelik:</span> <span className="value">{new Date(me.createdAt).toLocaleDateString()}</span></div>
              )}
            </div>
            {me.bio && <div className="profile-bio">{me.bio}</div>}
          </div>

          {/* optional: top genres from stats */}
          {stats?.topGenres && stats.topGenres.length > 0 && (
            <div className="profile-genres">
              <div className="genres-title">Favori Türler</div>
              <div className="genres-list">
                {stats.topGenres.map((g: any) => (
                  <span key={g.genreId} className="genre-pill">{g.genreId}</span>
                ))}
              </div>
            </div>
          )}

          {/* actions removed */}

          {/* actions removed as requested */}
        </div>
      </div>
    </div>
  );
}
