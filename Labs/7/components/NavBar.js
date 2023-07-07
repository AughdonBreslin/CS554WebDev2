import Link from 'next/link';
import styles from '../styles/NavBar.module.css';

function NavBar() {
    return (
        <nav className={styles.nav}>
            <Link className={styles.navlink} href="/">Home</Link>
            <Link className={styles.navlink} href="/events/page/1">Events</Link>
            <Link className={styles.navlink} href="/attractions/page/1">Attractions</Link>
            <Link className={styles.navlink} href="/venues/page/1">Venues</Link>
        </nav>)
}

export default NavBar;