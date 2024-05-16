"use client";
import ds from "design-system/";
import { useCallback, useState } from "react";
import styles from "./HamburgerMenu.module.scss";
import HamburgerMenu from "./HamburgerMenu";

type MenuWrapperProps = {
  userName: string;
  publicServant: boolean;
};

export default ({ userName, publicServant }: MenuWrapperProps) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleClick = useCallback(() => setMenuOpen(false), [setMenuOpen]);

  return (
    <>
      <button
        aria-label="events-menu"
        className={styles.hamburgerButton}
        onClick={() => setMenuOpen(true)}
      >
        <ds.Icon
          icon="hamburger-menu"
          color={ds.colours.ogcio.white}
          heigth={12}
          width={18}
        />
      </button>
      <div
        className={`${styles.hamburgerMenuWrapper} ${menuOpen ? styles.visible : ""}`}
      >
        {menuOpen && <div className={styles.backdrop} onClick={handleClick} />}
        <div className={`${styles.sidebar} ${menuOpen ? styles.visible : ""}`}>
          <HamburgerMenu
            userName={userName}
            publicServant={publicServant}
            handleClick={handleClick}
          />
        </div>
      </div>
    </>
  );
};
