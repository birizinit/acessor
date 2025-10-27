const API_BASE_URL = "https://broker-api.mybroker.dev"

export interface UserData {
  id: string
  tenantId: string
  email: string
  name: string
  nickname: string
  country: string
  language: string
  phone?: string
  phoneCountryCode?: string
  active: boolean
  banned: boolean
  emailVerified: boolean
  lastLoginAt: string
  createdAt: string
  updatedAt: string
}

export interface Trade {
  id: string
  symbol: string
  userId: string
  amount: number
  status: "COMPLETED" | "CANCELLED" | "PENDING" | "OPEN"
  direction: "BUY" | "SELL"
  pnl: number
  result?: "WON" | "LOST" | "PENDING"
  openPrice: number
  closePrice: number
  openTime: number
  closeTime: number
  createdAt: string
  updatedAt: string
}

export interface TradesResponse {
  currentPage: number
  perPage: number
  lastPage: number
  nextPage: number | null
  prevPage: number | null
  pages: number
  total: number
  count: number
  data: Trade[]
}

export interface Wallet {
  id: string
  userId: string
  balance: number
  currency: string
  createdAt: string
}

export class MyBrokerAPI {
  private apiToken: string

  constructor(apiToken: string) {
    this.apiToken = apiToken
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`

    const timestamp = Math.floor(Date.now() / 1000).toString()

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "api-token": this.apiToken,
      "x-timestamp": timestamp,
      ...(options?.headers as Record<string, string>),
    }

    console.log("[v0] API Request:", {
      url,
      method: options?.method || "GET",
      headers: { ...headers, "api-token": "***" },
    })

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorMessage = `API Error: ${response.status}`

      try {
        const errorJson = JSON.parse(errorText)
        errorMessage = errorJson.data?.message || errorJson.message || errorJson.error || errorMessage
      } catch (e) {
        errorMessage = errorText || errorMessage
      }

      console.error("[v0] API Error:", { url, status: response.status, error: errorMessage })
      throw new Error(errorMessage)
    }

    const data = await response.json()
    console.log("[v0] API Response:", { url, dataCount: Array.isArray(data?.data) ? data.data.length : "N/A" })
    return data
  }

  async getUserInfo(): Promise<UserData> {
    return this.request<UserData>("/token/users/me")
  }

  async getTrades(page = 1, pageSize = 10): Promise<TradesResponse> {
    return this.request<TradesResponse>(`/token/trades?page=${page}&pageSize=${pageSize}`)
  }

  async getTradeById(id: string): Promise<Trade> {
    return this.request<Trade>(`/token/trades/${id}`)
  }

  async getWallets(): Promise<Wallet[]> {
    return this.request<Wallet[]>("/token/wallets")
  }

  async openTrade(data: {
    isDemo: boolean
    closeType: string
    direction: "BUY" | "SELL"
    symbol: string
    amount: number
  }): Promise<Trade> {
    return this.request<Trade>("/token/trades/open", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }
}

export function getApiToken(): string | null {
  if (typeof window === "undefined") return null
  const token = localStorage.getItem("apiToken")
  console.log("[v0] Getting API token:", token ? "Token found" : "No token found")
  return token
}

export function setApiToken(token: string): void {
  if (typeof window === "undefined") return
  localStorage.setItem("apiToken", token)
}

export function removeApiToken(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem("apiToken")
}

export function createApiClient(): MyBrokerAPI | null {
  const token = getApiToken()
  if (!token) {
    console.error("[v0] Cannot create API client: No token found")
    return null
  }
  console.log("[v0] API client created successfully")
  return new MyBrokerAPI(token)
}

export function formatCurrencyPair(symbol: string): string {
  // Convert BTCUSDT to BTC/USD, ETHUSDT to ETH/USD, etc.
  if (symbol.endsWith("USDT")) {
    const base = symbol.replace("USDT", "")
    return `${base}/USD`
  }
  return symbol
}
