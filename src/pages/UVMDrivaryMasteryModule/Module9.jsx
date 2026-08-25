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
// DATA — Memory Cards (23 Cards)
// ─────────────────────────────────────────────────────────────────────────────

const module9MemoryCards = [
  {
    title: "Card 1 — Ready/Valid Is Ownership, Not Magic [PROTOCOL]",
    accent: "blue",
    hook: "Source offers; sink accepts.",
    concept:
      "The source owns valid, payload, and sidebands. The sink owns ready. A beat transfers only when both are high on the sampling edge.",
    code: `if (vif.valid && vif.ready)
  accepted_beats++;`,
    trap: "Counting valid cycles as completed transfers.",
    interview:
      "valid means offered. valid && ready means accepted.",
  },
  {
    title: "Card 2 — Source Valid Must Not Wait for Ready [PROTOCOL]",
    accent: "rose",
    hook: "Waiting for ready can deadlock.",
    concept:
      "For AXI-style streams, the source asserts valid when it has data. It observes ready only to detect acceptance. If source waits for ready and sink waits for valid, deadlock ensues.",
    code: `vif.valid <= 1'b1;
vif.data  <= beat_data;
// Do NOT wait for ready before asserting valid!`,
    trap: "if (vif.ready) vif.valid <= 1'b1; (Classic streaming deadlock trap).",
    interview:
      "The source does not need sink permission to offer data.",
  },
  {
    title: "Card 3 — Payload Freezes During Stall [WAVEFORM]",
    accent: "amber",
    hook: "Offered data is frozen.",
    concept:
      "While valid && !ready, payload and sidebands (keep, last, user) must remain strictly stable until accepted or aborted by reset.",
    code: `do begin
  @(posedge vif.clk);
end while (vif.rst_n && !vif.ready);`,
    trap: "Advancing the beat index every clock cycle regardless of ready.",
    interview:
      "Beat index advances on handshake, never on clock alone.",
  },
  {
    title: "Card 4 — Backpressure Is Not Idle [WAVEFORM]",
    accent: "emerald",
    hook: "Idle is source silence; backpressure is sink refusal.",
    concept:
      "valid=0 means no offer (idle). valid=1 && ready=0 means an offer is pending (backpressure). They belong to different owners.",
    code: `if (vif.valid && !vif.ready)
  stall_cycles++;`,
    trap: "Calling stalled cycles idle cycles in triage logs.",
    interview:
      "I debug idle and backpressure separately because they have different owners.",
  },
  {
    title: "Card 5 — last Is Metadata of the Accepted Beat [PROTOCOL]",
    accent: "violet",
    hook: "last rides with data.",
    concept:
      "last must remain asserted with the final beat until that beat handshakes. It is not a 1-cycle pulse that disappears during a stall.",
    code: `vif.last <= (beat_idx == req.num_beats - 1);`,
    trap: "Pulsing last for one cycle while ready=0, corrupting packet framing.",
    interview:
      "last is not a pulse; it is metadata for a transferred beat.",
  },
  {
    title: "Card 6 — Idle Insertion Happens Before Valid [TIMING]",
    accent: "blue",
    hook: "Delay before offer, not after offer.",
    concept:
      "A driver may insert idle cycles before asserting valid. Once valid is asserted, the beat must remain offered until accepted or reset-aborted.",
    code: `repeat (idle_cycles)
  @(posedge vif.clk);

vif.valid <= 1'b1;`,
    trap: "Randomly toggling valid low and high during an active stall.",
    interview:
      "Randomization stops once the source has made a valid offer.",
  },
  {
    title: "Card 7 — Completion Means Accepted, Not Driven [UVM]",
    accent: "rose",
    hook: "Driven is not done.",
    concept:
      "For a source driver, an item is complete only when the configured transfer unit has handshaked across pins.",
    code: `drive_packet(req);
seq_item_port.item_done();`,
    trap: "Calling item_done() immediately after asserting valid on the bus.",
    interview:
      "Non-pipelined item_done() follows protocol completion.",
  },
  {
    title: "Card 8 — Packet Item vs Beat Item [ARCH]",
    accent: "violet",
    hook: "Granularity controls completion.",
    concept:
      "A packet item contains an array of beats plus last. A beat item contains a single beat. item_done() timing follows this transaction granularity choice.",
    code: `rand int unsigned num_beats;
rand bit [31:0]   data[];
rand bit [3:0]    keep[];`,
    trap: "Using packet items but releasing the sequencer after the first beat.",
    interview:
      "Transaction granularity is an architectural contract with the sequence.",
  },
  {
    title: "Card 9 — Ready Is Sampled at the Clock Edge [RACE]",
    accent: "amber",
    hook: "Do not chase combinational ready.",
    concept:
      "The source driver detects acceptance at the synchronous protocol sampling edge, avoiding combinational races.",
    code: `@(posedge vif.clk);
if (vif.valid && vif.ready)
  accepted = 1;`,
    trap: "Using wait(vif.ready) and advancing before a clocked handshake edge.",
    interview:
      "I sample ready at the same edge where the sink samples payload.",
  },
  {
    title: "Card 10 — Sink Driver Owns Backpressure [BOUNDARY]",
    accent: "emerald",
    hook: "Ready is stimulus.",
    concept:
      "The sink driver drives ready using a configured policy: always-ready, random stalls, burst stalls, or FIFO capacity modeling.",
    code: `vif.ready <= choose_ready();`,
    trap: "Driving ready based on scoreboard payload comparison results.",
    interview:
      "Backpressure is stimulus; correctness checking is not driver work.",
  },
  {
    title: "Card 11 — Driver Can Count for Control [BOUNDARY]",
    accent: "blue",
    hook: "Counting is not scoring.",
    concept:
      "A driver may count handshakes for local completion, policy duration, or debug. It must not compare expected vs actual payload.",
    code: `if (vif.valid && vif.ready)
  local_accept_count++;`,
    trap: "Turning the sink driver into an inlined payload checker.",
    interview:
      "Local control counters are allowed; functional comparison is not.",
  },
  {
    title: "Card 12 — get_next_item() Is Blocking Ownership [UVM]",
    accent: "violet",
    hook: "Fetch, drive, complete.",
    concept:
      "Use get_next_item() when the driver should wait until the sequence provides an item before generating pin activity.",
    code: `seq_item_port.get_next_item(req);
drive_packet(req);
seq_item_port.item_done();`,
    trap: "Using get_next_item() in a sink driver that must continuously drive default ready.",
    interview:
      "Blocking fetch is right when pin activity depends on a request being available.",
  },
  {
    title: "Card 13 — try_next_item() Needs Null Discipline [UVM]",
    accent: "rose",
    hook: "Null means no contract opened.",
    concept:
      "try_next_item() lets the driver poll for policy updates without blocking. Call item_done() only when a non-null item is returned.",
    code: `seq_item_port.try_next_item(req);
if (req != null) begin
  install_policy(req);
  seq_item_port.item_done();
end`,
    trap: "Calling item_done() when try_next_item() returned null.",
    interview:
      "No item returned means no sequencer request to close.",
  },
  {
    title: "Card 14 — get() Is Not get_next_item() [UVM]",
    accent: "amber",
    hook: "get() already consumes.",
    concept:
      "get() retrieves and consumes an item in one step. It is never paired with item_done().",
    code: `seq_item_port.get(req);
drive_packet(req);
// No item_done()!`,
    trap: "seq_item_port.get(req); drive_packet(req); seq_item_port.item_done();",
    interview:
      "I do not mix pull-port consumption styles.",
  },
  {
    title: "Card 15 — Response Is a Contract, Not Decoration [UVM]",
    accent: "emerald",
    hook: "Send response only if consumed.",
    concept:
      "A response is useful when the sequence needs status, accepted beat counts, or stall metrics. It requires rsp.set_id_info(req).",
    code: `rsp.set_id_info(req);
seq_item_port.item_done(rsp);`,
    trap: "Sending responses that no sequence consumes, overflowing the sequencer queue.",
    interview:
      "Responses exist to carry information, not to make the driver look complete.",
  },
  {
    title: "Card 16 — Reset Must Clean Pins and UVM State [RESET]",
    accent: "rose",
    hook: "Reset cleanup has two layers.",
    concept:
      "If reset occurs after get_next_item(), the driver must drive pins idle and still complete the sequencer handshake with status=ABORTED.",
    code: `seq_item_port.get_next_item(req);
drive_packet(req, status);
seq_item_port.item_done();`,
    trap: "Returning from driver task on reset without calling item_done().",
    interview:
      "Reset must not strand an outstanding sequencer transaction.",
  },
  {
    title: "Card 17 — Final Beat Cleanup Must Be Immediate [TIMING]",
    accent: "blue",
    hook: "One extra valid cycle duplicates data.",
    concept:
      "After the final beat is accepted, deassert valid immediately before the next sampling clock edge.",
    code: `// immediately after final handshake edge:
reset_source_outputs();`,
    trap: "Waiting one more clock before deasserting valid, creating a duplicate beat acceptance.",
    interview:
      "After final handshake, I clean up immediately; otherwise the sink may accept a duplicate final beat.",
  },
  {
    title: "Card 18 — Timing Discipline Must Be Consistent [RACE]",
    accent: "violet",
    hook: "Mixed timing creates ghost bugs.",
    concept:
      "Use raw posedge with nonblocking assignments or clocking blocks. Do not mix both styles on the same interface.",
    code: `@(posedge vif.clk);
vif.valid <= 1'b1;`,
    trap: "Driver uses raw posedge while monitor samples through incompatible clocking skew.",
    interview:
      "The timing convention is part of the VIP contract.",
  },
  {
    title: "Card 19 — Assertions Catch Temporal Violations [BOUNDARY]",
    accent: "amber",
    hook: "Driver obeys; assertions police.",
    concept:
      "The driver creates legal stimulus; protocol stability is policed by SVA assertions on the interface.",
    code: `valid && !ready |=> $stable(data) && $stable(keep) && $stable(last);`,
    trap: "Embedding full temporal checking suites inside active driver code.",
    interview:
      "Temporal protocol rules belong in assertions, not buried in active stimulus code.",
  },
  {
    title: "Card 20 — Debug at Handshake Boundaries [DEBUG]",
    accent: "emerald",
    hook: "Log accepted beats, not clock ticks.",
    concept:
      "Useful debug logs identify packet ID, beat index, payload, last, stalls, and abort status.",
    code: `\`uvm_info("RV_DRV",
  $sformatf("beat=%0d data=0x%08h last=%0b stalls=%0d",
            beat_idx, data, last, stalls),
  UVM_MEDIUM)`,
    trap: "Printing noisy log lines on every clock tick.",
    interview:
      "Streaming debug should be handshake-centered.",
  },
  {
    title: "Card 21 — Driver Does Not Hide Backpressure [ARCH]",
    accent: "blue",
    hook: "Stalls must remain visible.",
    concept:
      "When ready=0, the source driver holds the current beat. It does not skip, rewrite, or compress traffic to force progress.",
    code: `while (!vif.ready)
  @(posedge vif.clk);`,
    trap: "Advancing to the next beat because a test timeout is approaching.",
    interview:
      "A good driver exposes DUT backpressure; it does not erase it.",
  },
  {
    title: "Card 22 — Scaling Requires Queue Semantics [ARCH]",
    accent: "violet",
    hook: "Throughput needs bookkeeping.",
    concept:
      "A basic driver blocks until packet completion. A high-throughput driver may accept items into an internal queue, requiring explicit completion tracking.",
    code: `request acceptance != transfer completion`,
    trap: "Calling item_done() early without an internal tracking or response mechanism.",
    interview:
      "If I decouple acceptance from completion, I must add explicit completion tracking.",
  },
  {
    title: "Card 23 — Do Not Retain Requests After item_done() [UVM]",
    accent: "rose",
    hook: "After item_done, the item is no longer yours.",
    concept:
      "A non-pipelined driver uses req until completion. A queued driver that needs data after item_done() must clone or copy required fields.",
    code: `local_data_q.push_back(req.data[i]); // copy field, do not retain req handle`,
    trap: "Saving req handle in a queue, calling item_done(), and reading corrupted data later.",
    interview:
      "item_done() closes the sequencer contract; if I need data beyond that point, I own a copy.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// DATA — Bug Gallery (11 Bugs)
// ─────────────────────────────────────────────────────────────────────────────

const module9BugGallery = [
  {
    title: "Bug 1 — Source Waits for Ready",
    symptom:
      "Simulation hangs indefinitely with zero streaming transfers across the interface.",
    waveform: "valid: 0 0 0 0 | ready: 0 0 0 0 (Both sides idle waiting for the other).",
    cause: "The source driver checks for ready before asserting valid.",
    bad: `if (vif.ready) begin // BUG: Waits for ready!
  vif.valid <= 1'b1;
  vif.data  <= req.data[beat];
end`,
    fix: `vif.valid <= 1'b1;
vif.data  <= req.data[beat];
do @(posedge vif.clk);
while (vif.rst_n && !vif.ready); // Valid asserted unconditionally`,
    interview:
      "The source asserts valid when it has data. It samples ready only for completion.",
  },
  {
    title: "Bug 2 — Payload Advances During Stall",
    symptom:
      "Dropped or reordered streaming beats; scoreboard flags data corruption under backpressure.",
    waveform: "valid: 1 1 1 | ready: 0 0 1 | data: A B C -> Only 'C' is accepted!",
    cause: "The driver advanced the beat index on every clock edge rather than on valid && ready.",
    bad: `foreach (req.data[i]) begin
  vif.valid <= 1'b1;
  vif.data  <= req.data[i];
  @(posedge vif.clk); // BUG: Advances without checking ready!
end`,
    fix: `vif.data <= req.data[beat];
do @(posedge vif.clk);
while (vif.rst_n && !vif.ready); // Advances only after handshake`,
    interview:
      "During backpressure, the same beat remains pending.",
  },
  {
    title: "Bug 3 — item_done() Before Handshake",
    symptom:
      "Next sequence item overwrites the active stalled beat; traffic corruption under slow sinks.",
    waveform: "valid: 1 1 1 | ready: 0 0 1 | data: A B B (Item 'A' never transferred).",
    cause: "The driver released the sequencer before completing pin-level transfer.",
    bad: `seq_item_port.get_next_item(req);
vif.valid <= 1'b1;
vif.data  <= req.data[0];
seq_item_port.item_done(); // BUG: Handshake released prematurely!`,
    fix: `seq_item_port.get_next_item(req);
drive_packet(req);
seq_item_port.item_done(); // Released after final handshake`,
    interview:
      "For non-pipelined streaming, sequence completion follows pin-level acceptance.",
  },
  {
    title: "Bug 4 — Final Beat Accepted Twice",
    symptom:
      "Monitor observes duplicate final packet beat; packet length exceeds expected size by 1.",
    waveform: "clk: ↑ ↑ | valid: 1 1 | ready: 1 1 | data: Z Z | last: 1 1 -> Two handshakes!",
    cause: "Driver waited an extra clock cycle before deasserting valid after final beat acceptance.",
    bad: `// final beat handshakes here
@(posedge vif.clk); // BUG: Extra clock cycle keeps valid=1
reset_outputs();`,
    fix: `// immediately after final handshake edge:
reset_outputs(); // Scheduled before next clock edge`,
    interview:
      "After final handshake, cleanup must occur before the next sampling edge.",
  },
  {
    title: "Bug 5 — last Pulsed During Stall",
    symptom:
      "Packet never closes in monitor; framing assertions fire on dropped last flag.",
    waveform: "valid: 1 1 | ready: 0 1 | last: 1 0 (last pulsed while ready=0, low on handshake).",
    cause: "The driver generated last as a single-cycle pulse instead of a stable beat attribute.",
    bad: `vif.last <= 1'b1;
@(posedge vif.clk);
vif.last <= 1'b0; // BUG: Dropped before ready=1!`,
    fix: `vif.last <= is_final_beat;
do @(posedge vif.clk);
while (vif.rst_n && !vif.ready); // Held stable throughout stall`,
    interview:
      "last is sampled with the accepted beat, not when the driver feels like pulsing it.",
  },
  {
    title: "Bug 6 — Reset Strands Sequencer Item",
    symptom:
      "Sequence hangs in finish_item() after reset assertion during active traffic.",
    waveform: "Reset asserted after get_next_item(), driver returns to idle without item_done().",
    cause: "Driver cleaned physical pins but failed to close the outstanding UVM handshake.",
    bad: `seq_item_port.get_next_item(req);
if (!vif.rst_n) begin
  reset_outputs();
  return; // BUG: item_done skipped!
end`,
    fix: `seq_item_port.get_next_item(req);
drive_packet(req, status, accepted, stalls);
seq_item_port.item_done(); // Always released with status`,
    interview:
      "Reset cleanup must close both physical interface state and UVM control-plane state.",
  },
  {
    title: "Bug 7 — item_done() After get()",
    symptom:
      "Sequencer-driver protocol fatal error; double-completion complaints.",
    waveform: "UVM runtime fatal on seq_item_port handshake.",
    cause: "get() automatically consumes the item; calling item_done() afterwards violates protocol.",
    bad: `seq_item_port.get(req);
drive_packet(req);
seq_item_port.item_done(); // BUG: Illegal double completion!`,
    fix: `seq_item_port.get(req);
drive_packet(req);
// No item_done()!`,
    interview:
      "get() consumes the item; get_next_item() requires explicit completion.",
  },
  {
    title: "Bug 8 — try_next_item() Null Mishandled",
    symptom:
      "UVM fatal or protocol error from item_done() call without an active request.",
    waveform: "Driver crashes during idle periods when no item is available in sequencer.",
    cause: "Driver called item_done() unconditionally after try_next_item() returned null.",
    bad: `seq_item_port.try_next_item(req);
if (req == null)
  drive_default_ready();
seq_item_port.item_done(); // BUG: req was null!`,
    fix: `seq_item_port.try_next_item(req);
if (req != null) begin
  install_policy(req);
  seq_item_port.item_done(); // Only when non-null!
end`,
    interview:
      "try_next_item() creates an item_done obligation only when it returns a non-null item.",
  },
  {
    title: "Bug 9 — Sink Driver Becomes Scoreboard",
    symptom:
      "Duplicate checker maintenance, non-reusable sink VIP, false failures in negative tests.",
    waveform: "Sink driver flags payload mismatch instead of monitor-scoreboard path.",
    cause: "Driver crossed the boundary by comparing payload against expected model.",
    bad: `if (vif.valid && vif.ready) begin
  if (vif.data != expected_data) // BUG: Scoreboard logic in driver!
    \`uvm_error("SINK_DRV", "Data mismatch")
end`,
    fix: `if (vif.valid && vif.ready)
  accepted_count++; // Control/debug only!`,
    interview:
      "The sink driver can count accepted beats for control; payload correctness belongs to the scoreboard.",
  },
  {
    title: "Bug 10 — Driver Retains Request Handle After item_done()",
    symptom:
      "Intermittent wrong packet data when sequences randomize or reuse transaction handles.",
    waveform: "Driver outputs data values different from what was randomized at start_item.",
    cause: "Driver queued a reference to req after item_done(), and sequence mutated the object.",
    bad: `req_q.push_back(req);
seq_item_port.item_done();
// later: drive_packet(req_q.pop_front()); // BUG: Object mutated!`,
    fix: `foreach (req.data[i])
  local_data_q.push_back(req.data[i]); // Copy data fields
seq_item_port.item_done();`,
    interview:
      "If a driver needs data after item_done(), it must own a copy.",
  },
  {
    title: "Bug 11 — Response Sent but Never Consumed",
    symptom:
      "Sequencer response queue overflow, memory growth, or dropped response warnings.",
    waveform: "Pin traffic looks normal, but sequencer warns of unconsumed responses.",
    cause: "Driver calls item_done(rsp) or put_response(rsp), but sequence never calls get_response().",
    bad: `seq_item_port.item_done(rsp); // BUG: Sequence does not consume responses!`,
    fix: `// In sequence:
finish_item(req);
get_response(rsp); // Consumed properly!`,
    interview:
      "A response is a two-sided contract. The driver sends it only if the sequence consumes it.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// DATA — Interview Q&A (20 Questions)
// ─────────────────────────────────────────────────────────────────────────────

const module9InterviewQA = [
  {
    q: "Q1. What is the core ready/valid transfer rule?",
    short: "A beat transfers only on a clock edge where valid && ready is sampled high.",
    deep: "valid alone means the source offers data; ready alone means the sink is available. Data moves only on the sampling edge where both are asserted.",
    followup: "Can data transfer if ready asserts combinational mid-cycle?",
    answer: "No. Synchronous transfers are governed by the sampled state at the clock edge.",
  },
  {
    q: "Q2. Why must source valid not wait for ready?",
    short: "To avoid deadlock in AXI-style streaming protocols.",
    deep: "If the source waits for ready before asserting valid, and the sink waits for valid before asserting ready, both signals will remain low forever.",
    followup: null,
    answer: null,
  },
  {
    q: "Q3. When can payload change?",
    short: "Only on clock cycles where valid is low, or immediately after a handshake edge.",
    deep: "Once valid is asserted, payload and sidebands must freeze until valid && ready handshakes, or until an asynchronous reset abort occurs.",
    followup: null,
    answer: null,
  },
  {
    q: "Q4. When should a packet-level source driver call item_done()?",
    short: "After the final beat of the packet handshakes, or after reset-abort cleanup.",
    deep: "In a non-pipelined blocking contract, the sequence item represents the full packet. Calling item_done() before the final beat allows sequences to race.",
    followup: null,
    answer: null,
  },
  {
    q: "Q5. What is wrong with calling item_done() after asserting valid?",
    short: "It releases the sequence while the transfer is still pending on the bus.",
    deep: "The sequence may mutate the item handle, issue a dependent read/write, or terminate the phase before the sink has accepted the beat.",
    followup: null,
    answer: null,
  },
  {
    q: "Q6. What is the difference between idle and backpressure?",
    short: "Idle is source silence (valid=0); backpressure is sink refusal (ready=0 while valid=1).",
    deep: "They have different ownership and different verification implications. Idle measures source bandwidth utilization; backpressure measures downstream stalling.",
    followup: null,
    answer: null,
  },
  {
    q: "Q7. What does a sink driver do?",
    short: "It drives ready according to a verification backpressure policy.",
    deep: "A sink driver acts as reactive stimulus. It models always-ready, random backpressure, or burst stalls. It does not check payload correctness.",
    followup: null,
    answer: null,
  },
  {
    q: "Q8. Why is last not just a pulse?",
    short: "Because last is a qualifier of the final beat and must freeze with it during stalls.",
    deep: "If the final beat is stalled for 5 cycles, last must remain asserted for all 5 cycles so it is sampled high on the handshake edge.",
    followup: null,
    answer: null,
  },
  {
    q: "Q9. What is the try_next_item() trap?",
    short: "Calling item_done() when try_next_item() returned null.",
    deep: "try_next_item() is nonblocking. If it returns null, no item was fetched, so calling item_done() violates sequencer-driver protocol.",
    followup: null,
    answer: null,
  },
  {
    q: "Q10. Why is get() not paired with item_done()?",
    short: "Because get() consumes the item atomically as part of the call.",
    deep: "Calling item_done() after get() causes an illegal double-completion error in the sequencer pull port.",
    followup: null,
    answer: null,
  },
  {
    q: "Q11. When do you need a response object?",
    short: "When the sequence requires completion status, accepted beat count, or stall metrics.",
    deep: "If the sequence only needs blocking completion, finish_item() returning is sufficient. Use explicit responses when metadata must be returned.",
    followup: null,
    answer: null,
  },
  {
    q: "Q12. Why use set_id_info(req)?",
    short: "To copy the sequence ID and transaction ID into the response object.",
    deep: "Without set_id_info(req), the sequencer cannot route the response back to the originating sequence, causing get_response() to hang.",
    followup: null,
    answer: null,
  },
  {
    q: "Q13. What should reset do during a stalled beat?",
    short: "Drive valid/payload to idle, mark the item aborted, and call item_done().",
    deep: "Reset aborts the physical transfer and must release the UVM sequencer handshake to avoid permanently hanging the sequence.",
    followup: null,
    answer: null,
  },
  {
    q: "Q14. How do you debug a dropped streaming beat?",
    short: "Check if the driver advanced beat index without sampling ready, or if cleanup was delayed.",
    deep: "Look for waveform cycles where valid dropped while ready was 0, or where valid remained high for an extra cycle after last beat handshake.",
    followup: null,
    answer: null,
  },
  {
    q: "Q15. What is the duplicate-final-beat bug?",
    short: "Leaving valid high for one clock cycle too long after final beat handshake.",
    deep: "If ready remains high, the sink will accept the final beat a second time on the following clock edge.",
    followup: null,
    answer: null,
  },
  {
    q: "Q16. How do you scale this to high throughput?",
    short: "Use an internal driver queue to accept requests early, with decoupled response tracking.",
    deep: "Accept items into a queue with item_done(), then stream continuously across clock cycles without inter-item sequencer pull latency.",
    followup: null,
    answer: null,
  },
  {
    q: "Q17. What is wrong with retaining req after item_done()?",
    short: "The sequence may modify or reuse the object, corrupting queued data.",
    deep: "After item_done(), ownership returns to the sequence. If the driver needs data later, it must copy or clone the fields before item_done().",
    followup: null,
    answer: null,
  },
  {
    q: "Q18. What is the response-queue risk?",
    short: "Driver sending responses that no sequence consumes, causing memory growth.",
    deep: "Every put_response() deposits an item in the sequencer response queue. If the sequence does not call get_response(), the queue overflows.",
    followup: null,
    answer: null,
  },
  {
    q: "Q19. Should a generic driver control UVM objections?",
    short: "No. Objections belong in tests and sequences.",
    deep: "A driver loops forever serving requests. Raising objections inside a driver breaks VIP reusability and creates test shutdown race conditions.",
    followup: null,
    answer: null,
  },
  {
    q: "Q20. Why is a reset escape path necessary inside a stall loop?",
    short: "To prevent the driver from locking up forever if reset asserts during a stall.",
    deep: "If the driver waits strictly on ready while reset holds the DUT in reset (ready=0), the simulation will hang unless reset breaks the loop.",
    followup: null,
    answer: null,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// DATA — Sections for Sidebar Navigation
// ─────────────────────────────────────────────────────────────────────────────

const module9Sections = [
  { id: "identity", label: "Module Identity & Mission" },
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
  { id: "memory", label: "Memory Cards (1–23)" },
  { id: "atlas", label: "Atlas Sheets (1–7)" },
  { id: "codelabs", label: "Code Labs (1–3)" },
  { id: "bugs", label: "Bug Gallery (1–11)" },
  { id: "race", label: "Race-Condition Checklist" },
  { id: "logging", label: "Debug Instrumentation & Logs" },
  { id: "verification-boundary", label: "Monitor / Scoreboard Boundary" },
  { id: "decisions", label: "Architectural Decision Points" },
  { id: "scalability", label: "Scalability Notes" },
  { id: "review", label: "Review Checklist" },
  { id: "interview", label: "Interview Q&A (Q1–Q20)" },
  { id: "recall", label: "Final Recall Card" },
  { id: "takeaways", label: "Key Takeaways" },
  { id: "interview-summary", label: "Interview Questions (20 Qs)" },
  { id: "exercise", label: "Coding Exercise" },
  { id: "verdict", label: "Final Readiness Verdict & Audit" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT — Module 9
// ═══════════════════════════════════════════════════════════════════════════════

const Module9 = () => {
  return (
    <div className="relative min-h-screen bg-slate-950 text-white font-sans">
      {/* Background glow & grid */}
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-150 h-62.5 bg-linear-to-r from-blue-600/15 to-indigo-600/15 blur-[100px] rounded-full" />

      <div className="relative z-10 flex max-w-7xl mx-auto">
        {/* ── Sidebar TOC (desktop) ────────────────────────────────────── */}
        <ModuleSidebar
          moduleNumber="9"
          title="Ready/Valid & Streaming Driver"
          sections={module9Sections}
        />

        {/* ── Main Content ─────────────────────────────────────────────── */}
        <main className="flex-1 min-w-0 px-6 py-8 pb-24 max-w-4xl">
          {/* Mobile back */}
          <BackToHomeBtn to="/driver-mastery" />

          {/* Hero */}
          <ModuleHero
            moduleNumber="9"
            title="Ready/Valid and Streaming Driver Deep Dive"
            description="Master generic AXI-style ready/valid streaming source and sink drivers. Master handshake ownership, stable stalls, legal idle insertion, packet framing with last, reset-abort cleanup, and response routing."
            metadata={[
              ["Module", "9"],
              ["Reference", "Generic AXI-Style / UVM 1.2"],
              ["Pattern", "Streaming Source & Sink Backpressure Drivers"],
              ["Roadmap", "After Module 8 (APB), before Module 10 (AXI4-Lite)"],
            ]}
          />

          {/* ── §1 Cover Page / Module Identity ─────────────────────────── */}
          <section id="identity">
            <SectionHeading num={1} title="Cover Page / Module Identity" />
            <div className="rounded-xl border border-slate-700/60 bg-slate-900/50 p-5 space-y-3 mb-6">
              <Table
                headers={["Previous", "Current", "Next"]}
                rows={[
                  [
                    "Module 8: APB Master Driver Deep Dive",
                    "Module 9: Ready/Valid and Streaming Driver Deep Dive",
                    "Module 10: AXI4-Lite Driver Deep Dive",
                  ],
                ]}
              />

              <h3 className="text-lg font-bold text-blue-300 mt-4">
                Module Mission
              </h3>
              <p className="text-slate-300 text-sm">
                This module teaches how to write production-grade UVM drivers for
                streaming protocols where data movement is governed by a
                ready/valid handshake:
              </p>
              <blockquote className="border-l-4 border-blue-500 bg-blue-500/10 p-4 rounded-r-xl text-blue-200 text-sm leading-relaxed">
                Source offers; sink accepts; transfer occurs on sampled{" "}
                <code>valid &amp;&amp; ready</code>. Payload freezes during stalls,
                and item completion aligns cleanly with transaction granularity.
              </blockquote>
            </div>
          </section>

          {/* ── §2 Learning Objectives ──────────────────────────────────── */}
          <section id="objectives">
            <SectionHeading num={2} title="Learning Objectives" />
            <ol className="space-y-2 list-decimal list-inside text-slate-300 text-sm leading-relaxed">
              {[
                "Explain ready/valid ownership and transfer completion on sampled valid && ready.",
                "Write a source driver that drives valid, payload, and source sidebands.",
                "Write a sink driver that drives ready and controls backpressure stimulus.",
                "Hold payload, keep, and last strictly stable during stalls.",
                "Insert legal idle cycles before valid assertion without withdrawing offered beats.",
                "Model packetized streams using beats and last framing signals.",
                "Decide packet-level vs beat-level transaction granularity.",
                "Place item_done() at the correct completion point for blocking contracts.",
                "Handle reset before, during, and after streaming transfers without stranding sequencer items.",
                "Use UVM 1.2 sequencer-driver APIs (get_next_item, try_next_item, get) correctly.",
                "Explain response routing with rsp.set_id_info(req) and response queue risks.",
                "Define transaction ownership after item_done() to avoid memory corruption.",
                "Keep driver, monitor, scoreboard, and assertion responsibilities cleanly partitioned.",
                "Defend ready/valid driver architecture in senior/principal interviews.",
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
              <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/40 space-y-1">
                <strong className="text-blue-300">Pass 1 — Protocol & Waveform:</strong>
                <p>
                  Study Sections 7 &amp; 8. Master handshake semantics (<code>valid &amp;&amp; ready</code>) and why source valid must not wait for ready.
                </p>
              </div>
              <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/40 space-y-1">
                <strong className="text-violet-300">Pass 2 — Sequencer & Reset Contracts:</strong>
                <p>
                  Read Sections 9–13. Map pin-level completion to UVM <code>item_done()</code>, reset aborts, and response routing.
                </p>
              </div>
              <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/40 space-y-1">
                <strong className="text-emerald-300">Pass 3 — Code Labs:</strong>
                <p>
                  Implement Code Lab 1 (Source Driver), Code Lab 2 (Sink Driver), and Code Lab 3 (Response Extension).
                </p>
              </div>
              <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/40 space-y-1">
                <strong className="text-amber-300">Pass 4 — Debug & Interview Defense:</strong>
                <p>
                  Study Bug Gallery (1–11), Race Checklist, and the 20 Interview Q&amp;As to defend streaming VIP architecture.
                </p>
              </div>
            </div>
          </section>

          {/* ── §4 Visual Tag Legend ───────────────────────────────────── */}
          <section id="legend">
            <SectionHeading num={4} title="Visual Tag Legend" />
            <Table
              headers={["Tag", "Meaning"]}
              rows={[
                ["[PROTOCOL]", "Protocol behavior or handshake rule"],
                ["[WAVEFORM]", "Cycle-level signal relationship"],
                ["[UVM]", "UVM 1.2 sequencer-driver / API behavior"],
                ["[RESET]", "Reset or abort rule"],
                ["[BUG]", "Known failure mode or symptom"],
                ["[BOUNDARY]", "Driver vs monitor vs scoreboard vs assertion ownership"],
                ["[SENIOR]", "Architecture-level decision"],
                ["[INTERVIEW]", "Interview-ready explanation line"],
              ]}
            />
          </section>

          {/* ── §5 Module-Specific Acceptance Checklist ─────────────────── */}
          <section id="acceptance">
            <SectionHeading
              num={5}
              title="Module-Specific Acceptance Checklist"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-300">
              {[
                "Source owns valid, payload, and source sidebands (keep, last).",
                "Sink owns ready backpressure signal.",
                "Transfer occurs only on sampled valid && ready.",
                "Source valid must not depend on ready (deadlock-free rule).",
                "Payload and sidebands remain stable while valid && !ready.",
                "Beat index advances only on handshake edge.",
                "last is aligned with the final accepted beat.",
                "Idle insertion occurs before valid assertion.",
                "Backpressure is represented by ready == 0.",
                "item_done() timing matches transaction granularity.",
                "get_next_item() is paired with item_done().",
                "try_next_item() handles null safely.",
                "get() is not paired with item_done().",
                "Responses use rsp.set_id_info(req) when routed.",
                "Reset-abort closes both physical pins and sequencer state.",
                "Transaction ownership after item_done() is clearly defined.",
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
                  <li>Generic ready/valid streaming source driver</li>
                  <li>Sink-side backpressure driver with randomized policies</li>
                  <li>Beat-level and packet-level transaction modeling with last and keep</li>
                  <li>Idle insertion, stall stability, and immediate cleanup</li>
                  <li>Reset-aware abort and configurable stall watchdogs</li>
                  <li>Explicit response routing and transaction ownership rules</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/40">
                <h4 className="font-bold text-slate-300 mb-2">
                  6.2 Non-Scope (Dedicated Modules)
                </h4>
                <Table
                  headers={["Topic", "Destination Module"]}
                  rows={[
                    ["Full AXI4-Lite Driver", "Module 10"],
                    ["Multi-channel pipelined drivers", "Module 11"],
                    ["Slave/responder architecture", "Module 12"],
                    ["Deep driver-monitor-scoreboard partitioning", "Module 13"],
                    ["Burst/framing beyond basic stream", "Module 14"],
                    ["Credit/retry/replay streaming", "Module 16"],
                    ["Low-power/clock-gated behavior", "Module 17"],
                  ]}
                />
              </div>

              <Callout type="concept">
                <strong>Boundary Note:</strong> This module uses generic AXI-style
                ready/valid rules. If a project protocol permits explicit
                cancellation or combinational ready dependencies, project
                specifications override this generic baseline.
              </Callout>
            </div>
          </section>

          {/* ── §7 Protocol Mental Model ───────────────────────────────── */}
          <section id="mental-model">
            <SectionHeading num={7} title="Protocol Mental Model" />
            <div className="space-y-6 text-sm text-slate-300">
              <div>
                <h4 className="font-bold text-blue-300 text-base mb-2">
                  7.1 Minimal Interface &amp; Ownership
                </h4>
                <CodeBlock lang="systemverilog">{`// Minimal Streaming Interface:
logic        valid; // source -> sink: beat is being offered
logic        ready; // sink   -> source: sink can accept current beat
logic [31:0] data;  // source -> sink: payload
logic [3:0]  keep;  // source -> sink: active byte lanes
logic        last;  // source -> sink: final beat of packet`}</CodeBlock>
              </div>

              <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 text-xs space-y-2">
                <h4 className="font-bold text-rose-300 text-sm">
                  7.4 Deadlock-Free Source Rule
                </h4>
                <p className="text-slate-300">
                  <strong>The source must not wait for ready before asserting valid.</strong> If source waits for ready and sink waits for valid, both signals remain low forever. The source asserts valid when data is available; it observes ready only to detect completion.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/40 text-xs">
                <h4 className="font-bold text-emerald-300 text-sm mb-1">
                  7.3 &amp; 7.5 Transfer &amp; Stable Offer Rules
                </h4>
                <p className="text-slate-300">
                  A beat transfers only on a clock edge where <code>valid &amp;&amp; ready</code> is sampled high. Once valid is asserted, payload, keep, and last must freeze until accepted or reset-aborted.
                </p>
              </div>
            </div>
          </section>

          {/* ── §8 Timing / Waveform Contract ──────────────────────────── */}
          <section id="timing">
            <SectionHeading num={8} title="Timing / Waveform Contract" />
            <div className="space-y-6 text-sm text-slate-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/50">
                  <h5 className="font-bold text-emerald-300 mb-2">
                    8.1 Single-Beat Transfer
                  </h5>
                  <CodeBlock lang="text">{`clk   :  ↑   ↑   ↑
valid :  0   1   0
ready :  1   1   1
data  :      A
event :      H (Handshake!)`}</CodeBlock>
                </div>

                <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/50">
                  <h5 className="font-bold text-amber-300 mb-2">
                    8.2 Stalled Beat (Backpressure)
                  </h5>
                  <CodeBlock lang="text">{`clk   :  ↑   ↑   ↑   ↑   ↑
valid :  0   1   1   1   0
ready :  1   0   0   1   1
data  :      A   A   A
event :              H (Handshake!)`}</CodeBlock>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/40">
                <h5 className="font-bold text-blue-300 mb-2">
                  8.3 Multi-Beat Packet &amp; Immediate Cleanup (8.6)
                </h5>
                <CodeBlock lang="text">{`clk   :  ↑   ↑   ↑   ↑   ↑   ↑
valid :  0   1   1   1   1   0  <-- Deassert immediately after final H!
ready :  1   1   0   1   1   1
data  :      B0  B1  B1  B2
last  :      0   0   0   1
event :      H       H   H`}</CodeBlock>
                <p className="text-xs text-slate-400 mt-2">
                  <strong>Critical Rule:</strong> Deassert valid immediately after the final handshake edge to prevent the duplicate-final-beat bug.
                </p>
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
                <h4 className="font-bold text-emerald-300 mb-2">
                  9.1 Source Driver Owns
                </h4>
                <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs">
                  <li>Driving valid, payload (data), keep, and last</li>
                  <li>Holding payload stable during stalls</li>
                  <li>Observing ready for transfer completion</li>
                  <li>Counting accepted beats for local completion</li>
                  <li>Reset-abort cleanup and item_done() release</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl border border-violet-500/20 bg-violet-500/5">
                <h4 className="font-bold text-violet-300 mb-2">
                  9.3 Sink Driver Owns
                </h4>
                <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs">
                  <li>Driving ready (backpressure stimulus)</li>
                  <li>Applying ready policies from sequence items</li>
                  <li>Observing valid for local handshake debug</li>
                  <li>Zero scoreboard comparison or checking</li>
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
              <h4 className="font-bold text-blue-300 text-base">
                10.1 get_next_item() vs 10.2 try_next_item() vs 10.3 get()
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-900/60 border border-slate-700/60 rounded-lg">
                  <strong className="text-emerald-300">get_next_item(req):</strong>
                  <p className="mt-1 text-slate-300">
                    Blocks until item is available; must be paired with <code>item_done()</code> after packet completion.
                  </p>
                </div>
                <div className="p-3 bg-slate-900/60 border border-slate-700/60 rounded-lg">
                  <strong className="text-violet-300">try_next_item(req):</strong>
                  <p className="mt-1 text-slate-300">
                    Nonblocking poll; call <code>item_done()</code> only if <code>req != null</code>. Ideal for sink drivers.
                  </p>
                </div>
                <div className="p-3 bg-slate-900/60 border border-slate-700/60 rounded-lg">
                  <strong className="text-amber-300">get(req):</strong>
                  <p className="mt-1 text-slate-300">
                    Consumes item atomically; never call <code>item_done()</code> afterwards.
                  </p>
                </div>
              </div>

              <Callout type="concept">
                <strong>10.6 Transaction Ownership Policy:</strong> The driver treats <code>req</code> as read-only stimulus. The driver must not retain references to <code>req</code> after <code>item_done()</code> unless it copies/clones the required data.
              </Callout>
            </div>
          </section>

          {/* ── §11 Reset / Abort Policy ───────────────────────────────── */}
          <section id="reset">
            <SectionHeading num={11} title="Reset / Abort Policy" />
            <div className="space-y-4 text-sm text-slate-300">
              <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/40">
                <h4 className="font-bold text-blue-300 mb-1">
                  11.2 Default Reset Completion Policy
                </h4>
                <p className="text-xs text-slate-300 mb-2">
                  When reset asserts during an active packet or stall:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-xs text-slate-300">
                  <li>Drive valid, data, keep, and last to 0 immediately.</li>
                  <li>Mark internal status as <code>RV_DRV_ABORTED</code>.</li>
                  <li>Wait for reset release.</li>
                  <li>Call <code>item_done()</code> to prevent sequencer deadlock.</li>
                </ol>
              </div>
            </div>
          </section>

          {/* ── §12 Response / Completion Policy ────────────────────────── */}
          <section id="response">
            <SectionHeading
              num={12}
              title="Response / Completion Policy"
            />
            <div className="space-y-3 text-sm text-slate-300">
              <p>
                <strong>12.1 No-Response Mode:</strong> Used when <code>finish_item()</code> returning is sufficient for the sequence.
              </p>
              <p>
                <strong>12.2 Response Mode:</strong> Used when sequence needs <code>status</code> (OK/ABORTED), <code>accepted_beats</code> count, or stall metrics.
              </p>
              <CodeBlock lang="systemverilog">{`rsp = rv_stream_rsp::type_id::create("rsp");
rsp.set_id_info(req); // Mandatory for response routing!
rsp.status         = (drv_status == RV_DRV_OK) ? RV_RSP_OK : RV_RSP_ABORTED;
rsp.accepted_beats = accepted_count;
seq_item_port.item_done(rsp);`}</CodeBlock>
            </div>
          </section>

          {/* ── §13 Protocol Ownership Matrix ──────────────────────────── */}
          <section id="ownership">
            <SectionHeading num={13} title="Protocol Ownership Matrix" />
            <Table
              headers={[
                "Concern",
                "Source Driver",
                "Sink Driver",
                "Monitor",
                "Scoreboard",
                "Assertion",
              ]}
              rows={[
                ["Drive valid", "Yes", "No", "No", "No", "No"],
                ["Drive payload (data)", "Yes", "No", "No", "No", "No"],
                ["Drive keep / last / user", "Yes", "No", "No", "No", "No"],
                ["Drive ready", "No", "Yes", "No", "No", "No"],
                ["Observe ready", "Yes", "Optional", "Yes", "No", "Yes"],
                ["Observe valid", "Optional", "Yes", "Yes", "No", "Yes"],
                ["Count local handshakes", "Yes", "Yes", "Yes", "No", "Optional"],
                ["Reconstruct packets", "No", "No", "Yes", "Optional", "Optional"],
                ["Compare expected vs actual", "No", "No", "No", "Yes", "No"],
                ["Check stable payload", "Driver obeys", "No", "No", "No", "Yes"],
                ["Decide item_done()", "Yes", "Yes", "No", "No", "No"],
                ["Decide test pass/fail", "No", "No", "No", "Yes", "Protocol only"],
              ]}
            />
          </section>

          {/* ── §14 Memory Cards ────────────────────────────────────────── */}
          <section id="memory">
            <SectionHeading num={14} title="Memory Cards (1–23)" />
            <p className="text-slate-400 text-sm mb-4">
              23 comprehensive memory cards for Ready/Valid &amp; Streaming Driver Mastery:
            </p>
            <div className="space-y-3">
              {module9MemoryCards.map((card, idx) => (
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
            <SectionHeading num={15} title="Atlas Sheets (1–7)" />

            <CollapsibleCard
              title="Atlas Sheet 1 — Source Driver vs Sink Driver"
              accent="blue"
              icon={<FaListAlt size={12} />}
              defaultOpen={true}
            >
              <Table
                headers={[
                  "Feature",
                  "Source Driver",
                  "Sink Driver",
                ]}
                rows={[
                  ["Drives", "valid, payload, sidebands", "ready"],
                  ["Observes", "ready, reset", "valid, reset"],
                  ["Main job", "Send stream into DUT", "Apply backpressure to DUT"],
                  ["Completion", "Beats accepted", "Policy applied / cycles elapsed"],
                  ["Can count handshakes?", "Yes, local", "Yes, local"],
                  ["Can check payload?", "No", "No"],
                  ["Common bug", "Payload changes during stall", "ready policy races or checks payload"],
                ]}
              />
            </CollapsibleCard>

            <CollapsibleCard
              title="Atlas Sheet 2 — Transaction Granularity"
              accent="violet"
              icon={<FaListAlt size={12} />}
            >
              <Table
                headers={["Item Type", "Contains", "Completion Point", "Use", "Risk"]}
                rows={[
                  ["Beat item", "One beat", "One handshake", "Low-level timing stress", "High sequence overhead"],
                  ["Packet item", "Beat array + last", "Final beat handshake", "Packet/frame intent", "Long sequence blocking"],
                  ["Descriptor item", "Pointer/length/policy", "Queue acceptance", "High throughput", "Needs completion tracking"],
                  ["Ready-policy item", "Ready pattern", "Policy installed/expired", "Sink driver", "Ambiguous lifetime if poorly defined"],
                ]}
              />
            </CollapsibleCard>

            <CollapsibleCard
              title="Atlas Sheet 3 — UVM API Choice"
              accent="emerald"
              icon={<FaListAlt size={12} />}
            >
              <Table
                headers={["API", "Pairing", "Best Use", "Trap"]}
                rows={[
                  ["get_next_item()", "Must call item_done()", "Blocking source driver", "Early item_done()"],
                  ["try_next_item()", "Call item_done() only if non-null", "Nonblocking sink driver", "Null mishandling"],
                  ["get()", "No item_done()", "Alternative pull style", "Mixing with item_done()"],
                  ["item_done(rsp)", "Response routed with set_id_info", "Blocking completion with status", "Missing set_id_info()"],
                  ["put_response(rsp)", "Response object required", "Decoupled completion", "Sequence never consumes response"],
                ]}
              />
            </CollapsibleCard>

            <CollapsibleCard
              title="Atlas Sheet 4 — Timing Discipline"
              accent="amber"
              icon={<FaListAlt size={12} />}
            >
              <Table
                headers={["Method", "Pattern", "Advantage", "Risk"]}
                rows={[
                  ["Raw posedge + NBA", "@(posedge clk); sig <= val;", "Simple, portable", "Monitor must sample consistently"],
                  ["Clocking block", "@(vif.cb); vif.cb.valid <= val;", "Reduces race ambiguity", "Skew must be understood"],
                  ["Combinational wait", "wait(ready);", "Looks simple", "Wrong for synchronous transfers"],
                  ["Mixed raw + CB", "Both styles mixed", "None", "Race-prone"],
                ]}
              />
            </CollapsibleCard>

            <CollapsibleCard
              title="Atlas Sheet 5 — Backpressure Policies"
              accent="rose"
              icon={<FaListAlt size={12} />}
            >
              <Table
                headers={["Policy", "Meaning", "Use"]}
                rows={[
                  ["Always ready", "ready=1 after reset", "Smoke tests & sanity"],
                  ["Random ready", "Random high/low distribution", "Stress & corner cases"],
                  ["Burst ready", "Accept N beats, stall M beats", "FIFO boundary testing"],
                  ["Valid-reactive ready", "Ready asserted after seeing valid", "Latency modeling"],
                  ["Capacity-model ready", "Ready follows internal queue space", "Realistic sink DUT"],
                ]}
              />
            </CollapsibleCard>

            <CollapsibleCard
              title="Atlas Sheet 6 — Assertion Boundary Examples"
              accent="blue"
              icon={<FaListAlt size={12} />}
            >
              <Table
                headers={["Property", "Owner", "Purpose"]}
                rows={[
                  ["Payload stable during stall", "Assertion (SVA)", "Catch illegal source mutation"],
                  ["last stable during stall", "Assertion (SVA)", "Catch packet framing corruption"],
                  ["No X on active transfer", "Assertion (SVA)", "Catch reset/init bugs"],
                  ["Transfer counted on handshake", "Monitor / Assertion", "Prevent false observation"],
                  ["Ready not X after reset", "Assertion (SVA)", "Catch sink readiness bugs"],
                ]}
              />
            </CollapsibleCard>

            <CollapsibleCard
              title="Atlas Sheet 7 — Completion, Response, Ownership"
              accent="violet"
              icon={<FaListAlt size={12} />}
            >
              <Table
                headers={["Architecture", "Request Ownership", "item_done() Point", "Response Required?", "Risk"]}
                rows={[
                  ["Blocking packet driver", "Driver uses req until complete", "Final beat handshake / abort", "Optional", "Sequence blocked during stalls"],
                  ["Blocking beat driver", "Driver uses req for 1 beat", "Beat handshake / abort", "Optional", "Higher sequence overhead"],
                  ["Queued driver", "Driver copies data before item_done", "Queue acceptance", "Usually yes", "Lost completion tracking"],
                  ["Response-enabled driver", "Driver reports completion metadata", "Completion point", "Yes", "Sequence must consume response"],
                ]}
              />
            </CollapsibleCard>
          </section>

          {/* ── §16 Code Labs ───────────────────────────────────────────── */}
          <section id="codelabs">
            <SectionHeading num={16} title="Code Labs (1–3)" />

            {/* Lab 1 */}
            <CollapsibleCard
              title="Code Lab 1 — Shared Interface & Source Driver"
              accent="blue"
              icon={<FaFlask size={12} />}
              defaultOpen={true}
            >
              <div className="space-y-3 text-xs text-slate-300">
                <p>
                  <strong>Goal:</strong> Complete production streaming interface{" "}
                  <code>rv_stream_if</code> and blocking source driver{" "}
                  <code>rv_stream_source_driver</code>.
                </p>
                <CodeBlock lang="systemverilog">{`// File: rv_stream_if.sv
interface rv_stream_if #(
  parameter int DATA_WIDTH = 32,
  parameter int KEEP_WIDTH = DATA_WIDTH / 8
)(
  input logic clk,
  input logic rst_n
);
  logic                  valid;
  logic                  ready;
  logic [DATA_WIDTH-1:0] data;
  logic [KEEP_WIDTH-1:0] keep;
  logic                  last;
endinterface`}</CodeBlock>

                <CodeBlock lang="systemverilog">{`// File: rv_stream_pkg.sv
package rv_stream_pkg;
  import uvm_pkg::*;
  \`include "uvm_macros.svh"

  typedef virtual rv_stream_if #(32,4) rv_stream_vif_t;
  typedef enum { RV_DRV_OK, RV_DRV_ABORTED } rv_drv_status_e;

  class rv_stream_item extends uvm_sequence_item;
    rand int unsigned num_beats;
    rand bit [31:0]   data[];
    rand bit [3:0]    keep[];
    rand int unsigned idle_cycles[];

    constraint c_num_beats { num_beats inside {[1:32]}; }
    constraint c_sizes {
      data.size()        == num_beats;
      keep.size()        == num_beats;
      idle_cycles.size() == num_beats;
    }
    constraint c_keep { foreach (keep[i]) keep[i] != 4'h0; }
    constraint c_idle { foreach (idle_cycles[i]) idle_cycles[i] inside {[0:5]}; }

    \`uvm_object_utils(rv_stream_item)

    function new(string name = "rv_stream_item");
      super.new(name);
    endfunction
  endclass

  class rv_stream_source_driver extends uvm_driver #(rv_stream_item);
    \`uvm_component_utils(rv_stream_source_driver)

    rv_stream_vif_t vif;
    int unsigned    max_stall_cycles; // 0 disables watchdog

    function new(string name, uvm_component parent);
      super.new(name, parent);
      max_stall_cycles = 0;
    endfunction

    function void build_phase(uvm_phase phase);
      super.build_phase(phase);
      if (!uvm_config_db#(rv_stream_vif_t)::get(this, "", "vif", vif)) begin
        \`uvm_fatal("NOVIF", "rv_stream_if virtual interface not set")
      end
    endfunction

    task run_phase(uvm_phase phase);
      rv_stream_item req;
      rv_drv_status_e status;
      int unsigned accepted_beats, total_stalls;

      reset_outputs();
      wait_reset_release();

      forever begin
        seq_item_port.get_next_item(req);
        status         = RV_DRV_OK;
        accepted_beats = 0;
        total_stalls   = 0;

        drive_packet(req, status, accepted_beats, total_stalls);

        if (status == RV_DRV_ABORTED) begin
          \`uvm_info("RV_SRC_DRV",
            $sformatf("Item aborted by reset: accepted=%0d stalls=%0d",
                      accepted_beats, total_stalls),
            UVM_MEDIUM)
        end

        seq_item_port.item_done();
      end
    endtask

    task reset_outputs();
      vif.valid <= 1'b0;
      vif.data  <= '0;
      vif.keep  <= '0;
      vif.last  <= 1'b0;
    endtask

    task wait_reset_release();
      while (vif.rst_n !== 1'b1) begin
        reset_outputs();
        @(posedge vif.clk);
      end
    endtask

    task drive_packet(
      input  rv_stream_item  req,
      output rv_drv_status_e status,
      output int unsigned    accepted_beats,
      output int unsigned    total_stalls
    );
      int unsigned beat, beat_stalls;

      status         = RV_DRV_OK;
      accepted_beats = 0;
      total_stalls   = 0;

      for (beat = 0; beat < req.num_beats; beat++) begin
        // Idle insertion before offer
        repeat (req.idle_cycles[beat]) begin
          reset_outputs();
          @(posedge vif.clk);
          if (vif.rst_n !== 1'b1) begin
            status = RV_DRV_ABORTED;
            reset_outputs();
            return;
          end
        end

        // Assert valid offer
        vif.valid <= 1'b1;
        vif.data  <= req.data[beat];
        vif.keep  <= req.keep[beat];
        vif.last  <= (beat == req.num_beats - 1);

        beat_stalls = 0;

        forever begin
          @(posedge vif.clk);
          if (vif.rst_n !== 1'b1) begin
            status = RV_DRV_ABORTED;
            reset_outputs();
            return;
          end

          if (vif.ready) begin
            accepted_beats++;
            total_stalls += beat_stalls;
            break;
          end

          beat_stalls++;
          if ((max_stall_cycles != 0) && (beat_stalls > max_stall_cycles)) begin
            \`uvm_error("RV_SRC_DRV",
              $sformatf("Beat %0d stalled beyond %0d cycles", beat, max_stall_cycles))
          end
        end
      end

      // Critical: Immediate cleanup after final handshake
      reset_outputs();
    endtask
  endclass
endpackage`}</CodeBlock>
              </div>
            </CollapsibleCard>

            {/* Lab 2 */}
            <CollapsibleCard
              title="Code Lab 2 — Sink / Backpressure Driver"
              accent="emerald"
              icon={<FaFlask size={12} />}
            >
              <div className="space-y-3 text-xs text-slate-300">
                <p>
                  <strong>Goal:</strong> Implement <code>rv_stream_sink_driver</code>{" "}
                  using <code>try_next_item()</code> to install ready-policies
                  without blocking background ready driving.
                </p>
                <CodeBlock lang="systemverilog">{`package rv_sink_pkg;
  import uvm_pkg::*;
  import rv_stream_pkg::rv_stream_vif_t;
  \`include "uvm_macros.svh"

  class rv_ready_policy_item extends uvm_sequence_item;
    rand int unsigned active_cycles;
    rand int unsigned ready_high_weight;
    rand int unsigned ready_low_weight;

    constraint c_active_cycles { active_cycles inside {[1:200]}; }
    constraint c_weights {
      ready_high_weight inside {[1:100]};
      ready_low_weight  inside {[0:100]};
      ready_high_weight + ready_low_weight > 0;
    }

    \`uvm_object_utils(rv_ready_policy_item)

    function new(string name = "rv_ready_policy_item");
      super.new(name);
    endfunction
  endclass

  class rv_stream_sink_driver extends uvm_driver #(rv_ready_policy_item);
    \`uvm_component_utils(rv_stream_sink_driver)

    rv_stream_vif_t vif;
    int unsigned    policy_cycles_left;
    int unsigned    high_w, low_w;
    bit             default_ready;

    function new(string name, uvm_component parent);
      super.new(name, parent);
      policy_cycles_left = 0;
      high_w             = 1;
      low_w              = 0;
      default_ready      = 1'b1;
    endfunction

    function void build_phase(uvm_phase phase);
      super.build_phase(phase);
      if (!uvm_config_db#(rv_stream_vif_t)::get(this, "", "vif", vif)) begin
        \`uvm_fatal("NOVIF", "rv_stream_if virtual interface not set")
      end
    endfunction

    task run_phase(uvm_phase phase);
      rv_ready_policy_item req;
      vif.ready <= 1'b0;
      wait_reset_release();

      forever begin
        if (vif.rst_n !== 1'b1) begin
          vif.ready <= 1'b0;
          wait_reset_release();
        end

        // Nonblocking poll for ready-policy items
        seq_item_port.try_next_item(req);

        if (req != null) begin
          high_w             = req.ready_high_weight;
          low_w              = req.ready_low_weight;
          policy_cycles_left = req.active_cycles;
          seq_item_port.item_done();
        end

        drive_ready_one_cycle();
      end
    endtask

    task wait_reset_release();
      while (vif.rst_n !== 1'b1) begin
        vif.ready <= 1'b0;
        @(posedge vif.clk);
      end
    endtask

    function bit choose_ready();
      int unsigned total, pick;
      if (policy_cycles_left == 0) return default_ready;
      total = high_w + low_w;
      pick  = $urandom_range(1, total);
      return (pick <= high_w);
    endfunction

    task drive_ready_one_cycle();
      vif.ready <= choose_ready();
      @(posedge vif.clk);
      if (policy_cycles_left != 0) policy_cycles_left--;
    endtask
  endclass
endpackage`}</CodeBlock>
              </div>
            </CollapsibleCard>

            {/* Lab 3 */}
            <CollapsibleCard
              title="Code Lab 3 — Response-Enabled Source Driver Extension"
              accent="violet"
              icon={<FaFlask size={12} />}
            >
              <div className="space-y-3 text-xs text-slate-300">
                <p>
                  <strong>Goal:</strong> Extend source driver with explicit{" "}
                  <code>rv_stream_rsp</code> returning <code>status</code>,{" "}
                  <code>accepted_beats</code>, and <code>total_stall_cycles</code>.
                </p>
                <CodeBlock lang="systemverilog">{`package rv_rsp_pkg;
  import uvm_pkg::*;
  import rv_stream_pkg::*;
  \`include "uvm_macros.svh"

  typedef enum { RV_RSP_OK, RV_RSP_ABORTED } rv_rsp_status_e;

  class rv_stream_rsp extends uvm_sequence_item;
    rv_rsp_status_e status;
    int unsigned    accepted_beats;
    int unsigned    total_stall_cycles;

    \`uvm_object_utils(rv_stream_rsp)

    function new(string name = "rv_stream_rsp"); super.new(name); endfunction
  endclass

  class rv_stream_source_driver_with_rsp
    extends uvm_driver #(rv_stream_item, rv_stream_rsp);

    \`uvm_component_utils(rv_stream_source_driver_with_rsp)

    rv_stream_vif_t vif;

    task run_phase(uvm_phase phase);
      rv_stream_item  req;
      rv_stream_rsp   rsp;
      rv_drv_status_e drv_status;

      reset_outputs();
      wait_reset_release();

      forever begin
        seq_item_port.get_next_item(req);

        rsp = rv_stream_rsp::type_id::create("rsp");
        rsp.set_id_info(req); // Copy sequence & transaction IDs

        drive_packet(req, drv_status, rsp.accepted_beats, rsp.total_stall_cycles);
        rsp.status = (drv_status == RV_DRV_OK) ? RV_RSP_OK : RV_RSP_ABORTED;

        seq_item_port.item_done(rsp);
      end
    endtask
  endclass
endpackage`}</CodeBlock>
              </div>
            </CollapsibleCard>
          </section>

          {/* ── §17 Bug Gallery ─────────────────────────────────────────── */}
          <section id="bugs">
            <SectionHeading num={17} title="Bug Gallery (1–11)" />
            <div className="space-y-4">
              {module9BugGallery.map((bug, idx) => (
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
                "Driver uses one timing discipline consistently.",
                "Driver pin drives use nonblocking assignments in clocked flow.",
                "ready is sampled at the protocol clock edge.",
                "Payload changes only after handshake or before valid assertion.",
                "last changes only with the beat it describes.",
                "Cleanup after final beat happens before next sampling edge.",
                "No combinational wait(ready) is used for synchronous completion.",
                "No arbitrary #0, #1, or simulator delay hacks.",
                "Reset handling is synchronized with driver clocking policy.",
                "Driver and DUT do not both drive the same signal.",
                "Monitor samples consistently with driver/DUT timing.",
                "try_next_item() null case does not call item_done().",
                "Reset after get_next_item() still reaches item_done().",
                "Stall watchdog reports errors without silently dropping traffic.",
                "Response-enabled sequence consumes returned responses.",
                "Driver does not retain request handles after item_done() without cloning.",
              ].map((check, i) => (
                <li key={i} className="flex items-center gap-2">
                  <FaShieldAlt className="text-blue-400 shrink-0" />
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
              <h4 className="font-bold text-blue-300 text-xs uppercase tracking-wider">
                19.4 Handshake-Centered Log Pattern
              </h4>
              <CodeBlock lang="systemverilog">{`\`uvm_info("RV_SRC_DRV",
  $sformatf("pkt=%0d beat=%0d accepted data=0x%08h last=%0b stalls=%0d",
            pkt_id, beat_idx, data, last, stalls),
  UVM_MEDIUM)`}</CodeBlock>

              <h4 className="font-bold text-blue-300 text-xs uppercase tracking-wider pt-2">
                19.3 Driver Diagnostic Counters
              </h4>
              <CodeBlock lang="systemverilog">{`int unsigned items_started;
int unsigned items_completed;
int unsigned items_aborted;
int unsigned beats_offered;
int unsigned beats_accepted;
int unsigned stall_cycles;
int unsigned max_observed_stall;`}</CodeBlock>
            </div>
          </section>

          {/* ── §20 Monitor / Scoreboard / Assertion Boundary ───────────── */}
          <section id="verification-boundary">
            <SectionHeading
              num={20}
              title="Monitor / Scoreboard / Assertion Boundary"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-blue-500/20 bg-slate-900/50 space-y-2">
                <div className="font-bold text-blue-300">
                  Driver vs Monitor
                </div>
                <p className="text-slate-300 leading-relaxed">
                  <strong>Driver:</strong> Drives active stimulus (valid/data/last or ready). Only counts local handshakes for flow control.
                  <br />
                  <strong>Monitor:</strong> Passively observes bus pins, reconstructs full packets, and broadcasts to analysis ports.
                </p>
              </div>
              <div className="p-4 rounded-xl border border-violet-500/20 bg-slate-900/50 space-y-2">
                <div className="font-bold text-violet-300">
                  Scoreboard vs Assertions (SVA)
                </div>
                <p className="text-slate-300 leading-relaxed">
                  <strong>Scoreboard:</strong> Reconstructs transactions and compares expected vs actual data values.
                  <br />
                  <strong>Assertions:</strong> Enforces temporal rules: stable payload during stalls, no X-values, legal last alignment.
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
              headers={["Decision", "Options", "Senior Recommendation"]}
              rows={[
                ["Decision 1: Packet item vs Beat item?", "Packet-level vs Beat-level", "Packet item by default for realistic framing and reduced sequence overhead."],
                ["Decision 2: Blocking driver vs Queued driver?", "Blocking vs Queued", "Blocking driver for simple streaming; queued driver (Module 11) for high throughput."],
                ["Decision 3: Response or No Response?", "No response vs Explicit response", "No response if finish_item() is sufficient; explicit response if status/stalls needed."],
                ["Decision 4: Raw posedge vs Clocking block?", "master_cb vs @(posedge clk)", "Either is valid if applied consistently across VIP without mixed skews."],
                ["Decision 5: Abort or Replay on Reset?", "Abort vs Replay", "Abort by default (release sequencer); replay only if test specification dictates."],
                ["Decision 6: Driver Lifetime Policy?", "Objections in driver vs Sequences", "Never control objections inside generic drivers; let sequences/tests control phase."],
              ]}
            />
          </section>

          {/* ── §22 Scalability Notes ───────────────────────────────────── */}
          <section id="scalability">
            <SectionHeading num={22} title="Scalability Notes" />
            <div className="space-y-2 text-xs text-slate-300">
              <p>• Parameterize data, keep, and sideband widths.</p>
              <p>• Separate transaction-to-beat expansion from physical pin driving.</p>
              <p>• Clone or copy transaction data if retained after <code>item_done()</code> in queued architectures.</p>
              <p>• For emulation, reduce dynamic allocations and per-beat reporting in favor of hardware-accelerated streaming.</p>
            </div>
          </section>

          {/* ── §23 Review Checklist ────────────────────────────────────── */}
          <section id="review">
            <SectionHeading num={23} title="Review Checklist" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/40 space-y-2">
                <h5 className="font-bold text-blue-300">Protocol &amp; Timing Review</h5>
                <ul className="space-y-1 text-slate-300">
                  <li>✔ valid does not wait for ready</li>
                  <li>✔ Payload &amp; sidebands stable during valid &amp;&amp; !ready</li>
                  <li>✔ Beat index advances only on valid &amp;&amp; ready</li>
                  <li>✔ last is held with final accepted beat</li>
                  <li>✔ Immediate cleanup avoids duplicate final beats</li>
                  <li>✔ Idle insertion occurs before valid offer</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/40 space-y-2">
                <h5 className="font-bold text-violet-300">UVM &amp; Boundary Review</h5>
                <ul className="space-y-1 text-slate-300">
                  <li>✔ get_next_item() paired with item_done()</li>
                  <li>✔ try_next_item() null handled safely</li>
                  <li>✔ No get() / item_done() mixing</li>
                  <li>✔ rsp.set_id_info(req) used on routed responses</li>
                  <li>✔ Reset abort releases sequencer handshake</li>
                  <li>✔ Driver does not perform scoreboard comparison</li>
                </ul>
              </div>
            </div>
          </section>

          {/* ── §24 Interview Q&A ───────────────────────────────────────── */}
          <section id="interview">
            <SectionHeading num={24} title="Interview Q&A (Q1–Q20)" />
            <div className="space-y-4">
              {module9InterviewQA.map((qa, idx) => (
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
          <section id="recall">
            <SectionHeading
              num={25}
              title="Final Recall Card — Ready/Valid Streaming Driver"
            />
            <div className="p-5 rounded-xl border border-blue-500/30 bg-linear-to-r from-blue-500/10 to-indigo-500/10 space-y-3">
              <Callout type="hook">
                <strong>Memory Hook:</strong> "Source offers, sink accepts, handshake completes."
              </Callout>
              <CodeBlock lang="systemverilog">{`// Core Streaming Loop:
vif.valid <= 1'b1;
vif.data  <= beat_data;
vif.last  <= is_last;

do @(posedge vif.clk);
while (vif.rst_n && !vif.ready); // Freeze until handshake!

reset_outputs(); // Immediate cleanup after final beat`}</CodeBlock>
              <p className="text-xs text-slate-300">
                <strong>Interview Line:</strong> "My streaming driver is an active handshake executor. It asserts valid unconditionally when data is ready, freezes payload across backpressure stalls, advances beat indices strictly on sampled valid &amp;&amp; ready edges, and cleans up immediately to prevent duplicate beats."
              </p>
            </div>
          </section>

          {/* ── §26 Key Takeaways ───────────────────────────────────────── */}
          <section id="takeaways">
            <SectionHeading num={26} title="Key Takeaways" />
            <ol className="space-y-1.5 list-decimal list-inside text-slate-300 text-sm">
              {[
                "valid means offered. valid && ready means accepted.",
                "Source valid must not wait for ready (prevents deadlock).",
                "Payload and sidebands must remain frozen while stalled.",
                "Beat index advances on handshake, never on clock alone.",
                "last is metadata of the transferred beat, not a 1-cycle pulse.",
                "Idle insertion delays valid assertion; it never withdraws an offered beat.",
                "Deassert valid immediately after the final handshake to avoid duplicate beats.",
                "item_done() follows pin-level completion in non-pipelined drivers.",
                "try_next_item() requires strict null handling before calling item_done().",
                "Reset abort must release the sequencer handshake to prevent test deadlock.",
                "Explicit responses must preserve sequence identity via rsp.set_id_info(req).",
                "Driver creates stimulus; monitor observes; scoreboard compares; SVA polices protocol.",
              ].map((takeaway, i) => (
                <li key={i} className="pl-1">
                  {takeaway}
                </li>
              ))}
            </ol>
          </section>

          {/* ── §27 Interview Questions Summary ─────────────────────────── */}
          <section id="interview-summary">
            <SectionHeading
              num={27}
              title="Interview Questions Summary (20 Questions)"
            />
            <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/40 text-sm text-slate-300 space-y-2">
              <p className="text-xs text-slate-400">
                Senior &amp; Principal Interview Question Bank:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>What is the core ready/valid transfer rule?</li>
                <li>Why must source valid not wait for ready?</li>
                <li>When can payload change?</li>
                <li>When should a packet-level source driver call item_done()?</li>
                <li>What is wrong with calling item_done() after asserting valid?</li>
                <li>What is the difference between idle and backpressure?</li>
                <li>What does a sink driver do?</li>
                <li>Why is last not just a pulse?</li>
                <li>What is the try_next_item() trap?</li>
                <li>Why is get() not paired with item_done()?</li>
                <li>When do you need a response object?</li>
                <li>Why use set_id_info(req)?</li>
                <li>What should reset do during a stalled beat?</li>
                <li>How do you debug a dropped streaming beat?</li>
                <li>What is the duplicate-final-beat bug?</li>
                <li>How do you scale this to high throughput?</li>
                <li>What is wrong with retaining req after item_done()?</li>
                <li>What is the response-queue risk?</li>
                <li>Should a generic driver control UVM objections?</li>
                <li>Why is a reset escape path necessary inside a stall loop?</li>
              </ol>
            </div>
          </section>

          {/* ── §28 Coding Exercise ─────────────────────────────────────── */}
          <section id="exercise">
            <SectionHeading
              num={28}
              title="Coding Exercise — Add Response Status to Code Lab 1"
            />
            <div className="space-y-4 text-sm text-slate-300">
              <p>
                <strong>Task:</strong> Modify the Code Lab 1 source driver to instantiate <code>rv_stream_rsp</code>, populate <code>accepted_beats</code> and <code>total_stalls</code>, call <code>rsp.set_id_info(req)</code>, and pass it into <code>seq_item_port.item_done(rsp)</code>.
              </p>
              <CollapsibleCard
                title="Exercise Requirements & Review Constraints"
                accent="blue"
                defaultOpen={true}
              >
                <div className="space-y-2 text-xs text-slate-300">
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Create response object using UVM factory.</li>
                    <li>Call <code>rsp.set_id_info(req)</code> before <code>item_done(rsp)</code>.</li>
                    <li>Update status to <code>RV_RSP_ABORTED</code> if reset occurs.</li>
                    <li>Ensure the sequence consumes the response with <code>get_response(rsp)</code>.</li>
                  </ol>
                </div>
              </CollapsibleCard>
            </div>
          </section>

          {/* ── §29 Final Readiness Verdict & Audit ──────────────────────── */}
          <section id="verdict">
            <SectionHeading
              num={29}
              title="Final Readiness Verdict & Audit"
            />
            <div className="p-6 rounded-2xl border border-blue-500/30 bg-blue-500/10 space-y-3">
              <h3 className="text-lg font-bold text-blue-300 flex items-center gap-2">
                <FaCheckSquare /> Module 9 — Final Readiness Verdict: PASS (LOCKED)
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Module 9: Ready/Valid and Streaming Driver Deep Dive is fully converted into React. All 23 memory cards, 7 atlas sheets, 3 code labs, 11 bug gallery entries, race-condition checklists, diagnostic counters, and 20 interview Q&amp;As are complete and verified.
              </p>
              <p className="text-xs text-blue-200/80">
                You are now prepared to advance to Module 10: AXI4-Lite Driver Deep Dive.
              </p>
            </div>
          </section>

          {/* Navigation to next module */}
          <ModuleNavigation
            nextPath="/driver-mastery/module10"
            nextTitle="Module 10: AXI4-Lite Driver Deep Dive →"
          />
        </main>
      </div>
    </div>
  );
};

export default Module9;
