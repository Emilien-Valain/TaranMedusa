"use client"

import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"
import LocalizedClientLink from "@/modules/common/components/localized-client-link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

const MegaMenu = ({
  categories,
}: {
  categories: HttpTypes.StoreProductCategory[]
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<
    HttpTypes.StoreProductCategory["id"] | null
  >(null)

  const pathname = usePathname()

  const mainCategories = categories.filter(
    (category) => !category.parent_category_id
  )

  const getSubCategories = (categoryId: string) => {
    return categories.filter(
      (category) => category.parent_category_id === categoryId
    )
  }

  let menuTimeout: NodeJS.Timeout | null = null
  let categoryTimeout: NodeJS.Timeout | null = null

  const handleMenuHover = () => {
    if (menuTimeout) clearTimeout(menuTimeout)
    setIsHovered(true)
  }

  const handleMenuLeave = () => {
    menuTimeout = setTimeout(() => setIsHovered(false), 250)
    return () => { if (menuTimeout) clearTimeout(menuTimeout) }
  }

  const handleCategoryHover = (categoryId: string) => {
    categoryTimeout = setTimeout(() => setSelectedCategory(categoryId), 150)
    return () => { if (categoryTimeout) clearTimeout(categoryTimeout) }
  }

  const handleCategoryLeave = () => {
    if (categoryTimeout) clearTimeout(categoryTimeout)
  }

  useEffect(() => {
    setIsHovered(false)
  }, [pathname])

  return (
    <>
      <div
        onMouseEnter={handleMenuHover}
        onMouseLeave={handleMenuLeave}
        className="relative z-50"
      >
        {/* Trigger */}
        <LocalizedClientLink
          className="text-white/90 hover:text-white text-sm font-normal px-3 py-1.5 rounded-full border border-transparent hover:border-white/30 transition-all duration-200 flex items-center gap-1"
          href="/store"
        >
          Produits
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="currentColor"
            style={{
              transition: "transform 0.2s ease",
              transform: isHovered ? "rotate(180deg)" : "rotate(0deg)",
              opacity: 0.7,
            }}
          >
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          </svg>
        </LocalizedClientLink>

        {/* Dropdown — starts at top-full with pt-3 for the visual gap (keeps hover continuous) */}
        {isHovered && (
          <div
            className="dropdown-enter absolute left-0 top-full pt-3 w-fit min-w-[220px]"
            style={{ zIndex: 9999 }}
          >
            {/* Dropdown body */}
            <div
              style={{
                background: "rgba(10, 31, 60, 0.92)",
                backdropFilter: "blur(18px)",
                WebkitBackdropFilter: "blur(18px)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              }}
            >
              <div className="flex">
                {/* Main categories */}
                <div className={clx("flex flex-col py-2", selectedCategory ? "border-r border-white/10" : "")}>
                  {mainCategories.length > 0 ? (
                    mainCategories.map((category, idx) => (
                      <LocalizedClientLink
                        key={category.id}
                        href={`/categories/${category.handle}`}
                        className={clx(
                          "flex items-center justify-between px-5 py-3 text-sm font-normal transition-all duration-200 whitespace-nowrap",
                          "hover:text-white",
                          selectedCategory === category.id ? "text-white" : "text-white/80"
                        )}
                        style={{
                          background: selectedCategory === category.id
                            ? "rgba(255,255,255,0.09)"
                            : "transparent",
                          borderBottom:
                            idx < mainCategories.length - 1
                              ? "1px solid rgba(255,255,255,0.06)"
                              : "none",
                        }}
                        onMouseEnter={() => handleCategoryHover(category.id)}
                        onMouseLeave={handleCategoryLeave}
                      >
                        <span>{category.name}</span>
                        {getSubCategories(category.id).length > 0 && (
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="ml-4 opacity-50">
                            <path d="M3 2l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                        )}
                      </LocalizedClientLink>
                    ))
                  ) : (
                    <LocalizedClientLink
                      href="/store"
                      className="px-5 py-3 text-sm text-white/80 hover:text-white transition-all duration-200"
                    >
                      Tous les produits
                    </LocalizedClientLink>
                  )}
                </div>

                {/* Sub-categories panel */}
                {selectedCategory && getSubCategories(selectedCategory).length > 0 && (
                  <div className="flex flex-col py-2 min-w-[180px]">
                    {getSubCategories(selectedCategory).map((category, idx, arr) => (
                      <LocalizedClientLink
                        key={category.id}
                        href={`/categories/${category.handle}`}
                        className="px-5 py-3 text-sm text-white/70 hover:text-white hover:bg-white/8 transition-all duration-200 whitespace-nowrap"
                        style={{
                          borderBottom:
                            idx < arr.length - 1
                              ? "1px solid rgba(255,255,255,0.06)"
                              : "none",
                        }}
                      >
                        {category.name}
                      </LocalizedClientLink>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Backdrop blur when menu open */}
      {isHovered && (
        <div
          className="fixed inset-0 z-[-1]"
          onMouseEnter={handleMenuLeave}
        />
      )}
    </>
  )
}

export default MegaMenu
