import { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/checkout", "/account/", "/cart", "/order/"],
      },
    ],
    sitemap: "https://taran-industrie.com/sitemap.xml",
  }
}
