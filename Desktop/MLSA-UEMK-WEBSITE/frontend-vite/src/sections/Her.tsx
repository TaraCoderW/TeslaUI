
import { motion } from "framer-motion";
import { lazy, Suspense } from "react";



export default function Hero() {
  return (
    <section
      className="
      relative
      min-h-screen
      overflow-hidden
      bg-[#070B14]
      "
    >

      {/* Background Grid */}

      <div
        className="
        absolute inset-0
        bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)]
        bg-[size:80px_80px]
        "
      />

      {/* Main Glow */}

      <div
        className="
        absolute
        top-1/2 left-1/2
        -translate-x-1/2 -translate-y-1/2
        w-[900px]
        h-[900px]
        rounded-full
        bg-blue-500/10
        blur-[180px]
        "
      />

      {/* Extra Cyan Glow */}

      <div
        className="
        absolute
        top-[20%]
        right-[10%]
        w-[400px]
        h-[400px]
        rounded-full
        bg-cyan-400/10
        blur-[120px]
        "
      />

      {/* Main Layout */}

      <div
        className="
        relative z-10
        grid
        lg:grid-cols-2
        min-h-screen
        "
      >

        {/* LEFT SIDE */}

        <div
          className="
          flex
          flex-col
          justify-center
          px-8
          md:px-16
          pt-32
          lg:pt-0
          "
        >

          <motion.div
            initial={{
              opacity: 0,
              y: 40,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 1,
            }}
          >

            {/* Small Badge */}

            <div
              className="
              inline-flex
              items-center
              gap-2
              px-4
              py-2
              rounded-full
              border border-white/10
              bg-white/5
              backdrop-blur-md
              text-sm
              text-cyan-300
              mb-8
              "
            >
              Microsoft Student Society
            </div>

            {/* Heading */}

            <motion.h1
              initial={{
                opacity: 0,
                scale: 0.9,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              transition={{
                duration: 1,
              }}
              className="
              text-6xl
              sm:text-7xl
              md:text-8xl
              xl:text-9xl
              font-black
              tracking-tight
              leading-none
              bg-gradient-to-r
              from-white
              via-blue-200
              to-cyan-300
              bg-clip-text
              text-transparent
              "
            >
              MSS
              <br />
              UEMK
            </motion.h1>

            {/* Subtitle */}

            <motion.p
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              transition={{
                delay: 0.3,
              }}
              className="
              mt-8
              text-gray-300
              text-lg
              md:text-xl
              max-w-xl
              leading-relaxed
              "
            >
              ABRACADABRA.
            </motion.p>

            {/* Buttons */}

            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.5,
              }}
              className="
              mt-10
              flex
              flex-wrap
              gap-4
              "
            >

              <button
                className="
                px-8
                py-4
                rounded-2xl
                bg-gradient-to-r
                from-blue-500
                to-cyan-400
                text-white
                font-semibold
                shadow-[0_0_30px_rgba(59,130,246,0.4)]
                hover:scale-105
                transition-all
                duration-300
                "
              >
                Join Community
              </button>

              <button
                className="
                px-8
                py-4
                rounded-2xl
                border
                border-white/10
                bg-white/5
                backdrop-blur-md
                text-white
                hover:bg-white/10
                transition-all
                duration-300
                "
              >
                Explore Events
              </button>

            </motion.div>

          </motion.div>
        </div>

        {/* RIGHT SIDE */}

        <div
          className="
          relative
          h-[700px]
          lg:h-screen
          "
        >

          {/* Robot Glow */}

          <div
            className="
            absolute
            inset-0
            flex
            items-center
            justify-center
            pointer-events-none
            "
          >
            <div
              className="
              w-[500px]
              h-[500px]
              rounded-full
              bg-cyan-400/10
              blur-[120px]
              "
            />
          </div>

          {/* 3D Robot */}

          

        </div>

      </div>
    </section>
  );
}