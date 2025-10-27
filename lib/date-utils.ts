export const getMonthAbbreviation = (monthName: string): string => {
  const monthMap: Record<string, string> = {
    Janeiro: "jan",
    Fevereiro: "fev",
    Março: "mar",
    Abril: "abr",
    Maio: "mai",
    Junho: "jun",
    Julho: "jul",
    Agosto: "ago",
    Setembro: "set",
    Outubro: "out",
    Novembro: "nov",
    Dezembro: "dez",
  }

  return monthMap[monthName] || "ago"
}
