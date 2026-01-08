import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Phone, Mail, MapPin, Clock } from "lucide-react"

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-12">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-light">聯絡我們</h1>
            <p className="text-muted-foreground text-lg">我們很樂意為您提供協助</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  電話
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {process.env.NEXT_PUBLIC_PHONE_NUMBER || "+886-2-1234-5678"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  電子郵件
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">info@hsinfyhome.com</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  地址
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">台北市信義區信義路五段7號</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  營業時間
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">週一至週五：9:00 - 18:00</p>
                <p className="text-muted-foreground">週六：10:00 - 17:00</p>
                <p className="text-muted-foreground">週日：休息</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
