"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface FiltersProps {
  selectedPeriod: "week" | "month" | "today"
  onPeriodChange: (period: "week" | "month" | "today") => void
  currentMonth: string
  onMonthChange: (month: string) => void
  dateRange: { start: string; end: string }
  onDateRangeChange: (range: { start: string; end: string }) => void
}

const months = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
]

export function Filters({
  selectedPeriod,
  onPeriodChange,
  currentMonth,
  onMonthChange,
  dateRange,
  onDateRangeChange,
}: FiltersProps) {
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()

  useEffect(() => {
    const monthIndex = months.indexOf(currentMonth)
    const currentYear = new Date().getFullYear()

    // Get first and last day of the selected month
    const firstDay = new Date(currentYear, monthIndex, 1)
    const lastDay = new Date(currentYear, monthIndex + 1, 0)

    const newDateRange = {
      start: format(firstDay, "dd/MM/yyyy"),
      end: format(lastDay, "dd/MM/yyyy"),
    }

    onDateRangeChange(newDateRange)
    setStartDate(firstDay)
    setEndDate(lastDay)
  }, [currentMonth, onDateRangeChange])

  const handlePreviousMonth = () => {
    const currentIndex = months.indexOf(currentMonth)
    const newIndex = currentIndex === 0 ? 11 : currentIndex - 1
    onMonthChange(months[newIndex])
  }

  const handleNextMonth = () => {
    const currentIndex = months.indexOf(currentMonth)
    const newIndex = currentIndex === 11 ? 0 : currentIndex + 1
    onMonthChange(months[newIndex])
  }

  const handleDateSelect = (date: Date | undefined, type: "start" | "end") => {
    if (type === "start") {
      setStartDate(date)
      if (date && endDate) {
        onDateRangeChange({
          start: format(date, "dd/MM/yyyy"),
          end: format(endDate, "dd/MM/yyyy"),
        })
      }
    } else {
      setEndDate(date)
      if (startDate && date) {
        onDateRangeChange({
          start: format(startDate, "dd/MM/yyyy"),
          end: format(date, "dd/MM/yyyy"),
        })
      }
    }
  }

  return (
    <section className="py-9">
      <div className="container mx-auto px-4 md:px-10 lg:px-[124px] max-w-[1920px]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
          <div className="flex items-center gap-6">
            <button
              onClick={handlePreviousMonth}
              className="bg-[#27264e] border border-[rgba(174,171,216,0.53)] w-8 h-8 rounded-[5px] flex items-center justify-center cursor-pointer hover:bg-[#2f2e5a] transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-[#aeabd8]" />
            </button>
            <h3 className="font-semibold text-2xl text-white">{currentMonth}</h3>
            <button
              onClick={handleNextMonth}
              className="bg-[#27264e] border border-[rgba(174,171,216,0.53)] w-8 h-8 rounded-[5px] flex items-center justify-center cursor-pointer hover:bg-[#2f2e5a] transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-[#aeabd8]" />
            </button>
          </div>
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-6 w-full md:w-auto">
            <div className="flex items-center border border-[rgba(174,171,216,0.53)] rounded-[50px] p-1 bg-transparent">
              <Button
                variant="ghost"
                onClick={() => onPeriodChange("week")}
                className={`rounded-[50px] px-4 py-2 text-sm transition-all ${
                  selectedPeriod === "week"
                    ? "bg-[#845bf6] text-white font-medium"
                    : "bg-transparent text-[#aeabd8] hover:bg-[#845bf6]/20"
                }`}
              >
                Semana
              </Button>
              <Button
                variant="ghost"
                onClick={() => onPeriodChange("month")}
                className={`rounded-[50px] px-4 py-2 text-sm transition-all ${
                  selectedPeriod === "month"
                    ? "bg-[#845bf6] text-white font-medium"
                    : "bg-transparent text-[#aeabd8] hover:bg-[#845bf6]/20"
                }`}
              >
                Mês
              </Button>
              <Button
                variant="ghost"
                onClick={() => onPeriodChange("today")}
                className={`rounded-[50px] px-4 py-2 text-sm transition-all ${
                  selectedPeriod === "today"
                    ? "bg-[#845bf6] text-white font-medium"
                    : "bg-transparent text-[#aeabd8] hover:bg-[#845bf6]/20"
                }`}
              >
                Hoje
              </Button>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-2.5 bg-[#1d1d41] border border-[rgba(174,171,216,0.53)] rounded-[10px] px-4 py-2.5 text-white text-sm hover:bg-[#27264e] transition-colors cursor-pointer">
                  <Image src="/assets/calendar.png" alt="Calendar" width={18} height={18} />
                  <span>
                    {dateRange.start} até {dateRange.end}
                  </span>
                  <Image src="/assets/seta baixo.svg" alt="Dropdown" width={12} height={12} />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-[#1d1d41] border-[rgba(174,171,216,0.53)]" align="end">
                <div className="p-4 space-y-4">
                  <div>
                    <p className="text-sm text-[#aeabd8] mb-2">Data inicial</p>
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => handleDateSelect(date, "start")}
                      locale={ptBR}
                      className="rounded-md"
                    />
                  </div>
                  <div>
                    <p className="text-sm text-[#aeabd8] mb-2">Data final</p>
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(date) => handleDateSelect(date, "end")}
                      locale={ptBR}
                      className="rounded-md"
                      disabled={(date) => (startDate ? date < startDate : false)}
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </section>
  )
}
