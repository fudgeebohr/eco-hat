import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const IdleLogoutTimeout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const timerRef = useRef(null);

  // Set the threshold value: 15 minutes = 900,000 milliseconds
  const TIMEOUT_IN_MS = 15 * 60 * 1000; 

  const handleAutomaticLogout = () => {
    // Check if a token exists before throwing an alert (avoids alerting users already logged out)
    if (localStorage.getItem('token')) {
      const currentRole = localStorage.getItem('role');
      
      localStorage.clear(); // Wipe authentication states cleanly
      alert("Session expired due to inactivity. Please log in again.");

      // Route the user back to their respective entry portal boundary cleanly
      if (currentRole === 'admin') {
        navigate('/admin-login');
      } else {
        navigate('/login');
      }
    }
  };

  const resetInactivityTimeoutTimer = () => {
    // Clear the existing browser timeout track execution
    if (timerRef.current) clearTimeout(timerRef.current);

    // Establish a fresh countdown queue
    timerRef.current = setTimeout(handleAutomaticLogout, TIMEOUT_IN_MS);
  };

  useEffect(() => {
    // Skip setting up trackers if the user is on the landing, login, or registration pages
    const publicPages = ['/', '/login', '/register', '/admin-login', '/register-admin'];
    if (publicPages.includes(location.pathname)) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    // Define the DOM user activity event triggers we want to listen to
    const activityEvents = [
      'mousedown', 'mousemove', 'keypress', 
      'scroll', 'touchstart', 'click'
    ];

    // Initialize the starting timer track on mounting loops
    resetInactivityTimeoutTimer();

    // Attach listeners across the global window layout viewport frame
    activityEvents.forEach(eventType => {
      window.addEventListener(eventType, resetInactivityTimeoutTimer);
    });

    // Cleanup lifecycle hook handler safely removes event listeners on unmount
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      activityEvents.forEach(eventType => {
        window.removeEventListener(eventType, resetInactivityTimeoutTimer);
      });
    };
  }, [location.pathname]); // Re-evaluates tracking boundaries whenever routes change!

  return <>{children}</>;
};

export default IdleLogoutTimeout;