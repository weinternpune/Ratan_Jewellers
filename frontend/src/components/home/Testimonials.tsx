"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Priya Sharma",
    location: "Mumbai",
    rating: 5,
    text: "Bought my wedding set from Ratan Jewellers and I couldn't be happier. The craftsmanship is exquisite and the gold quality is exceptional. ",
    product: "Bridal Necklace Set",
  },
  {
    id: 2,
    name: "Anita Patel",
    location: "Surat",
    rating: 5,
    text: "The diamond ring I ordered for my engagement is absolutely stunning. WhatsApp delivery updates were so convenient. Customer service is top-notch.",
    product: "Diamond Solitaire Ring",
  },
  {
    id: 3,
    name: "Meera Krishnan",
    location: "Chennai",
    rating: 5,
    text: "I've been buying from Ratan Jewellers for 15 years. Their exchange policy is fair, pricing is transparent, and quality never disappoints. Highly recommend!",
    product: "Gold Bangles Set",
  },
  {
    id: 4,
    name: "Sunita Agarwal",
    location: "Jaipur",
    rating: 5,
    text: "Ordered earrings online and received them beautifully packaged. The weight and purity matched exactly as described. Will definitely shop again!",
    product: "Temple Jhumka Earrings",
  },
];

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

export default function Testimonials() {
  const [current, setCurrent] = useState(0);
  const [visibleCount, setVisibleCount] = useState(1);

  useEffect(() => {
    const updateVisibleCount = () => {
      if (window.innerWidth >= 1024) {
        setVisibleCount(3);
      } else if (window.innerWidth >= 768) {
        setVisibleCount(2);
      } else {
        setVisibleCount(1);
      }
    };

    updateVisibleCount();
    window.addEventListener("resize", updateVisibleCount);

    return () => window.removeEventListener("resize", updateVisibleCount);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrent((value) => (value + 1) % testimonials.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, []);

  const visibleTestimonials = useMemo(
    () =>
      Array.from({ length: visibleCount }, (_, index) => {
        return testimonials[(current + index) % testimonials.length];
      }),
    [current, visibleCount],
  );

  const goToPrevious = () => {
    setCurrent(
      (value) => (value - 1 + testimonials.length) % testimonials.length,
    );
  };

  const goToNext = () => {
    setCurrent((value) => (value + 1) % testimonials.length);
  };

  return (
    <section className="bg-[var(--ivory)] py-11 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-8 text-center">
          <div className="mb-2 flex w-full items-center justify-center gap-3">
            <span className="h-px w-8 bg-[var(--gold)]/70 sm:w-12" />
            <span className="text-[0.85rem] text-[var(--gold)]">◇</span>
            <p className="font-display text-2xl sm:text-3xl font-semibold uppercase tracking-[0.08em] text-[var(--charcoal)]">
              WHAT OUR CUSTOMERS SAY
            </p>
            <span className="text-[0.85rem] text-[var(--gold)]">◇</span>
            <span className="h-px w-8 bg-[var(--gold)]/70 sm:w-12" />
          </div>
        </div>

        <div className="relative">
          <motion.div
            key={`${current}-${visibleCount}`}
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3"
          >
            {visibleTestimonials.map((testimonial) => (
              <motion.article
                key={testimonial.id}
                className="group relative flex min-h-[260px] flex-col  rounded-lg border border-[var(--gold)]/20 bg-white px-7 py-6 text-center shadow-[0_8px_26px_rgba(13,7,0,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--gold)]/40 hover:shadow-[0_14px_34px_rgba(13,7,0,0.1)]"
              >
                <Quote
                  size={36}
                  strokeWidth={1.2}
                  className="absolute right-5 top-5 text-[rgba(201,168,76,0.1)] transition-colors duration-300 group-hover:text-[rgba(201,168,76,0.18)]"
                />

                <div className="mb-2 flex justify-center gap-1">
                  {Array.from({ length: testimonial.rating }).map(
                    (_, starIndex) => (
                      <Star
                        key={starIndex}
                        size={14}
                        fill="var(--gold)"
                        stroke="var(--gold)"
                        strokeWidth={1.5}
                      />
                    ),
                  )}
                </div>

                <p className="mx-auto min-h-[80px] text-sm leading-6 text-[var(--charcoal)]/75 mb-3">
                  &ldquo;{testimonial.text}&rdquo;
                </p>

                <div className="mt-1 flex items-center justify-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[var(--gold)]/35 bg-gradient-to-br from-[var(--gold-100)] to-white font-display text-lg font-semibold text-[var(--gold-dark)] shadow-inner">
                    {getInitials(testimonial.name)}
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm font-medium leading-tight text-[var(--charcoal)]">
                      {testimonial.name}
                    </h3>
                    <p className="mt-0.5 text-[11px] uppercase tracking-[0.12em] text-[var(--warm-grey)]">
                      {testimonial.location}
                    </p>
                    <p className="mt-1 font-mono-code text-[10px] uppercase tracking-[0.12em] text-[var(--gold-dark)]">
                      {testimonial.product}
                    </p>
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>

          <div className="mt-7 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={goToPrevious}
              aria-label="Show previous testimonials"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--gold)]/35 bg-white text-[var(--gold-dark)] transition-all duration-300 hover:border-[var(--gold)] hover:bg-[var(--gold-50)]"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="flex items-center gap-2">
              {testimonials.map((testimonial, index) => (
                <button
                  key={testimonial.id}
                  type="button"
                  onClick={() => setCurrent(index)}
                  aria-label={`Show testimonial ${index + 1}`}
                  aria-current={index === current ? "true" : undefined}
                  className={`rounded-full transition-all duration-300 focus:outline-none ${
                    index === current
                      ? "h-2.5 w-6 bg-[var(--gold)]"
                      : "h-3 w-3 bg-[var(--gold)]"
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={goToNext}
              aria-label="Show next testimonials"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--gold)]/35 bg-white text-[var(--gold-dark)] transition-all duration-300 hover:border-[var(--gold)] hover:bg-[var(--gold-50)]"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
