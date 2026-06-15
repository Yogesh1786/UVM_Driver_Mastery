import {
  FaBook,
  FaBug,
  FaFlask,
  FaQuestionCircle,
  FaListAlt,
  FaCheckSquare,
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
// DATA — Memory Cards
// ─────────────────────────────────────────────────────────────────────────────

const module1MemoryCards = [
  {
    title: "Card 1 — Driver Is a Translator, Not a Checker",
    accent: "violet",
    hook: "The driver is the bus pilot, not the referee.",
    concept:
      "A UVM driver translates sequence-item intent into legal pin-level activity. It may observe DUT outputs needed for protocol progress, but it must not judge functional correctness.",
    code: `seq_item_port.get_next_item(req);
drive_protocol(req);
seq_item_port.item_done();`,
    trap: "Putting expected-vs-actual comparison inside the driver.",
    interview:
      "A driver executes protocol intent; the monitor observes behavior; the scoreboard decides correctness.",
  },
  {
    title: "Card 2 — Transaction Intent Is Not Pin Timing",
    accent: "blue",
    hook: "A transaction says 'what'; the protocol says 'when.'",
    concept:
      "A sequence item may contain addr, data, kind, or last, but the driver must know reset, idle, handshake, wait states, cleanup, and response timing before driving pins.",
    code: `req.data = 8'hA5; // intent
// Driver decides when this appears on vif.data.`,
    trap: "Directly assigning transaction fields to pins without defining completion.",
    interview:
      "I never start coding a driver before defining the waveform contract.",
  },
  {
    title: "Card 3 — Protocol First, UVM Second",
    accent: "amber",
    hook: "UVM cannot repair an undefined waveform.",
    concept:
      "The driver algorithm must be derived from the protocol contract. UVM APIs move items between sequence and driver; they do not define bus timing.",
    code: `// Wrong starting point:
seq_item_port.get_next_item(req);

// Correct prior question:
// What pin-level event means this item is complete?`,
    trap: "Learning get_next_item() before defining the interface timing contract.",
    interview:
      "UVM gives the transaction delivery mechanism; the protocol defines legal execution.",
  },
  {
    title: "Card 4 — The Driver Owns DUT Inputs",
    accent: "emerald",
    hook: "Drive only what belongs to your side of the interface.",
    concept:
      "An active master/source driver drives DUT input pins. It may read DUT outputs such as ready or response signals only to complete the protocol.",
    code: `vif.drv_cb.valid <= 1'b1; // driver-owned

if (vif.drv_cb.ready) begin // DUT-owned, observed for handshake
end`,
    trap: "Driving ready in a source driver when ready is a DUT output.",
    interview:
      "The first thing I check in a driver review is signal ownership.",
  },
  {
    title: "Card 5 — Completion Is a Contract",
    accent: "violet",
    hook: "item_done() means 'I am done with this item,' not 'I wrote some pins.'",
    concept:
      "For a non-pipelined driver, item_done() normally occurs after the transaction has completed at the pin level and the driver has cleaned up or applied reset-abort policy.",
    code: `drive_until_handshake(req);
cleanup_bus();
seq_item_port.item_done();`,
    trap: "Calling item_done() immediately after asserting valid.",
    interview:
      "In a non-pipelined driver, I call item_done() after protocol completion, not after starting the transfer.",
  },
  {
    title: "Card 6 — get_next_item() Requires item_done()",
    accent: "blue",
    hook: "If you pull and hold, you must release.",
    concept:
      "get_next_item() grants the driver an item while keeping the sequence blocked until the driver calls item_done().",
    code: `seq_item_port.get_next_item(req);
drive_one(req);
seq_item_port.item_done();`,
    trap: "Taking an item and waiting forever on a DUT signal without reset escape.",
    interview:
      "Every successful get_next_item() needs an eventual item_done() under the chosen driver policy.",
  },
  {
    title: "Card 7 — get() Is a Different Contract",
    accent: "amber",
    hook: "get() consumes; get_next_item() borrows until done.",
    concept:
      "get() retrieves and consumes an item. It is not paired with item_done().",
    code: `seq_item_port.get(req);
drive_one(req);
// No item_done() here.`,
    trap: "Mixing get() and item_done() because both examples appear in UVM codebases.",
    interview:
      "I do not mix sequence item pull APIs unless the driver contract explicitly explains why.",
  },
  {
    title: "Card 8 — try_next_item() Can Return Nothing",
    accent: "emerald",
    hook: "Optional work requires null handling.",
    concept:
      "try_next_item() may return null. If it returns a valid item, the driver accepted it and must complete it with item_done().",
    code: `seq_item_port.try_next_item(req);

if (req != null) begin
  drive_one(req);
  seq_item_port.item_done();
end
else begin
  drive_idle_cycle();
end`,
    trap: "Dereferencing req without null check.",
    interview:
      "With try_next_item(), null means no grant; non-null means normal ownership rules apply.",
  },
  {
    title: "Card 9 — Response Is Optional, Not Automatic",
    accent: "violet",
    hook: "Not every item needs a reply.",
    concept:
      "A response object is required only when the sequence needs returned information such as read data, status, error, or delayed completion.",
    code: `local_rsp = my_rsp::type_id::create("local_rsp");
local_rsp.set_id_info(req);
seq_item_port.put_response(local_rsp);`,
    trap: "Creating responses for simple write-only transfers with no consumer.",
    interview:
      "I add responses only when the sequence contract needs returned protocol information.",
  },
  {
    title: "Card 10 — set_id_info(req) Protects Routing",
    accent: "blue",
    hook: "A response must know where to go.",
    concept:
      "When response routing matters, copy sequence ID information from the request into the response using set_id_info(req).",
    code: `local_rsp.set_id_info(req);`,
    trap: "Sending a response that cannot be routed back to the originating sequence.",
    interview:
      "For response-based drivers, I preserve request identity before calling put_response().",
  },
  {
    title: "Card 11 — Reset Must Not Deadlock the Sequencer",
    accent: "rose",
    hook: "Reset is not an excuse to strand an item.",
    concept:
      "If reset asserts after the driver has accepted an item, the driver must cleanup and complete or report the item according to a documented abort policy.",
    code: `aborted = drive_or_abort(req);
seq_item_port.item_done();`,
    trap: "Waiting forever for handshake while reset holds the DUT inactive.",
    interview:
      "My reset policy guarantees no accepted item leaves the sequencer permanently blocked.",
  },
  {
    title: "Card 12 — Cleanup Is Part of Driving",
    accent: "amber",
    hook: "A transfer is not done until the bus is left legal.",
    concept:
      "After completion or abort, the driver must return driven signals to legal idle values unless the protocol defines otherwise.",
    code: `vif.drv_cb.valid <= 1'b0;
vif.drv_cb.data  <= '0;
vif.drv_cb.last  <= 1'b0;`,
    trap: "Leaving valid asserted after item_done().",
    interview:
      "I include cleanup in the completion contract, not as an afterthought.",
  },
  {
    title: "Card 13 — Driver Observes Completion, Monitor Observes Reality",
    accent: "emerald",
    hook: "Driver observes enough to proceed; monitor observes enough to reconstruct.",
    concept:
      "The driver may observe ready to know when to drop valid. The monitor observes valid, ready, and payload to reconstruct the actual transaction.",
    code: `if (vif.drv_cb.ready)
  accepted = 1;`,
    trap: "Using driver-observed activity as scoreboard actual data.",
    interview: "The monitor is the source of observed truth, not the driver.",
  },
  {
    title: "Card 14 — The Driver Must Not Predict DUT Output Internally",
    accent: "violet",
    hook: "Prediction belongs downstream.",
    concept:
      "The driver can send stimulus and capture protocol response fields if needed, but expected-data prediction belongs in sequence/reference model/scoreboard architecture.",
    code: `// Suspicious in active driver:
if (vif.result !== expected)
  \`uvm_error("BAD", "Mismatch")`,
    trap: "Adding functional checks in the driver to 'save time.'",
    interview:
      "I keep the active driver stimulus-focused so debug ownership stays clean.",
  },
  {
    title: "Card 15 — Clocking/Sampling Is a Race Boundary",
    accent: "blue",
    hook: "Same clock does not mean same scheduling region.",
    concept:
      "Driver timing must avoid racing the DUT and monitor. Clocking blocks help define drive and sample timing, but the environment still needs a clear convention.",
    code: `@(vif.drv_cb);
vif.drv_cb.valid <= 1'b1;`,
    trap: "Assuming raw @(posedge clk) automatically means race-free DUT interaction.",
    interview:
      "I define drive and sample timing explicitly; otherwise the driver can pass or fail depending on scheduling.",
  },
  {
    title: "Card 16 — Blocking vs Nonblocking Has Intent",
    accent: "amber",
    hook: "Combinational variables block; interface flops schedule.",
    concept:
      "Drivers commonly use blocking assignments for local variables/control flow and scheduled assignments through the interface or clocking block for signal updates.",
    code: `accepted = 0;              // local variable
vif.drv_cb.valid <= 1'b1;  // interface drive`,
    trap: "Using blocking assignment to interface pins at a clock edge without understanding race implications.",
    interview: "I use assignment style based on scheduling intent, not habit.",
  },
  {
    title: "Card 17 — Minimal Checks Are Not Scoreboarding",
    accent: "emerald",
    hook: "Safety checks protect the driver; scoreboards judge the DUT.",
    concept:
      "The driver can reject impossible or unsupported items before driving them. It should not compare DUT results against expected functional behavior.",
    code: `if (req == null)
  \`uvm_fatal("NULLREQ", "Null request")`,
    trap: "Putting full protocol/property checking into the driver instead of assertions.",
    interview:
      "Driver-side checks are guardrails, not correctness infrastructure.",
  },
  {
    title: "Card 18 — Pipelining Changes Completion Meaning",
    accent: "violet",
    hook: "Acceptance and completion can split.",
    concept:
      "In non-pipelined drivers, item completion usually follows transfer completion. In pipelined drivers, request acceptance may be separate from response completion.",
    code: `// Module 1 default:
drive_to_completion(req);
seq_item_port.item_done();`,
    trap: "Applying non-pipelined item_done() rules blindly to AXI-like protocols.",
    interview:
      "I define whether item_done() means request acceptance or full response completion.",
  },
  {
    title: "Card 19 — Driver Logs Should Explain Intent and Timing",
    accent: "blue",
    hook: "Logs should reconstruct driver decisions.",
    concept:
      "Useful driver logs show item acceptance, drive start, handshake completion, abort, cleanup, and response.",
    code: `\`uvm_info("DRV_START",
  $sformatf("Driving data=0x%0h last=%0b", req.data, req.last),
  UVM_MEDIUM)`,
    trap: "Logging only 'driver started' and 'driver done.'",
    interview:
      "My driver logs are aligned to protocol milestones, not random code locations.",
  },
  {
    title: "Card 20 — The Driver Is Not the Reset Generator",
    accent: "rose",
    hook: "Most protocol drivers react to reset; they do not own reset.",
    concept:
      "Unless the agent is specifically a reset driver, a normal protocol driver observes reset and cleans its own driven outputs.",
    code: `while (vif.reset_n !== 1'b1)
  @(vif.drv_cb);`,
    trap: "Driving reset from inside a bus driver without architecture agreement.",
    interview:
      "I separate reset control from protocol driving unless the environment explicitly combines them.",
  },
  {
    title: "Card 21 — Forever Loops Need Exit Thinking",
    accent: "amber",
    hook: "A forever loop is safe only if blocking waits are controlled.",
    concept:
      "UVM drivers often run forever in run_phase, but blocking waits must handle reset and phase-exit risk. The driver should not hide permanent deadlock behind an uncontrolled wait.",
    code: `forever begin
  wait_reset_released();
  seq_item_port.get_next_item(req);
  drive_one(req);
  seq_item_port.item_done();
end`,
    trap: "A driver stuck forever in a wait that prevents clean test completion or masks a protocol deadlock.",
    interview:
      "I review every blocking wait for reset escape, timeout policy, and phase-exit implications.",
  },
  {
    title: "Card 22 — Request Handles Are Not Private Copies",
    accent: "emerald",
    hook: "A handle is a reference, not a snapshot.",
    concept:
      "After item_done(), the driver should not mutate or depend on the request handle. If it needs data later, it should copy fields or clone the transaction before releasing ownership.",
    code: `bit [7:0] data_copy;

seq_item_port.get_next_item(req);
data_copy = req.data;
drive_one(req);
seq_item_port.item_done();`,
    trap: "Saving req in a queue for delayed response after calling item_done() without cloning/copying.",
    interview:
      "I treat item_done() as the end of driver ownership of that request handle.",
  },
  {
    title: "Card 23 — Config and Interface Binding Are Driver Preconditions",
    accent: "violet",
    hook: "No virtual interface, no driver.",
    concept:
      "A driver cannot drive pins without a valid virtual interface. Missing config-db binding is a fatal environment setup error.",
    code: `if (!uvm_config_db#(virtual simple_vr_if)::get(this, "", "vif", vif))
  \`uvm_fatal("NOVIF", "Missing virtual interface")`,
    trap: "Letting simulation continue with a null virtual interface and failing later with unclear errors.",
    interview: "I fail fast on missing driver infrastructure.",
  },
  {
    title: "Card 24 — Clean Ownership Enables Scalable VIP",
    accent: "blue",
    hook: "Boundary discipline scales; clever shortcuts rot.",
    concept:
      "A small driver can survive sloppy boundaries. A reusable VIP cannot. Scalable drivers preserve ownership between stimulus, observation, checking, response, reset, and debug.",
    code: `// Driver: drive pins.
// Monitor: publish observed transaction.
// Scoreboard: compare.`,
    trap: "Making the driver 'smart' by mixing stimulus, monitor, and scoreboard logic.",
    interview:
      "For VIP-quality architecture, strict component boundaries matter more than short-term convenience.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// DATA — Bug Gallery
// ─────────────────────────────────────────────────────────────────────────────

const module1BugGallery = [
  {
    title: "Bug 1 — Calling item_done() Too Early",
    symptom:
      "Sequence starts next item while previous item is still physically active. Back-to-back transfers corrupt payload. Monitor sees overlapping or unstable transactions.",
    waveform: `valid:  1 1 1
data :  A B B
ready:  0 0 1
Data changes before first transfer is accepted.`,
    cause: "The driver released the sequencer item before protocol completion.",
    bad: `seq_item_port.get_next_item(req);
vif.valid <= 1'b1;
seq_item_port.item_done();
wait(vif.ready);
vif.valid <= 1'b0;`,
    fix: `seq_item_port.get_next_item(req);
drive_until_ready(req);
cleanup_bus();
seq_item_port.item_done();`,
    interview:
      "item_done() was treated as a UVM formality instead of a protocol completion boundary.",
  },
  {
    title: "Bug 2 — get() Paired With item_done()",
    symptom:
      "Sequencer behavior becomes incorrect or simulator reports protocol misuse. Driver contract is ambiguous.",
    waveform: "No obvious waveform clue. This is a UVM API contract bug.",
    cause:
      "get() consumes the item. item_done() belongs to get_next_item() / successful try_next_item() style.",
    bad: `seq_item_port.get(req);
drive_one(req);
seq_item_port.item_done(); // Wrong for get() style`,
    fix: `seq_item_port.get(req);
drive_one(req);

// Or use the correct pairing:
// seq_item_port.get_next_item(req);
// drive_one(req);
// seq_item_port.item_done();`,
    interview:
      "I do not mix sequence item pull APIs. Each API has a specific ownership contract.",
  },
  {
    title: "Bug 3 — No Reset Escape While Waiting for Ready",
    symptom:
      "Simulation hangs after reset. Sequence never completes. Objection may remain raised elsewhere because sequence is blocked.",
    waveform: `reset_n: 1 0 0 0 1
valid  : 1 1 1 1 1
ready  : 0 0 0 0 0`,
    cause:
      "The driver accepted an item, then waited on ready without reset-abort policy.",
    bad: `seq_item_port.get_next_item(req);
vif.valid <= 1'b1;
wait(vif.ready == 1'b1);
seq_item_port.item_done();`,
    fix: `forever begin
  @(vif.drv_cb);

  if (vif.drv_cb.reset_n !== 1'b1) begin
    reset_outputs();
    aborted = 1'b1;
    return;
  end

  if (vif.drv_cb.ready) begin
    reset_outputs();
    return;
  end
end`,
    interview:
      "Any blocking protocol wait inside a driver must be reviewed for reset escape.",
  },
  {
    title: "Bug 4 — Driver Becomes Scoreboard",
    symptom:
      "Duplicate errors from driver and scoreboard. Debug ownership becomes unclear. Driver cannot be reused as VIP without test-specific prediction logic.",
    waveform: "Waveform may be correct; architecture is wrong.",
    cause: "Functional correctness was checked inside the active driver.",
    bad: `drive_read(req);

if (vif.rdata !== req.expected_data) begin
  \`uvm_error("MISMATCH", "Read data mismatch")
end`,
    fix: `// Driver captures protocol response if required.
local_rsp.rdata = sampled_rdata;
seq_item_port.put_response(local_rsp);

// Monitor/scoreboard handle observed-vs-expected comparison.`,
    interview:
      "The driver may capture response data, but scoreboard owns correctness comparison.",
  },
  {
    title: "Bug 5 — Driver Samples Ready in Wrong Timing Region",
    symptom:
      "Passes in one simulator, fails in another. Monitor and DUT disagree on whether transfer occurred. Intermittent zero-cycle handshakes appear.",
    waveform:
      "Ready/valid transition appears on the same edge with ambiguous sampling.",
    cause: "Raw posedge driving/sampling caused scheduling race.",
    bad: `@(posedge vif.clk);
vif.valid = 1'b1;

if (vif.ready) begin
  vif.valid = 1'b0;
end`,
    fix: `@(vif.drv_cb);
vif.drv_cb.valid <= 1'b1;

@(vif.drv_cb);
if (vif.drv_cb.ready) begin
  vif.drv_cb.valid <= 1'b0;
end`,
    interview:
      "Driver timing must specify simulator scheduling intent, not only clock edge intent.",
  },
  {
    title: "Bug 6 — Response Without ID Routing",
    symptom:
      "Sequence waiting for response does not receive expected response. Response appears lost or routed incorrectly. Multi-sequence scenarios fail.",
    waveform: "Bus waveform is correct; sequence-level response wait hangs.",
    cause: "Response identity was not copied from request.",
    bad: `local_rsp = simple_rsp::type_id::create("local_rsp");
local_rsp.rdata = sampled_data;
seq_item_port.put_response(local_rsp);`,
    fix: `local_rsp = simple_rsp::type_id::create("local_rsp");
local_rsp.set_id_info(req);
local_rsp.rdata = sampled_data;
seq_item_port.put_response(local_rsp);`,
    interview:
      "When response routing matters, set_id_info(req) preserves the request-response association.",
  },
  {
    title: "Bug 7 — Driver Drives Both Sides of Interface",
    symptom:
      "DUT backpressure never tested. Interface contention if DUT also drives ready. Monitor sees unrealistic always-ready behavior.",
    waveform: "ready is always high even when DUT should throttle.",
    cause: "Driver violated signal ownership.",
    bad: `vif.valid <= 1'b1;
vif.ready <= 1'b1; // Wrong if ready is DUT-owned`,
    fix: `vif.drv_cb.valid <= 1'b1;

// Observe ready only.
if (vif.drv_cb.ready) begin
  reset_outputs();
end`,
    interview:
      "I always classify every signal as driver-owned, DUT-owned, shared, tri-state, or passive before coding.",
  },
  {
    title: "Bug 8 — try_next_item() Null Dereference",
    symptom:
      "Null object access. Random failure only when no sequence item is available. Driver may call item_done() without owning an item.",
    waveform: "No bus activity before failure, or idle cycle missing.",
    cause: "try_next_item() can return null. The driver failed to check.",
    bad: `seq_item_port.try_next_item(req);
drive_one(req);
seq_item_port.item_done();`,
    fix: `seq_item_port.try_next_item(req);

if (req != null) begin
  drive_one(req);
  seq_item_port.item_done();
end
else begin
  drive_idle_cycle();
end`,
    interview:
      "try_next_item() is an optional-grant API. Null means no ownership and no item_done().",
  },
  {
    title: "Bug 9 — Reusing Request Handle After item_done()",
    symptom:
      "Delayed response gets wrong data. Sequence item appears modified after completion. Debug shows impossible transaction mutation.",
    waveform:
      "Bus waveform may be correct; object printouts or response data are inconsistent.",
    cause:
      "The driver stored the request handle instead of copying or cloning required fields before releasing item ownership.",
    bad: `seq_item_port.get_next_item(req);
outstanding_q.push_back(req);
drive_request(req);
seq_item_port.item_done();

// Later:
outstanding_q[0].status = DONE;`,
    fix: `typedef struct {
  bit [7:0] data;
  int       transaction_id;
} simple_meta_s;

simple_meta_s meta;

seq_item_port.get_next_item(req);

meta.data           = req.data;
meta.transaction_id = req.get_transaction_id();

drive_request(req);
seq_item_port.item_done();

outstanding_meta_q.push_back(meta);`,
    interview:
      "After item_done(), the driver should not assume ownership of the request object. For delayed work, copy metadata or clone intentionally.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// DATA — Interview Q&A
// ─────────────────────────────────────────────────────────────────────────────

const module1InterviewQA = [
  {
    q: "Q1. What is a UVM driver?",
    short:
      "A UVM driver converts sequence items into legal pin-level protocol activity and reports completion or response back to the sequencer.",
    deep: "A driver is the active protocol execution component of a UVM agent. It receives transaction intent from the sequencer, drives DUT input signals according to the protocol timing contract, observes only required DUT outputs such as ready or response signals, handles reset/cleanup, and calls item_done() or sends a response according to the selected sequence-driver contract.",
    followup: "Should a driver check whether DUT output is correct?",
    answer:
      "No. Functional correctness belongs in monitor/scoreboard/assertions. The driver may capture protocol responses but should not become the checker.",
    code: `seq_item_port.get_next_item(req);
drive_one(req);
seq_item_port.item_done();`,
  },
  {
    q: "Q2. Where should item_done() be called?",
    short:
      "After the driver has safely completed its ownership of the item according to the driver contract.",
    deep: "For a non-pipelined driver, item_done() usually comes after the pin-level transfer completes and the bus is cleaned up. If reset aborts the item after it was accepted, the driver must still end ownership according to the documented reset policy. For pipelined drivers, item_done() may mean request acceptance rather than final response completion, but that split must be explicit.",
    followup:
      "Is it legal to call item_done() immediately after asserting valid?",
    answer:
      "Not for a non-pipelined valid/ready driver. The item is not complete until the handshake is observed or reset-abort policy completes ownership.",
    code: `drive_until_handshake(req);
cleanup_bus();
seq_item_port.item_done();`,
  },
  {
    q: "Q3. What is the difference between get_next_item() and get()?",
    short:
      "get_next_item() must be paired with item_done(). get() consumes the item and must not be paired with item_done().",
    deep: "get_next_item() grants the item to the driver while keeping the sequence blocked until item_done() is called. get() retrieves and consumes the item in one operation. Mixing these contracts causes incorrect sequencer-driver behavior.",
    followup: "Which one do you prefer?",
    answer:
      "For basic non-pipelined drivers, get_next_item()/item_done() is explicit and interview-friendly. Other styles are valid when the architecture requires them.",
    code: `seq_item_port.get_next_item(req);
drive_one(req);
seq_item_port.item_done();`,
  },
  {
    q: "Q4. What must be handled with try_next_item()?",
    short: "The driver must check whether the returned request is null.",
    deep: "try_next_item() is an optional-grant API. If no item is available, it may return null; the driver owns no item and must not call item_done(). If it returns a non-null item, normal ownership applies and the driver must eventually call item_done().",
    followup: "What should the driver do when no item is available?",
    answer:
      "Drive legal idle behavior, wait a cycle, or perform protocol-specific idle work.",
    code: `seq_item_port.try_next_item(req);

if (req != null) begin
  drive_one(req);
  seq_item_port.item_done();
end`,
  },
  {
    q: "Q5. When should a driver send a response?",
    short:
      "When the sequence needs returned information such as read data, status, error, or delayed completion.",
    deep: "Simple write-only drivers often do not need responses. Read or status-based protocols usually do. When response routing matters, the driver should create a response object, call set_id_info(req), populate response fields, and send it using the selected response mechanism such as put_response().",
    followup: "Is set_id_info(req) always required?",
    answer:
      "It is required when response routing back to the originating sequence matters. It is a safe standard practice for response-producing drivers.",
    code: `local_rsp = simple_rsp::type_id::create("local_rsp");
local_rsp.set_id_info(req);
seq_item_port.put_response(local_rsp);`,
  },
  {
    q: "Q6. What should a driver do if reset occurs during a transaction?",
    short:
      "Cleanup driven outputs and complete or report the accepted item according to a documented reset-abort policy.",
    deep: "A driver must not leave the sequencer blocked after it accepts an item. If reset occurs mid-transfer, the driver should deassert driven controls, log the abort, optionally send an abort response if the architecture requires it, call item_done() for a get_next_item() contract, and wait for reset release before accepting more traffic.",
    followup: "Should the driver retry the item automatically?",
    answer:
      "Only if the driver contract says so. Retry vs abort is protocol/environment-specific.",
    code: `aborted = drive_one_or_abort(req);
seq_item_port.item_done();`,
  },
  {
    q: "Q7. What does the driver own compared to the monitor?",
    short:
      "The driver owns stimulus execution. The monitor owns passive observation and transaction reconstruction.",
    deep: "The driver drives interface signals and may observe handshake or response signals needed for progress. The monitor watches the bus independently and publishes observed transactions to analysis components. Scoreboards should trust monitor-observed data, not driver intent.",
    followup: "Why not use driver logs as actual results?",
    answer:
      "Driver logs show intended or locally observed execution. The monitor reconstructs what actually happened on the interface.",
    code: `// Driver:
vif.drv_cb.valid <= 1'b1;

// Monitor:
analysis_port.write(observed_tr);`,
  },
  {
    q: "Q8. Why are clocking blocks useful in drivers?",
    short: "They help make drive and sample timing explicit.",
    deep: "A raw @(posedge clk) does not by itself define whether the driver drives before or after DUT sampling or when it samples DUT outputs relative to monitor sampling. Clocking blocks provide a structured way to specify input and output skew. They still require a compatible DUT and monitor timing convention.",
    followup: "Are clocking blocks mandatory?",
    answer:
      "No, but if not used, the testbench must still document and enforce drive/sample scheduling.",
    code: `clocking drv_cb @(posedge clk);
  default input #1step output #0;
  output valid, data;
  input ready;
endclocking`,
  },
  {
    q: "Q9. How do you prevent a driver from becoming a scoreboard?",
    short:
      "Allow only protocol-safety checks in the driver; move observed-vs-expected correctness checks to monitor/scoreboard/assertions.",
    deep: "The driver may reject invalid stimulus or capture protocol response fields. It should not compare DUT results against a reference model. Keeping that boundary clean improves reuse, debug clarity, and architectural scalability.",
    followup: "Can the driver check for timeout?",
    answer:
      "Yes, if timeout is an environment policy or safety check. But protocol liveness properties are often better handled by assertions or test-level watchdogs.",
    code: `if (req == null)
  \`uvm_fatal("NULLREQ", "Null request")`,
  },
  {
    q: "Q10. What is the request-handle lifetime issue in drivers?",
    short:
      "After item_done(), the driver should not mutate or depend on the request handle.",
    deep: "A sequence item is an object handle. If the driver stores it and uses it after completion, it can create aliasing bugs, delayed response corruption, or mutation visible outside the driver. For delayed work, the driver should copy required fields or intentionally clone the item before releasing ownership.",
    followup: "When is cloning needed?",
    answer:
      "When the driver needs a stable object-like copy after request completion, especially for pipelined or delayed-response architectures.",
    code: `data_copy = req.data;
seq_item_port.item_done();`,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// DATA — Sections (sidebar TOC)
// ─────────────────────────────────────────────────────────────────────────────

const module1Sections = [
  { id: "objectives", label: "Learning Objectives" },
  { id: "scope", label: "Scope & Non-Scope" },
  { id: "mental-model", label: "Protocol Mental Model" },
  { id: "timing", label: "Timing / Waveform Contract" },
  { id: "boundary", label: "Driver Responsibility Boundary" },
  { id: "contract", label: "Seq-Sequencer-Driver Contract" },
  { id: "reset", label: "Reset / Abort Policy" },
  { id: "response", label: "Response / Completion Policy" },
  { id: "ownership-matrix", label: "Protocol Ownership Matrix" },
  { id: "memory", label: "Memory Cards" },
  { id: "atlas", label: "Atlas Sheets" },
  { id: "codelabs", label: "Code Labs" },
  { id: "bugs", label: "Bug Gallery" },
  { id: "race", label: "Race-Condition Checklist" },
  { id: "debug", label: "Debug / Log Strategy" },
  {
    id: "monitor-boundary",
    label: "Monitor / Scoreboard / Assertion Boundary",
  },
  { id: "arch-decisions", label: "Architectural Decision Points" },
  { id: "scalability", label: "Scalability Notes" },
  { id: "review", label: "Review Checklist" },
  { id: "interview", label: "Interview Q&A" },
  { id: "recall", label: "Final Recall Card" },
  { id: "takeaways", label: "Key Takeaways" },
  { id: "interview-questions", label: "Interview Questions" },
  { id: "exercise", label: "Coding Exercise" },
];

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

const Module1 = () => {
  return (
    <div className="relative min-h-screen bg-slate-950 text-white font-sans">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-150 h-62.5 bg-linear-to-r from-violet-600/15 to-indigo-600/15 blur-[100px] rounded-full" />

      <div className="relative z-10 flex max-w-7xl mx-auto">
        {/* ── Sidebar TOC (desktop) ────────────────────────────────────── */}
        <ModuleSidebar
          moduleNumber="1"
          title="Core Mental Model of a UVM Driver"
          sections={module1Sections}
        />

        {/* ── Main Content ─────────────────────────────────────────────── */}
        <main className="flex-1 min-w-0 px-6 py-8 pb-24 max-w-4xl">
          {/* Mobile back */}
          <BackToHomeBtn to="/driver-mastery" />

          {/* ── Hero ─────────────────────────────────────────────────────── */}
          <ModuleHero
            moduleNumber="1"
            title="Core Mental Model of a UVM Driver"
            description="Build the foundational protocol-execution mental model for UVM drivers — covering transaction intent, interface ownership, completion contracts, reset/abort policy, response routing, and the boundary between driver, monitor, scoreboard, and assertions."
            metadata={[
              ["Module", "1"],
              ["Reference", "UVM 1.2"],
              ["Level", "Beginner → Senior/Principal"],
              ["Scope", "Core Mental Model"],
            ]}
          />

          {/* Module Thesis */}
          <div className="rounded-2xl bg-linear-to-br from-violet-600/10 to-indigo-600/10 border border-violet-500/20 p-6 mb-8">
            <p className="text-xs uppercase tracking-widest text-violet-400 font-semibold mb-3">
              Module Thesis
            </p>
            <p className="text-slate-200 text-sm leading-relaxed mb-2">
              A UVM driver is not "the class that wiggles pins."
            </p>
            <p className="text-slate-200 text-sm leading-relaxed mb-3">
              A correct driver is a{" "}
              <span className="text-violet-300 font-semibold">
                protocol execution boundary
              </span>
              .
            </p>
            <p className="text-slate-400 text-sm leading-relaxed mb-3">
              It consumes transaction intent from a sequence, translates that
              intent into legal interface activity, observes only the DUT
              outputs required for protocol completion, and tells the sequencer
              when the item is safely complete according to the selected driver
              contract.
            </p>
            <p className="text-slate-400 text-sm mb-2">
              Bad drivers usually fail for one of seven reasons:
            </p>
            <ol className="list-decimal list-inside text-slate-300 text-sm space-y-1">
              <li className="pl-2">They call item_done() too early.</li>
              <li className="pl-2">
                They drive pins without a real protocol timing contract.
              </li>
              <li className="pl-2">
                They mix sequence-driver APIs incorrectly.
              </li>
              <li className="pl-2">They become scoreboards.</li>
              <li className="pl-2">They do not define reset/abort behavior.</li>
              <li className="pl-2">
                They retain or mutate request handles after completion.
              </li>
              <li className="pl-2">They rely on simulator scheduling luck.</li>
            </ol>
          </div>

          {/* ── §1 Learning Objectives ──────────────────────────────────── */}
          <section id="objectives">
            <SectionHeading num={1} title="Learning Objectives" />
            <p className="text-slate-400 text-sm mb-3">
              By the end of this module, you should be able to:
            </p>
            <ol className="space-y-2 list-decimal list-inside text-slate-300 text-sm leading-relaxed">
              {[
                "Explain what a UVM driver does in one precise interview sentence.",
                "Separate the roles of sequence, sequencer, driver, monitor, scoreboard, and assertions.",
                "Explain transaction intent vs pin-level execution.",
                "Define when a driver may observe DUT outputs.",
                "Explain why get_next_item() must be paired with item_done().",
                "Explain why get() must not be paired with item_done().",
                "Handle try_next_item() without null-handle bugs.",
                "Define safe completion for a non-pipelined driver.",
                "Explain what changes conceptually in pipelined drivers without implementing them.",
                "State a reset/abort policy that does not deadlock the sequencer.",
                "Explain when a response object is needed and when it is unnecessary.",
                "Explain why set_id_info(req) matters for response routing.",
                "Avoid request-handle lifetime bugs.",
                "Recognize common driver race conditions.",
                "Defend driver architecture choices in senior/principal interviews.",
              ].map((o, i) => (
                <li key={i} className="pl-2">
                  {o}
                </li>
              ))}
            </ol>
          </section>

          {/* ── §2 How to Use This Module ────────────────────────────────── */}
          <section id="scope">
            <SectionHeading num={2} title="How to Use This Module & Scope" />

            <div className="grid md:grid-cols-3 gap-4 mb-6">
              {[
                {
                  pass: "Pass 1 — Mental Model",
                  color: "violet",
                  desc: "Read sections 3–10 first. Focus on: who owns intent, who owns arbitration, who owns timing, who owns checking, when completion is legal, what reset does to an accepted item. Do not start from UVM syntax.",
                },
                {
                  pass: "Pass 2 — Code Contract",
                  color: "blue",
                  desc: "Read code labs after memory cards. Map each driver line to: wait for reset release, get item, drive protocol, observe completion, cleanup, optionally send response, release sequencer item.",
                },
                {
                  pass: "Pass 3 — Interview Defense",
                  color: "emerald",
                  desc: "Use bug gallery, architecture decision points, and interview Q&A. A senior interviewer will ask: 'Where exactly do you call item_done() and what does that mean in your architecture?'",
                },
              ].map(({ pass, color, desc }) => {
                const colors = {
                  violet: "border-violet-500/30 bg-violet-600/5",
                  blue: "border-blue-500/30 bg-blue-600/5",
                  emerald: "border-emerald-500/30 bg-emerald-600/5",
                };
                const labels = {
                  violet: "text-violet-400",
                  blue: "text-blue-400",
                  emerald: "text-emerald-400",
                };
                return (
                  <div
                    key={pass}
                    className={`rounded-xl border p-4 ${colors[color]}`}
                  >
                    <p
                      className={`text-xs font-semibold uppercase tracking-widest mb-2 ${labels[color]}`}
                    >
                      {pass}
                    </p>
                    <p className="text-slate-300 text-sm">{desc}</p>
                  </div>
                );
              })}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-emerald-400 font-semibold mb-2">
                  In Scope
                </p>
                <ul className="space-y-1 text-slate-300 text-sm list-disc list-inside">
                  {[
                    "What a UVM driver is (and is not)",
                    "Transaction intent vs pin-level activity",
                    "Driver ownership boundary",
                    "Basic sequence-sequencer-driver contract",
                    "Safe completion model",
                    "Basic reset/abort thinking",
                    "Basic response/completion thinking",
                    "Transaction-handle lifetime",
                    "Basic timing/waveform contract",
                    "Basic race-condition awareness",
                    "Driver review checklist",
                    "Interview defense lines",
                  ].map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-rose-400 font-semibold mb-2">
                  Out of Scope (Later Modules)
                </p>
                <Table
                  headers={["Topic", "Module"]}
                  rows={[
                    ["Full driver class anatomy", "2"],
                    ["Universal driver recipe", "3"],
                    ["Driver type taxonomy", "4"],
                    ["Sequencer arbitration internals", "5"],
                    ["APB driver implementation", "6 / 8"],
                    ["Clocking block deep dive", "7"],
                    ["Ready/valid deep dive", "9"],
                    ["AXI4-Lite driver architecture", "10"],
                    ["Pipelined/multi-channel drivers", "11"],
                    ["Reactive/slave drivers", "12"],
                    ["Monitor/scoreboard/assertion design", "13"],
                    ["Reset/low-power/multi-clock depth", "17"],
                  ]}
                />
              </div>
            </div>
            <Callout type="concept">
              This module intentionally uses a simple valid/ready-style protocol
              for code labs because it exposes the driver mental model clearly.
              This is not Module 9's full ready/valid deep dive.
            </Callout>
          </section>

          {/* ── §3 Protocol Mental Model ─────────────────────────────────── */}
          <section id="mental-model">
            <SectionHeading num={3} title="Protocol Mental Model" />

            <CollapsibleCard title="7.1 Driver in One Sentence" accent="violet">
              <p className="text-slate-300 text-sm leading-relaxed">
                A UVM driver consumes a sequence item, converts it into legal
                pin-level protocol activity, observes only the protocol signals
                needed to know completion or response, then releases or responds
                to the sequencer according to the driver contract.
              </p>
            </CollapsibleCard>

            <CollapsibleCard title="7.2 The Driver Is a Boundary" accent="blue">
              <Table
                headers={["World", "Representation", "Owner"]}
                rows={[
                  ["Test intent", "sequence item", "sequence"],
                  ["Arbitration", "sequencer", "sequencer"],
                  ["Pin behavior", "interface signals", "driver"],
                  ["Observed behavior", "monitor transaction", "monitor"],
                  [
                    "Functional correctness",
                    "expected vs actual",
                    "scoreboard",
                  ],
                  ["Temporal protocol legality", "properties", "assertions"],
                ]}
              />
              <Callout type="concept">
                The driver is the executor. The monitor is the witness. The
                scoreboard is the judge. Assertions are the law. Do not merge
                those roles casually.
              </Callout>
            </CollapsibleCard>

            <CollapsibleCard
              title="7.3 Transaction Intent vs Pin-Level Execution"
              accent="amber"
            >
              <p className="text-slate-400 text-sm mb-2">
                A transaction may say:
              </p>
              <CodeBlock lang="systemverilog">{`data = 8'hA5;
last = 1'b1;`}</CodeBlock>
              <p className="text-slate-400 text-sm mb-2 mt-3">
                That does not automatically mean this is a complete driver:
              </p>
              <CodeBlock lang="systemverilog">{`vif.data  <= 8'hA5;
vif.valid <= 1'b1;
vif.last  <= 1'b1;`}</CodeBlock>
              <p className="text-slate-400 text-sm mt-3 mb-2">
                A driver must also know:
              </p>
              <ul className="list-disc list-inside text-slate-300 text-sm space-y-1">
                {[
                  "when reset is inactive",
                  "when the bus is idle",
                  "when it is legal to assert valid",
                  "whether payload must remain stable",
                  "what signal proves acceptance",
                  "when to deassert controls",
                  "whether response capture is needed",
                  "when the sequencer may receive item_done()",
                ].map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
              <Callout type="interview">
                The transaction describes <strong>what</strong>. The protocol
                contract defines <strong>when and how</strong>. The driver
                implements the translation.
              </Callout>
            </CollapsibleCard>

            <CollapsibleCard
              title="7.4 The Driver Does Not Own Correctness"
              accent="rose"
            >
              <p className="text-slate-400 text-sm mb-2">
                The driver may perform minimal protocol-safety checks:
              </p>
              <CodeBlock lang="systemverilog">{`if (req == null)
  \`uvm_fatal("NULLREQ", "Driver received a null request")`}</CodeBlock>
              <p className="text-slate-400 text-sm mt-3 mb-2">
                Bad driver behavior — this belongs in the scoreboard, not the
                active driver:
              </p>
              <CodeBlock lang="systemverilog">{`if (dut_output != expected_output)
  \`uvm_error("MISMATCH", "DUT output mismatch")`}</CodeBlock>
            </CollapsibleCard>

            <CollapsibleCard
              title="7.5 Driver-Side Observation Rule"
              accent="emerald"
            >
              <p className="text-slate-400 text-sm mb-2">
                A driver may observe a DUT output only if the observation
                answers one of these:
              </p>
              <ol className="list-decimal list-inside text-slate-300 text-sm space-y-1 mb-3">
                <li className="pl-2">Is the transfer accepted?</li>
                <li className="pl-2">Is the driver allowed to advance?</li>
                <li className="pl-2">Is backpressure active?</li>
                <li className="pl-2">Is a protocol response available?</li>
                <li className="pl-2">
                  Has reset/power/clock state changed driver legality?
                </li>
                <li className="pl-2">
                  Is this a slave/reactive driver that must respond to DUT
                  request pins?
                </li>
              </ol>
              <Callout type="trap">
                If the observation answers "was the DUT functionally correct?",
                it does not belong in the driver.
              </Callout>
            </CollapsibleCard>
          </section>

          {/* ── §4 Timing / Waveform Contract ────────────────────────────── */}
          <section id="timing">
            <SectionHeading num={4} title="Timing / Waveform Contract" />

            <CollapsibleCard
              title="8.1 Timing Comes Before UVM"
              accent="violet"
            >
              <p className="text-slate-400 text-sm mb-3">
                Before writing the driver, define:
              </p>
              <Table
                headers={["Question", "Example Answer for Simple Valid/Ready"]}
                rows={[
                  ["What does the driver drive?", "valid, data, last"],
                  ["What does the DUT drive?", "ready"],
                  [
                    "When is transfer accepted?",
                    "On sampled clock edge where valid && ready",
                  ],
                  ["Must payload stay stable?", "Yes, while valid && !ready"],
                  [
                    "When can driver cleanup?",
                    "After sampled acceptance or reset abort",
                  ],
                  [
                    "What happens on reset?",
                    "Driver deasserts controls and completes/aborts active item by policy",
                  ],
                  [
                    "Is response required?",
                    "No for simple fire-and-forget transfer",
                  ],
                ]}
              />
            </CollapsibleCard>

            <CollapsibleCard
              title="8.2 Example Waveform Contract"
              accent="amber"
            >
              <p className="text-slate-400 text-sm mb-2">
                For the simple valid/ready source driver used in this module:
              </p>
              <CodeBlock lang="text">{`clk      :  ↑    ↑    ↑    ↑    ↑
valid    :  0    1    1    1    0
data     :  --   A5   A5   A5   --
ready    :  0    0    0    1    x
accept   :  no   no   no   yes  no
cleanup  :  no   no   no   after sampled accept
item_done:  no   no   no   after cleanup decision`}</CodeBlock>
              <Callout type="interview">
                item_done() is not a syntax ritual. It is a contract statement
                that the driver no longer owns that request item under the
                selected execution model.
              </Callout>
            </CollapsibleCard>

            <CollapsibleCard
              title="8.3 Clocking Block Timing Assumption"
              accent="blue"
            >
              <p className="text-slate-400 text-sm mb-2">
                The code labs use a driver clocking block:
              </p>
              <CodeBlock lang="systemverilog">{`clocking drv_cb @(posedge clk);
  default input #1step output #0;
  output valid;
  output data;
  output last;
  input  ready;
  input  reset_n;
endclocking`}</CodeBlock>
              <ul className="list-disc list-inside text-slate-300 text-sm space-y-1 mt-3">
                <li>Inputs are sampled just before the clocking event</li>
                <li>
                  Outputs are driven at the clocking event using clocking block
                  scheduling rules
                </li>
                <li>
                  Transfer is accepted only after sampling ready on a later
                  clocking event while valid and payload were already driven
                </li>
              </ul>
              <Callout type="concept">
                This is a teaching convention, not a universal proof that all
                races are impossible. If a project does not use clocking blocks,
                it must still define equivalent drive and sample regions.
              </Callout>
            </CollapsibleCard>

            <CollapsibleCard
              title="8.4 Legal vs Illegal Driver Observations"
              accent="rose"
            >
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs uppercase tracking-widest text-emerald-400 font-semibold mb-2">
                    Legal Observations
                  </p>
                  <ul className="list-disc list-inside text-slate-300 text-sm space-y-1">
                    {[
                      "ready",
                      "pready",
                      "pslverr",
                      "bvalid",
                      "rvalid",
                      "response code fields",
                      "slave request pins (reactive slave driver)",
                      "reset/clock/power status",
                    ].map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-rose-400 font-semibold mb-2">
                    Illegal / Suspicious Observations
                  </p>
                  <ul className="list-disc list-inside text-slate-300 text-sm space-y-1">
                    {[
                      "Comparing DUT computation against expected value",
                      "Sampling unrelated DUT internals",
                      "Using scoreboard state to decide pin driving",
                      "Hiding functional checks in the driver",
                    ].map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <Callout type="interview">
                If the observation is required to complete the protocol, it may
                belong in the driver. If the observation is required to judge
                correctness, it belongs outside the driver.
              </Callout>
            </CollapsibleCard>
          </section>

          {/* ── §5 Driver Responsibility Boundary ───────────────────────── */}
          <section id="boundary">
            <SectionHeading num={5} title="Driver Responsibility Boundary" />

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-emerald-400 font-semibold mb-2">
                  What the Driver Owns
                </p>
                <ul className="list-disc list-inside text-slate-300 text-sm space-y-1">
                  {[
                    "Pin-level stimulus timing",
                    "Legal signal drive values",
                    "Idle signal values",
                    "Reset cleanup of driven signals",
                    "Transaction-to-beat conversion at the protocol boundary",
                    "Completion detection required for the driver contract",
                    "Response capture when protocol requires it",
                    "item_done() timing for pull-style sequence items",
                    "Response routing when using responses",
                    "Local debug logs for driven activity",
                  ].map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-rose-400 font-semibold mb-2">
                  What the Driver Does NOT Own
                </p>
                <ul className="list-disc list-inside text-slate-300 text-sm space-y-1">
                  {[
                    "Functional correctness of DUT output",
                    "Scoreboard comparison",
                    "Coverage sampling (except rare local debug counters)",
                    "Protocol property checking when assertions are available",
                    "Monitor reconstruction of observed bus activity",
                    "Test intent generation",
                    "Sequence arbitration policy",
                    "Global pass/fail decision",
                    "Unrelated DUT internals",
                  ].map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <CollapsibleCard
              title="9.3 Minimal Protocol-Safety Checks Are Allowed"
              accent="emerald"
            >
              <p className="text-slate-400 text-sm mb-2">A driver may check:</p>
              <ul className="list-disc list-inside text-slate-300 text-sm space-y-1 mb-3">
                {[
                  "Null sequence item",
                  "Illegal transaction fields that cannot be driven safely",
                  "Reset active while trying to drive",
                  "Timeout waiting for handshake (if environment policy allows)",
                  "Unsupported transaction mode",
                  "Missing virtual interface",
                ].map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
              <Callout type="concept">
                These are driver safety checks, not DUT correctness checks.
              </Callout>
            </CollapsibleCard>

            <Callout type="interview">
              <strong>Senior rule:</strong> A driver that "does everything" is
              not reusable VIP. It is a debug liability.
            </Callout>
          </section>

          {/* ── §6 Sequence-Sequencer-Driver Contract ───────────────────── */}
          <section id="contract">
            <SectionHeading
              num={6}
              title="Sequence-Sequencer-Driver Contract"
            />

            <CollapsibleCard title="10.1 Component Roles" accent="violet">
              <Table
                headers={["Component", "Role"]}
                rows={[
                  ["Sequence", "Creates transaction intent"],
                  ["Sequencer", "Arbitrates and provides items"],
                  ["Driver", "Executes item on interface"],
                  ["Monitor", "Observes actual interface behavior"],
                  ["Scoreboard", "Compares actual vs expected"],
                  ["Assertion", "Checks temporal/protocol invariants"],
                ]}
              />
            </CollapsibleCard>

            <CollapsibleCard
              title="10.2 Pull-Style Contract: get_next_item() / item_done()"
              accent="blue"
            >
              <p className="text-slate-400 text-sm mb-2">
                Canonical non-pipelined pattern:
              </p>
              <CodeBlock lang="systemverilog">{`forever begin
  seq_item_port.get_next_item(req);
  drive_one_transfer(req);
  seq_item_port.item_done();
end`}</CodeBlock>
              <ol className="list-decimal list-inside text-slate-300 text-sm space-y-1 mt-3">
                <li className="pl-2">Driver asks sequencer for next item.</li>
                <li className="pl-2">Sequencer grants one item.</li>
                <li className="pl-2">Driver owns execution of that item.</li>
                <li className="pl-2">
                  Driver completes pin-level protocol or documented abort path.
                </li>
                <li className="pl-2">Driver calls item_done().</li>
                <li className="pl-2">
                  Sequencer is unblocked and may grant the next item.
                </li>
              </ol>
              <Callout type="interview">
                Every successful get_next_item() must eventually reach
                item_done() unless simulation is intentionally killed.
              </Callout>
            </CollapsibleCard>

            <CollapsibleCard title="10.3 get() Contract" accent="amber">
              <CodeBlock lang="systemverilog">{`forever begin
  seq_item_port.get(req);
  drive_one_transfer(req);
end`}</CodeBlock>
              <Callout type="trap">
                get() consumes the item. It must not be paired with item_done().
              </Callout>
              <p className="text-slate-400 text-sm mt-3 mb-2">Bad example:</p>
              <CodeBlock lang="systemverilog">{`seq_item_port.get(req);
drive_one_transfer(req);
seq_item_port.item_done(); // Wrong for get() style`}</CodeBlock>
            </CollapsibleCard>

            <CollapsibleCard
              title="10.4 try_next_item() Contract"
              accent="emerald"
            >
              <CodeBlock lang="systemverilog">{`seq_item_port.try_next_item(req);

if (req != null) begin
  drive_one_transfer(req);
  seq_item_port.item_done();
end
else begin
  drive_idle_cycle();
end`}</CodeBlock>
              <Callout type="interview">
                If try_next_item() returns a non-null item, the driver accepted
                ownership and must eventually call item_done().
              </Callout>
            </CollapsibleCard>

            <CollapsibleCard title="10.5 Response Contract" accent="violet">
              <p className="text-slate-400 text-sm mb-2">
                Some drivers do not need a response object (simple write-only,
                no response channel, no status to return). Then this is enough:
              </p>
              <CodeBlock lang="systemverilog">{`seq_item_port.item_done();`}</CodeBlock>
              <p className="text-slate-400 text-sm mt-3 mb-2">
                When responses are required (read data, error status, bus
                response code, out-of-order completion):
              </p>
              <CodeBlock lang="systemverilog">{`local_rsp = simple_rsp::type_id::create("local_rsp");
local_rsp.set_id_info(req);
local_rsp.status = status;
seq_item_port.put_response(local_rsp);`}</CodeBlock>
              <Callout type="concept">
                put_response() sends a response. It does not replace pin cleanup
                or item_done() in a get_next_item() style driver. Full response
                queues, IDs, sequencer arbitration, and response matching are
                covered in Module 5.
              </Callout>
            </CollapsibleCard>

            <CollapsibleCard title="10.6 Request Handle Lifetime" accent="rose">
              <p className="text-slate-400 text-sm mb-2">
                The driver receives a request handle. That handle is not a free
                private copy. After item_done(), the driver must not mutate the
                request object. If the driver needs information later, copy
                fields before releasing:
              </p>
              <CodeBlock lang="systemverilog">{`bit [7:0] data_copy;

seq_item_port.get_next_item(req);
data_copy = req.data;
drive_one(req);
seq_item_port.item_done();

// Safe: use data_copy for logging or delayed bookkeeping.
// Unsafe: mutate or depend on req after completion.`}</CodeBlock>
              <Callout type="interview">
                If completion and later response are decoupled, define whether
                the driver owns a clone, a copied metadata record, or an
                outstanding transaction object.
              </Callout>
            </CollapsibleCard>
          </section>

          {/* ── §7 Reset / Abort Policy ─────────────────────────────────── */}
          <section id="reset">
            <SectionHeading num={7} title="Reset / Abort Policy" />

            <CollapsibleCard title="11.1 Reset Before Item" accent="violet">
              <CodeBlock lang="systemverilog">{`wait_reset_released();
seq_item_port.get_next_item(req);
drive_one_transfer(req);
seq_item_port.item_done();`}</CodeBlock>
              <Callout type="concept">
                If reset is active before the driver gets an item, the driver
                should not consume a sequence item unless its architecture
                explicitly supports reset-time traffic. This avoids accepting an
                item that cannot legally be driven.
              </Callout>
            </CollapsibleCard>

            <CollapsibleCard title="11.2 Reset During Item" accent="amber">
              <p className="text-slate-400 text-sm mb-2">
                A defensible non-pipelined policy when reset asserts after item
                acceptance:
              </p>
              <ol className="list-decimal list-inside text-slate-300 text-sm space-y-1 mb-3">
                <li className="pl-2">Deassert driven protocol signals</li>
                <li className="pl-2">Abandon active pin-level transfer</li>
                <li className="pl-2">Log reset abort</li>
                <li className="pl-2">
                  Complete the sequencer item using the agreed policy
                </li>
                <li className="pl-2">
                  Optionally return abort status if response contract requires
                  it
                </li>
                <li className="pl-2">
                  Wait for reset release before accepting more items
                </li>
              </ol>
              <CodeBlock lang="systemverilog">{`seq_item_port.get_next_item(req);
aborted = drive_one_transfer_or_abort_on_reset(req);
seq_item_port.item_done();`}</CodeBlock>
            </CollapsibleCard>

            <CollapsibleCard
              title="11.3 What NOT to Do — Reset Deadlock"
              accent="rose"
            >
              <CodeBlock lang="systemverilog">{`seq_item_port.get_next_item(req);
wait(vif.ready); // reset may assert forever here
seq_item_port.item_done();`}</CodeBlock>
              <Callout type="trap">
                Reset asserts → DUT deasserts ready → driver waits forever →
                sequencer remains blocked → sequence hangs.
              </Callout>
            </CollapsibleCard>

            <CollapsibleCard
              title="11.4 Reset Policy Documentation"
              accent="blue"
            >
              <p className="text-slate-400 text-sm mb-2">
                A senior-quality driver states:
              </p>
              <ul className="list-disc list-inside text-slate-300 text-sm space-y-1 mb-3">
                {[
                  "Are active items aborted or retried on reset?",
                  "Is a response sent for aborted items?",
                  "Are sequence items completed with item_done()?",
                  "Are driven outputs reset immediately?",
                  "Does the driver wait for reset release before new items?",
                  "Who tells scoreboard to flush expected state?",
                  "Can reset occur during every blocking wait?",
                ].map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
              <Callout type="concept">
                Module 1 policy: If reset asserts after item acceptance, the
                simple driver deasserts outputs, logs an abort, calls
                item_done(), and waits for reset release before accepting
                another item. No response is generated in the basic example.
              </Callout>
            </CollapsibleCard>

            <CollapsibleCard
              title="11.5 Reset Abort Policy Options"
              accent="emerald"
            >
              <Table
                headers={["Policy", "Meaning"]}
                rows={[
                  [
                    "Abort and release",
                    "Driver cleans pins and calls item_done()",
                  ],
                  [
                    "Abort and respond",
                    "Driver sends abort/error response, then releases",
                  ],
                  ["Retry", "Driver re-drives same logical item after reset"],
                  ["Kill simulation", "Used only for fatal environment policy"],
                ]}
              />
              <Callout type="interview">
                Module 1 examples use <strong>abort and release</strong>. Retry
                is protocol/environment-specific — do not silently retry unless
                the driver contract says so.
              </Callout>
            </CollapsibleCard>
          </section>

          {/* ── §8 Response / Completion Policy ─────────────────────────── */}
          <section id="response">
            <SectionHeading num={8} title="Response / Completion Policy" />

            <CollapsibleCard
              title="12.1 Completion Is Protocol-Dependent"
              accent="violet"
            >
              <Table
                headers={["Driver Type", "Completion May Mean"]}
                rows={[
                  [
                    "Simple non-pipelined write",
                    "Transfer accepted and cleanup done",
                  ],
                  [
                    "APB read",
                    "Access phase complete and read data/error sampled",
                  ],
                  [
                    "AXI write",
                    "Request channels accepted and B response received",
                  ],
                  ["Streaming source", "Beat or packet accepted"],
                  [
                    "Pipelined driver",
                    "Request accepted, while response may complete later",
                  ],
                  ["Reactive slave", "Request observed and response driven"],
                ]}
              />
              <Callout type="concept">
                Module 1 uses the non-pipelined mental model: the item is done
                only after the pin-level action required by the transaction is
                complete and the driver has made the cleanup/abort decision.
              </Callout>
            </CollapsibleCard>

            <CollapsibleCard
              title="12.2 item_done() Is Not Always End of DUT Work"
              accent="blue"
            >
              <Callout type="trap">
                For a pipelined driver, item_done() may mean request acceptance,
                not final response completion. Do not call item_done() before
                completion unless you have explicitly designed a pipelined
                acceptance/completion split. This is handled deeply in Modules
                10 and 11.
              </Callout>
            </CollapsibleCard>

            <CollapsibleCard
              title="12.3 Response Required vs Not Required"
              accent="amber"
            >
              <Table
                headers={["Situation", "Response Needed?"]}
                rows={[
                  ["Fire-and-forget write with no status", "Usually no"],
                  ["Read data returned to sequence", "Yes"],
                  ["Error status returned to sequence", "Yes"],
                  ["Out-of-order completion", "Yes, with ID routing"],
                  ["Sequence only needs unblock after drive", "No"],
                  [
                    "Driver needs to report reset abort to sequence",
                    "Optional, architecture-dependent",
                  ],
                ]}
              />
            </CollapsibleCard>

            <CollapsibleCard
              title="12.4 Response Does Not Replace Cleanup"
              accent="rose"
            >
              <p className="text-slate-400 text-sm mb-2">
                A response tells the sequence something. It does not clean the
                interface.
              </p>
              <p className="text-xs uppercase tracking-widest text-rose-400 font-semibold mb-1">
                Bad
              </p>
              <CodeBlock lang="systemverilog">{`seq_item_port.put_response(local_rsp);
// valid still asserted here
seq_item_port.item_done();`}</CodeBlock>
              <p className="text-xs uppercase tracking-widest text-emerald-400 font-semibold mb-1 mt-3">
                Correct Order
              </p>
              <CodeBlock lang="systemverilog">{`drive_and_sample_response(req, local_rsp);
cleanup_bus();
local_rsp.set_id_info(req);
seq_item_port.put_response(local_rsp);
seq_item_port.item_done();`}</CodeBlock>
            </CollapsibleCard>
          </section>

          {/* ── §9 Protocol Ownership Matrix ────────────────────────────── */}
          <section id="ownership-matrix">
            <SectionHeading num={9} title="Protocol Ownership Matrix" />
            <Table
              headers={[
                "Concern",
                "Sequence",
                "Sequencer",
                "Driver",
                "Monitor",
                "Scoreboard",
                "Assertion",
              ]}
              rows={[
                [
                  "Generate transaction intent",
                  "Owns",
                  "No",
                  "No",
                  "No",
                  "No",
                  "No",
                ],
                [
                  "Arbitrate next item",
                  "No",
                  "Owns",
                  "Requests",
                  "No",
                  "No",
                  "No",
                ],
                ["Drive DUT inputs", "No", "No", "Owns", "No", "No", "No"],
                [
                  "Observe handshake output",
                  "No",
                  "No",
                  "Uses if needed",
                  "Observes",
                  "No",
                  "May check",
                ],
                [
                  "Observe complete bus activity",
                  "No",
                  "No",
                  "Only as needed",
                  "Owns",
                  "Consumes",
                  "May check",
                ],
                [
                  "Determine expected result",
                  "Often",
                  "No",
                  "No",
                  "No",
                  "Owns/model",
                  "No",
                ],
                [
                  "Compare actual vs expected",
                  "No",
                  "No",
                  "No",
                  "No",
                  "Owns",
                  "Sometimes property-local",
                ],
                [
                  "Check temporal protocol rules",
                  "No",
                  "No",
                  "Minimal safety",
                  "No",
                  "No",
                  "Owns",
                ],
                [
                  "Handle reset cleanup of driven pins",
                  "No",
                  "No",
                  "Owns",
                  "Observes",
                  "Flushes model",
                  "Checks behavior",
                ],
                ["Call item_done()", "No", "No", "Owns", "No", "No", "No"],
                [
                  "Send response to sequence",
                  "Receives",
                  "Routes",
                  "Creates/sends",
                  "No",
                  "No",
                  "No",
                ],
                [
                  "Own request handle after completion",
                  "May reuse item",
                  "No",
                  "No",
                  "No",
                  "No",
                  "No",
                ],
                [
                  "Debug log of driven transaction",
                  "No",
                  "No",
                  "Owns",
                  "Owns observed log",
                  "Owns compare log",
                  "Owns property failure",
                ],
              ]}
            />
          </section>

          {/* ── §10 Memory Cards ────────────────────────────────────────── */}
          <section id="memory">
            <SectionHeading num={10} title="Memory Cards" />
            {module1MemoryCards.map((card) => (
              <CollapsibleCard
                key={card.title}
                title={card.title}
                accent={card.accent}
                icon={<FaBook size={12} />}
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
          </section>

          {/* ── §11 Atlas Sheets ────────────────────────────────────────── */}
          <section id="atlas">
            <SectionHeading num={11} title="Atlas Sheets" />

            <CollapsibleCard
              title="Atlas Sheet 1 — Same Concept Across Plain SV, UVM, and Coroutine-Style Thinking"
              accent="blue"
              icon={<FaListAlt size={12} />}
            >
              <Table
                headers={[
                  "Concept",
                  "Plain SystemVerilog TB",
                  "UVM Driver",
                  "Coroutine-Style Equivalent",
                ]}
                rows={[
                  [
                    "Transaction intent",
                    "task argument or struct",
                    "uvm_sequence_item",
                    "object/dataclass",
                  ],
                  [
                    "Stimulus provider",
                    "initial block/task",
                    "sequence",
                    "coroutine/test",
                  ],
                  [
                    "Arbitration",
                    "manual queue/mailbox",
                    "sequencer",
                    "queue/async scheduler",
                  ],
                  [
                    "Pin execution",
                    "bus task",
                    "driver run_phase task",
                    "driver coroutine",
                  ],
                  [
                    "Handshake wait",
                    "@(posedge clk); wait ready",
                    "protocol task inside driver",
                    "rising-edge loop",
                  ],
                  [
                    "Completion signal",
                    "task returns",
                    "item_done() or response",
                    "coroutine returns/event",
                  ],
                  [
                    "Observed actual",
                    "sampled manually",
                    "monitor analysis port",
                    "monitor callback",
                  ],
                  [
                    "Checking",
                    "manual compare",
                    "scoreboard/assertion",
                    "checker/model",
                  ],
                ]}
              />
              <Callout type="interview">
                UVM changes how stimulus is delivered and organized, not the
                fundamental requirement that a driver must implement a correct
                timing contract.
              </Callout>
            </CollapsibleCard>

            <CollapsibleCard
              title="Atlas Sheet 2 — Driver Completion Models"
              accent="violet"
              icon={<FaListAlt size={12} />}
            >
              <Table
                headers={[
                  "Model",
                  "When Driver Releases Item",
                  "Response Needed?",
                  "Later Module",
                ]}
                rows={[
                  [
                    "Non-pipelined fire-and-forget",
                    "After protocol handshake and cleanup",
                    "Usually no",
                    "Module 3",
                  ],
                  [
                    "Non-pipelined read",
                    "After read data/status sampled",
                    "Usually yes",
                    "Module 8",
                  ],
                  [
                    "Streaming beat",
                    "After beat accepted",
                    "Optional",
                    "Module 9",
                  ],
                  [
                    "Streaming packet",
                    "After all beats accepted",
                    "Optional",
                    "Module 9",
                  ],
                  [
                    "Pipelined request",
                    "After request accepted",
                    "Often later response",
                    "Module 11",
                  ],
                  [
                    "AXI write",
                    "Depends on AW/W/B architecture",
                    "Yes for B",
                    "Module 10/11",
                  ],
                  [
                    "Reactive slave",
                    "After request observed and response driven",
                    "Optional",
                    "Module 12",
                  ],
                ]}
              />
              <Callout type="concept">
                Module 1 teaches the mental model. Later modules implement these
                variants.
              </Callout>
            </CollapsibleCard>

            <CollapsibleCard
              title="Atlas Sheet 3 — Responsibility Boundary"
              accent="emerald"
              icon={<FaListAlt size={12} />}
            >
              <Table
                headers={[
                  "Question",
                  "Driver Answer",
                  "Monitor Answer",
                  "Scoreboard Answer",
                  "Assertion Answer",
                ]}
                rows={[
                  [
                    "Who drove this transaction?",
                    "Driver logs intent",
                    "No",
                    "No",
                    "No",
                  ],
                  [
                    "What actually happened on pins?",
                    "Partial/protocol-only",
                    "Monitor owns",
                    "Uses monitor data",
                    "May detect violation",
                  ],
                  [
                    "Was the output correct?",
                    "No",
                    "No",
                    "Yes",
                    "Sometimes property-specific",
                  ],
                  [
                    "Did valid stay stable under backpressure?",
                    "Should drive correctly",
                    "Observes",
                    "Maybe no",
                    "Yes",
                  ],
                  [
                    "Did sequence item complete?",
                    "Driver owns",
                    "No",
                    "No",
                    "No",
                  ],
                  [
                    "Did reset flush expected model?",
                    "Cleans pins",
                    "Observes reset",
                    "Flushes model",
                    "Checks reset behavior",
                  ],
                  [
                    "Was request handle safe after completion?",
                    "Must not mutate",
                    "No",
                    "No",
                    "No",
                  ],
                ]}
              />
            </CollapsibleCard>

            <CollapsibleCard
              title="Atlas Sheet 4 — API Contract Quick Map"
              accent="amber"
              icon={<FaListAlt size={12} />}
            >
              <Table
                headers={[
                  "API Style",
                  "Driver Receives Item",
                  "Driver Must Call item_done()?",
                  "Typical Use",
                ]}
                rows={[
                  [
                    "get_next_item(req)",
                    "Granted request",
                    "Yes",
                    "Explicit non-pipelined driver",
                  ],
                  [
                    "get(req)",
                    "Consumed request",
                    "No",
                    "Alternative pull model",
                  ],
                  [
                    "try_next_item(req)",
                    "Optional request; may be null",
                    "Yes only if non-null",
                    "Idle-aware driver",
                  ],
                  [
                    "put_response(rsp)",
                    "Sends response object",
                    "Not a replacement for cleanup",
                    "Read/status response",
                  ],
                  [
                    "item_done(rsp)",
                    "Completion with optional response",
                    "Yes, as completion call",
                    "Some response styles",
                  ],
                ]}
              />
              <Callout type="trap">
                Pick one contract style and document it. Mixing styles without
                architecture is a driver bug.
              </Callout>
            </CollapsibleCard>
          </section>

          {/* ── §12 Code Labs ───────────────────────────────────────────── */}
          <section id="codelabs">
            <SectionHeading num={12} title="Code Labs" />

            <CollapsibleCard
              title="Code Lab 1 — Minimal Valid/Ready Source Driver Mental Model"
              accent="emerald"
              icon={<FaFlask size={12} />}
            >
              <p className="text-slate-400 text-sm mb-3">
                <strong>Goal:</strong> Build a small UVM 1.2 driver that gets a
                sequence item, drives valid/data/last, waits for ready, cleans
                up, calls item_done(), and avoids deadlock on reset.
              </p>
              <Callout type="concept">
                For strict simulator portability, the interface type must be
                visible before the package declares{" "}
                <code className="text-violet-300">
                  virtual simple_vr_if vif
                </code>
                . Compile the interface before the package in the same compile
                unit.
              </Callout>
            </CollapsibleCard>

            <CollapsibleCard
              title="Code Lab 1A — Interface"
              accent="blue"
              icon={<FaFlask size={12} />}
            >
              <CodeBlock lang="systemverilog">{`interface simple_vr_if(input logic clk, input logic reset_n);

  logic        valid;
  logic        ready;
  logic [7:0]  data;
  logic        last;

  clocking drv_cb @(posedge clk);
    default input #1step output #0;
    output valid;
    output data;
    output last;
    input  ready;
    input  reset_n;
  endclocking

endinterface`}</CodeBlock>
              <p className="text-slate-400 text-sm mt-3 mb-1">Timing notes:</p>
              <ul className="list-disc list-inside text-slate-300 text-sm space-y-1">
                <li>
                  Driver uses drv_cb rather than raw @(posedge clk) drives
                </li>
                <li>
                  ready and reset_n are sampled through the clocking block
                </li>
                <li>
                  Driver asserts valid on a clocking event and samples ready on
                  a later clocking event
                </li>
                <li>
                  This convention makes the example deterministic if DUT and
                  monitor use compatible timing assumptions
                </li>
              </ul>
            </CollapsibleCard>

            <CollapsibleCard
              title="Code Lab 1B — TODO Starter Code"
              accent="amber"
              icon={<FaFlask size={12} />}
            >
              <CodeBlock lang="systemverilog">{`package module1_driver_pkg;

  import uvm_pkg::*;
  \`include "uvm_macros.svh"

  class simple_vr_item extends uvm_sequence_item;

    rand bit [7:0] data;
    rand bit       last;

    \`uvm_object_utils_begin(simple_vr_item)
      \`uvm_field_int(data, UVM_ALL_ON)
      \`uvm_field_int(last, UVM_ALL_ON)
    \`uvm_object_utils_end

    function new(string name = "simple_vr_item");
      super.new(name);
    endfunction

  endclass


  class simple_vr_driver extends uvm_driver #(simple_vr_item);

    \`uvm_component_utils(simple_vr_driver)

    virtual simple_vr_if vif;

    function new(string name = "simple_vr_driver",
                 uvm_component parent = null);
      super.new(name, parent);
    endfunction

    function void build_phase(uvm_phase phase);
      super.build_phase(phase);

      // TODO:
      // Get virtual interface from uvm_config_db.
      // Fatal if missing.
    endfunction

    task run_phase(uvm_phase phase);
      // TODO:
      // Drive reset-safe idle values after a clocking event.
      // Forever:
      //   wait for reset release sampled through drv_cb
      //   get_next_item(req)
      //   drive item or abort on reset
      //   item_done()
    endtask

    task reset_outputs();
      // TODO:
      // Drive valid/data/last to idle values.
    endtask

    task wait_reset_released();
      // TODO:
      // Wait until reset_n is sampled high through drv_cb.
    endtask

    task drive_one(simple_vr_item tr, output bit aborted);
      // TODO:
      // Align first drive to drv_cb.
      // Assert valid and payload.
      // Hold stable until ready.
      // If reset asserts, cleanup and return aborted=1.
      // If ready is observed, cleanup and return aborted=0.
    endtask

  endclass

endpackage`}</CodeBlock>
            </CollapsibleCard>

            <CollapsibleCard
              title="Code Lab 1C — Final Solution"
              accent="violet"
              icon={<FaFlask size={12} />}
            >
              <CodeBlock lang="systemverilog">{`package module1_driver_pkg;

  import uvm_pkg::*;
  \`include "uvm_macros.svh"

  class simple_vr_item extends uvm_sequence_item;

    rand bit [7:0] data;
    rand bit       last;

    \`uvm_object_utils_begin(simple_vr_item)
      \`uvm_field_int(data, UVM_ALL_ON)
      \`uvm_field_int(last, UVM_ALL_ON)
    \`uvm_object_utils_end

    function new(string name = "simple_vr_item");
      super.new(name);
    endfunction

  endclass


  class simple_vr_driver extends uvm_driver #(simple_vr_item);

    \`uvm_component_utils(simple_vr_driver)

    virtual simple_vr_if vif;

    function new(string name = "simple_vr_driver",
                 uvm_component parent = null);
      super.new(name, parent);
    endfunction

    function void build_phase(uvm_phase phase);
      super.build_phase(phase);

      if (!uvm_config_db#(virtual simple_vr_if)::get(this, "", "vif", vif)) begin
        \`uvm_fatal("NOVIF", "simple_vr_driver requires virtual interface 'vif'")
      end
    endfunction

    task run_phase(uvm_phase phase);
      bit aborted;

      @(vif.drv_cb);
      reset_outputs();

      forever begin
        wait_reset_released();

        seq_item_port.get_next_item(req);

        if (req == null) begin
          \`uvm_fatal("NULLREQ", "seq_item_port returned a null request")
        end

        drive_one(req, aborted);

        if (aborted) begin
          \`uvm_warning("DRV_ABORT",
            "Transfer aborted by reset after item was accepted")
        end

        seq_item_port.item_done();
      end
    endtask

    task reset_outputs();
      vif.drv_cb.valid <= 1'b0;
      vif.drv_cb.data  <= '0;
      vif.drv_cb.last  <= 1'b0;
    endtask

    task wait_reset_released();
      do begin
        @(vif.drv_cb);
        reset_outputs();
      end while (vif.drv_cb.reset_n !== 1'b1);
    endtask

    task drive_one(simple_vr_item tr, output bit aborted);
      aborted = 1'b0;

      \`uvm_info("DRV_START",
        $sformatf("Driving simple_vr_item data=0x%0h last=%0b",
                  tr.data, tr.last),
        UVM_MEDIUM)

      @(vif.drv_cb);

      if (vif.drv_cb.reset_n !== 1'b1) begin
        aborted = 1'b1;
        reset_outputs();
        return;
      end

      vif.drv_cb.valid <= 1'b1;
      vif.drv_cb.data  <= tr.data;
      vif.drv_cb.last  <= tr.last;

      forever begin
        @(vif.drv_cb);

        if (vif.drv_cb.reset_n !== 1'b1) begin
          aborted = 1'b1;
          reset_outputs();
          return;
        end

        if (vif.drv_cb.ready === 1'b1) begin
          reset_outputs();

          \`uvm_info("DRV_DONE",
            $sformatf("Completed simple_vr_item data=0x%0h last=%0b",
                      tr.data, tr.last),
            UVM_MEDIUM)

          return;
        end
      end
    endtask

  endclass

endpackage`}</CodeBlock>
              <p className="text-slate-400 text-sm mt-4 mb-2">
                Compile-Readiness Audit:
              </p>
              <Table
                headers={["Item", "Status"]}
                rows={[
                  ["uvm_pkg imported", "Pass"],
                  ["uvm_macros.svh included", "Pass"],
                  ["Driver extends uvm_driver #(simple_vr_item)", "Pass"],
                  ["Constructor signature legal", "Pass"],
                  ["Factory macro legal", "Pass"],
                  ["Virtual interface declared", "Pass"],
                  ["Interface visibility requirement documented", "Pass"],
                  ["build_phase signature legal", "Pass"],
                  ["run_phase signature legal", "Pass"],
                  ["get_next_item() paired with item_done()", "Pass"],
                  ["Null request checked", "Pass"],
                  ["Reset abort does not strand item", "Pass"],
                  ["First drive aligned to clocking event", "Pass"],
                  ["Clocking block used", "Pass"],
                  ["No vendor-specific API", "Pass"],
                ]}
              />
              <p className="text-slate-400 text-sm mt-4 mb-2">
                Driver Contract Used in This Lab:
              </p>
              <Table
                headers={["Contract Item", "Policy"]}
                rows={[
                  ["Item acquisition", "get_next_item(req)"],
                  ["Completion", "handshake observed or reset abort handled"],
                  ["Cleanup", "deassert driven outputs"],
                  ["Sequencer release", "item_done() after cleanup/abort"],
                  ["Response", "none"],
                  [
                    "Reset during active transfer",
                    "abort transfer, cleanup, call item_done()",
                  ],
                  ["Functional checking", "none"],
                  ["Request handle after completion", "not used"],
                ]}
              />
            </CollapsibleCard>

            <CollapsibleCard
              title="Code Lab 1D — Minimal Config Binding Sketch"
              accent="emerald"
              icon={<FaFlask size={12} />}
            >
              <p className="text-slate-400 text-sm mb-2">
                This is a binding sketch, not a complete environment.
              </p>
              <CodeBlock lang="systemverilog">{`module tb_top;

  import uvm_pkg::*;
  import module1_driver_pkg::*;

  logic clk;
  logic reset_n;

  simple_vr_if vif(.clk(clk), .reset_n(reset_n));

  initial begin
    clk = 1'b0;
    forever #5 clk = ~clk;
  end

  initial begin
    reset_n = 1'b0;
    repeat (5) @(posedge clk);
    reset_n = 1'b1;
  end

  initial begin
    uvm_config_db#(virtual simple_vr_if)::set(
      null,
      "uvm_test_top.env.agent.drv",
      "vif",
      vif
    );

    run_test();
  end

endmodule`}</CodeBlock>
              <Callout type="trap">
                The instance path must match the actual driver hierarchy. A
                mismatch causes NOVIF.
              </Callout>
            </CollapsibleCard>

            <CollapsibleCard
              title="Code Lab 2 — try_next_item() Idle-Aware Pattern"
              accent="blue"
              icon={<FaFlask size={12} />}
            >
              <p className="text-slate-400 text-sm mb-3">
                <strong>Goal:</strong> Show how to use try_next_item() without
                null-handle bugs.
              </p>
              <p className="text-xs uppercase tracking-widest text-amber-400 font-semibold mb-1">
                TODO Starter
              </p>
              <CodeBlock lang="systemverilog">{`task run_phase(uvm_phase phase);
  forever begin
    wait_reset_released();

    // TODO:
    // Try to get an item.
    // If no item is available, drive one idle cycle.
    // If item is available, drive it and call item_done().
  end
endtask`}</CodeBlock>
              <p className="text-xs uppercase tracking-widest text-emerald-400 font-semibold mb-1 mt-3">
                Final Pattern
              </p>
              <CodeBlock lang="systemverilog">{`task run_phase(uvm_phase phase);
  bit aborted;

  @(vif.drv_cb);
  reset_outputs();

  forever begin
    wait_reset_released();

    seq_item_port.try_next_item(req);

    if (req == null) begin
      @(vif.drv_cb);
      reset_outputs();
    end
    else begin
      drive_one(req, aborted);

      if (aborted) begin
        \`uvm_warning("DRV_ABORT",
          "Transfer aborted by reset after try_next_item accepted an item")
      end

      seq_item_port.item_done();
    end
  end
endtask`}</CodeBlock>
              <Table
                headers={["Case", "Driver Obligation"]}
                rows={[
                  ["req == null", "No item accepted; do not call item_done()"],
                  ["req != null", "Item accepted; eventually call item_done()"],
                  [
                    "Reset during item",
                    "Cleanup and release item according to reset policy",
                  ],
                  ["No item available", "Drive legal idle behavior"],
                ]}
              />
            </CollapsibleCard>

            <CollapsibleCard
              title="Code Lab 3 — Optional Response Pattern"
              accent="violet"
              icon={<FaFlask size={12} />}
            >
              <p className="text-slate-400 text-sm mb-3">
                <strong>Goal:</strong> Show the minimal legal shape of a
                response-producing driver without implementing a full read
                protocol.
              </p>
              <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-1">
                Request/Response Classes
              </p>
              <CodeBlock lang="systemverilog">{`class simple_req extends uvm_sequence_item;

  rand bit [7:0] addr;
  rand bit       is_read;

  \`uvm_object_utils_begin(simple_req)
    \`uvm_field_int(addr,    UVM_ALL_ON)
    \`uvm_field_int(is_read, UVM_ALL_ON)
  \`uvm_object_utils_end

  function new(string name = "simple_req");
    super.new(name);
  endfunction

endclass


class simple_rsp extends uvm_sequence_item;

  bit [7:0] rdata;
  bit       error;

  \`uvm_object_utils_begin(simple_rsp)
    \`uvm_field_int(rdata, UVM_ALL_ON)
    \`uvm_field_int(error, UVM_ALL_ON)
  \`uvm_object_utils_end

  function new(string name = "simple_rsp");
    super.new(name);
  endfunction

endclass`}</CodeBlock>
              <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-1 mt-3">
                Driver Type With Response Parameter
              </p>
              <CodeBlock lang="systemverilog">{`class simple_rsp_driver extends uvm_driver #(simple_req, simple_rsp);

  \`uvm_component_utils(simple_rsp_driver)

  function new(string name = "simple_rsp_driver",
               uvm_component parent = null);
    super.new(name, parent);
  endfunction

  task run_phase(uvm_phase phase);
    simple_rsp local_rsp;

    forever begin
      seq_item_port.get_next_item(req);

      // Protocol execution would occur here.
      // Example only: assume read data/status have been captured.

      if (req.is_read) begin
        local_rsp = simple_rsp::type_id::create("local_rsp");
        local_rsp.set_id_info(req);
        local_rsp.rdata = 8'h00;
        local_rsp.error = 1'b0;
        seq_item_port.put_response(local_rsp);
      end

      seq_item_port.item_done();
    end
  endtask

endclass`}</CodeBlock>
              <Callout type="concept">
                This pattern is legal when: the sequence expects a response,
                response object is constructed, response identity is copied from
                request using set_id_info(req), response is sent through
                put_response(), and get_next_item() is still paired with
                item_done(). Do not use this pattern blindly for every driver.
              </Callout>
            </CollapsibleCard>
          </section>

          {/* ── §13 Bug Gallery ─────────────────────────────────────────── */}
          <section id="bugs">
            <SectionHeading num={13} title="Bug Gallery" />
            {module1BugGallery.map((bug) => (
              <CollapsibleCard
                key={bug.title}
                title={bug.title}
                accent="rose"
                icon={<FaBug size={12} />}
              >
                <Callout type="trap">
                  <strong>Symptom:</strong> {bug.symptom}
                </Callout>
                <p className="text-xs text-slate-400 mb-3">
                  <strong>Waveform Clue:</strong>
                </p>
                <CodeBlock lang="text">{bug.waveform}</CodeBlock>
                <p className="text-xs text-slate-400 mt-3 mb-3">
                  <strong>Root Cause:</strong> {bug.cause}
                </p>
                <p className="text-xs uppercase tracking-widest text-rose-400 font-semibold mb-1">
                  Bad Code
                </p>
                <CodeBlock lang="systemverilog">{bug.bad}</CodeBlock>
                <p className="text-xs uppercase tracking-widest text-emerald-400 font-semibold mb-1 mt-3">
                  Correct Fix
                </p>
                <CodeBlock lang="systemverilog">{bug.fix}</CodeBlock>
                <Callout type="interview">{bug.interview}</Callout>
              </CollapsibleCard>
            ))}
          </section>

          {/* ── §14 Race-Condition Checklist ────────────────────────────── */}
          <section id="race">
            <SectionHeading num={14} title="Race-Condition Checklist" />
            <p className="text-slate-400 text-sm mb-3">
              Use this checklist before accepting a driver implementation.
            </p>
            <Table
              headers={["Check", "Question"]}
              rows={[
                [
                  "Drive region",
                  "Are interface signals driven through a clocking block or documented scheduling convention?",
                ],
                [
                  "Sample region",
                  "Are DUT outputs sampled in a stable region?",
                ],
                [
                  "Valid stability",
                  "Does payload remain stable while waiting for handshake?",
                ],
                [
                  "Cleanup timing",
                  "Are controls deasserted only after legal completion or abort?",
                ],
                [
                  "Monitor alignment",
                  "Will monitor sample the same transfer the DUT accepted?",
                ],
                [
                  "Reset sampling",
                  "Can reset assert during every blocking wait?",
                ],
                [
                  "Zero-delay loops",
                  "Is there any while loop without time advance?",
                ],
                [
                  "NBA/blocking usage",
                  "Are interface drives scheduled intentionally?",
                ],
                [
                  "X handling",
                  "Does the driver avoid treating X as a valid handshake?",
                ],
                [
                  "Phase shutdown",
                  "Can forever loops be killed safely by UVM phase mechanics?",
                ],
                [
                  "Multiple drivers",
                  "Is there exactly one active driver per driven signal?",
                ],
                [
                  "Clocking block skew",
                  "Is input/output skew compatible with DUT/monitor timing?",
                ],
                [
                  "Handle lifetime",
                  "Is req unused or safely copied after item_done()?",
                ],
                [
                  "Response routing",
                  "Are response IDs preserved where needed?",
                ],
              ]}
            />
          </section>

          {/* ── §15 Debug Instrumentation / Log Strategy ─────────────────── */}
          <section id="debug">
            <SectionHeading
              num={15}
              title="Debug Instrumentation / Log Strategy"
            />
            <p className="text-slate-400 text-sm mb-3">
              A useful driver log tells you:
            </p>
            <ol className="list-decimal list-inside text-slate-300 text-sm space-y-1 mb-4">
              <li className="pl-2">When an item was accepted from sequencer</li>
              <li className="pl-2">Transaction identity or key fields</li>
              <li className="pl-2">When pin driving started</li>
              <li className="pl-2">When handshake/completion occurred</li>
              <li className="pl-2">Whether reset aborted the item</li>
              <li className="pl-2">Whether response was sent</li>
              <li className="pl-2">When cleanup happened</li>
            </ol>
            <CodeBlock lang="systemverilog">{`\`uvm_info("DRV_GET",
  $sformatf("Accepted item: %s", req.convert2string()),
  UVM_HIGH)

\`uvm_info("DRV_START",
  $sformatf("Driving data=0x%0h last=%0b", req.data, req.last),
  UVM_MEDIUM)

\`uvm_info("DRV_DONE",
  "Handshake observed; cleanup complete",
  UVM_MEDIUM)

\`uvm_warning("DRV_ABORT",
  "Reset asserted during active item; item aborted by driver policy")`}</CodeBlock>
            <Callout type="trap">
              <strong>Bad logging:</strong>{" "}
              <code className="text-violet-300">
                `uvm_info("DRV", "start", UVM_LOW)
              </code>{" "}
              and{" "}
              <code className="text-violet-300">
                `uvm_info("DRV", "done", UVM_LOW)
              </code>{" "}
              — almost useless in a real debug session.
            </Callout>
            <Callout type="interview">
              Every log should answer at least one of: What item was accepted?
              What pins were driven? What event completed the protocol? What
              abnormal event changed the path? What response was returned? What
              cleanup occurred? Was the request copied or released?
            </Callout>
          </section>

          {/* ── §16 Monitor / Scoreboard / Assertion Boundary ───────────── */}
          <section id="monitor-boundary">
            <SectionHeading
              num={16}
              title="Monitor / Scoreboard / Assertion Boundary"
            />

            <CollapsibleCard title="20.1 Driver vs Monitor" accent="violet">
              <Table
                headers={["Driver", "Monitor"]}
                rows={[
                  ["Active component", "Passive component"],
                  ["Drives DUT inputs", "Drives nothing"],
                  [
                    "Uses transaction intent",
                    "Reconstructs observed transaction",
                  ],
                  ["May observe handshake", "Observes full bus protocol"],
                  ["Calls item_done()", "Publishes analysis transaction"],
                  [
                    "Not source of actual results",
                    "Source of actual observed results",
                  ],
                ]}
              />
            </CollapsibleCard>

            <CollapsibleCard title="20.2 Driver vs Scoreboard" accent="blue">
              <Table
                headers={["Driver", "Scoreboard"]}
                rows={[
                  ["Executes stimulus", "Compares expected vs actual"],
                  ["May capture response", "Owns correctness decision"],
                  [
                    "Should not know full reference model",
                    "May contain/reference prediction model",
                  ],
                  [
                    "Logs protocol milestones",
                    "Logs mismatches and ordering errors",
                  ],
                ]}
              />
            </CollapsibleCard>

            <CollapsibleCard title="20.3 Driver vs Assertion" accent="amber">
              <Table
                headers={["Driver", "Assertion"]}
                rows={[
                  [
                    "Should drive legal protocol",
                    "Checks temporal protocol invariants",
                  ],
                  ["May avoid illegal requests", "Catches illegal waveforms"],
                  ["Procedural", "Declarative/temporal"],
                  ["Stimulus-side", "Interface/property-side"],
                ]}
              />
            </CollapsibleCard>

            <Callout type="interview">
              Boundary rule: If removing the driver check would still allow
              monitor/scoreboard/assertions to detect the bug, the check
              probably does not belong in the driver. Exception: local fatal
              checks for unsafe driver operation, unsupported transaction
              encoding, null handle, interface missing, impossible protocol
              mode.
            </Callout>
          </section>

          {/* ── §17 Architectural Decision Points ──────────────────────── */}
          <section id="arch-decisions">
            <SectionHeading num={17} title="Architectural Decision Points" />
            <p className="text-slate-400 text-sm mb-3">
              A senior/principal engineer should explicitly decide these before
              coding a driver.
            </p>
            <Table
              headers={["Decision", "Options", "Module 1 Guidance"]}
              rows={[
                [
                  "Item acquisition API",
                  "get_next_item, get, try_next_item",
                  "Pick one primary contract and document it",
                ],
                [
                  "Completion point",
                  "acceptance, full completion, response",
                  "Non-pipelined examples use full completion",
                ],
                [
                  "Response style",
                  "no response, item_done(rsp), put_response()",
                  "Use response only when needed",
                ],
                [
                  "Reset during item",
                  "abort, retry, complete with error",
                  "Must not deadlock sequencer",
                ],
                [
                  "Request lifetime",
                  "direct handle, copied fields, clone",
                  "Copy/clone before delayed ownership",
                ],
                [
                  "Timing method",
                  "clocking block, raw posedge convention",
                  "Clocking block preferred for teaching",
                ],
                [
                  "Timeout policy",
                  "driver timeout, assertion timeout, test timeout",
                  "Avoid hiding DUT bug unless policy explicit",
                ],
                [
                  "Error injection",
                  "driver field, sequence mode, config",
                  "Later modules",
                ],
                [
                  "Multi-channel structure",
                  "sequential, forked, queues",
                  "Later modules",
                ],
                [
                  "Debug logs",
                  "low/medium/high verbosity",
                  "Align logs to protocol milestones",
                ],
                [
                  "Ownership split",
                  "driver vs monitor vs scoreboard",
                  "Keep strict boundaries",
                ],
              ]}
            />
          </section>

          {/* ── §18 Scalability Notes ────────────────────────────────────── */}
          <section id="scalability">
            <SectionHeading num={18} title="Scalability Notes" />
            <p className="text-slate-400 text-sm mb-3">
              A simple driver can be one class with one drive_one() task. A
              production VIP driver often needs more structure. Scalability
              pressure appears when:
            </p>
            <ul className="list-disc list-inside text-slate-300 text-sm space-y-1 mb-4">
              {[
                "Protocol has multiple channels",
                "Request and response are decoupled",
                "Transfers are pipelined",
                "Reset can occur mid-transaction",
                "Backpressure is randomized",
                "Error injection is supported",
                "Multiple outstanding IDs exist",
                "Timing modes are configurable",
                "Low-power states affect interface legality",
                "The driver must be reused across projects",
              ].map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <Callout type="interview">
              Start with a clean ownership contract. You can scale a clean
              driver. You cannot safely scale a confused one.
            </Callout>
          </section>

          {/* ── §19 Review Checklist ────────────────────────────────────── */}
          <section id="review">
            <SectionHeading num={19} title="Review Checklist" />
            <p className="text-slate-400 text-sm mb-3">
              Before accepting any UVM driver, inspect:
            </p>

            {[
              {
                heading: "API Contract",
                accent: "violet",
                items: [
                  "Does it use get_next_item()/item_done() correctly?",
                  "If it uses get(), does it avoid item_done()?",
                  "If it uses try_next_item(), does it handle null?",
                  "Are responses constructed only when needed?",
                  "Does response routing use set_id_info(req) when required?",
                  "Is request-handle lifetime controlled after item_done()?",
                ],
              },
              {
                heading: "Protocol Contract",
                accent: "blue",
                items: [
                  "Is completion clearly defined?",
                  "Are driver-owned and DUT-owned signals separated?",
                  "Are idle values defined?",
                  "Is cleanup timing legal?",
                  "Are backpressure/wait states handled?",
                  "Are X/Z handshake values treated conservatively?",
                ],
              },
              {
                heading: "Reset Contract",
                accent: "amber",
                items: [
                  "Does the driver wait for reset release before accepting normal items?",
                  "Can reset abort every blocking wait?",
                  "Does accepted item ownership end cleanly after reset?",
                  "Are driven outputs reset/deasserted?",
                  "Is retry vs abort explicitly defined?",
                ],
              },
              {
                heading: "Boundary Contract",
                accent: "emerald",
                items: [
                  "Is the driver free of scoreboard comparisons?",
                  "Is monitor responsible for observed transactions?",
                  "Are assertions responsible for temporal protocol rules?",
                  "Are debug logs protocol-focused?",
                ],
              },
              {
                heading: "Compile/Portability Contract",
                accent: "rose",
                items: [
                  "Is the virtual interface type visible before the package that references it?",
                  "Does uvm_config_db fail fast if vif is missing?",
                  "Are UVM 1.2 APIs used without vendor extensions?",
                  "Are phase/task/function signatures legal?",
                  "Are no undeclared variables used?",
                ],
              },
              {
                heading: "Race Contract",
                accent: "violet",
                items: [
                  "Are drive/sample regions defined?",
                  "Is payload stable while waiting?",
                  "Are X values handled conservatively?",
                  "Are there no zero-time infinite loops?",
                  "Is monitor sampling compatible with driver timing?",
                ],
              },
            ].map(({ heading, accent, items }) => {
              const accentMap = {
                violet: "text-violet-400",
                amber: "text-amber-400",
                blue: "text-blue-400",
                emerald: "text-emerald-400",
                rose: "text-rose-400",
              };
              return (
                <div
                  key={heading}
                  className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 mb-4"
                >
                  <p
                    className={`text-xs uppercase tracking-widest font-semibold mb-3 ${accentMap[accent]}`}
                  >
                    {heading}
                  </p>
                  <ul className="space-y-2">
                    {items.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-slate-300"
                      >
                        <FaCheckSquare
                          className={`mt-0.5 shrink-0 ${accentMap[accent]}`}
                          size={13}
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </section>

          {/* ── §20 Interview Q&A ────────────────────────────────────────── */}
          <section id="interview">
            <SectionHeading num={20} title="Interview Q&A" />
            {module1InterviewQA.map((qa) => (
              <CollapsibleCard
                key={qa.q}
                title={qa.q}
                accent="violet"
                icon={<FaQuestionCircle size={12} />}
              >
                <Callout type="hook">
                  <strong>Crisp Answer:</strong> {qa.short}
                </Callout>
                <Callout type="concept">
                  <strong>Deep Answer:</strong> {qa.deep}
                </Callout>
                {qa.followup && (
                  <div className="mt-3 p-3 rounded-lg bg-slate-800/50 text-sm">
                    <p className="text-slate-300 font-semibold mb-1">
                      Common Follow-Up: {qa.followup}
                    </p>
                    <p className="text-slate-400">{qa.answer}</p>
                  </div>
                )}
                {qa.code && (
                  <div className="mt-3">
                    <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-1">
                      Code Anchor
                    </p>
                    <CodeBlock lang="systemverilog">{qa.code}</CodeBlock>
                  </div>
                )}
              </CollapsibleCard>
            ))}
          </section>

          {/* ── §21 Final Recall Card ────────────────────────────────────── */}
          <section id="recall">
            <SectionHeading num={21} title="Final Recall Card" />
            <div className="rounded-2xl bg-gradient-to-br from-violet-600/10 to-indigo-600/10 border border-violet-500/20 p-6">
              <p className="text-xs uppercase tracking-widest text-violet-400 font-semibold mb-3">
                The Six Driver Questions
              </p>
              <p className="text-slate-400 text-sm mb-3">
                Before writing any UVM driver, answer these:
              </p>
              <ol className="list-decimal list-inside text-slate-300 text-sm space-y-3 mb-6">
                <li className="pl-2">
                  <strong className="text-slate-200">
                    What does the transaction mean?
                  </strong>{" "}
                  Define intent fields.
                </li>
                <li className="pl-2">
                  <strong className="text-slate-200">
                    What pins does the driver own?
                  </strong>{" "}
                  Separate driver-owned, DUT-owned, shared, tri-state, and
                  passive signals.
                </li>
                <li className="pl-2">
                  <strong className="text-slate-200">
                    What waveform proves completion?
                  </strong>{" "}
                  Define handshake, wait state, response, cleanup, and abort
                  events.
                </li>
                <li className="pl-2">
                  <strong className="text-slate-200">
                    What is the sequence-driver API contract?
                  </strong>{" "}
                  Choose get_next_item()/item_done(), get(), try_next_item(),
                  and response policy.
                </li>
                <li className="pl-2">
                  <strong className="text-slate-200">
                    What happens on reset?
                  </strong>{" "}
                  Define cleanup, abort/retry, item release, response, and
                  scoreboard flush ownership.
                </li>
                <li className="pl-2">
                  <strong className="text-slate-200">
                    What happens to the request handle after completion?
                  </strong>{" "}
                  Define direct use, copy, clone, or outstanding metadata
                  ownership.
                </li>
              </ol>
              <p className="text-xs uppercase tracking-widest text-violet-400 font-semibold mb-2">
                One-Line Master Answer
              </p>
              <p className="text-slate-200 text-sm leading-relaxed italic">
                A UVM driver is a protocol execution boundary that converts
                sequencer-granted transaction intent into legal interface
                behavior, handles completion/reset/response according to a
                documented contract, and leaves observation and correctness
                checking to monitor, scoreboard, and assertions.
              </p>
            </div>
          </section>

          {/* ── §22 Key Takeaways ────────────────────────────────────────── */}
          <section id="takeaways">
            <SectionHeading num={22} title="Key Takeaways" />
            <ol className="space-y-2 list-decimal list-inside text-slate-300 text-sm">
              {[
                "A driver is not just pin-wiggling code; it is the protocol execution boundary.",
                "Transaction fields describe intent, not timing.",
                "Protocol contract must be defined before UVM API usage.",
                "Driver owns DUT input driving and protocol completion observation.",
                "Driver must not become a scoreboard.",
                "get_next_item() must eventually pair with item_done().",
                "get() must not pair with item_done().",
                "try_next_item() requires null handling.",
                "item_done() timing is a design contract.",
                "Reset during an accepted item must not deadlock the sequencer.",
                "Responses are needed only when the sequence contract requires returned information.",
                "Response routing needs set_id_info(req) when response matching matters.",
                "Request handles must not be mutated or relied on after completion.",
                "Clocking/sampling discipline prevents race-dependent drivers.",
                "Clean ownership boundaries scale to real VIP.",
              ].map((t, i) => (
                <li key={i} className="pl-2">
                  {t}
                </li>
              ))}
            </ol>
          </section>

          {/* ── §23 Interview Questions ──────────────────────────────────── */}
          <section id="interview-questions">
            <SectionHeading
              num={23}
              title="Interview Questions (Active Recall)"
            />
            <p className="text-slate-400 text-sm mb-3">
              Use these for active recall practice.
            </p>
            <ol className="space-y-2 list-decimal list-inside text-slate-300 text-sm">
              {[
                "Explain the role of a UVM driver in one sentence.",
                "Why is transaction intent different from pin-level protocol execution?",
                "What does the driver own that the monitor does not?",
                "What does the monitor own that the driver must not own?",
                "When is it legal for a driver to observe DUT outputs?",
                "Why is calling item_done() too early dangerous?",
                "Explain get_next_item() vs get().",
                "What must you do after try_next_item() returns a non-null request?",
                "What must you not do after try_next_item() returns null?",
                "When is a response object required?",
                "Why is set_id_info(req) used?",
                "What should happen if reset asserts during an active item?",
                "Why should the driver not compare actual vs expected DUT output?",
                "What are good driver log points?",
                "Why can raw @(posedge clk) cause driver races?",
                "What is the difference between non-pipelined completion and pipelined acceptance?",
                "Why is request-handle lifetime important?",
                "When should a driver clone or copy transaction data?",
                "What should happen if uvm_config_db does not provide the virtual interface?",
                "What is the clean boundary between driver timeout and assertion-based liveness checking?",
              ].map((q, i) => (
                <li key={i} className="pl-2">
                  {q}
                </li>
              ))}
            </ol>
          </section>

          {/* ── §24 Coding Exercise ─────────────────────────────────────── */}
          <section id="exercise">
            <SectionHeading num={24} title="Coding Exercise" />
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
              <p className="text-slate-200 text-sm font-semibold mb-2">
                Exercise — Fix the Broken Driver
              </p>
              <p className="text-xs uppercase tracking-widest text-rose-400 font-semibold mb-1">
                Broken Code
              </p>
              <CodeBlock lang="systemverilog">{`task run_phase(uvm_phase phase);
  forever begin
    seq_item_port.get_next_item(req);

    vif.valid = 1'b1;
    vif.data  = req.data;

    seq_item_port.item_done();

    wait (vif.ready == 1'b1);

    vif.valid = 1'b0;
  end
endtask`}</CodeBlock>
              <p className="text-slate-400 text-sm mt-4 mb-2">
                <strong>Required Fixes:</strong> Correct this driver so that:
              </p>
              <ol className="list-decimal list-inside text-slate-300 text-sm space-y-1 mb-4">
                <li className="pl-2">
                  item_done() is not called before handshake.
                </li>
                <li className="pl-2">
                  Payload remains stable until acceptance.
                </li>
                <li className="pl-2">Reset cannot deadlock the driver.</li>
                <li className="pl-2">Driven outputs are cleaned up.</li>
                <li className="pl-2">
                  Interface timing avoids obvious active-region races.
                </li>
                <li className="pl-2">No scoreboard-like checking is added.</li>
                <li className="pl-2">
                  The request handle is not used after completion.
                </li>
              </ol>
              <p className="text-xs uppercase tracking-widest text-emerald-400 font-semibold mb-1">
                Expected Direction
              </p>
              <CodeBlock lang="systemverilog">{`task run_phase(uvm_phase phase);
  bit aborted;

  @(vif.drv_cb);
  reset_outputs();

  forever begin
    wait_reset_released();

    seq_item_port.get_next_item(req);

    drive_one(req, aborted);

    if (aborted) begin
      \`uvm_warning("DRV_ABORT", "Reset aborted active transfer")
    end

    seq_item_port.item_done();
  end
endtask`}</CodeBlock>
              <Callout type="concept">
                The actual drive_one() task should hold valid/data stable until
                ready or reset abort.
              </Callout>
            </div>
          </section>

          {/* Navigation to next module */}
          <ModuleNavigation
            prevPath="/driver-mastery/module0"
            prevTitle="← Module 0: SV/UVM Foundation Before Drivers"
            nextPath="/driver-mastery/module2"
            nextTitle="Module 2: Full Driver Class Anatomy →"
          />
        </main>
      </div>
    </div>
  );
};

export default Module1;
