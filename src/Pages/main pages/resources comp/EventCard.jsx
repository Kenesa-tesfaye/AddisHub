import { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Card, CardMedia, Box, Typography, Button
} from '@mui/material';
import {
  FiBookmark, FiCalendar, FiMapPin, FiUsers
} from 'react-icons/fi';
import api from '../../../api/api';

const BADGE_STYLES = {
  upcoming: {
    background: '#052d5862',
    color: '#e9eef1',
    border: '1px solid #63aaec18',
    label: 'Upcoming',
  },
  registration_period: {
    background: '#111f1f62',
    color: '#046e32',
    border: '1px solid #046e3259',
    label: 'Registration Open',
  },
  ended: {
    background: '#2a1a1a',
    color: '#9b9494',
    border: '1px solid #33333355',
    label: 'Ended',
  },
};

const formatDate = (date) => {
  if (!date) return 'TBA';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
};

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80';

function EventCard({ event }) {
  const [bookmarked, setBookmarked] = useState(false);
  const [registered, setRegistered] = useState(false);
  const user = useSelector((state) => state.auth.user);

  const badge = BADGE_STYLES[event.event_type] || BADGE_STYLES.ended;

  const handleRegister = async () => {
    if (!user?.id || registered) return;
    try {
      await api.post(`/events/${event.id}/register`, { userId: user.id });
      setRegistered(true);
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  return (
    <Card sx={{
      height: '360px',
      width: '100%',
      maxWidth: '600px',
      borderRadius: '20px',
      position: 'relative',
      overflow: 'hidden',
      bgcolor: '#000',
      cursor: 'pointer',
      transition: 'transform .3s ease, box-shadow .3s ease',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
      },
    }}>

      {/* Background image */}
      <CardMedia
        component="img"
        image={event.image_url || DEFAULT_IMAGE}
        alt={event.title}
        onError={(e) => { e.target.src = DEFAULT_IMAGE; }}
        sx={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover',
          filter: 'brightness(0.55)',
          transition: 'filter .3s',
          '&:hover': { filter: 'brightness(0.4)' },
        }}
      />

      {/* Gradient overlay */}
      <Box sx={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.1) 100%)',
        zIndex: 1,
      }} />

      {/* Top row — badge + bookmark */}
      <Box sx={{
        position: 'absolute', top: 14, left: 14, right: 14,
        zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <Box sx={{
          ...badge,
          padding: '3px 12px', borderRadius: '5px',
          fontSize: '10px', fontWeight: 600, letterSpacing: '.5px',
        }}>
          {badge.label}
        </Box>
        <Box
          onClick={() => setBookmarked(!bookmarked)}
          sx={{
            background: bookmarked ? '#046e3236' : '#00000066',
            border: bookmarked ? '1px solid #046e32' : '1px solid #ffffff15',
            borderRadius: '8px', padding: '5px 7px',
            cursor: 'pointer', transition: 'all .2s',
            color: bookmarked ? '#05411f' : '#fff',
            display: 'flex', alignItems: 'center',
          }}
        >
          <FiBookmark size={16} fill={bookmarked ? '#046e32' : 'none'} />
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        zIndex: 2, p: '20px',
      }}>
        {/* Category chip */}
        <Typography sx={{
          display: 'inline-block',
          background: '#111', color: '#046e32',
          padding: '2px 10px', borderRadius: '20px',
          fontSize: '11px', fontWeight: 500,
          mb: 1, border: '1px solid #046e3259',
        }}>
          {event.category}
        </Typography>

        {/* Title */}
        <Typography sx={{
          fontSize: '20px', fontWeight: 600, color: '#fff',
          mb: '4px', lineHeight: 1.2, fontFamily: 'Syne, Arial',
        }}>
          {event.title}
        </Typography>

        {/* Date + Location */}
        <Box sx={{ display: 'flex', gap: '12px', mb: 1, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#888', fontSize: '12px' }}>
            <FiCalendar size={13} />{formatDate(event.event_date)}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#888', fontSize: '12px' }}>
            <FiMapPin size={13} />{event.location}
          </Box>
        </Box>

        {/* Description */}
        <Typography sx={{
          fontSize: '12px', color: '#666', lineHeight: 1.5, mb: '14px',
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {event.description}
        </Typography>

        {/* Footer — fee + button */}
        <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <Box>
            <Typography sx={{ fontSize: '10px', color: '#555', textTransform: 'uppercase', letterSpacing: '.5px' }}>
              Entry Fee
            </Typography>
            <Typography sx={{ fontSize: '14px', fontWeight: 600, color: event.entry_fee ? '#fff' : '#046e32' }}>
              {event.entry_fee ? `${event.entry_fee} ETB` : 'Free'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#555', fontSize: '11px' }}>
              <FiUsers size={13} />{event.capacity || '—'} seats
            </Box>

            {event.event_type === 'registration_period' && (
              <Button
                onClick={handleRegister}
                disabled={registered}
                sx={{
                  background: registered ? '#333' : '#044d24',
                  color: registered ? '#888' : '#0E0E0E',
                  borderRadius: '10px', px: 2, py: '6px',
                  fontSize: '13px', fontWeight: 600,
                  textTransform: 'none', fontFamily: 'DM Sans, Arial',
                  '&:hover': { background: registered ? '#333' : '#046e32' },
                }}
              >
                {registered ? 'Registered ✓' : 'Register Now'}
              </Button>
            )}

            {event.event_type === 'upcoming' && (
              <Button sx={{
                background: 'transparent', color: '#888',
                border: '1px solid #2A2A2A', borderRadius: '10px',
                px: 2, py: '6px', fontSize: '13px',
                textTransform: 'none', fontFamily: 'DM Sans, Arial',
                '&:hover': { borderColor: '#046e32', color: '#046e32' },
              }}>
                View Detail
              </Button>
            )}

            {event.event_type === 'ended' && (
              <Button disabled sx={{
                background: '#046e3225', color: '#8a8484',
                border: '1px solid #00000063', borderRadius: '10px',
                px: 2, py: '6px', fontSize: '13px',
                textTransform: 'none', fontFamily: 'DM Sans, Arial',
              }}>
                Event Ended
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    </Card>
  );
}

export default EventCard;
