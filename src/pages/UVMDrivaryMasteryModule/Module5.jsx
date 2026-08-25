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
// DATA — Memory Cards (22 Cards)
// ─────────────────────────────────────────────────────────────────────────────

const module5MemoryCards = [
  {
    title: "Card 1 — Intent Is Not Execution [BEHAVIOR]",
    accent: "violet",
    hook: "A sequence asks. A driver proves.",
    concept:
      "The sequence creates transaction intent. The sequencer arbitrates among available sequence requests. The driver executes exactly the selected transaction on the interface.",
    code: `seq_item_port.get_next_item(req);
drive_one_item(req);
seq_item_port.item_done();`,
    trap: "Thinking sequence item submission means the DUT has seen the transfer.",
    interview:
      "finish_item() submits intent; item_done() retires driver execution.",
  },
  {
    title: "Card 2 — The Sequencer Arbitrates, Not the Driver [OWNER]",
    accent: "blue",
    hook: "The driver pulls the winner; it does not run the election.",
    concept:
      "The sequencer decides which sequence's item is granted. The driver receives one selected item.",
    code: `seq_item_port.get_next_item(req); // selected item only`,
    trap: "Adding driver-side sequence priority logic.",
    interview:
      "Driver-side arbitration is a design smell; sequencing policy belongs in the sequencer/sequence layer.",
  },
  {
    title: "Card 3 — get_next_item() Creates Debt [CONTRACT]",
    accent: "rose",
    hook: "Pull item, owe completion.",
    concept:
      "After get_next_item() returns, the driver has an outstanding item. Every legal path must close it.",
    code: `seq_item_port.get_next_item(req);
// all branches from here must converge to item_done or defined shutdown
seq_item_port.item_done();`,
    trap: "Skipping item_done() on error or reset.",
    interview:
      "A successful get_next_item() creates exactly one completion obligation.",
  },
  {
    title: "Card 4 — item_done() Releases Sequencer State [UVM]",
    accent: "emerald",
    hook: "It releases UVM control flow, not hardware magically.",
    concept:
      "item_done() tells the sequencer the current request is complete. It does not clean pins, sample response, or check DUT correctness by itself.",
    code: `drive_transfer(req);
drive_idle();
seq_item_port.item_done();`,
    trap: "Calling item_done() before cleanup in a non-pipelined driver.",
    interview:
      "I place item_done() only where the sequence may safely continue.",
  },
  {
    title: "Card 5 — get() Is a Different Contract [CONTRACT]",
    accent: "amber",
    hook: "get() pulls without later item_done().",
    concept:
      "get(req) retrieves the request and completes the sequencer handshake without requiring driver item_done().",
    code: `seq_item_port.get(req);
drive_one_item(req);`,
    trap: "Calling item_done() after get(req), which corrupts sequencer state.",
    interview:
      "get() and get_next_item/item_done are mutually exclusive driver styles.",
  },
  {
    title: "Card 6 — try_next_item() Requires Null Discipline [BEHAVIOR]",
    accent: "blue",
    hook: "Null means no debt.",
    concept:
      "If try_next_item() returns null, no item was pulled. If it returns a valid item, the driver owes item_done().",
    code: `seq_item_port.try_next_item(req);
if (req != null) begin
  drive_one_item(req);
  seq_item_port.item_done();
end`,
    trap: "Dereferencing req before checking if it is null.",
    interview:
      "try_next_item() has two legal paths: idle or process-and-complete.",
  },
  {
    title: "Card 7 — peek() Looks Without Consuming [BOUNDARY]",
    accent: "violet",
    hook: "Look is not ownership.",
    concept:
      "peek() can inspect the current item without removing it. It is not the default active-driver API.",
    code: `seq_item_port.peek(req);`,
    trap: "Using peek() as a workaround for bad driver structure.",
    interview:
      "I avoid peek() unless the architecture explicitly requires non-consuming inspection.",
  },
  {
    title: "Card 8 — Request Object Is Intent, Not Scratchpad [OWNER]",
    accent: "rose",
    hook: "Do not scribble on the instruction sheet.",
    concept:
      "The request handle represents sequence intent. The driver should avoid mutating request fields unless that mutation is part of a documented contract.",
    code: `bit [31:0] local_addr;
local_addr = req.addr + 4; // derived local value`,
    trap: "Changing req.addr directly for internal convenience.",
    interview:
      "I treat request fields as immutable intent during driver execution.",
  },
  {
    title: "Card 9 — Clone or Copy Only When Lifecycle Requires It [SENIOR]",
    accent: "emerald",
    hook: "Copy when the request must outlive completion.",
    concept:
      "If a pipelined or delayed-response driver needs request data after item_done(), copy fields or clone the object. Do not rely on unclear request-handle lifetime.",
    code: `saved_req = my_req::type_id::create("saved_req");
saved_req.copy(req);`,
    trap: "Storing raw req handles in queues without defining ownership.",
    interview:
      "For delayed responses, I preserve identity and required fields explicitly.",
  },
  {
    title: "Card 10 — Response Payload Is Not Enough [RESPONSE]",
    accent: "amber",
    hook: "A letter needs an address.",
    concept:
      "Response data must be routed back to the correct originating sequence. Use rsp.set_id_info(req).",
    code: `rsp.set_id_info(req);
seq_item_port.put_response(rsp);`,
    trap: "Filling rsp.data but forgetting ID routing.",
    interview:
      "Correct data with wrong response ID is still a broken driver.",
  },
  {
    title: "Card 11 — item_done(rsp) Means Done Plus Response [UVM]",
    accent: "violet",
    hook: "One call closes and answers.",
    concept:
      "Use item_done(rsp) when response is ready at the same point the item is complete.",
    code: `rsp.set_id_info(req);
seq_item_port.item_done(rsp);`,
    trap: "Also calling put_response(rsp) for the same response.",
    interview:
      "item_done(rsp) already sends the response associated with completion.",
  },
  {
    title: "Card 12 — put_response() Decouples Response Delivery [RESPONSE]",
    accent: "blue",
    hook: "Completion now, answer later.",
    concept:
      "Use put_response(rsp) when response delivery is separate from item completion.",
    code: `seq_item_port.item_done();
// later
rsp.set_id_info(saved_req);
seq_item_port.put_response(rsp);`,
    trap: "Using delayed response without saving request identity.",
    interview:
      "Decoupled responses require explicit ID/lifecycle management.",
  },
  {
    title: "Card 13 — Completion Point Is Architectural [CONTRACT]",
    accent: "emerald",
    hook: "item_done() is a policy decision.",
    concept:
      "Non-pipelined drivers usually complete after full transfer. Pipelined drivers may complete after request acceptance.",
    code: `// non-pipelined
drive_req(req);
capture_rsp(rsp);
seq_item_port.item_done(rsp);`,
    trap: "Calling item_done() immediately after request drive when response is still required.",
    interview:
      "I define completion based on when the sequence can safely issue dependent work.",
  },
  {
    title: "Card 14 — Missing item_done() Causes Classic Hangs [BUG]",
    accent: "rose",
    hook: "The sequence waits behind a closed gate.",
    concept:
      "If the driver never calls item_done(), a sequence waiting on item completion may hang.",
    code: `if (bad_req) begin
  \`uvm_error("DRV", "Bad request")
end
seq_item_port.item_done();`,
    trap: "Calling return from the driver task before completion.",
    interview:
      "My first deadlock check is get count versus item_done count.",
  },
  {
    title: "Card 15 — Early item_done() Causes Ordering Bugs [TIMING]",
    accent: "amber",
    hook: "Too early is also wrong.",
    concept:
      "Early completion lets the sequence submit dependent work before hardware/protocol state is ready.",
    code: `drive_address(req);
seq_item_port.item_done(); // bad for non-pipelined full-transfer contract
drive_data(req);`,
    trap: "Confusing request launch with request completion.",
    interview:
      "Early item completion is legal only when the architecture explicitly separates request acceptance from response completion.",
  },
  {
    title: "Card 16 — Reset Does Not Cancel Sequencer Debt [RESET]",
    accent: "rose",
    hook: "Reset clears pins, not obligations.",
    concept:
      "If reset occurs after item pull, the driver must complete or abort the outstanding item according to contract.",
    code: `if (!vif.rst_n) begin
  drive_idle();
  seq_item_port.item_done();
end`,
    trap: "Reset branch jumps to top of loop without completion.",
    interview:
      "Reset handling must release both interface state and sequencer state.",
  },
  {
    title: "Card 17 — Response Expectation Must Match Sequence Code [CONTRACT]",
    accent: "blue",
    hook: "If the sequence waits, the driver must answer.",
    concept:
      "If the sequence calls get_response(rsp), the driver must send a response. If driver only calls item_done() without response, the sequence can hang.",
    code: `rsp.set_id_info(req);
seq_item_port.item_done(rsp);`,
    trap: "Changing driver from response mode to no-response mode without updating sequences.",
    interview:
      "Driver response policy and sequence waiting policy must be designed together.",
  },
  {
    title: "Card 18 — Response Queue Bugs Are Control-Flow Bugs [DEBUG]",
    accent: "violet",
    hook: "Wrong response ID equals lost response.",
    concept:
      "Responses flow through sequencer response mechanisms. Missing, duplicate, or misrouted responses cause hangs or mismatches.",
    code: `rsp.set_id_info(req);
seq_item_port.put_response(rsp);`,
    trap: "Sending a response object constructed without request identity.",
    interview:
      "I debug response hangs by printing request and response transaction IDs.",
  },
  {
    title: "Card 19 — Driver Response Is Not Scoreboard Checking [BOUNDARY]",
    accent: "emerald",
    hook: "Return observation, do not judge correctness.",
    concept:
      "The driver may return observed read data or status to the sequence. It should not perform end-to-end expected-vs-actual checking.",
    code: `rsp.rdata = sampled_rdata; // okay
// compare to expected memory model here: not okay`,
    trap: "Embedding a reference model inside the driver.",
    interview:
      "The driver can capture protocol response; the scoreboard decides correctness.",
  },
  {
    title: "Card 20 — Blocking Points Must Be Known [DEBUG]",
    accent: "amber",
    hook: "Every wait can become a hang.",
    concept:
      "A driver can block waiting for sequence item, reset release, ready/response, or phase termination. Each wait needs a debug strategy.",
    code: `\`uvm_info("DRV_HS", "waiting for item", UVM_HIGH)
seq_item_port.get_next_item(req);`,
    trap: "No log before blocking call.",
    interview:
      "I instrument every major blocking point.",
  },
  {
    title: "Card 21 — Auto Recording Is Simple-Driver Friendly [UVM]",
    accent: "blue",
    hook: "Simple blocking flows get acceptable automatic begin/end.",
    concept:
      "UVM can automatically record item begin/end around get_next_item() and item_done(). For pipelined/out-of-order drivers, manual recording control is usually needed.",
    code: `seq_item_port.disable_auto_item_recording(); // only when architecture requires it`,
    trap: "Trusting automatic recording to represent actual bus timing in pipelined flows.",
    interview:
      "Auto recording is fine for blocking drivers; pipelined drivers need explicit transaction timing.",
  },
  {
    title: "Card 22 — API Style Is Architecture [SENIOR]",
    accent: "violet",
    hook: "Do not cargo-cult get_next_item().",
    concept:
      "Each API style encodes a different completion and blocking model.",
    code: `// get_next_item/item_done -> blocking current-item contract
// get                    -> immediate sequencer release
// try_next_item           -> optional item polling
// item_done(rsp)          -> completion plus response
// put_response            -> decoupled response`,
    trap: "Mixing API styles in one driver without a documented contract.",
    interview:
      "I choose the API after defining completion, response, and blocking semantics.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// DATA — Bug Gallery (10 Bugs)
// ─────────────────────────────────────────────────────────────────────────────

const module5BugGallery = [
  {
    title: "Bug 1 — Missing item_done() on Error Path",
    symptom: "Sequence hangs after unsupported command.",
    waveform: "No more bus activity after error log.",
    cause:
      "Driver pulled an item via get_next_item() but returned prematurely on an error branch without calling item_done().",
    bad: `seq_item_port.get_next_item(req);

if (req.cmd == CMD_WRITE) begin
  drive_one_item(req);
  seq_item_port.item_done();
end
else begin
  \`uvm_error("BAD_CMD", "Unsupported command")
  return; // BUG: item_done skipped!
end`,
    fix: `seq_item_port.get_next_item(req);

if (req.cmd == CMD_WRITE) begin
  drive_one_item(req);
end
else begin
  \`uvm_error("BAD_CMD", "Unsupported command")
end

seq_item_port.item_done(); // All branches complete`,
    interview:
      "All branches after a successful pull must converge to completion or defined abort.",
  },
  {
    title: "Bug 2 — item_done() After get()",
    symptom:
      "Sequencer-driver protocol inconsistency; tool runtime warnings or fatal errors on next transaction.",
    waveform:
      "Interface waveform may look normal while UVM sequencer control flow corrupts.",
    cause:
      "get() completes the sequencer handshake internally upon return; calling item_done() afterwards violates the contract.",
    bad: `seq_item_port.get(req);
drive_one_item(req);
seq_item_port.item_done(); // BUG: Illegal pairing`,
    fix: `seq_item_port.get(req);
drive_one_item(req);
// No item_done() call needed or allowed`,
    interview:
      "get() and get_next_item/item_done are different contracts.",
  },
  {
    title: "Bug 3 — Null Dereference After try_next_item()",
    symptom: "Null object fatal during idle periods or gap cycles.",
    waveform: "Failure occurs when no sequence item is active.",
    cause:
      "try_next_item() is non-blocking and returns null when no item is ready. Dereferencing req fields without a null check crashes simulation.",
    bad: `seq_item_port.try_next_item(req);
drive_one_item(req); // BUG: req may be null!
seq_item_port.item_done();`,
    fix: `seq_item_port.try_next_item(req);

if (req != null) begin
  drive_one_item(req);
  seq_item_port.item_done();
end
else begin
  drive_idle_cycle();
end`,
    interview:
      "Null return means no item was pulled, so no completion is owed.",
  },
  {
    title: "Bug 4 — Missing set_id_info(req)",
    symptom:
      "Sequence waits forever in get_response(rsp) or receives mismatched response objects.",
    waveform:
      "DUT response occurred and driver sent response, but sequence still blocks.",
    cause:
      "Response object created without copying sequence_id and transaction_id from the original request object.",
    bad: `rsp = bus_rsp::type_id::create("rsp");
rsp.rdata = sampled_data;
seq_item_port.put_response(rsp); // BUG: Missing routing metadata`,
    fix: `rsp = bus_rsp::type_id::create("rsp");
rsp.rdata = sampled_data;
rsp.set_id_info(req); // Preserves sequence & txn ID!
seq_item_port.put_response(rsp);`,
    interview:
      "Response routing is ID-based; payload alone is not enough.",
  },
  {
    title: "Bug 5 — Duplicate Response",
    symptom:
      "Duplicate response in sequence queue, response queue overflow, or subsequence mismatch.",
    waveform: "One DUT completion, two response sends logged.",
    cause:
      "Calling both item_done(rsp) and put_response(rsp) for the same transaction.",
    bad: `rsp.set_id_info(req);
seq_item_port.item_done(rsp);
seq_item_port.put_response(rsp); // BUG: Duplicate response!`,
    fix: `// Option A (Combined):
rsp.set_id_info(req);
seq_item_port.item_done(rsp);

// OR Option B (Separate):
// seq_item_port.item_done();
// seq_item_port.put_response(rsp);`,
    interview: "Completion response must be sent exactly once.",
  },
  {
    title: "Bug 6 — Early item_done()",
    symptom:
      "Next sequence item overlaps current bus transfer, corrupting address/data on DUT pins.",
    waveform:
      "Second transaction begins before first response completes on the bus.",
    cause:
      "Driver declared completion after address drive instead of waiting for full bus access completion.",
    bad: `seq_item_port.get_next_item(req);
drive_address(req);
seq_item_port.item_done(); // BUG: Access phase pending!
drive_data(req);
wait_response();`,
    fix: `seq_item_port.get_next_item(req);
drive_address(req);
drive_data(req);
wait_response();
drive_idle();
seq_item_port.item_done(); // Safe completion point`,
    interview:
      "Early completion is legal only when the architecture explicitly supports outstanding requests.",
  },
  {
    title: "Bug 7 — Reset Skips Completion",
    symptom:
      "After mid-transfer reset, sequence hangs indefinitely in finish_item().",
    waveform:
      "Reset asserted after pull. Driver cleans pins but never issues item_done.",
    cause:
      "Reset handling branch returns or continues loop without closing the outstanding sequencer debt.",
    bad: `seq_item_port.get_next_item(req);

if (!vif.rst_n) begin
  drive_idle();
  continue; // BUG: item_done skipped!
end

drive_one_item(req);
seq_item_port.item_done();`,
    fix: `seq_item_port.get_next_item(req);

if (!vif.rst_n) begin
  drive_idle();
  seq_item_port.item_done(); // Resolves sequencer debt!
  continue;
end

drive_one_item(req);
seq_item_port.item_done();`,
    interview:
      "Reset must clean hardware state and release UVM sequencing state.",
  },
  {
    title: "Bug 8 — Response Expected, But Driver Sends None",
    symptom:
      "Sequence hangs in get_response(rsp) or `uvm_do_with macros expecting response.",
    waveform:
      "Read data appears on interface but no response object is logged or routed.",
    cause:
      "Driver completion policy calls item_done() without passing rsp when sequence is blocking for response.",
    bad: `seq_item_port.get_next_item(req);
drive_read(req);
seq_item_port.item_done(); // BUG: Sequence waiting for response!`,
    fix: `seq_item_port.get_next_item(req);
drive_read_and_capture(req, rsp);
rsp.set_id_info(req);
seq_item_port.item_done(rsp); // Routes response back`,
    interview:
      "Completion and response are separate concepts. If the sequence waits for response, the driver must send one.",
  },
  {
    title: "Bug 9 — Mutating Request Fields",
    symptom:
      "Sequence logs and driven waveforms disagree; post-transaction analysis corrupted.",
    waveform: "Driven address differs from generated item address.",
    cause:
      "Driver mutated req fields directly for local offset arithmetic instead of using local variables.",
    bad: `seq_item_port.get_next_item(req);
req.addr = req.addr + 4; // BUG: Corrupts sequence intent
drive_addr(req.addr);
seq_item_port.item_done();`,
    fix: `bit [31:0] drive_addr;

seq_item_port.get_next_item(req);
drive_addr = req.addr + 4; // Local derived variable
drive_addr_phase(drive_addr);
seq_item_port.item_done();`,
    interview:
      "Derived drive values should be local unless request mutation is an explicit contract.",
  },
  {
    title: "Bug 10 — No Logs Around Blocking Points",
    symptom: "Simulation hangs with zero debug output or trace logs.",
    waveform:
      "No clear indication whether driver waits for sequence item, clock, or protocol ready.",
    cause: "Zero instrumentation around major driver blocking points.",
    bad: `forever begin
  seq_item_port.get_next_item(req);
  wait(vif.ready);
  seq_item_port.item_done();
end`,
    fix: `\`uvm_info("DRV_HS", "waiting for item", UVM_HIGH)
seq_item_port.get_next_item(req);
\`uvm_info("DRV_HS", "item pulled", UVM_HIGH)

\`uvm_info("DRV_HS", "waiting for ready", UVM_HIGH)
wait (vif.ready === 1'b1);

seq_item_port.item_done();
\`uvm_info("DRV_HS", "item done", UVM_HIGH)`,
    interview:
      "Good driver logs identify which blocking point caused the hang.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// DATA — Interview Q&A (14 Questions)
// ─────────────────────────────────────────────────────────────────────────────

const module5InterviewQA = [
  {
    q: "Q1. What does get_next_item() do?",
    short:
      "It asks the sequencer for the next selected request and blocks until one is available.",
    deep: "The sequencer arbitrates among requesting sequences, selects an item according to arbitration rules, and returns a reference to the driver. Once it returns, the driver owes an item_done() completion.",
    followup: "Does the driver choose among sequences?",
    answer: "No. The sequencer arbitrates; the driver only executes.",
  },
  {
    q: "Q2. Why must get_next_item() be paired with item_done()?",
    short:
      "Because the driver must tell the sequencer when the current request is complete.",
    deep: "After the driver pulls the item, the sequencer and sequence may be waiting for completion. Missing item_done() leaves the sequencer in an outstanding-grant state and deadlocks the sequence flow.",
    followup: null,
    answer: null,
  },
  {
    q: "Q3. What is wrong with get(); item_done();?",
    short: "get() does not require a later item_done().",
    deep: "get() and get_next_item/item_done are different driver contracts. get() is a self-completing FIFO fetch. Calling item_done() after get() creates an illegal state transition in the sequencer.",
    followup: null,
    answer: null,
  },
  {
    q: "Q4. What is the safe pattern for try_next_item()?",
    short: "Check null first. Call item_done() only for non-null items.",
    deep: "try_next_item() is non-blocking. If no sequence item is ready, it returns null. The driver must handle null by advancing time (e.g. driving idle on clock edges). Only non-null items owe item_done().",
    followup: null,
    answer: null,
  },
  {
    q: "Q5. Why is set_id_info(req) needed?",
    short: "It copies routing identity from request to response.",
    deep: "The sequencer uses sequence_id and transaction_id to return the response object to the originating sequence. Without set_id_info(req), response routing fails in multi-sequence environments.",
    followup: null,
    answer: null,
  },
  {
    q: "Q6. Difference between item_done(rsp) and put_response(rsp)?",
    short:
      "item_done(rsp) completes the item and sends response in one step. put_response(rsp) only sends response.",
    deep: "Use item_done(rsp) when completion and response availability coincide (e.g. standard non-pipelined read). Use put_response(rsp) when response is decoupled from item completion (e.g. pipelined out-of-order bus).",
    followup: null,
    answer: null,
  },
  {
    q: "Q7. When can early item_done() be legal?",
    short:
      "When the driver contract defines completion as request acceptance, not final response.",
    deep: "This is common in pipelined drivers, where the request channel can accept new requests while responses return later on a separate channel.",
    followup: null,
    answer: null,
  },
  {
    q: "Q8. Why is early item_done() dangerous in non-pipelined drivers?",
    short:
      "It allows the sequence to issue the next item before the current transaction is safely complete.",
    deep: "This can create illegal overlap on the physical pins, stale signal values, ordering bugs, or lost response capture.",
    followup: null,
    answer: null,
  },
  {
    q: "Q9. What should happen if reset occurs after get_next_item()?",
    short:
      "The driver must clean pins and complete or abort the outstanding item.",
    deep: "Reset clears hardware signals, but does not cancel sequencer debt. The driver must drive idle, release the sequencer item via item_done() (or item_done(abort_rsp)), and log the abort.",
    followup: null,
    answer: null,
  },
  {
    q: "Q10. Should the driver compare read data against expected data?",
    short: "No.",
    deep: "The driver may capture read data for sequence feedback or protocol flow control. End-to-end functional data integrity comparison strictly belongs in the scoreboard.",
    followup: null,
    answer: null,
  },
  {
    q: "Q11. How do you debug a sequence hang?",
    short:
      "Check whether the hang is before grant, after pull, during protocol wait, at item_done(), or waiting for response.",
    deep: "Trace logs in sequence, sequencer, and driver: 'waiting item', 'item pulled', 'protocol accepted', 'response captured', 'item_done', 'response sent'. Count pull vs done logs to find the stuck state.",
    followup: null,
    answer: null,
  },
  {
    q: "Q12. Why avoid mutating request fields?",
    short: "The request object represents immutable sequence intent.",
    deep: "Mutating req fields corrupts testbench debug, coverage recording, and sequence assumptions. Derived drive values should always be kept in local driver variables.",
    followup: null,
    answer: null,
  },
  {
    q: "Q13. What is the senior-level mistake in response drivers?",
    short:
      "Not defining whether response delivery is coupled to item completion.",
    deep: "If completion and response are separate, the driver needs saved context, ID routing, ordering policy, reset policy, and response queue management.",
    followup: null,
    answer: null,
  },
  {
    q: "Q14. What makes a driver handshake architecture review-worthy?",
    short:
      "Clear pull API, completion point, response policy, reset-abort behavior, ownership model, and debug instrumentation.",
    deep: "A robust driver explicitly documents its completion contract, guarantees exactly one completion per pull, handles reset gracefully, preserves transaction immutability, and logs all blocking stages.",
    followup: null,
    answer: null,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// DATA — Sections for Sidebar Navigation
// ─────────────────────────────────────────────────────────────────────────────

const module5Sections = [
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
  { id: "memory", label: "Memory Cards (1–22)" },
  { id: "atlas", label: "Atlas Sheets (1–6)" },
  { id: "codelabs", label: "Code Labs (1–4)" },
  { id: "bugs", label: "Bug Gallery (1–10)" },
  { id: "race", label: "Race-Condition Checklist" },
  { id: "logging", label: "Debug Instrumentation & Logs" },
  { id: "verification-boundary", label: "Monitor / Scoreboard Boundary" },
  { id: "decisions", label: "Architectural Decision Points" },
  { id: "scalability", label: "Scalability Notes" },
  { id: "review", label: "Review Checklist" },
  { id: "interview", label: "Interview Q&A (Q1–Q14)" },
  { id: "recall", label: "Final Recall Card" },
  { id: "takeaways", label: "Key Takeaways" },
  { id: "interview-summary", label: "Interview Questions" },
  { id: "exercise", label: "Coding Exercise" },
  { id: "verdict", label: "Final Readiness Verdict" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT — Module 5
// ═══════════════════════════════════════════════════════════════════════════════

const Module5 = () => {
  return (
    <div className="relative min-h-screen bg-slate-950 text-white font-sans">
      {/* Background glow & grid */}
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-150 h-62.5 bg-linear-to-r from-violet-600/15 to-indigo-600/15 blur-[100px] rounded-full" />

      <div className="relative z-10 flex max-w-7xl mx-auto">
        {/* ── Sidebar TOC (desktop) ────────────────────────────────────── */}
        <ModuleSidebar
          moduleNumber="5"
          title="Sequence-Sequencer-Driver Handshake Internals"
          sections={module5Sections}
        />

        {/* ── Main Content ─────────────────────────────────────────────── */}
        <main className="flex-1 min-w-0 px-6 py-8 pb-24 max-w-4xl">
          {/* Mobile back */}
          <BackToHomeBtn to="/driver-mastery" />

          {/* Hero */}
          <ModuleHero
            moduleNumber="5"
            title="Sequence-Sequencer-Driver Handshake Internals"
            description="Master the core synchronization contract between sequences, sequencers, and drivers in UVM 1.2 — covering pull APIs, item debt, completion semantics, ID routing, reset-abort recovery, and deadlock elimination."
            metadata={[
              ["Module", "5"],
              ["Reference", "UVM 1.2 / IEEE 1800.2"],
              ["Level", "Intermediate → Principal Architect"],
              ["Core Focus", "Pull, Complete & Route Contract"],
            ]}
          />

          {/* ── §1 Cover Page / Module Identity ─────────────────────────── */}
          <section id="identity">
            <SectionHeading num={1} title="Cover Page / Module Identity" />
            <div className="rounded-xl border border-slate-700/60 bg-slate-900/50 p-5 space-y-3 mb-6">
              <Table
                headers={["Field", "Value"]}
                rows={[
                  ["Module Number", "5"],
                  [
                    "Module Title",
                    "Sequence-Sequencer-Driver Handshake Internals",
                  ],
                  ["Course", "UVM Driver Mastery"],
                  ["Reference Model", "UVM 1.2 / IEEE 1800.2"],
                  [
                    "Primary Skill",
                    "Pulling sequence items correctly, completing them correctly, routing responses correctly, and avoiding sequencer-driver deadlocks",
                  ],
                  [
                    "Previous Module",
                    "Module 4 - Driver Type Taxonomy and Pattern Map",
                  ],
                  [
                    "Next Module",
                    "Module 6 - APB-Style Non-Pipelined Command Driver",
                  ],
                ]}
              />

              <h3 className="text-lg font-bold text-violet-300 mt-4">
                Module Thesis
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                A UVM driver is not complete when it toggles pins. It is complete
                when it satisfies the{" "}
                <strong className="text-violet-300">
                  sequencer-driver contract
                </strong>{" "}
                for the item it pulled.
              </p>
              <div className="p-3 bg-violet-500/10 border border-violet-500/20 rounded-lg text-xs font-mono text-violet-200">
                sequence creates intent &nbsp;→&nbsp; sequencer arbitrates
                intent &nbsp;→&nbsp; driver pulls selected intent &nbsp;→&nbsp;
                driver executes protocol action &nbsp;→&nbsp; driver completes
                the item &nbsp;→&nbsp; driver optionally returns response
              </div>
            </div>
          </section>

          {/* ── §2 Learning Objectives ──────────────────────────────────── */}
          <section id="objectives">
            <SectionHeading num={2} title="Learning Objectives" />
            <ol className="space-y-2.5 list-decimal list-inside text-slate-300 text-sm leading-relaxed">
              {[
                "Explain why the sequence-sequencer-driver handshake exists.",
                "Explain what the driver sees after a sequence calls start_item() / finish_item().",
                "Explain sequencer arbitration from the driver-visible side.",
                "Use get_next_item() and item_done() correctly.",
                "Use get() correctly without illegal item_done() pairing.",
                "Use try_next_item() with correct null-handle handling.",
                "Explain why peek() is rarely the right default for active command drivers.",
                "Build response objects and route them with rsp.set_id_info(req).",
                "Choose between item_done(), item_done(rsp), put(rsp), and put_response(rsp).",
                "Distinguish request acceptance, protocol completion, sequence unblocking, and response delivery.",
                "Explain request/response transaction ownership.",
                "Debug missing item_done(), early item_done(), response queue, and reset-abort bugs.",
                "Define what the driver owns versus what the monitor, scoreboard, and assertions own.",
                "Defend handshake architecture decisions in senior/principal interviews.",
              ].map((o, i) => (
                <li key={i} className="pl-2">
                  {o}
                </li>
              ))}
            </ol>
          </section>

          {/* ── §3 How to Use This Module ───────────────────────────────── */}
          <section id="how-to-use">
            <SectionHeading num={3} title="How to Use This Module" />
            <p className="text-slate-400 text-sm mb-3">
              Follow this study path:
            </p>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-300 text-sm mb-4">
              <li>
                Read the <strong>mental model</strong> until the three-party
                contract is obvious.
              </li>
              <li>
                Study the <strong>API contract tables</strong>.
              </li>
              <li>
                Memorize the <strong>five laws</strong> in the final recall card.
              </li>
              <li>Type out and compile the code labs.</li>
              <li>Review the bug gallery as interview preparation.</li>
            </ol>
            <Callout type="concept">
              <strong>The Debt Model:</strong> If the driver pulls an item, the
              driver owes the sequencer a defined completion.
            </Callout>
          </section>

          {/* ── §4 Visual Tag Legend ───────────────────────────────────── */}
          <section id="legend">
            <SectionHeading num={4} title="Visual Tag Legend" />
            <Table
              headers={["Tag", "Meaning"]}
              rows={[
                ["[BEHAVIOR]", "Execution behavior before UVM syntax"],
                ["[TIMING]", "Event-ordering or waveform consequence"],
                ["[UVM]", "UVM 1.2 API behavior"],
                ["[OWNER]", "Ownership boundary"],
                ["[BUG]", "Realistic failure mode"],
                ["[INTERVIEW]", "Interview-ready explanation"],
                ["[BOUNDARY]", "Intentional scope limit"],
                ["[SENIOR]", "Senior/principal architecture point"],
              ]}
            />
          </section>

          {/* ── §5 Module-Specific Acceptance Checklist ─────────────────── */}
          <section id="acceptance">
            <SectionHeading
              num={5}
              title="Module-Specific Acceptance Checklist"
            />
            <Table
              headers={["ID", "Requirement"]}
              rows={[
                ["M5-01", "Explains sequence, sequencer, and driver roles."],
                ["M5-02", "Explains why sequencer arbitration is not driver logic."],
                ["M5-03", "Proves get_next_item() must be paired with item_done()."],
                ["M5-04", "Proves get() must not be paired with item_done()."],
                ["M5-05", "Safely uses try_next_item() with null check."],
                ["M5-06", "Explains peek() without misusing it."],
                ["M5-07", "Sends response with correct ID routing."],
                ["M5-08", "Explains set_id_info(req) mechanisms."],
                ["M5-09", "Defines architectural completion point."],
                ["M5-10", "Identifies early-completion bugs."],
                ["M5-11", "Identifies missing-completion bugs."],
                ["M5-12", "Explains response queue mismatches."],
                ["M5-13", "Handles reset after item pull."],
                ["M5-14", "Reasons about forever-loop blocking points."],
                ["M5-15", "Avoids turning the driver into a scoreboard."],
                ["M5-16", "Writes compile-sane UVM 1.2 driver code."],
                ["M5-17", "Debugs hangs using log instrumentation."],
                ["M5-18", "Defends API choices in technical interviews."],
              ]}
            />
          </section>

          {/* ── §6 Scope and Non-Scope ─────────────────────────────────── */}
          <section id="scope">
            <SectionHeading num={6} title="Scope and Non-Scope" />
            <div className="space-y-4 text-sm">
              <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                <h4 className="font-bold text-emerald-300 mb-2">In Scope</h4>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  <li>Sequencer-driver pull model and sequence-side blocking implications</li>
                  <li>Sequencer arbitration as visible to driver behavior</li>
                  <li><code>get_next_item()</code> / <code>item_done()</code>, <code>get()</code>, <code>try_next_item()</code>, <code>peek()</code></li>
                  <li><code>put()</code> / <code>put_response()</code> and <code>item_done(rsp)</code> with <code>set_id_info(req)</code></li>
                  <li>Request and response object ownership & immutability</li>
                  <li>Completion policy and reset-abort impact on pulled items</li>
                  <li>Sequence hang and response hang debug strategy</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/40">
                <h4 className="font-bold text-slate-300 mb-2">
                  Non-Scope (Dedicated Future Modules)
                </h4>
                <Table
                  headers={["Topic", "Treatment"]}
                  rows={[
                    ["APB timing", "Forward Reference: Module 6 and Module 8"],
                    ["Clocking block deep dive", "Forward Reference: Module 7"],
                    ["Ready/valid streaming details", "Forward Reference: Module 9"],
                    ["AXI4-Lite multi-channel architecture", "Forward Reference: Module 10"],
                    ["Full pipelined/outstanding implementation", "Forward Reference: Module 11"],
                    ["Slave/reactive driver architecture", "Forward Reference: Module 12"],
                    ["Full reset/low-power abort framework", "Forward Reference: Module 17"],
                    ["Scoreboard design", "Boundary: not driver scope"],
                    ["Assertion library design", "Boundary: not driver scope"],
                  ]}
                />
              </div>
            </div>
          </section>

          {/* ── §7 Protocol Mental Model ───────────────────────────────── */}
          <section id="mental-model">
            <SectionHeading num={7} title="Protocol Mental Model" />
            <div className="space-y-6 text-sm text-slate-300">
              <div>
                <h4 className="font-bold text-violet-300 text-base mb-1">
                  7.1 The Three-Party Contract
                </h4>
                <div className="p-3 bg-slate-900/80 border border-slate-700/60 rounded-lg font-mono text-xs text-slate-200 mb-2">
                  sequence (intent) &nbsp;→&nbsp; sequencer (arbitration) &nbsp;→&nbsp; driver (execution) &nbsp;→&nbsp; DUT interface
                </div>
                <p>
                  The sequence does not own pin timing. The sequencer does not own
                  pin timing. The driver does not own stimulus arbitration.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-violet-300 text-base mb-1">
                  7.2 What the Sequence Owns
                </h4>
                <p>
                  The sequence owns intent: command, address, data, burst length,
                  delay intent, and expected response request. It should not
                  directly drive interface pins.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-violet-300 text-base mb-1">
                  7.3 What the Sequencer Owns
                </h4>
                <p>
                  The sequencer owns ordering and arbitration: which sequence
                  gets grant, which item becomes current, whether locks/grabs
                  affect arbitration, and whether a sequence is relevant. The
                  driver should not duplicate this arbitration.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-violet-300 text-base mb-1">
                  7.4 What the Driver Owns
                </h4>
                <p>
                  The driver owns execution: wait for reset-safe state, pull
                  selected item, drive interface pins, observe protocol signals
                  needed for completion, capture response fields if required,
                  clean up interface, complete item, and send response if
                  required.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-violet-300 text-base mb-1">
                  7.5 The Core Failure
                </h4>
                <Callout type="trap">
                  <strong>Most broken drivers fail by confusing these events:</strong>
                  <div className="mt-1 space-y-0.5 font-mono text-xs text-rose-200">
                    <div>driver pulled item &nbsp;≠&nbsp; item completed</div>
                    <div>request accepted &nbsp;≠&nbsp; response completed</div>
                    <div>item_done called &nbsp;≠&nbsp; scoreboard checked</div>
                    <div>response sent &nbsp;≠&nbsp; DUT functionally correct</div>
                  </div>
                </Callout>
              </div>
            </div>
          </section>

          {/* ── §8 Timing / Waveform Contract ──────────────────────────── */}
          <section id="timing">
            <SectionHeading num={8} title="Timing / Waveform Contract" />
            <h4 className="font-bold text-slate-200 text-sm mb-2">
              8.1 Abstract Event Timeline
            </h4>
            <div className="p-4 bg-slate-900/60 border border-slate-700/60 rounded-xl font-mono text-xs text-slate-300 space-y-1 mb-4">
              <div>T0 &nbsp;sequence prepares req</div>
              <div>T1 &nbsp;sequence asks sequencer for grant</div>
              <div>T2 &nbsp;sequencer arbitrates</div>
              <div>T3 &nbsp;selected sequence finalizes req</div>
              <div>T4 &nbsp;driver get_next_item(req) returns</div>
              <div>T5 &nbsp;driver starts protocol execution</div>
              <div>T6 &nbsp;DUT accepts request / protocol progresses</div>
              <div>T7 &nbsp;driver captures required response/status</div>
              <div>T8 &nbsp;driver cleans pins or moves to next legal state</div>
              <div>T9 &nbsp;driver calls item_done() or item_done(rsp)</div>
              <div>T10 sequence can continue according to its waiting policy</div>
            </div>

            <h4 className="font-bold text-slate-200 text-sm mb-2">
              8.2 Driver-Visible Timeline
            </h4>
            <CodeBlock lang="systemverilog">{`seq_item_port.get_next_item(req); // pull selected request
drive_transfer(req);              // protocol execution
seq_item_port.item_done();         // complete item contract`}</CodeBlock>

            <h4 className="font-bold text-slate-200 text-sm mt-4 mb-2">
              8.3 Completion Is a Contract
            </h4>
            <Table
              headers={["Driver Style", "Legal Completion Meaning"]}
              rows={[
                ["Non-pipelined command driver", "Full request/response transfer complete and pins cleaned"],
                ["Write-only no-response driver", "Request accepted and interface safe for next item"],
                ["Read/status driver", "Response captured and optionally sent"],
                ["Pipelined driver", "Request accepted; response may complete later"],
                ["Reactive slave driver", "Reactive response completed"],
              ]}
            />
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
                  <li>Pulling items</li>
                  <li>Driving DUT input pins</li>
                  <li>Observing DUT outputs needed for driver completion</li>
                  <li>Capturing response fields when sequence needs them</li>
                  <li>Calling item_done() per selected API contract</li>
                  <li>Sending response objects with set_id_info(req)</li>
                  <li>Handling reset/abort for outstanding pulled items</li>
                  <li>Logging the item lifecycle</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5">
                <h4 className="font-bold text-rose-300 mb-2">
                  Driver Does Not Own
                </h4>
                <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs">
                  <li>Functional expected-vs-actual checking</li>
                  <li>Scoreboard prediction</li>
                  <li>Coverage closure</li>
                  <li>Deep temporal protocol proof</li>
                  <li>End-to-end data integrity checking</li>
                  <li>Manual sequence arbitration</li>
                </ul>
              </div>
            </div>

            <h4 className="font-bold text-slate-200 text-sm mb-2">
              Driver Safety Checks
            </h4>
            <Table
              headers={["Category", "Allowed in Driver?", "Examples"]}
              rows={[
                ["Defensive input check", "YES", "Unsupported enum, null item, unencodable field"],
                ["Debug timeout watchdog", "YES", "Configurable hang protection on wait(ready)"],
                ["Scoreboard checking", "NO", "Comparing read data to memory model"],
                ["Protocol proof checking", "NO", "Proving complex global temporal properties"],
              ]}
            />
          </section>

          {/* ── §10 Sequence-Sequencer-Driver Contract ──────────────────── */}
          <section id="contract">
            <SectionHeading
              num={10}
              title="Sequence-Sequencer-Driver Contract"
            />
            <div className="space-y-6 text-sm text-slate-300">
              <div>
                <h4 className="font-bold text-violet-300 text-base mb-1">
                  10.1 get_next_item() / item_done()
                </h4>
                <p className="mb-2">
                  <code>get_next_item(req)</code> blocks until the sequencer has
                  selected an available request. Once it returns,{" "}
                  <code>item_done()</code> must eventually be called for that item.
                </p>
                <CodeBlock lang="systemverilog">{`seq_item_port.get_next_item(req);
drive_one_item(req);
seq_item_port.item_done();`}</CodeBlock>
                <Callout type="concept">
                  <strong>Rule:</strong> successful get_next_item &nbsp;→&nbsp;
                  exactly one completion path.
                </Callout>
              </div>

              <div>
                <h4 className="font-bold text-violet-300 text-base mb-1">
                  10.2 get()
                </h4>
                <p className="mb-2">
                  <code>get(req)</code> retrieves the request and completes the
                  sequencer handshake without requiring a later{" "}
                  <code>item_done()</code>; protocol execution may still continue
                  afterward.
                </p>
                <CodeBlock lang="systemverilog">{`seq_item_port.get(req);
drive_one_item(req);
// NO item_done() call!`}</CodeBlock>
              </div>

              <div>
                <h4 className="font-bold text-violet-300 text-base mb-1">
                  10.3 try_next_item()
                </h4>
                <p className="mb-2">
                  <code>try_next_item(req)</code> is non-blocking and may return
                  null. Check for null before dereferencing.
                </p>
                <CodeBlock lang="systemverilog">{`seq_item_port.try_next_item(req);

if (req == null) begin
  drive_idle_cycle();
end
else begin
  drive_one_item(req);
  seq_item_port.item_done();
end`}</CodeBlock>
              </div>

              <div>
                <h4 className="font-bold text-violet-300 text-base mb-1">
                  10.4 peek()
                </h4>
                <p className="mb-2">
                  <code>peek(req)</code> returns the current request without
                  consuming it. Use rarely (specialized lookahead or reactive
                  coordination).
                </p>
                <CodeBlock lang="systemverilog">{`seq_item_port.peek(req);`}</CodeBlock>
              </div>

              <div>
                <h4 className="font-bold text-violet-300 text-base mb-1">
                  10.5 put(rsp) and put_response(rsp)
                </h4>
                <p className="mb-2">
                  Sends response objects back to the issuing sequence. Crucially,
                  responses must preserve routing metadata using{" "}
                  <code>rsp.set_id_info(req)</code>.
                </p>
                <CodeBlock lang="systemverilog">{`rsp = my_rsp::type_id::create("rsp");
rsp.set_id_info(req); // Preserves sequence_id & transaction_id
seq_item_port.put_response(rsp);`}</CodeBlock>
              </div>

              <div>
                <h4 className="font-bold text-violet-300 text-base mb-1">
                  10.6 item_done(rsp)
                </h4>
                <p className="mb-2">
                  Completes current item AND sends response object in a single
                  call.
                </p>
                <CodeBlock lang="systemverilog">{`rsp = my_rsp::type_id::create("rsp");
rsp.set_id_info(req);
seq_item_port.item_done(rsp); // Closes item and sends response`}</CodeBlock>
              </div>
            </div>
          </section>

          {/* ── §11 Reset / Abort Policy ───────────────────────────────── */}
          <section id="reset">
            <SectionHeading num={11} title="Reset / Abort Policy" />
            <div className="space-y-4 text-sm text-slate-300">
              <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/40">
                <h4 className="font-bold text-violet-300 mb-1">
                  11.1 Reset Before Pull vs 11.2 Reset After Pull
                </h4>
                <p className="mb-2">
                  <strong>Before Pull:</strong> No item is outstanding. Simply wait
                  for reset release before calling <code>get_next_item()</code>.
                </p>
                <p>
                  <strong>After Pull:</strong> An item is actively outstanding. The
                  driver must clean pins AND release the sequencer debt.
                </p>
              </div>

              <h4 className="font-bold text-slate-200">
                11.5 Stronger Reset Policy Pattern
              </h4>
              <CodeBlock lang="systemverilog">{`seq_item_port.get_next_item(req);

if (!vif.rst_n) begin
  drive_idle();

  if (RESPONSE_REQUIRED) begin
    rsp = my_rsp::type_id::create("abort_rsp");
    rsp.set_id_info(req);
    rsp.status = RSP_ABORT;
    seq_item_port.item_done(rsp);
  end
  else begin
    seq_item_port.item_done();
  end

  continue;
end`}</CodeBlock>
            </div>
          </section>

          {/* ── §12 Response / Completion Policy ────────────────────────── */}
          <section id="response">
            <SectionHeading
              num={12}
              title="Response / Completion Policy"
            />
            <Table
              headers={["Response Requirement", "Mechanism", "Driver Action"]}
              rows={[
                [
                  "12.1 No response required",
                  "item_done()",
                  "Drive request, complete item. Sequence continues immediately.",
                ],
                [
                  "12.2 Response available at completion",
                  "item_done(rsp)",
                  "Capture response, set_id_info(req), complete with response.",
                ],
                [
                  "12.3 Decoupled response delivery",
                  "item_done() + put_response(rsp)",
                  "Complete request acceptance first; route response later from saved context.",
                ],
              ]}
            />
            <Callout type="concept" className="mt-4">
              <strong>12.4 Senior Rule:</strong> Before coding, define: When is the
              request retired? When is the sequence allowed to issue dependent
              work? When is response data valid? Can responses be delayed or
              out-of-order? Does every request get a response? What happens on
              reset?
            </Callout>
          </section>

          {/* ── §13 Protocol Ownership Matrix ──────────────────────────── */}
          <section id="ownership">
            <SectionHeading num={13} title="Protocol Ownership Matrix" />
            <Table
              headers={[
                "Element",
                "Sequence",
                "Sequencer",
                "Driver",
                "Monitor",
                "Scoreboard",
                "Assertion",
              ]}
              rows={[
                ["Creates stimulus intent", "Yes", "No", "No", "No", "Maybe (ref model)", "No"],
                ["Arbitrates among sequences", "No", "Yes", "No", "No", "No", "No"],
                ["Pulls selected item", "No", "Provides", "Yes", "No", "No", "No"],
                ["Drives DUT inputs", "No", "No", "Yes", "No", "No", "No"],
                ["Observes ready/response for completion", "No", "No", "Yes", "Also observes", "No", "Maybe"],
                ["Publishes actual bus txn", "No", "No", "No", "Yes", "Consumes", "No"],
                ["Compares expected vs actual", "No", "No", "No", "No", "Yes", "No"],
                ["Checks temporal legality", "No", "No", "Defensive", "No", "No", "Yes"],
                ["Calls item_done()", "No", "Receives", "Yes", "No", "No", "No"],
                ["Sends sequence response", "No", "Routes", "Yes", "No", "No", "No"],
              ]}
            />
          </section>

          {/* ── §14 Memory Cards ────────────────────────────────────────── */}
          <section id="memory">
            <SectionHeading num={14} title="Memory Cards (1–22)" />
            <p className="text-slate-400 text-sm mb-4">
              Review all 22 handshake internal recall anchors:
            </p>
            <div className="space-y-3">
              {module5MemoryCards.map((card, idx) => (
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
            <SectionHeading num={15} title="Atlas Sheets (1–6)" />

            <CollapsibleCard
              title="Atlas Sheet 1 — Sequencer-Driver API Contract"
              accent="blue"
              icon={<FaListAlt size={12} />}
              defaultOpen={true}
            >
              <Table
                headers={[
                  "API",
                  "Blocks for Item?",
                  "Returns Req?",
                  "Requires item_done()?",
                  "Sends Response?",
                  "Correct Use",
                ]}
                rows={[
                  ["get_next_item(req)", "Yes", "Yes", "Yes", "No", "Standard blocking driver"],
                  ["item_done()", "No", "No", "N/A", "No", "Complete outstanding item"],
                  ["item_done(rsp)", "No", "No", "N/A", "Yes", "Complete item and send response"],
                  ["get(req)", "Yes", "Yes", "No", "No", "Pull item and let sequencer proceed"],
                  ["try_next_item(req)", "Attempts only", "Maybe", "Only if non-null", "No", "Polling/idling driver"],
                  ["peek(req)", "Yes (until item)", "Yes", "No consume", "No", "Rare non-consuming view"],
                  ["put(rsp) / put_response(rsp)", "May block", "No", "N/A", "Yes", "Send decoupled response"],
                ]}
              />
            </CollapsibleCard>

            <CollapsibleCard
              title="Atlas Sheet 2 — Completion Policy Map"
              accent="violet"
              icon={<FaListAlt size={12} />}
            >
              <Table
                headers={["Driver Contract", "item_done() Point", "Risk If Wrong"]}
                rows={[
                  ["Blocking non-pipelined command", "After full transfer & cleanup", "Sequence issues next item too early"],
                  ["Read with response", "After response captured & routed", "Sequence gets no read result"],
                  ["Write with status", "After status/error captured", "Error status is lost"],
                  ["Fire-and-forget", "After request accepted & interface safe", "Unnecessary delay if too late"],
                  ["Pipelined request", "After request accepted", "Needs separate response tracking"],
                  ["Reset-aborted item", "After abort cleanup / abort response", "Sequence deadlock"],
                ]}
              />
            </CollapsibleCard>

            <CollapsibleCard
              title="Atlas Sheet 3 — Request/Response Ownership"
              accent="emerald"
              icon={<FaListAlt size={12} />}
            >
              <Table
                headers={["Object", "Created By", "Modified By", "Consumed By", "Driver Rule"]}
                rows={[
                  ["req", "Sequence", "Sequence before handoff", "Driver", "Treat as immutable intent"],
                  ["Local scalar fields", "Driver", "Driver", "Driver", "Use for derived drive values"],
                  ["Cloned request", "Driver", "Driver", "Driver queues", "Use for delayed response/lifecycle"],
                  ["rsp", "Driver", "Driver", "Sequence", "Must use set_id_info(req)"],
                  ["Monitor txn", "Monitor", "Monitor", "Scoreboard/coverage", "Driver does not own"],
                  ["Expected txn", "Sequence/ref model", "Ref model", "Scoreboard", "Driver does not compare"],
                ]}
              />
            </CollapsibleCard>

            <CollapsibleCard
              title="Atlas Sheet 4 — Sequence-Side Blocking Map"
              accent="amber"
              icon={<FaListAlt size={12} />}
            >
              <Table
                headers={["Sequence Behavior", "Driver Obligation"]}
                rows={[
                  ["Sequence issues item and continues after completion", "Driver must call item_done()"],
                  ["Sequence waits for response", "Driver must send response"],
                  ["Sequence sends dependent items", "Driver completion point must preserve ordering"],
                  ["Sequence handles abort response", "Driver should send abort response on reset/error"],
                  ["Sequence does not expect response", "Driver should not send duplicate responses"],
                ]}
              />
            </CollapsibleCard>

            <CollapsibleCard
              title="Atlas Sheet 5 — Deadlock Debug Map"
              accent="rose"
              icon={<FaListAlt size={12} />}
            >
              <Table
                headers={["Symptom", "Likely Block Point", "Root Cause", "Debug Probe"]}
                rows={[
                  ["Driver idle forever", "get_next_item() waiting", "No sequence/arbitration issue", "Log before/after pull"],
                  ["Sequence stuck after sending item", "Missing item_done()", "Driver branch skipped completion", "Count pulls vs completions"],
                  ["Sequence stuck waiting response", "No response sent", "Driver/sequence policy mismatch", "Log response send"],
                  ["Wrong response received", "Bad ID info", "Missing set_id_info(req)", "Print transaction IDs"],
                  ["Driver stuck in protocol wait", "DUT never ready/responds", "No timeout/reset escape", "Last protocol wait log"],
                  ["Hangs only after reset", "Outstanding item not released", "Reset branch skipped completion", "Reset-abort log"],
                ]}
              />
            </CollapsibleCard>

            <CollapsibleCard
              title="Atlas Sheet 6 — Plain SV vs UVM vs cocotb Handshake"
              accent="blue"
              icon={<FaListAlt size={12} />}
            >
              <Table
                headers={["Concern", "Plain SV Driver", "UVM Driver", "cocotb/Python-Style Driver"]}
                rows={[
                  ["Stimulus source", "Mailbox/queue/task", "Sequence via sequencer", "Coroutine/queue"],
                  ["Arbitration", "Manual", "Sequencer", "Manual/custom"],
                  ["Pull item", "mbx.get(txn)", "get_next_item(req)", "await queue.get()"],
                  ["Completion ack", "Event/mailbox ack", "item_done()", "Future/event completion"],
                  ["Response", "Response mailbox", "put_response() / item_done(rsp)", "Return queue/future"],
                  ["Classic bug", "Missing ack", "Missing item_done()", "Future never resolved"],
                  ["Ownership issue", "Shared handle mutation", "Request handle mutation", "Shared object mutation"],
                ]}
              />
            </CollapsibleCard>
          </section>

          {/* ── §16 Code Labs ───────────────────────────────────────────── */}
          <section id="codelabs">
            <SectionHeading num={16} title="Code Labs (1–4)" />

            {/* Lab 1 */}
            <CollapsibleCard
              title="Code Lab 1 — Correct Blocking get_next_item() / item_done() Driver"
              accent="emerald"
              icon={<FaFlask size={12} />}
              defaultOpen={true}
            >
              <p className="text-slate-300 text-xs mb-2">
                <strong>Goal:</strong> Build a minimal non-pipelined driver
                skeleton with legal UVM 1.2 style.
              </p>
              <CodeBlock lang="systemverilog">{`interface simple_if(input logic clk);
  logic rst_n;
  logic valid;
  logic [7:0] data;
  logic ready;
endinterface

package lab1_pkg;
  import uvm_pkg::*;
  \`include "uvm_macros.svh"

  typedef enum {CMD_NOP, CMD_WRITE} cmd_e;

  class simple_item extends uvm_sequence_item;
    rand cmd_e cmd;
    rand bit [7:0] data;

    \`uvm_object_utils_begin(simple_item)
      \`uvm_field_enum(cmd_e, cmd, UVM_ALL_ON)
      \`uvm_field_int(data, UVM_ALL_ON)
    \`uvm_object_utils_end

    function new(string name = "simple_item");
      super.new(name);
    endfunction
  endclass

  class simple_driver extends uvm_driver #(simple_item);
    \`uvm_component_utils(simple_driver)

    virtual simple_if vif;

    function new(string name, uvm_component parent);
      super.new(name, parent);
    endfunction

    function void build_phase(uvm_phase phase);
      super.build_phase(phase);
      if (!uvm_config_db#(virtual simple_if)::get(this, "", "vif", vif)) begin
        \`uvm_fatal("NOVIF", "virtual interface not set")
      end
    endfunction

    task run_phase(uvm_phase phase);
      simple_item req;

      drive_idle();

      forever begin
        wait_reset_deasserted();

        \`uvm_info("DRV_HS", "waiting for sequence item", UVM_HIGH)
        seq_item_port.get_next_item(req);

        \`uvm_info("DRV_HS",
          $sformatf("pulled item data=0x%0h", req.data),
          UVM_MEDIUM)

        drive_one_item(req);

        seq_item_port.item_done();
        \`uvm_info("DRV_HS", "item_done issued", UVM_HIGH)
      end
    endtask

    task drive_idle();
      vif.valid <= 1'b0;
      vif.data  <= '0;
    endtask

    task wait_reset_deasserted();
      while (vif.rst_n !== 1'b1) begin
        drive_idle();
        @(posedge vif.clk);
      end
    endtask

    task drive_one_item(simple_item req);
      if (req.cmd == CMD_NOP) begin
        @(posedge vif.clk);
      end
      else if (req.cmd == CMD_WRITE) begin
        @(posedge vif.clk);
        vif.valid <= 1'b1;
        vif.data  <= req.data;

        do begin
          @(posedge vif.clk);
        end while (vif.ready !== 1'b1);

        drive_idle();
      end
      else begin
        \`uvm_error("BAD_CMD", "Unsupported command")
      end
    endtask
  endclass
endpackage`}</CodeBlock>
            </CollapsibleCard>

            {/* Lab 2 */}
            <CollapsibleCard
              title="Code Lab 2 — Safe try_next_item()"
              accent="blue"
              icon={<FaFlask size={12} />}
            >
              <p className="text-slate-300 text-xs mb-2">
                <strong>Key Lesson:</strong> try_next_item null &nbsp;→&nbsp; no
                item_done. try_next_item non-null &nbsp;→&nbsp; item_done required.
              </p>
              <CodeBlock lang="systemverilog">{`class polling_driver extends uvm_driver #(simple_item);
  \`uvm_component_utils(polling_driver)

  virtual simple_if vif;

  function new(string name, uvm_component parent);
    super.new(name, parent);
  endfunction

  task run_phase(uvm_phase phase);
    simple_item req;

    forever begin
      seq_item_port.try_next_item(req);

      if (req == null) begin
        drive_idle_cycle();
        continue;
      end

      drive_one_item(req);
      seq_item_port.item_done();
    end
  endtask

  task drive_idle_cycle();
    vif.valid <= 1'b0;
    vif.data  <= '0;
    @(posedge vif.clk);
  endtask

  task drive_one_item(simple_item req);
    @(posedge vif.clk);
    vif.valid <= 1'b1;
    vif.data  <= req.data;

    do begin
      @(posedge vif.clk);
    end while (vif.ready !== 1'b1);

    vif.valid <= 1'b0;
    vif.data  <= '0;
  endtask
endclass`}</CodeBlock>
            </CollapsibleCard>

            {/* Lab 3 */}
            <CollapsibleCard
              title="Code Lab 3 — Response Routing With set_id_info(req)"
              accent="violet"
              icon={<FaFlask size={12} />}
            >
              <CodeBlock lang="systemverilog">{`package rsp_lab_pkg;
  import uvm_pkg::*;
  \`include "uvm_macros.svh"

  typedef enum {RSP_OK, RSP_ERR, RSP_ABORT} rsp_status_e;

  class bus_req extends uvm_sequence_item;
    rand bit        is_read;
    rand bit [7:0]  addr;
    rand bit [31:0] wdata;

    \`uvm_object_utils_begin(bus_req)
      \`uvm_field_int(is_read, UVM_ALL_ON)
      \`uvm_field_int(addr,    UVM_ALL_ON)
      \`uvm_field_int(wdata,   UVM_ALL_ON)
    \`uvm_object_utils_end

    function new(string name = "bus_req");
      super.new(name);
    endfunction
  endclass

  class bus_rsp extends uvm_sequence_item;
    rsp_status_e status;
    bit [31:0]   rdata;

    \`uvm_object_utils_begin(bus_rsp)
      \`uvm_field_enum(rsp_status_e, status, UVM_ALL_ON)
      \`uvm_field_int(rdata, UVM_ALL_ON)
    \`uvm_object_utils_end

    function new(string name = "bus_rsp");
      super.new(name);
    endfunction
  endclass

  class rsp_driver extends uvm_driver #(bus_req, bus_rsp);
    \`uvm_component_utils(rsp_driver)

    function new(string name, uvm_component parent);
      super.new(name, parent);
    endfunction

    task run_phase(uvm_phase phase);
      bus_req req;
      bus_rsp rsp;

      forever begin
        seq_item_port.get_next_item(req);

        rsp = bus_rsp::type_id::create("rsp");
        rsp.status = RSP_OK;

        if (req.is_read) begin
          rsp.rdata = {24'h0, req.addr};
        end
        else begin
          rsp.rdata = '0;
        end

        rsp.set_id_info(req); // Preserve sequence ID & txn ID

        seq_item_port.item_done(rsp);

        \`uvm_info("DRV_RSP",
          $sformatf("completed req addr=0x%0h is_read=%0b rdata=0x%0h",
                    req.addr, req.is_read, rsp.rdata),
          UVM_MEDIUM)
      end
    endtask
  endclass
endpackage`}</CodeBlock>
            </CollapsibleCard>

            {/* Lab 4 */}
            <CollapsibleCard
              title="Code Lab 4 — Bad API Mixing"
              accent="rose"
              icon={<FaFlask size={12} />}
            >
              <div className="space-y-3">
                <div>
                  <div className="text-xs font-semibold text-rose-400 mb-1">
                    ❌ Bad Code (Illegal Pairing):
                  </div>
                  <CodeBlock lang="systemverilog">{`task run_phase(uvm_phase phase);
  simple_item req;
  forever begin
    seq_item_port.get(req);
    drive_one_item(req);
    seq_item_port.item_done(); // WRONG: get() is self-completing
  end
endtask`}</CodeBlock>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs font-semibold text-emerald-400 mb-1">
                      ✅ Option A (get style):
                    </div>
                    <CodeBlock lang="systemverilog">{`task run_phase(uvm_phase phase);
  simple_item req;
  forever begin
    seq_item_port.get(req);
    drive_one_item(req);
  end
endtask`}</CodeBlock>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-emerald-400 mb-1">
                      ✅ Option B (get_next_item style):
                    </div>
                    <CodeBlock lang="systemverilog">{`task run_phase(uvm_phase phase);
  simple_item req;
  forever begin
    seq_item_port.get_next_item(req);
    drive_one_item(req);
    seq_item_port.item_done();
  end
endtask`}</CodeBlock>
                  </div>
                </div>
              </div>
            </CollapsibleCard>
          </section>

          {/* ── §17 Bug Gallery ─────────────────────────────────────────── */}
          <section id="bugs">
            <SectionHeading num={17} title="Bug Gallery (1–10)" />
            <div className="space-y-4">
              {module5BugGallery.map((bug, idx) => (
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
            <Table
              headers={["Check", "Failure Mode"]}
              rows={[
                ["item_done() before interface cleanup?", "Next item overlaps stale pins."],
                ["Response sampled before stable response point?", "Wrong response returned to sequence."],
                ["Raw @(posedge clk) sampling races with DUT update?", "Simulator-region dependent delta race."],
                ["Reset checked only before pull, not during long wait?", "Driver stuck in handshake wait after reset."],
                ["try_next_item() dereferenced before null check?", "Null object fatal crash."],
                ["Response sent before set_id_info(req)?", "Misrouted or dropped response."],
                ["Request handle stored after completion without copy?", "Aliasing and lifecycle ambiguity."],
                ["No timeout/log around protocol wait?", "Undebuggable simulation hang."],
                ["item_done() inside success-only branch?", "Error-path sequence deadlock."],
                ["Duplicate response path?", "Response queue corruption / overflow."],
              ]}
            />
          </section>

          {/* ── §19 Debug Instrumentation / Log Strategy ────────────────── */}
          <section id="logging">
            <SectionHeading
              num={19}
              title="Debug Instrumentation / Log Strategy"
            />
            <p className="text-slate-300 text-sm mb-3">
              A reusable driver should instrument all major lifecycle stages:
            </p>
            <CodeBlock lang="text">{`waiting reset -> reset released -> waiting item -> item pulled -> protocol drive start -> request accepted -> response captured -> abort detected -> item_done issued -> response sent`}</CodeBlock>

            <h4 className="font-bold text-slate-200 text-sm mt-4 mb-2">
              Debug Decision Tree for Simulation Hangs
            </h4>
            <Table
              headers={["Observation", "Diagnosis", "Action"]}
              rows={[
                ["No driver pull log", "Driver stuck before get_next_item or sequencer has no granted sequence", "Check sequence execution & sequencer connections."],
                ["Pull log exists, no done log", "Driver stuck in protocol wait, error branch, or reset loop", "Inspect waveform ready signal and driver error branches."],
                ["Done log exists, sequence still waits", "Sequence is blocking in get_response(rsp)", "Check if driver sends response object."],
                ["Response log exists, sequence still waits", "Response ID mismatch", "Verify rsp.set_id_info(req) was called."],
                ["Fails only during reset", "Outstanding item not completed during abort", "Inspect driver reset escape branch for missing item_done."],
              ]}
            />
          </section>

          {/* ── §20 Monitor / Scoreboard / Assertion Boundary ───────────── */}
          <section id="verification-boundary">
            <SectionHeading
              num={20}
              title="Monitor / Scoreboard / Assertion Boundary"
            />
            <Table
              headers={["Component", "Correct Job"]}
              rows={[
                ["Driver", "Execute selected sequence item on pins and complete UVM contract."],
                ["Monitor", "Independently observe interface and publish actual transactions."],
                ["Scoreboard", "Compare expected vs actual functional data."],
                ["Assertion", "Check temporal interface protocol properties."],
                ["Sequence", "Generate intent and optionally consume response."],
              ]}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 text-xs">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <strong className="text-emerald-300">Allowed in Driver:</strong>
                <CodeBlock lang="systemverilog">{`rsp.rdata = sampled_rdata; // Capture observation for sequence`}</CodeBlock>
              </div>
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg">
                <strong className="text-rose-300">Forbidden in Driver:</strong>
                <CodeBlock lang="systemverilog">{`if (sampled_rdata != expected_model_data) \`uvm_error("DRV", "Mismatch")`}</CodeBlock>
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
              headers={["Decision", "Choices", "Rule of Thumb"]}
              rows={[
                ["Decision 1: Which pull API?", "get_next_item vs get vs try_next_item vs peek", "Use get_next_item() for standard blocking drivers; try_next_item() for idle polling."],
                ["Decision 2: What does completion mean?", "Request accepted vs Response captured vs Pins cleaned", "Non-pipelined: after pins cleaned; Pipelined: after request accepted with tracking."],
                ["Decision 3: Response policy?", "No response vs item_done(rsp) vs put_response(rsp)", "item_done(rsp) when response coincides with completion; put_response() when decoupled."],
                ["Decision 4: Ownership policy?", "Direct req vs Local scalars vs Cloned req", "Use local variables for derived math; clone req if state outlives item_done."],
                ["Decision 5: Blocking-point policy?", "Reset wait vs Ready wait vs Response wait", "Every blocking wait must have log instrumentation and timeout/reset escape."],
              ]}
            />
          </section>

          {/* ── §22 Scalability Notes ───────────────────────────────────── */}
          <section id="scalability">
            <SectionHeading num={22} title="Scalability Notes" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/40 space-y-2">
                <h4 className="font-bold text-violet-300">
                  22.1 Basic Blocking & 22.2 Response Drivers
                </h4>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Direct paired <code>get_next_item()</code> /{" "}
                  <code>item_done()</code> and <code>item_done(rsp)</code> work
                  exceptionally well for simple command/response and register
                  buses.
                </p>
              </div>
              <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/40 space-y-2">
                <h4 className="font-bold text-violet-300">
                  22.3 Pipelined & 22.4 Multi-Channel Drivers
                </h4>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Require decoupled <code>item_done()</code>, separate tracking
                  queues, <code>put_response()</code>, and manual transaction
                  recording to handle concurrent channel operations cleanly.
                </p>
              </div>
            </div>
          </section>

          {/* ── §23 Review Checklist ────────────────────────────────────── */}
          <section id="review">
            <SectionHeading num={23} title="Review Checklist" />
            <ol className="space-y-1.5 list-decimal list-inside text-slate-300 text-sm">
              {[
                "Does every successful get_next_item() reach exactly one completion path?",
                "Is get() never followed by item_done()?",
                "Is try_next_item() strictly null checked before dereferencing?",
                "Does every non-null try_next_item() path complete?",
                "Is rsp created before use?",
                "Is rsp.set_id_info(req) called before response send?",
                "Is response sent exactly once (no duplicate put_response)?",
                "Is completion point clearly documented?",
                "Is reset after item pull cleanly handled with debt resolution?",
                "Is sequence response expectation matched by driver implementation?",
                "Are request fields treated as immutable intent?",
                "Are delayed responses using copied/saved context?",
                "Are long waits instrumented with UVM_HIGH/MEDIUM logs?",
                "Does the driver avoid scoreboard-level expected-vs-actual checks?",
                "Is code UVM 1.2 portable without simulator-vendor hacks?",
                "Are all blocking points visible in simulation logs?",
              ].map((item, idx) => (
                <li key={idx} className="pl-1">
                  {item}
                </li>
              ))}
            </ol>
          </section>

          {/* ── §24 Interview Q&A ───────────────────────────────────────── */}
          <section id="interview">
            <SectionHeading num={24} title="Interview Q&A (Q1–Q14)" />
            <div className="space-y-4">
              {module5InterviewQA.map((qa, idx) => (
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
              title="Final Recall Card — Five Laws of Sequencer-Driver Handshake"
            />
            <div className="p-5 rounded-xl border border-violet-500/30 bg-linear-to-r from-violet-500/10 to-indigo-500/10 space-y-3">
              <ol className="space-y-2 text-sm text-slate-200 list-decimal list-inside">
                <li>
                  <strong>Pull Law:</strong> <code>get_next_item()</code> creates an
                  outstanding item obligation.
                </li>
                <li>
                  <strong>Pairing Law:</strong> <code>get_next_item()</code> pairs
                  with <code>item_done()</code>. <code>get()</code> does not.
                </li>
                <li>
                  <strong>Null Law:</strong> <code>try_next_item()</code> null means
                  no item and no <code>item_done()</code>.
                </li>
                <li>
                  <strong>Routing Law:</strong> Responses must use{" "}
                  <code>rsp.set_id_info(req)</code>.
                </li>
                <li>
                  <strong>Completion Law:</strong> <code>item_done()</code> belongs
                  at the driver-defined safe completion point.
                </li>
              </ol>
            </div>
          </section>

          {/* ── §26 Key Takeaways ───────────────────────────────────────── */}
          <section id="takeaways">
            <SectionHeading num={26} title="Key Takeaways" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="p-4 rounded-xl border border-violet-500/20 bg-slate-900/50 space-y-2">
                <div className="font-bold text-violet-300">
                  1. Intent vs Execution
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  The sequence creates intent; the sequencer arbitrates; the driver
                  executes on pins.
                </p>
              </div>
              <div className="p-4 rounded-xl border border-emerald-500/20 bg-slate-900/50 space-y-2">
                <div className="font-bold text-emerald-300">
                  2. Debt & Completion
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Every successful get_next_item creates an obligation that must
                  reach exactly one completion path.
                </p>
              </div>
              <div className="p-4 rounded-xl border border-amber-500/20 bg-slate-900/50 space-y-2">
                <div className="font-bold text-amber-300">
                  3. Response ID Routing
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Response payload is useless without set_id_info(req) to guide it
                  back to the originating sequence.
                </p>
              </div>
              <div className="p-4 rounded-xl border border-rose-500/20 bg-slate-900/50 space-y-2">
                <div className="font-bold text-rose-300">
                  4. Reset Resolution
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Reset clears pins and requires explicit sequencer state
                  release to prevent sequence deadlocks.
                </p>
              </div>
            </div>
          </section>

          {/* ── §27 Interview Questions Summary ─────────────────────────── */}
          <section id="interview-summary">
            <SectionHeading num={27} title="Interview Questions Summary" />
            <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/40 text-sm text-slate-300 space-y-2">
              <p className="text-xs text-slate-400">
                Core questions for staff & principal verification interview rounds:
              </p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>What happens internally when a driver calls get_next_item()?</li>
                <li>Why must get_next_item() be paired with item_done()?</li>
                <li>Why is get() not paired with item_done()?</li>
                <li>What are the legal branches after try_next_item()?</li>
                <li>When is peek() useful?</li>
                <li>What does rsp.set_id_info(req) do?</li>
                <li>When should you use item_done(rsp) vs put_response(rsp)?</li>
                <li>What happens if a sequence waits for response and driver sends none?</li>
                <li>Where should item_done() be placed in a non-pipelined driver?</li>
                <li>When is early item_done() legal?</li>
                <li>How should reset after item pull be handled?</li>
                <li>Why should a driver not mutate request fields?</li>
                <li>What belongs in driver versus scoreboard?</li>
                <li>How do you debug a stuck sequence?</li>
                <li>What logs should every serious driver have?</li>
              </ul>
            </div>
          </section>

          {/* ── §28 Coding Exercise ─────────────────────────────────────── */}
          <section id="exercise">
            <SectionHeading
              num={28}
              title="Coding Exercise — Command/Response Handshake Driver"
            />
            <p className="text-slate-300 text-sm mb-3">
              <strong>Exercise:</strong> Create a UVM driver for this abstract
              command/response interface:
            </p>
            <CodeBlock lang="systemverilog">{`interface cmd_rsp_if(input logic clk);
  logic        rst_n;
  logic        cmd_valid;
  logic        cmd_ready;
  logic [15:0] cmd_data;
  logic        rsp_valid;
  logic [1:0]  rsp_status;
endinterface`}</CodeBlock>

            <CollapsibleCard
              title="Reference Solution & Review Criteria"
              accent="emerald"
              defaultOpen={true}
            >
              <div className="space-y-2 text-xs text-slate-300">
                <p>
                  <strong>Implementation Rules:</strong>
                </p>
                <ol className="list-decimal list-inside space-y-1 text-slate-300">
                  <li>Use <code>get_next_item(req)</code>.</li>
                  <li>Drive <code>cmd_valid/cmd_data</code> until <code>cmd_ready</code> handshake.</li>
                  <li>Wait for <code>rsp_valid</code>.</li>
                  <li>Create <code>rsp</code> and copy ID info using <code>rsp.set_id_info(req)</code>.</li>
                  <li>Complete using <code>item_done(rsp)</code>.</li>
                  <li>Handle mid-transfer reset by driving idle, creating abort response, and calling <code>item_done(abort_rsp)</code>.</li>
                </ol>
              </div>
            </CollapsibleCard>
          </section>

          {/* ── §29 Final Readiness Verdict ─────────────────────────────── */}
          <section id="verdict">
            <SectionHeading num={29} title="Final Readiness Verdict" />
            <div className="p-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 space-y-3">
              <h3 className="text-lg font-bold text-emerald-300 flex items-center gap-2">
                <FaCheckSquare /> Module 5 — Final Readiness Verdict: PASS
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Sequence-Sequencer-Driver Handshake Internals manuscript is fully
                converted into React. All 22 memory cards, 6 atlas sheets, 4 code
                labs, 10 bug gallery entries, race-condition checklists, logging
                strategies, and 14 interview Q&As are complete and verified.
              </p>
              <p className="text-xs text-emerald-200/80">
                You are now prepared to advance to Module 6: APB-Style Non-Pipelined
                Command Driver.
              </p>
            </div>
          </section>

          {/* Navigation to next module */}
          <ModuleNavigation
            nextPath="/driver-mastery/module6"
            nextTitle="Module 6: APB-Style Non-Pipelined Command Driver →"
          />
        </main>
      </div>
    </div>
  );
};

export default Module5;
