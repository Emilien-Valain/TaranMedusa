import { listCategories } from "@/lib/data/categories"
import { listCollections } from "@/lib/data/collections"
import { Text, clx } from "@medusajs/ui"
import Image from "next/image"

import LocalizedClientLink from "@/modules/common/components/localized-client-link"

export default async function Footer() {
  const { collections } = await listCollections({
    offset: "0",
    limit: "6",
  })
  const product_categories = await listCategories({
    offset: 0,
    limit: 6,
  })

  return (
    <footer className="w-full bg-[#0d2b5e] text-white border-t-2 border-[#0099d6]">
      {/* Main footer content */}
      <div className="content-container flex flex-col w-full py-12">
        <div className="flex flex-col gap-y-10 xsmall:flex-row items-start justify-between">
          {/* Brand column */}
          <div className="flex flex-col gap-4 max-w-xs">
            <LocalizedClientLink href="/">
              <Image
                src="/logo-transparent.png"
                alt="Taran Industrie"
                width={180}
                height={65}
                style={{ objectFit: "contain", filter: "brightness(0) invert(1)" }}
              />
            </LocalizedClientLink>
            <p className="text-[#0099d6] italic text-sm">
              Définir les besoins, livrer les solutions !
            </p>
            <div className="text-sm text-blue-200 flex flex-col gap-1 mt-2">
              <span>35, rue des Pierres Fortes</span>
              <span>85500 LES HERBIERS</span>
              <span className="mt-1">
                <a href="tel:0251924941" className="hover:text-[#0099d6] transition-colors">
                  Tél : 02 51 92 49 41
                </a>
              </span>
              <span>
                <a href="mailto:contact@taran-industrie.com" className="hover:text-[#0099d6] transition-colors">
                  contact@taran-industrie.com
                </a>
              </span>
            </div>
          </div>

          {/* Nav columns */}
          <div className="text-sm gap-10 md:gap-x-16 grid grid-cols-2 sm:grid-cols-3">
            {product_categories && product_categories?.length > 0 && (
              <div className="flex flex-col gap-y-3">
                <span className="text-[#0099d6] font-semibold uppercase text-xs tracking-wider">
                  Catégories
                </span>
                <ul className="grid grid-cols-1 gap-2" data-testid="footer-categories">
                  {product_categories?.slice(0, 6).map((c) => {
                    if (c.parent_category) return null

                    const children =
                      c.category_children?.map((child) => ({
                        name: child.name,
                        handle: child.handle,
                        id: child.id,
                      })) || null

                    return (
                      <li className="flex flex-col gap-2 text-blue-200" key={c.id}>
                        <LocalizedClientLink
                          className={clx(
                            "hover:text-[#0099d6] transition-colors",
                            children && "font-medium text-white"
                          )}
                          href={`/categories/${c.handle}`}
                          data-testid="category-link"
                        >
                          {c.name}
                        </LocalizedClientLink>
                        {children && (
                          <ul className="grid grid-cols-1 ml-3 gap-2">
                            {children.map((child) => (
                              <li key={child.id}>
                                <LocalizedClientLink
                                  className="hover:text-[#0099d6] transition-colors"
                                  href={`/categories/${child.handle}`}
                                  data-testid="category-link"
                                >
                                  {child.name}
                                </LocalizedClientLink>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
            {collections && collections.length > 0 && (
              <div className="flex flex-col gap-y-3">
                <span className="text-[#0099d6] font-semibold uppercase text-xs tracking-wider">
                  Collections
                </span>
                <ul className="grid grid-cols-1 gap-2 text-blue-200">
                  {collections?.slice(0, 6).map((c) => (
                    <li key={c.id}>
                      <LocalizedClientLink
                        className="hover:text-[#0099d6] transition-colors"
                        href={`/collections/${c.handle}`}
                      >
                        {c.title}
                      </LocalizedClientLink>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#1565c0]">
        <div className="content-container flex w-full py-4 justify-between items-center">
          <Text className="text-blue-300 text-xs">
            © {new Date().getFullYear()} Taran Industrie. Tous droits réservés.
          </Text>
          <div className="flex items-center gap-1">
            <Image
              src="/images/france.png"
              alt=""
              width={20}
              height={14}
              className="hidden"
            />
            <span className="text-blue-300 text-xs">Fabriqué en France</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
