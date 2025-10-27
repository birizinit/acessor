"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Bell, X, Trash2 } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { createApiClient } from "@/lib/api"

interface Notification {
  id: number
  date: string
  message: string
  unread: boolean
  type: "trade_success" | "trade_failure" | "deposit" | "withdrawal" | "level_up"
}

export function Header() {
  const pathname = usePathname()
  const [activeNav, setActiveNav] = useState("Home")
  const [showNotifications, setShowNotifications] = useState(false)
  const router = useRouter()
  const [userName, setUserName] = useState("Usuário")

  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    const fetchUserData = async () => {
      const apiClient = createApiClient()
      if (!apiClient) return

      try {
        const userData = await apiClient.getUserInfo()
        setUserName(userData.name || userData.nickname || "Usuário")
      } catch (error) {
        console.error("[v0] Error fetching user data:", error)
      }
    }

    fetchUserData()

    const savedNotifications = localStorage.getItem("notifications")
    if (savedNotifications) {
      try {
        setNotifications(JSON.parse(savedNotifications))
      } catch (error) {
        console.error("[v0] Error parsing notifications:", error)
        setNotifications([])
      }
    }

    const handleNewNotification = (event: CustomEvent) => {
      const newNotification = event.detail as Notification
      setNotifications((prev) => {
        const updated = [newNotification, ...prev]
        localStorage.setItem("notifications", JSON.stringify(updated))
        return updated
      })
    }

    window.addEventListener("newNotification" as any, handleNewNotification)

    return () => {
      window.removeEventListener("newNotification" as any, handleNewNotification)
    }
  }, [])

  useEffect(() => {
    if (pathname === "/operacoes") {
      setActiveNav("Operações")
    } else if (pathname === "/tutoriais") {
      setActiveNav("Tutoriais")
    } else if (pathname === "/perfil") {
      setActiveNav("Meu perfil")
    } else {
      setActiveNav("Home")
    }
  }, [pathname])

  const unreadCount = notifications.filter((n) => n.unread).length

  const handleNotificationClick = (id: number) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
      localStorage.setItem("notifications", JSON.stringify(updated))
      return updated
    })
  }

  const handleClearAll = () => {
    setNotifications([])
    localStorage.removeItem("notifications")
  }

  const navItems = [
    { key: "Home", label: "Home" },
    { key: "Operações", label: "Operações" },
    { key: "Tutoriais", label: "Tutoriais" },
    { key: "Meu perfil", label: "Meu perfil" },
    { key: "Sair", label: "Sair" },
  ]

  const handleNavClick = (item: string) => {
    setActiveNav(item)
    if (item === "Sair") {
      localStorage.removeItem("isAuthenticated")
      router.push("/login")
      return
    }
    if (item === "Home") {
      router.push("/")
      return
    }
    if (item === "Operações") {
      router.push("/operacoes")
      return
    }
    if (item === "Tutoriais") {
      router.push("/tutoriais")
      return
    }
    if (item === "Meu perfil") {
      router.push("/perfil")
      return
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) {
      return "Bom dia"
    } else if (hour >= 12 && hour < 18) {
      return "Boa tarde"
    } else {
      return "Boa noite"
    }
  }

  return (
    <header className="py-7 relative">
      <div className="container mx-auto px-4 md:px-10 lg:px-[124px] max-w-[1920px]">
        <div className="flex flex-wrap justify-between items-center gap-5">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-[60px]">
            <Link href="/" className="flex items-center gap-2.5">
              <Image src="/assets/Subtract.svg" alt="Assessor Logo" width={39} height={49} />
              <div className="flex flex-col text-white">
                <span className="font-[Public_Sans] font-extrabold text-[14.7px] leading-none">meu</span>
                <span className="font-[Public_Sans] font-extrabold text-[26.8px] leading-none">assessor</span>
              </div>
            </Link>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-semibold text-[20.8px] text-white">
                  {getGreeting()}, {userName}!
                </h2>
                <Image src="/assets/hands.png" alt="👋" width={22} height={22} />
              </div>
              <p className="text-[13.9px] text-[#aeabd8]">Suas operações vão muito bem, continue assim!</p>
            </div>
          </div>
          <div className="flex items-center gap-12">
            <nav className="hidden lg:block">
              <ul className="flex gap-8">
                {navItems.map((item) => (
                  <li key={item.key}>
                    <button
                      onClick={() => handleNavClick(item.key)}
                      className={`font-[Poppins] text-[17px] transition-colors ${
                        activeNav === item.key ? "text-[#845bf6] font-bold" : "text-[#aeabd8] hover:text-[#845bf6]"
                      }`}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="flex items-center gap-6">
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 bg-transparent border-none cursor-pointer hover:bg-[#27264e]/50 rounded-lg transition-colors"
                >
                  <Bell className="w-6 h-6 text-gray-400" />
                </button>
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 bg-[#f2474a] text-white rounded-full w-[14.5px] h-[14.5px] flex items-center justify-center text-[8.7px]">
                    {unreadCount}
                  </span>
                )}

                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                    <div className="absolute right-0 top-12 w-[348px] bg-[#1d1d41] border border-[rgba(174,171,216,0.25)] rounded-xl shadow-2xl z-50 overflow-hidden">
                      <div className="flex items-center justify-between p-4 border-b border-[rgba(174,171,216,0.15)]">
                        <h3 className="text-white font-semibold text-lg">Avisos</h3>
                        <div className="flex items-center gap-2">
                          {notifications.length > 0 && (
                            <button
                              onClick={handleClearAll}
                              className="p-1.5 hover:bg-[#27264e]/50 rounded-lg transition-colors"
                              title="Limpar todas"
                            >
                              <Trash2 className="w-4 h-4 text-[#aeabd8]" />
                            </button>
                          )}
                          <button
                            onClick={() => setShowNotifications(false)}
                            className="p-1 hover:bg-[#27264e]/50 rounded-lg transition-colors"
                          >
                            <X className="w-5 h-5 text-[#aeabd8]" />
                          </button>
                        </div>
                      </div>
                      <div className="max-h-[500px] overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center">
                            <Bell className="w-12 h-12 text-[#aeabd8] mx-auto mb-3 opacity-50" />
                            <p className="text-[#aeabd8] text-sm">Nenhuma notificação</p>
                            <p className="text-[#8c89b4] text-xs mt-1">
                              Você será notificado sobre trades, depósitos e saques
                            </p>
                          </div>
                        ) : (
                          notifications.map((notification) => (
                            <div
                              key={notification.id}
                              onClick={() => handleNotificationClick(notification.id)}
                              className="p-4 border-b border-[rgba(174,171,216,0.15)] hover:bg-[#27264e]/30 transition-colors cursor-pointer"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                  <p className="text-[#aeabd8] text-xs mb-2">{notification.date}</p>
                                  <p className="text-white text-sm leading-relaxed">{notification.message}</p>
                                </div>
                                {notification.unread && (
                                  <div className="w-2 h-2 bg-[#7c3aed] rounded-full mt-1 flex-shrink-0" />
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
              <Image src="/assets/Ellipse.svg" alt="User Avatar" width={44} height={44} className="rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
