# MyBroker API Integration - Documentation

## Overview
This project has been fully integrated with the MyBroker API. All components now fetch real data from the API endpoints.

## API Client (`lib/api.ts`)
The API client provides a centralized way to interact with the MyBroker API.

### Base URL
\`\`\`
https://broker-api.mybroker.dev
\`\`\`

### Authentication
All requests require an `api-token` header. The token is stored in localStorage and managed through the profile page.

### Available Methods

#### `getUserInfo()`
Fetches user information from `/token/users/me`
- Returns: UserData object with id, email, name, nickname, country, language, phone, etc.

#### `getTrades(page, pageSize)`
Fetches paginated trades from `/token/trades`
- Parameters: page number and items per page
- Returns: TradesResponse with pagination info and trade data

#### `getTradeById(id)`
Fetches a specific trade by ID from `/token/trades/{id}`
- Returns: Single Trade object

#### `getWallets()`
Fetches user wallets from `/token/wallets`
- Returns: Array of Wallet objects

#### `openTrade(data)`
Opens a new trade via `/token/trades/open`
- Parameters: isDemo, closeType, direction, symbol, amount
- Returns: Created Trade object

## Integration Points

### 1. Profile Page (`app/perfil/page.tsx`)
**Functionality:**
- User enters API token in the "API Token" field
- Clicks "Conectar" button to authenticate
- System fetches user data and populates profile fields automatically
- Shows success modal with user information
- Token is stored in localStorage for future requests

**API Calls:**
- `getUserInfo()` - Fetches and displays user data (email, name, nickname, country, phone, language)

### 2. Operations Page (`app/operacoes/page.tsx`)
**Functionality:**
- Displays all user trades in a table format
- Shows coin names (without USDT suffix) instead of icons
- Filters: All, Positive, Negative operations
- Pagination with configurable items per page
- Export to CSV functionality

**API Calls:**
- `getTrades(1, 100)` - Fetches up to 100 trades
- Converts Trade objects to Operation format for display

**Data Displayed:**
- Coin name (symbol without USDT)
- Date and time of operation
- Investment amount (aporte)
- Profit/Loss result

### 3. Home Dashboard Components

#### Result Card (`components/result-card.tsx`)
**Title:** "Lucro do Mês" (Monthly Profit)

**Functionality:**
- Calculates total profit for the current month
- Shows percentage gain/loss relative to investment
- Displays daily profit trend chart
- Calculates 8% consortium fee

**API Calls:**
- `getTrades(1, 100)` - Filters trades by current month
- Aggregates PNL (profit and loss) values

#### Balance Card (`components/balance-card.tsx`)
**Title:** "Balanço do período" (Period Balance)

**Functionality:**
- Shows weekly profit/loss trends over 1 month
- Groups data in 7-day periods (4 weeks)
- Displays gain vs loss comparison chart
- Color-coded dots (green for gains, red for losses)

**API Calls:**
- `getTrades(1, 100)` - Groups trades by week
- Separates positive (gain) and negative (loss) PNL

**Calculation:**
- Week 1: Days 1-7
- Week 2: Days 8-14
- Week 3: Days 15-21
- Week 4: Days 22-28+

#### Top Operations Card (`components/top-operations-card.tsx`)
**Title:** "Top operações"

**Functionality:**
- Ranks coins by total profit
- Shows top 4 performing coins
- Displays entries count, total investment, and profit per coin
- Gold medal display for top 3 positions

**API Calls:**
- `getTrades(1, 100)` - Aggregates data by symbol
- Groups by coin name (removes USDT suffix)

**Metrics Calculated:**
- Entries: Number of trades per coin
- Investment: Sum of all amounts per coin
- Profit: Sum of all PNL per coin

#### Projection Card (`components/projection-card.tsx`)
**Title:** "Projeção salva"

**Functionality:**
- Shows saved projection calculations
- Toggle between daily and monthly views
- Displays win rate percentage and projected value

**Note:** This component uses saved projection data, not live API data

#### Calculator Card (`components/calculator-card.tsx`)
**Title:** "Calculadora de projeção"

**Functionality:**
- Calculates investment based on bank value and risk profile
- Risk profiles: Conservative (1%), Moderate (3%), Aggressive (5%)
- Projects returns for day or month periods
- Allows saving projections with calendar selection

**Calculation Formula:**
- **Daily Return:** `investment × 87% win rate × 60% payout`
- **Monthly Return:** `daily return × 22 trading days`

**Example:**
- Bank: R$ 5,000
- Risk: Conservative (1%) = R$ 50 investment
- Daily: R$ 50 × 0.87 × 0.60 = R$ 26.10
- Monthly: R$ 26.10 × 22 = R$ 574.20

## Data Flow

1. **User Authentication:**
   - User enters API token in profile page
   - Token stored in localStorage
   - All subsequent API calls use this token

2. **Data Fetching:**
   - Components check for API token on mount
   - If token exists, fetch data from API
   - Display loading states during fetch
   - Show error messages if API calls fail

3. **Data Processing:**
   - Raw trade data converted to display format
   - Dates formatted to Brazilian locale (pt-BR)
   - Currency formatted as BRL (R$)
   - Symbols cleaned (remove USDT suffix)

4. **Real-time Updates:**
   - Components refetch data when dateRange changes
   - All cards synchronized through shared dateRange prop
   - Dashboard components communicate via props

## Error Handling

All components include:
- Loading states while fetching data
- Error messages for failed API calls
- Fallback UI when no data available
- Token validation checks

## Environment

- **API Base URL:** `https://broker-api.mybroker.dev`
- **Authentication:** API token stored in localStorage
- **Storage Key:** `apiToken`

## Testing the Integration

1. Go to Profile page (`/perfil`)
2. Enter your MyBroker API token
3. Click "Conectar"
4. Verify user data populates automatically
5. Navigate to Operations page to see your trades
6. Check Home dashboard for aggregated statistics

## Notes

- All monetary values are displayed in Brazilian Real (BRL)
- Dates use Brazilian format (DD/MM/YYYY)
- Win rate is set to 87% with 60% average payout
- Trading days per month: 22
- Coin names display without USDT suffix for cleaner UI
