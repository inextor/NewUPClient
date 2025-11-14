# Backend API Documentation for Panel Informativo Charts

This document specifies 8 separate API endpoints needed to generate data for the dashboard charts in the Panel Informativo component.

## Database Model Context

### Core Tables
- **role**: Departments/positions (id, name, description, etc.)
- **user**: Employees/collaborators (id, name, username, role_id, etc.)
- **role_user**: Many-to-many relationship between users and roles
- **ecommerce_item**: Uniform items/garments (id, name, price, etc.)
- **order**: Purchase orders (id, created, status, etc.)
- **order_item**: Items in orders (id, order_id, ecommerce_item_id, qty, price, etc.)
- **user_order_item**: Assignment of order items to specific users (id, user_id, order_item_id, qty, delivered_date, etc.)

---

## Endpoint 1: Inversión por Departamento (Investment by Department/Role)

### Purpose
Calculate total monetary investment in uniforms per role.

### Endpoint
```
GET /api/v1/charts/inversion-por-departamento
```

### SQL Logic
```sql
SELECT
    r.id,
    r.name AS name,
    SUM(oi.price * oi.qty) AS value
FROM role r
LEFT JOIN role_user ru ON r.id = ru.role_id
LEFT JOIN user u ON ru.user_id = u.id
LEFT JOIN user_order_item uoi ON u.id = uoi.user_id
LEFT JOIN order_item oi ON uoi.order_item_id = oi.id
LEFT JOIN order o ON oi.order_id = o.id
WHERE o.status != 'cancelled' OR o.status IS NULL
GROUP BY r.id, r.name
ORDER BY value DESC
```

### Response Format (ngx-charts compatible)
```json
[
    {
        "name": "Recepción",
        "value": 45230
    },
    {
        "name": "Mantenimiento",
        "value": 38950
    },
    {
        "name": "Médico veterinario",
        "value": 52100
    },
    {
        "name": "Estética",
        "value": 31500
    },
    {
        "name": "Administración",
        "value": 48700
    }
]
```

### Notes
- Sum the total cost (price × quantity) of all order_items assigned to users belonging to each role
- Filter out cancelled orders
- Return top roles by investment amount

---

## Endpoint 2: Dotación de Personal Uniformado (Staff Allocation by Role)

### Purpose
Count how many users are assigned to each role and have received at least one uniform item.

### Endpoint
```
GET /api/v1/charts/dotacion-personal-uniformado
```

### SQL Logic
```sql
SELECT
    r.id,
    r.name AS name,
    COUNT(DISTINCT u.id) AS value
FROM role r
LEFT JOIN role_user ru ON r.id = ru.role_id
LEFT JOIN user u ON ru.user_id = u.id
INNER JOIN user_order_item uoi ON u.id = uoi.user_id
WHERE uoi.delivered_date IS NOT NULL
GROUP BY r.id, r.name
ORDER BY value DESC
```

### Response Format
```json
[
    {
        "name": "Recepción",
        "value": 45
    },
    {
        "name": "Mantenimiento",
        "value": 38
    },
    {
        "name": "Médico veterinario",
        "value": 52
    },
    {
        "name": "Estética",
        "value": 29
    },
    {
        "name": "Administración",
        "value": 41
    }
]
```

### Notes
- Count distinct users per role who have at least one delivered uniform item
- INNER JOIN with user_order_item ensures only uniformed staff are counted
- Filter by delivered_date IS NOT NULL to only count delivered items

---

## Endpoint 3: Costo por Colaborador (Average Cost per Employee by Role)

### Purpose
Calculate the average uniform cost per employee for each role.

### Endpoint
```
GET /api/v1/charts/costo-por-colaborador
```

### SQL Logic
```sql
SELECT
    r.id,
    r.name AS name,
    ROUND(
        COALESCE(
            SUM(oi.price * oi.qty) / NULLIF(COUNT(DISTINCT u.id), 0),
            0
        )
    ) AS value
FROM role r
LEFT JOIN role_user ru ON r.id = ru.role_id
LEFT JOIN user u ON ru.user_id = u.id
LEFT JOIN user_order_item uoi ON u.id = uoi.user_id
LEFT JOIN order_item oi ON uoi.order_item_id = oi.id
LEFT JOIN order o ON oi.order_id = o.id
WHERE (o.status != 'cancelled' OR o.status IS NULL)
  AND uoi.delivered_date IS NOT NULL
GROUP BY r.id, r.name
ORDER BY value DESC
```

### Response Format
```json
[
    {
        "name": "Recepción",
        "value": 350
    },
    {
        "name": "Mantenimiento",
        "value": 280
    },
    {
        "name": "Médico veterinario",
        "value": 425
    },
    {
        "name": "Estética",
        "value": 310
    },
    {
        "name": "Administración",
        "value": 390
    }
]
```

### Notes
- Divide total investment by number of uniformed employees per role
- Use NULLIF to prevent division by zero
- Round to whole numbers for currency

---

## Endpoint 4: % de Uniformidad por Departamento (Uniformity Percentage by Role)

### Purpose
Calculate what percentage of users in each role have received their complete uniform allocation.

### Endpoint
```
GET /api/v1/charts/uniformidad-por-departamento
```

### SQL Logic
```sql
SELECT
    r.id,
    r.name AS name,
    ROUND(
        COALESCE(
            (COUNT(DISTINCT CASE WHEN uoi.delivered_date IS NOT NULL THEN u.id END) * 100.0) /
            NULLIF(COUNT(DISTINCT u.id), 0),
            0
        )
    ) AS value
FROM role r
LEFT JOIN role_user ru ON r.id = ru.role_id
LEFT JOIN user u ON ru.user_id = u.id
LEFT JOIN user_order_item uoi ON u.id = uoi.user_id
GROUP BY r.id, r.name
HAVING COUNT(DISTINCT u.id) > 0
ORDER BY value DESC
LIMIT 4
```

### Response Format
```json
[
    {
        "name": "Recepción",
        "value": 85
    },
    {
        "name": "Mantenimiento",
        "value": 92
    },
    {
        "name": "Médico veterinario",
        "value": 78
    },
    {
        "name": "Estética",
        "value": 95
    }
]
```

### Notes
- Calculate (users with delivered items / total users in role) × 100
- Return as percentage (0-100)
- Limit to top 4 roles for pie chart readability
- Filter out roles with no users

---

## Endpoint 5: Monthly Data (Monthly Uniform Investment)

### Purpose
Show total uniform investment per month over the last 11 months.

### Endpoint
```
GET /api/v1/charts/monthly-data
```

### SQL Logic
```sql
SELECT
    TO_CHAR(o.created, 'Month') AS month_name,
    EXTRACT(MONTH FROM o.created) AS month_num,
    SUM(oi.price * oi.qty) AS total_investment
FROM order o
INNER JOIN order_item oi ON o.id = oi.order_id
WHERE o.created >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '11 months')
  AND o.status != 'cancelled'
GROUP BY month_name, month_num, EXTRACT(YEAR FROM o.created)
ORDER BY EXTRACT(YEAR FROM o.created), month_num
```

### Response Format (ngx-charts line chart format)
```json
[
    {
        "name": "Monthly Data",
        "series": [
            {
                "name": "Enero",
                "value": 125340
            },
            {
                "name": "Febrero",
                "value": 238950
            },
            {
                "name": "Marzo",
                "value": 195200
            },
            {
                "name": "Abril",
                "value": 287600
            },
            {
                "name": "Mayo",
                "value": 312450
            },
            {
                "name": "Junio",
                "value": 268900
            },
            {
                "name": "Julio",
                "value": 295100
            },
            {
                "name": "Agosto",
                "value": 342800
            },
            {
                "name": "Septiembre",
                "value": 278300
            },
            {
                "name": "Octubre",
                "value": 315600
            },
            {
                "name": "Noviembre",
                "value": 298700
            }
        ]
    }
]
```

### Notes
- Sum total order_item values per month for last 11 months
- Format month names in Spanish: "Enero", "Febrero", etc.
- Wrap in single series array for line chart
- Filter out cancelled orders

---

## Endpoint 6: Prendas con Mayor Rotación (Most Frequently Ordered Items)

### Purpose
Identify which uniform items (ecommerce_item) are ordered most frequently.

### Endpoint
```
GET /api/v1/charts/prendas-mayor-rotacion
```

### SQL Logic
```sql
SELECT
    ei.id,
    ei.name AS name,
    SUM(oi.qty) AS value
FROM ecommerce_item ei
INNER JOIN order_item oi ON ei.id = oi.ecommerce_item_id
INNER JOIN order o ON oi.order_id = o.id
WHERE o.status != 'cancelled'
  AND o.created >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY ei.id, ei.name
ORDER BY value DESC
LIMIT 5
```

### Response Format
```json
[
    {
        "name": "Chamarra",
        "value": 245
    },
    {
        "name": "Camisa",
        "value": 198
    },
    {
        "name": "Pantalón",
        "value": 187
    },
    {
        "name": "Filipina",
        "value": 156
    },
    {
        "name": "Playera",
        "value": 142
    }
]
```

### Notes
- Sum total quantity ordered per ecommerce_item over last 12 months
- Order by highest quantity first
- Return top 5 items
- "Rotación" means frequency of ordering, not returns/exchanges

---

## Endpoint 7: Índice de Reposición (Replacement Index - Wear vs New Allocation)

### Purpose
Show the ratio between items assigned to users who already had that item (replacement due to wear) versus first-time allocations.

### Endpoint
```
GET /api/v1/charts/indice-reposicion
```

### SQL Logic
```sql
WITH user_item_history AS (
    SELECT
        uoi.user_id,
        oi.ecommerce_item_id,
        uoi.delivered_date,
        ROW_NUMBER() OVER (
            PARTITION BY uoi.user_id, oi.ecommerce_item_id
            ORDER BY uoi.delivered_date
        ) AS allocation_number
    FROM user_order_item uoi
    INNER JOIN order_item oi ON uoi.order_item_id = oi.id
    WHERE uoi.delivered_date IS NOT NULL
      AND uoi.delivered_date >= CURRENT_DATE - INTERVAL '12 months'
)
SELECT
    SUM(CASE WHEN allocation_number > 1 THEN 1 ELSE 0 END) AS replacement_count,
    SUM(CASE WHEN allocation_number = 1 THEN 1 ELSE 0 END) AS new_allocation_count
FROM user_item_history;
```

### Backend Processing
After getting counts, calculate percentages:
```javascript
const total = replacement_count + new_allocation_count;
const replacement_percentage = Math.round((replacement_count / total) * 100);
const new_percentage = 100 - replacement_percentage;
```

### Response Format
```json
[
    {
        "name": "Reposición por desgaste",
        "value": 35
    },
    {
        "name": "Nueva dotación",
        "value": 65
    }
]
```

### Notes
- Use window function to detect when same user receives same item multiple times
- allocation_number > 1 means replacement (desgaste/wear)
- allocation_number = 1 means first-time allocation (nueva dotación)
- Return as percentage of total allocations
- Values should sum to 100

---

## Endpoint 8: Variación de Personal Uniformado (Staff Variation by Role)

### Purpose
Show the change in number of uniformed employees per role compared to previous period (month-over-month or quarter-over-quarter).

### Endpoint
```
GET /api/v1/charts/variacion-personal-uniformado
```

### SQL Logic
```sql
WITH current_period AS (
    SELECT
        r.id AS role_id,
        r.name AS role_name,
        COUNT(DISTINCT u.id) AS current_count
    FROM role r
    LEFT JOIN role_user ru ON r.id = ru.role_id
    LEFT JOIN user u ON ru.user_id = u.id
    INNER JOIN user_order_item uoi ON u.id = uoi.user_id
    WHERE uoi.delivered_date >= DATE_TRUNC('month', CURRENT_DATE)
    GROUP BY r.id, r.name
),
previous_period AS (
    SELECT
        r.id AS role_id,
        COUNT(DISTINCT u.id) AS previous_count
    FROM role r
    LEFT JOIN role_user ru ON r.id = ru.role_id
    LEFT JOIN user u ON ru.user_id = u.id
    INNER JOIN user_order_item uoi ON u.id = uoi.user_id
    WHERE uoi.delivered_date >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
      AND uoi.delivered_date < DATE_TRUNC('month', CURRENT_DATE)
    GROUP BY r.id
)
SELECT
    cp.role_name AS name,
    COALESCE(cp.current_count, 0) - COALESCE(pp.previous_count, 0) AS value
FROM current_period cp
LEFT JOIN previous_period pp ON cp.role_id = pp.role_id
ORDER BY ABS(value) DESC
LIMIT 5;
```

### Response Format
```json
[
    {
        "name": "Recepción",
        "value": 5
    },
    {
        "name": "Mantenimiento",
        "value": -3
    },
    {
        "name": "Médico veterinario",
        "value": 8
    },
    {
        "name": "Estética",
        "value": -2
    },
    {
        "name": "Administración",
        "value": 4
    }
]
```

### Notes
- Compare current month uniformed staff count vs previous month
- Positive values = increase in uniformed staff
- Negative values = decrease in uniformed staff
- Return top 5 roles with most significant changes (positive or negative)
- Use ABS() for ordering to show largest changes first

---

## Implementation Notes for Backend Developer

### General Requirements
1. All endpoints should return JSON with proper CORS headers
2. Add error handling for database connection issues
3. Consider caching responses (5-15 minutes) for performance
4. Add query parameter support for date ranges where applicable
5. Return empty arrays `[]` instead of errors when no data exists

### Authentication
All chart endpoints should be accessible to authenticated users. Include standard bearer token validation.

### Performance Optimization
- Add database indexes on:
  - `order.created`
  - `user_order_item.delivered_date`
  - `user_order_item.user_id`
  - `order_item.order_id`
  - `order_item.ecommerce_item_id`
  - `role_user.user_id` and `role_user.role_id`

### Testing
Test each endpoint with:
- Empty database (should return empty arrays)
- Single record scenarios
- Large datasets (100+ users, 1000+ orders)
- Date boundary conditions (start/end of month, year transitions)
