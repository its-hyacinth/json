import React, { useState } from 'react';

const scheduleImages = [
  {
    month: 'June 2025',
    url: 'https://docs.google.com/document/d/1Qqnl1I1RzWPRgu0zVsAqANRbLrwFPa--/edit?usp=drive_link&ouid=117352121642263211642&rtpof=true&sd=true',
    img: 'https://i.imgur.com/0Qw8QwF.png', // Placeholder image URL, replace with actual screenshot if available
  },
  {
    month: 'July 2025',
    url: 'https://docs.google.com/document/d/1w3ljHJyOc2ub4tPNK-I2LXOoA9yZ4Gzj/edit?usp=drive_link&ouid=117352121642263211642&rtpof=true&sd=true',
    img: 'https://i.imgur.com/0Qw8QwF.png', // Placeholder image URL
  },
  {
    month: 'August 2025',
    url: 'https://docs.google.com/document/d/1MBrSDcRQMHFh6a-AGaqo7Te3hdlIquWa/edit?usp=drive_link&ouid=117352121642263211642&rtpof=true&sd=true',
    img: 'https://i.imgur.com/0Qw8QwF.png', // Placeholder image URL
  },
];

const legend = [
  { color: 'rgba(255, 193, 7, 0.3)', label: 'Leave' },
  { color: 'rgba(46, 213, 115, 0.3)', label: 'Training' },
  { color: 'rgba(79, 172, 254, 0.3)', label: 'Military' },
  { color: 'rgba(147, 51, 234, 0.3)', label: 'Court' },
  { color: 'rgba(236, 72, 153, 0.3)', label: 'Overtime' },
];

const Dashboard: React.FC = () => {
  const [monthIdx, setMonthIdx] = useState(0);
  const current = scheduleImages[monthIdx];

  const handlePrev = () => setMonthIdx((idx) => (idx === 0 ? scheduleImages.length - 1 : idx - 1));
  const handleNext = () => setMonthIdx((idx) => (idx === scheduleImages.length - 1 ? 0 : idx + 1));

  return (
    <div style={{ maxWidth: '1024px', margin: '0 auto' }}>
      <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', padding: '20px' }}>
        <button onClick={handlePrev} className="glass-btn">Previous</button>
        <a href={current.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-accent)', textDecoration: 'underline' }}>{current.month}</a>
        <button onClick={handleNext} className="glass-btn">Next</button>
      </div>
      <div className="glass-card" style={{ marginBottom: '16px', overflow: 'hidden' }}>
        {/* Replace with actual schedule table or image */}
        <img src={current.img} alt={current.month + ' schedule'} style={{ width: '100%', objectFit: 'contain' }} />
        <div style={{ padding: '8px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>(Schedule preview - interactive version coming soon)</div>
      </div>
      <div className="glass-card" style={{ display: 'flex', gap: '16px', alignItems: 'center', justifyContent: 'center', marginTop: '8px', padding: '16px' }}>
        {legend.map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ display: 'inline-block', width: '16px', height: '16px', borderRadius: '4px', backgroundColor: item.color, border: '1px solid var(--glass-border)' }}></span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard; 