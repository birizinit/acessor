interface NotificationData {
  type: "trade_success" | "trade_failure" | "deposit" | "withdrawal" | "level_up"
  amount?: number
  asset?: string
  message?: string
}

export function createNotification(data: NotificationData) {
  const now = new Date()
  const dateStr = now.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })

  let message = ""

  switch (data.type) {
    case "trade_success":
      message = `Trade bem-sucedido! Você ganhou R$${data.amount?.toFixed(2)} em ${data.asset}`
      break
    case "trade_failure":
      message = `Trade encerrado com perda de R$${data.amount?.toFixed(2)} em ${data.asset}`
      break
    case "deposit":
      message = `Depósito de R$${data.amount?.toFixed(2)} realizado com sucesso`
      break
    case "withdrawal":
      message = `Saque de R$${data.amount?.toFixed(2)} processado com sucesso`
      break
    case "level_up":
      message = data.message || "Você subiu de nível! Parabéns, continue assim!"
      break
  }

  const notification = {
    id: Date.now(),
    date: dateStr,
    message,
    unread: true,
    type: data.type,
  }

  // Dispatch custom event to notify the header component
  const event = new CustomEvent("newNotification", { detail: notification })
  window.dispatchEvent(event)

  return notification
}

// Example usage in your trade processing code:
// import { createNotification } from '@/lib/notifications'
//
// After a successful trade:
// createNotification({
//   type: 'trade_success',
//   amount: 150.50,
//   asset: 'Bitcoin'
// })
//
// After a failed trade:
// createNotification({
//   type: 'trade_failure',
//   amount: 50.00,
//   asset: 'Ethereum'
// })
//
// After a deposit:
// createNotification({
//   type: 'deposit',
//   amount: 500.00
// })
