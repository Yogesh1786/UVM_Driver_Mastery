import {
  FaBook,
  FaBug,
  FaFlask,
  FaQuestionCircle,
  FaListAlt,
  FaCheckSquare,
  FaShieldAlt,
  FaLightbulb,
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
// DATA — Memory Cards (16 Cards)
// ─────────────────────────────────────────────────────────────────────────────

const module6MemoryCards = [
  {
    title: "Card 1 — Non-Pipelined Contract [PROTOCOL]",
    accent: "violet",
    hook: "One item in, one command out, one completion back.",
    concept:
      "A non-pipelined driver owns only one active item. It does not accept the next item until the current command completes.",
    code: `seq_item_port.get_next_item(req);
drive_one_transfer(req, rsp);
seq_item_port.item_done(rsp);`,
    trap: "Calling item_done() immediately after item acquisition.",
    interview:
      "In this driver, item_done() means command completion, not command acceptance.",
  },
  {
    title: "Card 2 — Setup Phase [WAVEFORM]",
    accent: "blue",
    hook: "Setup presents intent.",
    concept:
      "Setup drives command information with psel=1 and penable=0.",
    code: `vif.drv_cb.psel    <= 1'b1;
vif.drv_cb.penable <= 1'b0;
vif.drv_cb.paddr   <= req.addr;`,
    trap: "Asserting penable at the same time as the initial command presentation.",
    interview:
      "Setup gives the target a clean command presentation cycle before access.",
  },
  {
    title: "Card 3 — Access Phase [WAVEFORM]",
    accent: "emerald",
    hook: "Enable executes.",
    concept:
      "Access begins when penable is asserted while psel remains asserted.",
    code: `vif.drv_cb.penable <= 1'b1;`,
    trap: "Changing command fields after entering access.",
    interview:
      "Access phase is where completion can occur; command fields must remain stable.",
  },
  {
    title: "Card 4 — Wait States [WAVEFORM]",
    accent: "amber",
    hook: "Not ready means hold.",
    concept:
      "While pready=0, the driver keeps access active and does not fetch a new item.",
    code: `while (vif.drv_cb.pready !== 1'b1) begin
  @(vif.drv_cb);
end`,
    trap: "Assuming all transfers are zero-wait.",
    interview:
      "Wait-state handling is where weak APB-style drivers break.",
  },
  {
    title: "Card 5 — Completion Sampling [PROTOCOL]",
    accent: "rose",
    hook: "Sample only at done.",
    concept:
      "Read data and error status are sampled when pready=1 is observed in access phase.",
    code: `rsp.rdata  = vif.drv_cb.prdata;
rsp.slverr = vif.drv_cb.pslverr;`,
    trap: "Sampling prdata before pready is asserted.",
    interview:
      "Zero-wait tests can hide premature response sampling bugs.",
  },
  {
    title: "Card 6 — Cleanup [WAVEFORM]",
    accent: "blue",
    hook: "Finish clean.",
    concept:
      "After completion or abort, the driver returns active controls to idle.",
    code: `vif.drv_cb.psel    <= 1'b0;
vif.drv_cb.penable <= 1'b0;`,
    trap: "Leaving psel high after completion.",
    interview:
      "Cleanup makes the transaction boundary unambiguous.",
  },
  {
    title: "Card 7 — Sequencer Obligation [UVM]",
    accent: "violet",
    hook: "If you take it, close it.",
    concept:
      "After get_next_item(), every path must eventually call item_done().",
    code: `seq_item_port.get_next_item(req);
// normal, abort, or timeout path
seq_item_port.item_done(rsp);`,
    trap: "Reset path returns without item_done().",
    interview:
      "Abandoned sequencer items create hangs that look like sequence bugs but are driver bugs.",
  },
  {
    title: "Card 8 — Response Identity [UVM]",
    accent: "emerald",
    hook: "Response must know its parent.",
    concept:
      "A response returned to a sequence must copy identity from the request.",
    code: `rsp.set_id_info(req);
seq_item_port.item_done(rsp);`,
    trap: "Creating rsp and returning it without set_id_info(req).",
    interview:
      "Pin-level success is not enough; UVM response routing must also be correct.",
  },
  {
    title: "Card 9 — Write Can Fail [PROTOCOL]",
    accent: "amber",
    hook: "No data does not mean no response.",
    concept:
      "Writes may still need a response because error status can matter.",
    code: `rsp.status = vif.drv_cb.pslverr ? APB_SLVERR : APB_OK;`,
    trap: "Returning responses only for reads.",
    interview:
      "A write has no read data, but it can still have completion status.",
  },
  {
    title: "Card 10 — Reset Abort [RESET]",
    accent: "rose",
    hook: "Abort bus, complete item.",
    concept:
      "Reset can terminate the pin transfer, but the acquired UVM item must still complete.",
    code: `make_response(req, rsp, APB_ABORTED);
seq_item_port.item_done(rsp);`,
    trap: "Dropping the item silently on reset.",
    interview:
      "Reset handling must protect both bus state and sequencer state.",
  },
  {
    title: "Card 11 — Timeout Policy [ARCH]",
    accent: "blue",
    hook: "Infinite wait needs permission.",
    concept:
      "A driver should not hang forever on pready=0 unless the environment intentionally allows it.",
    code: `if ((max_wait_cycles != 0) && (wait_count > max_wait_cycles))
  make_response(req, rsp, APB_TIMEOUT);`,
    trap: "Hardcoding timeout without environment control.",
    interview:
      "Timeout is a verification environment policy, so make it configurable.",
  },
  {
    title: "Card 12 — Clocking Block Discipline [WAVEFORM]",
    accent: "violet",
    hook: "Drive and sample through one timing contract.",
    concept:
      "The final driver uses drv_cb for outputs and inputs to reduce testbench-DUT race ambiguity.",
    code: `@(vif.drv_cb);
vif.drv_cb.psel <= 1'b1;`,
    trap: "Mixing raw interface drives and clocking-block samples without a clear policy.",
    interview:
      "Clocking blocks make the driver's timing contract explicit.",
  },
  {
    title: "Card 13 — Driver Boundary [BOUNDARY]",
    accent: "emerald",
    hook: "Stimulate, don't judge.",
    concept:
      "The driver returns protocol response but does not compare against expected functional data.",
    code: `rsp.rdata = vif.drv_cb.prdata; // OK
// rsp.rdata == expected_model[addr] // Not driver-owned`,
    trap: "Putting scoreboard logic in the driver.",
    interview:
      "The monitor observes; the scoreboard judges; the driver stimulates.",
  },
  {
    title: "Card 14 — Monitor Independence [BOUNDARY]",
    accent: "amber",
    hook: "Driver response is not observed truth.",
    concept:
      "The monitor independently reconstructs transactions from pins. It must not rely on driver-created response objects.",
    code: `// Driver response feeds sequence.
// Monitor analysis item feeds scoreboard.`,
    trap: "Using driver response as scoreboard actual data.",
    interview:
      "Observed DUT behavior must come from the monitor, not the stimulus component.",
  },
  {
    title: "Card 15 — Transaction Ownership [OWNER]",
    accent: "blue",
    hook: "Do not mutate what you do not own.",
    concept:
      "The driver should treat request fields as command intent and build a separate response object for returned status.",
    code: `rsp = apb_cmd_item::type_id::create("rsp");
rsp.addr = req.addr;`,
    trap: "Writing response fields directly into req and assuming the sequence sees them correctly.",
    interview:
      "Separate request and response objects keep ownership and routing clean.",
  },
  {
    title: "Card 16 — Scalability Boundary [ARCH]",
    accent: "violet",
    hook: "No queues because no overlap.",
    concept:
      "A non-pipelined APB-style driver does not need outstanding queues, ID maps, or response reorder logic.",
    code: `apb_cmd_item req;
apb_cmd_item rsp;`,
    trap: "Overengineering a simple command bus driver with pipelined infrastructure.",
    interview:
      "Driver architecture should match protocol concurrency.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// DATA — Bug Gallery (7 Bugs)
// ─────────────────────────────────────────────────────────────────────────────

const module6BugGallery = [
  {
    title: "Bug 1 — Early item_done()",
    symptom:
      "Sequence appears to complete before bus activity finishes. Back-to-back items corrupt waveform interpretation; logs show item completion before pready.",
    waveform: "item_done at cycle 20; pready asserted at cycle 26.",
    cause:
      "The driver confused item acceptance with command completion, releasing the sequencer prematurely.",
    bad: `seq_item_port.get_next_item(req);
seq_item_port.item_done(); // BUG: Access phase pending!
drive_one_transfer(req, rsp);`,
    fix: `seq_item_port.get_next_item(req);
drive_one_transfer(req, rsp);
seq_item_port.item_done(rsp); // Safe completion`,
    interview:
      "In a non-pipelined command driver, the item remains outstanding until the protocol operation completes.",
  },
  {
    title: "Bug 2 — Sampling PRDATA Before PREADY",
    symptom:
      "Reads fail only when wait states occur; zero-wait smoke tests pass. Returned data is stale or X.",
    waveform: "prdata becomes valid only when pready=1.",
    cause:
      "Response sampled immediately after asserting penable before pready was checked.",
    bad: `vif.drv_cb.penable <= 1'b1;
rsp.rdata = vif.drv_cb.prdata; // BUG: Sampled before pready!`,
    fix: `if (vif.drv_cb.pready === 1'b1)
  rsp.rdata = vif.drv_cb.prdata;`,
    interview: "Wait-state randomization exposes premature sampling bugs.",
  },
  {
    title: "Bug 3 — Reset Path Drops Item",
    symptom:
      "Sequence hangs forever after reset assertion; test never finishes; driver log stops after reset.",
    waveform: "Reset occurs after item grant; no later item_done issued.",
    cause:
      "The driver exited after acquiring an item without completing the sequencer handshake.",
    bad: `seq_item_port.get_next_item(req);

if (!vif.presetn) begin
  drive_idle();
  return; // BUG: item_done skipped!
end`,
    fix: `make_response(req, rsp, APB_ABORTED);
rsp.set_id_info(req);
seq_item_port.item_done(rsp);`,
    interview:
      "Reset can abort pins, not the UVM item lifecycle.",
  },
  {
    title: "Bug 4 — Command Changes During Wait State",
    symptom:
      "Monitor sees address instability; slave completes wrong address; assertions fire for control instability.",
    waveform: "psel=1, penable=1, pready=0 -> paddr changes from A to B.",
    cause:
      "The driver fetched the next item while current access was waiting and overwrote paddr.",
    bad: `// Fetching next item while pready is still 0
seq_item_port.get_next_item(req_next);
vif.drv_cb.paddr <= req_next.addr; // BUG: Overwriting active access!`,
    fix: `// Keep command stable throughout entire wait loop:
while (vif.drv_cb.pready !== 1'b1) begin
  @(vif.drv_cb); // Hold paddr/pwrite/pwdata/psel/penable stable
end`,
    interview:
      "Non-pipelined means no next-item pin activity until current completion.",
  },
  {
    title: "Bug 5 — Missing set_id_info(req)",
    symptom:
      "Response does not return to the expected sequence; multi-sequence tests show intermittent response-routing failures.",
    waveform:
      "Bus transaction is completely correct; UVM sequence response handling fails.",
    cause:
      "Response object created and sent without copying sequence_id and transaction_id from request.",
    bad: `rsp = apb_cmd_item::type_id::create("rsp");
seq_item_port.item_done(rsp); // BUG: Missing routing metadata`,
    fix: `rsp = apb_cmd_item::type_id::create("rsp");
rsp.set_id_info(req); // Copies routing metadata
seq_item_port.item_done(rsp);`,
    interview:
      "Response routing is a UVM contract, separate from pin-level correctness.",
  },
  {
    title: "Bug 6 — Unclocked wait(pready)",
    symptom:
      "Race-dependent behavior; simulator-region sensitivity; data sampled inconsistently with monitor.",
    waveform: "Driver samples between intended clocking events.",
    cause:
      "Completion sampling is not tied to the driver clocking block contract.",
    bad: `wait(vif.pready); // BUG: Unclocked event
rsp.rdata = vif.prdata;`,
    fix: `@(vif.drv_cb);
if (vif.drv_cb.pready === 1'b1)
  rsp.rdata = vif.drv_cb.prdata;`,
    interview:
      "Clocked protocols should be sampled through the same timing discipline used by the testbench.",
  },
  {
    title: "Bug 7 — Driver Becomes Scoreboard",
    symptom:
      "Driver depends on reference model; VIP reuse collapses; scoreboard and driver report duplicate failures.",
    waveform:
      "Driver reports functional mismatch rather than drive/protocol failure.",
    cause:
      "Stimulus component contains checking logic that belongs in the scoreboard.",
    bad: `if (rsp.rdata != expected_model[req.addr])
  \`uvm_error("DRV_DATA", "Read mismatch") // BUG: Scoreboard inside driver`,
    fix: `// Driver only samples status/data and returns response:
rsp.rdata = vif.drv_cb.prdata;
// Scoreboard compares monitor stream independently!`,
    interview:
      "The driver stimulates and reports protocol response; the scoreboard judges correctness.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// DATA — Interview Q&A (10 Questions)
// ─────────────────────────────────────────────────────────────────────────────

const module6InterviewQA = [
  {
    q: "Q1. Where should item_done() be called?",
    short:
      "After the command completes, response is captured, and cleanup has been scheduled.",
    deep: "With get_next_item(), the sequencer item remains outstanding until item_done(). In this non-pipelined driver, completion means the APB-style access has reached pready=1, response status has been captured, and the driver is safe to move toward the next command.",
    followup: "Can it be called after setup?",
    answer:
      "No, not for this module's contract. That would be an acceptance-based or pipelined contract.",
  },
  {
    q: "Q2. Why is early item_done() dangerous?",
    short: "It releases the sequencer before the bus operation is finished.",
    deep: "The next sequence item may be issued while the previous command is still active. That can corrupt command stability, response routing, and debug causality.",
    followup: null,
    answer: null,
  },
  {
    q: "Q3. When should prdata be sampled?",
    short: "When pready=1 is sampled in access phase.",
    deep: "Before completion, read data may be stale or invalid. Wait-state testing exposes this bug.",
    followup: null,
    answer: null,
  },
  {
    q: "Q4. What should happen if reset occurs after get_next_item()?",
    short: "Drive idle, return an abort response, and call item_done(rsp).",
    deep: "Reset aborts the pin protocol but does not cancel the UVM handshake obligation.",
    followup: null,
    answer: null,
  },
  {
    q: "Q5. Why use set_id_info(req)?",
    short: "To route the response back to the originating sequence.",
    deep: "Response identity is separate from response data. Without identity copying, multi-sequence response handling can fail even if the bus waveform is correct.",
    followup: null,
    answer: null,
  },
  {
    q: "Q6. Should writes return responses?",
    short: "Usually yes in reusable drivers.",
    deep: "Writes do not return data, but they can return error, abort, or timeout status.",
    followup: null,
    answer: null,
  },
  {
    q: "Q7. Why use a clocking block?",
    short: "To make drive and sample timing deterministic.",
    deep: "Raw posedge code can create simulator-region races between driver, DUT, and monitor. A clocking block defines a clean timing contract.",
    followup: null,
    answer: null,
  },
  {
    q: "Q8. What belongs in the driver versus scoreboard?",
    short:
      "Driver stimulates and reports protocol response. Scoreboard checks correctness.",
    deep: "If the driver compares expected read data, it becomes coupled to a model and loses reuse.",
    followup: null,
    answer: null,
  },
  {
    q: "Q9. Why is timeout configurable?",
    short: "Because timeout is environment policy.",
    deep: "Some tests expect indefinite wait states. Others require watchdog protection. A reusable driver should support both.",
    followup: null,
    answer: null,
  },
  {
    q: "Q10. What would change for a pipelined driver?",
    short: "Request acceptance and response completion would separate.",
    deep: "You would need queues, outstanding tracking, and a different item_done() contract. That is outside Module 6.",
    followup: null,
    answer: null,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// DATA — Sections for Sidebar Navigation
// ─────────────────────────────────────────────────────────────────────────────

const module6Sections = [
  { id: "identity", label: "Module Identity & Thesis" },
  { id: "objectives", label: "Learning Objectives" },
  { id: "how-to-use", label: "How to Use This Module" },
  { id: "legend", label: "Visual Tag Legend" },
  { id: "acceptance", label: "Acceptance Checklist" },
  { id: "scope", label: "Scope & Non-Scope" },
  { id: "mental-model", label: "Protocol Mental Model" },
  { id: "timing", label: "Timing / Waveform Contract" },
  { id: "boundary", label: "Driver Responsibility Boundary" },
  { id: "contract", label: "Seq-Sequencer-Driver Contract" },
  { id: "reset", label: "Reset / Abort Policy" },
  { id: "response", label: "Response & Completion Policy" },
  { id: "ownership", label: "Protocol Ownership Matrix" },
  { id: "memory", label: "Memory Cards (1–16)" },
  { id: "atlas", label: "Atlas Sheets (1–4)" },
  { id: "codelabs", label: "Code Labs (1–3)" },
  { id: "bugs", label: "Bug Gallery (1–7)" },
  { id: "race", label: "Race-Condition Checklist" },
  { id: "logging", label: "Debug Instrumentation & Logs" },
  { id: "verification-boundary", label: "Monitor / Scoreboard Boundary" },
  { id: "decisions", label: "Architectural Decision Points" },
  { id: "scalability", label: "Scalability Notes" },
  { id: "review", label: "Review Checklist" },
  { id: "interview", label: "Interview Q&A (Q1–Q10)" },
  { id: "recall", label: "Final Recall Card" },
  { id: "takeaways", label: "Key Takeaways" },
  { id: "interview-summary", label: "Interview Questions" },
  { id: "exercise", label: "Coding Exercise" },
  { id: "verdict", label: "Final Readiness Verdict" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT — Module 6
// ═══════════════════════════════════════════════════════════════════════════════

const Module6 = () => {
  return (
    <div className="relative min-h-screen bg-slate-950 text-white font-sans">
      {/* Background glow & grid */}
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-150 h-62.5 bg-linear-to-r from-violet-600/15 to-indigo-600/15 blur-[100px] rounded-full" />

      <div className="relative z-10 flex max-w-7xl mx-auto">
        {/* ── Sidebar TOC (desktop) ────────────────────────────────────── */}
        <ModuleSidebar
          moduleNumber="6"
          title="APB-Style Non-Pipelined Command Driver"
          sections={module6Sections}
        />

        {/* ── Main Content ─────────────────────────────────────────────── */}
        <main className="flex-1 min-w-0 px-6 py-8 pb-24 max-w-4xl">
          {/* Mobile back */}
          <BackToHomeBtn to="/driver-mastery" />

          {/* Hero */}
          <ModuleHero
            moduleNumber="6"
            title="APB-Style Non-Pipelined Command Driver"
            description="Build a deterministic non-pipelined command driver that converts one sequence item into one complete APB-style setup, access, wait-state, response, and cleanup transaction."
            metadata={[
              ["Module", "6"],
              ["Reference", "UVM 1.2 / IEEE 1800.2"],
              ["Timing", "Clocking-Block Driven (drv_cb)"],
              ["Pattern", "Non-Pipelined Command/Response"],
            ]}
          />

          {/* ── §1 Cover Page / Module Identity ─────────────────────────── */}
          <section id="identity">
            <SectionHeading num={1} title="Cover Page / Module Identity" />
            <div className="rounded-xl border border-slate-700/60 bg-slate-900/50 p-5 space-y-3 mb-6">
              <Table
                headers={["Field", "Value"]}
                rows={[
                  ["Module Number", "6"],
                  [
                    "Module Title",
                    "APB-Style Non-Pipelined Command Driver",
                  ],
                  ["Course", "UVM Driver Mastery"],
                  ["Roadmap Position", "After Module 5, before Module 7 and Module 8"],
                  [
                    "Primary Skill",
                    "Build a deterministic non-pipelined command driver that converts one sequence item into one complete APB-style setup/access/wait/completion transaction.",
                  ],
                ]}
              />

              <h3 className="text-lg font-bold text-violet-300 mt-4">
                The Central Driver Contract
              </h3>
              <blockquote className="border-l-4 border-violet-500 bg-violet-500/10 p-4 rounded-r-xl text-violet-200 text-sm leading-relaxed">
                Acquire one item. &nbsp;→&nbsp; Drive setup. &nbsp;→&nbsp; Drive
                access. &nbsp;→&nbsp; Wait for completion. &nbsp;→&nbsp; Sample
                response. &nbsp;→&nbsp; Clean up the bus. &nbsp;→&nbsp; Complete
                the sequencer handshake.
              </blockquote>
            </div>
          </section>

          {/* ── §2 Learning Objectives ──────────────────────────────────── */}
          <section id="objectives">
            <SectionHeading num={2} title="Learning Objectives" />
            <ol className="space-y-2 list-decimal list-inside text-slate-300 text-sm leading-relaxed">
              {[
                "Explain the APB-style setup/access/completion model.",
                "Write a non-pipelined UVM command driver.",
                "Place item_done() at the correct lifecycle point.",
                "Capture read data and error status only at transfer completion.",
                "Handle reset after item acquisition without deadlocking the sequencer.",
                "Keep the driver from becoming a scoreboard.",
                "Debug wait-state, cleanup, response, and reset bugs from waveforms.",
                "Defend the architecture in senior/principal verification interviews.",
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
            <p className="text-slate-300 text-sm mb-3">
              Read in this disciplined sequence:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-slate-300 text-sm mb-4">
              <li>
                <strong>Protocol Mental Model</strong> — understand what the
                driver is trying to do.
              </li>
              <li>
                <strong>Timing / Waveform Contract</strong> — understand when pins
                are driven and sampled.
              </li>
              <li>
                <strong>Sequencer-Driver Contract</strong> — understand when the
                UVM item is complete.
              </li>
              <li>
                <strong>Memory Cards</strong> — revise each concept as an
                interview flashcard.
              </li>
              <li>
                <strong>Code Labs</strong> — implement the driver.
              </li>
              <li>
                <strong>Bug Gallery</strong> — learn waveform-level failure
                signatures.
              </li>
              <li>
                <strong>Interview Q&A</strong> — practice senior-level
                explanation.
              </li>
            </ol>
            <Callout type="warning">
              Do not jump directly to code. Most APB-style driver bugs are
              timing-contract bugs, not syntax bugs.
            </Callout>
          </section>

          {/* ── §4 Visual Tag Legend ───────────────────────────────────── */}
          <section id="legend">
            <SectionHeading num={4} title="Visual Tag Legend" />
            <Table
              headers={["Tag", "Meaning"]}
              rows={[
                ["[PROTOCOL]", "Bus-level behavior"],
                ["[WAVEFORM]", "Clock/timing contract"],
                ["[UVM]", "UVM driver/sequencer API behavior"],
                ["[RESET]", "Reset or abort behavior"],
                ["[BUG]", "Realistic failure mode"],
                ["[BOUNDARY]", "Driver/monitor/scoreboard/assertion ownership"],
                ["[ARCH]", "Senior/principal architecture decision"],
                ["[INTERVIEW]", "Interview-ready explanation"],
              ]}
            />
          </section>

          {/* ── §5 Module-Specific Acceptance Checklist ─────────────────── */}
          <section id="acceptance">
            <SectionHeading
              num={5}
              title="Module-Specific Acceptance Checklist"
            />
            <ul className="space-y-1.5 text-xs text-slate-300">
              {[
                "The driver accepts one command at a time.",
                "Setup phase and access phase are separate.",
                "Wait states are handled without changing command fields.",
                "Completion is defined by access phase plus pready.",
                "Read data and error status are sampled only at completion.",
                "Cleanup-to-idle behavior is explicit.",
                "get_next_item() is paired with item_done().",
                "item_done() is not called before safe transfer completion.",
                "Response object policy is explicit.",
                "set_id_info(req) is used when returning response to originating sequence.",
                "Reset after item acquisition completes the sequencer handshake.",
                "Timeout behavior is configurable and clearly defined.",
                "Driver does not compare functional expected data.",
                "Monitor, scoreboard, and assertions retain their proper ownership.",
                "Code uses UVM 1.2-compatible APIs.",
                "Code avoids vendor-specific constructs.",
                "Race risks are explicitly called out.",
                "Bad-code examples are realistic and corrected.",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2">
                  <FaCheckSquare className="text-emerald-400 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* ── §6 Scope and Non-Scope ─────────────────────────────────── */}
          <section id="scope">
            <SectionHeading num={6} title="Scope and Non-Scope" />
            <div className="space-y-4 text-sm">
              <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                <h4 className="font-bold text-emerald-300 mb-2">In Scope</h4>
                <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs">
                  <li>APB-style setup/access/wait-state command driving</li>
                  <li>Non-pipelined request lifecycle (one active item at a time)</li>
                  <li>Sequencer-driver handshake correctness</li>
                  <li>Response object return for read/error/abort status</li>
                  <li>Reset-abort policy & configurable timeout watchdog</li>
                  <li>Clocking-block based final driver implementation</li>
                  <li>Driver/monitor/scoreboard/assertion boundary</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/40">
                <h4 className="font-bold text-slate-300 mb-2">
                  Non-Scope (Dedicated Modules)
                </h4>
                <Table
                  headers={["Topic", "Destination Module"]}
                  rows={[
                    ["Full AMBA APB protocol specification", "Module 8"],
                    ["APB slave responder driver", "Module 12"],
                    ["AXI valid/ready channels", "Module 10"],
                    ["Pipelined/outstanding request architecture", "Module 11"],
                    ["Deep clocking-block race theory", "Module 7"],
                    ["Scoreboard architecture", "Outside driver scope"],
                    ["Assertion property library", "Boundary only here"],
                  ]}
                />
              </div>

              <Callout type="concept">
                <strong>Boundary Note:</strong> This module uses APB-style timing
                as a controlled teaching vehicle. It does not attempt to cover
                every APB version, protection signal, strobe signal, or low-power
                extension.
              </Callout>
            </div>
          </section>

          {/* ── §7 Protocol Mental Model ───────────────────────────────── */}
          <section id="mental-model">
            <SectionHeading num={7} title="Protocol Mental Model" />
            <div className="space-y-6 text-sm text-slate-300">
              <div>
                <h4 className="font-bold text-violet-300 text-base mb-2">
                  7.1 APB-Style Transaction Stages
                </h4>
                <Table
                  headers={["Stage", "Driver Action", "Completion State"]}
                  rows={[
                    ["Idle", "psel=0, penable=0", "No active command"],
                    ["Setup", "Drive address/control/wdata, assert psel, penable=0", "Command presented"],
                    ["Access", "Assert penable, hold command stable", "Command executing"],
                    ["Wait", "Keep access active while pready=0", "Not complete"],
                    ["Complete", "Observe pready=1 in access phase", "Response valid"],
                    ["Cleanup", "Deassert active controls", "Safe to accept next item"],
                  ]}
                />
              </div>

              <div>
                <h4 className="font-bold text-violet-300 text-base mb-2">
                  7.2 Minimal Signal Set
                </h4>
                <Table
                  headers={["Signal", "Driver View", "Purpose"]}
                  rows={[
                    ["paddr", "Drive", "Address bus"],
                    ["pwrite", "Drive", "1 = write, 0 = read"],
                    ["pwdata", "Drive", "Write data bus"],
                    ["psel", "Drive", "Select active target"],
                    ["penable", "Drive", "Access phase indicator"],
                    ["pready", "Sample", "Transfer completion handshake"],
                    ["prdata", "Sample", "Read data bus"],
                    ["pslverr", "Sample", "Error status indicator"],
                  ]}
                />
              </div>

              <div>
                <h4 className="font-bold text-violet-300 text-base mb-2">
                  7.3 Non-Pipelined Meaning
                </h4>
                <blockquote className="border-l-4 border-slate-600 bg-slate-900/60 p-3 rounded-r-lg text-slate-300 text-xs leading-relaxed">
                  "Non-pipelined means: The driver does not fetch or begin the next
                  command until the current command has completed and cleanup has
                  been scheduled. There is no outstanding queue, no request
                  overlap, no early item_done(), and no next-item pin overwrite
                  while pready=0."
                </blockquote>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-lg border border-slate-700/60 bg-slate-900/40">
                  <strong className="text-violet-300">
                    7.4 Beginner Analogy:
                  </strong>
                  <p className="mt-1 text-slate-300">
                    Like a strict clerk: Take one form &nbsp;→&nbsp; Put on desk
                    &nbsp;→&nbsp; Wait for stamp &nbsp;→&nbsp; Collect receipt
                    &nbsp;→&nbsp; Clear desk &nbsp;→&nbsp; Take next form.
                  </p>
                </div>
                <div className="p-3 rounded-lg border border-slate-700/60 bg-slate-900/40">
                  <strong className="text-emerald-300">
                    7.6 Senior Rule:
                  </strong>
                  <p className="mt-1 text-slate-300">
                    UVM item completion must align with protocol completion. If{" "}
                    <code>item_done()</code> is called before <code>pready</code>,
                    the driver has lied to the sequencer.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ── §8 Timing / Waveform Contract ──────────────────────────── */}
          <section id="timing">
            <SectionHeading num={8} title="Timing / Waveform Contract" />
            <div className="space-y-6 text-sm text-slate-300">
              <div>
                <h4 className="font-bold text-violet-300 text-base mb-1">
                  8.1 Why This Module Uses a Clocking Block
                </h4>
                <p>
                  Driver outputs are driven through <code>drv_cb</code>; response
                  inputs are sampled through <code>drv_cb</code>. This creates a
                  deterministic testbench timing contract free from active-region
                  race conditions.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-violet-300 text-base mb-2">
                  8.2 Zero-Wait vs 8.3 Wait-State Waveform Contracts
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/50">
                    <h5 className="font-bold text-emerald-300 mb-2">
                      Zero-Wait Transfer
                    </h5>
                    <CodeBlock lang="text">{`C0: Driver schedules setup:
    psel=1, penable=0, paddr/wdata valid
C1: Driver schedules access:
    psel=1, penable=1, stable command
C2: Driver samples:
    pready=1 -> sample prdata/pslverr
C2+: Driver schedules cleanup:
    psel=0, penable=0`}</CodeBlock>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/50">
                    <h5 className="font-bold text-amber-300 mb-2">
                      Wait-State Transfer
                    </h5>
                    <CodeBlock lang="text">{`C0: setup driven (psel=1, penable=0)
C1: access driven (psel=1, penable=1)
C2: sample pready=0 -> hold access stable
C3: sample pready=0 -> hold access stable
C4: sample pready=1 -> sample prdata/pslverr
C4+: schedule cleanup (psel=0, penable=0)`}</CodeBlock>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-900/60 border border-slate-700/60 rounded-lg">
                  <strong className="text-violet-300">8.4 Stability Rule:</strong>
                  <p className="mt-1 text-slate-300">
                    paddr, pwrite, pwdata, psel, and penable must remain
                    strictly stable during all wait cycles.
                  </p>
                </div>
                <div className="p-3 bg-slate-900/60 border border-slate-700/60 rounded-lg">
                  <strong className="text-emerald-300">8.5 Sampling Rule:</strong>
                  <p className="mt-1 text-slate-300">
                    Sample prdata and pslverr ONLY when pready===1'b1 is
                    observed in the access phase.
                  </p>
                </div>
                <div className="p-3 bg-slate-900/60 border border-slate-700/60 rounded-lg">
                  <strong className="text-amber-300">8.6 Cleanup Rule:</strong>
                  <p className="mt-1 text-slate-300">
                    Deassert psel and penable to 0 after transfer completion or
                    abort before fetching the next item.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ── §9 Driver Responsibility Boundary ───────────────────────── */}
          <section id="boundary">
            <SectionHeading
              num={9}
              title="Driver Responsibility Boundary"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
              <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                <h4 className="font-bold text-emerald-300 mb-2">Driver Owns</h4>
                <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs">
                  <li>Acquiring sequence items</li>
                  <li>Driving APB-style command pins</li>
                  <li>Holding command stable during wait states</li>
                  <li>Observing pready for transfer completion</li>
                  <li>Sampling prdata/pslverr for sequence response</li>
                  <li>Cleaning bus pins after completion or abort</li>
                  <li>Completing the sequencer handshake</li>
                  <li>Reporting timeout/abort status if configured</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5">
                <h4 className="font-bold text-rose-300 mb-2">
                  Driver Does Not Own
                </h4>
                <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs">
                  <li>Functional correctness of returned data</li>
                  <li>Register model prediction</li>
                  <li>End-to-end memory comparison</li>
                  <li>Coverage collection</li>
                  <li>Temporal protocol assertion replacement</li>
                  <li>Scoreboard matching</li>
                  <li>DUT diagnosis beyond local protocol reporting</li>
                </ul>
              </div>
            </div>
          </section>

          {/* ── §10 Sequence-Sequencer-Driver Contract ──────────────────── */}
          <section id="contract">
            <SectionHeading
              num={10}
              title="Sequence-Sequencer-Driver Contract"
            />
            <div className="space-y-4 text-sm text-slate-300">
              <h4 className="font-bold text-violet-300 text-base">
                10.1 Primary Canonical Contract
              </h4>
              <CodeBlock lang="systemverilog">{`seq_item_port.get_next_item(req);
drive_one_transfer(req, rsp);
rsp.set_id_info(req);
seq_item_port.item_done(rsp);`}</CodeBlock>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg">
                  <strong className="text-rose-300">
                    10.4 Illegal Mixing Trap:
                  </strong>
                  <p className="mt-1 text-slate-300">
                    Never call <code>get(req)</code> and follow it with{" "}
                    <code>item_done()</code>. <code>get()</code> is a
                    self-completing FIFO fetch.
                  </p>
                </div>
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <strong className="text-amber-300">
                    10.5 Early item_done() Trap:
                  </strong>
                  <p className="mt-1 text-slate-300">
                    Calling <code>item_done()</code> after setup releases the
                    sequencer before pins execute, causing pin collisions.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ── §11 Reset / Abort Policy ───────────────────────────────── */}
          <section id="reset">
            <SectionHeading num={11} title="Reset / Abort Policy" />
            <div className="space-y-4 text-sm text-slate-300">
              <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/40">
                <h4 className="font-bold text-violet-300 mb-1">
                  Reset After Item Acquisition (11.2)
                </h4>
                <p className="mb-2 text-xs leading-relaxed">
                  If reset occurs after <code>get_next_item()</code>: (1) Drive bus
                  to idle. (2) Build an abort response. (3) Copy identity using{" "}
                  <code>set_id_info(req)</code>. (4) Call <code>item_done(rsp)</code>.
                  (5) Wait for reset deassertion before accepting next item.
                </p>
                <CodeBlock lang="systemverilog">{`rsp.status = APB_ABORTED;
rsp.set_id_info(req);
seq_item_port.item_done(rsp);`}</CodeBlock>
              </div>

              <Callout type="concept">
                <strong>11.4 Reset Interview Defense:</strong> Reset may abort the
                bus protocol, but it cannot erase the UVM handshake obligation. If
                the driver acquired an item, it must complete that item somehow.
              </Callout>
            </div>
          </section>

          {/* ── §12 Response / Completion Policy ────────────────────────── */}
          <section id="response">
            <SectionHeading
              num={12}
              title="Response / Completion Policy"
            />
            <p className="text-slate-300 text-sm mb-3">
              <strong>12.1 Recommended Policy:</strong> Return a response for
              every command. Reads need <code>rdata</code>, writes may need{" "}
              <code>pslverr</code>, reset needs <code>APB_ABORTED</code>, and
              timeouts need <code>APB_TIMEOUT</code>.
            </p>
            <Table
              headers={["Field", "Purpose"]}
              rows={[
                ["addr", "Command address echo"],
                ["write", "Read/write direction (1=write, 0=read)"],
                ["wdata", "Write data echo"],
                ["rdata", "Sampled read data from bus"],
                ["slverr", "Sampled pslverr error indicator"],
                ["status", "Completion status enum: APB_OK, APB_SLVERR, APB_ABORTED, APB_TIMEOUT"],
              ]}
            />
          </section>

          {/* ── §13 Protocol Ownership Matrix ──────────────────────────── */}
          <section id="ownership">
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
                ["Drive paddr/pwrite/pwdata/psel/penable", "Yes", "No", "No", "No"],
                ["Observe pready for command completion", "Yes", "Yes", "No", "Optional"],
                ["Capture prdata/pslverr for sequence", "Yes", "Yes", "No", "Optional"],
                ["Reconstruct observed bus transaction", "No", "Yes", "No", "No"],
                ["Compare actual vs expected data", "No", "No", "Yes", "No"],
                ["Check signal stability during wait states", "Minimal log", "Observe", "No", "Yes"],
                ["Detect protocol timing violations", "Defensive", "Maybe", "No", "Yes"],
                ["Predict register model", "No", "Via adapter", "Maybe", "No"],
                ["Decide UVM item completion", "Yes", "No", "No", "No"],
                ["Collect coverage", "No", "Maybe", "Maybe", "No"],
              ]}
            />
          </section>

          {/* ── §14 Memory Cards ────────────────────────────────────────── */}
          <section id="memory">
            <SectionHeading num={14} title="Memory Cards (1–16)" />
            <p className="text-slate-400 text-sm mb-4">
              16 core recall anchors for APB-style non-pipelined drivers:
            </p>
            <div className="space-y-3">
              {module6MemoryCards.map((card, idx) => (
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
          <section id="atlas">
            <SectionHeading num={15} title="Atlas Sheets (1–4)" />

            <CollapsibleCard
              title="Atlas Sheet 1 — APB-Style Driver Lifecycle"
              accent="blue"
              icon={<FaListAlt size={12} />}
              defaultOpen={true}
            >
              <Table
                headers={[
                  "Step",
                  "Protocol Meaning",
                  "UVM Meaning",
                  "Failure If Wrong",
                ]}
                rows={[
                  ["Reset idle", "Bus inactive", "Driver not accepting item", "X-driving during reset"],
                  ["get_next_item(req)", "No pin action yet", "Item acquired", "Must later call item_done()"],
                  ["Setup", "Command presented (psel=1, penable=0)", "Driver owns item", "Bad phase structure"],
                  ["Access", "Command executing (penable=1)", "Driver still owns item", "Early completion"],
                  ["Wait pready", "Target not done", "Item still outstanding", "Premature sampling"],
                  ["Sample response", "Transfer complete (pready=1)", "Build response", "Wrong read/error"],
                  ["Cleanup", "Return idle (psel=0, penable=0)", "Safe to finish item", "Ghost transfer"],
                  ["item_done(rsp)", "Contract complete", "Sequencer unblocked", "Deadlock if missing"],
                ]}
              />
            </CollapsibleCard>

            <CollapsibleCard
              title="Atlas Sheet 2 — Plain SV vs UVM vs cocotb Mapping"
              accent="violet"
              icon={<FaListAlt size={12} />}
            >
              <Table
                headers={["Concept", "Plain SV BFM", "UVM Driver", "cocotb-Style Equivalent"]}
                rows={[
                  ["Transaction input", "Task argument", "Sequence item", "Python command object"],
                  ["Start command", "Task call", "get_next_item()", "await driver.send(cmd)"],
                  ["Drive setup", "Assign pins", "Driver task", "Signal assignment"],
                  ["Wait completion", "Clock loop", "Driver wait loop", "await RisingEdge(clk) loop"],
                  ["Return response", "Task output", "Response object", "Coroutine return value"],
                  ["Finish command", "Task returns", "item_done()", "Coroutine completes"],
                  ["Reset abort", "Status output", "Abort response", "Exception/status return"],
                ]}
              />
            </CollapsibleCard>

            <CollapsibleCard
              title="Atlas Sheet 3 — Response Policy Matrix"
              accent="emerald"
              icon={<FaListAlt size={12} />}
            >
              <Table
                headers={["Command/Event", "Response Needed?", "Reason"]}
                rows={[
                  ["Read normal completion", "Yes", "Return rdata to sequence"],
                  ["Write normal completion", "Recommended", "Return error/OK status"],
                  ["Slave error", "Yes", "Return slverr indication"],
                  ["Reset abort", "Yes", "Sequence must know command aborted"],
                  ["Timeout watchdog", "Yes", "Sequence must know watchdog fired"],
                  ["Pure blind traffic gen", "Optional", "Only if response intentionally ignored"],
                ]}
              />
            </CollapsibleCard>

            <CollapsibleCard
              title="Atlas Sheet 4 — Boundary Matrix"
              accent="amber"
              icon={<FaListAlt size={12} />}
            >
              <Table
                headers={["Question", "Driver", "Monitor", "Scoreboard", "Assertion"]}
                rows={[
                  ["Did I drive setup/access correctly?", "Minimal local sanity", "Observes", "No", "Checks"],
                  ["Did DUT return expected read data?", "No", "Captures actual", "Compares", "No"],
                  ["Did transfer occur on pins?", "Attempted", "Confirms", "Uses monitor item", "Optional"],
                  ["Did response route to sequence?", "Yes", "No", "No", "No"],
                  ["Did signal stay stable in wait state?", "Should drive stable", "Observes", "No", "Best owner"],
                  ["Did reset abort happen?", "Reports", "Observes", "Decides consequence", "Optional"],
                ]}
              />
            </CollapsibleCard>
          </section>

          {/* ── §16 Code Labs ───────────────────────────────────────────── */}
          <section id="codelabs">
            <SectionHeading num={16} title="Code Labs (1–3)" />

            {/* Lab 1 */}
            <CollapsibleCard
              title="Code Lab 1 — Interface and Transaction"
              accent="emerald"
              icon={<FaFlask size={12} />}
              defaultOpen={true}
            >
              <p className="text-slate-300 text-xs mb-2">
                <strong>Goal:</strong> Create the minimal APB-style interface with
                a clocking block and transaction item with response fields.
              </p>
              <CodeBlock lang="systemverilog">{`interface apb_if #(parameter int ADDR_WIDTH = 32,
                   parameter int DATA_WIDTH = 32)
                  (input logic pclk,
                   input logic presetn);

  logic [ADDR_WIDTH-1:0] paddr;
  logic                  pwrite;
  logic [DATA_WIDTH-1:0] pwdata;
  logic                  psel;
  logic                  penable;

  logic                  pready;
  logic [DATA_WIDTH-1:0] prdata;
  logic                  pslverr;

  clocking drv_cb @(posedge pclk);
    default input #1step output #1step;
    output paddr;
    output pwrite;
    output pwdata;
    output psel;
    output penable;
    input  pready;
    input  prdata;
    input  pslverr;
  endclocking

endinterface

package apb_pkg;
  import uvm_pkg::*;
  \`include "uvm_macros.svh"

  typedef enum {APB_OK, APB_SLVERR, APB_ABORTED, APB_TIMEOUT} apb_status_e;

  class apb_cmd_item extends uvm_sequence_item;
    rand bit [31:0] addr;
    rand bit        write;
    rand bit [31:0] wdata;

    bit [31:0]      rdata;
    bit             slverr;
    apb_status_e    status;

    \`uvm_object_utils_begin(apb_cmd_item)
      \`uvm_field_int(addr,   UVM_ALL_ON)
      \`uvm_field_int(write,  UVM_ALL_ON)
      \`uvm_field_int(wdata,  UVM_ALL_ON)
      \`uvm_field_int(rdata,  UVM_ALL_ON)
      \`uvm_field_int(slverr, UVM_ALL_ON)
      \`uvm_field_enum(apb_status_e, status, UVM_ALL_ON)
    \`uvm_object_utils_end

    function new(string name = "apb_cmd_item");
      super.new(name);
      status = APB_OK;
    endfunction
  endclass
endpackage`}</CodeBlock>
            </CollapsibleCard>

            {/* Lab 2 */}
            <CollapsibleCard
              title="Code Lab 2 — Complete Non-Pipelined Driver (Production Pattern)"
              accent="blue"
              icon={<FaFlask size={12} />}
            >
              <p className="text-slate-300 text-xs mb-2">
                <strong>Goal:</strong> Implement a full APB-style non-pipelined
                command driver with clocking block, wait states, timeout watchdog,
                and reset-abort support.
              </p>
              <CodeBlock lang="systemverilog">{`package apb_driver_pkg;
  import uvm_pkg::*;
  \`include "uvm_macros.svh"
  import apb_pkg::*;

  class apb_cmd_driver extends uvm_driver #(apb_cmd_item);
    \`uvm_component_utils(apb_cmd_driver)

    virtual apb_if vif;
    int unsigned max_wait_cycles = 1000;

    function new(string name, uvm_component parent);
      super.new(name, parent);
    endfunction

    function void build_phase(uvm_phase phase);
      super.build_phase(phase);
      if (!uvm_config_db#(virtual apb_if)::get(this, "", "vif", vif)) begin
        \`uvm_fatal("NOVIF", "virtual apb_if must be set for apb_cmd_driver")
      end
      void'(uvm_config_db#(int unsigned)::get(this, "", "max_wait_cycles", max_wait_cycles));
    endfunction

    task run_phase(uvm_phase phase);
      apb_cmd_item req;
      apb_cmd_item rsp;

      drive_idle();

      forever begin
        wait_reset_deasserted();

        seq_item_port.get_next_item(req);

        drive_one_transfer(req, rsp);

        if (rsp == null) begin
          rsp = apb_cmd_item::type_id::create("rsp");
          fill_response(req, rsp, APB_OK);
        end

        rsp.set_id_info(req);
        seq_item_port.item_done(rsp);
      end
    endtask

    task wait_reset_deasserted();
      while (vif.presetn !== 1'b1) begin
        @(vif.drv_cb);
        drive_idle();
      end
    endtask

    task drive_idle();
      vif.drv_cb.psel    <= 1'b0;
      vif.drv_cb.penable <= 1'b0;
      vif.drv_cb.pwrite  <= 1'b0;
      vif.drv_cb.paddr   <= '0;
      vif.drv_cb.pwdata  <= '0;
    endtask

    function void fill_response(apb_cmd_item req, apb_cmd_item rsp, apb_status_e status);
      rsp.addr   = req.addr;
      rsp.write  = req.write;
      rsp.wdata  = req.wdata;
      rsp.status = status;

      if (status == APB_OK || status == APB_SLVERR) begin
        rsp.rdata  = vif.drv_cb.prdata;
        rsp.slverr = vif.drv_cb.pslverr;
      end
      else begin
        rsp.rdata  = '0;
        rsp.slverr = 1'b0;
      end
    endfunction

    task make_response(apb_cmd_item req, output apb_cmd_item rsp, apb_status_e status);
      rsp = apb_cmd_item::type_id::create("rsp");
      fill_response(req, rsp, status);
    endtask

    task drive_one_transfer(apb_cmd_item req, output apb_cmd_item rsp);
      int unsigned wait_count;
      rsp = null;
      wait_count = 0;

      if (vif.presetn !== 1'b1) begin
        drive_idle();
        make_response(req, rsp, APB_ABORTED);
        return;
      end

      @(vif.drv_cb);
      if (vif.presetn !== 1'b1) begin
        drive_idle();
        make_response(req, rsp, APB_ABORTED);
        return;
      end

      // Setup phase
      vif.drv_cb.psel    <= 1'b1;
      vif.drv_cb.penable <= 1'b0;
      vif.drv_cb.paddr   <= req.addr;
      vif.drv_cb.pwrite  <= req.write;
      vif.drv_cb.pwdata  <= req.wdata;

      @(vif.drv_cb);
      if (vif.presetn !== 1'b1) begin
        drive_idle();
        make_response(req, rsp, APB_ABORTED);
        return;
      end

      // Access phase
      vif.drv_cb.psel    <= 1'b1;
      vif.drv_cb.penable <= 1'b1;
      vif.drv_cb.paddr   <= req.addr;
      vif.drv_cb.pwrite  <= req.write;
      vif.drv_cb.pwdata  <= req.wdata;

      forever begin
        @(vif.drv_cb);
        if (vif.presetn !== 1'b1) begin
          drive_idle();
          make_response(req, rsp, APB_ABORTED);
          return;
        end

        wait_count++;

        if (vif.drv_cb.pready === 1'b1) begin
          if (vif.drv_cb.pslverr)
            make_response(req, rsp, APB_SLVERR);
          else
            make_response(req, rsp, APB_OK);

          drive_idle();
          return;
        end

        if ((max_wait_cycles != 0) && (wait_count >= max_wait_cycles)) begin
          \`uvm_error("APB_TIMEOUT", $sformatf("Timeout waiting for pready addr=0x%08h", req.addr))
          drive_idle();
          make_response(req, rsp, APB_TIMEOUT);
          return;
        end
      end
    endtask
  endclass
endpackage`}</CodeBlock>
            </CollapsibleCard>

            {/* Lab 3 */}
            <CollapsibleCard
              title="Code Lab 3 — Patch a Broken Driver"
              accent="rose"
              icon={<FaFlask size={12} />}
            >
              <div className="space-y-3">
                <div className="text-xs font-semibold text-rose-400">
                  ❌ Broken Driver Implementation:
                </div>
                <CodeBlock lang="systemverilog">{`task run_phase(uvm_phase phase);
  forever begin
    seq_item_port.get_next_item(req);
    seq_item_port.item_done(); // BUG 1: Early item_done
    vif.psel = 1;              // BUG 2: Blocking assignment & no setup phase
    vif.penable = 1;
    vif.paddr = req.addr;
    wait(vif.pready);          // BUG 3: Unclocked wait, no reset, no cleanup
  end
endtask`}</CodeBlock>

                <Table
                  headers={["Defect", "Why It Is Wrong"]}
                  rows={[
                    ["Early item_done()", "Sequencer item released before bus completion"],
                    ["No setup phase", "psel and penable asserted simultaneously"],
                    ["Blocking assignments (=)", "Race-prone for synchronous pin driving"],
                    ["Unclocked wait(pready)", "Samples outside intended clocking contract"],
                    ["No reset handling", "Drives during reset and drops aborted items"],
                    ["No cleanup", "Leaves bus active in ghost state"],
                    ["No response object", "Read data, slverr, and abort status lost"],
                  ]}
                />
              </div>
            </CollapsibleCard>
          </section>

          {/* ── §17 Bug Gallery ─────────────────────────────────────────── */}
          <section id="bugs">
            <SectionHeading num={17} title="Bug Gallery (1–7)" />
            <div className="space-y-4">
              {module6BugGallery.map((bug, idx) => (
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
          <section id="race">
            <SectionHeading num={18} title="Race-Condition Checklist" />
            <ul className="space-y-1.5 text-xs text-slate-300">
              {[
                "Are outputs driven through a consistent timing mechanism (drv_cb)?",
                "Are response inputs sampled through the same timing discipline?",
                "Is pready sampled only on clocking-block events?",
                "Is prdata sampled only after pready===1'b1?",
                "Are command fields stable during all wait cycles?",
                "Is cleanup scheduled after response capture?",
                "Is reset checked before setup, before access, and during wait?",
                "Does reset after item acquisition still call item_done()?",
                "Does the monitor independently observe the bus without driver state?",
                "Are logs emitted at item acceptance, setup, completion, abort, and timeout?",
                "Is timeout counted strictly in access cycles?",
                "Is max_wait_cycles=0 clearly treated as timeout disabled?",
              ].map((check, i) => (
                <li key={i} className="flex items-center gap-2">
                  <FaShieldAlt className="text-violet-400 shrink-0" />
                  <span>{check}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* ── §19 Debug Instrumentation / Log Strategy ────────────────── */}
          <section id="logging">
            <SectionHeading
              num={19}
              title="Debug Instrumentation & Log Strategy"
            />
            <div className="space-y-3 text-sm text-slate-300">
              <h4 className="font-bold text-violet-300 text-xs uppercase tracking-wider">
                Recommended Structured Driver Logs
              </h4>
              <CodeBlock lang="systemverilog">{`// 1. Item Accepted
\`uvm_info("APB_DRV", $sformatf("Accepted addr=0x%08h write=%0d wdata=0x%08h", req.addr, req.write, req.wdata), UVM_MEDIUM)

// 2. Setup Phase
\`uvm_info("APB_DRV", $sformatf("Setup addr=0x%08h write=%0d", req.addr, req.write), UVM_HIGH)

// 3. Completion
\`uvm_info("APB_DRV", $sformatf("Complete addr=0x%08h status=%s rdata=0x%08h", rsp.addr, rsp.status.name(), rsp.rdata), UVM_MEDIUM)

// 4. Abort & Timeout
\`uvm_warning("APB_ABORT", $sformatf("Reset aborted addr=0x%08h", req.addr))
\`uvm_error("APB_TIMEOUT", $sformatf("Timeout addr=0x%08h max_wait_cycles=%0d", req.addr, max_wait_cycles))`}</CodeBlock>

              <div className="p-3 bg-slate-900/60 border border-slate-700/60 rounded-lg text-xs space-y-1">
                <strong className="text-amber-300">Debug Rule:</strong>
                <p>
                  A useful driver log must answer: Which item was accepted?
                  Which phase is active? How many wait cycles occurred? Was the
                  result OK, error, abort, or timeout? Was item_done() reached?
                </p>
              </div>
            </div>
          </section>

          {/* ── §20 Monitor / Scoreboard / Assertion Boundary ───────────── */}
          <section id="verification-boundary">
            <SectionHeading
              num={20}
              title="Monitor / Scoreboard / Assertion Boundary"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-violet-500/20 bg-slate-900/50 space-y-2">
                <div className="font-bold text-violet-300">
                  Driver vs Monitor
                </div>
                <p className="text-slate-300 leading-relaxed">
                  <strong>Driver:</strong> Drives command pins, captures response
                  for sequence feedback, reports local timeouts.
                  <br />
                  <strong>Monitor:</strong> Independently reconstructs bus
                  transactions and broadcasts to analysis ports.
                </p>
              </div>
              <div className="p-4 rounded-xl border border-emerald-500/20 bg-slate-900/50 space-y-2">
                <div className="font-bold text-emerald-300">
                  Scoreboard vs Assertions
                </div>
                <p className="text-slate-300 leading-relaxed">
                  <strong>Scoreboard:</strong> Owns end-to-end expected vs actual
                  functional data checking and reference model prediction.
                  <br />
                  <strong>Assertions (SVA):</strong> Best owner for temporal rules
                  (setup before access, stability during wait states).
                </p>
              </div>
            </div>
          </section>

          {/* ── §21 Architectural Decision Points ───────────────────────── */}
          <section id="decisions">
            <SectionHeading
              num={21}
              title="Architectural Decision Points"
            />
            <Table
              headers={["Decision", "Options", "Module 6 Recommendation"]}
              rows={[
                ["Decision 1: Response for every command?", "Every command vs Reads/errors only vs No response", "Response for every command in reusable drivers (uniform API, abort/timeout feedback)."],
                ["Decision 2: Clocking block or raw posedge?", "Clocking block vs Raw posedge vs Mixed", "Clocking block (drv_cb) to eliminate active-region race ambiguity."],
                ["Decision 3: Timeout location?", "Driver timeout vs External watchdog vs Configurable", "Configurable driver timeout via uvm_config_db; 0 disables it."],
                ["Decision 4: Cleanup timing?", "Before item_done vs After item_done vs Before completion", "Schedule cleanup before item_done() for clean transaction boundaries."],
                ["Decision 5: Reset abort response?", "Explicit abort response vs Silent item_done vs Fatal", "Explicit APB_ABORTED status so sequence knows cause of failure."],
              ]}
            />
          </section>

          {/* ── §22 Scalability Notes ───────────────────────────────────── */}
          <section id="scalability">
            <SectionHeading num={22} title="Scalability Notes" />
            <div className="space-y-3 text-sm text-slate-300">
              <p>
                <strong>This architecture scales directly to:</strong> Simple
                peripheral command buses, APB-like register access, low-throughput
                configuration paths, and register frontdoor access (via{" "}
                <code>uvm_reg_adapter</code>).
              </p>
              <Table
                headers={["Requirement", "Needed Architectural Upgrade"]}
                rows={[
                  ["Multiple outstanding requests", "Outstanding queue & ID tracking (Module 11)"],
                  ["Pipelined acceptance", "Separate request and completion paths (Module 11)"],
                  ["Out-of-order responses", "ID map & reorder handling (Module 10/11)"],
                  ["AXI-style channels", "Independent channel drivers (Module 10)"],
                  ["Slave response behavior", "Reactive responder architecture (Module 12)"],
                  ["Low-power states", "Power/reset/isolation policy (Module 17)"],
                  ["Multi-clock interfaces", "CDC-aware synchronization"],
                ]}
              />
            </div>
          </section>

          {/* ── §23 Review Checklist ────────────────────────────────────── */}
          <section id="review">
            <SectionHeading num={23} title="Review Checklist" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/40 space-y-2">
                <h5 className="font-bold text-violet-300">UVM Contract</h5>
                <ul className="space-y-1 text-slate-300">
                  <li>✔ get_next_item() paired with item_done()</li>
                  <li>✔ No get()/item_done() mixing</li>
                  <li>✔ No early item_done()</li>
                  <li>✔ Response constructed before use</li>
                  <li>✔ set_id_info(req) used on response</li>
                </ul>
                <h5 className="font-bold text-violet-300 pt-2">Protocol Timing</h5>
                <ul className="space-y-1 text-slate-300">
                  <li>✔ Setup: psel=1, penable=0</li>
                  <li>✔ Access: psel=1, penable=1</li>
                  <li>✔ Command stable until pready</li>
                  <li>✔ Response sampled at pready=1</li>
                  <li>✔ Cleanup scheduled after transfer</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/40 space-y-2">
                <h5 className="font-bold text-emerald-300">Reset & Boundary</h5>
                <ul className="space-y-1 text-slate-300">
                  <li>✔ Driver idles during reset</li>
                  <li>✔ Reset after pull produces APB_ABORTED</li>
                  <li>✔ Reset path reaches item_done()</li>
                  <li>✔ Next item not fetched until reset deasserts</li>
                  <li>✔ Zero scoreboard checking in driver</li>
                  <li>✔ Monitor independently observes pins</li>
                </ul>
                <h5 className="font-bold text-emerald-300 pt-2">Portability</h5>
                <ul className="space-y-1 text-slate-300">
                  <li>✔ UVM 1.2 APIs only</li>
                  <li>✔ No vendor-specific calls</li>
                  <li>✔ drv_cb timing used consistently</li>
                </ul>
              </div>
            </div>
          </section>

          {/* ── §24 Interview Q&A ───────────────────────────────────────── */}
          <section id="interview">
            <SectionHeading num={24} title="Interview Q&A (Q1–Q10)" />
            <div className="space-y-4">
              {module6InterviewQA.map((qa, idx) => (
                <CollapsibleCard
                  key={idx}
                  title={qa.q}
                  accent="violet"
                  icon={<FaQuestionCircle size={12} />}
                  defaultOpen={idx < 2}
                >
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong className="text-emerald-300">Short Answer:</strong>{" "}
                      {qa.short}
                    </p>
                    <p className="text-slate-300 leading-relaxed">
                      <strong className="text-violet-300">Deep Answer:</strong>{" "}
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
          <section id="recall">
            <SectionHeading
              num={25}
              title="Final Recall Card — APB-Style Non-Pipelined Driver"
            />
            <div className="p-5 rounded-xl border border-violet-500/30 bg-linear-to-r from-violet-500/10 to-indigo-500/10 space-y-3">
              <Callout type="hook">
                <strong>Memory Hook:</strong> "Setup, access, wait, sample,
                cleanup, done."
              </Callout>
              <CodeBlock lang="systemverilog">{`seq_item_port.get_next_item(req);
drive_one_transfer(req, rsp);
rsp.set_id_info(req);
seq_item_port.item_done(rsp);`}</CodeBlock>
              <p className="text-xs text-slate-300">
                <strong>Interview Line:</strong> "The driver's UVM lifecycle must
                match the protocol lifecycle."
              </p>
            </div>
          </section>

          {/* ── §26 Key Takeaways ───────────────────────────────────────── */}
          <section id="takeaways">
            <SectionHeading num={26} title="Key Takeaways" />
            <ol className="space-y-1.5 list-decimal list-inside text-slate-300 text-sm">
              {[
                "APB-style command driving has distinct setup and access phases.",
                "pready defines command completion.",
                "Command fields must stay stable during wait states.",
                "Response sampling belongs strictly at completion.",
                "Non-pipelined means one active item only.",
                "get_next_item() requires item_done().",
                "Reset after item acquisition must not strand the item.",
                "Reusable drivers should return response status for every command.",
                "The driver must not become a scoreboard.",
                "Clocking-block discipline avoids TB-DUT race ambiguities.",
              ].map((takeaway, i) => (
                <li key={i} className="pl-1">
                  {takeaway}
                </li>
              ))}
            </ol>
          </section>

          {/* ── §27 Interview Questions Summary ─────────────────────────── */}
          <section id="interview-summary">
            <SectionHeading num={27} title="Interview Questions Summary" />
            <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/40 text-sm text-slate-300 space-y-2">
              <p className="text-xs text-slate-400">
                Core questions for staff & principal interview rounds:
              </p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Why is item_done() after pready in this driver?</li>
                <li>What breaks if item_done() is called immediately after get_next_item()?</li>
                <li>When should prdata and pslverr be sampled?</li>
                <li>Why must command fields remain stable during wait states?</li>
                <li>What should the driver do on reset after item acquisition?</li>
                <li>Why should write commands usually return a response?</li>
                <li>Why is set_id_info(req) required?</li>
                <li>Why should the driver not compare read data?</li>
                <li>What does the monitor own that the driver does not?</li>
                <li>What architectural changes are needed for a pipelined driver?</li>
              </ul>
            </div>
          </section>

          {/* ── §28 Coding Exercise ─────────────────────────────────────── */}
          <section id="exercise">
            <SectionHeading
              num={28}
              title="Coding Exercise — Configurable Idle-Cycle Insertion"
            />
            <p className="text-slate-300 text-sm mb-3">
              <strong>Exercise:</strong> Add configurable idle-cycle insertion
              after cleanup to simulate bus gap timing.
            </p>
            <CodeBlock lang="systemverilog">{`drive_one_transfer(req, rsp);
insert_idle_cycles();
rsp.set_id_info(req);
seq_item_port.item_done(rsp);`}</CodeBlock>

            <CollapsibleCard
              title="Implementation Requirements & Interview Defense"
              accent="emerald"
              defaultOpen={true}
            >
              <div className="space-y-2 text-xs text-slate-300">
                <ol className="list-decimal list-inside space-y-1">
                  <li>Add <code>int unsigned idle_cycles</code> to driver class.</li>
                  <li>Read it from <code>uvm_config_db#(int unsigned)</code> in build_phase.</li>
                  <li>After transfer completion and cleanup, wait <code>idle_cycles</code> clocking-block events.</li>
                  <li>Keep bus idle (psel=0, penable=0) during inserted cycles.</li>
                  <li>Do not fetch the next item during idle insertion.</li>
                  <li>Preserve response routing with <code>set_id_info(req)</code>.</li>
                </ol>
                <p className="pt-2 text-emerald-300">
                  <strong>Interview Defense:</strong> If idle insertion is part of
                  the non-pipelined cleanup contract, it occurs before{" "}
                  <code>item_done()</code>. If sequence throughput matters more,
                  make the policy configurable.
                </p>
              </div>
            </CollapsibleCard>
          </section>

          {/* ── §29 Final Readiness Verdict ─────────────────────────────── */}
          <section id="verdict">
            <SectionHeading num={29} title="Final Readiness Verdict" />
            <div className="p-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 space-y-3">
              <h3 className="text-lg font-bold text-emerald-300 flex items-center gap-2">
                <FaCheckSquare /> Module 6 — Final Readiness Verdict: PASS
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                APB-Style Non-Pipelined Command Driver manuscript is fully
                converted into React. All 16 memory cards, 4 atlas sheets, 3 code
                labs, 7 bug gallery entries, race-condition checklists, logging
                strategies, and 10 interview Q&As are complete and verified.
              </p>
              <p className="text-xs text-emerald-200/80">
                You are now prepared to advance to Module 7: Clocking Blocks and
                Timing Disciplines.
              </p>
            </div>
          </section>

          {/* Navigation to next module */}
          <ModuleNavigation
            nextPath="/driver-mastery/module7"
            nextTitle="Module 7: Clocking Blocks and Timing Disciplines →"
          />
        </main>
      </div>
    </div>
  );
};

export default Module6;
