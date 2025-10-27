"use client"

import { Card } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { createApiClient, formatCurrencyPair, type Trade } from "@/lib/api"
import Image from "next/image"
import { getMonthAbbreviation } from "@/lib/date-utils"

interface TopOperationsCardProps {
  dateRange: { start: string; end: string }
  currentMonth: string
}

interface TopOperation {
  rank: number
  symbol: string
  entries: number
  investment: number
  profit: number
}

export function TopOperationsCard({ dateRange, currentMonth }: TopOperationsCardProps) {
  const [operations, setOperations] = useState<TopOperation[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchTopOperations = async () => {
      const apiClient = createApiClient()
      if (!apiClient) return

      setIsLoading(true)
      try {
        const response = await apiClient.getTrades(1, 100)

        const [startDay, startMonth, startYear] = dateRange.start.split("/").map(Number)
        const [endDay, endMonth, endYear] = dateRange.end.split("/").map(Number)
        const startDate = new Date(startYear, startMonth - 1, startDay)
        const endDate = new Date(endYear, endMonth - 1, endDay, 23, 59, 59)

        const filteredTrades = response.data.filter((trade) => {
          const tradeDate = new Date(trade.openTime)
          return tradeDate >= startDate && tradeDate <= endDate
        })

        const symbolStats = new Map<string, { entries: number; investment: number; profit: number }>()

        filteredTrades.forEach((trade: Trade) => {
          const symbol = formatCurrencyPair(trade.symbol)
          const existing = symbolStats.get(symbol) || { entries: 0, investment: 0, profit: 0 }

          symbolStats.set(symbol, {
            entries: existing.entries + 1,
            investment: existing.investment + trade.amount,
            profit: existing.profit + trade.pnl,
          })
        })

        const topOps = Array.from(symbolStats.entries())
          .map(([symbol, stats]) => ({
            rank: 0,
            symbol,
            ...stats,
          }))
          .sort((a, b) => b.profit - a.profit)
          .slice(0, 4)
          .map((op, index) => ({ ...op, rank: index + 1 }))

        setOperations(topOps)
        console.log("[v0] Top operations calculated:", topOps, "for period:", dateRange)
      } catch (error) {
        console.error("[v0] Error fetching top operations:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTopOperations()
  }, [dateRange])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
    }).format(value)
  }

  const getRankDisplay = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="w-[34px] h-[34px] flex items-center justify-center">
          <Image src="/assets/rank1.png" alt="1st place" width={34} height={34} className="object-contain" />
        </div>
      )
    }
    if (rank === 2) {
      return (
        <div className="w-[34px] h-[34px] flex items-center justify-center">
          <Image src="/assets/rank2.png" alt="2nd place" width={34} height={34} className="object-contain" />
        </div>
      )
    }
    if (rank === 3) {
      return (
        <div className="w-[34px] h-[34px] flex items-center justify-center">
          <Image src="/assets/rank3.png" alt="3rd place" width={34} height={34} className="object-contain" />
        </div>
      )
    }
    return <span className="font-bold text-[15px]">{rank}</span>
  }

  return (
    <Card className="bg-[#1d1d41] border-none rounded-[20px] p-6">
      <div className="flex justify-between items-center mb-5 flex-wrap gap-2">
        <h4 className="text-lg font-semibold text-white">Top operações</h4>
        <p className="text-base text-[#8c89b4]">
          {dateRange.start.split("/")[0]} de {getMonthAbbreviation(currentMonth)}. - {dateRange.end.split("/")[0]} de{" "}
          {getMonthAbbreviation(currentMonth)}
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-[#aeabd8]">Carregando...</div>
      ) : operations.length === 0 ? (
        <div className="text-center py-8 text-[#aeabd8]">Nenhuma operação encontrada</div>
      ) : (
        <div className="flex flex-col gap-px bg-[rgba(174,171,216,0.1)] py-px">
          <div className="grid grid-cols-[0.5fr_1.5fr_1fr_1fr_1fr] items-center px-2.5 py-2.5 bg-[#1d1d41] text-[#aeabd8] text-xs">
            <span>Rank</span>
            <span>Moedas</span>
            <span>Entradas</span>
            <span>Aportes</span>
            <span>Lucro</span>
          </div>
          {operations.map((operation, index) => (
            <div
              key={`${operation.rank}-${index}`}
              className="grid grid-cols-[0.5fr_1.5fr_1fr_1fr_1fr] items-center px-2.5 py-4 bg-[#1d1d41] text-sm text-white"
            >
              <span className="flex justify-center">{getRankDisplay(operation.rank)}</span>
              <div className="flex items-center gap-2.5 pl-2.5">
                <span className="font-medium">{operation.symbol}</span>
              </div>
              <span className="pl-2.5">{operation.entries}</span>
              <span className="pl-2.5">{formatCurrency(operation.investment)}</span>
              <span
                className={`flex items-center gap-1 pl-2.5 font-medium ${operation.profit >= 0 ? "text-[#16c784]" : "text-[#f2474a]"}`}
              >
                {formatCurrency(Math.abs(operation.profit))}
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={operation.profit < 0 ? "rotate-180" : ""}
                >
                  <path
                    d="M6 10L6 2M6 2L2 6M6 2L10 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
