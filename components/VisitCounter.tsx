'use client';

import { useEffect, useState } from 'react';

export default function VisitCounter() {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    // Get current count from localStorage
    const storedCount = localStorage.getItem('pageVisitCount');
    const currentCount = storedCount ? parseInt(storedCount, 10) : 0;
    
    // Increment the count
    const newCount = currentCount + 1;
    
    // Save to localStorage
    localStorage.setItem('pageVisitCount', newCount.toString());
    
    // Update state
    setCount(newCount);
  }, []);

  return (
    <div className="text-center text-sm text-gray-500 py-4">
      Page visits: {count}
    </div>
  );
}

