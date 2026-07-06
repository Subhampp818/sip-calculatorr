import React, { useState, useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const INK = "#0B2016";
const INK_SOFT = "#123024";
const PAPER = "#F6F1E3";
const PAPER_LINE = "#E4DAC0";
const GOLD = "#C79A2B";
const GOLD_SOFT = "#E4C876";
const GREEN = "#4C8C6B";
const TEXT_DARK = "#1B2B20";
const MUTED = "#7C8B7E";

function formatINR(n) {
  if (!isFinite(n)) return "₹0";
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

function formatCompact(n) {
  if (!isFinite(n)) return "₹0";
  const abs = Math.abs(n);
  if (abs >= 1e7) return "₹" + (n / 1e7).toFixed(2) + " Cr";
  if (abs >= 1e5) return "₹" + (n / 1e5).toFixed(2) + " L";
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

export default function FundCalculator() {
  const [mode, setMode] = useState("sip"); // 'sip' | 'lumpsum'
  const [amount, setAmount] = useState(10000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(10);

  const result = useMemo(() => {
    const n = years * 12;
    const i = rate / 100 / 12;
    let futureValue, invested;

    if (mode === "sip") {
      futureValue = i === 0 ? amount * n : amount * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
      invested = amount * n;
    } else {
      futureValue = amount * Math.pow(1 + rate / 100, years);
      invested = amount;
    }

    const gains = futureValue - invested;

    const chartData = [];
    for (let y = 0; y <= years; y++) {
      const months = y * 12;
      let fv, inv;
      if (mode === "sip") {
        fv = i === 0 ? amount * months : amount * ((Math.pow(1 + i, months) - 1) / i) * (1 + i);
        inv = amount * months;
      } else {
        fv = amount * Math.pow(1 + rate / 100, y);
        inv = amount;
      }
      chartData.push({ year: y, invested: Math.round(inv), value: Math.round(fv) });
    }

    return { futureValue, invested, gains, chartData };
  }, [mode, amount, rate, years]);

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8 font-sans"
      style={{ background: `radial-gradient(circle at 20% 10%, ${INK_SOFT}, ${INK} 60%)` }}
    >
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8 px-1">
          <p
            className="text-xs tracking-[0.3em] uppercase mb-2 font-sans"
            style={{ color: GOLD_SOFT }}
          >
            Ledger &amp; Yield
          </p>
          <h1
            className="text-3xl sm:text-4xl font-serif"
            style={{ color: PAPER }}
          >
            SIP &amp; Mutual Fund Calculator
          </h1>
          <p className="text-sm mt-2" style={{ color: "#9FB3A4" }}>
            Project how a monthly SIP or a one-time lumpsum compounds over time.
          </p>
        </div>

        {/* Passbook card */}
        <div
          className="rounded-lg overflow-hidden shadow-2xl relative"
          style={{ background: PAPER, border: `1px solid ${PAPER_LINE}` }}
        >
          {/* stitched edge */}
          <div
            className="h-3 w-full"
            style={{
              backgroundImage: `repeating-linear-gradient(90deg, ${GOLD} 0 10px, transparent 10px 20px)`,
              opacity: 0.5,
            }}
          />

          <div className="p-5 sm:p-10">
            {/* Mode toggle */}
            <div className="flex gap-2 mb-8">
              {[
                { key: "sip", label: "Monthly SIP" },
                { key: "lumpsum", label: "Lumpsum" },
              ].map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setMode(opt.key)}
                  className="px-4 py-2 rounded-full text-sm font-sans transition-colors"
                  style={
                    mode === opt.key
                      ? { background: INK, color: PAPER }
                      : { background: "transparent", color: TEXT_DARK, border: `1px solid ${PAPER_LINE}` }
                  }
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="grid sm:grid-cols-2 gap-10 sm:gap-16">
              {/* Inputs */}
              <div className="space-y-7">
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <label className="text-xs uppercase tracking-wider font-sans" style={{ color: MUTED }}>
                      {mode === "sip" ? "Monthly investment" : "Lumpsum amount"}
                    </label>
                    <span className="font-serif text-lg" style={{ color: TEXT_DARK }}>
                      {formatINR(amount)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={mode === "sip" ? 500 : 5000}
                    max={mode === "sip" ? 200000 : 10000000}
                    step={mode === "sip" ? 500 : 5000}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full accent-current"
                    style={{ accentColor: GOLD }}
                  />
                </div>

                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <label className="text-xs uppercase tracking-wider font-sans" style={{ color: MUTED }}>
                      Expected annual return
                    </label>
                    <span className="font-serif text-lg" style={{ color: TEXT_DARK }}>
                      {rate}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={30}
                    step={0.5}
                    value={rate}
                    onChange={(e) => setRate(Number(e.target.value))}
                    className="w-full"
                    style={{ accentColor: GOLD }}
                  />
                </div>

                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <label className="text-xs uppercase tracking-wider font-sans" style={{ color: MUTED }}>
                      Time period
                    </label>
                    <span className="font-serif text-lg" style={{ color: TEXT_DARK }}>
                      {years} {years === 1 ? "year" : "years"}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={40}
                    step={1}
                    value={years}
                    onChange={(e) => setYears(Number(e.target.value))}
                    className="w-full"
                    style={{ accentColor: GOLD }}
                  />
                </div>
              </div>

              {/* Results */}
              <div
                className="rounded-md p-6 flex flex-col justify-center"
                style={{ background: INK, color: PAPER }}
              >
                <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "#9FB3A4" }}>
                  Estimated value
                </p>
                <p className="font-serif text-4xl mb-6" style={{ color: GOLD_SOFT }}>
                  {formatCompact(result.futureValue)}
                </p>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b pb-2" style={{ borderColor: "#254536" }}>
                    <span style={{ color: "#9FB3A4" }}>Invested amount</span>
                    <span className="font-serif">{formatCompact(result.invested)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: "#9FB3A4" }}>Est. returns</span>
                    <span className="font-serif" style={{ color: GREEN }}>
                      {formatCompact(result.gains)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="mt-10 sm:mt-12">
              <p className="text-xs uppercase tracking-wider mb-3 font-sans" style={{ color: MUTED }}>
                Growth over time
              </p>
              <div style={{ width: "100%", height: 220 }}>
                <ResponsiveContainer>
                  <AreaChart data={result.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="valueFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={GOLD} stopOpacity={0.45} />
                        <stop offset="100%" stopColor={GOLD} stopOpacity={0.03} />
                      </linearGradient>
                      <linearGradient id="investedFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={GREEN} stopOpacity={0.35} />
                        <stop offset="100%" stopColor={GREEN} stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke={PAPER_LINE} vertical={false} />
                    <XAxis
                      dataKey="year"
                      tickFormatter={(y) => `Y${y}`}
                      stroke={MUTED}
                      tick={{ fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tickFormatter={(v) => formatCompact(v)}
                      stroke={MUTED}
                      tick={{ fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      width={70}
                    />
                    <Tooltip
                      formatter={(v, name) => [formatINR(v), name === "value" ? "Value" : "Invested"]}
                      labelFormatter={(y) => `Year ${y}`}
                      contentStyle={{ background: INK, border: "none", borderRadius: 6, color: PAPER }}
                    />
                    <Area type="monotone" dataKey="value" stroke={GOLD} fill="url(#valueFill)" strokeWidth={2} />
                    <Area
                      type="monotone"
                      dataKey="invested"
                      stroke={GREEN}
                      fill="url(#investedFill)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex gap-6 mt-3 text-xs font-sans" style={{ color: MUTED }}>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: GOLD }} />
                  Total value
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: GREEN }} />
                  Amount invested
                </span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: "#5C6E60" }}>
          Figures are illustrative projections based on a constant assumed rate of return, not guarantees.
        </p>
      </div>
    </div>
  );
}
