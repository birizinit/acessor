# Integração Completa - MyBroker API

## Resumo da Integração

Todos os componentes do painel estão integrados com a API do MyBroker e funcionando corretamente.

## Arquivos Principais

### 1. lib/api.ts - Cliente da API
\`\`\`typescript
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

export class MyBrokerAPI {
  private apiToken: string

  constructor(apiToken: string) {
    this.apiToken = apiToken
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "api-token": this.apiToken,
        "Content-Type": "application/json",
        ...options?.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Unknown error" }))
      throw new Error(error.message || `API Error: ${response.status}`)
    }

    return response.json()
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
  return localStorage.getItem("apiToken")
}

export function createApiClient(): MyBrokerAPI | null {
  const token = getApiToken()
  if (!token) return null
  return new MyBrokerAPI(token)
}
\`\`\`

## Funcionalidades Implementadas

### ✅ Página de Perfil (app/perfil/page.tsx)
- Campo "API Token" para inserir o token
- Botão "Conectar" que busca dados do usuário via `/token/users/me`
- Preenchimento automático dos campos: email, nome, apelido, país, telefone, idioma
- Modal de sucesso mostrando informações do usuário conectado
- Indicador de status (Ativo/Inativo)

### ✅ Página de Operações (app/operacoes/page.tsx)
- Busca todas as operações via `/token/trades`
- Exibe nome das moedas (sem ícones, apenas texto)
- Remove sufixo "USDT" para exibição limpa
- Mostra data, hora, aporte e resultado de cada operação
- Filtros: Todas, Lucrativas, Não Lucrativas
- Paginação funcional
- Exportação para CSV

### ✅ Home - Lucro do Mês (components/result-card.tsx)
- Calcula o lucro total do mês atual
- Busca trades do mês via API
- Soma todos os PNL (profit and loss)
- Calcula percentual de retorno sobre investimento
- Gráfico de área mostrando lucro diário
- Indicador visual (verde para lucro, vermelho para perda)

### ✅ Home - Balanço do Período (components/balance-card.tsx)
- Agrupa operações em períodos de 7 dias
- Mostra 4 semanas do mês (28 dias)
- Calcula ganhos e perdas semanais
- Gráfico de área com pontos coloridos (verde/vermelho)
- Tooltip mostrando valores de cada semana

### ✅ Home - Top Operações (components/top-operations-card.tsx)
- Agrupa operações por moeda (symbol)
- Calcula total de entradas, investimento e lucro por moeda
- Ordena por lucro (maior para menor)
- Exibe top 4 moedas
- Ranking visual com medalhas para top 3
- Usa apenas nomes das moedas (sem ícones)

### ✅ Calculadora de Projeção (components/calculator-card.tsx)
- Fórmula corrigida para cálculo diário: `investimento × 87% × 60%`
- Fórmula corrigida para cálculo mensal: `retorno_diário × 22 dias`
- 3 perfis de risco: Conservador (1%), Moderado (3%), Arrojado (5%)
- Seleção de período: Dia ou Mês
- Calendário para salvar projeções
- Modal de confirmação e sucesso

### ✅ Projeção Salva (components/projection-card.tsx)
- Exibe projeção salva anteriormente
- Alterna entre visualização diária e mensal
- Gráfico semicircular com percentual
- Botão para visualizar operações

## Como Usar

### 1. Configurar API Token
1. Acesse a página de Perfil
2. Insira seu API Token no campo "API Token"
3. Clique em "Conectar"
4. Seus dados serão carregados automaticamente

### 2. Visualizar Operações
- Acesse "Operações" no menu
- Todas as suas trades serão carregadas automaticamente
- Use os filtros para ver apenas lucrativas ou não lucrativas
- Exporte para CSV se necessário

### 3. Dashboard (Home)
- **Lucro do Mês**: Mostra seu lucro total do mês atual
- **Balanço do Período**: Gráfico semanal de ganhos/perdas
- **Top Operações**: Ranking das moedas mais lucrativas
- **Calculadora**: Calcule projeções de investimento
- **Projeção Salva**: Visualize sua última projeção

## Endpoints Utilizados

| Endpoint | Método | Uso |
|----------|--------|-----|
| `/token/users/me` | GET | Buscar dados do usuário |
| `/token/trades` | GET | Listar todas as operações |
| `/token/trades/{id}` | GET | Buscar operação específica |
| `/token/wallets` | GET | Buscar carteiras |
| `/token/trades/open` | POST | Abrir nova operação |

## Estrutura de Dados

### Trade (Operação)
\`\`\`typescript
{
  id: string
  symbol: string          // Ex: "BTCUSDT"
  amount: number         // Valor investido
  pnl: number           // Lucro/Perda
  openTime: number      // Timestamp de abertura
  closeTime: number     // Timestamp de fechamento
  status: "COMPLETED" | "CANCELLED" | "PENDING" | "OPEN"
  direction: "BUY" | "SELL"
}
\`\`\`

### UserData (Usuário)
\`\`\`typescript
{
  id: string
  email: string
  name: string
  nickname: string
  country: string
  phone: string
  language: string
  active: boolean
}
\`\`\`

## Cálculos Implementados

### Lucro do Mês
\`\`\`typescript
const totalProfit = trades
  .filter(trade => isCurrentMonth(trade.openTime))
  .reduce((sum, trade) => sum + trade.pnl, 0)
\`\`\`

### Balanço Semanal
\`\`\`typescript
const weekIndex = Math.floor((day - 1) / 7) + 1
// Agrupa trades em semanas de 7 dias
\`\`\`

### Top Operações
\`\`\`typescript
// Agrupa por símbolo e soma:
// - Número de entradas
// - Total investido (amount)
// - Total de lucro (pnl)
// Ordena por lucro decrescente
\`\`\`

### Projeção
\`\`\`typescript
// Diária
const dailyReturn = investment × 0.87 × 0.60

// Mensal
const monthlyReturn = dailyReturn × 22
\`\`\`

## Status da Integração

✅ API Client criado e funcional
✅ Perfil integrado com `/token/users/me`
✅ Operações integradas com `/token/trades`
✅ Home integrada com dados reais da API
✅ Calculadoras com fórmulas corretas
✅ Todos os componentes comunicando entre si
✅ Tratamento de erros implementado
✅ Loading states em todos os componentes
✅ Formatação de moeda brasileira (BRL)
✅ Remoção de sufixo "USDT" das moedas

## Próximos Passos (Opcional)

- [ ] Implementar refresh automático de dados
- [ ] Adicionar filtros por data nas operações
- [ ] Implementar abertura de trades via interface
- [ ] Adicionar notificações de sucesso/erro
- [ ] Implementar cache de dados
- [ ] Adicionar mais gráficos e estatísticas
