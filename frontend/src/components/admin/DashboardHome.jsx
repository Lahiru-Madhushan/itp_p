import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Wallet,
  ClipboardList,
  Users,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  ChevronRight,
  Inbox,
} from "lucide-react";
import api from "../../lib/axios";

/* ------------------------------------------------------------------
   Palette - validated with the dataviz palette checker against a white
   surface. Sentiment is encoded as a DIVERGING scale (blue <-> red with a
   neutral gray midpoint) rather than green/red, which is indistinguishable
   under deuteranopia.
------------------------------------------------------------------ */
const INK = {
  primary: "#0b0b0b",
  secondary: "#52514e",
  muted: "#898781",
  grid: "#e1e0d9",
  axis: "#c3c2b7",
};

const SERIES_BLUE = "#2a78d6";

const SENTIMENT = {
  positive: "#2a78d6",
  unknown: "#898781",
  negative: "#d03b3b",
};

// Order state is genuine status, so it uses the reserved status tokens.
// Every bar is directly labelled, so colour reinforces rather than carries.
const ORDER_STATUS = {
  Pending: { color: "#fab219", icon: Clock },
  Confirmed: { color: "#0ca30c", icon: CheckCircle2 },
  "Out for Delivery": { color: "#2a78d6", icon: Truck },
  Cancelled: { color: "#d03b3b", icon: XCircle },
};

const LOW_STOCK_THRESHOLD = 10;

/* ------------------------------- helpers ------------------------------- */

const currency = (n) =>
  `Rs. ${Number(n || 0).toLocaleString("en-LK", { maximumFractionDigits: 0 })}`;

const compact = (n) => {
  const v = Number(n || 0);
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 10_000) return `${(v / 1000).toFixed(1)}K`;
  return v.toLocaleString();
};

// Local calendar day, not UTC - toISOString() would shift every bucket by a day
// for any timezone ahead of UTC (Sri Lanka is UTC+5:30).
const dayKey = (d) => {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(
    dt.getDate()
  ).padStart(2, "0")}`;
};

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
};

/** Sum a window of daily buckets ending today, going back `days`. */
const buildDailySeries = (records, days, getDate, getValue) => {
  const buckets = new Map();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    buckets.set(dayKey(d), { date: d, value: 0 });
  }
  records.forEach((r) => {
    const raw = getDate(r);
    if (!raw) return;
    const key = dayKey(raw);
    if (buckets.has(key)) buckets.get(key).value += getValue(r);
  });
  return Array.from(buckets.values()).map(({ date, value }) => ({
    label: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    value: Math.round(value * 100) / 100,
  }));
};

/* ------------------------------ sub-views ------------------------------ */

const StatTile = ({ label, value, sub, delta, icon, tone, onClick }) => {
  const Icon = icon;
  const positive = delta != null && delta >= 0;
  return (
    <button
      type="button"
      onClick={onClick}
      className="group text-left w-full rounded-2xl bg-white border border-gray-200 p-5 transition-all duration-200 hover:border-gray-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-sm text-gray-600">{label}</span>
        <span className={`shrink-0 rounded-xl p-2 ${tone}`}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>

      <div className="mt-3 text-3xl font-semibold text-gray-900">{value}</div>

      <div className="mt-2 flex items-center gap-2 text-xs">
        {delta != null && (
          <span
            className={`inline-flex items-center gap-1 font-medium ${
              positive ? "text-[#006300]" : "text-[#d03b3b]"
            }`}
          >
            {positive ? (
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            {positive ? "+" : ""}
            {delta}%
          </span>
        )}
        {sub && <span className="text-gray-500">{sub}</span>}
      </div>
    </button>
  );
};

const CardShell = ({ title, subtitle, action, children, className = "" }) => (
  <section
    className={`rounded-2xl bg-white border border-gray-200 p-5 sm:p-6 ${className}`}
  >
    <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
      <div>
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
    {children}
  </section>
);

const EmptyState = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-10 text-center">
    <Inbox className="h-8 w-8 text-gray-300" aria-hidden="true" />
    <p className="mt-3 text-sm text-gray-500">{message}</p>
  </div>
);

const ChartTooltip = ({ active, payload, label, formatter }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl bg-white px-3 py-2 shadow-lg border border-gray-200">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-semibold text-gray-900 tabular-nums">
        {formatter ? formatter(payload[0].value) : payload[0].value}
      </p>
    </div>
  );
};

const SkeletonCard = ({ className = "" }) => (
  <div
    className={`animate-pulse rounded-2xl bg-white border border-gray-200 p-5 ${className}`}
  >
    <div className="h-3 w-24 rounded bg-gray-200" />
    <div className="mt-4 h-8 w-32 rounded bg-gray-200" />
    <div className="mt-3 h-3 w-20 rounded bg-gray-100" />
  </div>
);

/* ------------------------------ dashboard ------------------------------ */

const DashboardHome = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errors, setErrors] = useState([]);
  const [range, setRange] = useState(14);
  const [data, setData] = useState({
    users: [],
    orders: [],
    payments: [],
    products: [],
    raw: [],
    sentiment: { positive: 0, negative: 0, unknown: 0 },
  });

  const load = async () => {
    const failed = [];

    // Every panel loads independently - one dead endpoint must not blank the
    // whole dashboard.
    const get = async (name, url, pick) => {
      try {
        const res = await api.get(url);
        return pick(res.data);
      } catch (err) {
        console.error(`Dashboard: failed to load ${name}`, err);
        failed.push(name);
        return null;
      }
    };

    const [users, orders, payments, products, raw, sentiment] = await Promise.all([
      get("users", "/user/AllUser", (d) => (Array.isArray(d) ? d : [])),
      get("orders", "/order/all", (d) => d?.orders ?? []),
      get("payments", "/api/payments/all", (d) => d?.payments ?? []),
      get("products", "/product/allProducts", (d) => (Array.isArray(d) ? d : [])),
      get("inventory", "/raw/", (d) => (Array.isArray(d) ? d : [])),
      get("sentiment", "/Chart/stats/sentiment", (d) => d),
    ]);

    setData({
      users: users ?? [],
      orders: orders ?? [],
      payments: payments ?? [],
      products: products ?? [],
      raw: raw ?? [],
      sentiment: sentiment ?? { positive: 0, negative: 0, unknown: 0 },
    });
    setErrors(failed);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    load();
  };

  const { users, orders, payments, products, raw, sentiment } = data;

  /* ------------------------------ derived ------------------------------ */

  const completedPayments = useMemo(
    () => payments.filter((p) => p.status === "Completed"),
    [payments]
  );

  const totalRevenue = useMemo(
    () => completedPayments.reduce((s, p) => s + (p.amount || 0), 0),
    [completedPayments]
  );

  const customers = useMemo(
    () => users.filter((u) => u.role !== "admin"),
    [users]
  );

  // Percentage change of this window versus the window immediately before it.
  const trend = useCallback(
    (records, getDate, getValue) => {
      const now = Date.now();
      const span = range * 24 * 60 * 60 * 1000;
      let current = 0;
      let previous = 0;
      records.forEach((r) => {
        const raw = getDate(r);
        if (!raw) return;
        const age = now - new Date(raw).getTime();
        if (age < 0) return;
        if (age <= span) current += getValue(r);
        else if (age <= span * 2) previous += getValue(r);
      });
      if (previous === 0) return current > 0 ? 100 : null;
      return Math.round(((current - previous) / previous) * 100);
    },
    [range]
  );

  const revenueSeries = useMemo(
    () =>
      buildDailySeries(
        completedPayments,
        range,
        (p) => p.paymentDate,
        (p) => p.amount || 0
      ),
    [completedPayments, range]
  );

  const revenueDelta = useMemo(
    () => trend(completedPayments, (p) => p.paymentDate, (p) => p.amount || 0),
    [completedPayments, trend]
  );

  const orderDelta = useMemo(
    () => trend(orders, (o) => o.createdAt, () => 1),
    [orders, trend]
  );

  const customerDelta = useMemo(
    () => trend(customers, (u) => u.createdAt, () => 1),
    [customers, trend]
  );

  const statusBreakdown = useMemo(() => {
    const counts = Object.keys(ORDER_STATUS).map((status) => ({
      status,
      count: orders.filter((o) => o.status === status).length,
    }));
    const max = Math.max(1, ...counts.map((c) => c.count));
    return counts.map((c) => ({ ...c, pct: (c.count / max) * 100 }));
  }, [orders]);

  const sentimentData = useMemo(() => {
    const rows = [
      { name: "Positive", value: sentiment.positive || 0, color: SENTIMENT.positive },
      { name: "Unknown", value: sentiment.unknown || 0, color: SENTIMENT.unknown },
      { name: "Negative", value: sentiment.negative || 0, color: SENTIMENT.negative },
    ];
    const total = rows.reduce((s, r) => s + r.value, 0);
    return { rows, total };
  }, [sentiment]);

  const lowStock = useMemo(() => {
    const fromProducts = products
      .filter((p) => Number(p.stockQuantity) <= LOW_STOCK_THRESHOLD)
      .map((p) => ({
        id: p._id,
        name: p.name,
        qty: Number(p.stockQuantity) || 0,
        unit: "pcs",
        kind: "Product",
        to: "/admin/dashboard/products",
      }));
    const fromRaw = raw
      .filter((r) => Number(r.quantity) <= LOW_STOCK_THRESHOLD)
      .map((r) => ({
        id: r._id,
        name: r.name,
        qty: Number(r.quantity) || 0,
        unit: r.unit || "units",
        kind: "Material",
        to: "/admin/dashboard/inventory",
      }));
    return [...fromProducts, ...fromRaw].sort((a, b) => a.qty - b.qty).slice(0, 6);
  }, [products, raw]);

  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 6),
    [orders]
  );

  const pendingCount = orders.filter((o) => o.status === "Pending").length;

  /* ------------------------------- render ------------------------------- */

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 animate-pulse rounded bg-gray-200" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <SkeletonCard className="lg:col-span-2 h-72" />
          <SkeletonCard className="h-72" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {greeting()}, welcome back
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
            {pendingCount > 0 && (
              <>
                {" · "}
                <button
                  onClick={() => navigate("/admin/dashboard/orders")}
                  className="font-medium text-amber-700 hover:underline"
                >
                  {pendingCount} order{pendingCount === 1 ? "" : "s"} awaiting action
                </button>
              </>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div
            className="inline-flex rounded-xl border border-gray-200 bg-white p-1"
            role="group"
            aria-label="Time range"
          >
            {[7, 14, 30].map((d) => (
              <button
                key={d}
                onClick={() => setRange(d)}
                aria-pressed={range === d}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  range === d
                    ? "bg-gray-900 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {d}d
              </button>
            ))}
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              aria-hidden="true"
            />
            Refresh
          </button>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle
            className="h-5 w-5 shrink-0 text-amber-600"
            aria-hidden="true"
          />
          <p className="text-sm text-amber-900">
            Couldn't load: <strong>{errors.join(", ")}</strong>. The rest of the
            dashboard is up to date — try refreshing.
          </p>
        </div>
      )}

      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Revenue"
          value={currency(totalRevenue)}
          sub={`from ${completedPayments.length} completed payment${
            completedPayments.length === 1 ? "" : "s"
          }`}
          delta={revenueDelta}
          icon={Wallet}
          tone="bg-blue-50 text-blue-700"
          onClick={() => navigate("/admin/dashboard/payment")}
        />
        <StatTile
          label="Orders"
          value={compact(orders.length)}
          sub={`${pendingCount} pending`}
          delta={orderDelta}
          icon={ClipboardList}
          tone="bg-amber-50 text-amber-700"
          onClick={() => navigate("/admin/dashboard/orders")}
        />
        <StatTile
          label="Customers"
          value={compact(customers.length)}
          sub={`${users.length - customers.length} admin${
            users.length - customers.length === 1 ? "" : "s"
          }`}
          delta={customerDelta}
          icon={Users}
          tone="bg-violet-50 text-violet-700"
          onClick={() => navigate("/admin/dashboard/All-user")}
        />
        <StatTile
          label="Products"
          value={compact(products.length)}
          sub={
            lowStock.length > 0 ? `${lowStock.length} low on stock` : "stock healthy"
          }
          icon={Package}
          tone="bg-emerald-50 text-emerald-700"
          onClick={() => navigate("/admin/dashboard/products")}
        />
      </div>

      {/* Revenue trend + order status */}
      <div className="grid gap-4 lg:grid-cols-3">
        <CardShell
          className="lg:col-span-2"
          title="Revenue"
          subtitle={`Completed payments, last ${range} days`}
        >
          {totalRevenue === 0 ? (
            <EmptyState message="No completed payments in this period yet." />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={revenueSeries}
                  margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={SERIES_BLUE} stopOpacity={0.24} />
                      <stop offset="100%" stopColor={SERIES_BLUE} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="0"
                    stroke={INK.grid}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: INK.muted, fontSize: 12 }}
                    tickLine={false}
                    axisLine={{ stroke: INK.axis }}
                    interval="preserveStartEnd"
                    minTickGap={24}
                  />
                  <YAxis
                    tick={{ fill: INK.muted, fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    width={56}
                    tickFormatter={(v) => compact(v)}
                  />
                  <Tooltip
                    cursor={{ stroke: INK.axis, strokeWidth: 1 }}
                    content={<ChartTooltip formatter={currency} />}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={SERIES_BLUE}
                    strokeWidth={2}
                    fill="url(#revenueFill)"
                    activeDot={{ r: 5, strokeWidth: 2, stroke: "#ffffff" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardShell>

        <CardShell title="Order status" subtitle={`${orders.length} orders total`}>
          {orders.length === 0 ? (
            <EmptyState message="No orders placed yet." />
          ) : (
            <div className="space-y-4">
              {statusBreakdown.map(({ status, count, pct }) => {
                const { color, icon: Icon } = ORDER_STATUS[status];
                return (
                  <div key={status}>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="inline-flex items-center gap-2 text-sm text-gray-700">
                        <Icon
                          className="h-4 w-4 shrink-0"
                          style={{ color }}
                          aria-hidden="true"
                        />
                        {status}
                      </span>
                      <span className="text-sm font-semibold text-gray-900 tabular-nums">
                        {count}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-100">
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardShell>
      </div>

      {/* Sentiment + low stock */}
      <div className="grid gap-4 lg:grid-cols-3">
        <CardShell
          title="Feedback sentiment"
          subtitle="Across all reviews"
          action={
            <button
              onClick={() => navigate("/admin/dashboard/feedback")}
              className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Reviews
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          }
        >
          {sentimentData.total === 0 ? (
            <EmptyState message="No feedback collected yet." />
          ) : (
            <>
              <div className="relative h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sentimentData.rows}
                      dataKey="value"
                      nameKey="name"
                      innerRadius="66%"
                      outerRadius="92%"
                      paddingAngle={2}
                      stroke="#ffffff"
                      strokeWidth={2}
                    >
                      {sentimentData.rows.map((r) => (
                        <Cell key={r.name} fill={r.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-semibold text-gray-900">
                    {sentimentData.total.toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-500">reviews</span>
                </div>
              </div>

              <ul className="mt-4 space-y-2">
                {sentimentData.rows.map((r) => (
                  <li key={r.name} className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-sm text-gray-700">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: r.color }}
                        aria-hidden="true"
                      />
                      {r.name}
                    </span>
                    <span className="text-sm text-gray-600 tabular-nums">
                      {r.value.toLocaleString()} ·{" "}
                      {((r.value / sentimentData.total) * 100).toFixed(0)}%
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </CardShell>

        <CardShell
          className="lg:col-span-2"
          title="Low stock"
          subtitle={`At or below ${LOW_STOCK_THRESHOLD} units`}
        >
          {lowStock.length === 0 ? (
            <EmptyState message="Everything is well stocked." />
          ) : (
            <ul className="divide-y divide-gray-100">
              {lowStock.map((item) => (
                <li key={`${item.kind}-${item.id}`}>
                  <button
                    onClick={() => navigate(item.to)}
                    className="flex w-full items-center justify-between gap-3 py-3 text-left hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span
                        className={`shrink-0 rounded-lg p-1.5 ${
                          item.qty === 0
                            ? "bg-red-50 text-[#d03b3b]"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-gray-900">
                          {item.name}
                        </span>
                        <span className="block text-xs text-gray-500">
                          {item.kind}
                        </span>
                      </span>
                    </span>
                    <span
                      className={`shrink-0 text-sm font-semibold tabular-nums ${
                        item.qty === 0 ? "text-[#d03b3b]" : "text-gray-900"
                      }`}
                    >
                      {item.qty === 0
                        ? "Out of stock"
                        : `${item.qty} ${item.unit}`}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </CardShell>
      </div>

      {/* Recent orders */}
      <CardShell
        title="Recent orders"
        subtitle="Newest first"
        action={
          <button
            onClick={() => navigate("/admin/dashboard/orders")}
            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            View all
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        }
      >
        {recentOrders.length === 0 ? (
          <EmptyState message="No orders to show." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="pb-3 font-medium">Order</th>
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium text-right">Total</th>
                  <th className="pb-3 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.map((o) => {
                  const meta = ORDER_STATUS[o.status] || ORDER_STATUS.Pending;
                  const Icon = meta.icon;
                  return (
                    <tr key={o._id} className="hover:bg-gray-50">
                      <td className="py-3 pr-3 font-medium text-gray-900">
                        {o.orderId || o._id?.slice(-8)}
                      </td>
                      <td className="py-3 pr-3 text-gray-600">
                        {o.userId
                          ? `${o.userId.firstName ?? ""} ${
                              o.userId.lastName ?? ""
                            }`.trim() || "—"
                          : "—"}
                      </td>
                      <td className="py-3 pr-3 text-gray-600">
                        {o.createdAt
                          ? new Date(o.createdAt).toLocaleDateString("en-US", {
                              day: "numeric",
                              month: "short",
                            })
                          : "—"}
                      </td>
                      <td className="py-3 pr-3 text-right font-medium text-gray-900 tabular-nums">
                        {currency(o.total)}
                      </td>
                      <td className="py-3 text-right">
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                          style={{
                            color: meta.color,
                            backgroundColor: `${meta.color}14`,
                          }}
                        >
                          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardShell>
    </div>
  );
};

export default DashboardHome;
