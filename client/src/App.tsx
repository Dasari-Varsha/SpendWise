import { useCallback, useEffect, useState } from "react";
import {
  Navigate,
  NavLink,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarClock,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Moon,
  Pencil,
  PiggyBank,
  Plus,
  Receipt,
  Search,
  Sun,
  Trash2,
  TrendingDown,
  TrendingUp,
  WalletCards,
  X,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import api from "./api";
import type { Subscription, Summary, Transaction, User } from "./types";

const money = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
const fmtDate = (d: string) =>
  new Date(d + "T00:00:00").toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
const monthLabel = (m: string) => {
  const [y, mo] = m.split("-");
  return new Date(+y, +mo - 1, 1).toLocaleDateString("en-IN", {
    month: "short",
  });
};
const daysUntil = (d: string) =>
  Math.round(
    (new Date(d + "T00:00:00").getTime() -
      new Date(new Date().toDateString()).getTime()) /
      864e5,
  );
const dueText = (d: string) => {
  const n = daysUntil(d);
  return n < 0
    ? `${-n}d overdue`
    : n === 0
      ? "Due today"
      : n === 1
        ? "Tomorrow"
        : `In ${n} days`;
};
const CATS = [
  "Food",
  "Transport",
  "Housing",
  "Utilities",
  "Shopping",
  "Health",
  "Entertainment",
  "Education",
  "Salary",
  "Other",
];
const COLORS = [
  "var(--c1)",
  "var(--c2)",
  "var(--c3)",
  "var(--c4)",
  "var(--c5)",
  "var(--c6)",
];
const errMsg = (e: any, fallback: string) =>
  e?.response?.data?.detail && typeof e.response.data.detail === "string"
    ? e.response.data.detail
    : fallback;

function Auth({ onLogin }: { onLogin: (u: User, t: string) => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [f, setF] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setF({ ...f, [k]: e.target.value });
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const r = await api.post(
        `/auth/${mode}`,
        mode === "register" ? f : { email: f.email, password: f.password },
      );
      onLogin(r.data.user, r.data.access_token);
    } catch (err) {
      setError(
        errMsg(
          err,
          "Could not sign in. Check that the API and database are running.",
        ),
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="auth">
      <section className="auth-art">
        <div className="brand">
          <span className="mark">
            <WalletCards size={20} />
          </span>
          spendwise
        </div>
        <div>
          <h1>
            Know where
            <br />
            it all goes.
          </h1>
          <p>
            Transactions, subscriptions and monthly trends in one calm, honest
            view.
          </p>
        </div>
        <ul>
          <li>
            <Receipt size={16} />
            Track every rupee in seconds
          </li>
          <li>
            <CalendarClock size={16} />
            Never miss a renewal
          </li>
          <li>
            <PiggyBank size={16} />
            Watch your savings rate grow
          </li>
        </ul>
      </section>
      <section className="auth-form">
        <form onSubmit={submit} className="stack">
          <h2>{mode === "login" ? "Welcome back" : "Create your account"}</h2>
          <p className="muted">
            {mode === "login"
              ? "Sign in to continue."
              : "It takes less than a minute."}
          </p>
          {mode === "register" && (
            <label>
              Full name
              <input
                required
                minLength={2}
                value={f.name}
                onChange={set("name")}
              />
            </label>
          )}
          <label>
            Email
            <input
              type="email"
              required
              value={f.email}
              onChange={set("email")}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              required
              minLength={8}
              value={f.password}
              onChange={set("password")}
              placeholder="At least 8 characters"
            />
          </label>
          {error && (
            <div className="error" role="alert">
              {error}
            </div>
          )}
          <button className="btn primary" disabled={busy}>
            {busy
              ? "Please wait…"
              : mode === "login"
                ? "Sign in"
                : "Create account"}
          </button>
          <p className="muted center">
            {mode === "login" ? "New here?" : "Have an account?"}{" "}
            <button
              type="button"
              className="link"
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setError("");
              }}
            >
              {mode === "login" ? "Create one" : "Sign in"}
            </button>
          </p>
        </form>
      </section>
    </div>
  );
}

function Shell({
  user,
  dark,
  toggleTheme,
  onLogout,
  children,
}: {
  user: User;
  dark: boolean;
  toggleTheme: () => void;
  onLogout: () => void;
  children: React.ReactNode;
}) {
  const nav = [
    { to: "/", label: "Overview", icon: LayoutDashboard },
    { to: "/transactions", label: "Transactions", icon: Receipt },
    { to: "/subscriptions", label: "Subscriptions", icon: CreditCard },
  ];
  return (
    <div className="shell">
      <aside className="side">
        <div className="brand">
          <span className="mark">
            <WalletCards size={20} />
          </span>
          spendwise
        </div>
        <nav>
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === "/"}
              className={({ isActive }) => "nav" + (isActive ? " on" : "")}
            >
              <n.icon size={18} />
              <span>{n.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="side-foot">
          <button className="nav" onClick={toggleTheme}>
            {dark ? <Sun size={18} /> : <Moon size={18} />}
            <span>{dark ? "Light mode" : "Dark mode"}</span>
          </button>
          <div className="me">
            <span className="avatar">{user.name[0]?.toUpperCase()}</span>
            <div>
              <strong>{user.name}</strong>
              <small>{user.email}</small>
            </div>
            <button className="icon" title="Sign out" onClick={onLogout}>
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
      <main>{children}</main>
    </div>
  );
}

function Head({
  title,
  sub,
  action,
}: {
  title: string;
  sub: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="head">
      <div>
        <h1>{title}</h1>
        <p className="muted">{sub}</p>
      </div>
      {action}
    </header>
  );
}
const Empty = ({ text }: { text: string }) => (
  <div className="empty">{text}</div>
);

function Overview() {
  const [s, setS] = useState<Summary | null>(null),
    [txns, setTxns] = useState<Transaction[]>([]),
    [error, setError] = useState("");
  useEffect(() => {
    Promise.all([
      api.get("/dashboard/summary"),
      api.get("/transactions?page=1&page_size=6"),
    ])
      .then(([a, b]) => {
        setS(a.data);
        setTxns(b.data.items);
      })
      .catch(() =>
        setError("Could not load the dashboard. Check the API connection."),
      );
  }, []);
  if (error) return <div className="error">{error}</div>;
  if (!s) return <div className="loading">Loading your overview…</div>;
  const delta = s.prev_expenses
    ? ((s.expenses - s.prev_expenses) / s.prev_expenses) * 100
    : null;
  const hour = new Date().getHours(),
    greet =
      hour < 12
        ? "Good morning"
        : hour < 18
          ? "Good afternoon"
          : "Good evening";
  return (
    <>
      <Head
        title={greet}
        sub={new Date().toLocaleDateString("en-IN", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })}
      />
      <section className="kpis">
        <div className="card hero">
          <span className="label">Net balance this month</span>
          <strong className={s.balance < 0 ? "neg" : ""}>
            {money(s.balance)}
          </strong>
          <small>{s.transaction_count} transactions tracked</small>
        </div>
        <div className="card">
          <span className="label">Income</span>
          <strong>{money(s.income)}</strong>
        </div>
        <div className="card">
          <span className="label">Expenses</span>
          <strong>{money(s.expenses)}</strong>
          {delta !== null && (
            <small className={"delta " + (delta > 0 ? "bad" : "good")}>
              {delta > 0 ? (
                <TrendingUp size={14} />
              ) : (
                <TrendingDown size={14} />
              )}
              {Math.abs(delta).toFixed(0)}% vs last month
            </small>
          )}
        </div>
        <div className="card">
          <span className="label">Savings rate</span>
          <strong>
            {s.savings_rate === null ? "—" : `${s.savings_rate}%`}
          </strong>
          <small>
            {money(s.subscription_monthly_cost)}/mo in subscriptions
          </small>
        </div>
      </section>
      <section className="grid2">
        <div className="card">
          <h3>Income vs expenses</h3>
          <p className="muted">Last 6 active months</p>
          {s.monthly_trend.length ? (
            <div className="chart">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={s.monthly_trend}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="var(--line)"
                  />
                  <XAxis
                    dataKey="month"
                    tickFormatter={monthLabel}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "var(--muted)", fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    width={40}
                    tick={{ fill: "var(--muted)", fontSize: 12 }}
                    tickFormatter={(v) =>
                      v >= 1000 ? `${Math.round(v / 1000)}k` : v
                    }
                  />
                  <Tooltip
                    formatter={(v: any) => money(Number(v))}
                    labelFormatter={monthLabel}
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--line)",
                      borderRadius: 10,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="income"
                    name="Income"
                    stroke="var(--c1)"
                    fill="var(--c1)"
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="expense"
                    name="Expenses"
                    stroke="var(--c2)"
                    fill="var(--c2)"
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <Empty text="Add a few transactions to see trends." />
          )}
        </div>
        <div className="card">
          <h3>Where it goes</h3>
          <p className="muted">Expenses by category</p>
          {s.category_breakdown.length ? (
            <>
              <div className="donut">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={s.category_breakdown}
                      dataKey="amount"
                      nameKey="category"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                      stroke="none"
                    >
                      {s.category_breakdown.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v: any) => money(Number(v))}
                      contentStyle={{
                        background: "var(--card)",
                        border: "1px solid var(--line)",
                        borderRadius: 10,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="legend">
                {s.category_breakdown.slice(0, 5).map((c, i) => (
                  <li key={c.category}>
                    <i style={{ background: COLORS[i % COLORS.length] }} />
                    {c.category}
                    <strong>{money(c.amount)}</strong>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <Empty text="No expenses yet this month." />
          )}
        </div>
      </section>
      <section className="grid2 even">
        <div className="card">
          <div className="row">
            <h3>Recent transactions</h3>
            <NavLink className="link" to="/transactions">
              View all
            </NavLink>
          </div>
          <TxnList items={txns} />
        </div>
        <div className="card">
          <h3>Upcoming renewals</h3>
          <p className="muted">Next 30 days</p>
          {s.upcoming.length ? (
            <ul className="renew">
              {s.upcoming.map((u) => (
                <li key={u.id}>
                  <span className="avatar sm">{u.name[0].toUpperCase()}</span>
                  <div>
                    <strong>{u.name}</strong>
                    <small
                      className={
                        daysUntil(u.next_billing_date) <= 3 ? "bad" : ""
                      }
                    >
                      {dueText(u.next_billing_date)} ·{" "}
                      {fmtDate(u.next_billing_date)}
                    </small>
                  </div>
                  <b>{money(u.amount)}</b>
                </li>
              ))}
            </ul>
          ) : (
            <Empty text="Nothing renewing soon." />
          )}
        </div>
      </section>
    </>
  );
}

function TxnList({
  items,
  onEdit,
  onDelete,
}: {
  items: Transaction[];
  onEdit?: (t: Transaction) => void;
  onDelete?: (t: Transaction) => void;
}) {
  if (!items.length) return <Empty text="No transactions found." />;
  return (
    <ul className="txns">
      {items.map((t) => (
        <li key={t.id}>
          <span className={"ticon " + t.type}>
            {t.type === "income" ? (
              <ArrowDownLeft size={16} />
            ) : (
              <ArrowUpRight size={16} />
            )}
          </span>
          <div className="grow">
            <strong>{t.title}</strong>
            <small>
              {t.category} · {fmtDate(t.date)}
              {t.note ? ` · ${t.note}` : ""}
            </small>
          </div>
          <b className={t.type}>
            {t.type === "income" ? "+" : "−"}
            {money(t.amount)}
          </b>
          {onEdit && onDelete && (
            <div className="acts">
              <button
                className="icon"
                aria-label="Edit"
                onClick={() => onEdit(t)}
              >
                <Pencil size={15} />
              </button>
              <button
                className="icon danger"
                aria-label="Delete"
                onClick={() => onDelete(t)}
              >
                <Trash2 size={15} />
              </button>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

function TxnModal({
  txn,
  onClose,
  onSaved,
}: {
  txn: Transaction | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [f, setF] = useState({
    title: txn?.title ?? "",
    amount: txn ? String(txn.amount) : "",
    type: txn?.type ?? "expense",
    category: txn?.category ?? "Food",
    date: txn?.date ?? new Date().toISOString().slice(0, 10),
    note: txn?.note ?? "",
  });
  const [error, setError] = useState("");
  const set =
    (k: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setF({ ...f, [k]: e.target.value });
  async function save(e: React.FormEvent) {
    e.preventDefault();
    try {
      const body = { ...f, amount: Number(f.amount) };
      txn
        ? await api.patch("/transactions/" + txn.id, body)
        : await api.post("/transactions", body);
      onSaved();
    } catch (err) {
      setError(errMsg(err, "Could not save transaction."));
    }
  }
  return (
    <div className="overlay" onMouseDown={onClose}>
      <form
        className="modal"
        onMouseDown={(e) => e.stopPropagation()}
        onSubmit={save}
      >
        <div className="row">
          <h3>{txn ? "Edit transaction" : "New transaction"}</h3>
          <button type="button" className="icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="seg">
          {(["expense", "income"] as const).map((t) => (
            <button
              type="button"
              key={t}
              className={f.type === t ? "on" : ""}
              onClick={() => setF({ ...f, type: t })}
            >
              {t === "expense" ? "Expense" : "Income"}
            </button>
          ))}
        </div>
        <div className="formgrid">
          <label>
            Title
            <input
              required
              minLength={2}
              value={f.title}
              onChange={set("title")}
              placeholder="e.g. Groceries"
            />
          </label>
          <label>
            Amount (₹)
            <input
              required
              type="number"
              min="0.01"
              step="0.01"
              value={f.amount}
              onChange={set("amount")}
            />
          </label>
          <label>
            Category
            <select value={f.category} onChange={set("category")}>
              {CATS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label>
            Date
            <input required type="date" value={f.date} onChange={set("date")} />
          </label>
          <label className="span2">
            Note
            <input
              maxLength={500}
              value={f.note}
              onChange={set("note")}
              placeholder="Optional"
            />
          </label>
        </div>
        {error && <div className="error">{error}</div>}
        <button className="btn primary">
          {txn ? "Save changes" : "Add transaction"}
        </button>
      </form>
    </div>
  );
}

function Transactions() {
  const [items, setItems] = useState<Transaction[]>([]),
    [page, setPage] = useState(1),
    [pages, setPages] = useState(1),
    [total, setTotal] = useState(0);
  const [type, setType] = useState(""),
    [category, setCategory] = useState(""),
    [q, setQ] = useState(""),
    [dq, setDq] = useState(""),
    [error, setError] = useState("");
  const [modal, setModal] = useState<Transaction | "new" | null>(null);
  useEffect(() => {
    const t = setTimeout(() => {
      setDq(q);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [q]);
  const load = useCallback(async () => {
    try {
      const p = new URLSearchParams({ page: String(page), page_size: "10" });
      if (type) p.set("type", type);
      if (category) p.set("category", category);
      if (dq) p.set("q", dq);
      const r = await api.get("/transactions?" + p);
      setItems(r.data.items);
      setPages(Math.max(1, r.data.pages));
      setTotal(r.data.total);
      setError("");
    } catch {
      setError("Unable to load transactions.");
    }
  }, [page, type, category, dq]);
  useEffect(() => {
    load();
  }, [load]);
  async function remove(t: Transaction) {
    if (!confirm(`Delete “${t.title}”?`)) return;
    await api.delete("/transactions/" + t.id);
    load();
  }
  return (
    <>
      <Head
        title="Transactions"
        sub="Search, filter and edit everything you've recorded."
        action={
          <button className="btn primary" onClick={() => setModal("new")}>
            <Plus size={16} />
            Add transaction
          </button>
        }
      />
      <div className="card">
        <div className="filters">
          <div className="search">
            <Search size={16} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search title, note or category"
            />
          </div>
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All types</option>
            <option value="expense">Expenses</option>
            <option value="income">Income</option>
          </select>
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All categories</option>
            {CATS.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        {error && <div className="error">{error}</div>}
        <TxnList items={items} onEdit={setModal} onDelete={remove} />
        <div className="pager">
          <span className="muted">{total} transactions</span>
          <div>
            <button
              className="btn"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </button>
            <span>
              {page} / {pages}
            </span>
            <button
              className="btn"
              disabled={page >= pages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
      {modal && (
        <TxnModal
          txn={modal === "new" ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null);
            load();
          }}
        />
      )}
    </>
  );
}

const perMonth = (s: Subscription) =>
  s.amount *
  ({ weekly: 52 / 12, monthly: 1, quarterly: 1 / 3, yearly: 1 / 12 }[
    s.frequency
  ] || 1);
function Subscriptions() {
  const [items, setItems] = useState<Subscription[]>([]),
    [show, setShow] = useState(false),
    [error, setError] = useState("");
  const [f, setF] = useState({
    name: "",
    amount: "",
    frequency: "monthly",
    category: "Entertainment",
    next_billing_date: new Date().toISOString().slice(0, 10),
  });
  const load = useCallback(async () => {
    try {
      const r = await api.get("/subscriptions");
      setItems(r.data);
      setError("");
    } catch {
      setError("Unable to load subscriptions.");
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);
  async function create(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post("/subscriptions", {
        ...f,
        amount: Number(f.amount),
        active: true,
      });
      setShow(false);
      setF({ ...f, name: "", amount: "" });
      load();
    } catch (err) {
      setError(errMsg(err, "Could not save subscription."));
    }
  }
  const active = items.filter((s) => s.active),
    total = active.reduce((a, s) => a + perMonth(s), 0);
  return (
    <>
      <Head
        title="Subscriptions"
        sub="Know what renews, when, and what it costs."
        action={
          <button className="btn primary" onClick={() => setShow(!show)}>
            <Plus size={16} />
            Add subscription
          </button>
        }
      />
      <section className="kpis two">
        <div className="card hero">
          <span className="label">Monthly commitment</span>
          <strong>{money(total)}</strong>
          <small>{active.length} active subscriptions</small>
        </div>
        <div className="card">
          <span className="label">Yearly projection</span>
          <strong>{money(total * 12)}</strong>
          <small>If nothing changes</small>
        </div>
      </section>
      {show && (
        <form className="card formcard" onSubmit={create}>
          <div className="formgrid">
            <label>
              Service
              <input
                required
                minLength={2}
                value={f.name}
                onChange={(e) => setF({ ...f, name: e.target.value })}
              />
            </label>
            <label>
              Amount (₹)
              <input
                required
                type="number"
                min="0.01"
                step="0.01"
                value={f.amount}
                onChange={(e) => setF({ ...f, amount: e.target.value })}
              />
            </label>
            <label>
              Frequency
              <select
                value={f.frequency}
                onChange={(e) => setF({ ...f, frequency: e.target.value })}
              >
                {["weekly", "monthly", "quarterly", "yearly"].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
            <label>
              Next billing
              <input
                required
                type="date"
                value={f.next_billing_date}
                onChange={(e) =>
                  setF({ ...f, next_billing_date: e.target.value })
                }
              />
            </label>
          </div>
          <button className="btn primary">Save subscription</button>
        </form>
      )}
      {error && <div className="error">{error}</div>}
      <div className="subs">
        {items.map((s) => (
          <div key={s.id} className={"card sub" + (s.active ? "" : " off")}>
            <div className="row">
              <span className="avatar">{s.name[0].toUpperCase()}</span>
              <span className={"pill " + (s.active ? "ok" : "")}>
                {s.active ? dueText(s.next_billing_date) : "Paused"}
              </span>
            </div>
            <h3>{s.name}</h3>
            <p className="muted">
              {money(s.amount)} / {s.frequency} · {money(perMonth(s))} per month
            </p>
            <small className="muted">
              Next: {fmtDate(s.next_billing_date)}
            </small>
            <div className="row">
              <button
                className="btn"
                onClick={async () => {
                  await api.patch("/subscriptions/" + s.id, {
                    active: !s.active,
                  });
                  load();
                }}
              >
                {s.active ? "Pause" : "Resume"}
              </button>
              <button
                className="icon danger"
                aria-label="Delete"
                onClick={async () => {
                  if (confirm(`Delete ${s.name}?`)) {
                    await api.delete("/subscriptions/" + s.id);
                    load();
                  }
                }}
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
        {!items.length && (
          <Empty text="No subscriptions yet — add the recurring services you pay for." />
        )}
      </div>
    </>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null),
    [ready, setReady] = useState(false);
  const [dark, setDark] = useState(() =>
    localStorage.getItem("spendwise_theme")
      ? localStorage.getItem("spendwise_theme") === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches,
  );
  const navigate = useNavigate();
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    localStorage.setItem("spendwise_theme", dark ? "dark" : "light");
  }, [dark]);
  useEffect(() => {
    if (!localStorage.getItem("spendwise_token")) {
      setReady(true);
      return;
    }
    api
      .get("/auth/me")
      .then((r) => setUser(r.data))
      .catch(() => localStorage.removeItem("spendwise_token"))
      .finally(() => setReady(true));
  }, []);
  if (!ready) return <div className="loading full">Loading…</div>;
  if (!user)
    return (
      <Auth
        onLogin={(u, t) => {
          localStorage.setItem("spendwise_token", t);
          setUser(u);
          navigate("/");
        }}
      />
    );
  return (
    <Shell
      user={user}
      dark={dark}
      toggleTheme={() => setDark(!dark)}
      onLogout={() => {
        localStorage.removeItem("spendwise_token");
        setUser(null);
        navigate("/");
      }}
    >
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/subscriptions" element={<Subscriptions />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Shell>
  );
}
