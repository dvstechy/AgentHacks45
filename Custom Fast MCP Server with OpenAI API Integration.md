# Custom Fast MCP Server with OpenAI API Integration

**Lightweight, Production-Ready Model Context Protocol Server for Direct Chainlit Integration**

---

## Executive Summary

This document describes a **custom, minimal MCP server** designed specifically for Chainlit integration with OpenAI API. The architecture prioritizes:

- **Speed**: Lightweight, fast response times
- **Simplicity**: Minimal dependencies, easy to understand and modify
- **Direct Integration**: Chainlit connects directly to MCP server via HTTP/WebSocket
- **OpenAI Native**: Uses OpenAI API for all LLM reasoning
- **Tool Calling**: Native OpenAI tool calling (function_calling)
- **Streaming**: Built-in streaming support for real-time responses

---

## 1. Architecture Overview

### 1.1 System Design

```
┌──────────────────────────────────────────────────────────┐
│                    Chainlit Application                   │
│         (Python, runs on port 8000)                       │
└────────────────────┬─────────────────────────────────────┘
                     │
                     │ HTTP/WebSocket
                     │ (Direct Connection)
                     │
┌────────────────────▼─────────────────────────────────────┐
│            Custom MCP Server                              │
│         (FastAPI, runs on port 8001)                      │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Tool Definitions (15+ tools)                         │ │
│  │ - check_stock, list_warehouses, get_forecast, etc.   │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Agentic Reasoning Loop                               │ │
│  │ - OpenAI API calls with function_calling             │ │
│  │ - Automatic tool execution                           │ │
│  │ - Streaming responses                                │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Database Layer (Prisma)                              │ │
│  │ - Inventory, Warehouses, Suppliers, etc.             │ │
│  └──────────────────────────────────────────────────────┘ │
└────────────────────┬─────────────────────────────────────┘
                     │
                     │ PostgreSQL
                     │
┌────────────────────▼─────────────────────────────────────┐
│                  PostgreSQL Database                      │
│         (Inventory, Orders, Decisions, etc.)              │
└──────────────────────────────────────────────────────────┘
```

### 1.2 Communication Flow

```
User Input (Chainlit)
        ↓
Chainlit → MCP Server (HTTP POST /reason)
        ↓
MCP Server → OpenAI API (gpt-4-turbo with function_calling)
        ↓
OpenAI → Tool Call (e.g., check_stock)
        ↓
MCP Server → Execute Tool (Query Prisma)
        ↓
Tool Result → OpenAI API (Continue agentic loop)
        ↓
... (repeat until conclusion)
        ↓
Final Response → Chainlit (Stream or JSON)
        ↓
Display to User
```

---

## 2. MCP Server Architecture

### 2.1 Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | FastAPI | Lightweight, fast HTTP server |
| **LLM** | OpenAI API (gpt-4-turbo) | Reasoning and tool calling |
| **Tool Calling** | OpenAI function_calling | Native tool execution |
| **Database** | PostgreSQL + Prisma | Data persistence |
| **Async** | asyncio | Non-blocking I/O |
| **Streaming** | Server-Sent Events (SSE) | Real-time responses |
| **Deployment** | Docker | Containerization |

### 2.2 Project Structure

```
custom-mcp-server/
├── main.py                         # FastAPI app entry point
├── config.py                       # Configuration
├── tools/
│   ├── __init__.py
│   ├── inventory_tools.py          # Inventory operations
│   ├── forecasting_tools.py        # Demand forecasting
│   ├── supplier_tools.py           # Supplier management
│   ├── action_tools.py             # Actions (transfer, PO)
│   └── tool_registry.py            # Tool definitions
├── services/
│   ├── __init__.py
│   ├── openai_service.py           # OpenAI API wrapper
│   ├── database_service.py         # Prisma wrapper
│   ├── reasoning_service.py        # Agentic reasoning
│   └── streaming_service.py        # Streaming handler
├── models/
│   ├── __init__.py
│   └── schemas.py                  # Pydantic models
├── utils/
│   ├── __init__.py
│   ├── logger.py                   # Logging
│   └── validators.py               # Input validation
├── requirements.txt
├── .env.example
├── Dockerfile
└── docker-compose.yml
```

---

## 3. Key Design Decisions

### 3.1 Why Custom MCP Server?

| Aspect | Generic MCP | Custom MCP | Benefit |
| :--- | :--- | :--- | :--- |
| **Dependencies** | Heavy | Minimal | Faster, easier to deploy |
| **Customization** | Limited | Full | Tailored for inventory |
| **Performance** | Good | Excellent | Optimized for Kirana use case |
| **Maintenance** | Complex | Simple | Easier to understand |
| **Cost** | Higher | Lower | Fewer abstractions |
| **Learning Curve** | Steep | Gentle | Faster development |

### 3.2 Why OpenAI API?

| Feature | OpenAI | Anthropic | Benefit |
| :--- | :--- | :--- | :--- |
| **Function Calling** | Native, mature | Manual | Simpler implementation |
| **Streaming** | Built-in | Manual | Better UX |
| **Cost** | Lower for GPT-4 | Higher | Cost optimization |
| **Latency** | Lower | Higher | Faster responses |
| **Tool Calling** | Automatic | Manual | Less code |
| **Ecosystem** | Largest | Growing | More integrations |

### 3.3 Why FastAPI?

**FastAPI** is chosen for the MCP server because:

- **Speed**: One of the fastest Python frameworks (comparable to Node.js)
- **Async by Default**: Built-in async/await support for non-blocking I/O
- **Automatic Documentation**: Swagger UI and OpenAPI schema generation
- **Type Safety**: Full Python type hints with Pydantic validation
- **Minimal Boilerplate**: Less code compared to Flask or Django
- **Production Ready**: Used by major companies (Uber, Netflix, etc.)

---

## 4. OpenAI Function Calling Integration

### 4.1 Tool Definition Format

OpenAI's function calling uses JSON schema for tool definitions:

```json
{
  "type": "function",
  "function": {
    "name": "check_stock",
    "description": "Check current stock level for a SKU in a warehouse",
    "parameters": {
      "type": "object",
      "properties": {
        "sku": {
          "type": "string",
          "description": "Product SKU"
        },
        "warehouse": {
          "type": "string",
          "description": "Warehouse ID (optional)"
        }
      },
      "required": ["sku"]
    }
  }
}
```

### 4.2 Agentic Loop with OpenAI

The agentic reasoning loop works as follows:

1. **User Query** → Chainlit sends message to MCP server
2. **System Prompt** → MCP server creates system prompt with inventory context
3. **OpenAI Call** → Send message + tools to OpenAI API
4. **Tool Call** → OpenAI returns tool_call (e.g., check_stock)
5. **Execute Tool** → MCP server executes tool (query database)
6. **Tool Result** → Add result to conversation history
7. **Loop** → Send updated conversation back to OpenAI
8. **Conclusion** → OpenAI returns final text response
9. **Return** → MCP server streams response back to Chainlit

---

## 5. Streaming Architecture

### 5.1 Server-Sent Events (SSE)

Chainlit receives real-time updates via Server-Sent Events:

```
Client (Chainlit)
    ↓
GET /stream/reasoning/{session_id}
    ↓
Server (MCP)
    ↓
data: {"type": "thinking", "content": "Analyzing inventory..."}
data: {"type": "tool_call", "tool": "check_stock", "sku": "MAGGI"}
data: {"type": "tool_result", "result": {"stock": 45}}
data: {"type": "response", "content": "Stock is low..."}
data: {"type": "done"}
    ↓
Client displays updates in real-time
```

### 5.2 Streaming Benefits

- **Real-time feedback**: Users see thinking process
- **Better UX**: No waiting for complete response
- **Lower latency perception**: First token appears quickly
- **Transparency**: Users understand agent reasoning

---

## 6. Database Integration

### 6.1 Prisma Schema (Minimal)

```prisma
model Inventory {
  id String @id @default(cuid())
  sku String
  warehouse String
  quantity Int
  reorderPoint Int
  safetyStock Int
  maxStock Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([sku, warehouse])
}

model Warehouse {
  id String @id @default(cuid())
  name String
  location String
  capacity Int
  currentUtilization Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Product {
  id String @id @default(cuid())
  sku String @unique
  name String
  category String
  cost Float
  avgDailyDemand Float
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model AgentDecision {
  id String @id @default(cuid())
  eventType String
  reasoning String
  recommendedAction String
  actionParameters Json
  confidence Float
  status String // PENDING, APPROVED, REJECTED
  approvedBy String?
  approvedAt DateTime?
  rejectionReason String?
  rejectedBy String?
  rejectedAt DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model EventLog {
  id String @id @default(cuid())
  eventType String
  entityType String
  entityId String
  payload Json
  processed Boolean @default(false)
  processedAt DateTime?
  agentDecisionId String?
  createdAt DateTime @default(now())
}
```

---

## 7. Tool Categories

### 7.1 15+ Tools Organized by Function

**Inventory Tools (4)**:
- `check_stock` - Check stock for SKU in warehouse
- `list_warehouses` - List all warehouses
- `get_inventory_summary` - Comprehensive inventory view
- `check_warehouse_capacity` - Warehouse utilization

**Forecasting Tools (2)**:
- `get_forecast` - Demand forecast for next N hours
- `get_demand_trend` - Trend analysis (increasing/stable/decreasing)

**Supplier Tools (2)**:
- `get_supplier_options` - Ranked suppliers by cost
- `get_supplier_performance` - Performance metrics

**Reorder Tools (2)**:
- `get_reorder_recommendations` - SKUs needing reorder
- `calculate_eoq` - Economic order quantity

**Trend Tools (2)**:
- `get_trending_skus` - High-velocity products
- `get_slow_moving_skus` - Low-velocity products

**Action Tools (3)**:
- `create_internal_transfer` - Transfer between warehouses
- `create_purchase_order` - Order from supplier
- `send_notification` - Alert store manager

---

## 8. Performance Characteristics

### 8.1 Expected Latency

| Operation | Latency | Notes |
| :--- | :--- | :--- |
| **Tool Call** | 50-100ms | Database query |
| **OpenAI API Call** | 500-1500ms | Network + LLM |
| **Agentic Loop** | 2-5s | 3-5 iterations typical |
| **Total Response** | 3-8s | End-to-end |

### 8.2 Throughput

- **Concurrent Users**: 100+ (FastAPI async)
- **Requests/Second**: 50+ (depends on OpenAI rate limits)
- **Database Connections**: 20 (Prisma connection pool)

---

## 9. Deployment Model

### 9.1 Docker Deployment

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y postgresql-client

# Copy requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Expose port
EXPOSE 8001

# Run server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
```

### 9.2 Docker Compose

```yaml
version: '3.8'

services:
  mcp-server:
    build: .
    ports:
      - "8001:8001"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - DATABASE_URL=postgresql://user:password@postgres:5432/odoo_spit
      - LOG_LEVEL=INFO
    depends_on:
      - postgres
    volumes:
      - ./logs:/app/logs

  chainlit:
    build: ../chainlit-app
    ports:
      - "8000:8000"
    environment:
      - MCP_SERVER_URL=http://mcp-server:8001
    depends_on:
      - mcp-server

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=odoo_spit
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

---

## 10. API Endpoints

### 10.1 Main Endpoints

| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `/health` | GET | Health check |
| `/reason` | POST | Synchronous reasoning |
| `/reason/stream` | POST | Streaming reasoning |
| `/decisions/{id}` | GET | Get decision details |
| `/decisions/{id}/approve` | POST | Approve decision |
| `/decisions/{id}/reject` | POST | Reject decision |
| `/tools` | GET | List available tools |

### 10.2 Request/Response Format

**Request**:
```json
{
  "event": {
    "type": "DEMAND_SPIKE",
    "sku": "MAGGI_12",
    "warehouse": "WH-A",
    "velocity": 3.5
  },
  "context": {
    "timestamp": "2026-02-27T10:30:00Z",
    "user_role": "store_manager"
  }
}
```

**Response (Streaming)**:
```
data: {"type": "thinking", "content": "Analyzing demand spike..."}
data: {"type": "tool_call", "tool": "check_stock", "params": {...}}
data: {"type": "tool_result", "result": {...}}
data: {"type": "response", "content": "Stock is low, recommend transfer..."}
data: {"type": "done", "decision_id": "DECISION_123"}
```

---

## 11. Security Considerations

### 11.1 API Security

- **API Key Validation**: Chainlit → MCP server authentication
- **Input Validation**: Pydantic models for all inputs
- **Rate Limiting**: Prevent abuse (100 req/min per IP)
- **CORS**: Restrict to Chainlit origin only
- **Logging**: Audit trail for all decisions

### 11.2 Database Security

- **Connection Pooling**: Secure Prisma connections
- **SQL Injection**: Prisma prevents SQL injection
- **Encryption**: SSL/TLS for database connections
- **Access Control**: Role-based database permissions

---

## 12. Monitoring & Logging

### 12.1 Logging Strategy

```
logs/
├── mcp-server.log          # Main server logs
├── openai-calls.log        # OpenAI API calls
├── tool-execution.log      # Tool execution logs
├── errors.log              # Error logs
└── decisions.log           # Agent decisions
```

### 12.2 Metrics to Monitor

- **Response Time**: Average, P95, P99
- **Tool Call Success Rate**: % of successful tool executions
- **OpenAI API Cost**: Track spending
- **Error Rate**: % of failed requests
- **Concurrent Users**: Active sessions

---

## 13. Advantages of Custom MCP Server

| Advantage | Impact |
| :--- | :--- |
| **Lightweight** | Faster deployment, lower resource usage |
| **Direct Integration** | No middleware, direct Chainlit connection |
| **OpenAI Native** | Simpler tool calling, better performance |
| **Customizable** | Easy to add domain-specific logic |
| **Fast** | Optimized for inventory use case |
| **Maintainable** | Minimal dependencies, easy to understand |
| **Cost Effective** | Lower infrastructure costs |
| **Scalable** | FastAPI async handles 100+ concurrent users |

---

## 14. Conclusion

This custom MCP server provides a **lightweight, fast, production-ready** solution for agentic inventory optimization. By using OpenAI's native function calling and FastAPI's async capabilities, the system achieves:

- **Speed**: 3-8 second end-to-end response time
- **Simplicity**: Minimal dependencies, easy to maintain
- **Scalability**: 100+ concurrent users
- **Cost**: Optimized OpenAI API usage
- **Reliability**: Production-ready error handling

The architecture is specifically designed for direct Chainlit integration, providing a seamless conversational experience for store managers.

---

## References

[1] FastAPI Documentation: https://fastapi.tiangolo.com/
[2] OpenAI Function Calling: https://platform.openai.com/docs/guides/function-calling
[3] Prisma ORM: https://www.prisma.io/
[4] Server-Sent Events: https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events
[5] PostgreSQL: https://www.postgresql.org/
