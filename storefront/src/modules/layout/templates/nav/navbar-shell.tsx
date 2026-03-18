"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import Image from "next/image"
import LocalizedClientLink from "@/modules/common/components/localized-client-link"

type Props = {
  nav: React.ReactNode
  actions: React.ReactNode
}

export function NavbarShell({ nav, actions }: Props) {
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  // Only use transparent mode on the homepage (any locale variant, e.g. /fr, /en)
  const isHome = /^\/[^/]+\/?$/.test(pathname)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60)
    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 text-white"
      style={{
        background:
          isHome && !scrolled
            ? "transparent"
            : "rgba(10, 31, 60, 0.92)",
        backdropFilter: scrolled || !isHome ? "blur(12px)" : "none",
        WebkitBackdropFilter: scrolled || !isHome ? "blur(12px)" : "none",
        boxShadow:
          scrolled || !isHome ? "0 2px 24px rgba(0,0,0,0.35)" : "none",
        borderBottom:
          scrolled || !isHome ? "1px solid rgba(0,153,214,0.25)" : "none",
        transition: "background 0.3s ease, backdrop-filter 0.3s ease, box-shadow 0.3s ease, border 0.3s ease",
      }}
    >
      <header
        className="flex w-full content-container mx-auto justify-between items-center"
        style={{
          paddingTop: isHome && !scrolled ? "18px" : "10px",
          paddingBottom: isHome && !scrolled ? "18px" : "10px",
          transition: "padding 0.3s ease",
        }}
      >
        {/* Left: logo + nav */}
        <div className="flex items-center gap-6">
          <LocalizedClientLink href="/" className="flex items-center shrink-0">
            <Image
              src="/logo-transparent.png"
              alt="Taran Industrie"
              width={160}
              height={58}
              style={{
                objectFit: "contain",
                height: isHome && !scrolled ? "48px" : "38px",
                width: "auto",
                transition: "height 0.3s ease",
                filter: "brightness(0) invert(1)",
              }}
              priority
            />
          </LocalizedClientLink>

          <nav className="hidden small:block">{nav}</nav>
        </div>

        {/* Right: action buttons */}
        <div className="flex items-center gap-3">{actions}</div>
      </header>
    </div>
  )
}
