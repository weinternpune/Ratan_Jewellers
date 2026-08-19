"use client"

import { useState, useEffect } from "react"
import { ChevronRight, Phone } from "lucide-react"

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const heroImages = [
    "/hero/hero-couple.jpg",
    "/hero/hero-wedding.jpg",
    "/hero/hero-gold.jpg",
    "/hero/hero-diamond.jpg",
    "/hero/hero-traditional.jpg",
    "/hero/hero-bridal.jpg",
    "/hero/hero-7.jpg",
  "/hero/hero-8.jpg",
  "/hero/hero-9.jpg",
  ]

  const totalSlides = heroImages.length

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides)
    }, 4000)

    return () => clearInterval(timer)
  }, [totalSlides])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides)
  }

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + totalSlides) % totalSlides
    )
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  return (
    <section className="relative w-full overflow-hidden bg-[#1a0e08] m-0 p-0">

      {/* =====================================================
          HERO SLIDER
      ====================================================== */}

      <div
        className="
          relative
          w-full

          aspect-[16/9]

          sm:aspect-auto
          sm:h-[450px]

          md:h-[500px]

          lg:h-[620px]

          overflow-hidden
          m-0
          p-0
        "
      >

        {/* =================================================
            HERO IMAGES
        ================================================== */}

        {heroImages.map((image, index) => (
          <img
            key={image}
            src={image}
            alt={`Ratan Jewellers banner ${index + 1}`}
            className={`
              absolute
              inset-0

              block

              w-full
              h-full

              object-cover
              object-center

              transition-opacity
              duration-700
              ease-in-out

              ${
                index === currentSlide
                  ? "opacity-100"
                  : "opacity-0"
              }
            `}
          />
        ))}

        {/* =================================================
            SUBTLE OVERLAY
        ================================================== */}

        <div
          className="
            absolute
            inset-0
            pointer-events-none

            bg-gradient-to-b
            from-black/5
            via-transparent
            to-black/10

            sm:bg-transparent
          "
        />

      </div>


      {/* =====================================================
          PREVIOUS BUTTON
      ====================================================== */}

      <button
        onClick={prevSlide}
        className="
          hidden
          sm:flex

          absolute

          left-3
          md:left-6
          lg:left-8

          top-1/2
          -translate-y-1/2

          z-30

          w-9
          h-9

          md:w-10
          md:h-10

          rounded-full

          bg-black/50
          backdrop-blur-sm

          border
          border-white/20

          items-center
          justify-center

          text-white

          hover:bg-black/70

          transition-all
        "
        aria-label="Previous slide"
      >
        <ChevronRight
          size={17}
          className="rotate-180"
        />
      </button>


      {/* =====================================================
          NEXT BUTTON
      ====================================================== */}

      <button
        onClick={nextSlide}
        className="
          hidden
          sm:flex

          absolute

          right-[75px]
          md:right-[115px]
          lg:right-[150px]

          top-1/2
          -translate-y-1/2

          z-30

          w-9
          h-9

          md:w-10
          md:h-10

          rounded-full

          bg-black/50
          backdrop-blur-sm

          border
          border-white/20

          items-center
          justify-center

          text-white

          hover:bg-black/70

          transition-all
        "
        aria-label="Next slide"
      >
        <ChevronRight size={17} />
      </button>


      {/* =====================================================
          SLIDE INDICATORS
      ====================================================== */}

      <div
        className="
          absolute

          bottom-2
          sm:bottom-4
          md:bottom-5

          left-1/2
          -translate-x-1/2

          z-30

          flex
          items-center

          gap-1.5
          sm:gap-2

          px-2
          sm:px-3

          py-1
          sm:py-1.5

          rounded-full

          bg-black/25
          backdrop-blur-sm
        "
      >
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`
              rounded-full
              transition-all
              duration-300

              ${
                index === currentSlide
                  ? "w-5 sm:w-6 h-1.5 bg-white"
                  : "w-1.5 h-1.5 bg-white/60"
              }
            `}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>


      {/* =====================================================
          FLOATING ACTION BUTTONS
      ====================================================== */}

      <div
        className="
          absolute

          right-1
          min-[360px]:right-2
          sm:right-3
          md:right-5
          lg:right-7

          top-1/2
          -translate-y-1/2

          z-40

          bg-[#80623d]/95
          backdrop-blur-md

          rounded-xl
          sm:rounded-2xl

          shadow-xl

          border
          border-white/20

          py-2
          sm:py-3
          md:py-4

          px-1
          min-[360px]:px-1.5
          sm:px-2
          md:px-3
        "
      >

        <div
          className="
            flex
            flex-col

            gap-2
            min-[360px]:gap-2.5
            sm:gap-3
            md:gap-4
          "
        >

          {/* =================================================
              WHATSAPP
          ================================================== */}

          <a
            href="https://wa.me/917507510948"
            target="_blank"
            rel="noopener noreferrer"
            className="
              flex
              flex-col
              items-center
              justify-center

              text-white

              hover:scale-105

              transition-transform
            "
            aria-label="WhatsApp"
          >
            <div
              className="
                w-7
                h-7

                min-[360px]:w-8
                min-[360px]:h-8

                sm:w-8
                sm:h-8

                md:w-9
                md:h-9

                rounded-full

                border-[1.5px]
                border-white/90

                flex
                items-center
                justify-center

                mb-0.5
              "
            >
              <svg
                className="
                  w-3.5
                  h-3.5

                  min-[360px]:w-4
                  min-[360px]:h-4

                  md:w-5
                  md:h-5
                "
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
            </div>

            <span
              className="
                text-[7px]
                min-[360px]:text-[8px]
                sm:text-[9px]
                md:text-[10px]

                font-medium
                leading-tight
              "
            >
              WhatsApp
            </span>
          </a>


          {/* =================================================
              CALL
          ================================================== */}

          <a
            href="tel:+917507510948"
            className="
              flex
              flex-col
              items-center
              justify-center

              text-white

              hover:scale-105

              transition-transform
            "
            aria-label="Call us"
          >
            <div
              className="
                w-7
                h-7

                min-[360px]:w-8
                min-[360px]:h-8

                sm:w-8
                sm:h-8

                md:w-9
                md:h-9

                rounded-full

                border-[1.5px]
                border-white/90

                flex
                items-center
                justify-center

                mb-0.5
              "
            >
              <Phone
                size={14}
                className="
                  min-[360px]:w-4
                  min-[360px]:h-4

                  md:w-[18px]
                  md:h-[18px]
                "
              />
            </div>

            <span
              className="
                text-[7px]
                min-[360px]:text-[8px]
                sm:text-[9px]
                md:text-[10px]

                font-medium
                leading-tight
              "
            >
              Call Now
            </span>
          </a>


          {/* =================================================
              BOOK VISIT
          ================================================== */}

          <button
            className="
              flex
              flex-col
              items-center
              justify-center

              text-white

              hover:scale-105

              transition-transform
            "
            aria-label="Book Visit"
          >
            <div
              className="
                w-7
                h-7

                min-[360px]:w-8
                min-[360px]:h-8

                sm:w-8
                sm:h-8

                md:w-9
                md:h-9

                rounded-full

                border-[1.5px]
                border-white/90

                flex
                items-center
                justify-center

                mb-0.5
              "
            >
              <svg
                className="
                  w-3.5
                  h-3.5

                  min-[360px]:w-4
                  min-[360px]:h-4

                  md:w-[18px]
                  md:h-[18px]
                "
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <rect
                  x="3"
                  y="4"
                  width="18"
                  height="18"
                  rx="2"
                  ry="2"
                />

                <line
                  x1="16"
                  y1="2"
                  x2="16"
                  y2="6"
                />

                <line
                  x1="8"
                  y1="2"
                  x2="8"
                  y2="6"
                />

                <line
                  x1="3"
                  y1="10"
                  x2="21"
                  y2="10"
                />
              </svg>
            </div>

            <span
              className="
                text-[7px]
                min-[360px]:text-[8px]
                sm:text-[9px]
                md:text-[10px]

                font-medium
                leading-tight
              "
            >
              Book Visit
            </span>
          </button>

        </div>
      </div>

    </section>
  )
}