-- ═══════════════════════════════════════════════════════════════
--  SALES DATA ANALYSIS — SQL QUERY LIBRARY
--  Compatible: PostgreSQL / MySQL / SQL Server
-- ═══════════════════════════════════════════════════════════════

-- TABLE SCHEMA
/*
CREATE TABLE sales (
    order_id      VARCHAR(20) PRIMARY KEY,
    order_date    DATE        NOT NULL,
    customer_id   VARCHAR(20) NOT NULL,
    region        VARCHAR(20),
    segment       VARCHAR(30),
    category      VARCHAR(30),
    quantity      INT,
    unit_price    DECIMAL(10,2),
    discount      DECIMAL(5,2),
    shipping_cost DECIMAL(10,2),
    sales         DECIMAL(12,2),
    profit        DECIMAL(12,2)
);
*/

-- ════════════════════════════════
--  SECTION 1: KPI OVERVIEW
-- ════════════════════════════════

-- 1.1 Overall Business KPIs
SELECT
    COUNT(DISTINCT order_id)                              AS total_orders,
    COUNT(DISTINCT customer_id)                           AS unique_customers,
    ROUND(SUM(sales), 2)                                  AS total_revenue,
    ROUND(SUM(profit), 2)                                 AS total_profit,
    ROUND(SUM(profit) / NULLIF(SUM(sales), 0) * 100, 2)  AS profit_margin_pct,
    ROUND(AVG(sales), 2)                                  AS avg_order_value,
    ROUND(SUM(quantity), 0)                               AS total_units_sold
FROM sales;

-- 1.2 YoY Revenue Growth
SELECT
    YEAR(order_date)                                         AS year,
    ROUND(SUM(sales), 2)                                     AS revenue,
    ROUND(SUM(profit), 2)                                    AS profit,
    ROUND(
        (SUM(sales) - LAG(SUM(sales)) OVER (ORDER BY YEAR(order_date)))
        / NULLIF(LAG(SUM(sales)) OVER (ORDER BY YEAR(order_date)), 0) * 100
    , 2)                                                     AS yoy_growth_pct
FROM sales
GROUP BY YEAR(order_date)
ORDER BY year;

-- ════════════════════════════════
--  SECTION 2: SALES PERFORMANCE
-- ════════════════════════════════

-- 2.1 Monthly Revenue & 3-Month Rolling Average
SELECT
    DATE_FORMAT(order_date, '%Y-%m')                      AS month,
    ROUND(SUM(sales), 2)                                  AS monthly_revenue,
    COUNT(DISTINCT order_id)                              AS orders,
    ROUND(AVG(SUM(sales)) OVER (
        ORDER BY DATE_FORMAT(order_date, '%Y-%m')
        ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
    ), 2)                                                 AS rolling_3m_avg
FROM sales
GROUP BY DATE_FORMAT(order_date, '%Y-%m')
ORDER BY month;

-- 2.2 Quarterly Performance
SELECT
    YEAR(order_date)                                           AS year,
    QUARTER(order_date)                                        AS quarter,
    ROUND(SUM(sales), 2)                                       AS revenue,
    ROUND(SUM(profit), 2)                                      AS profit,
    ROUND(SUM(profit)/NULLIF(SUM(sales),0)*100, 2)             AS margin_pct,
    COUNT(DISTINCT order_id)                                   AS orders
FROM sales
GROUP BY YEAR(order_date), QUARTER(order_date)
ORDER BY year, quarter;

-- 2.3 Day-of-Week Sales Pattern
SELECT
    DAYNAME(order_date)                                   AS day_of_week,
    DAYOFWEEK(order_date)                                 AS day_num,
    ROUND(AVG(sales), 2)                                  AS avg_daily_revenue,
    COUNT(order_id)                                       AS total_orders
FROM sales
GROUP BY DAYNAME(order_date), DAYOFWEEK(order_date)
ORDER BY day_num;

-- ════════════════════════════════
--  SECTION 3: CUSTOMER BEHAVIOR
-- ════════════════════════════════

-- 3.1 RFM Segmentation
WITH rfm_base AS (
    SELECT
        customer_id,
        DATEDIFF(CURRENT_DATE, MAX(order_date))     AS recency_days,
        COUNT(DISTINCT order_id)                     AS frequency,
        ROUND(SUM(sales), 2)                         AS monetary
    FROM sales
    GROUP BY customer_id
),
rfm_scored AS (
    SELECT *,
        NTILE(4) OVER (ORDER BY recency_days DESC)  AS r_score,
        NTILE(4) OVER (ORDER BY frequency)           AS f_score,
        NTILE(4) OVER (ORDER BY monetary)            AS m_score
    FROM rfm_base
)
SELECT *,
    CASE
        WHEN r_score + f_score + m_score >= 10 THEN 'Champions'
        WHEN r_score + f_score + m_score >= 8  THEN 'Loyal Customers'
        WHEN r_score + f_score + m_score >= 6  THEN 'Potential Loyalists'
        WHEN r_score + f_score + m_score >= 4  THEN 'At Risk'
        ELSE 'Lost'
    END AS customer_segment
FROM rfm_scored
ORDER BY monetary DESC;

-- 3.2 Customer Lifetime Value
SELECT
    customer_id,
    COUNT(DISTINCT order_id)                                   AS total_orders,
    ROUND(SUM(sales), 2)                                       AS lifetime_value,
    ROUND(AVG(sales), 2)                                       AS avg_order_value,
    MIN(order_date)                                            AS first_order,
    MAX(order_date)                                            AS last_order,
    DATEDIFF(MAX(order_date), MIN(order_date))                 AS tenure_days,
    NTILE(10) OVER (ORDER BY SUM(sales))                       AS value_decile
FROM sales
GROUP BY customer_id
ORDER BY lifetime_value DESC
LIMIT 20;

-- 3.3 Repeat vs First-Time Buyers
WITH order_rank AS (
    SELECT customer_id, order_id, order_date,
        ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date) AS rnk
    FROM sales
)
SELECT
    CASE WHEN rnk = 1 THEN 'First-Time' ELSE 'Repeat' END AS buyer_type,
    COUNT(o.order_id)              AS orders,
    COUNT(DISTINCT o.customer_id)  AS customers,
    ROUND(AVG(s.sales), 2)         AS avg_order_value
FROM order_rank o
JOIN sales s ON o.order_id = s.order_id
GROUP BY buyer_type;

-- ════════════════════════════════
--  SECTION 4: PRODUCT TRENDS
-- ════════════════════════════════

-- 4.1 Category Performance Matrix
SELECT
    category,
    ROUND(SUM(sales), 2)                                     AS total_revenue,
    ROUND(SUM(profit), 2)                                    AS total_profit,
    ROUND(SUM(profit)/NULLIF(SUM(sales),0)*100, 2)           AS margin_pct,
    SUM(quantity)                                            AS units_sold,
    ROUND(AVG(unit_price), 2)                                AS avg_price,
    ROUND(AVG(discount)*100, 2)                              AS avg_discount_pct,
    COUNT(DISTINCT order_id)                                 AS orders
FROM sales
GROUP BY category
ORDER BY total_revenue DESC;

-- 4.2 Discount Elasticity
SELECT
    discount,
    COUNT(order_id)                                          AS orders,
    ROUND(AVG(sales), 2)                                     AS avg_revenue,
    ROUND(AVG(profit), 2)                                    AS avg_profit,
    ROUND(SUM(profit)/NULLIF(SUM(sales),0)*100, 2)           AS margin_pct
FROM sales
GROUP BY discount
ORDER BY discount;

-- ════════════════════════════════
--  SECTION 5: REGIONAL ANALYSIS
-- ════════════════════════════════

-- 5.1 Region x Segment Heatmap
SELECT
    region, segment,
    ROUND(SUM(sales), 2)                                     AS revenue,
    ROUND(SUM(profit), 2)                                    AS profit,
    COUNT(DISTINCT customer_id)                              AS customers,
    ROUND(AVG(sales), 2)                                     AS avg_order_value
FROM sales
GROUP BY region, segment
ORDER BY region, revenue DESC;

-- 5.2 Market Share by Region
SELECT
    region,
    ROUND(SUM(sales), 2)                                              AS revenue,
    ROUND(SUM(sales) / SUM(SUM(sales)) OVER () * 100, 2)              AS market_share_pct,
    ROUND(SUM(profit)/NULLIF(SUM(sales),0)*100, 2)                    AS margin_pct,
    COUNT(DISTINCT customer_id)                                        AS unique_customers
FROM sales
GROUP BY region
ORDER BY market_share_pct DESC;

-- ════════════════════════════════
--  SECTION 6: OPERATIONAL ALERTS
-- ════════════════════════════════

-- 6.1 Loss-Making Orders
SELECT order_id, customer_id, category, sales, profit,
    ROUND(profit/NULLIF(sales,0)*100, 2) AS margin_pct
FROM sales
WHERE profit < 0
ORDER BY profit ASC
LIMIT 50;

-- 6.2 High-Discount, Negative-Margin Orders
SELECT order_id, customer_id, region, category,
    discount, sales, profit,
    ROUND(profit/NULLIF(sales,0)*100, 2) AS margin_pct
FROM sales
WHERE discount >= 0.15 AND profit < 0
ORDER BY profit ASC;

-- 6.3 Churned Customers (180+ days inactive)
SELECT
    customer_id,
    MAX(order_date)                           AS last_order_date,
    DATEDIFF(CURRENT_DATE, MAX(order_date))   AS days_since_purchase,
    COUNT(DISTINCT order_id)                  AS total_orders,
    ROUND(SUM(sales), 2)                      AS lifetime_value
FROM sales
GROUP BY customer_id
HAVING days_since_purchase > 180
ORDER BY lifetime_value DESC;