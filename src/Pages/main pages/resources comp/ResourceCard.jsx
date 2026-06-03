import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import api from '../../../api/api';
import { FiHeart, FiEye, FiBookmark, FiMapPin } from 'react-icons/fi';
import defaultImage from '../../../assets/main.png';
import { useSelector } from 'react-redux';
import '../home.css';

function formatCount(num) {
  const n = Number(num) || 0;
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return n;
}

function ResourceCard({ resource }) {
  const [expanded,     setExpanded]    = useState(false);
  const [liked,        setLiked]       = useState(false);
  const [likeCount,    setLikeCount]   = useState(Number(resource.like_count) || 0);
  const [viewCount]                    = useState(Number(resource.view_count) || 0);
  const [bookmarked,   setBookmarked]  = useState(false);
  const [likeAnim,     setLikeAnim]    = useState(false);
  const [liking,       setLiking]      = useState(false);
  const [bookmarking,  setBookmarking] = useState(false);
  const [initLoading,  setInitLoading] = useState(false);

  const user     = useSelector((state) => state.auth.user);
  const navigate = useNavigate();

  // ── Load liked + bookmarked state from DATABASE on mount ──────
  useEffect(() => {
    if (!user?.id) return;
    let alive = true;
    setInitLoading(true);

    api.get(`/auth/${user.id}`)
      .then((res) => {
        if (!alive) return;
        const likedResources     = res.data?.liked_resources || [];
        const favouriteResources = res.data?.favourite_resources || [];

        //SEPARATE columns — like ≠ bookmark
        setLiked(likedResources.includes(resource.id));
        setBookmarked(favouriteResources.includes(resource.id));
      })
      .catch((err) => console.error('Failed to load card state:', err))
      .finally(() => { if (alive) setInitLoading(false); });

    return () => { alive = false; };
  }, [user?.id, resource.id]);

  // ── Like / Unlike ─────────────────────────────────────────────
  const handleLike = async (e) => {
  e.stopPropagation();
  if (!user?.id) { navigate('/login'); return; }
  if (liking) return;

  const nowLiked = !liked;

  // Optimistic update
  setLiked(nowLiked);
  setLikeCount((prev) => nowLiked ? prev + 1 : prev - 1);

  if (nowLiked) {
    setLikeAnim(false);
    setTimeout(() => setLikeAnim(true), 10);
    setTimeout(() => setLikeAnim(false), 400);
  }

  setLiking(true);
  try {
    // 1️⃣ Update like_count on the resource
    if (nowLiked) {
      await api.post(`/resources/${resource.id}/like`, { userId: user.id });
    } else {
      await api.post(`/resources/${resource.id}/unlike`, { userId: user.id });
    }

    // 2️⃣ Update liked_resources on the user — this was missing before
    const { data: userData } = await api.get(`/auth/${user.id}`);
    const currentLikes = userData?.liked_resources || [];

    const updatedLikes = nowLiked
      ? [...new Set([...currentLikes, resource.id])]   // add, no duplicates
      : currentLikes.filter((id) => id !== resource.id); // remove

    await api.put(`/auth/${user.id}`, { liked_resources: updatedLikes });

  } catch (err) {
    console.error('Like failed:', err);
    // Rollback on failure
    setLiked(!nowLiked);
    setLikeCount((prev) => nowLiked ? prev - 1 : prev + 1);
  } finally {
    setLiking(false);
  }
};

  // ── Bookmark / Unbookmark ─────────────────────────────────────
  const handleBookmark = async (e) => {
    e.stopPropagation();
    if (!user?.id) { navigate('/login'); return; }
    if (bookmarking) return;

    const nowBookmarked = !bookmarked;
    setBookmarked(nowBookmarked); // optimistic

    setBookmarking(true);
    try {
      const { data: userData } = await api.get(`/auth/${user.id}`);
      const favs = userData?.favourite_resources || [];

      const updated = nowBookmarked
        ? [...favs, resource.id]
        : favs.filter((id) => id !== resource.id);

      await api.put(`/auth/${user.id}`, { favourite_resources: updated });
      // Stored in favourite_resources — separate from liked_resources
    } catch (err) {
      console.error('Bookmark failed:', err);
      setBookmarked(!nowBookmarked); // rollback
    } finally {
      setBookmarking(false);
    }
  };

  return (
    <div
      className={`card ${expanded ? 'expanded' : ''}`}
      onClick={() => setExpanded(!expanded)}
    >
      {/* ── Bookmark button ── */}
      <div
        className={`fav ${bookmarked ? 'saved' : ''}`}
        onClick={handleBookmark}
        aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark'}
        title={bookmarked ? 'Remove from saved' : 'Save resource'}
        style={{
          opacity:    bookmarking ? 0.5 : 1,
          cursor:     bookmarking ? 'not-allowed' : 'pointer',
          transition: 'opacity .15s',
        }}
      >
        <FiBookmark
          size={17}
          fill={bookmarked ? '#C9941A' : 'none'}
          color={bookmarked ? '#C9941A' : '#fff'}
        />
      </div>

      {/* ── Image ── */}
      <div className="profile-pic">
        <img
          src={resource.image_url || defaultImage}
          alt={resource.title}
          onError={(e) => { e.target.src = defaultImage; }}
        />
      </div>

      {/* ── Frosted pill bottom ── */}
      <div className="bottom">

        {/* Title + category */}
        <div className="card-row1">
          <h1 className="card-title">{resource.title}</h1>
          <span className="card-cat-pill">{resource.category}</span>
        </div>

        {/* Description */}
        <p className="description">{resource.description}</p>

        {/* Location */}
        <div className="card-loc">
          <FiMapPin size={11} />
          {resource.location || 'Addis Ababa'}
        </div>

        {/* Footer */}
        <div className="card-footer">
          <div className="card-stats">

            {/* ── Like button ── */}
            <button
              className={`like-btn ${liked ? 'liked' : ''} ${likeAnim ? 'pop' : ''}`}
              onClick={handleLike}
              disabled={liking || initLoading}
              aria-label={liked ? 'Unlike' : 'Like'}
              title={liked ? 'Unlike this resource' : 'Like this resource'}
              style={{
                opacity:    liking ? 0.6 : 1,
                cursor:     liking ? 'not-allowed' : 'pointer',
                transition: 'opacity .15s',
              }}
            >
              <FiHeart
                size={13}
                fill={liked ? '#3DB070' : 'none'}
                color={liked ? '#3DB070' : '#888'}
              />
              <span>{formatCount(likeCount)}</span>
            </button>

            {/* View count */}
            <div className="card-view-stat">
              <FiEye size={13} color="#555" />
              <span>{formatCount(viewCount)}</span>
            </div>

          </div>

          {/* View detail link */}
          <div onClick={(e) => e.stopPropagation()}>
            <Link
              to={`/resources/${resource.id}`}
              className="card-view-btn"
            >
              View Detail
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

export default ResourceCard;