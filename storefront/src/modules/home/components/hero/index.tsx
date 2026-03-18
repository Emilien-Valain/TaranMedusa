"use client"

import Image from "next/image"
import LocalizedClientLink from "@/modules/common/components/localized-client-link"

const Hero = () => {
  return (
    <div className="relative w-full overflow-hidden" style={{ minHeight: "85vh" }}>
      {/* Background image */}
      <Image
        src="/hero-image.jpg"
        alt="Taran Industrie - Solutions professionnelles"
        fill
        style={{ objectFit: "cover", objectPosition: "center" }}
        quality={90}
        priority
      />

      {/* Gradient overlay — vertical, top heavy to ensure text contrast */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to bottom, rgba(10,31,60,0.82) 0%, rgba(10,31,60,0.45) 60%, rgba(10,31,60,0.30) 100%)",
        }}
      />

      {/* Content */}
      <div
        className="absolute inset-0 flex flex-col justify-center items-center text-center text-white"
        style={{ paddingTop: "80px", paddingLeft: "24px", paddingRight: "24px" }}
      >
        {/* Logo — white version */}
        <div className="mb-8">
          <Image
            src="/logo-transparent.png"
            alt="Taran Industrie"
            width={320}
            height={115}
            style={{
              objectFit: "contain",
              filter: "brightness(0) invert(1)",
              maxWidth: "min(320px, 70vw)",
              height: "auto",
            }}
            priority
          />
        </div>

        {/* H1 tagline */}
        <h1
          className="font-bold text-white"
          style={{
            fontSize: "clamp(1.8rem, 5vw, 3.2rem)",
            lineHeight: 1.15,
            textShadow: "0 2px 12px rgba(0,0,0,0.5)",
            maxWidth: "800px",
            marginBottom: "1.25rem",
          }}
        >
          Définir les besoins,{" "}
          <span style={{ color: "#0099d6" }}>livrer les solutions&nbsp;!</span>
        </h1>

        {/* Sous-texte */}
        <p
          className="font-light"
          style={{
            fontSize: "clamp(1rem, 2vw, 1.2rem)",
            opacity: 0.82,
            maxWidth: "560px",
            lineHeight: 1.6,
            marginBottom: "2.25rem",
          }}
        >
          Spécialiste des lingettes professionnelles et produits de nettoyage
          industriels. Fabriqué en France.
        </p>

        {/* CTA pill button */}
        <LocalizedClientLink href="/store">
          <button
            className="font-semibold text-white"
            style={{
              background: "#0099d6",
              border: "none",
              borderRadius: "50px",
              padding: "16px 44px",
              fontSize: "1.05rem",
              cursor: "pointer",
              transition: "transform 0.25s ease, box-shadow 0.25s ease",
              boxShadow: "0 4px 18px rgba(0,153,214,0.35)",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLButtonElement
              el.style.transform = "scale(1.05)"
              el.style.boxShadow = "0 8px 28px rgba(0,153,214,0.5)"
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLButtonElement
              el.style.transform = "scale(1)"
              el.style.boxShadow = "0 4px 18px rgba(0,153,214,0.35)"
            }}
          >
            Voir nos produits
          </button>
        </LocalizedClientLink>
      </div>

      {/* Wave SVG separator at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 leading-none" style={{ lineHeight: 0 }}>
        <svg
          viewBox="0 0 1440 70"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          style={{ display: "block", width: "100%", height: "70px" }}
        >
          <path
            d="M0,40 C240,80 480,0 720,35 C960,70 1200,10 1440,40 L1440,70 L0,70 Z"
            fill="white"
          />
        </svg>
      </div>
    </div>
  )
}

export default Hero
