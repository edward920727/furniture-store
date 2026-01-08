"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function HeroBanner() {
  return (
    <section className="relative h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* 高品質背景圖片 */}
      <div className="absolute inset-0">
        <div 
          className="w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: "url(https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1920&q=80)"
          }}
        />
        {/* 深色遮罩層，讓文字更清晰 */}
        <div className="absolute inset-0 bg-black/40" />
      </div>
      
      {/* 文字內容疊在圖片中間 */}
      <div className="container relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <h1 className="text-5xl md:text-7xl font-light tracking-tight text-white drop-shadow-lg">
            張馨家居 - 打造法式優雅的居家靈魂
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto font-light drop-shadow-md">
            精選美式風格家具，為您的生活增添優雅與舒適
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/products">
              <Button 
                size="lg" 
                variant="outline" 
                className="group border-2 border-white/80 text-white bg-transparent hover:bg-[#D2B48C]/90 hover:border-[#D2B48C] transition-all duration-300"
              >
                探索產品
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/about">
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-white/80 text-white bg-transparent hover:bg-[#D2B48C]/90 hover:border-[#D2B48C] transition-all duration-300"
              >
                了解更多
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* 底部漸變過渡 */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  )
}
