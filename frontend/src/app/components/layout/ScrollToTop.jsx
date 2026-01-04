import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
/**
 * ScrollToTop component
 * Scrolls the window to the top whenever the route changes
 */
export default function ScrollToTop() {
    const { pathname } = useLocation();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);
    return null;
}
