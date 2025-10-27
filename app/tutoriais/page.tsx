"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Search, Check } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface Video {
  id: number
  title: string
  duration: string
  watched: boolean
  videoUrl: string
}

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

export default function TutoriaisPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const playerRef = useRef<any>(null)
  const playerContainerRef = useRef<HTMLDivElement>(null)

  const [videos, setVideos] = useState<Video[]>([
    {
      id: 1,
      title: "Como operar pela primeira vez",
      duration: "15:00",
      watched: false,
      videoUrl: "DumytDSlii0",
    },
    {
      id: 2,
      title: "Como fazer deposito",
      duration: "10:30",
      watched: false,
      videoUrl: "SaA1V7dT_9E",
    },
    {
      id: 3,
      title: "Como fazer seu saque",
      duration: "08:45",
      watched: false,
      videoUrl: "18-6Tzz_hbI",
    },
    {
      id: 4,
      title: "Como fazer xxxxx",
      duration: "12:20",
      watched: false,
      videoUrl: "pUodwfXHt00",
    },
    {
      id: 5,
      title: "Como fazer xxxxx",
      duration: "15:00",
      watched: false,
      videoUrl: "DumytDSlii0",
    },
    {
      id: 6,
      title: "Como fazer xxxxx",
      duration: "10:30",
      watched: false,
      videoUrl: "SaA1V7dT_9E",
    },
    {
      id: 7,
      title: "Como fazer xxxxx",
      duration: "08:45",
      watched: false,
      videoUrl: "18-6Tzz_hbI",
    },
  ])

  useEffect(() => {
    const savedVideos = localStorage.getItem("tutorialVideos")
    if (savedVideos) {
      setVideos(JSON.parse(savedVideos))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("tutorialVideos", JSON.stringify(videos))
  }, [videos])

  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated")
    if (authStatus !== "true") {
      router.push("/login")
    } else {
      setIsAuthenticated(true)
    }
  }, [router])

  useEffect(() => {
    if (!isAuthenticated) return

    const tag = document.createElement("script")
    tag.src = "https://www.youtube.com/iframe_api"
    const firstScriptTag = document.getElementsByTagName("script")[0]
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)

    window.onYouTubeIframeAPIReady = () => {
      initializePlayer()
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy()
      }
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (window.YT && window.YT.Player && isAuthenticated) {
      initializePlayer()
    }
  }, [currentVideoIndex, isAuthenticated])

  const initializePlayer = () => {
    if (playerRef.current) {
      playerRef.current.destroy()
    }

    const currentVideo = filteredVideos[currentVideoIndex]
    if (!currentVideo || !playerContainerRef.current) return

    playerRef.current = new window.YT.Player(playerContainerRef.current, {
      videoId: currentVideo.videoUrl,
      playerVars: {
        autoplay: 0,
        controls: 1,
        modestbranding: 1,
        rel: 0,
      },
      events: {
        onStateChange: onPlayerStateChange,
      },
    })
  }

  const onPlayerStateChange = (event: any) => {
    if (event.data === 0) {
      toggleVideoWatched()
    }
  }

  const toggleVideoWatched = () => {
    const updatedVideos = [...videos]
    const videoId = filteredVideos[currentVideoIndex].id
    const videoIndex = updatedVideos.findIndex((v) => v.id === videoId)
    if (videoIndex !== -1) {
      updatedVideos[videoIndex].watched = !updatedVideos[videoIndex].watched
      setVideos(updatedVideos)
    }
  }

  const filteredVideos = videos.filter((video) => video.title.toLowerCase().includes(searchQuery.toLowerCase()))

  const watchedCount = videos.filter((v) => v.watched).length
  const progressPercentage = Math.round((watchedCount / videos.length) * 100)

  const handleVideoSelect = (index: number) => {
    setCurrentVideoIndex(index)
  }

  const handleNextVideo = () => {
    toggleVideoWatched()
    if (currentVideoIndex < filteredVideos.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#141332] flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    )
  }

  const currentVideo = filteredVideos[currentVideoIndex]

  return (
    <div className="min-h-screen bg-[#141332]">
      <Header />
      <main className="pb-12">
        <div className="container mx-auto px-4 md:px-10 lg:px-[124px] max-w-[1920px]">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-[380px] bg-[#1d1d41] border border-[rgba(174,171,216,0.25)] rounded-xl p-6">
              <div className="mb-6">
                <p className="text-[#aeabd8] text-sm mb-2">Seu progresso de aprendizagem</p>
                <div className="relative w-full h-2 bg-[#141332] rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#7c3aed] to-[#a855f7] rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <p className="text-[#7c3aed] text-sm font-semibold mt-2">{progressPercentage}%</p>
              </div>

              <div className="relative mb-6">
                <Input
                  type="text"
                  placeholder="Pesquisar vídeo"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[#141332] border-[rgba(174,171,216,0.25)] text-white placeholder:text-[#aeabd8] pr-10"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#aeabd8]" />
              </div>

              <div className="space-y-1">
                {filteredVideos.map((video, index) => (
                  <button
                    key={video.id}
                    onClick={() => handleVideoSelect(index)}
                    className={`w-full grid grid-cols-[1fr,90px,70px] gap-3 items-center py-3 px-3 rounded-lg transition-colors ${
                      currentVideoIndex === index ? "bg-[#7c3aed]/20" : "hover:bg-[#141332]/40"
                    }`}
                  >
                    <span className="text-white text-sm text-left truncate">{video.title}</span>
                    <div className="flex justify-center">
                      {video.watched && <Check className="w-5 h-5 text-[#7c3aed]" />}
                    </div>
                    <span className="text-[#aeabd8] text-sm text-right">{video.duration}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 bg-[#1d1d41] border border-[rgba(174,171,216,0.25)] rounded-xl p-6">
              {currentVideo ? (
                <>
                  <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden mb-6">
                    <div ref={playerContainerRef} className="w-full h-full" />
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-white text-xl font-semibold mb-1">{currentVideo.title}</h3>
                      <p className="text-[#aeabd8] text-sm">{currentVideo.duration}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={toggleVideoWatched} className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white">
                      {currentVideo.watched ? "Marcar como não visualizado" : "Marcar como visualizado"}
                    </Button>
                    {currentVideoIndex < filteredVideos.length - 1 && (
                      <Button
                        onClick={handleNextVideo}
                        className="bg-transparent border border-[rgba(174,171,216,0.25)] text-white hover:bg-[#7c3aed]/20"
                      >
                        Próximo
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full min-h-[400px]">
                  <p className="text-[#aeabd8]">Nenhum vídeo encontrado</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
