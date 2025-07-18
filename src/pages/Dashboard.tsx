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
  { color: 'bg-yellow-200', label: 'Leave' },
  { color: 'bg-green-200', label: 'Training' },
  { color: 'bg-blue-200', label: 'Military' },
  { color: 'bg-purple-200', label: 'Court' },
  { color: 'bg-pink-200', label: 'Overtime' },
];

const Dashboard: React.FC = () => {
  const [monthIdx, setMonthIdx] = useState(0);
  const current = scheduleImages[monthIdx];

  const handlePrev = () => setMonthIdx((idx) => (idx === 0 ? scheduleImages.length - 1 : idx - 1));
  const handleNext = () => setMonthIdx((idx) => (idx === scheduleImages.length - 1 ? 0 : idx + 1));

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <button onClick={handlePrev} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">Previous</button>
        <a href={current.url} target="_blank" rel="noopener noreferrer" className="text-xl font-bold text-blue-800 underline">{current.month}</a>
        <button onClick={handleNext} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">Next</button>
      </div>
      <div className="border rounded-lg overflow-hidden shadow mb-4 bg-white">
        {/* Replace with actual schedule table or image */}
        <img src={current.img} alt={current.month + ' schedule'} className="w-full object-contain" />
        <div className="p-2 text-center text-gray-500 text-sm">(Schedule preview - interactive version coming soon)</div>
      </div>
      <div className="flex gap-4 items-center justify-center mt-2">
        {legend.map(item => (
          <div key={item.label} className="flex items-center gap-1">
            <span className={`inline-block w-4 h-4 rounded ${item.color} border border-gray-300`}></span>
            <span className="text-xs text-gray-700">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard; 