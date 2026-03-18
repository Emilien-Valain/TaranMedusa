import React from "react"

import Footer from "@/modules/layout/templates/footer"
import { NavigationHeader } from "@/modules/layout/templates/nav"

const Layout: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <div>
      <NavigationHeader />
      {/* pt compensates for the fixed navbar on non-hero pages (nav ≈ 60px + 32px breathing) */}
      <main className="relative pt-[92px]">{children}</main>
      <Footer />
    </div>
  )
}

export default Layout
