import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

const REDIRECT_SECONDS = 5;

export default function SessionExpiredPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(REDIRECT_SECONDS);

  useEffect(() => {
    const t = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(t);
          router.replace('/');
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [router]);

  return (
    <div className="page session-expired-page">
      <div className="session-expired-card">
        <div className="session-expired-icon" aria-hidden>!</div>
        <h1>Session expired</h1>
        <p className="session-expired-message">
          Session expired. Please log in again.
        </p>
        <p className="session-expired-redirect">
          Redirecting to home in {countdown} second{countdown !== 1 ? 's' : ''}…
        </p>
        <Link href="/" className="btn btn-primary">
          Go to Home
        </Link>
      </div>
    </div>
  );
}
