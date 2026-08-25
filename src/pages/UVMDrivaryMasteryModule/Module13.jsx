import {
  FaBook,
  FaBug,
  FaFlask,
  FaQuestionCircle,
  FaListAlt,
  FaCheckSquare,
  FaShieldAlt,
} from "react-icons/fa";
import Table from "../../components/common/Table";
import Callout from "../../components/ui/Callout";
import SectionHeading from "../../components/common/SectionHeading";
import ModuleSidebar from "../../components/layout/Sidebar";
import ModuleHero from "../../components/ui/ModuleHero";
import ModuleNavigation from "../../components/ui/ModuleNavigation";
import CodeBlock from "../../components/ui/CodeBlock";
import CollapsibleCard from "../../components/ui/CollapsibleCard";
import BackToHomeBtn from "../../components/common/BackToHomeBtn";

// ─────────────────────────────────────────────────────────────────────────────
// DATA — Memory Cards (18 Cards)
// ─────────────────────────────────────────────────────────────────────────────

const module13MemoryCards = [
  {
    title: "Card 1 — Four Owners, Four Facts [BOUNDARY]",
    accent: "violet",
    hook: "Drive, observe, compare, assert.",
    concept:
      "The driver owns stimulus execution. The monitor owns observed facts. The scoreboard owns correctness comparison. Assertions own temporal signal laws.",
    code: `driver     -> drives valid/data
monitor    -> observes valid && ready
scoreboard -> compares expected vs actual
assertion  -> checks valid/data stability`,
    trap: "Putting logic wherever the signal is easiest to access.",
    interview:
      "I place logic based on ownership of the fact being checked, not based on coding convenience.",
  },
  {
    title: "Card 2 — Driver Is an Executor, Not a Judge [DRIVER]",
    accent: "blue",
    hook: "The driver is the hand, not the court.",
    concept:
      "A driver converts sequence-item intent into legal pin-level stimulus. It does not judge DUT functional correctness.",
    code: `seq_item_port.get_next_item(req);
drive_one(req);
seq_item_port.item_done();`,
    trap: "Checking expected read data inside drive_one().",
    interview:
      "The driver can capture protocol completion, but functional pass/fail belongs outside the driver.",
  },
  {
    title: "Card 3 — Legal Sampling Is Protocol-Required Sampling [DRIVER]",
    accent: "emerald",
    hook: "Sample only what controls legal execution.",
    concept:
      "A driver may sample DUT outputs only if those outputs control handshake, completion, response, credit, grant, retry, or reactive behavior.",
    code: `do @(vif.drv_cb);
while (vif.drv_cb.ready !== 1'b1);`,
    trap: "Sampling output payload only because it is visible in the interface.",
    interview:
      "I allow driver sampling only when the protocol requires it to progress or complete the transfer.",
  },
  {
    title: "Card 4 — Driver-Local Checks Are Legality Guards [DRIVER]",
    accent: "amber",
    hook: "Guard the drive, not the DUT.",
    concept:
      "The driver may reject an illegal sequence item or warn on unsafe interface conditions. It must not compare expected DUT behavior.",
    code: `if (req.nbeats <= 0)
  \`uvm_error("BAD_REQ", "Illegal zero-beat request")`,
    trap: "Calling a data mismatch check a 'sanity check' inside the driver.",
    interview:
      "A driver-local check is acceptable only if it protects legal stimulus execution or driver liveness.",
  },
  {
    title: "Card 5 — Monitor Observes Facts [MONITOR]",
    accent: "cyan",
    hook: "The monitor is the camera.",
    concept:
      "A monitor reconstructs actual transactions from pins. It does not use sequence intent.",
    code: `if (vif.mon_cb.valid && vif.mon_cb.ready)
  ap.write(obs);`,
    trap: "Monitor copies driver.current_req instead of sampling pins.",
    interview:
      "A monitor must be independent of stimulus intent; otherwise the scoreboard compares expected against expected.",
  },
  {
    title: "Card 6 — Scoreboard Owns Verdicts [SCOREBOARD]",
    accent: "rose",
    hook: "The scoreboard is the judge.",
    concept:
      "The scoreboard compares expected and actual streams and reports functional mismatches.",
    code: `if (exp.data !== act.data)
  \`uvm_error("CMP", "Data mismatch")`,
    trap: "Reporting data mismatches from the driver or monitor.",
    interview:
      "Correctness verdicts belong in the scoreboard because it owns both expectation and observation.",
  },
  {
    title: "Card 7 — Assertions Own Temporal Laws [ASSERTION]",
    accent: "purple",
    hook: "Assertions are traffic laws.",
    concept:
      "Assertions check cycle-level protocol invariants such as stable payload, bounded response, no illegal overlap, and reset legality.",
    code: `valid && !ready |=> valid && $stable(data)`,
    trap: "Building a full transaction reference model in SVA.",
    interview:
      "I use assertions for temporal protocol laws and scoreboards for transaction-level correctness.",
  },
  {
    title: "Card 8 — item_done() Releases Ownership [UVM]",
    accent: "blue",
    hook: "Releasing early changes architecture.",
    concept:
      "With get_next_item(), the driver owns the request until item_done().",
    code: `seq_item_port.get_next_item(req);
drive_until_accept(req);
cleanup_pins();
seq_item_port.item_done();`,
    trap: "Calling item_done() before handshake in a non-pipelined driver.",
    interview:
      "In a non-pipelined driver, item_done() follows protocol completion and cleanup decision.",
  },
  {
    title: "Card 9 — Accepted Is Not Always Completed [BOUNDARY]",
    accent: "emerald",
    hook: "Acceptance and completion can split.",
    concept:
      "In pipelined protocols, request acceptance may occur before response completion. That is legal only with explicit outstanding tracking.",
    code: `// Pipelined separation:
request accepted -> item may be released
response later   -> response path must route completion`,
    trap: "Early item_done() with no response tracking.",
    interview:
      "If I release at acceptance, I must prove where response completion is tracked.",
  },
  {
    title: "Card 10 — get() Is Not get_next_item() [UVM]",
    accent: "violet",
    hook: "Different pull contract, different release rule.",
    concept: "get_next_item() requires item_done(). get() does not.",
    code: `seq_item_port.get(req);
// no item_done() here`,
    trap: "Calling item_done() after get().",
    interview: "I never mix sequencer-driver pull contracts.",
  },
  {
    title: "Card 11 — try_next_item() Means Maybe Null [UVM]",
    accent: "amber",
    hook: "Try means no guarantee.",
    concept:
      "try_next_item() may return null and must be checked before use.",
    code: `seq_item_port.try_next_item(req);
if (req == null)
  drive_idle_cycle();
else begin
  drive_one(req);
  seq_item_port.item_done();
end`,
    trap: "Dereferencing req.data before null checking.",
    interview:
      "try_next_item() is useful for opportunistic driving, but null handling is mandatory.",
  },
  {
    title: "Card 12 — Responses Need Identity [RESPONSE]",
    accent: "rose",
    hook: "A response without ID can go nowhere useful.",
    concept:
      "When the originating sequence needs a response, the response object must carry routing identity.",
    code: `rsp = item_t::type_id::create("rsp");
rsp.set_id_info(req);
seq_item_port.put_response(rsp);`,
    trap: "Creating a response without set_id_info(req) in a multi-sequence environment.",
    interview:
      "When response routing matters, I copy request ID information into the response.",
  },
  {
    title: "Card 13 — Reset Must Release Owned Items [RESET]",
    accent: "blue",
    hook: "Reset cannot trap the sequencer.",
    concept:
      "If reset occurs while the driver owns an item, the driver must clean pins and release or respond to the item.",
    code: `if (vif.rst_n !== 1'b1) begin
  cleanup_pins();
  seq_item_port.item_done();
  return;
end`,
    trap: "Waiting forever for ready after reset.",
    interview:
      "Every path after get_next_item() must release the item, including reset-abort paths.",
  },
  {
    title: "Card 14 — Monitor Reset Is Partial-Observation Cleanup [RESET]",
    accent: "emerald",
    hook: "Do not stitch transactions across reset.",
    concept: "The monitor must discard partial observations on reset.",
    code: `if (!rst_n) begin
  partial_valid = 0;
  continue;
end`,
    trap: "Publishing a transaction assembled partly before reset and partly after reset.",
    interview:
      "Reset creates an observation boundary; the monitor must not publish cross-reset artifacts.",
  },
  {
    title: "Card 15 — Scoreboard Reset Is Model Cleanup [RESET]",
    accent: "violet",
    hook: "Pin cleanup does not flush expectations.",
    concept:
      "Driver reset cleanup does not clean scoreboard queues. Scoreboard state must be reset explicitly.",
    code: `exp_q.delete();
act_q.delete();`,
    trap: "Assuming aborted driver items automatically disappear from scoreboard state.",
    interview:
      "Reset policy must be applied independently at driver, monitor, scoreboard, and assertion layers.",
  },
  {
    title: "Card 16 — Clocking Blocks Reduce Boundary Races [RACE]",
    accent: "amber",
    hook: "Drive and sample in disciplined regions.",
    concept:
      "Drivers and monitors should avoid ambiguous raw @(posedge clk) ordering when signals are driven and sampled in the same cycle.",
    code: `vif.drv_cb.valid <= 1'b1;

if (vif.mon_cb.valid && vif.mon_cb.ready)
  ap.write(obs);`,
    trap: "Driver uses blocking assignments on posedge clk, monitor samples on the same edge, and simulator scheduling decides the result.",
    interview:
      "I use clocking blocks or disciplined NBA timing to prevent driver-monitor races.",
  },
  {
    title: "Card 17 — Timeout Ownership Must Be Explicit [BOUNDARY]",
    accent: "rose",
    hook: "Timeout location defines failure meaning.",
    concept:
      "A driver timeout means the driver could not complete execution. A scoreboard timeout means expected behavior did not appear. An assertion timeout means a protocol bound was violated.",
    code: `driver timeout     -> liveness while executing item
scoreboard timeout -> missing expected actual transaction
assertion timeout  -> bounded temporal rule violation`,
    trap: "Every component has a separate timeout for the same event.",
    interview:
      "I assign timeout ownership based on what failed: execution, observation, comparison, or temporal law.",
  },
  {
    title: "Card 18 — Transaction Copying Has Ownership Semantics [BOUNDARY]",
    accent: "blue",
    hook: "Shared handles leak ownership.",
    concept:
      "A monitor should publish a fresh observed transaction. Scoreboards should copy/clone if storing transactions beyond the write call.",
    code: `obs = rv_item::type_id::create("obs");
obs.data = vif.mon_cb.data;
ap.write(obs);`,
    trap: "Reusing the same transaction handle for every monitor write.",
    interview:
      "I avoid shared mutable transaction handles crossing component boundaries.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// DATA — Bug Gallery (8 Bugs)
// ─────────────────────────────────────────────────────────────────────────────

const module13BugGallery = [
  {
    title: "Bug 1 — Driver Performs Functional Comparison",
    symptom: "Mismatch reported directly from driver log output.",
    waveform:
      "Driver samples response data and reports failure before monitor/scoreboard processing.",
    cause: "Functional correctness check placed in stimulus executor.",
    bad: `if (vif.rdata !== req.expected_rdata)
  \`uvm_error("DRV_CMP", "Read data mismatch")`,
    fix: `// Driver captures protocol response if needed:
rsp.rdata = vif.drv_cb.rdata;
// Scoreboard compares expected vs actual:
if (exp.rdata !== act.rdata)
  \`uvm_error("SB_CMP", "Read data mismatch")`,
    interview:
      "The driver may capture response fields for completion, but it must not issue the functional verdict.",
  },
  {
    title: "Bug 2 — item_done() Before Handshake",
    symptom:
      "Next sequence item starts while previous transfer is still active.",
    waveform: "Payload changes before ready handshake on interface.",
    cause: "Item ownership released before non-pipelined completion.",
    bad: `seq_item_port.get_next_item(req);
seq_item_port.item_done(); // BUG: early release!
drive_until_ready(req);`,
    fix: `seq_item_port.get_next_item(req);
drive_until_ready(req);
cleanup_pins();
seq_item_port.item_done();`,
    interview:
      "Early release is legal only in an intentional pipelined architecture with outstanding tracking.",
  },
  {
    title: "Bug 3 — Reset Strands Sequencer Item",
    symptom: "Simulation hangs after reset deassertion.",
    waveform: "ready remains low, driver is stuck, sequencer has no release.",
    cause: "Reset not monitored while item is owned.",
    bad: `seq_item_port.get_next_item(req);
wait (vif.ready); // BUG: unescapable wait during reset!
seq_item_port.item_done();`,
    fix: `while (vif.drv_cb.ready !== 1'b1) begin
  @(vif.drv_cb);
  if (vif.rst_n !== 1'b1) begin
    cleanup_pins();
    seq_item_port.item_done();
    return;
  end
end`,
    interview:
      "Every control path after get_next_item() must eventually release the item.",
  },
  {
    title: "Bug 4 — Monitor Copies Sequence Intent",
    symptom: "Scoreboard passes even when pin waveform is wrong.",
    waveform: "Monitor transaction does not match bus data.",
    cause: "Monitor copied expected intent instead of observing actual pins.",
    bad: `obs.data = driver.current_req.data; // BUG: not passive!`,
    fix: `obs.data = vif.mon_cb.data; // Observed from pins`,
    interview:
      "A monitor must be independent of stimulus intent; otherwise the scoreboard compares expected against expected.",
  },
  {
    title: "Bug 5 — Response Without ID Routing",
    symptom:
      "Sequence waits forever for response or receives wrong response under concurrent sequences.",
    waveform:
      "Protocol response occurs, but sequence-side response matching fails.",
    cause: "Response lacks request identity.",
    bad: `rsp = cmd_item::type_id::create("rsp");
seq_item_port.put_response(rsp); // BUG: missing set_id_info!`,
    fix: `rsp = cmd_item::type_id::create("rsp");
rsp.set_id_info(req);
seq_item_port.put_response(rsp);`,
    interview:
      "In routed response flows, the response must inherit request ID information.",
  },
  {
    title: "Bug 6 — Reusing Monitor Transaction Handle",
    symptom:
      "Scoreboard queue entries all appear to contain the last observed value.",
    waveform:
      "Monitor logs show different values, scoreboard sees repeated final value.",
    cause: "Same mutable transaction handle reused for multiple writes.",
    bad: `obs = rv_item::type_id::create("obs");
forever begin
  @(vif.mon_cb);
  if (vif.mon_cb.valid && vif.mon_cb.ready) begin
    obs.data = vif.mon_cb.data;
    ap.write(obs); // BUG: handle mutated in place!
  end
end`,
    fix: `forever begin
  @(vif.mon_cb);
  if (vif.mon_cb.valid && vif.mon_cb.ready) begin
    obs = rv_item::type_id::create("obs");
    obs.data = vif.mon_cb.data;
    ap.write(obs);
  end
end`,
    interview:
      "Cross-component transaction handles must not be reused in a way that mutates stored observations.",
  },
  {
    title: "Bug 7 — Assertion Used as Full Scoreboard",
    symptom:
      "Assertion failure is unreadable and hard to correlate to transaction context.",
    waveform: "Failure appears deep inside temporal state logic.",
    cause: "Transaction-level reference model encoded as assertion logic.",
    bad: `// Giant SVA block modeling full packet transformation algorithm`,
    fix: `// Assertions check temporal signal laws (valid/data stable).
// Scoreboard/reference model checks algorithmic transformations.`,
    interview:
      "Assertions are strongest for temporal laws. Scoreboards are stronger for transaction-level expected-vs-actual comparison.",
  },
  {
    title: "Bug 8 — Driver Masks DUT Bug",
    symptom: "Regression passes only because driver adapts around DUT bug.",
    waveform:
      "Driven payload changes after DUT response without sequence intent.",
    cause: "Driver modifies stimulus based on non-protocol-defined DUT behavior.",
    bad: `if (vif.error_seen)
  req.data = req.data + 1; // BUG: driver self-healing DUT bugs!`,
    fix: `// Modify/retry only if protocol explicitly defines retry/replay behavior.`,
    interview:
      "A driver must not compensate for DUT bugs unless it is implementing a protocol-defined reactive behavior.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// DATA — Interview Q&A (15 Questions)
// ─────────────────────────────────────────────────────────────────────────────

const module13InterviewQA = [
  {
    q: "Q1. What is the primary role of a UVM driver?",
    short: "To convert sequence-item intent into legal pin-level stimulus.",
    deep: "The driver pulls or receives a transaction, waits for legal protocol conditions, drives DUT inputs, samples protocol-required outputs, handles completion/reset, and releases or responds to the item.",
    followup: "Can the driver check read data?",
    answer:
      "It may capture read data if the driver contract requires a response, but it must not issue the functional correctness verdict. That belongs in the scoreboard.",
  },
  {
    q: "Q2. What is the difference between monitor and scoreboard?",
    short: "The monitor observes. The scoreboard compares.",
    deep: "The monitor reconstructs actual transactions from pins. The scoreboard receives expected and actual streams and reports mismatches.",
  },
  {
    q: "Q3. What is legal driver sampling?",
    short: "Sampling required to execute or complete the protocol.",
    deep: "Examples include ready, grant, pready, response-valid, response status, credit, retry, or reactive request signals. It is illegal to sample output data to decide whether the DUT computation is correct.",
  },
  {
    q: "Q4. Why is checking inside the driver dangerous?",
    short: "It corrupts ownership, debuggability, and reuse.",
    deep: "The driver has stimulus intent, not full observed behavior. If it reports correctness failures, the monitor and scoreboard become bypassed or duplicated. Reuse collapses across different testbenches.",
  },
  {
    q: "Q5. When should item_done() be called?",
    short:
      "When the driver's ownership of the item is complete under the chosen contract.",
    deep: "In non-pipelined drivers: after protocol completion and cleanup. In pipelined drivers: possibly after request acceptance, but only with explicit outstanding/response tracking.",
  },
  {
    q: "Q6. What is wrong with calling item_done() after get()?",
    short: "It mixes incompatible sequencer-driver API contracts.",
    deep: "get_next_item() pairs with item_done(). get() consumes the item directly and does not use item_done().",
  },
  {
    q: "Q7. What must be done after try_next_item()?",
    short: "Check for null before using the item.",
    deep: "If null, drive idle or do other legal work. If non-null, eventually call item_done().",
  },
  {
    q: "Q8. Why use set_id_info(req)?",
    short: "To route the response to the originating sequence.",
    deep: "The response must carry request identity when multiple sequences or outstanding requests exist.",
  },
  {
    q: "Q9. What should happen if reset occurs while the driver owns an item?",
    short: "Clean pins and release or respond to the item according to reset policy.",
    deep: "A reset-abort path that does not call item_done() can deadlock the sequencer.",
  },
  {
    q: "Q10. Where should payload-stable-while-stalled be checked?",
    short: "Assertion.",
    deep: "It is a temporal signal law. The driver should avoid violating it, but the assertion independently checks the waveform.",
  },
  {
    q: "Q11. Where should missing expected transaction be detected?",
    short: "Scoreboard.",
    deep: "The scoreboard owns expected-vs-actual correlation. A missing actual transaction is a comparison/ordering failure, not a driver failure.",
  },
  {
    q: "Q12. Where should a driver wait timeout live?",
    short: "In the driver if it is a liveness guard for execution.",
    deep: "A driver timeout says, 'I could not complete the transfer.' A protocol bounded-response timeout belongs in an assertion/checker. A missing observed transaction timeout belongs in the scoreboard.",
  },
  {
    q: "Q13. Why should a monitor not use sequence items?",
    short: "Because it would stop being passive.",
    deep: "A monitor must reconstruct actual pin behavior. If it copies intent, the scoreboard may compare expected intent against copied expected intent.",
  },
  {
    q: "Q14. What is the principal-level review question for any check?",
    short: "'Who owns this fact?'",
    deep: "Intent belongs to sequence/driver. Observation belongs to monitor. Correctness belongs to scoreboard. Temporal law belongs to assertion.",
  },
  {
    q: "Q15. What makes a driver reusable?",
    short: "Strict boundary discipline.",
    deep: "A reusable driver drives protocol-legal stimulus, exposes necessary response status, avoids DUT-specific correctness logic, and lets monitors/scoreboards/assertions own checking.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// DATA — Sections for Sidebar Navigation
// ─────────────────────────────────────────────────────────────────────────────

const module13Sections = [
  { id: "identity", label: "1. Cover Page / Module Identity" },
  { id: "learning-objectives", label: "2. Learning Objectives" },
  { id: "how-to-use", label: "3. How to Use This Module" },
  { id: "visual-tag-legend", label: "4. Visual Tag Legend" },
  { id: "acceptance-checklist", label: "5. Acceptance Checklist" },
  { id: "scope", label: "6. Scope and Non-Scope" },
  { id: "protocol-mental-model", label: "7. Protocol Mental Model" },
  { id: "timing-waveform", label: "8. Timing / Waveform Contract" },
  { id: "driver-boundary", label: "9. Driver Responsibility Boundary" },
  { id: "ssd-contract", label: "10. Sequence-Sequencer-Driver Contract" },
  { id: "reset-abort", label: "11. Reset / Abort Policy" },
  { id: "response-policy", label: "12. Response / Completion Policy" },
  { id: "ownership-matrix", label: "13. Protocol Ownership Matrix" },
  { id: "memory-cards", label: "14. Memory Cards (1–18)" },
  { id: "atlas-sheets", label: "15. Atlas Sheets (1–5)" },
  { id: "code-labs", label: "16. Code Labs (1–3)" },
  { id: "bug-gallery", label: "17. Bug Gallery (1–8)" },
  { id: "race-checklist", label: "18. Race-Condition Checklist" },
  { id: "debug-strategy", label: "19. Debug Instrumentation & Log Strategy" },
  { id: "boundary", label: "20. Monitor / Scoreboard / Assertion Boundary" },
  { id: "architecture", label: "21. Architectural Decision Points" },
  { id: "scalability", label: "22. Scalability Notes" },
  { id: "review-checklist", label: "23. Review Checklist" },
  { id: "interview-qa", label: "24. Interview Q&A (Q1–Q15)" },
  { id: "final-recall", label: "25. Final Recall Card" },
  { id: "key-takeaways", label: "26. Key Takeaways" },
  { id: "interview-questions", label: "27. Interview Questions" },
  { id: "coding-exercise", label: "28. Coding Exercise" },
  { id: "final-verdict", label: "29. Final Readiness Verdict" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT — Module 13
// ═══════════════════════════════════════════════════════════════════════════════

const Module13 = () => {
  return (
    <div className="relative min-h-screen bg-slate-950 text-white font-sans">
      {/* Background glow & grid */}
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-150 h-62.5 bg-linear-to-r from-blue-600/15 to-indigo-600/15 blur-[100px] rounded-full" />

      <div className="relative z-10 flex max-w-7xl mx-auto">
        {/* ── Sidebar TOC (desktop) ────────────────────────────────────── */}
        <ModuleSidebar
          moduleNumber="13"
          title="Component Boundaries"
          sections={module13Sections}
        />

        {/* ── Main Content ─────────────────────────────────────────────── */}
        <main className="flex-1 min-w-0 px-6 py-8 pb-24 max-w-4xl">
          {/* Mobile back */}
          <BackToHomeBtn to="/driver-mastery" />

          {/* Hero */}
          <ModuleHero
            moduleNumber="13"
            title="Driver-Monitor-Scoreboard-Assertion Boundary"
            description="Master the architectural separation between stimulus execution, passive pin observation, functional correctness comparison, and temporal protocol assertions in scalable UVM verification environments."
            metadata={[
              ["Module", "13"],
              ["Reference", "UVM 1.2 / Boundary Architecture"],
              ["Primary Skill", "Clean ownership separation across 4 verification domains"],
              ["Roadmap", "After Module 12 (Slave Drivers), before Module 14 (Burst Drivers)"],
            ]}
          />

          {/* ── §1 Identity ─────────────────────────────────────────────── */}
          <section id="identity">
            <SectionHeading num={1} title="Cover Page / Module Identity" />
            <div className="rounded-xl border border-slate-700/60 bg-slate-900/50 p-5 space-y-3 mb-6">
              <Table
                headers={["Field", "Value"]}
                rows={[
                  ["Course", "UVM Driver Mastery"],
                  ["Module", "13"],
                  ["Title", "Driver-Monitor-Scoreboard-Assertion Boundary"],
                  ["Reference Semantics", "UVM 1.2"],
                  ["Primary Skill", "Place driver, monitor, scoreboard, and assertion logic in the correct component without corrupting verification architecture."],
                ]}
              />

              <h3 className="text-lg font-bold text-blue-300 mt-4">
                Core Thesis
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                A driver is a <strong>stimulus executor</strong>. It is not a scoreboard, not a passive monitor, not a predictor, and not a temporal protocol checker.
              </p>
              <Table
                headers={["Component", "Owns"]}
                rows={[
                  ["Driver", "Converts sequence-item intent into legal DUT input stimulus"],
                  ["Monitor", "Observes pin-level facts and publishes actual transactions"],
                  ["Scoreboard", "Compares expected behavior against observed behavior"],
                  ["Assertions", "Enforce temporal protocol laws directly on signals"],
                ]}
              />
            </div>
          </section>

          {/* ── §2 Learning Objectives ──────────────────────────────────── */}
          <section id="learning-objectives">
            <SectionHeading num={2} title="Learning Objectives" />
            <ol className="space-y-2 list-decimal list-inside text-slate-300 text-sm leading-relaxed">
              {[
                "Explain why a UVM driver must not become a scoreboard.",
                "Define exactly what a driver may sample from the DUT.",
                "Separate driver-local legality checks from functional correctness checks.",
                "Place a check in the correct owner: driver, monitor, scoreboard, or assertion.",
                "Define clean item_done() timing for non-pipelined drivers.",
                "Explain request-acceptance versus response-completion in pipelined drivers.",
                "Use put_response() and set_id_info(req) only when response routing is required.",
                "Handle reset while the driver owns a sequence item without deadlocking the sequencer.",
                "Identify boundary violations in bad UVM code.",
                "Defend boundary decisions in senior/principal verification interviews.",
              ].map((obj, i) => (
                <li key={i} className="pl-2">
                  {obj}
                </li>
              ))}
            </ol>
          </section>

          {/* ── §3 How to Use This Module ───────────────────────────────── */}
          <section id="how-to-use">
            <SectionHeading num={3} title="How to Use This Module" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300 mb-4">
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
                <strong className="text-blue-300">Pass 1 — Ownership First</strong>
                <p>Read Sections 7 to 13 to understand what each component owns.</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
                <strong className="text-emerald-300">Pass 2 — Memory Cards</strong>
                <p>Use Section 14 as revision cards for interview readiness.</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
                <strong className="text-violet-300">Pass 3 — Code Labs</strong>
                <p>Study bad code vs corrected code for architectural ownership.</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
                <strong className="text-amber-300">Pass 4 — Review Mode</strong>
                <p>Use bug gallery, race checklist, and review checklist against real drivers.</p>
              </div>
            </div>
          </section>

          {/* ── §4 Visual Tag Legend ───────────────────────────────────── */}
          <section id="visual-tag-legend">
            <SectionHeading num={4} title="Visual Tag Legend" />
            <Table
              headers={["Tag", "Meaning"]}
              rows={[
                ["[DRIVER]", "Driver-owned behavior"],
                ["[MONITOR]", "Monitor-owned behavior"],
                ["[SCOREBOARD]", "Scoreboard-owned behavior"],
                ["[ASSERTION]", "Assertion-owned behavior"],
                ["[BOUNDARY]", "Ownership separation rule"],
                ["[RESET]", "Reset/abort behavior"],
                ["[RESPONSE]", "Response/completion behavior"],
                ["[RACE]", "Race hazard"],
                ["[BAD]", "Incorrect pattern"],
                ["[FIX]", "Corrected pattern"],
                ["[INTERVIEW]", "Interview-defense line"],
              ]}
            />
          </section>

          {/* ── §5 Module-Specific Acceptance Checklist ─────────────────── */}
          <section id="acceptance-checklist">
            <SectionHeading
              num={5}
              title="Module-Specific Acceptance Checklist"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-300">
              {[
                "Driver responsibility is stimulus execution, not correctness checking.",
                "Monitor responsibility is passive observation, not prediction.",
                "Scoreboard responsibility is expected-vs-actual comparison.",
                "Assertion responsibility is temporal protocol-law enforcement.",
                "Driver-permitted sampling is limited to protocol-required outputs.",
                "Driver-local checks are limited to legality/liveness guards.",
                "Non-pipelined item_done() timing is explicitly defined.",
                "Pipelined acceptance/completion split is explained.",
                "get_next_item() / item_done() pairing is correct.",
                "get() is not paired with item_done().",
                "try_next_item() null handling is shown.",
                "Response object construction is correct.",
                "set_id_info(req) is used where response routing matters.",
                "Reset-abort behavior releases any owned sequence item.",
                "Monitor partial-transaction reset handling is described.",
                "Scoreboard reset flushing is described.",
                "Assertion reset disable behavior is described.",
                "Race-condition risks are covered.",
                "Code labs contain bad code and corrected code.",
                "Interview answers defend mechanism, not slogans.",
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/40 border border-slate-800"
                >
                  <FaCheckSquare className="text-blue-400 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ── §6 Scope and Non-Scope ─────────────────────────────────── */}
          <section id="scope">
            <SectionHeading num={6} title="Scope and Non-Scope" />
            <div className="space-y-4 text-sm">
              <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5">
                <h4 className="font-bold text-blue-300 mb-2">6.1 In Scope</h4>
                <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs">
                  <li>Driver/monitor/scoreboard/assertion ownership boundaries.</li>
                  <li>Legal and illegal driver sampling.</li>
                  <li>Minimal driver legality/liveness checks.</li>
                  <li>Sequencer-driver completion ownership.</li>
                  <li>Reset-abort ownership.</li>
                  <li>Response routing ownership.</li>
                  <li>Race conditions caused by bad component boundaries.</li>
                  <li>Debug instrumentation by component owner.</li>
                  <li>Senior/principal review and interview defense.</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/40">
                <h4 className="font-bold text-slate-300 mb-2">
                  6.2 Non-Scope
                </h4>
                <Table
                  headers={["Topic", "Status"]}
                  rows={[
                    ["Full scoreboard architecture", "Out of scope"],
                    ["Full assertion methodology", "Out of scope"],
                    ["Full monitor taxonomy", "Out of scope"],
                    ["AXI/APB protocol deep dive", "Out of scope"],
                    ["Advanced pipelined/outstanding-driver architecture", "Forward reference to Module 11"],
                    ["Slave/reactive driver implementation depth", "Forward reference to Module 12"],
                    ["Reset/low-power architectural depth", "Forward reference to Module 17"],
                  ]}
                />
              </div>

              <Callout type="concept">
                <strong>Boundary Note:</strong> This module teaches <strong>where logic belongs</strong>. It does not teach full scoreboard design, full assertion design, or full protocol VIP architecture.
              </Callout>
            </div>
          </section>

          {/* ── §7 Protocol Mental Model ───────────────────────────────── */}
          <section id="protocol-mental-model">
            <SectionHeading num={7} title="Protocol Mental Model" />
            <div className="space-y-3 text-sm text-slate-300">
              <p className="text-xs text-slate-400">A protocol transaction has four distinct views:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl border border-slate-700/60 bg-slate-900/40 space-y-1">
                  <h5 className="font-bold text-blue-300 text-xs">7.1 Intent View (Sequence / Driver)</h5>
                  <CodeBlock lang="systemverilog">{`class rv_item extends uvm_sequence_item;
  rand bit [31:0] data;
endclass`}</CodeBlock>
                </div>
                <div className="p-3 rounded-xl border border-slate-700/60 bg-slate-900/40 space-y-1">
                  <h5 className="font-bold text-emerald-300 text-xs">7.2 Execution View (Driver)</h5>
                  <CodeBlock lang="systemverilog">{`vif.drv_cb.valid <= 1'b1;
vif.drv_cb.data  <= req.data;`}</CodeBlock>
                </div>
                <div className="p-3 rounded-xl border border-slate-700/60 bg-slate-900/40 space-y-1">
                  <h5 className="font-bold text-cyan-300 text-xs">7.3 Observation View (Monitor)</h5>
                  <CodeBlock lang="systemverilog">{`if (vif.mon_cb.valid && vif.mon_cb.ready) begin
  obs.data = vif.mon_cb.data;
  ap.write(obs);
end`}</CodeBlock>
                </div>
                <div className="p-3 rounded-xl border border-slate-700/60 bg-slate-900/40 space-y-1">
                  <h5 className="font-bold text-rose-300 text-xs">7.4 Correctness View (Scoreboard)</h5>
                  <CodeBlock lang="systemverilog">{`if (exp.data !== act.data)
  \`uvm_error("MISMATCH", "Expected and actual differ")`}</CodeBlock>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-purple-500/20 bg-purple-500/10 text-xs space-y-1">
                <h5 className="font-bold text-purple-300">7.5 Temporal Law View (Assertions)</h5>
                <CodeBlock lang="systemverilog">{`valid && !ready |=> valid && $stable(data)`}</CodeBlock>
              </div>
            </div>
          </section>

          {/* ── §8 Timing / Waveform Contract ──────────────────────────── */}
          <section id="timing-waveform">
            <SectionHeading num={8} title="Timing / Waveform Contract" />
            <div className="space-y-4 text-sm text-slate-300">
              <Table
                headers={["Signal", "Direction from Driver View", "Meaning"]}
                rows={[
                  ["valid", "Driver drives", "A transfer is available"],
                  ["data", "Driver drives", "Payload"],
                  ["ready", "DUT drives", "DUT can accept payload"],
                  ["rst_n", "Reset", "Active-low reset"],
                ]}
              />

              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs">
                <strong>Transfer Acceptance:</strong> <code>valid &amp;&amp; ready</code> on rising clock edge.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
                  <strong className="text-blue-300">8.3 Driver Contract:</strong>
                  <p>Wait reset release → Fetch item → Drive payload/valid → Hold stable while stalled → Observe ready → Cleanup pins → Release item.</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
                  <strong className="text-cyan-300">8.4 Monitor Contract:</strong>
                  <p>Sample pins passively → Publish observed transaction on acceptance → Discard partial on reset → Avoid sequence-item handles.</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
                  <strong className="text-rose-300">8.5 Scoreboard Contract:</strong>
                  <p>Receive expected stream → Receive actual stream → Compare ordering/data → Flush queues on reset.</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
                  <strong className="text-purple-300">8.6 Assertion Contract:</strong>
                  <p>Sample clock → Disable under reset → Check temporal laws directly on signals → Avoid full reference model bloat.</p>
                </div>
              </div>
            </div>
          </section>

          {/* ── §9 Driver Responsibility Boundary ───────────────────────── */}
          <section id="driver-boundary">
            <SectionHeading
              num={9}
              title="Driver Responsibility Boundary"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
              <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                <h4 className="font-bold text-emerald-300 mb-2">9.1 What the Driver Owns</h4>
                <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs">
                  <li>Pulling items from the sequencer.</li>
                  <li>Decoding sequence-item intent.</li>
                  <li>Waiting for legal drive conditions.</li>
                  <li>Driving DUT inputs.</li>
                  <li>Sampling protocol-required outputs.</li>
                  <li>Capturing protocol response fields when required.</li>
                  <li>Releasing the sequencer item.</li>
                  <li>Cleaning pins on completion or reset abort.</li>
                  <li>Producing driver execution logs.</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5">
                <h4 className="font-bold text-rose-300 mb-2">9.2 What the Driver Does Not Own</h4>
                <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs">
                  <li>Functional data comparison.</li>
                  <li>End-to-end correctness verdicts.</li>
                  <li>Reference-model prediction.</li>
                  <li>Passive reconstruction of all interface activity.</li>
                  <li>Coverage collection for observed DUT behavior.</li>
                  <li>Full protocol temporal checking.</li>
                  <li>Scoreboard queue management.</li>
                  <li>Correcting stimulus based on illegal DUT behavior.</li>
                </ul>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/40 text-xs mb-3">
              <h4 className="font-bold text-blue-300 mb-2">9.3 Legal Driver Sampling</h4>
              <Table
                headers={["Signal Type", "Legal Driver Reason"]}
                rows={[
                  ["ready", "Handshake completion"],
                  ["grant", "Arbitration acceptance"],
                  ["pready", "APB-style completion"],
                  ["pslverr", "Protocol error response capture"],
                  ["bvalid/rvalid", "Response phase completion"],
                  ["credit", "Flow-control legality"],
                  ["retry/nack", "Protocol-defined retry/replay"],
                  ["DUT request signal in reactive driver", "Legal reactive response generation"],
                ]}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg">
                <strong className="text-rose-300">9.4 Illegal Driver Sampling:</strong>
                <ul className="list-disc list-inside space-y-0.5 text-slate-300 mt-1">
                  <li>Check result data against expected data.</li>
                  <li>Predict internal DUT state.</li>
                  <li>Replace monitor observation.</li>
                  <li>Hide DUT bugs by modifying stimulus.</li>
                </ul>
              </div>
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <strong className="text-emerald-300">9.5 Legal Driver-Local Checks:</strong>
                <p className="text-slate-300 mt-1">
                  Legality/liveness guards: check <code>req.num_bytes &gt; 0</code> or warn on <code>$isunknown(ready)</code> during stall.
                </p>
              </div>
            </div>
          </section>

          {/* ── §10 Sequence-Sequencer-Driver Contract ──────────────────── */}
          <section id="ssd-contract">
            <SectionHeading
              num={10}
              title="Sequence-Sequencer-Driver Contract"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
                <strong className="text-blue-300">10.1 get_next_item():</strong>
                <p>Must pair with <code>item_done()</code> on every exit path (including reset-abort).</p>
                <CodeBlock lang="systemverilog">{`seq_item_port.get_next_item(req);
drive_request(req);
seq_item_port.item_done();`}</CodeBlock>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
                <strong className="text-emerald-300">10.2 get():</strong>
                <p>Consumes item directly. Never call <code>item_done()</code>.</p>
                <CodeBlock lang="systemverilog">{`seq_item_port.get(req);
drive_request(req);`}</CodeBlock>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
                <strong className="text-violet-300">10.3 try_next_item():</strong>
                <p>Mandatory null check before use. If non-null, call <code>item_done()</code>.</p>
                <CodeBlock lang="systemverilog">{`seq_item_port.try_next_item(req);
if (req == null) drive_idle_cycle();
else begin drive_request(req); seq_item_port.item_done(); end`}</CodeBlock>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
                <strong className="text-rose-300">10.4 Response Contract:</strong>
                <p>Create valid object, use <code>set_id_info(req)</code>, do not report scoreboard verdicts.</p>
                <CodeBlock lang="systemverilog">{`rsp = rsp_item::type_id::create("rsp");
rsp.set_id_info(req);
seq_item_port.put_response(rsp);`}</CodeBlock>
              </div>
            </div>
          </section>

          {/* ── §11 Reset / Abort Policy ───────────────────────────────── */}
          <section id="reset-abort">
            <SectionHeading num={11} title="Reset / Abort Policy" />
            <div className="space-y-3 text-sm text-slate-300">
              <Table
                headers={["Policy", "Meaning"]}
                rows={[
                  ["Complete-as-aborted", "Clean pins and call item_done()"],
                  ["Complete-with-response", "Send response marked aborted/error"],
                  ["Kill-and-clean", "Kill active drive thread, clean pins, release item"],
                  ["Phase-exit-safe", "Exit only after releasing any owned item"],
                ]}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg">
                  <strong className="text-rose-300">❌ Bad Reset Pattern (Deadlock):</strong>
                  <CodeBlock lang="systemverilog">{`seq_item_port.get_next_item(req);
wait (vif.ready); // Stalls forever if reset holds ready low!
seq_item_port.item_done();`}</CodeBlock>
                </div>

                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                  <strong className="text-emerald-300">✅ Correct Reset-Aware Wait:</strong>
                  <CodeBlock lang="systemverilog">{`while (vif.drv_cb.ready !== 1'b1) begin
  @(vif.drv_cb);
  if (vif.rst_n !== 1'b1) begin
    cleanup_pins();
    seq_item_port.item_done();
    return;
  end
end`}</CodeBlock>
                </div>
              </div>
            </div>
          </section>

          {/* ── §12 Response / Completion Policy ────────────────────────── */}
          <section id="response-policy">
            <SectionHeading
              num={12}
              title="Response / Completion Policy"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
                <strong className="text-blue-300">12.1 Non-Pipelined Completion:</strong>
                <p><code>item_done()</code> means the driver is finished owning the request on the bus.</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
                <strong className="text-emerald-300">12.2 Pipelined Acceptance:</strong>
                <p>Request acceptance != response completion. Early release requires response tracking.</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
                <strong className="text-violet-300">12.3 No-Response Protocols:</strong>
                <p>No response object required for fire-and-forget streaming writes.</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
                <strong className="text-rose-300">12.4 Response-Required Protocols:</strong>
                <p>Read data, error status, or multi-sequence routing require response objects with <code>set_id_info(req)</code>.</p>
              </div>
            </div>
          </section>

          {/* ── §13 Protocol Ownership Matrix ──────────────────────────── */}
          <section id="ownership-matrix">
            <SectionHeading num={13} title="Protocol Ownership Matrix" />
            <Table
              headers={[
                "Concern",
                "Driver",
                "Monitor",
                "Scoreboard",
                "Assertion",
              ]}
              rows={[
                ["Drives DUT inputs", "Owns", "Never", "Never", "Never"],
                ["Samples ready for completion", "Owns if required", "Observes", "Consumes observation if needed", "May check timing"],
                ["Converts sequence item to pins", "Owns", "Never", "Never", "Never"],
                ["Reconstructs actual transaction", "No", "Owns", "Consumes", "No"],
                ["Compares expected vs actual", "No", "No", "Owns", "No"],
                ["Checks payload stability while stalled", "Avoids violating", "May observe", "No", "Owns"],
                ["Captures protocol response status", "Owns if contract requires", "Observes", "May consume actual", "May check response timing"],
                ["Checks functional data correctness", "No", "No", "Owns", "Usually no"],
                ["Checks temporal protocol law", "Minimal local guard only", "No", "No", "Owns"],
                ["Handles reset pin cleanup", "Owns", "No", "No", "No"],
                ["Discards partial observation on reset", "No", "Owns", "No", "No"],
                ["Flushes expected/actual queues on reset", "No", "No", "Owns", "No"],
                ["Disables temporal checks during reset", "No", "No", "No", "Owns"],
                ["Emits execution logs", "Owns", "No", "No", "No"],
                ["Emits correctness verdicts", "No", "No", "Owns", "Owns for temporal violations"],
              ]}
            />
          </section>

          {/* ── §14 Memory Cards ────────────────────────────────────────── */}
          <section id="memory-cards">
            <SectionHeading num={14} title="Memory Cards (1–18)" />
            <p className="text-slate-400 text-sm mb-4">
              18 comprehensive memory cards for Verification Boundaries:
            </p>
            <div className="space-y-3">
              {module13MemoryCards.map((card, idx) => (
                <CollapsibleCard
                  key={idx}
                  title={card.title}
                  accent={card.accent}
                  icon={<FaBook size={12} />}
                  defaultOpen={idx < 2}
                >
                  <Callout type="hook">
                    <strong>Memory Hook:</strong> {card.hook}
                  </Callout>

                  <Callout type="concept">
                    <strong>Core Concept:</strong> {card.concept}
                  </Callout>

                  <CodeBlock lang="systemverilog">{card.code}</CodeBlock>

                  <Callout type="trap">
                    <strong>Common Trap:</strong> {card.trap}
                  </Callout>

                  <Callout type="interview">
                    <strong>Interview Line:</strong> "{card.interview}"
                  </Callout>
                </CollapsibleCard>
              ))}
            </div>
          </section>

          {/* ── §15 Atlas Sheets ────────────────────────────────────────── */}
          <section id="atlas-sheets">
            <SectionHeading num={15} title="Atlas Sheets (1–5)" />

            <CollapsibleCard
              title="Atlas Sheet 1 — Component Ownership Classifier"
              accent="blue"
              icon={<FaListAlt size={12} />}
              defaultOpen={true}
            >
              <Table
                headers={["Question", "Owner"]}
                rows={[
                  ["What did the test request?", "Sequence item"],
                  ["How is the request driven?", "Driver"],
                  ["Did the interface handshake occur?", "Monitor observes; driver may sample for completion"],
                  ["What actual transaction occurred?", "Monitor"],
                  ["What was expected?", "Predictor/reference model/scoreboard input"],
                  ["Did expected match actual?", "Scoreboard"],
                  ["Was payload stable while stalled?", "Assertion"],
                  ["Did reset invalidate partial work?", "Each layer owns its own cleanup"],
                  ["Did a response return to originating sequence?", "Driver/sequencer response contract"],
                  ["Did response arrive within protocol bound?", "Assertion/checker or scoreboard depending bound type"],
                ]}
              />
            </CollapsibleCard>

            <CollapsibleCard
              title="Atlas Sheet 2 — Check Placement Map"
              accent="violet"
              icon={<FaListAlt size={12} />}
            >
              <Table
                headers={["Check", "Correct Location", "Why"]}
                rows={[
                  ["Sequence item has illegal length", "Driver", "Cannot execute illegal stimulus"],
                  ["valid drops before ready", "Assertion", "Temporal signal law"],
                  ["DUT output data mismatch", "Scoreboard", "Expected-vs-actual comparison"],
                  ["Monitor sees X payload on accepted transfer", "Monitor or assertion", "Observation quality/protocol rule"],
                  ["Driver waits too long for ready", "Driver liveness guard", "Execution cannot progress"],
                  ["Expected transaction never observed", "Scoreboard", "Missing actual behavior"],
                  ["Response arrives too late for protocol spec", "Assertion/checker", "Bounded temporal law"],
                  ["Partial packet crosses reset", "Monitor", "Observation reconstruction boundary"],
                  ["Expected queue stale after reset", "Scoreboard", "Model-state boundary"],
                ]}
              />
            </CollapsibleCard>

            <CollapsibleCard
              title="Atlas Sheet 3 — Sequencer-Driver API Map"
              accent="emerald"
              icon={<FaListAlt size={12} />}
            >
              <Table
                headers={["API Style", "Release Rule", "Use Case", "Trap"]}
                rows={[
                  ["get_next_item()", "Must call item_done()", "Common blocking driver", "Missing item_done() on reset"],
                  ["get()", "Do not call item_done()", "Alternative pull contract", "Mixing with item_done()"],
                  ["try_next_item()", "If non-null, must call item_done()", "Opportunistic driver", "Null dereference"],
                  ["put_response()", "Needs valid response object", "Sequence-visible response", "Missing set_id_info(req)"],
                  ["item_done(rsp)", "Completion plus response in one call", "Simple completion-response contract", "Using it without clear sequence expectation"],
                ]}
              />
            </CollapsibleCard>

            <CollapsibleCard
              title="Atlas Sheet 4 — Reset Impact Map"
              accent="amber"
              icon={<FaListAlt size={12} />}
            >
              <Table
                headers={["Layer", "Reset Responsibility"]}
                rows={[
                  ["Driver", "Stop driving illegal pins, clean outputs, release owned item"],
                  ["Monitor", "Drop partial observation, avoid publishing reset-corrupted transaction"],
                  ["Scoreboard", "Flush, invalidate, or epoch-tag expected/actual state"],
                  ["Assertion", "Disable or check reset-specific rules"],
                  ["Sequence", "Avoid assuming aborted item completed successfully unless response policy says so"],
                  ["Test", "Coordinate reset phase and scoreboard reset policy"],
                ]}
              />
            </CollapsibleCard>

            <CollapsibleCard
              title="Atlas Sheet 5 — Plain SV / UVM / cocotb Boundary Comparison"
              accent="rose"
              icon={<FaListAlt size={12} />}
            >
              <Table
                headers={["Concern", "Plain SV TB", "UVM", "cocotb/Python"]}
                rows={[
                  ["Stimulus executor", "Driver task/class", "uvm_driver", "Driver coroutine"],
                  ["Passive observation", "Monitor task/class", "uvm_monitor", "Monitor coroutine"],
                  ["Expected model", "Reference task/class", "Predictor/scoreboard", "Python model"],
                  ["Temporal checks", "SVA", "SVA/checker", "SVA or Python checks"],
                  ["Completion contract", "Events/mailboxes", "Sequencer-driver API", "Awaitable/coroutine contract"],
                  ["Response routing", "Custom IDs", "set_id_info(req) + response path", "Futures/queues keyed by ID"],
                  ["Reset cleanup", "Manual tasks", "Reset-aware components", "Coroutine cancellation/reset handlers"],
                ]}
              />
            </CollapsibleCard>
          </section>

          {/* ── §16 Code Labs ───────────────────────────────────────────── */}
          <section id="code-labs">
            <SectionHeading num={16} title="Code Labs (1–3)" />

            {/* Lab 1 */}
            <CollapsibleCard
              title="Code Lab 1 — Boundary-Clean Ready/Valid Mini-Agent"
              accent="blue"
              icon={<FaFlask size={12} />}
              defaultOpen={true}
            >
              <div className="space-y-3 text-xs text-slate-300">
                <p>
                  <strong>Goal:</strong> Build a minimal ready/valid source environment where driver drives <code>valid/data</code> and samples <code>ready</code> only for completion, monitor observes accepted transfers, scoreboard compares expected/actual streams, and assertion checks stalled payload stability.
                </p>
                <CodeBlock lang="systemverilog">{`interface rv_if(input logic clk, input logic rst_n);
  logic        valid;
  logic        ready;
  logic [31:0] data;

  clocking drv_cb @(posedge clk);
    default input #1step output #0;
    output valid;
    output data;
    input  ready;
  endclocking

  clocking mon_cb @(posedge clk);
    default input #1step output #0;
    input valid;
    input ready;
    input data;
  endclocking

  property p_payload_stable_when_stalled;
    @(posedge clk) disable iff (!rst_n)
      valid && !ready |=> valid && $stable(data);
  endproperty

  a_payload_stable_when_stalled:
    assert property (p_payload_stable_when_stalled)
    else $error("READY/VALID violation: valid/data changed while stalled");
endinterface

package rv_boundary_pkg;
  import uvm_pkg::*;
  \`include "uvm_macros.svh"

  typedef enum int {RV_OK, RV_ABORTED} rv_status_e;

  class rv_item extends uvm_sequence_item;
    rand bit [31:0] data;
    rv_status_e status;

    \`uvm_object_utils_begin(rv_item)
      \`uvm_field_int(data, UVM_ALL_ON)
      \`uvm_field_enum(rv_status_e, status, UVM_ALL_ON)
    \`uvm_object_utils_end

    function new(string name = "rv_item");
      super.new(name);
      status = RV_OK;
    endfunction
  endclass

  class rv_driver extends uvm_driver #(rv_item);
    \`uvm_component_utils(rv_driver)

    virtual rv_if vif;

    function new(string name = "rv_driver", uvm_component parent = null);
      super.new(name, parent);
    endfunction

    function void build_phase(uvm_phase phase);
      super.build_phase(phase);
      if (!uvm_config_db#(virtual rv_if)::get(this, "", "vif", vif)) begin
        \`uvm_fatal("NOVIF", "rv_driver requires virtual rv_if")
      end
    endfunction

    task run_phase(uvm_phase phase);
      rv_item req;
      drive_idle();
      forever begin
        wait_reset_release();
        seq_item_port.get_next_item(req);
        drive_one(req);
        seq_item_port.item_done();
      end
    endtask

    task wait_reset_release();
      while (vif.rst_n !== 1'b1) begin
        drive_idle();
        @(posedge vif.clk);
      end
    endtask

    task drive_idle();
      vif.drv_cb.valid <= 1'b0;
      vif.drv_cb.data  <= '0;
    endtask

    task drive_one(rv_item req);
      int wait_cycles;
      wait_cycles = 0;

      if (vif.rst_n !== 1'b1) begin
        req.status = RV_ABORTED;
        drive_idle();
        return;
      end

      vif.drv_cb.valid <= 1'b1;
      vif.drv_cb.data  <= req.data;

      do begin
        @(vif.drv_cb);
        if (vif.rst_n !== 1'b1) begin
          req.status = RV_ABORTED;
          drive_idle();
          return;
        end
        if (vif.drv_cb.ready !== 1'b1) wait_cycles++;
      end while (vif.drv_cb.ready !== 1'b1);

      req.status = RV_OK;
      @(vif.drv_cb);
      drive_idle();
    endtask
  endclass

  class rv_monitor extends uvm_monitor;
    \`uvm_component_utils(rv_monitor)

    virtual rv_if vif;
    uvm_analysis_port #(rv_item) ap;

    function new(string name = "rv_monitor", uvm_component parent = null);
      super.new(name, parent);
      ap = new("ap", this);
    endfunction

    function void build_phase(uvm_phase phase);
      super.build_phase(phase);
      if (!uvm_config_db#(virtual rv_if)::get(this, "", "vif", vif)) begin
        \`uvm_fatal("NOVIF", "rv_monitor requires virtual rv_if")
      end
    endfunction

    task run_phase(uvm_phase phase);
      rv_item obs;
      forever begin
        @(vif.mon_cb);
        if (vif.rst_n !== 1'b1) continue;
        if (vif.mon_cb.valid && vif.mon_cb.ready) begin
          obs = rv_item::type_id::create("obs", this);
          obs.data = vif.mon_cb.data;
          obs.status = RV_OK;
          ap.write(obs);
        end
      end
    endtask
  endclass

  \`uvm_analysis_imp_decl(_exp)
  \`uvm_analysis_imp_decl(_act)

  class rv_scoreboard extends uvm_component;
    \`uvm_component_utils(rv_scoreboard)

    uvm_analysis_imp_exp #(rv_item, rv_scoreboard) exp_export;
    uvm_analysis_imp_act #(rv_item, rv_scoreboard) act_export;

    rv_item exp_q[$];
    rv_item act_q[$];

    function new(string name = "rv_scoreboard", uvm_component parent = null);
      super.new(name, parent);
      exp_export = new("exp_export", this);
      act_export = new("act_export", this);
    endfunction

    function void write_exp(rv_item t);
      rv_item c;
      c = rv_item::type_id::create("exp_copy");
      c.copy(t);
      exp_q.push_back(c);
      compare_available();
    endfunction

    function void write_act(rv_item t);
      rv_item c;
      c = rv_item::type_id::create("act_copy");
      c.copy(t);
      act_q.push_back(c);
      compare_available();
    endfunction

    function void compare_available();
      rv_item exp, act;
      while (exp_q.size() > 0 && act_q.size() > 0) begin
        exp = exp_q.pop_front();
        act = act_q.pop_front();
        if (exp.data !== act.data) begin
          \`uvm_error("RV_MISMATCH", $sformatf("Expected=0x%08h Actual=0x%08h", exp.data, act.data))
        end else begin
          \`uvm_info("RV_MATCH", $sformatf("Matched data=0x%08h", act.data), UVM_LOW)
        end
      end
    endfunction

    function void flush_on_reset();
      exp_q.delete();
      act_q.delete();
    endfunction
  endclass
endpackage`}</CodeBlock>
              </div>
            </CollapsibleCard>

            {/* Lab 2 */}
            <CollapsibleCard
              title="Code Lab 2 — Refactor a Boundary-Violating Driver"
              accent="emerald"
              icon={<FaFlask size={12} />}
            >
              <div className="space-y-3 text-xs text-slate-300">
                <p>
                  <strong>Goal:</strong> Move functional data checking out of the driver into a dedicated scoreboard.
                </p>
                <div className="text-rose-400 font-bold">❌ Bad Driver:</div>
                <CodeBlock lang="systemverilog">{`// Bad driver compares data directly:
if (vif.data !== req.data) begin
  \`uvm_error("DRV_CMP", "Driver detected data mismatch")
end`}</CodeBlock>

                <div className="text-emerald-400 font-bold">✅ Good Driver:</div>
                <CodeBlock lang="systemverilog">{`task drive_one(rv_item req);
  if (vif.rst_n !== 1'b1) begin
    drive_idle();
    return;
  end

  vif.drv_cb.valid <= 1'b1;
  vif.drv_cb.data  <= req.data;

  do begin
    @(vif.drv_cb);
    if (vif.rst_n !== 1'b1) begin
      drive_idle();
      return;
    end
  end while (vif.drv_cb.ready !== 1'b1);

  @(vif.drv_cb);
  drive_idle();
endtask`}</CodeBlock>
              </div>
            </CollapsibleCard>

            {/* Lab 3 */}
            <CollapsibleCard
              title="Code Lab 3 — Legal Protocol Response Capture Without Scoreboarding"
              accent="violet"
              icon={<FaFlask size={12} />}
            >
              <div className="space-y-3 text-xs text-slate-300">
                <p>
                  <strong>Goal:</strong> Capture protocol response status in the driver and route back via <code>put_response()</code> without performing scoreboarding.
                </p>
                <CodeBlock lang="systemverilog">{`package cmd_rsp_pkg;
  import uvm_pkg::*;
  \`include "uvm_macros.svh"

  typedef enum bit [1:0] {
    CMD_RSP_OK      = 2'b00,
    CMD_RSP_ERR     = 2'b01,
    CMD_RSP_ABORTED = 2'b11
  } cmd_rsp_status_e;

  class cmd_item extends uvm_sequence_item;
    rand bit [31:0] cmd_data;
    cmd_rsp_status_e rsp_status;

    \`uvm_object_utils_begin(cmd_item)
      \`uvm_field_int(cmd_data, UVM_ALL_ON)
      \`uvm_field_enum(cmd_rsp_status_e, rsp_status, UVM_ALL_ON)
    \`uvm_object_utils_end

    function new(string name = "cmd_item");
      super.new(name);
      rsp_status = CMD_RSP_OK;
    endfunction
  endclass

  class cmd_rsp_driver extends uvm_driver #(cmd_item, cmd_item);
    \`uvm_component_utils(cmd_rsp_driver)
    virtual cmd_rsp_if vif;

    function new(string name = "cmd_rsp_driver", uvm_component parent = null);
      super.new(name, parent);
    endfunction

    task run_phase(uvm_phase phase);
      cmd_item req, rsp;
      bit aborted;

      drive_idle();
      forever begin
        wait_reset_release();
        seq_item_port.get_next_item(req);

        rsp = cmd_item::type_id::create("rsp");
        rsp.set_id_info(req);
        rsp.cmd_data = req.cmd_data;

        drive_command(req, aborted);
        if (aborted) rsp.rsp_status = CMD_RSP_ABORTED;
        else begin
          capture_protocol_response(rsp, aborted);
          if (aborted) rsp.rsp_status = CMD_RSP_ABORTED;
        end

        drive_idle();
        seq_item_port.item_done();
        seq_item_port.put_response(rsp);
      end
    endtask
  endclass
endpackage`}</CodeBlock>
              </div>
            </CollapsibleCard>
          </section>

          {/* ── §17 Bug Gallery ─────────────────────────────────────────── */}
          <section id="bug-gallery">
            <SectionHeading num={17} title="Bug Gallery (1–8)" />
            <div className="space-y-4">
              {module13BugGallery.map((bug, idx) => (
                <CollapsibleCard
                  key={idx}
                  title={bug.title}
                  accent="rose"
                  icon={<FaBug size={12} />}
                  defaultOpen={idx < 1}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs space-y-1">
                      <div className="font-bold text-rose-300">Symptom</div>
                      <p className="text-slate-300">{bug.symptom}</p>
                    </div>
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs space-y-1">
                      <div className="font-bold text-amber-300">Waveform Clue</div>
                      <p className="text-slate-300">{bug.waveform}</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 mb-2">
                    <strong>Root Cause:</strong> {bug.cause}
                  </p>

                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-rose-400">
                      ❌ Bad Pattern:
                    </div>
                    <CodeBlock lang="systemverilog">{bug.bad}</CodeBlock>
                    <div className="text-xs font-semibold text-emerald-400">
                      ✅ Correct Pattern:
                    </div>
                    <CodeBlock lang="systemverilog">{bug.fix}</CodeBlock>
                  </div>

                  <Callout type="interview">
                    <strong>Interview Defense:</strong> "{bug.interview}"
                  </Callout>
                </CollapsibleCard>
              ))}
            </div>
          </section>

          {/* ── §18 Race-Condition Checklist ────────────────────────────── */}
          <section id="race-checklist">
            <SectionHeading num={18} title="Race-Condition Checklist" />
            <div className="space-y-2 text-xs text-slate-300">
              {[
                "Driver uses clocking block or disciplined NBA timing",
                "Monitor samples through a stable sampling scheme",
                "Driver does not use blocking assignments on interface pins at raw posedge",
                "Driver cleanup occurs after final required handshake sample",
                "Monitor does not publish during reset",
                "Scoreboard reset policy aligns with driver abort policy",
                "Assertions use correct clock and reset disable",
                "Response object is filled before put_response()",
                "item_done() is not called before required response capture unless architecture is pipelined",
                "Transaction handles are copied/cloned when stored",
              ].map((check, i) => (
                <div key={i} className="flex items-center gap-2">
                  <FaShieldAlt className="text-blue-400 shrink-0" />
                  <span>{check}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ── §19 Debug Instrumentation / Log Strategy ────────────────── */}
          <section id="debug-strategy">
            <SectionHeading
              num={19}
              title="Debug Instrumentation & Log Strategy"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg space-y-1">
                <strong className="text-blue-300">19.1 Driver Logs:</strong>
                <p>Explain execution: Item fetched, Drive started, Wait cycles, Handshake accepted, Response captured, Reset abort.</p>
              </div>
              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg space-y-1">
                <strong className="text-cyan-300">19.2 Monitor Logs:</strong>
                <p>Explain observed facts: Accepted transfer observed, Response phase observed, Partial transaction discarded.</p>
              </div>
              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg space-y-1">
                <strong className="text-rose-300">19.3 Scoreboard Logs:</strong>
                <p>Explain correctness: Expected received, Actual received, Match/mismatch, Queue depth, Reset flush.</p>
              </div>
              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg space-y-1">
                <strong className="text-purple-300">19.4 Assertion Messages:</strong>
                <p>Include rule name, interface instance context, key signal values, and failure meaning.</p>
              </div>
            </div>
          </section>

          {/* ── §20 Monitor / Scoreboard / Assertion Boundary ───────────── */}
          <section id="boundary">
            <SectionHeading
              num={20}
              title="Monitor / Scoreboard / Assertion Boundary"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300">
              <div className="p-3 rounded-xl border border-blue-500/20 bg-slate-900/50 space-y-1">
                <strong className="text-blue-300">Driver vs Monitor:</strong>
                <p>Driver is active and drives DUT inputs. Monitor is passive and observes pins to publish actual transactions.</p>
              </div>
              <div className="p-3 rounded-xl border border-cyan-500/20 bg-slate-900/50 space-y-1">
                <strong className="text-cyan-300">Monitor vs Scoreboard:</strong>
                <p>Monitor observes actual facts from pins. Scoreboard receives expected and actual streams and reports correctness verdicts.</p>
              </div>
              <div className="p-3 rounded-xl border border-purple-500/20 bg-slate-900/50 space-y-1">
                <strong className="text-purple-300">Scoreboard vs Assertion:</strong>
                <p>Scoreboards perform transaction-level expected-vs-actual comparison. Assertions enforce temporal signal laws directly.</p>
              </div>
            </div>
          </section>

          {/* ── §21 Architectural Decision Points ───────────────────────── */}
          <section id="architecture">
            <SectionHeading
              num={21}
              title="Architectural Decision Points"
            />
            <Table
              headers={["Decision", "Options", "Senior Recommendation"]}
              rows={[
                ["Decision 1: Driver Response Capture", "Capture vs Skip", "Capture only when sequence requires response status or routing."],
                ["Decision 2: item_done() Meaning", "Acceptance vs Completion", "Non-pipelined: completion. Pipelined: acceptance + response tracking."],
                ["Decision 3: Timeout Location", "Driver vs SB vs SVA", "Driver: execution liveness. SVA: protocol bounds. SB: missing actuals."],
                ["Decision 4: Driver X Checking", "Warning vs Fatal error", "Warn on X values that affect driver control signals (e.g. ready)."],
                ["Decision 5: Assertion Placement", "Interface vs Bound module", "Interface for pin protocol rules; bound modules for internal DUT rules."],
              ]}
            />
          </section>

          {/* ── §22 Scalability Notes ───────────────────────────────────── */}
          <section id="scalability">
            <SectionHeading num={22} title="Scalability Notes" />
            <div className="space-y-2 text-xs text-slate-300">
              <p>• <strong>Why Discipline Scales:</strong> Drivers remain reusable across projects, scoreboards evolve independently, and triage pinpointing is immediate.</p>
              <p>• <strong>Why Violations Fail:</strong> False passes occur when monitors copy intent; duplicate checks create noise and race-prone behavior.</p>
              <p>• <strong>Multi-Agent Systems:</strong> Each driver owns its interface pins; monitors publish independently; scoreboards handle cross-interface correlation.</p>
            </div>
          </section>

          {/* ── §23 Review Checklist ────────────────────────────────────── */}
          <section id="review-checklist">
            <SectionHeading num={23} title="Review Checklist" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/40 space-y-1 text-slate-300">
                <div>✔ Does the driver drive only DUT inputs?</div>
                <div>✔ Does it sample only protocol-required DUT outputs?</div>
                <div>✔ Does it avoid expected-vs-actual comparison?</div>
                <div>✔ Is every get_next_item() path paired with item_done()?</div>
                <div>✔ Is get() not paired with item_done()?</div>
                <div>✔ Is try_next_item() null-safe?</div>
                <div>✔ Is reset handled while an item is owned?</div>
                <div>✔ Are response objects valid before put_response()?</div>
                <div>✔ Is set_id_info(req) used where response routing matters?</div>
                <div>✔ Is item_done() timing aligned with architecture?</div>
              </div>

              <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/40 space-y-1 text-slate-300">
                <div>✔ Does the monitor observe pins instead of intent?</div>
                <div>✔ Does the scoreboard own correctness verdicts?</div>
                <div>✔ Are temporal protocol laws asserted?</div>
                <div>✔ Are timeout owners explicit?</div>
                <div>✔ Are clocking/race choices defensible?</div>
                <div>✔ Are transaction handles copied when stored?</div>
                <div>✔ Are reset policies aligned across layers?</div>
                <div>✔ Are logs assigned to the correct owner?</div>
                <div>✔ Are boundary exceptions documented?</div>
                <div>✔ Would this driver be reusable in another environment?</div>
              </div>
            </div>
          </section>

          {/* ── §24 Interview Q&A ───────────────────────────────────────── */}
          <section id="interview-qa">
            <SectionHeading num={24} title="Interview Q&A (Q1–Q15)" />
            <div className="space-y-4">
              {module13InterviewQA.map((qa, idx) => (
                <CollapsibleCard
                  key={idx}
                  title={qa.q}
                  accent="blue"
                  icon={<FaQuestionCircle size={12} />}
                  defaultOpen={idx < 2}
                >
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong className="text-emerald-300">Short Answer:</strong>{" "}
                      {qa.short}
                    </p>
                    <p className="text-slate-300 leading-relaxed">
                      <strong className="text-blue-300">Deep Answer:</strong>{" "}
                      {qa.deep}
                    </p>
                    {qa.followup && (
                      <div className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-lg text-xs mt-2">
                        <div className="font-bold text-amber-300">
                          Follow-up: {qa.followup}
                        </div>
                        <div className="text-slate-300 mt-1">{qa.answer}</div>
                      </div>
                    )}
                  </div>
                </CollapsibleCard>
              ))}
            </div>
          </section>

          {/* ── §25 Final Recall Card ───────────────────────────────────── */}
          <section id="final-recall">
            <SectionHeading num={25} title="Final Recall Card" />
            <div className="p-5 rounded-xl border border-blue-500/30 bg-linear-to-r from-blue-500/10 to-indigo-500/10 space-y-3">
              <Callout type="hook">
                <strong>Memory Hook:</strong> "Four owners. Zero confusion."
              </Callout>

              <CodeBlock lang="text">{`Driver     -> legal stimulus
Monitor    -> actual observed transactions
Scoreboard -> expected vs actual comparison
Assertion  -> signal-level temporal law`}</CodeBlock>

              <Callout type="interview">
                <strong>Interview Line:</strong> "I classify every piece of logic by fact ownership before coding it."
              </Callout>
            </div>
          </section>

          {/* ── §26 Key Takeaways ───────────────────────────────────────── */}
          <section id="key-takeaways">
            <SectionHeading num={26} title="Key Takeaways" />
            <ol className="space-y-1.5 list-decimal list-inside text-slate-300 text-sm">
              {[
                "A driver is a stimulus executor.",
                "A driver may sample only protocol-required outputs.",
                "Driver-local checks are legality/liveness guards, not correctness checks.",
                "A monitor observes pins and must not copy sequence intent.",
                "A scoreboard owns expected-vs-actual comparison.",
                "Assertions own temporal signal laws.",
                "get_next_item() must pair with item_done().",
                "get() must not pair with item_done().",
                "try_next_item() requires null handling.",
                "Response routing needs valid response objects and set_id_info(req) when routing matters.",
                "Reset while owning an item must release or respond to that item.",
                "Pipelined drivers must separate request acceptance from response completion.",
                "Clocking discipline prevents driver-monitor races.",
                "Transaction handles must not leak mutable ownership across components.",
                "Boundary discipline is what makes VIP reusable.",
              ].map((takeaway, i) => (
                <li key={i} className="pl-1">
                  {takeaway}
                </li>
              ))}
            </ol>
          </section>

          {/* ── §27 Interview Questions ─────────────────────────────────── */}
          <section id="interview-questions">
            <SectionHeading num={27} title="Interview Questions" />
            <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/40 text-sm text-slate-300 space-y-2">
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Why must a UVM driver not perform functional comparison?</li>
                <li>What DUT outputs may a driver legally sample?</li>
                <li>What is the monitor’s responsibility?</li>
                <li>What is the scoreboard’s responsibility?</li>
                <li>What is the assertion boundary?</li>
                <li>When should item_done() be called in a non-pipelined driver?</li>
                <li>When is early item_done() legal?</li>
                <li>Why is get() not paired with item_done()?</li>
                <li>What must you do after try_next_item()?</li>
                <li>Why does response routing need set_id_info(req)?</li>
                <li>How should reset be handled while a driver owns an item?</li>
                <li>Where should payload-stability checking live?</li>
                <li>Where should end-to-end data mismatch checking live?</li>
                <li>What race occurs when driver and monitor use raw posedge incorrectly?</li>
                <li>How do you decide whether a timeout belongs in driver, scoreboard, or assertion?</li>
              </ol>
            </div>
          </section>

          {/* ── §28 Coding Exercise ─────────────────────────────────────── */}
          <section id="coding-exercise">
            <SectionHeading
              num={28}
              title="Coding Exercise — Refactor Boundary-Violating Request/Response Driver"
            />
            <div className="space-y-4 text-sm text-slate-300">
              <p>
                <strong>Exercise:</strong> Refactor a monolithic driver that currently compares read data and holds items across reset without release.
              </p>
              <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/40 text-xs space-y-2">
                <strong className="text-blue-300">Refactor Requirements:</strong>
                <ol className="list-decimal list-inside space-y-1 text-slate-300">
                  <li>Driver drives request pins only.</li>
                  <li>Driver samples only request completion and protocol response status.</li>
                  <li>Driver creates a fresh response object with <code>set_id_info(req)</code>.</li>
                  <li>Reset releases or aborts the owned item cleanly.</li>
                  <li>Monitor observes actual response data from pins.</li>
                  <li>Scoreboard compares expected response data against observed response data.</li>
                  <li>Assertions check response-valid stability and bounded timing.</li>
                </ol>
              </div>
            </div>
          </section>

          {/* ── §29 Final Readiness Verdict ──────────────────────────────── */}
          <section id="final-verdict">
            <SectionHeading
              num={29}
              title="Final Readiness Verdict"
            />
            <div className="p-6 rounded-2xl border border-blue-500/30 bg-blue-500/10 space-y-3">
              <h3 className="text-lg font-bold text-blue-300 flex items-center gap-2">
                <FaCheckSquare /> Module 13 — Final Readiness Verdict: PASS (LOCKED)
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Module 13: Driver-Monitor-Scoreboard-Assertion Boundary is fully converted into React. All 18 memory cards, 5 atlas sheets, 3 code labs, 8 bug gallery entries, race checklists, and 15 interview Q&amp;As are complete and verified.
              </p>
              <p className="text-xs text-blue-200/80">
                Ready for Module 14: Burst, Packet, and Streaming Drivers.
              </p>
            </div>
          </section>

          {/* Navigation to next module */}
          <ModuleNavigation
            nextPath="/driver-mastery/module14"
            nextTitle="Module 14: Burst, Packet, and Streaming Drivers →"
          />
        </main>
      </div>
    </div>
  );
};

export default Module13;
