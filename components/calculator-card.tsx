"use client"

import type React from "react"

import { useState, useEffect } from "react"
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

export function CalculatorCard() {
  const [bankValue, setBankValue] = useState(125)
  const [inputValue, setInputValue] = useState("125,00")
  const [selectedRisk, setSelectedRisk] = useState<RiskProfile>("conservative")
  const [projectionPeriod, setProjectionPeriod] = useState<"day" | "month">("day")
  const [showCalendar, setShowCalendar] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [selectedPeriodStart, setSelectedPeriodStart] = useState<number | null>(null)
  const [selectedPeriodEnd, setSelectedPeriodEnd] = useState<number | null>(null)

  useEffect(() => {
    const savedProjection = localStorage.getItem("savedProjection")
    if (savedProjection) {
      try {
        const data: SavedProjection = JSON.parse(savedProjection)
        setBankValue(data.bankValue)
        setInputValue(formatCurrency(data.bankValue))
        setSelectedRisk(data.selectedRisk)
        setProjectionPeriod(data.projectionPeriod)
        setSelectedDay(data.selectedDay || null)
        setSelectedPeriodStart(data.selectedPeriodStart || null)
        setSelectedPeriodEnd(data.selectedPeriodEnd || null)
      } catch (error) {
        console.error("[v0] Error loading saved projection:", error)
      }
    }
  }, [])

  const riskProfiles = {
    conservative: { percent: 1, name: "Conservador", icon: "/assets/porco.png" },
    moderate: { percent: 3, name: "Moderado", icon: "/assets/equilibrado.png" },
    aggressive: { percent: 5, name: "Arrojado", icon: "/assets/foguet.png" },
  }

  const calculateInvestment = () => {
    return (bankValue * riskProfiles[selectedRisk].percent) / 100
  }

  const calculateProjection = () => {
    const investment = calculateInvestment()
    const winRate = 0.87
    const payout = 0.6

    if (projectionPeriod === "day") {
      return investment * winRate * payout
    } else {
      const dailyReturn = investment * winRate * payout
      return dailyReturn * 22
    }
  }

  const handleClear = () => {
    setBankValue(125)
    setInputValue("125,00")
    setSelectedRisk("conservative")
    setProjectionPeriod("day")
    setSelectedDay(null)
    setSelectedPeriodStart(null)
    setSelectedPeriodEnd(null)
    localStorage.removeItem("savedProjection")
  }

  const handleSave = () => {
    setShowCalendar(true)
  }

  const handleConfirmDate = () => {
    if (
      (projectionPeriod === "day" && selectedDay) ||
      (projectionPeriod === "month" && selectedPeriodStart && selectedPeriodEnd)
    ) {
      setShowCalendar(false)
      setShowConfirmation(true)
    }
  }

  const handleConfirmOperation = () => {
    const projectionData: SavedProjection = {
      bankValue,
      selectedRisk,
      projectionPeriod,
      selectedDay: selectedDay || undefined,
      selectedPeriodStart: selectedPeriodStart || undefined,
      selectedPeriodEnd: selectedPeriodEnd || undefined,
      investment: calculateInvestment(),
      projection: calculateProjection(),
      savedAt: new Date().toISOString(),
    }

    localStorage.setItem("savedProjection", JSON.stringify(projectionData))
    window.dispatchEvent(new Event("projectionUpdated"))
    setShowConfirmation(false)
    setShowSuccess(true)
  }

  const handleCloseSuccess = () => {
    setShowSuccess(false)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const handleBankValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const cleanValue = value.replace(/[^\d,]/g, "")
    const parts = cleanValue.split(",")
    const integerPart = parts[0] || "0"
    const decimalPart = parts[1] || ""
    const numericValue =
      Number.parseInt(integerPart) + (decimalPart ? Number.parseInt(decimalPart.padEnd(2, "0").slice(0, 2)) / 100 : 0)
    setBankValue(numericValue)
    const formatted = formatCurrency(numericValue)
    setInputValue(formatted)
  }

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select()
  }

  const getDaysInMonth = () => {
    const year = 2025
    const month = 7
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const days = []

    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }
    return days
  }

  const calendarDays = getDaysInMonth()
  const dayLabels = ["D", "S", "T", "Q", "Q", "S", "S"]

  return (
    <>
      <Card className="bg-[#1d1d41] border-none rounded-[20px] p-4 flex flex-col gap-3">
        <h4 className="text-base font-bold text-white">Calculadora de projeção</h4>

        <div>
          <label className="block text-xs text-[#aeabd8] mb-1.5">Qual valor da sua banca?</label>
          <div className="flex items-center border border-[rgba(174,171,216,0.53)] rounded-[10px] px-2 py-1.5">
            <span className="text-[#aeabd8] mr-1.5">R$</span>
            <input
              type="text"
              value={inputValue}
              onChange={handleBankValueChange}
              onFocus={handleInputFocus}
              className="bg-transparent border-none text-white text-base font-bold w-full outline-none"
              placeholder="0,00"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-[rgba(2,177,90,0.15)] text-[#16c784] text-xs px-2 py-0.5 rounded-[50px]">87%</span>
          <p className="text-xs text-[#aeabd8] leading-tight">
            de assertividade e<br />
            payout em média
          </p>
        </div>

        <div>
          <label className="block text-sm text-[#aeabd8] mb-2">Qual valor que gostaria de aportar da sua banca?</label>
          <div className="flex flex-col md:flex-row gap-1.5">
            {(Object.keys(riskProfiles) as RiskProfile[]).map((risk) => {
              const profile = riskProfiles[risk]
              const investment = (bankValue * profile.percent) / 100
              return (
                <button
                  key={risk}
                  onClick={() => setSelectedRisk(risk)}
                  className={`flex-1 border rounded-[10px] p-2 text-center cursor-pointer transition-all ${
                    selectedRisk === risk
                      ? "border-[#845bf6] shadow-[0px_0px_6.5px_0px_#845bf6] bg-[#27264e]"
                      : "border-[rgba(174,171,216,0.53)] hover:border-[#845bf6]/50"
                  }`}
                >
                  <Image
                    src={profile.icon || "/placeholder.svg"}
                    alt={profile.name}
                    width={32}
                    height={32}
                    className="mx-auto mb-2"
                  />
                  <p className="text-[22px] font-semibold text-white mb-1">{profile.percent}%</p>
                  <p className="text-xs text-[#aeabd8] mb-1">R${formatCurrency(investment)}</p>
                  <p className="text-xs font-bold text-white">{profile.name}</p>
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs text-[#aeabd8] mb-1">Resultado da projeção</label>
          <div className="flex justify-between items-center">
            <div className="flex items-center border border-[rgba(174,171,216,0.53)] rounded-[50px] p-1">
              <Button
                variant="ghost"
                onClick={() => setProjectionPeriod("day")}
                className={`rounded-[50px] px-3 py-1.5 text-sm ${
                  projectionPeriod === "day" ? "bg-[#845bf6] text-white" : "bg-transparent text-[#aeabd8]"
                }`}
              >
                Dia
              </Button>
              <Button
                variant="ghost"
                onClick={() => setProjectionPeriod("month")}
                className={`rounded-[50px] px-3 py-1.5 text-sm ${
                  projectionPeriod === "month" ? "bg-[#845bf6] text-white" : "bg-transparent text-[#aeabd8]"
                }`}
              >
                Mês
              </Button>
            </div>
            <p className="text-[22px] font-semibold text-[#16c784] flex items-center gap-2">
              R$ {formatCurrency(calculateProjection())}
              <Image src="/assets/setacima.svg" alt="Up" width={16} height={16} />
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-auto">
          <Button
            onClick={handleSave}
            className="flex-1 bg-[#27264e] text-white border-none rounded-[10px] py-1.5 text-sm font-medium hover:bg-[#2f2e5a]"
          >
            Salvar
          </Button>
          <Button
            onClick={handleClear}
            variant="outline"
            className="flex-1 bg-transparent text-[#aeabd8] border border-[rgba(174,171,216,0.53)] rounded-[10px] py-1.5 text-sm hover:bg-[#27264e]/50"
          >
            Limpar
          </Button>
        </div>
      </Card>

      {showCalendar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-[#1d1d41] border-none rounded-[20px] p-6 max-w-sm w-full">
            {projectionPeriod === "day" ? (
              <>
                <h3 className="text-lg font-bold text-white mb-4">Agosto 2025</h3>
                <div className="grid grid-cols-7 gap-2 mb-6">
                  {dayLabels.map((label, index) => (
                    <div key={`day-label-${index}`} className="text-center text-xs text-[#aeabd8] font-semibold py-2">
                      {label}
                    </div>
                  ))}
                  {calendarDays.map((day, index) => (
                    <button
                      key={`calendar-day-${index}`}
                      onClick={() => day && setSelectedDay(day)}
                      disabled={!day}
                      className={`aspect-square rounded-lg text-sm font-medium transition-all ${
                        day
                          ? selectedDay === day
                            ? "bg-[#845bf6] text-white"
                            : "bg-[#27264e] text-white hover:bg-[#845bf6]/50 cursor-pointer"
                          : "text-[#aeabd8]/30 cursor-not-allowed"
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <h3 className="text-lg font-bold text-white mb-4">Selecione o período</h3>
                <div className="mb-6">
                  <p className="text-xs text-[#aeabd8] mb-3">
                    {selectedPeriodStart && selectedPeriodEnd
                      ? `Período: ${selectedPeriodStart} a ${selectedPeriodEnd} de Agosto`
                      : "Clique para selecionar data inicial e final"}
                  </p>
                  <div className="grid grid-cols-7 gap-2">
                    {dayLabels.map((label, index) => (
                      <div
                        key={`period-day-label-${index}`}
                        className="text-center text-xs text-[#aeabd8] font-semibold py-2"
                      >
                        {label}
                      </div>
                    ))}
                    {calendarDays.map((day, index) => {
                      const isStart = day === selectedPeriodStart
                      const isEnd = day === selectedPeriodEnd
                      const isBetween =
                        day &&
                        selectedPeriodStart &&
                        selectedPeriodEnd &&
                        day > selectedPeriodStart &&
                        day < selectedPeriodEnd
                      const isInRange = isStart || isEnd || isBetween

                      return (
                        <button
                          key={`period-calendar-day-${index}`}
                          onClick={() => {
                            if (!day) return

                            if (!selectedPeriodStart) {
                              setSelectedPeriodStart(day)
                            } else if (!selectedPeriodEnd) {
                              if (day > selectedPeriodStart) {
                                setSelectedPeriodEnd(day)
                              } else {
                                setSelectedPeriodStart(day)
                                setSelectedPeriodEnd(null)
                              }
                            } else {
                              setSelectedPeriodStart(day)
                              setSelectedPeriodEnd(null)
                            }
                          }}
                          disabled={!day}
                          className={`aspect-square rounded-lg text-sm font-medium transition-all ${
                            !day
                              ? "text-[#aeabd8]/30 cursor-not-allowed"
                              : isStart || isEnd
                                ? "bg-[#845bf6] text-white cursor-pointer"
                                : isBetween
                                  ? "bg-[#845bf6]/40 text-white cursor-pointer"
                                  : "bg-[#27264e] text-white hover:bg-[#845bf6]/50 cursor-pointer"
                          }`}
                        >
                          {day}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setShowCalendar(false)
                  setSelectedDay(null)
                  setSelectedPeriodStart(null)
                  setSelectedPeriodEnd(null)
                }}
                variant="outline"
                className="flex-1 bg-transparent text-[#aeabd8] border border-[rgba(174,171,216,0.53)] rounded-[10px] py-2 text-sm hover:bg-[#27264e]/50"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmDate}
                disabled={projectionPeriod === "day" ? !selectedDay : !selectedPeriodStart || !selectedPeriodEnd}
                className="flex-1 bg-[#845bf6] text-white border-none rounded-[10px] py-2 text-sm font-medium hover:bg-[#6d47d4] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirmar
              </Button>
            </div>
          </Card>
        </div>
      )}

      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-[#1d1d41] border-none rounded-[20px] p-6 max-w-sm w-full text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full border-2 border-[#845bf6] flex items-center justify-center">
                <svg className="w-8 h-8 text-[#845bf6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>

            <h3 className="text-xl font-bold text-white mb-2">Tem certeza?</h3>
            <p className="text-sm text-[#aeabd8] mb-6">
              Caso já tenha saído uma projeção anteriormente irá ser substituída por essa.
            </p>

            <div className="flex gap-3">
              <Button
                onClick={() => setShowConfirmation(false)}
                variant="outline"
                className="flex-1 bg-transparent text-[#aeabd8] border border-[rgba(174,171,216,0.53)] rounded-[10px] py-2 text-sm hover:bg-[#27264e]/50"
              >
                Voltar
              </Button>
              <Button
                onClick={handleConfirmOperation}
                className="flex-1 bg-[#845bf6] text-white border-none rounded-[10px] py-2 text-sm font-medium hover:bg-[#6d47d4]"
              >
                Sim
              </Button>
            </div>
          </Card>
        </div>
      )}

      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-[#1d1d41] border-none rounded-[20px] p-6 max-w-sm w-full text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-[#16c784]/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-[#16c784]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            <h3 className="text-xl font-bold text-white mb-6">Salvo com sucesso!</h3>

            <Button
              onClick={handleCloseSuccess}
              className="w-full bg-[#845bf6] text-white border-none rounded-[10px] py-2 text-sm font-medium hover:bg-[#6d47d4]"
            >
              Concluir
            </Button>
          </Card>
        </div>
      )}
    </>
  )
}
