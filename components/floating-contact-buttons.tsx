"use client"

import { Phone, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export function FloatingContactButtons() {
  const phoneNumber = process.env.NEXT_PUBLIC_PHONE_NUMBER || "+886-2-1234-5678"
  const lineId = process.env.NEXT_PUBLIC_LINE_ID || "your-line-id"

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {/* LINE 按鈕 */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
      >
        <Button
          size="icon"
          className="h-14 w-14 rounded-full bg-[#06C755] hover:bg-[#05B048] shadow-lg"
          onClick={() => window.open(`https://line.me/ti/p/${lineId}`, "_blank")}
          aria-label="LINE 諮詢"
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>
      </motion.div>

      {/* 電話按鈕 */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
      >
        <Button
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg"
          onClick={() => window.open(`tel:${phoneNumber}`, "_self")}
          aria-label="電話諮詢"
        >
          <Phone className="h-6 w-6" />
        </Button>
      </motion.div>
    </div>
  )
}
