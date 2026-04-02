import { useState, useMemo, useRef } from "react";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) =>
  n === "" || n === undefined || n === null || isNaN(n)
    ? "—"
    : "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const fmtRaw = (n) => (isNaN(n) || n === 0 ? "—" : `$${Number(n).toLocaleString()}`);
const num = (v) => (v === "" || v === undefined ? 0 : parseFloat(v) || 0);

// ─── Sub-components ───────────────────────────────────────────────────────────
const Field = ({ label, value, onChange, prefix = "$", suffix = "", hint, color = "#4a90b8" }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#8a9bb0", textTransform: "uppercase", marginBottom: 5 }}>
      {label}
    </label>
    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
      {prefix && <span style={{ position: "absolute", left: 12, color, fontWeight: 700, fontSize: 14, pointerEvents: "none" }}>{prefix}</span>}
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0"
        style={{
          width: "100%",
          padding: prefix ? "10px 10px 10px 26px" : "10px 12px",
          paddingRight: suffix ? 36 : 10,
          background: "rgba(255,255,255,0.04)",
          border: `1px solid ${color}33`,
          borderRadius: 8,
          color: "#e8f0f7",
          fontSize: 14,
          fontFamily: "'DM Mono', monospace",
          outline: "none",
          boxSizing: "border-box",
          transition: "border-color 0.2s",
        }}
        onFocus={(e) => (e.target.style.borderColor = color)}
        onBlur={(e) => (e.target.style.borderColor = `${color}33`)}
      />
      {suffix && <span style={{ position: "absolute", right: 12, color, fontSize: 12 }}>{suffix}</span>}
    </div>
    {hint && <p style={{ margin: "4px 0 0", fontSize: 11, color: "#5a7a94", fontStyle: "italic" }}>{hint}</p>}
  </div>
);

const Section = ({ title, children, color }) => (
  <div style={{ marginBottom: 22 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${color}33` }}>
      <div style={{ width: 3, height: 14, background: color, borderRadius: 2 }} />
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color }}>{title}</span>
    </div>
    {children}
  </div>
);

const RRow = ({ label, value, highlight, sub, color }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
    <span style={{ fontSize: sub ? 11 : 13, color: sub ? "#5a7a94" : "#a8bdd0", paddingLeft: sub ? 10 : 0 }}>{label}</span>
    <span style={{ fontSize: sub ? 12 : 14, fontFamily: "'DM Mono', monospace", fontWeight: highlight ? 700 : 400, color: highlight ? (color || "#e8f0f7") : "#7aa8c8" }}>{value}</span>
  </div>
);

// ─── Main Component ────────────────────────────────────────────────────────────
export default function HomeComparison() {
  const colNew = "#4a90b8";
  const colExist = "#e8944a";

  // ── State ──
  const [nc, setNc] = useState({ purchasePrice: "", downPct: "", interestRate: "", loanTerm: 30, builderClosingCostCredit: "", builderRateBuydown: "", upgradesBase: "", changeOrders: "", earlyStartDeposit: "", depositRefundable: "no", estimatedPropTax: "", propTaxUncertaintyBuffer: "", hoaMonthly: "", closingCostsPct: "2.5", timelineMonths: "", currentRentOrMortgage: "", moveInCosts: "", warrantyValue: "" });
  const [ec, setEc] = useState({ purchasePrice: "", downPct: "", interestRate: "", loanTerm: 30, sellerClosingCostCredit: "", sellerRateBuydown: "", knownPropTax: "", hoaMonthly: "", closingCostsPct: "2.5", repairBuffer: "", inspectionCosts: "", moveInCosts: "" });

  const upNc = (k) => (v) => setNc((p) => ({ ...p, [k]: v }));
  const upEc = (k) => (v) => setEc((p) => ({ ...p, [k]: v }));

  // ── Email lead state ──
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [email, setEmail] = useState({ name: "", emailAddr: "", phone: "", loanScenario: "both", message: "" });
  const [emailStatus, setEmailStatus] = useState("idle"); // idle | sending | sent | error

  // ── Tab state ──
  const [activeTab, setActiveTab] = useState("calculator"); // calculator | breakeven | report

  // ── Calculations ──
  const calc = useMemo(() => {
    const ncPrice = num(nc.purchasePrice);
    const ncDown = ncPrice * (num(nc.downPct) / 100);
    const ncLoanAmt = ncPrice - ncDown;
    const ncRate = num(nc.interestRate) / 100 / 12;
    const ncN = num(nc.loanTerm) * 12;
    const ncPI = ncRate > 0 && ncN > 0 ? ncLoanAmt * (ncRate * Math.pow(1 + ncRate, ncN)) / (Math.pow(1 + ncRate, ncN) - 1) : 0;
    const ncBuilderCredits = num(nc.builderClosingCostCredit) + num(nc.builderRateBuydown);
    const ncUpgrades = num(nc.upgradesBase) + num(nc.changeOrders);
    const ncEarlyStart = nc.depositRefundable === "yes" ? 0 : num(nc.earlyStartDeposit);
    const ncClosingCosts = ncPrice * (num(nc.closingCostsPct) / 100) - ncBuilderCredits;
    const ncCarryingCost = num(nc.timelineMonths) * num(nc.currentRentOrMortgage);
    const ncPropTaxMonthly = (num(nc.estimatedPropTax) + num(nc.propTaxUncertaintyBuffer)) / 12;
    const ncHOA = num(nc.hoaMonthly);
    const ncMoveIn = num(nc.moveInCosts);
    const ncTotalUpfront = ncDown + Math.max(0, ncClosingCosts) + ncEarlyStart + ncUpgrades + ncCarryingCost + ncMoveIn;
    const ncMonthlyPITI = ncPI + ncPropTaxMonthly + ncHOA;

    const ecPrice = num(ec.purchasePrice);
    const ecDown = ecPrice * (num(ec.downPct) / 100);
    const ecLoanAmt = ecPrice - ecDown;
    const ecRate = num(ec.interestRate) / 100 / 12;
    const ecN = num(ec.loanTerm) * 12;
    const ecPI = ecRate > 0 && ecN > 0 ? ecLoanAmt * (ecRate * Math.pow(1 + ecRate, ecN)) / (Math.pow(1 + ecRate, ecN) - 1) : 0;
    const ecCredits = num(ec.sellerClosingCostCredit) + num(ec.sellerRateBuydown);
    const ecClosingCosts = ecPrice * (num(ec.closingCostsPct) / 100) - ecCredits;
    const ecPropTaxMonthly = num(ec.knownPropTax) / 12;
    const ecHOA = num(ec.hoaMonthly);
    const ecRepairs = num(ec.repairBuffer);
    const ecInspection = num(ec.inspectionCosts);
    const ecMoveIn = num(ec.moveInCosts);
    const ecTotalUpfront = ecDown + Math.max(0, ecClosingCosts) + ecRepairs + ecInspection + ecMoveIn;
    const ecMonthlyPITI = ecPI + ecPropTaxMonthly + ecHOA;

    const upfrontDiff = ncTotalUpfront - ecTotalUpfront;
    const monthlyDiff = ncMonthlyPITI - ecMonthlyPITI;

    // Break-even: months for lower monthly to recoup higher upfront
    let breakEvenMonths = null;
    if (upfrontDiff > 0 && monthlyDiff < 0) {
      breakEvenMonths = Math.ceil(upfrontDiff / Math.abs(monthlyDiff));
    } else if (upfrontDiff < 0 && monthlyDiff > 0) {
      breakEvenMonths = Math.ceil(Math.abs(upfrontDiff) / monthlyDiff);
    }

    // Score
    let ncScore = 0, ecScore = 0;
    if (upfrontDiff > 0) ecScore += 2; else if (upfrontDiff < 0) ncScore += 2;
    if (monthlyDiff > 0) ecScore += 3; else if (monthlyDiff < 0) ncScore += 3;
    if (ncBuilderCredits > ecCredits) ncScore += 1; else if (ecCredits > ncBuilderCredits) ecScore += 1;
    if (num(nc.warrantyValue) > 0) ncScore += 1;
    if (num(nc.propTaxUncertaintyBuffer) > 0) ecScore += 1;
    if (num(nc.timelineMonths) > 0) ecScore += 1;
    const winner = ncScore > ecScore ? "new" : ecScore > ncScore ? "existing" : "tie";

    // 5-year cumulative cost
    const nc5yr = ncTotalUpfront + ncMonthlyPITI * 60;
    const ec5yr = ecTotalUpfront + ecMonthlyPITI * 60;

    return {
      ncDown, ncLoanAmt, ncPI, ncClosingCosts, ncCarryingCost, ncUpgrades, ncEarlyStart,
      ncPropTaxMonthly, ncHOA, ncBuilderCredits, ncTotalUpfront, ncMonthlyPITI, ncMoveIn,
      ecDown, ecLoanAmt, ecPI, ecClosingCosts, ecRepairs, ecInspection,
      ecPropTaxMonthly, ecHOA, ecCredits, ecTotalUpfront, ecMonthlyPITI, ecMoveIn,
      upfrontDiff, monthlyDiff, ncScore, ecScore, winner, breakEvenMonths, nc5yr, ec5yr,
      ncPrice, ecPrice,
    };
  }, [nc, ec]);

  const winnerBanner = calc.winner === "new"
    ? { label: "New Construction Has the Edge", color: colNew, sub: "Based on total cost analysis across all inputs" }
    : calc.winner === "existing"
    ? { label: "Existing Home Has the Edge", color: colExist, sub: "Based on total cost analysis across all inputs" }
    : { label: "It's a Toss-Up — Review Details Carefully", color: "#7a9a5a", sub: "Both options are closely matched" };

  // ── PDF Export via Claude API ──
  const handlePDFExport = async () => {
    const reportData = {
      newConstruction: {
        purchasePrice: fmt(calc.ncPrice),
        downPayment: fmt(calc.ncDown),
        loanAmount: fmt(calc.ncLoanAmt),
        principalInterest: fmt(calc.ncPI),
        builderCredits: fmt(calc.ncBuilderCredits),
        upgrades: fmt(calc.ncUpgrades),
        atRiskDeposit: fmt(calc.ncEarlyStart),
        carryingCosts: fmt(calc.ncCarryingCost),
        closingCosts: fmt(Math.max(0, calc.ncClosingCosts)),
        propTaxMonthly: fmt(calc.ncPropTaxMonthly),
        hoa: fmt(calc.ncHOA),
        totalUpfront: fmt(calc.ncTotalUpfront),
        monthlyPITI: fmt(calc.ncMonthlyPITI),
        fiveYearCost: fmt(calc.nc5yr),
      },
      existingHome: {
        purchasePrice: fmt(calc.ecPrice),
        downPayment: fmt(calc.ecDown),
        loanAmount: fmt(calc.ecLoanAmt),
        principalInterest: fmt(calc.ecPI),
        sellerCredits: fmt(calc.ecCredits),
        repairs: fmt(calc.ecRepairs),
        inspection: fmt(calc.ecInspection),
        closingCosts: fmt(Math.max(0, calc.ecClosingCosts)),
        propTaxMonthly: fmt(calc.ecPropTaxMonthly),
        hoa: fmt(calc.ecHOA),
        totalUpfront: fmt(calc.ecTotalUpfront),
        monthlyPITI: fmt(calc.ecMonthlyPITI),
        fiveYearCost: fmt(calc.ec5yr),
      },
      analysis: {
        winner: winnerBanner.label,
        upfrontDiff: calc.upfrontDiff > 0 ? `New construction costs ${fmt(Math.abs(calc.upfrontDiff))} more upfront` : calc.upfrontDiff < 0 ? `New construction saves ${fmt(Math.abs(calc.upfrontDiff))} upfront` : "Equal upfront costs",
        monthlyDiff: calc.monthlyDiff > 0 ? `New construction costs ${fmt(Math.abs(calc.monthlyDiff))}/mo more` : calc.monthlyDiff < 0 ? `New construction saves ${fmt(Math.abs(calc.monthlyDiff))}/mo` : "Equal monthly payments",
        breakEven: calc.breakEvenMonths ? `Break-even at month ${calc.breakEvenMonths} (${(calc.breakEvenMonths / 12).toFixed(1)} years)` : "No break-even crossover",
        fiveYearDiff: fmt(Math.abs(calc.nc5yr - calc.ec5yr)),
        fiveYearWinner: calc.nc5yr < calc.ec5yr ? "New construction" : "Existing home",
      }
    };

    const prompt = `You are a mortgage report generator. Generate a clean, professional HTML report for a home purchase comparison. Use inline styles only. 

Data:
${JSON.stringify(reportData, null, 2)}

Generate a complete HTML document (not just a snippet) with:
1. A professional header with "HOME PURCHASE COMPARISON REPORT" title and "Cardinal Financial | Derek Huit, VP | NMLS #203980 | loanak.com" branding
2. Today's date
3. A colored winner banner showing: "${reportData.analysis.winner}"
4. Two side-by-side tables (NEW CONSTRUCTION in blue #4a90b8 | EXISTING HOME in orange #e8944a) with all cost line items
5. An Analysis Summary section with upfront difference, monthly difference, break-even, and 5-year total cost comparison
6. Key Risk Factors section (new construction: property tax uncertainty, change order risk, carrying costs; existing: repair risk, known stable taxes)
7. A footer: "This analysis is for informational purposes only. Contact Derek Huit at loanak.com for personalized mortgage guidance."
Use dark background #0f1e2e, light text, professional styling. Make it print-ready.`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }]
        })
      });
      const data = await response.json();
      const html = data.content?.find(b => b.type === "text")?.text || "";
      const clean = html.replace(/```html|```/g, "").trim();

      // Open in new window for print
      const win = window.open("", "_blank");
      win.document.write(clean);
      win.document.close();
      setTimeout(() => win.print(), 800);
    } catch (err) {
      alert("PDF export failed. Please try again.");
    }
  };

  // ── Email Lead Submit ──
  const handleEmailSubmit = async () => {
    if (!email.emailAddr || !email.name) return;
    setEmailStatus("sending");

    const body = `
New lead from Home Comparison Tool:
Name: ${email.name}
Email: ${email.emailAddr}
Phone: ${email.phone}
Scenario Interest: ${email.loanScenario}
Message: ${email.message}

--- COMPARISON SUMMARY ---
Winner: ${winnerBanner.label}
New Construction Upfront: ${fmt(calc.ncTotalUpfront)} | Monthly: ${fmt(calc.ncMonthlyPITI)}
Existing Home Upfront: ${fmt(calc.ecTotalUpfront)} | Monthly: ${fmt(calc.ecMonthlyPITI)}
Break-Even: ${calc.breakEvenMonths ? `${calc.breakEvenMonths} months` : "N/A"}
    `.trim();

    try {
      // Claude API to format a professional follow-up email
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `You are Derek Huit, VP at Cardinal Financial (NMLS #203980), a top mortgage professional in Alaska. 
Write a warm, professional follow-up email to ${email.name} who just used your home comparison calculator. 
Their email: ${email.emailAddr}. They are interested in: ${email.loanScenario}. Their message: "${email.message || "No message provided"}".
Their comparison showed: ${winnerBanner.label}. New construction upfront: ${fmt(calc.ncTotalUpfront)}, monthly: ${fmt(calc.ncMonthlyPITI)}. Existing home upfront: ${fmt(calc.ecTotalUpfront)}, monthly: ${fmt(calc.ecMonthlyPITI)}.
Write just the email body (no subject line). Keep it under 150 words. End with: "Apply now at loanak.com | Derek Huit | Cardinal Financial | NMLS #203980"`
          }]
        })
      });
      const data = await response.json();
      const emailBody = data.content?.find(b => b.type === "text")?.text || "";

      // Show the generated follow-up (in a real deploy, this posts to a webhook/email API)
      setEmailStatus("sent");
      setTimeout(() => {
        setShowEmailModal(false);
        setEmailStatus("idle");
      }, 3000);
    } catch {
      setEmailStatus("error");
    }
  };

  // ── Break-even chart data ──
  const breakEvenData = useMemo(() => {
    if (!calc.breakEvenMonths) return [];
    const months = Math.min(calc.breakEvenMonths * 2, 120);
    const points = [];
    for (let m = 0; m <= months; m += 3) {
      points.push({
        month: m,
        nc: calc.ncTotalUpfront + calc.ncMonthlyPITI * m,
        ec: calc.ecTotalUpfront + calc.ecMonthlyPITI * m,
      });
    }
    return points;
  }, [calc]);

  // ── Render ──
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(150deg, #080f18 0%, #0f1e2e 60%, #080f18 100%)", fontFamily: "'DM Sans', 'Segoe UI', sans-serif", color: "#e8f0f7", padding: "24px 16px 80px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;800&display=swap');
        * { box-sizing: border-box; }
        input[type=number]::-webkit-outer-spin-button, input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
        select { appearance: none; cursor: pointer; }
        .tab-btn { cursor: pointer; padding: 10px 22px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); font-size: 13px; font-weight: 700; letter-spacing: 0.05em; transition: all 0.2s; background: transparent; color: #6a8aa8; }
        .tab-btn.active { background: rgba(74,144,184,0.15); border-color: #4a90b8; color: #e8f0f7; }
        .action-btn { cursor: pointer; padding: 12px 22px; border-radius: 10px; border: none; font-size: 13px; font-weight: 700; letter-spacing: 0.06em; transition: all 0.2s; display: flex; align-items: center; gap: 8px; }
        .action-btn:hover { transform: translateY(-1px); filter: brightness(1.1); }
        input[type=text], input[type=email], input[type=tel], textarea, select { font-family: 'DM Sans', sans-serif; }
        @media (max-width: 768px) {
          .two-col { grid-template-columns: 1fr !important; }
          .result-grid { grid-template-columns: 1fr !important; }
          .delta-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ── Header ── */}
      <div style={{ maxWidth: 1260, margin: "0 auto 28px", textAlign: "center" }}>
        <p style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: colNew, marginBottom: 8, fontWeight: 700 }}>Cardinal Financial · Derek Huit, VP · NMLS #203980</p>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(24px, 4vw, 44px)", fontWeight: 800, margin: "0 0 10px", background: `linear-gradient(135deg, ${colNew}, #a8d4f0 50%, ${colExist})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          New Construction vs. Existing Home
        </h1>
        <p style={{ color: "#6a8aa8", fontSize: 14, margin: "0 0 20px" }}>Enter both scenarios — see the full picture before you decide.</p>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          {[["calculator", "📊 Calculator"], ["breakeven", "📈 Break-Even"], ["report", "📋 Report & Export"]].map(([id, label]) => (
            <button key={id} className={`tab-btn ${activeTab === id ? "active" : ""}`} onClick={() => setActiveTab(id)}>{label}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1260, margin: "0 auto" }}>

        {/* ══ CALCULATOR TAB ══ */}
        {activeTab === "calculator" && (
          <>
            <div className="two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {/* NEW CONSTRUCTION */}
              <div style={{ background: "rgba(74,144,184,0.06)", border: `1px solid ${colNew}33`, borderRadius: 16, padding: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: colNew, boxShadow: `0 0 12px ${colNew}` }} />
                  <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: colNew, fontFamily: "'Playfair Display', serif" }}>New Construction</h2>
                </div>

                <Section title="Purchase & Financing" color={colNew}>
                  <Field label="Builder Purchase Price" value={nc.purchasePrice} onChange={upNc("purchasePrice")} color={colNew} />
                  <Field label="Down Payment %" value={nc.downPct} onChange={upNc("downPct")} prefix="%" hint={nc.purchasePrice && nc.downPct ? `= ${fmt(num(nc.purchasePrice) * num(nc.downPct) / 100)}` : ""} color={colNew} />
                  <Field label="Interest Rate %" value={nc.interestRate} onChange={upNc("interestRate")} prefix="%" color={colNew} />
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#8a9bb0", textTransform: "uppercase", marginBottom: 5 }}>Loan Term</label>
                    <select value={nc.loanTerm} onChange={(e) => upNc("loanTerm")(e.target.value)} style={{ width: "100%", padding: "10px 12px", background: "rgba(255,255,255,0.04)", border: `1px solid ${colNew}33`, borderRadius: 8, color: "#e8f0f7", fontSize: 14, fontFamily: "'DM Mono', monospace" }}>
                      <option value={30}>30-Year Fixed</option><option value={20}>20-Year Fixed</option><option value={15}>15-Year Fixed</option>
                    </select>
                  </div>
                  <Field label="Closing Costs %" value={nc.closingCostsPct} onChange={upNc("closingCostsPct")} prefix="%" hint="Typically 2–3%" color={colNew} />
                </Section>

                <Section title="Builder Incentives" color={colNew}>
                  <Field label="Builder Closing Cost Credit" value={nc.builderClosingCostCredit} onChange={upNc("builderClosingCostCredit")} hint="Seller-paid closing costs" color={colNew} />
                  <Field label="Builder Rate Buydown Credit" value={nc.builderRateBuydown} onChange={upNc("builderRateBuydown")} hint="2-1 buydown, perm buydown, etc." color={colNew} />
                </Section>

                <Section title="Upgrades & Change Orders" color={colNew}>
                  <Field label="Base Upgrades / Design Center" value={nc.upgradesBase} onChange={upNc("upgradesBase")} hint="Flooring, counters, appliances, etc." color={colNew} />
                  <Field label="Estimated Change Orders" value={nc.changeOrders} onChange={upNc("changeOrders")} hint="Budget 5–10% of upgrades for overruns" color={colNew} />
                </Section>

                <Section title="Early Start / Deposit" color={colNew}>
                  <Field label="Deposit / Earnest Money" value={nc.earlyStartDeposit} onChange={upNc("earlyStartDeposit")} color={colNew} />
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#8a9bb0", textTransform: "uppercase", marginBottom: 5 }}>Is Deposit Refundable?</label>
                    <div style={{ display: "flex", gap: 10 }}>
                      {["yes", "no"].map(v => (
                        <button key={v} onClick={() => upNc("depositRefundable")(v)} style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: "1px solid", borderColor: nc.depositRefundable === v ? colNew : `${colNew}33`, background: nc.depositRefundable === v ? `${colNew}22` : "transparent", color: nc.depositRefundable === v ? colNew : "#6a8aa8", fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}>
                          {v === "yes" ? "✓ Refundable" : "✗ At-Risk"}
                        </button>
                      ))}
                    </div>
                  </div>
                </Section>

                <Section title="Property Taxes" color={colNew}>
                  <Field label="Estimated Annual Tax" value={nc.estimatedPropTax} onChange={upNc("estimatedPropTax")} hint="Builder estimate or county mil rate" color={colNew} />
                  <Field label="Uncertainty Buffer (Annual)" value={nc.propTaxUncertaintyBuffer} onChange={upNc("propTaxUncertaintyBuffer")} hint="⚠ New builds often reassessed higher — add $1K–$3K+" color={colNew} />
                </Section>

                <Section title="Timeline & Carrying Costs" color={colNew}>
                  <Field label="Months Until Move-In" value={nc.timelineMonths} onChange={upNc("timelineMonths")} prefix="" suffix="mo" hint="You're still paying rent/mortgage during construction" color={colNew} />
                  <Field label="Current Housing Cost / mo" value={nc.currentRentOrMortgage} onChange={upNc("currentRentOrMortgage")} hint="Rent, mortgage, storage — all carrying costs" color={colNew} />
                </Section>

                <Section title="Other" color={colNew}>
                  <Field label="HOA (Monthly)" value={nc.hoaMonthly} onChange={upNc("hoaMonthly")} color={colNew} />
                  <Field label="Move-In / Misc Costs" value={nc.moveInCosts} onChange={upNc("moveInCosts")} hint="Moving, blinds, landscaping, etc." color={colNew} />
                  <Field label="Builder Warranty Est. Value" value={nc.warrantyValue} onChange={upNc("warrantyValue")} hint="Offsets future repair risk vs. existing home" color={colNew} />
                </Section>
              </div>

              {/* EXISTING HOME */}
              <div style={{ background: "rgba(232,148,74,0.06)", border: `1px solid ${colExist}33`, borderRadius: 16, padding: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: colExist, boxShadow: `0 0 12px ${colExist}` }} />
                  <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: colExist, fontFamily: "'Playfair Display', serif" }}>Existing Home</h2>
                </div>

                <Section title="Purchase & Financing" color={colExist}>
                  <Field label="Purchase Price" value={ec.purchasePrice} onChange={upEc("purchasePrice")} color={colExist} />
                  <Field label="Down Payment %" value={ec.downPct} onChange={upEc("downPct")} prefix="%" hint={ec.purchasePrice && ec.downPct ? `= ${fmt(num(ec.purchasePrice) * num(ec.downPct) / 100)}` : ""} color={colExist} />
                  <Field label="Interest Rate %" value={ec.interestRate} onChange={upEc("interestRate")} prefix="%" color={colExist} />
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#8a9bb0", textTransform: "uppercase", marginBottom: 5 }}>Loan Term</label>
                    <select value={ec.loanTerm} onChange={(e) => upEc("loanTerm")(e.target.value)} style={{ width: "100%", padding: "10px 12px", background: "rgba(255,255,255,0.04)", border: `1px solid ${colExist}33`, borderRadius: 8, color: "#e8f0f7", fontSize: 14, fontFamily: "'DM Mono', monospace" }}>
                      <option value={30}>30-Year Fixed</option><option value={20}>20-Year Fixed</option><option value={15}>15-Year Fixed</option>
                    </select>
                  </div>
                  <Field label="Closing Costs %" value={ec.closingCostsPct} onChange={upEc("closingCostsPct")} prefix="%" hint="Typically 2–3%" color={colExist} />
                </Section>

                <Section title="Seller Incentives" color={colExist}>
                  <Field label="Seller Closing Cost Credit" value={ec.sellerClosingCostCredit} onChange={upEc("sellerClosingCostCredit")} hint="Negotiated concession" color={colExist} />
                  <Field label="Seller Rate Buydown Credit" value={ec.sellerRateBuydown} onChange={upEc("sellerRateBuydown")} hint="Temporary or permanent buydown" color={colExist} />
                </Section>

                <Section title="Property Taxes (Known)" color={colExist}>
                  <Field label="Current Annual Property Tax" value={ec.knownPropTax} onChange={upEc("knownPropTax")} hint="✓ From county records — no guessing required" color={colExist} />
                </Section>

                <Section title="Inspection & Repairs" color={colExist}>
                  <Field label="Inspection Costs" value={ec.inspectionCosts} onChange={upEc("inspectionCosts")} hint="General + sewer scope + radon, etc." color={colExist} />
                  <Field label="Deferred Maintenance Buffer" value={ec.repairBuffer} onChange={upEc("repairBuffer")} hint="Roof, HVAC, water heater age? Budget conservatively." color={colExist} />
                </Section>

                <Section title="Other" color={colExist}>
                  <Field label="HOA (Monthly)" value={ec.hoaMonthly} onChange={upEc("hoaMonthly")} color={colExist} />
                  <Field label="Move-In / Misc Costs" value={ec.moveInCosts} onChange={upEc("moveInCosts")} hint="Moving, paint, updates, etc." color={colExist} />
                </Section>

                <div style={{ background: `${colExist}0d`, border: `1px solid ${colExist}33`, borderRadius: 12, padding: 16, marginTop: 8 }}>
                  <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: colExist }}>Existing Home Advantages</p>
                  {["✓ Known property tax — zero reassessment risk", "✓ Immediate occupancy — no carrying costs", "✓ Established neighborhood comps & history", "✓ No change order or upgrade creep risk", "✓ Seller credits may offset closing costs"].map((t, i) => (
                    <p key={i} style={{ margin: "4px 0", fontSize: 12, color: "#a8bdd0" }}>{t}</p>
                  ))}
                </div>
              </div>
            </div>

            {/* Winner Banner */}
            <div style={{ background: `${winnerBanner.color}12`, border: `2px solid ${winnerBanner.color}55`, borderRadius: 14, padding: "20px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, margin: "24px 0" }}>
              <div>
                <p style={{ margin: "0 0 3px", fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: winnerBanner.color, fontWeight: 700 }}>Analysis Result</p>
                <p style={{ margin: 0, fontSize: 22, fontWeight: 700, fontFamily: "'Playfair Display', serif", color: "#e8f0f7" }}>{winnerBanner.label}</p>
                <p style={{ margin: "4px 0 0", fontSize: 12, color: "#6a8aa8" }}>{winnerBanner.sub}</p>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                {[["NEW", colNew, calc.ncScore], ["EXISTING", colExist, calc.ecScore]].map(([label, c, score]) => (
                  <div key={label} style={{ textAlign: "center", padding: "12px 20px", background: `${c}22`, borderRadius: 10, border: `1px solid ${c}44` }}>
                    <p style={{ margin: 0, fontSize: 10, color: c, fontWeight: 700, letterSpacing: "0.1em" }}>{label}</p>
                    <p style={{ margin: "4px 0 0", fontSize: 28, fontWeight: 700, fontFamily: "'DM Mono', monospace", color: calc.winner === (label === "NEW" ? "new" : "existing") ? c : "#e8f0f7" }}>{score}</p>
                    <p style={{ margin: 0, fontSize: 10, color: "#5a7a94" }}>score</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Results Side by Side */}
            <div className="result-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
              {[
                { label: "New Construction — Cost Summary", color: colNew, data: [
                  ["Down Payment", fmt(calc.ncDown)], ["Closing Costs (net)", fmt(Math.max(0, calc.ncClosingCosts))],
                  ["Builder Credits Applied", `− ${fmt(calc.ncBuilderCredits)}`, true],
                  ["Upgrades + Change Orders", fmt(calc.ncUpgrades)], ["At-Risk Deposit", fmt(calc.ncEarlyStart)],
                  ["Carrying Costs (timeline)", fmt(calc.ncCarryingCost)], ["Move-In / Misc", fmt(calc.ncMoveIn)],
                ], monthly: [
                  ["Principal & Interest", fmt(calc.ncPI)], ["Prop Tax (w/ buffer) / mo", fmt(calc.ncPropTaxMonthly)], ["HOA / mo", fmt(calc.ncHOA)],
                ], upfront: calc.ncTotalUpfront, monthly: calc.ncMonthlyPITI, fiveYr: calc.nc5yr },
                { label: "Existing Home — Cost Summary", color: colExist, data: [
                  ["Down Payment", fmt(calc.ecDown)], ["Closing Costs (net)", fmt(Math.max(0, calc.ecClosingCosts))],
                  ["Seller Credits Applied", `− ${fmt(calc.ecCredits)}`, true],
                  ["Inspection Costs", fmt(calc.ecInspection)], ["Repair/Maintenance Buffer", fmt(calc.ecRepairs)],
                  ["Carrying Costs", "$0"], ["Move-In / Misc", fmt(calc.ecMoveIn)],
                ], monthly: [
                  ["Principal & Interest", fmt(calc.ecPI)], ["Property Tax (known) / mo", fmt(calc.ecPropTaxMonthly)], ["HOA / mo", fmt(calc.ecHOA)],
                ], upfront: calc.ecTotalUpfront, monthly: calc.ecMonthlyPITI, fiveYr: calc.ec5yr },
              ].map((side) => (
                <div key={side.label} style={{ background: `${side.color}08`, border: `1px solid ${side.color}33`, borderRadius: 14, padding: 20 }}>
                  <p style={{ margin: "0 0 14px", fontSize: 12, fontWeight: 700, color: side.color, letterSpacing: "0.08em", textTransform: "uppercase" }}>{side.label}</p>
                  {side.data.map(([l, v, sub]) => <RRow key={l} label={l} value={v} sub={sub} />)}
                  <div style={{ borderTop: `1px solid ${side.color}44`, margin: "10px 0 6px", paddingTop: 8 }}>
                    <RRow label="TOTAL UPFRONT CASH" value={fmt(side.upfront)} highlight color={side.color} />
                  </div>
                  <p style={{ margin: "14px 0 8px", fontSize: 11, fontWeight: 700, color: side.color, letterSpacing: "0.08em", textTransform: "uppercase" }}>Monthly Payment</p>
                  {side.monthly.map(([l, v]) => <RRow key={l} label={l} value={v} />)}
                  <div style={{ borderTop: `1px solid ${side.color}44`, margin: "8px 0 0", paddingTop: 8 }}>
                    <RRow label="TOTAL MONTHLY (PITI)" value={fmt(side.monthly)} highlight color={side.color} />
                  </div>
                  <div style={{ marginTop: 14, padding: 12, background: `${side.color}11`, borderRadius: 8 }}>
                    <p style={{ margin: 0, fontSize: 11, color: "#6a8aa8" }}>5-Year Total Cost</p>
                    <p style={{ margin: "4px 0 0", fontSize: 18, fontWeight: 700, fontFamily: "'DM Mono', monospace", color: side.color }}>{fmt(side.fiveYr)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Delta Cards */}
            <div className="delta-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
              {[
                { label: "Upfront Difference", value: calc.upfrontDiff === 0 ? "Equal" : `${calc.upfrontDiff > 0 ? "+" : ""}${fmt(calc.upfrontDiff)}`, sub: calc.upfrontDiff > 0 ? "New costs more upfront" : calc.upfrontDiff < 0 ? "New costs less upfront" : "Equal upfront", color: calc.upfrontDiff > 0 ? colExist : colNew },
                { label: "Monthly Difference", value: calc.monthlyDiff === 0 ? "Equal" : `${calc.monthlyDiff > 0 ? "+" : ""}${fmt(calc.monthlyDiff)}/mo`, sub: calc.monthlyDiff > 0 ? "New costs more monthly" : calc.monthlyDiff < 0 ? "New costs less monthly" : "Equal payments", color: calc.monthlyDiff > 0 ? colExist : colNew },
                { label: "5-Year Cost Gap", value: fmt(Math.abs(calc.nc5yr - calc.ec5yr)), sub: `${calc.nc5yr < calc.ec5yr ? "New construction" : "Existing home"} saves more over 5 yrs`, color: calc.nc5yr < calc.ec5yr ? colNew : colExist },
              ].map(({ label, value, sub, color }) => (
                <div key={label} style={{ background: `${color}10`, border: `1px solid ${color}44`, borderRadius: 12, padding: 18, textAlign: "center" }}>
                  <p style={{ margin: "0 0 6px", fontSize: 11, color: "#6a8aa8", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</p>
                  <p style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700, fontFamily: "'DM Mono', monospace", color }}>{value}</p>
                  <p style={{ margin: 0, fontSize: 11, color: "#5a7a94" }}>{sub}</p>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
              <button className="action-btn" onClick={handlePDFExport} style={{ background: `linear-gradient(135deg, ${colNew}, #2a6090)`, color: "#fff" }}>
                🖨 Print / Save as PDF
              </button>
              <button className="action-btn" onClick={() => setShowEmailModal(true)} style={{ background: `linear-gradient(135deg, #2a4a2a, #3a7a3a)`, color: "#e8f0f7", border: "1px solid #4a9a4a" }}>
                📧 Email This Comparison
              </button>
              <button className="action-btn" onClick={() => setActiveTab("breakeven")} style={{ background: "rgba(255,255,255,0.06)", color: "#a8bdd0", border: "1px solid rgba(255,255,255,0.12)" }}>
                📈 View Break-Even Chart
              </button>
            </div>
          </>
        )}

        {/* ══ BREAK-EVEN TAB ══ */}
        {activeTab === "breakeven" && (
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 28 }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, margin: "0 0 6px", color: "#e8f0f7" }}>Break-Even Analysis</h2>
            <p style={{ color: "#6a8aa8", fontSize: 14, marginBottom: 28 }}>At what point does the lower monthly payment recoup the higher upfront cost?</p>

            {calc.breakEvenMonths ? (
              <>
                <div style={{ display: "flex", gap: 20, marginBottom: 28, flexWrap: "wrap" }}>
                  {[
                    { label: "Break-Even Point", value: `Month ${calc.breakEvenMonths}`, sub: `${(calc.breakEvenMonths / 12).toFixed(1)} years`, color: "#7a9a5a" },
                    { label: "Higher Upfront Option", value: calc.upfrontDiff > 0 ? "New Construction" : "Existing Home", sub: `+${fmt(Math.abs(calc.upfrontDiff))} more upfront`, color: colNew },
                    { label: "Lower Monthly Option", value: calc.monthlyDiff < 0 ? "New Construction" : "Existing Home", sub: `${fmt(Math.abs(calc.monthlyDiff))}/mo savings`, color: colExist },
                  ].map(({ label, value, sub, color }) => (
                    <div key={label} style={{ flex: 1, minWidth: 160, background: `${color}10`, border: `1px solid ${color}33`, borderRadius: 12, padding: 16, textAlign: "center" }}>
                      <p style={{ margin: "0 0 6px", fontSize: 11, color: "#6a8aa8", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</p>
                      <p style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 700, color }}>{value}</p>
                      <p style={{ margin: 0, fontSize: 11, color: "#5a7a94" }}>{sub}</p>
                    </div>
                  ))}
                </div>

                {/* SVG Chart */}
                {breakEvenData.length > 1 && (() => {
                  const W = 600, H = 280, pad = 60;
                  const allVals = breakEvenData.flatMap(d => [d.nc, d.ec]);
                  const minV = Math.min(...allVals) * 0.97;
                  const maxV = Math.max(...allVals) * 1.03;
                  const maxM = breakEvenData[breakEvenData.length - 1].month;
                  const xS = (m) => pad + ((m / maxM) * (W - pad * 2));
                  const yS = (v) => H - pad - ((v - minV) / (maxV - minV)) * (H - pad * 2);
                  const pathFor = (key) => breakEvenData.map((d, i) => `${i === 0 ? "M" : "L"}${xS(d.month)},${yS(d[key])}`).join(" ");
                  const crossMonth = calc.breakEvenMonths;
                  const crossX = xS(crossMonth);

                  return (
                    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 700, display: "block", margin: "0 auto 20px" }}>
                      {/* Grid */}
                      {[0.25, 0.5, 0.75, 1].map(t => {
                        const y = pad + t * (H - pad * 2);
                        const val = maxV - t * (maxV - minV);
                        return <g key={t}>
                          <line x1={pad} y1={y} x2={W - pad} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                          <text x={pad - 6} y={y + 4} fill="#4a6a84" fontSize="10" textAnchor="end">{`$${(val / 1000).toFixed(0)}k`}</text>
                        </g>;
                      })}
                      {breakEvenData.filter((_, i) => i % 2 === 0).map(d => (
                        <text key={d.month} x={xS(d.month)} y={H - pad + 16} fill="#4a6a84" fontSize="10" textAnchor="middle">{`M${d.month}`}</text>
                      ))}
                      {/* Lines */}
                      <path d={pathFor("nc")} fill="none" stroke={colNew} strokeWidth="2.5" strokeLinecap="round" />
                      <path d={pathFor("ec")} fill="none" stroke={colExist} strokeWidth="2.5" strokeLinecap="round" />
                      {/* Crossover */}
                      <line x1={crossX} y1={pad} x2={crossX} y2={H - pad} stroke="#7a9a5a" strokeWidth="1.5" strokeDasharray="4,3" />
                      <text x={crossX} y={pad - 6} fill="#7a9a5a" fontSize="11" textAnchor="middle" fontWeight="700">Break-Even</text>
                      {/* Legend */}
                      <circle cx={pad} cy={18} r={5} fill={colNew} />
                      <text x={pad + 10} y={22} fill={colNew} fontSize="11">New Construction</text>
                      <circle cx={pad + 140} cy={18} r={5} fill={colExist} />
                      <text x={pad + 150} y={22} fill={colExist} fontSize="11">Existing Home</text>
                    </svg>
                  );
                })()}

                <div style={{ background: "rgba(122,154,90,0.08)", border: "1px solid rgba(122,154,90,0.3)", borderRadius: 10, padding: 16 }}>
                  <p style={{ margin: 0, fontSize: 13, color: "#a8bdd0", lineHeight: 1.6 }}>
                    <strong style={{ color: "#e8f0f7" }}>What this means:</strong> If you plan to stay in this home for more than <strong style={{ color: "#7a9a5a" }}>{(calc.breakEvenMonths / 12).toFixed(1)} years</strong>, the option with the higher upfront cost becomes the better deal due to lower monthly payments. If you move before that point, the other option wins.
                  </p>
                </div>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: 40 }}>
                <p style={{ fontSize: 32, marginBottom: 12 }}>📊</p>
                <p style={{ color: "#6a8aa8", fontSize: 15 }}>
                  {(calc.ncTotalUpfront === 0 && calc.ecTotalUpfront === 0)
                    ? "Enter data in the Calculator tab to generate a break-even analysis."
                    : "No break-even crossover — one option costs more both upfront AND monthly. Check your inputs or see the results tab."}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ══ REPORT TAB ══ */}
        {activeTab === "report" && (
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 28 }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, margin: "0 0 6px", color: "#e8f0f7" }}>Report & Export</h2>
            <p style={{ color: "#6a8aa8", fontSize: 14, marginBottom: 24 }}>Generate a branded, print-ready comparison report for your client.</p>

            {/* Summary Preview */}
            <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 20, marginBottom: 24, fontFamily: "'DM Mono', monospace", fontSize: 12, lineHeight: 1.8 }}>
              <p style={{ color: "#4a90b8", margin: "0 0 8px", fontWeight: 700 }}>── COMPARISON SNAPSHOT ───────────────────────────</p>
              {[
                ["Verdict", winnerBanner.label],
                ["", ""],
                ["NEW CONSTRUCTION", ""],
                ["  Purchase Price", fmt(calc.ncPrice)],
                ["  Total Upfront", fmt(calc.ncTotalUpfront)],
                ["  Monthly PITI", fmt(calc.ncMonthlyPITI)],
                ["  5-Year Total", fmt(calc.nc5yr)],
                ["", ""],
                ["EXISTING HOME", ""],
                ["  Purchase Price", fmt(calc.ecPrice)],
                ["  Total Upfront", fmt(calc.ecTotalUpfront)],
                ["  Monthly PITI", fmt(calc.ecMonthlyPITI)],
                ["  5-Year Total", fmt(calc.ec5yr)],
                ["", ""],
                ["Break-Even", calc.breakEvenMonths ? `Month ${calc.breakEvenMonths} (${(calc.breakEvenMonths / 12).toFixed(1)} yrs)` : "No crossover"],
              ].map(([k, v], i) => k === "" ? <br key={i} style={{ margin: 0 }} /> : (
                <div key={i} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#6a8aa8" }}>{k}</span>
                  <span style={{ color: "#e8f0f7" }}>{v}</span>
                </div>
              ))}
              <p style={{ color: "#4a90b8", margin: "8px 0 0", fontWeight: 700 }}>─────────────────────────────────────────────────</p>
            </div>

            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <button className="action-btn" onClick={handlePDFExport} style={{ background: `linear-gradient(135deg, ${colNew}, #1a5080)`, color: "#fff", fontSize: 14, padding: "14px 28px" }}>
                🖨 Generate & Print PDF Report
              </button>
              <button className="action-btn" onClick={() => setShowEmailModal(true)} style={{ background: "linear-gradient(135deg, #2a4a2a, #3a7a3a)", color: "#e8f0f7", border: "1px solid #4a9a4a", fontSize: 14, padding: "14px 28px" }}>
                📧 Capture Lead & Send Follow-Up
              </button>
            </div>

            <div style={{ marginTop: 20, padding: 16, background: "rgba(74,144,184,0.06)", border: "1px solid rgba(74,144,184,0.2)", borderRadius: 10 }}>
              <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 700, color: colNew, letterSpacing: "0.08em", textTransform: "uppercase" }}>What the PDF includes</p>
              {["Cardinal Financial / Derek Huit branded header", "Full side-by-side cost comparison table", "Upfront, monthly, and 5-year totals", "Winner verdict with scoring rationale", "Risk factors for each option", "Compliance footer — informational use disclaimer"].map((t, i) => (
                <p key={i} style={{ margin: "3px 0", fontSize: 12, color: "#a8bdd0" }}>✓ {t}</p>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ══ EMAIL MODAL ══ */}
      {showEmailModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={(e) => e.target === e.currentTarget && setShowEmailModal(false)}>
          <div style={{ background: "#0f1e2e", border: "1px solid rgba(74,144,184,0.4)", borderRadius: 16, padding: 28, width: "100%", maxWidth: 480, boxShadow: "0 24px 60px rgba(0,0,0,0.6)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontSize: 20, color: "#e8f0f7" }}>Get Your Comparison</h3>
              <button onClick={() => setShowEmailModal(false)} style={{ background: "none", border: "none", color: "#6a8aa8", fontSize: 20, cursor: "pointer" }}>✕</button>
            </div>
            <p style={{ color: "#6a8aa8", fontSize: 13, marginBottom: 20 }}>Enter your info and Derek will send a personalized follow-up with your full comparison.</p>

            {emailStatus === "sent" ? (
              <div style={{ textAlign: "center", padding: 24 }}>
                <p style={{ fontSize: 40, margin: "0 0 12px" }}>✅</p>
                <p style={{ color: "#7a9a5a", fontWeight: 700, fontSize: 16 }}>Got it! Derek will be in touch shortly.</p>
                <p style={{ color: "#5a7a94", fontSize: 13 }}>Check your email for a copy of your comparison.</p>
              </div>
            ) : (
              <>
                {[
                  { label: "Full Name *", key: "name", type: "text", placeholder: "Jane Smith" },
                  { label: "Email Address *", key: "emailAddr", type: "email", placeholder: "jane@example.com" },
                  { label: "Phone (optional)", key: "phone", type: "tel", placeholder: "(907) 555-0100" },
                ].map(({ label, key, type, placeholder }) => (
                  <div key={key} style={{ marginBottom: 14 }}>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#8a9bb0", textTransform: "uppercase", marginBottom: 5 }}>{label}</label>
                    <input type={type} placeholder={placeholder} value={email[key]} onChange={(e) => setEmail(p => ({ ...p, [key]: e.target.value }))}
                      style={{ width: "100%", padding: "10px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(74,144,184,0.2)", borderRadius: 8, color: "#e8f0f7", fontSize: 14, outline: "none" }} />
                  </div>
                ))}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#8a9bb0", textTransform: "uppercase", marginBottom: 5 }}>I'm interested in</label>
                  <select value={email.loanScenario} onChange={(e) => setEmail(p => ({ ...p, loanScenario: e.target.value }))}
                    style={{ width: "100%", padding: "10px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(74,144,184,0.2)", borderRadius: 8, color: "#e8f0f7", fontSize: 14 }}>
                    <option value="both">Comparing both options</option>
                    <option value="new">New construction financing</option>
                    <option value="existing">Existing home financing</option>
                    <option value="preapproval">Getting pre-approved</option>
                  </select>
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#8a9bb0", textTransform: "uppercase", marginBottom: 5 }}>Message (optional)</label>
                  <textarea value={email.message} onChange={(e) => setEmail(p => ({ ...p, message: e.target.value }))} placeholder="Any questions or context for Derek..." rows={3}
                    style={{ width: "100%", padding: "10px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(74,144,184,0.2)", borderRadius: 8, color: "#e8f0f7", fontSize: 14, resize: "vertical", outline: "none" }} />
                </div>
                <button onClick={handleEmailSubmit} disabled={emailStatus === "sending"}
                  style={{ width: "100%", padding: "14px", background: emailStatus === "sending" ? "rgba(74,144,184,0.3)" : `linear-gradient(135deg, ${colNew}, #1a5080)`, border: "none", borderRadius: 10, color: "#fff", fontSize: 15, fontWeight: 700, cursor: emailStatus === "sending" ? "default" : "pointer", transition: "all 0.2s" }}>
                  {emailStatus === "sending" ? "Sending..." : emailStatus === "error" ? "Try Again" : "Send My Comparison →"}
                </button>
                <p style={{ margin: "12px 0 0", fontSize: 11, color: "#3a5a74", textAlign: "center" }}>
                  Cardinal Financial · Derek Huit, VP · NMLS #203980 · loanak.com · AK · WA · MT
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
