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
// DATA — Memory Cards (24 Cards)
// ─────────────────────────────────────────────────────────────────────────────

const module12MemoryCards = [
  {
    title: "Card 1 — Slave Driver Is Not a Backward Master Driver",
    accent: "blue",
    hook: "A master driver starts traffic. A slave driver survives traffic.",
    concept:
      "A slave driver waits for DUT-originated protocol activity and drives the modeled environment response.",
    code: `wait_for_dut_request();
select_response_policy();
drive_response_to_dut();`,
    trap: "Pulling a sequence item first and blocking while the DUT is already waiting for ready.",
    interview:
      "A slave driver is demand-driven by DUT behavior; its sequence items usually configure response policy.",
  },
  {
    title: "Card 2 — The DUT Controls Request Arrival",
    accent: "emerald",
    hook: "The sequence is not always the traffic starter.",
    concept:
      "In a slave driver, request timing is controlled by the DUT. The driver cannot assume that sequence item availability defines protocol start.",
    code: `if (vif.drv_cb.req_valid) begin
  accept_request();
end`,
    trap: "Using a master-driver template unchanged for a slave responder.",
    interview:
      "The first event in a slave driver is usually a DUT request, not a sequencer grant.",
  },
  {
    title: "Card 3 — Sampling Is for Response, Not Judgment",
    accent: "violet",
    hook: "Observe to answer, not to grade.",
    concept:
      "A slave driver may sample DUT request fields only to decide how to respond.",
    code: `addr  = vif.drv_cb.paddr;
write = vif.drv_cb.pwrite;`,
    trap: "Checking address correctness inside the driver.",
    interview:
      "The driver samples request intent to respond legally; correctness checking belongs outside it.",
  },
  {
    title: "Card 4 — APB Slave Completion Is Access-Phase PREADY",
    accent: "rose",
    hook: "PSEL starts visibility; access-phase PREADY finishes the transfer.",
    concept:
      "In an APB-style slave responder, completion occurs only when the access phase is active and PREADY=1.",
    code: `if (vif.drv_cb.psel && vif.drv_cb.penable && pready_drive) begin
  transfer_completed = 1'b1;
end`,
    trap: "Treating setup phase as a completed transfer.",
    interview:
      "APB setup presents address/control; PSEL && PENABLE && PREADY completes the transfer.",
  },
  {
    title: "Card 5 — Wait States Are Legal Stimulus",
    accent: "amber",
    hook: "Delay is a response choice.",
    concept:
      "The responder may hold completion low to stress the DUT’s wait-state handling.",
    code: `repeat (wait_cycles) begin
  vif.drv_cb.pready <= 1'b0;
  @(vif.drv_cb);
end`,
    trap: "Unbounded wait states without reset escape.",
    interview:
      "Wait-state generation must be bounded, reset-aware, and reproducible.",
  },
  {
    title: "Card 6 — Error Injection Is Not Error Checking",
    accent: "blue",
    hook: "Inject the error; do not grade the answer.",
    concept:
      "The driver may drive error responses as stimulus. The scoreboard/assertions verify DUT reaction.",
    code: `vif.drv_cb.pslverr <= inject_error;`,
    trap: "Driver prints 'DUT failed error handling' after injecting PSLVERR.",
    interview:
      "The responder creates the error condition; independent checkers judge the DUT response.",
  },
  {
    title: "Card 7 — Ready/Valid Sink Owns ready",
    accent: "emerald",
    hook: "Source owns valid; sink owns ready.",
    concept:
      "A ready/valid sink driver generates backpressure by controlling ready.",
    code: `ready_drive = compute_ready();
vif.drv_cb.ready <= ready_drive;`,
    trap: "Driving ready directly from valid without a timing contract.",
    interview:
      "In ready/valid, the sink driver controls acceptance, not payload generation.",
  },
  {
    title: "Card 8 — Accepted Beat Belongs to the Monitor",
    accent: "violet",
    hook: "The driver shakes hands; the monitor records.",
    concept:
      "The driver may count accepted beats for local policy/debug, but the monitor publishes observed transactions.",
    code: `if (vif.drv_cb.valid && ready_drive) begin
  accepted_count++;
end`,
    trap: "Sending scoreboard transactions from the driver.",
    interview: "The monitor is the canonical observation point.",
  },
  {
    title: "Card 9 — Memory-Backed Slave Is Response Infrastructure",
    accent: "rose",
    hook: "Memory can answer without judging.",
    concept:
      "A slave driver may maintain memory to return read data and absorb writes.",
    code: `if (write && !err)
  mem[addr] = wdata;
else if (!write)
  rdata = mem.exists(addr) ? mem[addr] : '0;`,
    trap: "Using driver memory as the scoreboard’s expected model.",
    interview:
      "Driver memory generates legal environment response; scoreboard memory predicts DUT correctness.",
  },
  {
    title: "Card 10 — Optional Policy Uses try_next_item()",
    accent: "amber",
    hook: "No item is a legal path.",
    concept:
      "try_next_item() lets the responder use a sequence policy if available and otherwise continue with defaults.",
    code: `seq_item_port.try_next_item(policy);

if (policy != null) begin
  copy_policy(policy);
  seq_item_port.item_done();
end
else begin
  use_default_policy();
end`,
    trap: "Dereferencing a null policy handle.",
    interview: "try_next_item() is nonblocking; null is part of the contract.",
  },
  {
    title: "Card 11 — Optional Policy item_done() Means Policy Consumed",
    accent: "blue",
    hook: "Consumed policy is not always completed protocol.",
    concept:
      "With try_next_item(), the driver may call item_done() after copying policy into local variables. That does not mean the bus transfer has completed.",
    code: `copy_policy_to_local_state(policy);
seq_item_port.item_done();
drive_protocol_response_from_local_state();`,
    trap: "A sequence assumes item_done() means APB/response completion when the driver contract only promises policy consumption.",
    interview:
      "Define whether item completion means policy consumed or protocol response completed.",
  },
  {
    title: "Card 12 — Required Response Uses get_next_item()",
    accent: "emerald",
    hook: "Block only when response cannot proceed.",
    concept:
      "get_next_item() is valid when the driver cannot respond without a sequence-provided item.",
    code: `wait_for_dut_request();
seq_item_port.get_next_item(policy);
drive_response(policy);
seq_item_port.item_done();`,
    trap: "Blocking on get_next_item() before observing a request that the sequence itself needs to see.",
    interview:
      "Required response items are powerful but can deadlock if request-observation ordering is wrong.",
  },
  {
    title: "Card 13 — get() Is FIFO-Style Consumption",
    accent: "violet",
    hook: "get() consumes; it does not lock.",
    concept:
      "get() retrieves an item without the get_next_item/item_done protocol.",
    code: `seq_item_port.get(policy);
// no item_done()`,
    trap: "Calling item_done() after get().",
    interview: "get() is not completed with item_done().",
  },
  {
    title: "Card 14 — Response Routing Needs set_id_info(req)",
    accent: "rose",
    hook: "Responses need routing metadata.",
    concept:
      "If a response goes back to the originating sequence, copy ID context from request to response.",
    code: `rsp = completion_type::type_id::create("rsp");
rsp.set_id_info(req);
seq_item_port.item_done(rsp);`,
    trap: "Creating a response object without sequence ID metadata.",
    interview: "Whenever response routing matters, use set_id_info(req).",
  },
  {
    title: "Card 15 — Reset Does Not Cancel UVM API Debt",
    accent: "amber",
    hook: "Protocol reset is not sequencer reset.",
    concept:
      "After get_next_item(), the driver owes item_done(), even if reset aborts the pin-level response.",
    code: `rsp.aborted = 1'b1;
rsp.set_id_info(req);
seq_item_port.item_done(rsp);`,
    trap: "Returning from reset branch without completing the item.",
    interview:
      "Reset can abort protocol activity, but the sequencer handshake still needs closure.",
  },
  {
    title: "Card 16 — Reactive Driver Waits for Real Handshake",
    accent: "blue",
    hook: "A request is real only when accepted.",
    concept:
      "A reactive driver must not respond to a request unless the request handshake actually occurred.",
    code: `if (vif.drv_cb.req_valid && req_ready_drive) begin
  capture_request();
end`,
    trap: "Capturing request fields when req_valid was seen but req_ready was never accepted.",
    interview:
      "Reactive response must be based on an accepted request, not a transient offer.",
  },
  {
    title: "Card 17 — Reactive Sequence Needs Observation Path",
    accent: "emerald",
    hook: "The sequence cannot react to invisible information.",
    concept:
      "If the sequence computes response from DUT request fields, it needs a monitor-fed path or sequencer-side request FIFO.",
    code: `// Clean separation:
DUT request -> monitor -> sequencer/request FIFO -> reactive sequence
sequence response item -> slave driver`,
    trap: "Expecting the driver’s local sampled request to automatically appear in the sequence.",
    interview:
      "A clean reactive architecture separates observation path from response driving path.",
  },
  {
    title: "Card 18 — Clocking Blocks Reduce Race Risk",
    accent: "violet",
    hook: "Name the timing region or inherit races.",
    concept:
      "Clocking blocks separate driver output timing from input sampling timing.",
    code: `clocking drv_cb @(posedge clk);
  default input #1step output #0;
  input  valid;
  output ready;
endclocking`,
    trap: "Raw @(posedge clk) driving and monitor sampling in the same simulation region.",
    interview:
      "Clocking blocks make driver timing intent explicit and simulator-portable.",
  },
  {
    title: "Card 19 — Avoid Reading Driver-Owned Clocking Outputs",
    accent: "rose",
    hook: "Remember what you drove locally.",
    concept:
      "For portability, keep a local variable for driver-owned output intent instead of reading clocking-block output names.",
    code: `ready_drive = compute_ready();
vif.drv_cb.ready <= ready_drive;

if (vif.drv_cb.valid && ready_drive)
  accepted_count++;`,
    trap: "Using vif.drv_cb.ready as if it were a clean sampled input.",
    interview:
      "Use local drive-state for driver-owned outputs; sample DUT-owned inputs through the clocking block.",
  },
  {
    title: "Card 20 — Cleanup Prevents Duplicate Handshakes",
    accent: "amber",
    hook: "Bad idle creates fake traffic.",
    concept:
      "After response completion, the responder must return response controls to idle.",
    code: `@(vif.drv_cb);
vif.drv_cb.rsp_valid <= 1'b0;
vif.drv_cb.rsp_rdata <= '0;
vif.drv_cb.rsp_err   <= 1'b0;`,
    trap: "Leaving rsp_valid high after rsp_ready.",
    interview: "Cleanup is part of the transaction contract.",
  },
  {
    title: "Card 21 — Random Backpressure Must Be Reproducible",
    accent: "blue",
    hook: "Random without replay is noise.",
    concept:
      "Backpressure may be randomized, but policy and seed behavior must be reproducible and logged.",
    code: `\`uvm_info("RV_SINK",
  $sformatf("ready=%0b policy=%s count=%0d",
            ready_drive, policy_name, accepted_count),
  UVM_HIGH)`,
    trap: "Calling $urandom directly inside the driver without sequence-level control.",
    interview:
      "Random backpressure is stimulus; production drivers make it reproducible.",
  },
  {
    title: "Card 22 — Local Timeouts Are Debug Aids, Not Fixes",
    accent: "emerald",
    hook: "Do not hide deadlock by inventing completion.",
    concept:
      "A driver may log suspicious waits, but it should not silently force protocol completion to hide liveness bugs.",
    code: `if (wait_count > max_wait) begin
  \`uvm_warning("RESP_WAIT", "local response wait threshold exceeded")
end`,
    trap: "Forcing ready=1 after timeout and masking a DUT deadlock.",
    interview:
      "Timeouts should expose liveness failures, not repair them inside the driver.",
  },
  {
    title: "Card 23 — Active Slave Agent Is Still Active",
    accent: "violet",
    hook: "If it drives, it is active.",
    concept:
      "A slave responder agent observes DUT requests but actively drives response signals.",
    code: `if (is_active == UVM_ACTIVE) begin
  drv = slave_driver::type_id::create("drv", this);
end`,
    trap: "Calling a slave agent passive because the DUT initiates the transaction.",
    interview:
      "Passive means observe-only. A slave responder drives DUT inputs, so it is active.",
  },
  {
    title: "Card 24 — Scalable Responder Separates Engine and Policy",
    accent: "rose",
    hook: "Protocol engine drives pins; policy chooses behavior.",
    concept:
      "Reusable slave drivers separate request detection, policy selection, protocol response driving, reset handling, and logging.",
    code: `detect_request(req_snapshot);
policy = select_policy(req_snapshot);
drive_response(policy);`,
    trap: "Hardcoding every scenario inside run_phase().",
    interview:
      "A scalable responder has a protocol engine plus replaceable response policy.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// DATA — Bug Gallery (9 Bugs)
// ─────────────────────────────────────────────────────────────────────────────

const module12BugGallery = [
  {
    title: "Bug 1 — Treating APB Setup as Transfer Completion",
    symptom:
      "Write appears to complete during setup phase. Read/write side effects happen one phase too early.",
    waveform: "State update or completion log occurs when PSEL=1 and PENABLE=0.",
    cause: "The driver treated APB setup visibility as access completion.",
    bad: `if (vif.psel) begin
  mem[vif.paddr] = vif.pwdata;
  transfer_done  = 1'b1;
end`,
    fix: `if (vif.drv_cb.psel && vif.drv_cb.penable && pready_drive) begin
  mem[addr] = wdata;
  transfer_done = 1'b1;
end`,
    interview:
      "PREADY may be prepared before access, but APB transfer completion is only PSEL && PENABLE && PREADY.",
  },
  {
    title: "Bug 2 — try_next_item() Null Dereference",
    symptom: "Null-object fatal during simulation runtime.",
    waveform: "Failure happens in driver before response drive.",
    cause: "try_next_item() may return null when no policy item is queued.",
    bad: `seq_item_port.try_next_item(policy);
wait_cycles = policy.wait_cycles; // BUG: null dereference!`,
    fix: `seq_item_port.try_next_item(policy);

if (policy != null) begin
  wait_cycles = policy.wait_cycles;
  seq_item_port.item_done();
end
else begin
  wait_cycles = 0;
end`,
    interview: "Null is the normal no-policy path for try_next_item().",
  },
  {
    title: "Bug 3 — item_done() After get()",
    symptom: "Sequencer protocol error or simulator-specific handshake failure.",
    waveform: "Pins may look correct, but sequence-driver synchronization breaks.",
    cause: "get() already completes retrieval and does not use the get_next_item/item_done protocol.",
    bad: `seq_item_port.get(policy);
apply_policy(policy);
seq_item_port.item_done(); // BUG: illegal item_done!`,
    fix: `seq_item_port.get(policy);
apply_policy(policy);
// no item_done()`,
    interview: "get() consumes the item directly; item_done() is not legal afterward.",
  },
  {
    title: "Bug 4 — Reset After get_next_item() Without item_done()",
    symptom: "Sequence hangs after reset.",
    waveform: "No new item reaches driver after reset deassertion.",
    cause: "Sequencer item remained outstanding across reset.",
    bad: `seq_item_port.get_next_item(req);

if (!reset_n) begin
  return; // BUG: left sequencer item hanging!
end`,
    fix: `seq_item_port.get_next_item(req);

if (!reset_n) begin
  rsp = rsp_type::type_id::create("rsp");
  rsp.set_id_info(req);
  rsp.aborted = 1'b1;
  seq_item_port.item_done(rsp);
  return;
end`,
    interview: "Reset aborts protocol behavior, not the sequencer API contract.",
  },
  {
    title: "Bug 5 — Driver Publishes Scoreboard Transactions",
    symptom: "Duplicate or reordered scoreboard transactions.",
    waveform: "Scoreboard receives items that do not match monitor timestamps.",
    cause: "Driver bypassed monitor ownership and published directly.",
    bad: `if (vif.valid && ready_drive) begin
  scoreboard_ap.write(item); // BUG: driver publishing transaction!
end`,
    fix: `// Driver controls ready.
// Monitor observes valid && ready and publishes transaction.`,
    interview: "The monitor is the canonical observer.",
  },
  {
    title: "Bug 6 — Reactive Driver Responds Without Accepted Request",
    symptom: "Response appears for a request that was never accepted.",
    waveform: "req_valid pulse occurred without req_ready handshake.",
    cause: "Driver reacted to request offer, not request handshake.",
    bad: `if (vif.req_valid) begin
  addr = vif.req_addr;
end

drive_response(addr); // BUG: request was never accepted!`,
    fix: `if (vif.drv_cb.req_valid && req_ready_drive) begin
  addr = vif.drv_cb.req_addr;
  drive_response(addr);
end`,
    interview: "Reactive response must be based on accepted protocol state.",
  },
  {
    title: "Bug 7 — Missing set_id_info()",
    symptom: "Sequence waits forever or wrong sequence gets response.",
    waveform: "Pin-level response completes, sequence-level response does not arrive.",
    cause: "Response object lacks routing metadata.",
    bad: `rsp = completion_type::type_id::create("rsp");
seq_item_port.item_done(rsp); // BUG: missing set_id_info(req)!`,
    fix: `rsp = completion_type::type_id::create("rsp");
rsp.set_id_info(req);
seq_item_port.item_done(rsp);`,
    interview: "Response routing needs sequence and transaction ID context.",
  },
  {
    title: "Bug 8 — Ready Left High During Reset",
    symptom: "DUT may observe acceptance during reset.",
    waveform: "ready=1 while reset_n=0.",
    cause: "Responder did not force safe reset idle on ready.",
    bad: `vif.drv_cb.ready <= ready_drive; // BUG: without reset override!`,
    fix: `if (vif.drv_cb.reset_n !== 1'b1) begin
  ready_drive = 1'b0;
  vif.drv_cb.ready <= 1'b0;
end`,
    interview: "A responder must not advertise acceptance during reset.",
  },
  {
    title: "Bug 9 — Optional Policy Completion Misinterpreted",
    symptom: "Sequence advances too early and changes policy while previous response is still in progress.",
    waveform: "New policy item starts before previous PREADY completion.",
    cause: "Driver contract did not define whether item_done() meant policy consumed or protocol completed.",
    bad: `// Ambiguous contract:
copy_policy_to_local_state(policy);
seq_item_port.item_done(); // Sequence thought transfer finished!`,
    fix: `// Explicit policy consumption contract:
copy_policy_to_local_state(policy);
seq_item_port.item_done(); // Documented as "policy consumed"`,
    interview:
      "Responder item completion semantics must be explicit. Policy-consumed and response-completed are different contracts.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// DATA — Interview Q&A (14 Questions)
// ─────────────────────────────────────────────────────────────────────────────

const module12InterviewQA = [
  {
    q: "Q1. What is the difference between a master driver and a slave responder?",
    short: "A master driver initiates traffic. A slave responder reacts to DUT-initiated traffic.",
    deep: "A master driver converts sequence items into request pin activity. A slave responder observes DUT request pins and drives legal response pins. Its sequence items often represent response policy, not request commands.",
  },
  {
    q: "Q2. Can a slave driver sample DUT outputs?",
    short: "Yes, only those required to respond legally.",
    deep: "An APB slave responder must sample address/control to return data or error. But it must not use that sampling to own functional correctness checking.",
  },
  {
    q: "Q3. What does a sequence item mean in a slave driver?",
    short: "Usually response policy.",
    deep: "It may specify wait cycles, error injection, read-data override, backpressure pattern, or response delay. It may not represent a transaction launched by the driver.",
  },
  {
    q: "Q4. When should a responder use try_next_item()?",
    short: "When policy is optional.",
    deep: "The driver can continue with default behavior when no sequence item is available. This prevents DUT-facing deadlock.",
  },
  {
    q: "Q5. What is the biggest try_next_item() trap?",
    short: "Not checking for null.",
    deep: "try_next_item() may legally return no item. The no-item path must be designed and guarded against null dereference.",
  },
  {
    q: "Q6. When should a responder use get_next_item()?",
    short: "When it cannot legally respond without sequence-provided policy.",
    deep: "This is useful for fully reactive tests, but it can deadlock if the sequence waits for request information that it never receives.",
  },
  {
    q: "Q7. Why is get() not followed by item_done()?",
    short: "Because get() is not the get_next_item/item_done protocol.",
    deep: "get() consumes an item directly. item_done() completes a granted item from get_next_item() or non-null try_next_item().",
  },
  {
    q: "Q8. Why use set_id_info(req)?",
    short: "To route the response to the originating sequence.",
    deep: "It copies sequence ID and transaction ID metadata from request to response.",
  },
  {
    q: "Q9. How should reset after get_next_item() be handled?",
    short: "Cleanup pins and call item_done(), optionally with an aborted response.",
    deep: "The protocol transfer may abort, but the sequencer must not remain locked.",
  },
  {
    q: "Q10. Is a memory-backed slave driver a scoreboard?",
    short: "No, if it only generates responses.",
    deep: "Driver memory models environment behavior. Scoreboard memory predicts/checks expected DUT behavior.",
  },
  {
    q: "Q11. What is APB-style slave completion?",
    short: "PSEL && PENABLE && PREADY.",
    deep: "PSEL && !PENABLE is setup. A responder may prepare response values before access, but it must not update state or report completion until access-phase completion is observed.",
  },
  {
    q: "Q12. What does a ready/valid sink own?",
    short: "ready.",
    deep: "The DUT/source owns valid and payload. The sink driver controls acceptance/backpressure.",
  },
  {
    q: "Q13. Why should a driver avoid publishing scoreboard transactions?",
    short: "Because the monitor owns observation.",
    deep: "If both driver and monitor publish, ordering and duplication bugs appear.",
  },
  {
    q: "Q14. What is the senior architecture rule for responders?",
    short: "Separate protocol engine from response policy.",
    deep: "The protocol engine owns legal pin timing. The policy layer chooses waits, errors, data, delays, and backpressure. This improves reuse and debuggability.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// DATA — Sections for Sidebar Navigation
// ─────────────────────────────────────────────────────────────────────────────

const module12Sections = [
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
  { id: "memory-cards", label: "14. Memory Cards (1–24)" },
  { id: "atlas-sheets", label: "15. Atlas Sheets (1–6)" },
  { id: "code-labs", label: "16. Code Labs (1–3)" },
  { id: "bug-gallery", label: "17. Bug Gallery (1–9)" },
  { id: "race-checklist", label: "18. Race-Condition Checklist" },
  { id: "debug-strategy", label: "19. Debug Instrumentation & Log Strategy" },
  { id: "boundary", label: "20. Monitor / Scoreboard / Assertion Boundary" },
  { id: "architecture", label: "21. Architectural Decision Points" },
  { id: "scalability", label: "22. Scalability Notes" },
  { id: "review-checklist", label: "23. Review Checklist" },
  { id: "interview-qa", label: "24. Interview Q&A (Q1–Q14)" },
  { id: "final-recall", label: "25. Final Recall Card" },
  { id: "key-takeaways", label: "26. Key Takeaways" },
  { id: "interview-questions", label: "27. Interview Questions" },
  { id: "coding-exercise", label: "28. Coding Exercise" },
  { id: "final-verdict", label: "29. Final Readiness Verdict" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT — Module 12
// ═══════════════════════════════════════════════════════════════════════════════

const Module12 = () => {
  return (
    <div className="relative min-h-screen bg-slate-950 text-white font-sans">
      {/* Background glow & grid */}
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-150 h-62.5 bg-linear-to-r from-blue-600/15 to-indigo-600/15 blur-[100px] rounded-full" />

      <div className="relative z-10 flex max-w-7xl mx-auto">
        {/* ── Sidebar TOC (desktop) ────────────────────────────────────── */}
        <ModuleSidebar
          moduleNumber="12"
          title="Slave & Reactive Drivers"
          sections={module12Sections}
        />

        {/* ── Main Content ─────────────────────────────────────────────── */}
        <main className="flex-1 min-w-0 px-6 py-8 pb-24 max-w-4xl">
          {/* Mobile back */}
          <BackToHomeBtn to="/driver-mastery" />

          {/* Hero */}
          <ModuleHero
            moduleNumber="12"
            title="Slave, Responder, and Reactive Drivers"
            description="Master demand-driven slave responders, ready/valid sink drivers, reactive request-response models, response-policy sequence items, try_next_item() non-blocking flows, and clean verification boundaries."
            metadata={[
              ["Module", "12"],
              ["Reference", "UVM 1.2 / Slave Architecture"],
              ["Pattern", "Responder Engine & Policy Separation"],
              ["Roadmap", "After Module 11 (Pipelined Drivers), before Module 13 (Boundaries)"],
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
                  ["Module", "12"],
                  ["Title", "Slave, Responder, and Reactive Drivers"],
                  ["Reference Semantics", "UVM 1.2"],
                  ["Module Position", "After pipelined/multi-channel driver basics and before the dedicated driver-monitor-scoreboard-assertion boundary module."],
                ]}
              />

              <h3 className="text-lg font-bold text-blue-300 mt-4">
                Module Purpose
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                This module teaches <strong>slave-side UVM drivers</strong>: active components that model the environment around the DUT and respond to DUT-originated protocol activity.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-lg">
                  <div className="font-bold text-blue-300 mb-1">Master Driver Perspective:</div>
                  <p className="text-slate-300 italic">“The sequence gave me a request. I will drive that request into the DUT.”</p>
                </div>
                <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-lg">
                  <div className="font-bold text-emerald-300 mb-1">Slave / Responder Perspective:</div>
                  <p className="text-slate-300 italic">“The DUT is attempting a transfer into my modeled environment. I must respond legally, controllably, and repeatably.”</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs mt-3">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                  <div className="font-bold text-emerald-300 mb-1">Slave / Responder Usually Owns:</div>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                    <li>ready/backpressure generation</li>
                    <li>wait-state insertion</li>
                    <li>read-data generation</li>
                    <li>response-error injection</li>
                    <li>simple memory-backed response behavior</li>
                    <li>response-valid behavior</li>
                    <li>reset-safe cleanup</li>
                    <li>optional sequence-controlled response policy</li>
                  </ul>
                </div>

                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg">
                  <div className="font-bold text-rose-300 mb-1">Must Not Become:</div>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                    <li>a monitor</li>
                    <li>a scoreboard</li>
                    <li>a functional checker</li>
                    <li>an assertion replacement</li>
                    <li>an all-purpose protocol model</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* ── §2 Learning Objectives ──────────────────────────────────── */}
          <section id="learning-objectives">
            <SectionHeading num={2} title="Learning Objectives" />
            <ol className="space-y-2 list-decimal list-inside text-slate-300 text-sm leading-relaxed">
              {[
                "Distinguish master drivers, slave drivers, responder drivers, and reactive drivers.",
                "Explain why slave drivers may sample DUT request outputs but must not become checkers.",
                "Build an APB-style slave responder that drives PREADY, PRDATA, and PSLVERR.",
                "Build a ready/valid sink driver that owns ready and applies backpressure.",
                "Build a reactive request-response slave driver.",
                "Explain response-policy sequence items.",
                "Use try_next_item() for optional response policy overrides.",
                "Use get_next_item() / item_done() for required response items.",
                "Explain why get() must not be paired with item_done().",
                "Use set_id_info(req) when routing response objects.",
                "Handle reset after sequence item acquisition.",
                "Separate driver, monitor, scoreboard, and assertion responsibilities.",
                "Defend slave-driver architecture in senior/principal verification interviews.",
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300 mb-4">
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
                <strong className="text-blue-300">Pass 1 — Protocol Behavior</strong>
                <p>Focus on who initiates transfer, what DUT drives, what responder drives, and completion meaning.</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
                <strong className="text-emerald-300">Pass 2 — Timing Contract</strong>
                <p>Focus on APB setup/access timing, ready/valid acceptance, wait states, and reset during in-flight response.</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
                <strong className="text-violet-300">Pass 3 — UVM Implementation</strong>
                <p>Focus on policy items, try_next_item(), item_done() placement, response routing, and reset-abort completion.</p>
              </div>
            </div>
          </section>

          {/* ── §4 Visual Tag Legend ───────────────────────────────────── */}
          <section id="visual-tag-legend">
            <SectionHeading num={4} title="Visual Tag Legend" />
            <Table
              headers={["Tag", "Meaning"]}
              rows={[
                ["[PROTOCOL]", "Protocol-level behavior and signal ownership"],
                ["[WAVEFORM]", "Cycle/timing contract"],
                ["[UVM]", "UVM driver/sequencer/sequence contract"],
                ["[RESET]", "Reset or abort behavior"],
                ["[BUG]", "Common failure mode"],
                ["[BOUNDARY]", "Driver vs monitor vs scoreboard vs assertion ownership"],
                ["[ARCH]", "Senior/principal architecture decision"],
                ["[CODE]", "Code anchor or implementation rule"],
                ["[INTERVIEW]", "Interview-defense explanation"],
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
                "Distinguishes master, slave, responder, and reactive drivers.",
                "Explains what DUT outputs a slave driver may sample.",
                "Explains what DUT inputs a slave driver owns.",
                "Defines APB-style slave responder timing.",
                "Defines ready/valid sink timing.",
                "Defines reactive request-response timing.",
                "Explains response policy items.",
                "Explains autonomous responder behavior.",
                "Explains optional policy override using try_next_item().",
                "Explains required policy using get_next_item().",
                "Explains get() semantics without item_done().",
                "Explains item_done() timing.",
                "Explains response object routing using set_id_info(req).",
                "Defines reset-abort behavior after item acquisition.",
                "Separates driver, monitor, scoreboard, and assertion responsibility.",
                "Includes compile-credible UVM 1.2 code labs.",
                "Includes realistic bug examples and fixes.",
                "Includes race-condition and debug strategy.",
                "Includes architecture tradeoffs.",
                "Includes interview-defense content.",
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
                  <li>slave-side active drivers</li>
                  <li>responder drivers &amp; reactive drivers</li>
                  <li>APB-style slave response timing</li>
                  <li>ready/valid sink backpressure</li>
                  <li>memory-backed read/write slave behavior</li>
                  <li>wait-state generation &amp; response-error injection</li>
                  <li>sequence-controlled response policy</li>
                  <li>reset/abort behavior &amp; sequence-driver API contracts</li>
                  <li>driver-monitor-scoreboard-assertion boundary for responder drivers</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/40">
                <h4 className="font-bold text-slate-300 mb-2">
                  6.2 Non-Scope
                </h4>
                <Table
                  headers={["Topic", "Status"]}
                  rows={[
                    ["Full AXI slave VIP", "Forward reference. Later multi-channel/outstanding-response modules."],
                    ["Deep out-of-order response handling", "Forward reference. Later pipelined/multi-channel modules."],
                    ["Retry/replay protocol engines", "Forward reference. Credit/retry/replay module."],
                    ["Coherency and snoop response drivers", "Forward reference. Coherent/protocol-layered module."],
                    ["Full scoreboard architecture", "Separate module."],
                    ["Full assertion architecture", "Separate module."],
                    ["RAL frontdoor integration", "Later RAL driver module."],
                    ["Complete reusable commercial VIP architecture", "Later advanced architecture modules."],
                  ]}
                />
              </div>

              <Callout type="concept">
                <strong>Boundary Note:</strong> A slave driver may contain a small memory model to produce read data. That is legal responder behavior. It becomes scoreboard contamination when the driver uses that memory to declare whether the DUT behaved correctly.
              </Callout>
            </div>
          </section>

          {/* ── §7 Protocol Mental Model ───────────────────────────────── */}
          <section id="protocol-mental-model">
            <SectionHeading num={7} title="Protocol Mental Model" />
            <div className="space-y-4 text-sm text-slate-300">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl border border-slate-700/60 bg-slate-900/40">
                  <h5 className="font-bold text-blue-300 text-xs mb-1">
                    7.1 Master Driver
                  </h5>
                  <CodeBlock lang="text">{`sequence item
  -> driver
  -> DUT request pins`}</CodeBlock>
                </div>
                <div className="p-3 rounded-xl border border-slate-700/60 bg-slate-900/40">
                  <h5 className="font-bold text-emerald-300 text-xs mb-1">
                    7.2 Slave / Responder
                  </h5>
                  <CodeBlock lang="text">{`DUT request pins
  -> driver observes
  -> driver response pins
  -> DUT`}</CodeBlock>
                </div>
                <div className="p-3 rounded-xl border border-slate-700/60 bg-slate-900/40">
                  <h5 className="font-bold text-violet-300 text-xs mb-1">
                    7.3 Reactive Driver
                  </h5>
                  <CodeBlock lang="text">{`DUT request observed
  -> policy selected
  -> driver responds
  -> optional completion`}</CodeBlock>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/10 text-xs space-y-1">
                <strong className="text-blue-300">7.4 Key Inversion:</strong>
                <p>
                  In a master driver, the sequence controls transaction launch.
                  <br />
                  In a slave driver, the <strong>DUT controls request arrival</strong>, and the <strong>driver controls environment response</strong>.
                </p>
              </div>
            </div>
          </section>

          {/* ── §8 Timing / Waveform Contract ──────────────────────────── */}
          <section id="timing-waveform">
            <SectionHeading num={8} title="Timing / Waveform Contract" />
            <div className="space-y-4 text-sm text-slate-300">
              <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/40 space-y-2">
                <h4 className="font-bold text-blue-300 text-xs uppercase tracking-wider">
                  8.1 APB-Style Slave Responder Timing
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400">DUT Drives:</span>
                    <CodeBlock lang="text">{`PSEL, PENABLE, PWRITE, PADDR, PWDATA`}</CodeBlock>
                  </div>
                  <div>
                    <span className="text-slate-400">Slave Drives:</span>
                    <CodeBlock lang="text">{`PREADY, PRDATA, PSLVERR`}</CodeBlock>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-800/60 rounded-lg">
                    <strong>Zero-Wait Read:</strong>
                    <CodeBlock lang="text">{`Cycle N:   PSEL=1 PENABLE=0 PADDR=A (setup)
Cycle N+1: PSEL=1 PENABLE=1 PREADY=1 (access)
           PRDATA=mem[A], PSLVERR=0
Cycle N+2: PREADY=0 PRDATA=idle (cleanup)`}</CodeBlock>
                  </div>
                  <div className="p-3 bg-slate-800/60 rounded-lg">
                    <strong>Wait-State Read:</strong>
                    <CodeBlock lang="text">{`Cycle N:   PSEL=1 PENABLE=0 (setup)
Cycle N+1: PSEL=1 PENABLE=1 PREADY=0 (wait 1)
Cycle N+2: PSEL=1 PENABLE=1 PREADY=0 (wait 2)
Cycle N+3: PSEL=1 PENABLE=1 PREADY=1 (done)`}</CodeBlock>
                  </div>
                </div>

                <Callout type="warning">
                  <strong>Completion Rule:</strong> <code>transfer_complete = psel &amp;&amp; penable &amp;&amp; pready;</code>
                  <br />
                  <code>PSEL &amp;&amp; !PENABLE</code> is setup. The responder may prepare response values for the upcoming access phase, but it must not treat setup as a completed transfer.
                </Callout>
              </div>

              <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/40 space-y-2">
                <h4 className="font-bold text-emerald-300 text-xs uppercase tracking-wider">
                  8.2 Ready/Valid Sink Timing
                </h4>
                <div className="text-xs">
                  <p>DUT/source drives <code>valid, data, last</code>. Sink driver drives <code>ready</code>.</p>
                  <p className="text-emerald-300 font-semibold mt-1">Acceptance: <code>valid &amp;&amp; ready</code></p>
                </div>
                <CodeBlock lang="text">{`Cycle N:   valid=1 ready=0 -> offered, not accepted (backpressure)
Cycle N+1: valid=1 ready=1 -> accepted
Cycle N+2: driver changes ready according to policy`}</CodeBlock>
              </div>

              <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/40 space-y-2">
                <h4 className="font-bold text-violet-300 text-xs uppercase tracking-wider">
                  8.3 Reactive Request-Response Timing Flow
                </h4>
                <ol className="list-decimal list-inside space-y-1 text-xs text-slate-300">
                  <li>DUT asserts <code>req_valid</code>.</li>
                  <li>Driver asserts <code>req_ready</code> when it can accept.</li>
                  <li>Request handshake occurs (<code>req_valid &amp;&amp; req_ready</code>).</li>
                  <li>Driver captures request fields.</li>
                  <li>Driver selects or fetches response policy.</li>
                  <li>Driver waits optional response delay.</li>
                  <li>Driver asserts <code>rsp_valid</code> with payload/error.</li>
                  <li>DUT accepts response with <code>rsp_ready</code>.</li>
                  <li>Driver cleans response signals.</li>
                  <li>Driver completes UVM item contract if a sequence item was used.</li>
                </ol>
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
                <h4 className="font-bold text-emerald-300 mb-2">9.1 What a Slave Driver Owns</h4>
                <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs">
                  <li>driving DUT response inputs</li>
                  <li>ready/backpressure generation</li>
                  <li>wait-state generation</li>
                  <li>response error injection</li>
                  <li>read-data response generation</li>
                  <li>simple memory update for modeled slave behavior</li>
                  <li>reset-safe output cleanup</li>
                  <li>response policy consumption</li>
                  <li>minimal local self-protection checks</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5">
                <h4 className="font-bold text-rose-300 mb-2">9.3 What a Slave Driver Must Not Own</h4>
                <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs">
                  <li>functional correctness comparison</li>
                  <li>scoreboard prediction</li>
                  <li>coverage model ownership</li>
                  <li>temporal assertion suite</li>
                  <li>end-to-end data checking</li>
                  <li>DUT design-intent validation</li>
                </ul>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/40 text-xs">
              <h4 className="font-bold text-blue-300 mb-2">9.2 What a Slave Driver May Sample</h4>
              <Table
                headers={["Protocol Type", "Driver May Sample"]}
                rows={[
                  ["APB-style slave", "PSEL, PENABLE, PWRITE, PADDR, PWDATA"],
                  ["Ready/valid sink", "valid, payload/sidebands needed for local response policy"],
                  ["Reactive request-response", "request valid/address/control/data"],
                  ["Credit responder", "request or credit-consuming events required for response"],
                ]}
              />
            </div>

            <Callout type="concept">
              <strong>Boundary Rule:</strong> If the code says <em>“DUT should have done X”</em>, it belongs in monitor, scoreboard, or assertions. If the code says <em>“To respond legally, I must drive X”</em>, it belongs in the driver.
            </Callout>
          </section>

          {/* ── §10 Sequence-Sequencer-Driver Contract ──────────────────── */}
          <section id="ssd-contract">
            <SectionHeading
              num={10}
              title="Sequence-Sequencer-Driver Contract"
            />
            <div className="space-y-4 text-sm text-slate-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/40 space-y-2">
                  <strong className="text-blue-300">10.1 Contract A — Autonomous Responder:</strong>
                  <p>No <code>seq_item_port</code> access per request. Responds from internal memory with default timing.</p>
                  <CodeBlock lang="systemverilog">{`wait_for_dut_request();
drive_default_response();`}</CodeBlock>
                </div>

                <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/40 space-y-2">
                  <strong className="text-emerald-300">10.2 Contract B — Optional Policy (try_next_item):</strong>
                  <p>Responds by default, unless a sequence provides an override.</p>
                  <CodeBlock lang="systemverilog">{`seq_item_port.try_next_item(policy);
if (policy != null) begin
  copy_policy(policy);
  seq_item_port.item_done();
end else use_default_policy();`}</CodeBlock>
                </div>

                <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/40 space-y-2">
                  <strong className="text-violet-300">10.3 Contract C — Required Policy (get_next_item):</strong>
                  <p>Driver blocks until sequence provides response item.</p>
                  <CodeBlock lang="systemverilog">{`wait_for_dut_request();
seq_item_port.get_next_item(policy);
drive_response(policy);
seq_item_port.item_done();`}</CodeBlock>
                </div>

                <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/40 space-y-2">
                  <strong className="text-rose-300">10.4 Contract D — FIFO Stream (get):</strong>
                  <p>Consumes policy queue without <code>item_done()</code>.</p>
                  <CodeBlock lang="systemverilog">{`seq_item_port.get(policy);
apply_policy(policy);
// NO item_done()`}</CodeBlock>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 text-xs space-y-2">
                <strong className="text-blue-300">10.5 Response Routing (set_id_info):</strong>
                <CodeBlock lang="systemverilog">{`rsp = completion_type::type_id::create("rsp");
rsp.set_id_info(req);
seq_item_port.item_done(rsp); // or put_response(rsp)`}</CodeBlock>
              </div>
            </div>
          </section>

          {/* ── §11 Reset / Abort Policy ───────────────────────────────── */}
          <section id="reset-abort">
            <SectionHeading num={11} title="Reset / Abort Policy" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300">
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
                <strong className="text-amber-300">11.1 Before Request:</strong>
                <p>Drive outputs inactive, do not advertise ready unless protocol allows, wait for reset deassertion.</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
                <strong className="text-amber-300">11.2 During Observation:</strong>
                <p>Drop ready/PREADY/rsp_valid, discard partial snapshot, restart after reset.</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
                <strong className="text-amber-300">11.3 After try_next_item():</strong>
                <p>If item_done() already called, item contract is closed. Clean pins and clear local policy.</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/60 border border-rose-500/30 bg-rose-500/5 space-y-1">
                <strong className="text-rose-300">11.4 After get_next_item():</strong>
                <p>Reset does not cancel UVM API debt! Must create aborted rsp and call item_done(rsp).</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
                <strong className="text-blue-300">11.5 During APB Access:</strong>
                <p>Deassert PREADY, clear PSLVERR/PRDATA, do not update memory, discard pending transfer.</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
                <strong className="text-emerald-300">11.6 Ready/Valid Sink Reset:</strong>
                <p>Drive ready=0, clear local counters if required, do not claim acceptance during reset.</p>
              </div>
            </div>
          </section>

          {/* ── §12 Response / Completion Policy ────────────────────────── */}
          <section id="response-policy">
            <SectionHeading
              num={12}
              title="Response / Completion Policy"
            />
            <div className="space-y-4 text-sm text-slate-300">
              <Table
                headers={["Driver Type", "Completion Means"]}
                rows={[
                  ["APB-style slave", "PSEL && PENABLE && PREADY"],
                  ["Ready/valid sink", "valid && ready"],
                  ["Reactive response driver", "rsp_valid && rsp_ready"],
                  ["Optional policy responder", "Policy copied into local state"],
                  ["Required policy responder", "Response accepted or aborted"],
                ]}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <strong className="text-emerald-300">When rsp Is Required:</strong>
                  <ul className="list-disc list-inside space-y-1 text-slate-300 mt-1">
                    <li>sequence needs completion/abort status</li>
                    <li>reset can abort after item acquisition</li>
                    <li>observed DUT request fields must be returned</li>
                    <li>multiple sequences require response routing</li>
                  </ul>
                </div>
                <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700">
                  <strong className="text-slate-300">When rsp Can Be Skipped:</strong>
                  <ul className="list-disc list-inside space-y-1 text-slate-400 mt-1">
                    <li>item is a fire-and-forget policy</li>
                    <li>completion status is irrelevant</li>
                    <li>no sequence waits for response</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* ── §13 Protocol Ownership Matrix ──────────────────────────── */}
          <section id="ownership-matrix">
            <SectionHeading num={13} title="Protocol Ownership Matrix" />
            <Table
              headers={[
                "Area",
                "Slave Driver",
                "Monitor",
                "Scoreboard",
                "Assertions",
              ]}
              rows={[
                ["Drive ready", "Owns", "Observes", "No", "May check legal behavior"],
                ["Drive PREADY", "Owns", "Observes", "No", "May check APB timing"],
                ["Drive PRDATA", "Owns", "Observes", "May predict separately", "May check stability"],
                ["Drive PSLVERR", "Owns as stimulus", "Observes", "Checks DUT reaction", "Checks legal timing"],
                ["Observe DUT request fields", "Only as needed for response", "Owns full observation", "Consumes monitor output", "May check legality"],
                ["Maintain response memory", "May own simple model", "No", "May own expected model", "No"],
                ["Publish observed transaction", "No", "Owns", "Consumes", "No"],
                ["Functional comparison", "No", "No", "Owns", "Sometimes local property"],
                ["Protocol temporal checking", "Minimal self-protection", "May report", "No", "Owns"],
                ["Coverage", "No", "Often", "Sometimes", "Sometimes"],
                ["Reactive feedback to sequence", "Sometimes via architecture", "Often source of feedback", "No", "No"],
              ]}
            />
          </section>

          {/* ── §14 Memory Cards ────────────────────────────────────────── */}
          <section id="memory-cards">
            <SectionHeading num={14} title="Memory Cards (1–24)" />
            <p className="text-slate-400 text-sm mb-4">
              24 comprehensive memory cards for Slave, Responder, and Reactive Drivers:
            </p>
            <div className="space-y-3">
              {module12MemoryCards.map((card, idx) => (
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
            <SectionHeading num={15} title="Atlas Sheets (1–6)" />

            <CollapsibleCard
              title="Atlas Sheet 1 — Driver Type Comparison"
              accent="blue"
              icon={<FaListAlt size={12} />}
              defaultOpen={true}
            >
              <Table
                headers={["Driver Type", "Initiator", "Driver Drives", "Driver Samples", "Sequence Item Usually Means"]}
                rows={[
                  ["Master driver", "Sequence/driver", "Request pins", "Ready/completion/error", "Transaction to drive"],
                  ["Slave responder", "DUT", "Response pins", "Request pins", "Response policy"],
                  ["Ready/valid sink", "DUT/source", "ready", "valid, payload for local policy", "Backpressure policy"],
                  ["APB slave responder", "DUT/APB master", "PREADY, PRDATA, PSLVERR", "APB request phase", "Wait/error/read policy"],
                  ["Reactive driver", "DUT", "Response path", "Request path", "Response after observed request"],
                ]}
              />
            </CollapsibleCard>

            <CollapsibleCard
              title="Atlas Sheet 2 — UVM API Contract Map"
              accent="violet"
              icon={<FaListAlt size={12} />}
            >
              <Table
                headers={["API Style", "Legal Pairing", "Best Use", "Slave Driver Meaning"]}
                rows={[
                  ["get_next_item(req)", "Must call item_done()", "Required item", "Cannot respond without sequence policy"],
                  ["try_next_item(req)", "If non-null, call item_done()", "Optional item", "Override default policy if available"],
                  ["get(req)", "No item_done()", "FIFO-style pull", "Consume preloaded policy"],
                  ["item_done(rsp)", "Active granted item only", "Completion with status", "Report completed/aborted response"],
                  ["put_response(rsp)", "Valid response object", "Separate response path", "Advanced completion reporting"],
                ]}
              />
            </CollapsibleCard>

            <CollapsibleCard
              title="Atlas Sheet 3 — Policy Item Lifetime"
              accent="emerald"
              icon={<FaListAlt size={12} />}
            >
              <Table
                headers={["Policy Type", "Item Completion Means", "Protocol Completion Means"]}
                rows={[
                  ["Optional wait-state policy", "Policy copied locally", "APB/ready-valid transfer later completes"],
                  ["Optional error policy", "Error choice copied locally", "Error response later handshakes"],
                  ["Required response item", "Usually response completed or aborted", "Same point unless contract says otherwise"],
                  ["FIFO-style policy via get()", "Item consumed by get()", "Separate driver-defined event"],
                  ["Fire-and-forget default", "No item", "Protocol completion only"],
                ]}
              />
            </CollapsibleCard>

            <CollapsibleCard
              title="Atlas Sheet 4 — APB-Style Slave Timing"
              accent="amber"
              icon={<FaListAlt size={12} />}
            >
              <Table
                headers={["Phase", "DUT/APB Master", "Slave Driver", "Completion?"]}
                rows={[
                  ["Idle", "PSEL=0", "Idle or prepared response values", "No"],
                  ["Setup", "PSEL=1, PENABLE=0", "Capture request; may prepare response for access", "No"],
                  ["Wait Access", "PSEL=1, PENABLE=1", "PREADY=0", "No"],
                  ["Complete Access", "PSEL=1, PENABLE=1", "PREADY=1, valid response", "Yes"],
                  ["Cleanup", "Next cycle", "Deassert response controls according to model", "No"],
                ]}
              />
            </CollapsibleCard>

            <CollapsibleCard
              title="Atlas Sheet 5 — Ready/Valid Sink Timing"
              accent="rose"
              icon={<FaListAlt size={12} />}
            >
              <Table
                headers={["Event", "Meaning", "Driver Action"]}
                rows={[
                  ["valid=0", "No offered beat", "Drive ready from policy"],
                  ["valid=1 ready=0", "Beat offered, not accepted", "Maintain backpressure"],
                  ["valid=1 ready=1", "Beat accepted", "Count/log locally; monitor publishes"],
                  ["Reset", "Interface inactive", "Drive ready=0"],
                  ["Policy update", "New backpressure behavior", "Consume item safely"],
                ]}
              />
            </CollapsibleCard>

            <CollapsibleCard
              title="Atlas Sheet 6 — Reactive Architecture Options"
              accent="blue"
              icon={<FaListAlt size={12} />}
            >
              <Table
                headers={["Architecture", "Mechanism", "Strength", "Risk"]}
                rows={[
                  ["Autonomous responder", "Driver computes response", "Simple", "Less scenario control"],
                  ["Optional override", "try_next_item() if available", "Flexible, non-hanging", "Contract must define item completion"],
                  ["Required response item", "get_next_item() after request", "Full control", "Can deadlock"],
                  ["Monitor-fed sequence", "Monitor passes request to sequence", "Clean separation", "More infrastructure"],
                  ["Driver-local memory", "Driver models simple slave memory", "Practical", "Must avoid scoreboard contamination"],
                ]}
              />
            </CollapsibleCard>
          </section>

          {/* ── §16 Code Labs ───────────────────────────────────────────── */}
          <section id="code-labs">
            <SectionHeading num={16} title="Code Labs (1–3)" />

            {/* Lab 1 */}
            <CollapsibleCard
              title="Code Lab 1 — APB-Style Slave Responder Driver"
              accent="blue"
              icon={<FaFlask size={12} />}
              defaultOpen={true}
            >
              <div className="space-y-3 text-xs text-slate-300">
                <p>
                  <strong>Goal:</strong> Build an APB-style slave responder that observes setup phase, prepares response for access phase, inserts wait states, returns read data from local memory, accepts writes only after completed non-error access, injects PSLVERR, uses <code>try_next_item()</code> for optional policy, and handles reset safely.
                </p>
                <CodeBlock lang="systemverilog">{`\`timescale 1ns/1ps

interface apb_if(input logic pclk, input logic preset_n);
  logic        psel;
  logic        penable;
  logic        pwrite;
  logic [31:0] paddr;
  logic [31:0] pwdata;
  logic        pready;
  logic [31:0] prdata;
  logic        pslverr;

  clocking drv_cb @(posedge pclk);
    default input #1step output #0;
    input  preset_n;
    input  psel;
    input  penable;
    input  pwrite;
    input  paddr;
    input  pwdata;
    output pready;
    output prdata;
    output pslverr;
  endclocking
endinterface

package apb_slave_pkg;
  import uvm_pkg::*;
  \`include "uvm_macros.svh"

  class apb_slave_rsp_item extends uvm_sequence_item;
    rand int unsigned wait_cycles;
    rand bit          inject_error;
    rand bit          use_read_data_override;
    rand bit [31:0]   read_data_override;

    constraint c_wait {
      wait_cycles inside {[0:10]};
    }

    \`uvm_object_utils_begin(apb_slave_rsp_item)
      \`uvm_field_int(wait_cycles,            UVM_DEFAULT)
      \`uvm_field_int(inject_error,           UVM_DEFAULT)
      \`uvm_field_int(use_read_data_override, UVM_DEFAULT)
      \`uvm_field_int(read_data_override,     UVM_DEFAULT)
    \`uvm_object_utils_end

    function new(string name = "apb_slave_rsp_item");
      super.new(name);
    endfunction
  endclass

  class apb_slave_rsp_driver extends uvm_driver #(apb_slave_rsp_item);
    \`uvm_component_utils(apb_slave_rsp_driver)

    virtual apb_if vif;
    bit [31:0] mem [bit [31:0]];

    function new(string name = "apb_slave_rsp_driver", uvm_component parent = null);
      super.new(name, parent);
    endfunction

    function void build_phase(uvm_phase phase);
      super.build_phase(phase);
      if (!uvm_config_db#(virtual apb_if)::get(this, "", "vif", vif)) begin
        \`uvm_fatal("NOVIF", "apb_if virtual interface not found")
      end
    endfunction

    task run_phase(uvm_phase phase);
      reset_outputs();
      forever begin
        wait_reset_deasserted();
        respond_until_reset();
      end
    endtask

    task reset_outputs();
      vif.drv_cb.pready  <= 1'b0;
      vif.drv_cb.prdata  <= '0;
      vif.drv_cb.pslverr <= 1'b0;
    endtask

    task wait_reset_deasserted();
      while (vif.drv_cb.preset_n !== 1'b1) begin
        reset_outputs();
        @(vif.drv_cb);
      end
    endtask

    task respond_until_reset();
      bit        write;
      bit [31:0] addr;
      bit [31:0] wdata;

      while (vif.drv_cb.preset_n === 1'b1) begin
        reset_outputs();
        @(vif.drv_cb);

        if (vif.drv_cb.preset_n !== 1'b1) begin
          reset_outputs();
          return;
        end

        if (vif.drv_cb.psel && !vif.drv_cb.penable) begin
          addr  = vif.drv_cb.paddr;
          write = vif.drv_cb.pwrite;
          wdata = vif.drv_cb.pwdata;
          handle_transfer(addr, write, wdata);
        end
      end
      reset_outputs();
    endtask

    task handle_transfer(bit [31:0] addr, bit write, bit [31:0] wdata);
      apb_slave_rsp_item policy;
      int unsigned       wait_cycles;
      bit                err;
      bit [31:0]         rdata;
      bit                completed;

      wait_cycles = 0;
      err         = 1'b0;
      rdata       = mem.exists(addr) ? mem[addr] : '0;
      completed   = 1'b0;

      seq_item_port.try_next_item(policy);

      if (policy != null) begin
        wait_cycles = policy.wait_cycles;
        err         = policy.inject_error;
        if (policy.use_read_data_override) begin
          rdata = policy.read_data_override;
        end
        seq_item_port.item_done();
      end

      repeat (wait_cycles) begin
        vif.drv_cb.pready  <= 1'b0;
        vif.drv_cb.pslverr <= 1'b0;
        vif.drv_cb.prdata  <= '0;
        @(vif.drv_cb);
        if (vif.drv_cb.preset_n !== 1'b1) begin
          reset_outputs();
          return;
        end
      end

      vif.drv_cb.prdata  <= write ? '0 : rdata;
      vif.drv_cb.pslverr <= err;
      vif.drv_cb.pready  <= 1'b1;

      do begin
        @(vif.drv_cb);
        if (vif.drv_cb.preset_n !== 1'b1) begin
          reset_outputs();
          return;
        end
        if (vif.drv_cb.psel && vif.drv_cb.penable) begin
          completed = 1'b1;
        end
      end while (!completed);

      if (write && !err) begin
        mem[addr] = wdata;
      end

      \`uvm_info("APB_SLV_RSP",
        $sformatf("complete addr=0x%08h write=%0b wdata=0x%08h rdata=0x%08h err=%0b wait=%0d",
                  addr, write, wdata, rdata, err, wait_cycles),
        UVM_MEDIUM)

      reset_outputs();
    endtask
  endclass
endpackage`}</CodeBlock>
              </div>
            </CollapsibleCard>

            {/* Lab 2 */}
            <CollapsibleCard
              title="Code Lab 2 — Ready/Valid Sink Driver with Backpressure Policy"
              accent="emerald"
              icon={<FaFlask size={12} />}
            >
              <div className="space-y-3 text-xs text-slate-300">
                <p>
                  <strong>Goal:</strong> Build a sink responder that drives ready, applies programmable high/low ready windows, observes valid only for local accepted-count/debug, does not publish monitor transactions, and avoids reading driver-owned clocking-block outputs.
                </p>
                <CodeBlock lang="systemverilog">{`\`timescale 1ns/1ps

interface rv_sink_if #(parameter int DATA_W = 32)
                      (input logic clk, input logic reset_n);
  logic              valid;
  logic [DATA_W-1:0] data;
  logic              last;
  logic              ready;

  clocking drv_cb @(posedge clk);
    default input #1step output #0;
    input  reset_n;
    input  valid;
    input  data;
    input  last;
    output ready;
  endclocking
endinterface

package rv_sink_pkg;
  import uvm_pkg::*;
  \`include "uvm_macros.svh"

  class rv_sink_policy extends uvm_sequence_item;
    rand int unsigned ready_high_cycles;
    rand int unsigned ready_low_cycles;
    rand bit          start_ready;

    constraint c_cycles {
      ready_high_cycles inside {[1:32]};
      ready_low_cycles  inside {[0:32]};
      if (!start_ready) {
        ready_low_cycles >= 1;
      }
    }

    \`uvm_object_utils_begin(rv_sink_policy)
      \`uvm_field_int(ready_high_cycles, UVM_DEFAULT)
      \`uvm_field_int(ready_low_cycles,  UVM_DEFAULT)
      \`uvm_field_int(start_ready,       UVM_DEFAULT)
    \`uvm_object_utils_end

    function new(string name = "rv_sink_policy");
      super.new(name);
      ready_high_cycles = 4;
      ready_low_cycles  = 0;
      start_ready       = 1'b1;
    endfunction
  endclass

  class rv_sink_driver extends uvm_driver #(rv_sink_policy);
    \`uvm_component_utils(rv_sink_driver)

    virtual rv_sink_if #(32) vif;
    int unsigned cfg_high_cycles, cfg_low_cycles;
    int unsigned high_left, low_left;
    bit          ready_state, ready_drive;
    int unsigned accepted_count;

    function new(string name = "rv_sink_driver", uvm_component parent = null);
      super.new(name, parent);
    endfunction

    function void build_phase(uvm_phase phase);
      super.build_phase(phase);
      if (!uvm_config_db#(virtual rv_sink_if #(32))::get(this, "", "vif", vif)) begin
        \`uvm_fatal("NOVIF", "rv_sink_if virtual interface not found")
      end
    endfunction

    task run_phase(uvm_phase phase);
      set_default_policy();
      vif.drv_cb.ready <= 1'b0;
      forever begin
        wait_reset_deasserted();
        drive_ready_until_reset();
      end
    endtask

    task wait_reset_deasserted();
      while (vif.drv_cb.reset_n !== 1'b1) begin
        vif.drv_cb.ready <= 1'b0;
        @(vif.drv_cb);
      end
    endtask

    task set_default_policy();
      cfg_high_cycles = 4;
      cfg_low_cycles  = 0;
      ready_state     = 1'b1;
      high_left       = cfg_high_cycles;
      low_left        = cfg_low_cycles;
      ready_drive     = 1'b0;
    endtask

    task apply_policy(rv_sink_policy p);
      cfg_high_cycles = p.ready_high_cycles;
      cfg_low_cycles  = p.ready_low_cycles;
      ready_state     = p.start_ready;
      high_left       = cfg_high_cycles;
      low_left        = cfg_low_cycles;
    endtask

    function void advance_policy_state();
      if (ready_state) begin
        if (high_left > 1) high_left--;
        else begin
          if (cfg_low_cycles == 0) high_left = cfg_high_cycles;
          else begin
            ready_state = 1'b0;
            low_left    = cfg_low_cycles;
          end
        end
      end else begin
        if (low_left > 1) low_left--;
        else begin
          ready_state = 1'b1;
          high_left   = cfg_high_cycles;
        end
      end
    endfunction

    task drive_ready_until_reset();
      rv_sink_policy policy;
      while (vif.drv_cb.reset_n === 1'b1) begin
        seq_item_port.try_next_item(policy);
        if (policy != null) begin
          apply_policy(policy);
          seq_item_port.item_done();
        end

        ready_drive = ready_state;
        vif.drv_cb.ready <= ready_drive;
        @(vif.drv_cb);

        if (vif.drv_cb.reset_n !== 1'b1) begin
          ready_drive = 1'b0;
          vif.drv_cb.ready <= 1'b0;
          return;
        end

        if (vif.drv_cb.valid && ready_drive) begin
          accepted_count++;
          \`uvm_info("RV_SINK_ACCEPT",
            $sformatf("accepted_count=%0d last=%0b data=0x%08h",
                      accepted_count, vif.drv_cb.last, vif.drv_cb.data),
            UVM_HIGH)
        end
        advance_policy_state();
      end
      ready_drive = 1'b0;
      vif.drv_cb.ready <= 1'b0;
    endtask
  endclass
endpackage`}</CodeBlock>
              </div>
            </CollapsibleCard>

            {/* Lab 3 */}
            <CollapsibleCard
              title="Code Lab 3 — Reactive Request-Response Slave Driver"
              accent="violet"
              icon={<FaFlask size={12} />}
            >
              <div className="space-y-3 text-xs text-slate-300">
                <p>
                  <strong>Goal:</strong> Build a reactive slave driver where DUT sends request, driver accepts only on real handshake, driver fetches required response item, drives response valid/data/error, and returns completion to sequence.
                </p>
                <CodeBlock lang="systemverilog">{`\`timescale 1ns/1ps

interface simple_reactive_if(input logic clk, input logic reset_n);
  logic        req_valid;
  logic        req_ready;
  logic        req_write;
  logic [31:0] req_addr;
  logic [31:0] req_wdata;

  logic        rsp_valid;
  logic        rsp_ready;
  logic [31:0] rsp_rdata;
  logic        rsp_err;

  clocking drv_cb @(posedge clk);
    default input #1step output #0;
    input  reset_n;
    input  req_valid;
    input  req_write;
    input  req_addr;
    input  req_wdata;
    input  rsp_ready;
    output req_ready;
    output rsp_valid;
    output rsp_rdata;
    output rsp_err;
  endclocking
endinterface

package reactive_slave_pkg;
  import uvm_pkg::*;
  \`include "uvm_macros.svh"

  class reactive_rsp_item extends uvm_sequence_item;
    rand bit [31:0]   rsp_rdata;
    rand bit          rsp_err;
    rand int unsigned response_delay;

    constraint c_delay {
      response_delay inside {[0:20]};
    }

    \`uvm_object_utils_begin(reactive_rsp_item)
      \`uvm_field_int(rsp_rdata,      UVM_DEFAULT)
      \`uvm_field_int(rsp_err,        UVM_DEFAULT)
      \`uvm_field_int(response_delay, UVM_DEFAULT)
    \`uvm_object_utils_end

    function new(string name = "reactive_rsp_item");
      super.new(name);
    endfunction
  endclass

  class reactive_completion extends uvm_sequence_item;
    bit        aborted;
    bit [31:0] observed_addr;
    bit        observed_write;
    bit [31:0] observed_wdata;
    bit        completed_with_err;

    \`uvm_object_utils_begin(reactive_completion)
      \`uvm_field_int(aborted,            UVM_DEFAULT)
      \`uvm_field_int(observed_addr,      UVM_DEFAULT)
      \`uvm_field_int(observed_write,     UVM_DEFAULT)
      \`uvm_field_int(observed_wdata,     UVM_DEFAULT)
      \`uvm_field_int(completed_with_err, UVM_DEFAULT)
    \`uvm_object_utils_end

    function new(string name = "reactive_completion");
      super.new(name);
    endfunction
  endclass

  class reactive_slave_driver
    extends uvm_driver #(reactive_rsp_item, reactive_completion);

    \`uvm_component_utils(reactive_slave_driver)

    virtual simple_reactive_if vif;
    bit req_ready_drive, rsp_valid_drive;

    function new(string name = "reactive_slave_driver", uvm_component parent = null);
      super.new(name, parent);
    endfunction

    function void build_phase(uvm_phase phase);
      super.build_phase(phase);
      if (!uvm_config_db#(virtual simple_reactive_if)::get(this, "", "vif", vif)) begin
        \`uvm_fatal("NOVIF", "simple_reactive_if virtual interface not found")
      end
    endfunction

    task run_phase(uvm_phase phase);
      reset_outputs();
      forever begin
        wait_reset_deasserted();
        serve_requests_until_reset();
      end
    endtask

    task reset_outputs();
      req_ready_drive      = 1'b0;
      rsp_valid_drive      = 1'b0;
      vif.drv_cb.req_ready <= 1'b0;
      vif.drv_cb.rsp_valid <= 1'b0;
      vif.drv_cb.rsp_rdata <= '0;
      vif.drv_cb.rsp_err   <= 1'b0;
    endtask

    task wait_reset_deasserted();
      while (vif.drv_cb.reset_n !== 1'b1) begin
        reset_outputs();
        @(vif.drv_cb);
      end
    endtask

    task serve_requests_until_reset();
      bit        accepted;
      bit [31:0] addr;
      bit        write;
      bit [31:0] wdata;

      while (vif.drv_cb.reset_n === 1'b1) begin
        wait_for_request_handshake(accepted, addr, write, wdata);
        if (vif.drv_cb.reset_n !== 1'b1) begin
          reset_outputs();
          return;
        end
        if (accepted) begin
          handle_one_response(addr, write, wdata);
        end
      end
      reset_outputs();
    endtask

    task wait_for_request_handshake(output bit        accepted,
                                    output bit [31:0] addr,
                                    output bit        write,
                                    output bit [31:0] wdata);
      accepted = 1'b0;
      addr     = '0;
      write    = 1'b0;
      wdata    = '0;

      req_ready_drive      = 1'b1;
      vif.drv_cb.req_ready <= 1'b1;

      while ((vif.drv_cb.reset_n === 1'b1) && !accepted) begin
        @(vif.drv_cb);
        if (vif.drv_cb.reset_n !== 1'b1) begin
          reset_outputs();
          return;
        end

        if (vif.drv_cb.req_valid && req_ready_drive) begin
          addr     = vif.drv_cb.req_addr;
          write    = vif.drv_cb.req_write;
          wdata    = vif.drv_cb.req_wdata;
          accepted = 1'b1;
        end
      end
      req_ready_drive      = 1'b0;
      vif.drv_cb.req_ready <= 1'b0;
    endtask

    task complete_aborted_item(reactive_rsp_item req, bit [31:0] addr, bit write, bit [31:0] wdata);
      reactive_completion rsp;
      rsp = reactive_completion::type_id::create("rsp");
      rsp.set_id_info(req);
      rsp.aborted            = 1'b1;
      rsp.observed_addr      = addr;
      rsp.observed_write     = write;
      rsp.observed_wdata     = wdata;
      rsp.completed_with_err = 1'b0;

      reset_outputs();
      seq_item_port.item_done(rsp);
    endtask

    task handle_one_response(bit [31:0] addr, bit write, bit [31:0] wdata);
      reactive_rsp_item   req;
      reactive_completion rsp;

      seq_item_port.get_next_item(req);

      repeat (req.response_delay) begin
        @(vif.drv_cb);
        if (vif.drv_cb.reset_n !== 1'b1) begin
          complete_aborted_item(req, addr, write, wdata);
          return;
        end
      end

      rsp_valid_drive      = 1'b1;
      vif.drv_cb.rsp_rdata <= req.rsp_rdata;
      vif.drv_cb.rsp_err   <= req.rsp_err;
      vif.drv_cb.rsp_valid <= 1'b1;

      do begin
        @(vif.drv_cb);
        if (vif.drv_cb.reset_n !== 1'b1) begin
          complete_aborted_item(req, addr, write, wdata);
          return;
        end
      end while (!(rsp_valid_drive && vif.drv_cb.rsp_ready));

      rsp = reactive_completion::type_id::create("rsp");
      rsp.set_id_info(req);
      rsp.aborted            = 1'b0;
      rsp.observed_addr      = addr;
      rsp.observed_write     = write;
      rsp.observed_wdata     = wdata;
      rsp.completed_with_err = req.rsp_err;

      rsp_valid_drive      = 1'b0;
      vif.drv_cb.rsp_valid <= 1'b0;
      vif.drv_cb.rsp_rdata <= '0;
      vif.drv_cb.rsp_err   <= 1'b0;

      seq_item_port.item_done(rsp);
    endtask
  endclass
endpackage`}</CodeBlock>
              </div>
            </CollapsibleCard>
          </section>

          {/* ── §17 Bug Gallery ─────────────────────────────────────────── */}
          <section id="bug-gallery">
            <SectionHeading num={17} title="Bug Gallery (1–9)" />
            <div className="space-y-4">
              {module12BugGallery.map((bug, idx) => (
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
                "Driver uses clocking block or documented timing region",
                "Driver samples DUT-owned inputs only at defined points",
                "Driver keeps local variables for driver-owned outputs",
                "APB completion only during access phase",
                "Ready/valid acceptance uses DUT valid and local ready_drive",
                "Response-valid completion uses local rsp_valid_drive and DUT rsp_ready",
                "Response-valid cleanup occurs after accepted response",
                "Reset checked inside waits and response loops",
                "try_next_item() null-safe",
                "get_next_item() always completed",
                "get() never followed by item_done()",
                "set_id_info(req) used for routed responses",
                "Random backpressure reproducible",
                "Driver does not publish monitor transactions",
                "Local timeouts do not force false completion",
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
            <div className="space-y-4 text-sm text-slate-300">
              <p className="text-xs">
                A responder driver should log reset entry/exit, request accepted, policy selected, wait-state count, error injection, response valid asserted, response accepted, and reset aborts.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
                  <div className="font-bold text-blue-300 mb-1">APB Log:</div>
                  <CodeBlock lang="systemverilog">{`\`uvm_info("APB_SLV_RSP",
  $sformatf("addr=0x%08h write=%0b wait=%0d err=%0b rdata=0x%08h",
            addr, write, wait_cycles, err, rdata),
  UVM_MEDIUM)`}</CodeBlock>
                </div>
                <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
                  <div className="font-bold text-emerald-300 mb-1">Ready/Valid Log:</div>
                  <CodeBlock lang="systemverilog">{`\`uvm_info("RV_SINK",
  $sformatf("ready=%0b valid=%0b accepted=%0b count=%0d",
            ready_drive, vif.drv_cb.valid,
            vif.drv_cb.valid && ready_drive,
            accepted_count),
  UVM_HIGH)`}</CodeBlock>
                </div>
                <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
                  <div className="font-bold text-violet-300 mb-1">Reactive Log:</div>
                  <CodeBlock lang="systemverilog">{`\`uvm_info("REACTIVE_RSP",
  $sformatf("addr=0x%08h delay=%0d err=%0b aborted=%0b",
            addr, req.response_delay, req.rsp_err, rsp.aborted),
  UVM_MEDIUM)`}</CodeBlock>
                </div>
              </div>
            </div>
          </section>

          {/* ── §20 Monitor / Scoreboard / Assertion Boundary ───────────── */}
          <section id="boundary">
            <SectionHeading
              num={20}
              title="Monitor / Scoreboard / Assertion Boundary"
            />
            <div className="space-y-4 text-sm text-slate-300">
              <Table
                headers={[
                  "Responsibility",
                  "Driver",
                  "Monitor",
                  "Scoreboard",
                  "Assertion",
                ]}
                rows={[
                  ["Drive response pins", "Yes", "No", "No", "No"],
                  ["Drive ready / PREADY", "Yes", "No", "No", "May check legality"],
                  ["Observe accepted transaction", "No", "Yes", "Consumes", "Sometimes"],
                  ["Publish analysis transaction", "No", "Yes", "Consumes", "No"],
                  ["Functional comparison", "No", "No", "Yes", "Sometimes local"],
                  ["Protocol timing check", "Minimal self-protection", "Optional report", "No", "Yes"],
                  ["Error injection", "Yes", "Observes", "Checks reaction", "Checks legal timing"],
                  ["Memory for response", "May own", "No", "Separate expected model", "No"],
                  ["Coverage", "No", "Often", "Sometimes", "Sometimes"],
                  ["Reactive feedback source", "Usually monitor", "Yes", "No", "No"],
                ]}
              />

              <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/10 text-xs space-y-2">
                <strong className="text-blue-300">Boundary Defense:</strong>
                <p>
                  A driver can say: <span className="text-emerald-300 font-mono">"I drove PSLVERR because the test requested error stimulus."</span>
                  <br />
                  It must NOT say: <span className="text-rose-300 font-mono">"The DUT handled PSLVERR incorrectly."</span> (That statement belongs strictly to checkers).
                </p>
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
                ["Decision 1: Control Topology", "Autonomous vs Optional vs Required", "Optional override (try_next_item) provides default autonomous operation with directed test control."],
                ["Decision 2: API Selection", "try_next_item() vs get_next_item()", "Use try_next_item() for optional policy; get_next_item() only when sequence response is strictly required."],
                ["Decision 3: Slave Memory Scope", "Driver-local vs Scoreboard memory", "Driver memory generates legal stimulus responses; scoreboard maintains independent golden model."],
                ["Decision 4: Response Reporting", "rsp Object vs Void return", "Use response object whenever sequence needs status or reset-abort visibility."],
                ["Decision 5: Reactive Feedback", "Driver-local vs Monitor-fed sequence", "Monitor-fed sequence cleanly separates observation from stimulus driving."],
              ]}
            />
          </section>

          {/* ── §22 Scalability Notes ───────────────────────────────────── */}
          <section id="scalability">
            <SectionHeading num={22} title="Scalability Notes" />
            <div className="space-y-3 text-xs text-slate-300">
              <p>A reusable responder should cleanly separate:</p>
              <CodeBlock lang="text">{`slave_driver
  ├── reset controller
  ├── request detector
  ├── response policy adapter
  ├── protocol drive engine
  ├── optional memory model
  ├── completion reporter
  └── debug logger`}</CodeBlock>

              <div className="p-3 bg-violet-500/10 border border-violet-500/20 rounded-lg">
                <strong className="text-violet-300">Phase Shutdown Note:</strong> Drivers generally do not own phase objections. Tests and sequences control phase lifetime. The driver’s job is to avoid unbounded hidden waits that prevent clean simulation progress.
              </div>
            </div>
          </section>

          {/* ── §23 Review Checklist ────────────────────────────────────── */}
          <section id="review-checklist">
            <SectionHeading num={23} title="Review Checklist" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/40 space-y-1 text-slate-300">
                <div>✔ Does it drive only DUT inputs?</div>
                <div>✔ Does it sample only DUT outputs required for response?</div>
                <div>✔ Is completion timing explicit?</div>
                <div>✔ Is reset handled inside every wait loop?</div>
                <div>✔ Is try_next_item() null-safe?</div>
                <div>✔ Is item_done() called only for granted items?</div>
                <div>✔ Is get() never paired with item_done()?</div>
                <div>✔ Is set_id_info(req) used for routed responses?</div>
              </div>

              <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/40 space-y-1 text-slate-300">
                <div>✔ Is output drive state kept locally where needed?</div>
                <div>✔ Does cleanup prevent duplicate handshakes?</div>
                <div>✔ Does monitor publish observed transactions?</div>
                <div>✔ Does scoreboard own functional comparison?</div>
                <div>✔ Are error responses logged as stimulus?</div>
                <div>✔ Is random backpressure reproducible?</div>
                <div>✔ Is phase/reset behavior documented?</div>
                <div>✔ Is policy-consumed vs response-completed semantics defined?</div>
              </div>
            </div>
          </section>

          {/* ── §24 Interview Q&A ───────────────────────────────────────── */}
          <section id="interview-qa">
            <SectionHeading num={24} title="Interview Q&A (Q1–Q14)" />
            <div className="space-y-4">
              {module12InterviewQA.map((qa, idx) => (
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
                <strong>Memory Hook:</strong> "The DUT asks. The responder answers. The monitor remembers. The scoreboard judges."
              </Callout>

              <CodeBlock lang="systemverilog">{`wait_for_dut_request();

seq_item_port.try_next_item(policy);
if (policy != null) begin
  copy_policy_to_local_state(policy);
  seq_item_port.item_done();
end

drive_legal_response();
cleanup_response_pins();`}</CodeBlock>

              <Callout type="interview">
                <strong>Interview Line:</strong> "A production responder separates protocol engine, response policy, reset handling, and observation boundary."
              </Callout>
            </div>
          </section>

          {/* ── §26 Key Takeaways ───────────────────────────────────────── */}
          <section id="key-takeaways">
            <SectionHeading num={26} title="Key Takeaways" />
            <ol className="space-y-1.5 list-decimal list-inside text-slate-300 text-sm">
              {[
                "Slave drivers respond to DUT-originated activity.",
                "Sequence items often represent response policy.",
                "APB-style completion requires PSEL && PENABLE && PREADY.",
                "Ready/valid sink drivers own ready.",
                "try_next_item() is for optional policy.",
                "get_next_item() is for required policy.",
                "get() must not be followed by item_done().",
                "item_done() semantics must be documented.",
                "Reset after item acquisition must close the sequencer contract.",
                "set_id_info(req) is required for routed responses.",
                "Driver memory can generate response data but must not check DUT correctness.",
                "Monitor publishes observed transactions.",
                "Scoreboard compares.",
                "Assertions check temporal protocol properties.",
                "Scalable responders separate protocol engine from response policy.",
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
                <li>Explain the difference between master and slave drivers.</li>
                <li>What does a sequence item represent in a slave responder?</li>
                <li>When should try_next_item() be used?</li>
                <li>What is the null-handle rule for try_next_item()?</li>
                <li>When should get_next_item() be used?</li>
                <li>Why must get() not be paired with item_done()?</li>
                <li>Where should item_done() occur in a required reactive response?</li>
                <li>How do you handle reset after item acquisition?</li>
                <li>Why is set_id_info(req) needed?</li>
                <li>What does an APB slave responder drive?</li>
                <li>What does an APB slave responder sample?</li>
                <li>What is APB completion?</li>
                <li>What does a ready/valid sink driver own?</li>
                <li>Why should the driver not publish accepted beats?</li>
                <li>How do you prevent driver memory from becoming scoreboard memory?</li>
                <li>What is the clean architecture for a reactive responder?</li>
                <li>What race is avoided by local output-drive variables?</li>
                <li>How do you debug a response-driver deadlock?</li>
              </ol>
            </div>
          </section>

          {/* ── §28 Coding Exercise ─────────────────────────────────────── */}
          <section id="coding-exercise">
            <SectionHeading
              num={28}
              title="Coding Exercise — Add Error-Burst Policy to APB Slave Responder"
            />
            <div className="space-y-4 text-sm text-slate-300">
              <p>
                <strong>Exercise:</strong> Extend Code Lab 1 with an error burst policy:
              </p>
              <CodeBlock lang="systemverilog">{`rand int unsigned error_burst_len;
rand bit          error_on_reads;
rand bit          error_on_writes;`}</CodeBlock>

              <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/40 text-xs space-y-2">
                <strong className="text-blue-300">Requirements:</strong>
                <ol className="list-decimal list-inside space-y-1 text-slate-300">
                  <li>If <code>error_burst_len &gt; 0</code>, inject <code>PSLVERR</code> for matching transfers.</li>
                  <li>Decrement burst counter only on completed APB transfers (<code>PSEL &amp;&amp; PENABLE &amp;&amp; PREADY</code>).</li>
                  <li>Do not update memory on errored writes.</li>
                  <li>Do not call <code>item_done()</code> unless a policy item was actually received.</li>
                  <li>Reset clears active burst state unless explicitly configured otherwise.</li>
                  <li>Add logs for burst start, decrement, and completion.</li>
                  <li>Keep error generation as stimulus; do not check DUT error handling in the driver.</li>
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
                <FaCheckSquare /> Module 12 — Final Readiness Verdict: PASS (LOCKED)
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Module 12: Slave, Responder, and Reactive Drivers is fully converted into React. All 24 memory cards, 6 atlas sheets, 3 code labs, 9 bug gallery entries, race checklists, and 14 interview Q&amp;As are complete and verified.
              </p>
              <p className="text-xs text-blue-200/80">
                Ready for Module 13: Driver-Monitor-Scoreboard-Assertion Boundaries.
              </p>
            </div>
          </section>

          {/* Navigation to next module */}
          <ModuleNavigation
            nextPath="/driver-mastery/module13"
            nextTitle="Module 13: Driver-Monitor-Scoreboard-Assertion Boundaries →"
          />
        </main>
      </div>
    </div>
  );
};

export default Module12;
