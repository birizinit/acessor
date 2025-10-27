"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type RiskProfile = "conservative" | "moderate" | "aggressive"

interface SavedProjection {
  bankValue: number
  selectedRisk: RiskProfile
  projectionPeriod: "day" | "month"
  selectedDay?: number
  selectedPeriodStart?: number
  selectedPeriodEnd?: number
  investment: number
  projection: number
  savedAt: string
}

export function ProjectionCard() {
  const router = useRouter()
  const [savedData, setSavedData] = useState<SavedProjection | null>(null)
  const [period, setPeriod] = useState<"day" | "month">("day")

  useEffect(() => {
    const loadSavedProjection = () => {
      const savedProjection = localStorage.getItem("savedProjection")
      if (savedProjection) {
        try {
          const data: SavedProjection = JSON.parse(savedProjection)
          setSavedData(data)
          setPeriod(data.projectionPeriod)
        } catch (error) {
          console.error("[v0] Error loading saved projection:", error)
        }
      }
    }

    loadSavedProjection()

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "savedProjection") {
        loadSavedProjection()
      }
    }

    window.addEventListener("storage", handleStorageChange)

    const handleCustomUpdate = () => {
      loadSavedProjection()
    }
    window.addEventListener("projectionUpdated", handleCustomUpdate)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("projectionUpdated", handleCustomUpdate)
    }
  }, [])

  const riskProfiles = {
    conservative: { percent: 1, name: "Conservador" },
    moderate: { percent: 3, name: "Moderado" },
    aggressive: { percent: 5, name: "Arrojado" },
  }

  const getDisplayValues = () => {
    if (!savedData) {
      return {
        percentage: 0,
        projectedValue: 0,
        investment: 0,
        riskName: "Conservador",
      }
    }

    const winRate = 0.87
    const payout = 0.6

    let projectedValue = savedData.investment * winRate * payout

    if (period === "month") {
      projectedValue = projectedValue * 22
    }

    const percentageGain = (projectedValue / savedData.bankValue) * 100

    return {
      percentage: percentageGain,
      projectedValue: projectedValue,
      investment: savedData.investment,
      riskName: riskProfiles[savedData.selectedRisk].name,
    }
  }

  const { percentage, projectedValue, investment, riskName } = getDisplayValues()

  const radius = 70
  const strokeWidth = 18
  const circumference = Math.PI * radius // Semicircle length
  const fillPercentage = Math.min(Math.max(percentage, 0), 100) / 100
  const strokeDashoffset = circumference * (1 - fillPercentage)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 3,
    }).format(value)
  }

  return (
    <Card className="bg-[#1d1d41] border-none rounded-[20px] p-5 flex flex-col">
      <div className="flex justify-between items-center mb-5 flex-wrap gap-2">
        <h4 className="text-lg font-semibold text-white">Projeção salva</h4>
        {savedData && (
          <div className="flex items-center border border-[rgba(174,171,216,0.53)] rounded-[50px] p-1">
            <Button
              variant="ghost"
              onClick={() => setPeriod("day")}
              className={`rounded-[50px] px-3.5 py-1.5 text-sm ${
                period === "day" ? "bg-[#845bf6] text-white" : "bg-transparent text-[#aeabd8]"
              }`}
            >
              Dia
            </Button>
            <Button
              variant="ghost"
              onClick={() => setPeriod("month")}
              className={`rounded-[50px] px-3.5 py-1.5 text-sm ${
                period === "month" ? "bg-[#845bf6] text-white" : "bg-transparent text-[#aeabd8]"
              }`}
            >
              Mês
            </Button>
          </div>
        )}
      </div>

      {!savedData ? (
        <div className="text-center py-12 text-[#aeabd8]">
          <p className="mb-2">Nenhuma projeção salva</p>
          <p className="text-sm">Use a calculadora para criar uma projeção</p>
        </div>
      ) : (
        <>
          <div className="relative mx-auto w-[200px] h-[130px] my-3 flex flex-col items-center justify-start">
            <svg width="200" height="130" viewBox="0 0 200 130" className="absolute top-0">
              {/* Background arc - dark shadow */}
              <path
                d="M 30 100 A 70 70 0 0 1 170 100"
                fill="none"
                stroke="rgba(39, 38, 78, 0.8)"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
              />
              {/* Progress arc - fills from left to right based on percentage */}
              <path
                d="M 30 100 A 70 70 0 0 1 170 100"
                fill="none"
                stroke="#00ff88"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                style={{
                  transition: "stroke-dashoffset 0.5s ease",
                  filter: "drop-shadow(0 0 10px rgba(0, 255, 136, 0.5))",
                }}
              />
            </svg>

            <div className="text-center mt-14 relative z-10">
              <p className="text-3xl font-bold text-white">{percentage.toFixed(1)}%</p>
              <p className="text-sm text-[#00ff88] mt-1">R${formatCurrency(projectedValue)}</p>
            </div>
          </div>

          <div className="flex justify-between items-end text-sm mt-6">
            <span className="text-[#f2474a] flex items-center gap-1">
              R$0
              <Image src="/assets/ARROWDOWN.svg" alt="Down" width={12} height={12} />
            </span>
            <span className="text-white">{riskName}</span>
            <span className="text-[#00ff88] flex items-center gap-1">
              R${formatCurrency(investment)}
              <Image src="/assets/arrow-up.svg" alt="Up" width={12} height={12} />
            </span>
          </div>
        </>
      )}

      <Button
        onClick={() => router.push("/operacoes")}
        variant="outline"
        className="w-full bg-transparent border border-[rgba(174,171,216,0.53)] text-[#aeabd8] rounded-[10px] py-2 text-sm hover:bg-[#27264e]/50 mt-4"
      >
        Visualizar operações
      </Button>
    </Card>
  )
}
