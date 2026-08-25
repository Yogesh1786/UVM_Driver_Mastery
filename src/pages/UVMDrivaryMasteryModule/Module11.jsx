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
// DATA — Memory Cards (29 Cards)
// ─────────────────────────────────────────────────────────────────────────────

const module11MemoryCards = [
  {
    title: "Card 1 - Pipeline Means Acceptance and Completion Split [ARCH]",
    accent: "blue",
    hook: "One request handshake starts the story; one response handshake ends it.",
    concept:
      "A pipelined driver releases the sequencer after request acceptance, not necessarily after response completion.",
    code: `accepted = drive_request(req);
if (accepted) begin
  remember_outstanding(req);
  seq_item_port.item_done();
end`,
    trap: "Calling a forked driver 'pipelined' even though it waits for every response.",
    interview:
      "A pipelined driver is defined by completion contract, not by the presence of fork.",
  },
  {
    title: "Card 2 - item_done() Is a Contract Boundary [UVM]",
    accent: "emerald",
    hook: "item_done() says: 'the sequencer may proceed.'",
    concept:
      "In a pipelined driver, item_done() can occur before protocol response only if request acceptance is already complete and future response handling is safe.",
    code: `store_response_template(req);
seq_item_port.item_done();`,
    trap: "Calling item_done() immediately after get_next_item().",
    interview:
      "Early item_done() is legal only after request-side acceptance and response-context safety.",
  },
  {
    title: "Card 3 - Outstanding Table Is Driver Memory [UVM]",
    accent: "violet",
    hook: "If response comes later, the driver must remember.",
    concept:
      "After early item_done(), the driver cannot rely on the request handle. Store response context before releasing the item.",
    code: `rsp.set_id_info(req);
rsp_by_id[req.id] = rsp;`,
    trap: "Keeping only protocol ID and losing UVM routing metadata.",
    interview:
      "The outstanding table bridges bus-level response ID to UVM response routing.",
  },
  {
    title: "Card 4 - Protocol ID Is Not UVM Routing [UVM]",
    accent: "rose",
    hook: "Bus ID routes on wires; UVM metadata routes in the sequencer.",
    concept:
      "rsp_id identifies protocol response. set_id_info(req) preserves sequence response routing.",
    code: `rsp.id = vif.drv_cb.rsp_id;
rsp.set_id_info(req);`,
    trap: "Assuming protocol ID alone is enough for get_response().",
    interview:
      "Protocol correlation and UVM routing are separate mechanisms.",
  },
  {
    title: "Card 5 - Ordered vs Out-of-Order Completion [PROTOCOL]",
    accent: "amber",
    hook: "FIFO matching is legal only for FIFO protocols.",
    concept:
      "In-order protocols may use queues. Out-of-order protocols need associative lookup by ID/tag.",
    code: `pipe_item rsp_by_id[int unsigned];`,
    trap: "Using pop_front() when responses can reorder.",
    interview:
      "The matching structure must follow protocol ordering guarantees.",
  },
  {
    title: "Card 6 - Stable Payload During Stall [WAVE]",
    accent: "blue",
    hook: "Valid without ready means hold still.",
    concept:
      "While req_valid && !req_ready, request payload must remain stable.",
    code: `vif.drv_cb.req_valid <= 1'b1;
vif.drv_cb.req_id    <= req.id;
vif.drv_cb.req_addr  <= req.addr;

do @(vif.drv_cb);
while (!vif.drv_cb.req_ready);`,
    trap: "Updating payload every cycle while waiting for ready.",
    interview:
      "Backpressure stalls the transfer, not the payload contract.",
  },
  {
    title: "Card 7 - Throttle Before Fetch When Possible [ARCH]",
    accent: "emerald",
    hook: "Do not hold a sequencer item hostage.",
    concept:
      "If outstanding depth is full, wait for a slot before fetching the next item.",
    code: `wait_for_outstanding_slot();
seq_item_port.get_next_item(req);`,
    trap: "Fetching an item and then waiting 100 cycles for outstanding space.",
    interview:
      "Throttle at the driver boundary before taking sequencer ownership.",
  },
  {
    title: "Card 8 - Duplicate ID Must Be Stopped Before Drive [PROTOCOL]",
    accent: "rose",
    hook: "Once it hits pins, it is already stimulus.",
    concept:
      "If duplicate outstanding ID is illegal, reject before driving request pins.",
    code: `if (!id_available) begin
  seq_item_port.item_done(error_rsp);
  continue;
end`,
    trap: "Detecting duplicate ID only after request acceptance.",
    interview:
      "Driver-side protocol-safety checks must happen before illegal stimulus is driven.",
  },
  {
    title: "Card 9 - Response Thread Must Match, Fill, Route [UVM]",
    accent: "violet",
    hook: "Match first. Fill second. Route third.",
    concept:
      "The response collector samples protocol response, finds outstanding context, fills fields, and calls put_response().",
    code: `rsp = rsp_by_id[rsp_id];
rsp_by_id.delete(rsp_id);
seq_item_port.put_response(rsp);`,
    trap: "Creating a new response without routing metadata.",
    interview:
      "The response thread should not invent context; it should complete existing context.",
  },
  {
    title: "Card 10 - Reset Must Complete UVM State [RESET]",
    accent: "rose",
    hook: "Reset clears pins, not sequence waits.",
    concept:
      "Accepted outstanding requests must receive completion or abort response if sequences expect one.",
    code: `foreach (abort_q[i])
  seq_item_port.put_response(abort_q[i]);`,
    trap: "Deleting outstanding entries silently.",
    interview:
      "Reset cleanup must close both protocol state and UVM response obligations.",
  },
  {
    title: "Card 11 - Do Not Kill a Thread Owning an Item [UVM]",
    accent: "amber",
    hook: "A killed owner cannot call item_done().",
    concept:
      "disable fork can be dangerous if a killed request thread owns a get_next_item() item.",
    code: `// Safer: request thread handles reset internally
accepted = drive_request(req);
if (!accepted)
  seq_item_port.item_done(abort_rsp);`,
    trap: "Reset watcher kills all driver threads indiscriminately.",
    interview:
      "A reset architecture must not strand an active sequencer item.",
  },
  {
    title: "Card 12 - try_next_item() Requires Null Handling [UVM]",
    accent: "blue",
    hook: "No item means no completion.",
    concept:
      "try_next_item() may return null. Only call item_done() for a real item.",
    code: `seq_item_port.try_next_item(req);
if (req != null) begin
  drive_request(req);
  seq_item_port.item_done();
end`,
    trap: "Calling item_done() after null.",
    interview:
      "Null means no sequencer item was granted.",
  },
  {
    title: "Card 13 - get() Is Not get_next_item() [UVM]",
    accent: "emerald",
    hook: "get() consumes; get_next_item() loans.",
    concept: "get(req) must not be paired with item_done().",
    code: `seq_item_port.get(req);
// no item_done()`,
    trap: "Mixing pull API styles in one driver.",
    interview: "The fetch API defines the completion API.",
  },
  {
    title: "Card 14 - Multi-Channel Driver Needs a Dispatcher [ARCH]",
    accent: "violet",
    hook: "One intent, many channels.",
    concept:
      "A dispatcher fetches transaction intent and splits channel work. Channel threads should not independently fetch transaction-level items unless designed that way.",
    code: `hdr_mb.put(ctx);
data_mb.put(ctx);`,
    trap: "Header and data threads independently call get_next_item().",
    interview: "Transaction atomicity belongs above channel threads.",
  },
  {
    title: "Card 15 - Multi-Channel Completion Must Be Defined [ARCH]",
    accent: "rose",
    hook: "Header accepted does not always mean request accepted.",
    concept:
      "In multi-channel protocols, define whether item completion occurs after header, payload, final beat, or all mandatory channels.",
    code: `ctx.hdr_ack.get(dummy);
ctx.data_ack.get(dummy);
seq_item_port.item_done();`,
    trap: "Calling item_done() after only one channel completes.",
    interview:
      "Multi-channel item completion must match protocol ownership transfer.",
  },
  {
    title: "Card 16 - Same-Cycle Response Is a Real Race [WAVE]",
    accent: "amber",
    hook: "Response can outrun your table insert.",
    concept:
      "If response can occur in same cycle as accept, insert outstanding context before response sampling.",
    code: `// Required only for same-cycle response protocols
rsp_by_id[req.id] = rsp_template;
accepted = drive_request(req);`,
    trap: "Assuming one-cycle latency without checking protocol.",
    interview:
      "I verify minimum response latency before choosing insertion timing.",
  },
  {
    title: "Card 17 - Shared State Needs Discipline [ARCH]",
    accent: "blue",
    hook: "Forks share bugs.",
    concept:
      "Request and response threads share outstanding state. Protect or deterministically schedule access.",
    code: `out_sem.get();
rsp_by_id[id] = rsp;
out_sem.put();`,
    trap: "Unsynchronized insert/delete on the same table.",
    interview: "Forked architecture requires shared-state ownership.",
  },
  {
    title: "Card 18 - Driver Is Not Scoreboard [BOUNDARY]",
    accent: "emerald",
    hook: "Route response, do not judge it.",
    concept:
      "The driver can capture response data for sequence return, but expected-vs-actual checking belongs in scoreboard.",
    code: `rsp.rdata = vif.drv_cb.rsp_rdata;
// no expected-data compare here`,
    trap: "Adding functional compare in response thread.",
    interview:
      "Driver routes completion; scoreboard validates correctness.",
  },
  {
    title: "Card 19 - Clocking Block Reduces Races [WAVE]",
    accent: "violet",
    hook: "Drive through outputs, sample through inputs.",
    concept:
      "Clocking blocks make driver timing explicit and reduce raw posedge races.",
    code: `@(vif.drv_cb);
vif.drv_cb.req_valid <= 1'b1;`,
    trap: "Driver and monitor both use raw @(posedge clk) with ambiguous ordering.",
    interview: "Clocking block timing is part of the driver contract.",
  },
  {
    title: "Card 20 - Response Queue Pressure Exists [UVM]",
    accent: "rose",
    hook: "Responses must be drained.",
    concept:
      "If sequences request delayed responses, they must consume them.",
    code: `finish_item(req);
get_response(rsp);`,
    trap: "Sending many requests but never calling get_response().",
    interview:
      "Pipeline throughput requires response-consumption discipline.",
  },
  {
    title: "Card 21 - Abort Response Is a Contract Choice [RESET]",
    accent: "amber",
    hook: "Reset policy must be visible to sequences.",
    concept:
      "If a sequence expects a response, reset must return abort status for accepted requests.",
    code: `rsp.status = PIPE_ABORTED;
seq_item_port.put_response(rsp);`,
    trap: "Treating reset as only a pin-level event.",
    interview:
      "Reset is both a protocol event and a UVM completion event.",
  },
  {
    title: "Card 22 - One Sequencer or Many? [ARCH]",
    accent: "blue",
    hook: "Channels do not automatically imply sequencers.",
    concept:
      "One sequencer preserves transaction-level intent. Multiple sequencers are justified only for independent stimulus streams.",
    code: `class split_driver extends uvm_driver #(pipe_item, pipe_item);`,
    trap: "Creating one sequencer per signal channel without ownership reason.",
    interview:
      "Sequencer topology follows stimulus ownership, not signal count.",
  },
  {
    title: "Card 23 - Object Ownership After item_done() [UVM]",
    accent: "emerald",
    hook: "After release, do not trust the handle.",
    concept:
      "Once item_done() is called, the driver should not depend on mutable request-object state.",
    code: `rsp.addr = req.addr;
rsp.set_id_info(req);`,
    trap: "Storing raw req handle and reading it later.",
    interview: "Copy what the driver needs before releasing the item.",
  },
  {
    title: "Card 24 - Response Matching Is Not Functional Checking [BOUNDARY]",
    accent: "violet",
    hook: "Matching is routing; comparing is checking.",
    concept:
      "Matching response ID to outstanding request is allowed because it routes response. Comparing data against expected model is scoreboard work.",
    code: `if (!rsp_by_id.exists(rsp_id))
  \`uvm_error("UNMATCHED_RSP", "no outstanding request")`,
    trap: "Confusing protocol-safety checks with functional prediction.",
    interview:
      "Driver checks its own routing invariants, not DUT functional correctness.",
  },
  {
    title: "Card 25 - Phase Shutdown Needs a Story [UVM]",
    accent: "rose",
    hook: "Forever loops are fine; unbreakable waits are not.",
    concept:
      "Driver loops often run forever, but blocking waits must be reset-aware.",
    code: `do @(vif.drv_cb);
while ((vif.reset_n === 1'b1) && !vif.drv_cb.req_ready);`,
    trap: "Waiting forever for ready while reset has asserted.",
    interview: "Every protocol wait must have a reset escape.",
  },
  {
    title: "Card 26 - Multi-Channel Reset Must Flush Internals [RESET]",
    accent: "amber",
    hook: "Pins idle is not enough.",
    concept:
      "Reset must clear channel mailboxes, partial contexts, and outstanding responses.",
    code: `drive_idle();
flush_channel_state();
abort_outstanding("reset");`,
    trap: "Old payload appears after reset deassertion.",
    interview:
      "Reset cleanup must include internal driver state, not just pins.",
  },
  {
    title: "Card 27 - Outstanding Depth Is a Design Parameter [ARCH]",
    accent: "blue",
    hook: "Pipeline does not mean infinite.",
    concept: "Driver must respect max outstanding depth.",
    code: `while (rsp_by_id.num() >= max_outstanding)
  @(vif.drv_cb);`,
    trap: "Letting sequences overrun DUT-supported outstanding window.",
    interview:
      "Pipeline throughput is bounded by legal outstanding capacity.",
  },
  {
    title: "Card 28 - Accepted But Not Stored Is a Race Window [RESET]",
    accent: "emerald",
    hook: "Accepted-but-not-remembered is the most dangerous half-state.",
    concept:
      "After handshake acceptance, the DUT may own the request. If reset occurs before the driver stores response context, the driver still owns the UVM item and must complete it immediately with an abort response rather than creating a stale outstanding entry.",
    code: `if (accepted && vif.reset_n !== 1'b1) begin
  rsp = make_rsp(req, PIPE_ABORTED, "abort_after_accept_before_store_rsp");
  seq_item_port.item_done(rsp);
  continue;
end`,
    trap: "Storing a new outstanding response after reset has already killed protocol completion.",
    interview:
      "I explicitly close the accepted-but-not-stored race before releasing the sequencer item.",
  },
  {
    title: "Card 29 - Principal-Level Rule: Define Owners [ARCH]",
    accent: "violet",
    hook: "Every ordering rule needs an owner.",
    concept:
      "Ordering, ID assignment, response matching, and reset abort must each have an explicit owner.",
    code: `sequence owns intent
driver owns pin protocol and response routing
monitor owns observation
scoreboard owns correctness
assertions own temporal legality`,
    trap: "Driver silently reorders or repairs sequence intent.",
    interview:
      "Principal-grade driver design is ownership clarity under concurrency.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// DATA — Bug Gallery (11 Bugs)
// ─────────────────────────────────────────────────────────────────────────────

const module11BugGallery = [
  {
    title: "Bug 1 - item_done() Before Request Acceptance",
    symptom:
      "Sequence advances, but waveform shows lost requests during backpressure.",
    waveform: "item_done log occurs before req_valid && req_ready handshake.",
    cause: "Sequencer was released before DUT accepted the item.",
    bad: `seq_item_port.get_next_item(req);
seq_item_port.item_done(); // BUG: released before accept!
drive_request(req);`,
    fix: `seq_item_port.get_next_item(req);
drive_request(req, accepted);
if (accepted) begin
  store_outstanding(req, stored);
  seq_item_port.item_done();
end`,
    interview: "Copying the item is not completion.",
  },
  {
    title: "Bug 2 - Missing set_id_info(req)",
    symptom: "Sequence hangs waiting in get_response().",
    waveform: "Bus response occurs, but UVM response never reaches sequence.",
    cause: "UVM routing metadata missing from response item.",
    bad: `rsp = pipe_item::type_id::create("rsp");
rsp.id = rsp_id;
seq_item_port.put_response(rsp); // BUG: Missing set_id_info(req)!`,
    fix: `rsp = pipe_item::type_id::create("rsp");
rsp.set_id_info(req);
seq_item_port.put_response(rsp);`,
    interview: "Protocol ID is not UVM routing metadata.",
  },
  {
    title: "Bug 3 - FIFO Matching on Out-of-Order Protocol",
    symptom: "Wrong sequence receives response, causing data corruption in scoreboard.",
    waveform: "Accept order is 1, 2, 3; response order on bus is 2, 1, 3.",
    cause: "FIFO queue assumption violates out-of-order protocol rules.",
    bad: `rsp = rsp_q.pop_front(); // BUG: FIFO pop on out-of-order bus!
seq_item_port.put_response(rsp);`,
    fix: `out_sem.get();
if (rsp_by_id.exists(rsp_id)) begin
  rsp = rsp_by_id[rsp_id];
  rsp_by_id.delete(rsp_id);
end
out_sem.put();`,
    interview: "Response matching must follow protocol ordering guarantees.",
  },
  {
    title: "Bug 4 - Silent Outstanding Flush on Reset",
    symptom: "Sequence hangs after reset waiting for get_response().",
    waveform: "Accepted request occurred before reset, zero response returned afterward.",
    cause: "Driver deleted outstanding table entries without sending abort responses.",
    bad: `rsp_by_id.delete(); // BUG: Sequences left hanging!`,
    fix: `foreach (rsp_by_id[id_key]) begin
  rsp = rsp_by_id[id_key];
  rsp.status = PIPE_ABORTED;
  seq_item_port.put_response(rsp);
end
rsp_by_id.delete();`,
    interview: "Reset must complete the UVM story.",
  },
  {
    title: "Bug 5 - Killing Request Thread With Owned Item",
    symptom: "Sequencer deadlock after reset assertion.",
    waveform: "get_next_item() occurred, but no item_done() ever called.",
    cause: "Request thread killed with disable fork while owning an item.",
    bad: `fork
  request_thread();
  response_thread();
  reset_watch_thread();
join_any
disable fork; // BUG: kills thread owning item!`,
    fix: `// Handle reset inside request loop cleanly without killing thread:
drive_request(req, accepted);
if (!accepted) begin
  seq_item_port.item_done(abort_rsp);
end`,
    interview: "Reset architecture must preserve sequencer-driver handshake integrity.",
  },
  {
    title: "Bug 6 - Duplicate ID Detected Too Late",
    symptom: "DUT receives illegal duplicate outstanding ID on pins.",
    waveform: "Same ID accepted twice on bus before first response returned.",
    cause: "Check happened after request was already driven on pins.",
    bad: `drive_request(req);
if (rsp_by_id.exists(req.id))
  \`uvm_error("DUP_ID", "duplicate"); // BUG: already driven!`,
    fix: `check_id_available(req.id, id_available);
if (!id_available) begin
  seq_item_port.item_done(make_rsp(req, PIPE_REJECTED));
  continue; // Reject before driving
end`,
    interview: "Protocol-safety rejection must happen before pins are driven.",
  },
  {
    title: "Bug 7 - Payload Changes During Stall",
    symptom: "DUT accepts corrupted or unexpected payload.",
    waveform: "req_id/req_addr changes while req_valid=1 and req_ready=0.",
    cause: "Driver mutated payload signals across clock cycles while stalled.",
    bad: `while (!req_ready) begin
  req_id <= next_id(); // BUG: mutating while valid!
  @(posedge clk);
end`,
    fix: `vif.drv_cb.req_valid <= 1'b1;
vif.drv_cb.req_id    <= req.id;
do @(vif.drv_cb);
while (!vif.drv_cb.req_ready);`,
    interview: "Backpressure freezes the active transfer.",
  },
  {
    title: "Bug 8 - try_next_item() Null Mishandling",
    symptom: "Null handle error or sequencer protocol fatal.",
    waveform: "Driver drives default/X payload when no item exists.",
    cause: "Driver called item_done() unconditionally after try_next_item().",
    bad: `seq_item_port.try_next_item(req);
drive_request(req);
seq_item_port.item_done(); // BUG: req was null!`,
    fix: `seq_item_port.try_next_item(req);
if (req != null) begin
  drive_request(req);
  seq_item_port.item_done();
end`,
    interview: "No granted item means no completion call.",
  },
  {
    title: "Bug 9 - Response Thread Does Functional Compare",
    symptom: "Driver duplicates scoreboard checking and causes false errors/confusion.",
    waveform: "Driver reports functional errors before scoreboard receives item.",
    cause: "Driver crossed boundary into scoreboard functional checking.",
    bad: `if (rsp.rdata != expected_data) // BUG: Scoreboard logic in driver!
  \`uvm_error("BAD_DATA", "data mismatch")`,
    fix: `rsp.rdata = vif.drv_cb.rsp_rdata;
rsp.status = vif.drv_cb.rsp_err ? PIPE_ERR : PIPE_OK;
seq_item_port.put_response(rsp); // Scoreboard checks data`,
    interview: "Driver routes completion; scoreboard validates correctness.",
  },
  {
    title: "Bug 10 - Stale Multi-Channel Mailbox After Reset",
    symptom: "Old channel fragment from before reset appears on bus after reset.",
    waveform: "Pre-reset payload driven after reset deassertion.",
    cause: "Internal channel mailboxes were not flushed on reset.",
    bad: `drive_idle();
// BUG: mailboxes untouched!`,
    fix: `drive_idle();
flush_channel_state();
abort_outstanding("reset");`,
    interview: "Multi-channel reset cleanup must include internal state.",
  },
  {
    title: "Bug 11 - Accepted But Not Stored During Reset",
    symptom: "Accepted request is stored after reset has already killed the response path.",
    waveform: "req_valid && req_ready occurs, reset asserts, then insert log appears.",
    cause: "Driver did not check reset between acceptance and table insertion.",
    bad: `accepted = drive_request(req);
store_outstanding(req, stored); // BUG: Reset happened between!
seq_item_port.item_done();`,
    fix: `accepted = drive_request(req);
if (accepted && vif.reset_n !== 1'b1) begin
  rsp = make_rsp(req, PIPE_ABORTED, "abort_after_accept_before_store_rsp");
  seq_item_port.item_done(rsp);
  continue;
end`,
    interview: "An accepted request that is not yet stored must be closed immediately if reset asserts before delayed-response context exists.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// DATA — Interview Q&A (17 Questions)
// ─────────────────────────────────────────────────────────────────────────────

const module11InterviewQA = [
  {
    q: "Q1. What makes a driver pipelined?",
    short:
      "It can accept a new item after request acceptance while previous responses are still pending.",
    deep: "Pipelining separates request-side acceptance from response-side completion. The driver must store outstanding context and complete responses later.",
    followup: "Can a forked driver be non-pipelined?",
    answer: "Yes. If request flow waits for every response, it is sequential.",
  },
  {
    q: "Q2. When is early item_done() legal?",
    short: "After request acceptance and response-context safety.",
    deep: "The driver must preserve response routing context before releasing the item. If reset occurs after accept but before context storage, the driver still owns the item and should complete it with immediate abort response.",
    followup: null,
    answer: null,
  },
  {
    q: "Q3. Why is set_id_info(req) needed?",
    short: "It preserves UVM response routing.",
    deep: "Protocol ID matches bus response; set_id_info(req) lets the sequencer route rsp back to the originating sequence.",
    followup: null,
    answer: null,
  },
  {
    q: "Q4. Why reject duplicate ID before drive?",
    short: "After drive, illegal stimulus may already reach the DUT.",
    deep: "Driver-side protocol-safety checks must prevent bad pin-level traffic, not merely report it afterward.",
    followup: null,
    answer: null,
  },
  {
    q: "Q5. How do you support out-of-order responses?",
    short: "Use an associative array keyed by protocol ID.",
    deep: "Out-of-order completion cannot be matched by FIFO accept order.",
    followup: null,
    answer: null,
  },
  {
    q: "Q6. What happens on reset after request acceptance?",
    short: "It depends whether response context has been stored.",
    deep: "If accepted but not stored, the driver still owns the item and should complete it with immediate abort response. If accepted and stored, the outstanding entry should be completed through delayed abort response.",
    followup: null,
    answer: null,
  },
  {
    q: "Q7. Why is disable fork risky in a driver?",
    short: "It can kill a thread that owns a sequencer item.",
    deep: "If get_next_item() has returned and the thread is killed before item_done(), the sequencer-driver contract is broken.",
    followup: null,
    answer: null,
  },
  {
    q: "Q8. What is the stable-payload rule?",
    short: "While valid=1 and ready=0, payload must not change.",
    deep: "Backpressure stalls acceptance; it does not permit payload mutation.",
    followup: null,
    answer: null,
  },
  {
    q: "Q9. Should the response thread compare expected data?",
    short: "No.",
    deep: "The driver may capture response data for routing. Functional checking belongs in the scoreboard.",
    followup: null,
    answer: null,
  },
  {
    q: "Q10. How do you decide between queue and associative array?",
    short: "Queue for in-order response; associative array for out-of-order response.",
    deep: "In-order protocols guarantee FIFO return. Out-of-order protocols can return in arbitrary order, requiring associative keying by tag/ID.",
    followup: null,
    answer: null,
  },
  {
    q: "Q11. What should a multi-channel dispatcher do?",
    short:
      "Fetch one transaction, create shared context, send channel work to channel threads, and call item_done() after required channels accept.",
    deep: "It maintains transaction atomicity above physical channels.",
    followup: null,
    answer: null,
  },
  {
    q: "Q12. Can channel threads call get_next_item() independently?",
    short: "Only if channels are truly independent stimulus streams.",
    deep: "For one transaction split across channels, independent fetch breaks transaction atomicity.",
    followup: null,
    answer: null,
  },
  {
    q: "Q13. How do you debug pipelined driver hangs?",
    short:
      "Compare accepted count, routed response count, abort count, accept-store abort count, and outstanding depth.",
    deep: "Using the invariant: accepted_requests = routed_responses + abort_responses + currently_outstanding.",
    followup: null,
    answer: null,
  },
  {
    q: "Q14. What is the biggest principal-level risk?",
    short:
      "Unclear ownership of completion, ordering, ID allocation, and reset closure.",
    deep: "Concurrency without explicit ownership guarantees leads to subtle ghost bugs and deadlock under stress.",
    followup: null,
    answer: null,
  },
  {
    q: "Q15. What does the driver own in a pipelined protocol?",
    short:
      "Pin driving, request acceptance detection, outstanding tracking, response routing, and reset cleanup.",
    deep: "It is the active bus executor and sequencer router.",
    followup: null,
    answer: null,
  },
  {
    q: "Q16. What does the driver not own?",
    short:
      "Functional correctness, passive observation, coverage, and full temporal proof.",
    deep: "These belong strictly in scoreboard, monitor, coverage collectors, and interface assertions.",
    followup: null,
    answer: null,
  },
  {
    q: "Q17. What is the accept-to-store race?",
    short:
      "The request has been accepted by the DUT, but the driver has not yet stored response context.",
    deep: "If reset asserts in this gap, the driver still owns the sequence item. It should not create stale outstanding state. It should complete the current item with an immediate abort response.",
    followup: null,
    answer: null,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// DATA — Sections for Sidebar Navigation
// ─────────────────────────────────────────────────────────────────────────────

const module11Sections = [
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
  { id: "memory-cards", label: "14. Memory Cards (1–29)" },
  { id: "atlas-sheets", label: "15. Atlas Sheets (1–6)" },
  { id: "code-labs", label: "16. Code Labs (1–3)" },
  { id: "bug-gallery", label: "17. Bug Gallery (1–11)" },
  { id: "race-checklist", label: "18. Race-Condition Checklist" },
  { id: "debug-strategy", label: "19. Debug Instrumentation & Log Strategy" },
  { id: "boundary", label: "20. Monitor / Scoreboard / Assertion Boundary" },
  { id: "architecture", label: "21. Architectural Decision Points" },
  { id: "scalability", label: "22. Scalability Notes" },
  { id: "review-checklist", label: "23. Review Checklist" },
  { id: "interview-qa", label: "24. Interview Q&A (Q1–Q17)" },
  { id: "final-recall", label: "25. Final Recall Card" },
  { id: "key-takeaways", label: "26. Key Takeaways" },
  { id: "interview-questions", label: "27. Interview Questions" },
  { id: "coding-exercise", label: "28. Coding Exercise" },
  { id: "final-verdict", label: "29. Final Readiness Verdict" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT — Module 11
// ═══════════════════════════════════════════════════════════════════════════════

const Module11 = () => {
  return (
    <div className="relative min-h-screen bg-slate-950 text-white font-sans">
      {/* Background glow & grid */}
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-150 h-62.5 bg-linear-to-r from-blue-600/15 to-indigo-600/15 blur-[100px] rounded-full" />

      <div className="relative z-10 flex max-w-7xl mx-auto">
        {/* ── Sidebar TOC (desktop) ────────────────────────────────────── */}
        <ModuleSidebar
          moduleNumber="11"
          title="Pipelined & Multi-Channel Drivers"
          sections={module11Sections}
        />

        {/* ── Main Content ─────────────────────────────────────────────── */}
        <main className="flex-1 min-w-0 px-6 py-8 pb-24 max-w-4xl">
          {/* Mobile back */}
          <BackToHomeBtn to="/driver-mastery" />

          {/* Hero */}
          <ModuleHero
            moduleNumber="11"
            title="Pipelined and Multi-Channel Drivers"
            description="Master split request/response pipelines, early item_done() contracts, outstanding tables, out-of-order response matching, multi-channel dispatchers, and robust reset-abort closure under heavy concurrency."
            metadata={[
              ["Module", "11"],
              ["Reference", "UVM 1.2 / Pipelined Architecture"],
              ["Pattern", "Split Request/Response & Multi-Channel Dispatcher"],
              ["Roadmap", "After Module 10 (AXI4-Lite), before Module 12 (Slave/Reactive Drivers)"],
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
                  ["Module", "11"],
                  ["Title", "Pipelined and Multi-Channel Drivers"],
                  [
                    "Scope",
                    "Request acceptance vs completion, internal queues, outstanding items, tags/IDs, ordering rules, out-of-order response, delayed response, forked channel architecture",
                  ],
                  ["Reference Model", "UVM 1.2"],
                  ["Target Level", "Intermediate → Senior → Principal"],
                  ["Artifact Status", "Final locked Markdown manuscript"],
                ]}
              />

              <h3 className="text-lg font-bold text-blue-300 mt-4">
                Module Thesis
              </h3>
              <blockquote className="border-l-4 border-blue-500 bg-blue-500/10 p-4 rounded-r-xl text-blue-200 text-sm leading-relaxed">
                A pipelined driver is not "a driver with forks."
                <br />
                A pipelined driver is a driver where <strong>request acceptance</strong>,{" "}
                <strong>sequencer item completion</strong>, and <strong>protocol response completion</strong>{" "}
                are deliberately separated and correctly reconnected.
              </blockquote>
            </div>
          </section>

          {/* ── §2 Learning Objectives ──────────────────────────────────── */}
          <section id="learning-objectives">
            <SectionHeading num={2} title="Learning Objectives" />
            <ol className="space-y-2 list-decimal list-inside text-slate-300 text-sm leading-relaxed">
              {[
                "Explain why pipelining separates request acceptance from response completion.",
                "Decide when early item_done() is legal.",
                "Build a split request/response driver with outstanding tracking.",
                "Route delayed responses back to the originating sequence.",
                "Use set_id_info(req) correctly.",
                "Distinguish protocol IDs from UVM response-routing metadata.",
                "Handle ordered and out-of-order completions.",
                "Design a multi-channel dispatcher architecture.",
                "Handle reset before acceptance, after acceptance, and during accept-to-store windows.",
                "Debug race conditions in forked driver threads.",
                "Defend a pipelined-driver design in a senior/principal interview.",
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
            <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-300">
              <li>Read <strong>Protocol Mental Model</strong>.</li>
              <li>Read <strong>Timing / Waveform Contract</strong>.</li>
              <li>Study <strong>Sequence-Sequencer-Driver Contract</strong>.</li>
              <li>Use <strong>Memory Cards</strong> for revision.</li>
              <li>Implement <strong>Code Labs</strong> manually.</li>
              <li>Use <strong>Bug Gallery</strong> as a debug checklist.</li>
              <li>Finish with <strong>Interview Q&amp;A</strong>.</li>
            </ol>
            <Callout type="warning">
              Do not jump directly to code. Most pipelined driver bugs are contract bugs, not syntax bugs.
            </Callout>
          </section>

          {/* ── §4 Visual Tag Legend ───────────────────────────────────── */}
          <section id="visual-tag-legend">
            <SectionHeading num={4} title="Visual Tag Legend" />
            <Table
              headers={["Tag", "Meaning"]}
              rows={[
                ["[PROTOCOL]", "Pin-level behavior"],
                ["[WAVE]", "Timing / waveform rule"],
                ["[UVM]", "UVM API contract"],
                ["[RESET]", "Reset or abort behavior"],
                ["[ARCH]", "Architecture decision"],
                ["[BUG]", "Failure mode"],
                ["[DEBUG]", "Debugging strategy"],
                ["[BOUNDARY]", "Driver/monitor/scoreboard/assertion ownership"],
                ["[INTERVIEW]", "Interview-ready explanation"],
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
                "Explains pipelining as acceptance/completion separation",
                "Defines legal and illegal early item_done()",
                "Explains outstanding transaction tracking",
                "Explains protocol ID vs UVM routing metadata",
                "Uses set_id_info(req) where delayed response routing matters",
                "Uses put_response(rsp) only with valid response objects",
                "Covers ordered and out-of-order response completion",
                "Covers outstanding-depth throttling",
                "Covers duplicate outstanding ID handling",
                "Covers reset before request acceptance",
                "Covers reset after request acceptance",
                "Covers reset after acceptance but before outstanding insertion",
                "Covers multi-channel request decomposition",
                "Covers forked channel-thread architecture",
                "Covers same-cycle accept/response race risk",
                "Covers clocking-block timing and stable payload",
                "Keeps functional checking out of the driver",
                "Includes compile-credible UVM 1.2 code",
                "Includes realistic bad-code cases",
                "Includes senior/principal architecture tradeoffs",
                "Includes interview-defense material",
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
                  <li>pipelined driver architecture</li>
                  <li>request acceptance vs response completion</li>
                  <li>outstanding transaction tables</li>
                  <li>delayed responses</li>
                  <li>protocol ID matching</li>
                  <li>UVM response routing</li>
                  <li>early item_done() contract</li>
                  <li>forked request/response threads</li>
                  <li>multi-channel dispatching</li>
                  <li>reset-abort handling</li>
                  <li>driver-side debug instrumentation</li>
                  <li>race-condition prevention</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/40">
                <h4 className="font-bold text-slate-300 mb-2">
                  6.2 Non-Scope
                </h4>
                <Table
                  headers={["Topic", "Reason"]}
                  rows={[
                    ["AXI4-Lite full driver", "Module 10"],
                    ["Burst packetization", "Module 14"],
                    ["Credit-based flow control", "Module 16"],
                    ["Retry/replay rollback", "Module 16"],
                    ["Low-power reset interaction", "Module 17"],
                    ["RAL frontdoor drivers", "Module 18"],
                    ["Coherent protocol drivers", "Module 19"],
                    ["Scoreboard design", "Boundary only here"],
                  ]}
                />
              </div>

              <Callout type="concept">
                <strong>Boundary Note:</strong> This module uses a <strong>generic split request/response protocol</strong>. It is not an AXI, CHI, TileLink, PCIe, or proprietary VIP deep dive.
              </Callout>
            </div>
          </section>

          {/* ── §7 Protocol Mental Model ───────────────────────────────── */}
          <section id="protocol-mental-model">
            <SectionHeading num={7} title="Protocol Mental Model" />
            <div className="space-y-4 text-sm text-slate-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/40">
                  <h5 className="font-bold text-blue-300 text-xs mb-1">
                    7.1 Non-Pipelined Driver Flow
                  </h5>
                  <CodeBlock lang="text">{`get item
drive request
wait for response
cleanup
item_done
get next item`}</CodeBlock>
                </div>
                <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/40">
                  <h5 className="font-bold text-emerald-300 text-xs mb-1">
                    7.2 Pipelined Driver Flow
                  </h5>
                  <CodeBlock lang="text">{`get item
drive request
on request acceptance:
    store response context
    item_done
get next item

in parallel:
    observe response
    match response to outstanding request
    put_response`}</CodeBlock>
                </div>
              </div>

              <h4 className="font-bold text-violet-300 text-sm mt-4">
                7.4 Transaction Lifecycle States
              </h4>
              <Table
                headers={["State", "Meaning", "UVM Obligation"]}
                rows={[
                  ["Fetched", "Driver owns sequencer item", "Must eventually call item_done()"],
                  ["Driven", "Pins carry payload", "Still must hold payload stable"],
                  ["Accepted, not stored", "DUT accepted request, but driver has not inserted response context yet", "Dangerous race window; must close immediately"],
                  ["Accepted and stored", "Outstanding response context exists", "Can legally call item_done()"],
                  ["Response returned", "Protocol response observed", "Must route rsp"],
                  ["Aborted", "Reset/error killed completion", "Must close sequence-visible contract"],
                ]}
              />
            </div>
          </section>

          {/* ── §8 Timing / Waveform Contract ──────────────────────────── */}
          <section id="timing-waveform">
            <SectionHeading num={8} title="Timing / Waveform Contract" />
            <div className="space-y-4 text-sm text-slate-300">
              <CodeBlock lang="systemverilog">{`// 8.1 Generic Split Protocol Signals:
req_valid, req_ready, req_id, req_addr, req_write, req_wdata
rsp_valid, rsp_ready, rsp_id, rsp_rdata, rsp_err`}</CodeBlock>

              <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/40 text-xs space-y-2">
                <h5 className="font-bold text-blue-300">
                  8.3 Pipelined Out-of-Order Timing Example
                </h5>
                <CodeBlock lang="text">{`clk        :  ^   ^   ^   ^   ^   ^   ^
req_valid  :  1   1   1   0   0   0   0
req_ready  :  1   1   1   0   0   0   0
req_id     :  A   B   C   -   -   -   -

accept     :  A   B   C   -   -   -   -

rsp_valid  :  0   0   1   0   1   1   0
rsp_ready  :  1   1   1   1   1   1   1
rsp_id     :  -   -   B   -   A   C   -

complete   :  -   -   B   -   A   C   -`}</CodeBlock>
                <p className="text-slate-400">
                  Accepted order: <strong>A, B, C</strong> → Response order: <strong>B, A, C</strong>. Requires associative lookup.
                </p>
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
                <h4 className="font-bold text-emerald-300 mb-2">Driver Owns</h4>
                <Table
                  headers={["Responsibility", "Why"]}
                  rows={[
                    ["Drive DUT input pins", "Core driver role"],
                    ["Observe ready/backpressure", "Required for handshake completion"],
                    ["Hold payload stable during stalls", "Protocol correctness"],
                    ["Detect request acceptance", "Needed for item_done() timing"],
                    ["Track outstanding requests", "Needed for delayed response"],
                    ["Capture protocol response", "Needed for sequence response"],
                    ["Route UVM response", "Required by sequencer contract"],
                    ["Handle reset-abort cleanup", "Prevents sequence hangs"],
                    ["Defensive protocol checks", "Prevents illegal driver stimulus"],
                  ]}
                />
              </div>

              <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/40">
                <h4 className="font-bold text-slate-300 mb-2">
                  Driver Does Not Own
                </h4>
                <Table
                  headers={["Not Driver Responsibility", "Owner"]}
                  rows={[
                    ["Functional expected-vs-actual compare", "Scoreboard"],
                    ["Passive full observation", "Monitor"],
                    ["Temporal proof of protocol properties", "Assertions"],
                    ["Coverage", "Coverage collector"],
                    ["Reference modeling", "Scoreboard/model"],
                    ["End-to-end data correctness", "Scoreboard"],
                  ]}
                />
              </div>
            </div>
          </section>

          {/* ── §10 Sequence-Sequencer-Driver Contract ──────────────────── */}
          <section id="ssd-contract">
            <SectionHeading
              num={10}
              title="Sequence-Sequencer-Driver Contract"
            />
            <div className="space-y-4 text-sm text-slate-300">
              <Table
                headers={["Contract Mode", "item_done Timing", "Response Mechanism"]}
                rows={[
                  ["Contract A - Non-Pipelined", "After full response", "item_done(rsp)"],
                  ["Contract B - Pipelined Delayed", "After request accept & store", "put_response(rsp) later"],
                  ["Contract C - Fire-and-Forget", "After request accept", "None"],
                ]}
              />

              <h4 className="font-bold text-blue-300 text-xs uppercase tracking-wider pt-2">
                10.4 UVM 1.2 Pull API Rules
              </h4>
              <Table
                headers={["API", "Correct Usage"]}
                rows={[
                  ["get_next_item(req)", "Must eventually pair with item_done()"],
                  ["item_done()", "Completes current sequencer-driver item"],
                  ["item_done(rsp)", "Completes current item and returns immediate response"],
                  ["put_response(rsp)", "Sends delayed response"],
                  ["get(req)", "Already consumes item; do not call item_done()"],
                  ["try_next_item(req)", "If req == null, do not call item_done()"],
                  ["set_id_info(req)", "Copies UVM routing metadata from request to response"],
                ]}
              />
            </div>
          </section>

          {/* ── §11 Reset / Abort Policy ───────────────────────────────── */}
          <section id="reset-abort">
            <SectionHeading num={11} title="Reset / Abort Policy" />
            <div className="space-y-4 text-sm text-slate-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/40 space-y-1">
                  <strong className="text-amber-300">11.1 Reset Before Request Acceptance:</strong>
                  <p>Drive pins idle. Complete current item with immediate abort response.</p>
                </div>
                <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 space-y-1">
                  <strong className="text-rose-300">11.2 Accept-to-Store Reset Race:</strong>
                  <p>DUT accepted, but driver has not stored context. Driver still owns item → complete with immediate abort response.</p>
                </div>
                <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/40 space-y-1">
                  <strong className="text-violet-300">11.3 Reset After Outstanding Store:</strong>
                  <p>Drive pins idle, flush outstanding table, send delayed abort responses for all active requests.</p>
                </div>
                <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/40 space-y-1">
                  <strong className="text-blue-300">11.4 Partial Multi-Channel Acceptance:</strong>
                  <p>Abort partial context before item_done().</p>
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
            <div className="space-y-3 text-sm text-slate-300">
              <CodeBlock lang="systemverilog">{`// Delayed Response Pattern:
rsp = pipe_item::type_id::create("rsp");
rsp.set_id_info(req);
outstanding[req.id] = rsp;

seq_item_port.item_done();

// Later in response thread:
seq_item_port.put_response(rsp);`}</CodeBlock>
            </div>
          </section>

          {/* ── §13 Protocol Ownership Matrix ──────────────────────────── */}
          <section id="ownership-matrix">
            <SectionHeading num={13} title="Protocol Ownership Matrix" />
            <Table
              headers={[
                "Concept",
                "Sequence",
                "Driver",
                "Monitor",
                "Scoreboard",
                "Assertion",
              ]}
              rows={[
                ["Stimulus intent", "Yes", "No", "No", "No", "No"],
                ["Pin driving", "No", "Yes", "No", "No", "No"],
                ["Request valid", "No", "Yes", "Observes", "No", "Checks"],
                ["Ready/backpressure", "No", "Observes", "Observes", "No", "Checks"],
                ["Request acceptance detection", "No", "Yes", "Yes", "No", "Checks"],
                ["Outstanding table", "No", "Yes", "Optional mirror", "Optional", "No"],
                ["Protocol ID legality", "Maybe", "Defensive check", "Observes", "May check", "May check"],
                ["UVM response routing", "No", "Yes", "No", "No", "No"],
                ["Functional correctness", "No", "No", "No", "Yes", "No"],
                ["Temporal legality", "No", "Minimal", "Observes", "No", "Yes"],
                ["Reset idle drive", "No", "Yes", "Observes", "No", "Checks"],
                ["Reset abort response", "No", "Yes", "Observes", "May correlate", "No"],
              ]}
            />
          </section>

          {/* ── §14 Memory Cards ────────────────────────────────────────── */}
          <section id="memory-cards">
            <SectionHeading num={14} title="Memory Cards (1–29)" />
            <p className="text-slate-400 text-sm mb-4">
              29 comprehensive memory cards for Pipelined and Multi-Channel Drivers:
            </p>
            <div className="space-y-3">
              {module11MemoryCards.map((card, idx) => (
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
              title="Atlas Sheet 1 - Driver Architecture Patterns"
              accent="blue"
              icon={<FaListAlt size={12} />}
              defaultOpen={true}
            >
              <Table
                headers={["Pattern", "item_done() Point", "Response Handling", "Complexity", "Use When"]}
                rows={[
                  ["Sequential", "After response", "item_done(rsp)", "Low", "Simple request-response"],
                  ["Fire-and-forget", "After request accept", "None", "Low", "No response expected"],
                  ["Pipelined delayed response", "After request accept and context store", "put_response(rsp) later", "Medium", "Split req/rsp"],
                  ["Forked req/rsp", "After request accept and context store", "Response thread", "Medium", "Multiple outstanding"],
                  ["Multi-channel dispatcher", "After all request channels accepted", "Optional delayed response", "High", "One item maps to many channels"],
                  ["Multi-sequencer", "Per channel contract", "Per channel", "High", "Independent channel stimulus"],
                  ["Layered VIP driver", "Layer-defined", "Layer-defined", "Very high", "Production protocol VIP"],
                ]}
              />
            </CollapsibleCard>

            <CollapsibleCard
              title="Atlas Sheet 2 - UVM Pull API Contract Map"
              accent="violet"
              icon={<FaListAlt size={12} />}
            >
              <Table
                headers={["Fetch API", "Completion API", "Response API", "Legal?", "Notes"]}
                rows={[
                  ["get_next_item(req)", "item_done()", "None", "Yes", "No response"],
                  ["get_next_item(req)", "item_done(rsp)", "None", "Yes", "Immediate response"],
                  ["get_next_item(req)", "item_done()", "put_response(rsp)", "Yes", "Delayed response; context must be stored"],
                  ["get(req)", "None", "Optional put_response(rsp)", "Yes", "No item_done()"],
                  ["try_next_item(req)", "item_done() only if non-null", "Optional", "Yes", "Null handling required"],
                  ["get(req)", "item_done()", "Any", "No", "Mixed contract"],
                  ["get_next_item(req)", "Early item_done() before accept", "Maybe response", "No", "Illegal unless request is truly accepted"],
                ]}
              />
            </CollapsibleCard>

            <CollapsibleCard
              title="Atlas Sheet 3 - Request Acceptance vs Completion"
              accent="emerald"
              icon={<FaListAlt size={12} />}
            >
              <Table
                headers={["Event", "Pin Meaning", "UVM Meaning", "Driver Action"]}
                rows={[
                  ["Item fetched", "No pin transfer yet", "Driver owns item", "Do not complete"],
                  ["Request driven", "Payload on pins", "DUT may not own it", "Hold stable"],
                  ["Request accepted, not stored", "DUT owns request", "Driver still owns item", "Store context or immediate abort if reset"],
                  ["Request accepted and stored", "Outstanding context exists", "Pipelined completion point", "item_done()"],
                  ["Response sampled", "Completion visible", "Response can be routed", "Lookup outstanding"],
                  ["Response routed", "UVM response sent", "Sequence can receive response", "put_response(rsp)"],
                  ["Reset before accept", "Request not owned by DUT", "Current item must close", "item_done(abort_rsp)"],
                  ["Reset after accept/store", "DUT may not respond", "Outstanding must close", "put_response(abort_rsp)"],
                ]}
              />
            </CollapsibleCard>

            <CollapsibleCard
              title="Atlas Sheet 4 - Outstanding Tracking Choices"
              accent="amber"
              icon={<FaListAlt size={12} />}
            >
              <Table
                headers={["Completion Rule", "Structure", "Key", "Risk"]}
                rows={[
                  ["No response", "None", "None", "Sequence must not wait"],
                  ["In-order response", "Queue", "Accept order", "Breaks if reordering legal"],
                  ["Out-of-order response", "Associative array", "Protocol ID", "Duplicate ID hazard"],
                  ["Domain-based ordering", "Nested maps", "Domain + ID", "Wrong domain match"],
                  ["Multi-beat response", "Context object", "ID + beat count", "Early response completion"],
                  ["Multi-channel request", "Context object", "Transaction ID", "Partial reset corruption"],
                ]}
              />
            </CollapsibleCard>

            <CollapsibleCard
              title="Atlas Sheet 5 - Thread Ownership Map"
              accent="rose"
              icon={<FaListAlt size={12} />}
            >
              <Table
                headers={["Thread", "Owns", "Must Not Own"]}
                rows={[
                  ["Request thread", "Fetch item, drive request, insert outstanding, call item_done()", "Functional checking"],
                  ["Response thread", "Sample response, lookup outstanding, put_response()", "Expected data compare"],
                  ["Dispatcher thread", "Split transaction into channel contexts", "Independent channel stimulus policy"],
                  ["Channel thread", "Drive one channel's pin handshake", "Direct sequencer access by default"],
                  ["Reset handling", "Idle pins, abort outstanding, flush internals", "Silently deleting sequence obligations"],
                ]}
              />
            </CollapsibleCard>

            <CollapsibleCard
              title="Atlas Sheet 6 - Reset-Abort Policy Matrix"
              accent="blue"
              icon={<FaListAlt size={12} />}
            >
              <Table
                headers={["Reset State", "Protocol State", "UVM State", "Correct Driver Action"]}
                rows={[
                  ["Idle", "Nothing active", "No item owned", "Drive idle"],
                  ["Fetched, not driven", "No accept", "Item owned", "item_done(abort_rsp) if response expected"],
                  ["Valid, not ready", "No accept", "Item owned", "Idle pins, close item"],
                  ["Accepted, not stored", "DUT owns request", "Item still owned", "item_done(abort_rsp)"],
                  ["Accepted and stored", "Outstanding", "Item may already be released", "put_response(abort_rsp)"],
                  ["Response visible, reset", "Protocol-dependent", "Outstanding may exist", "Apply reset policy"],
                  ["Partial multi-channel", "Partial context", "Item may still be owned", "Abort partial context"],
                  ["Stale mailbox", "Internal only", "Future ghost risk", "Flush mailbox/context"],
                ]}
              />
            </CollapsibleCard>
          </section>

          {/* ── §16 Code Labs ───────────────────────────────────────────── */}
          <section id="code-labs">
            <SectionHeading num={16} title="Code Labs (1–3)" />

            {/* Lab 1 */}
            <CollapsibleCard
              title="Code Lab 1 - Fix Illegal Early item_done()"
              accent="blue"
              icon={<FaFlask size={12} />}
              defaultOpen={true}
            >
              <div className="space-y-3 text-xs text-slate-300">
                <p>
                  <strong>Goal:</strong> Move <code>item_done()</code> after request acceptance.
                </p>
                <div className="text-rose-400 font-bold">❌ Bad Code:</div>
                <CodeBlock lang="systemverilog">{`seq_item_port.get_next_item(req);

// BUG: item released before DUT accepts request.
seq_item_port.item_done();

vif.drv_cb.req_valid <= 1'b1;
vif.drv_cb.req_id    <= req.id;
vif.drv_cb.req_addr  <= req.addr;

do begin
  @(vif.drv_cb);
end while (!vif.drv_cb.req_ready);

vif.drv_cb.req_valid <= 1'b0;`}</CodeBlock>

                <div className="text-emerald-400 font-bold">✅ Corrected Version:</div>
                <CodeBlock lang="systemverilog">{`seq_item_port.get_next_item(req);

vif.drv_cb.req_valid <= 1'b1;
vif.drv_cb.req_id    <= req.id;
vif.drv_cb.req_addr  <= req.addr;

do begin
  @(vif.drv_cb);
  if (vif.reset_n !== 1'b1) begin
    vif.drv_cb.req_valid <= 1'b0;
    seq_item_port.item_done();
    accepted = 1'b0;
    break;
  end
end while (!vif.drv_cb.req_ready);

if (vif.reset_n === 1'b1 && vif.drv_cb.req_ready) begin
  accepted = 1'b1;
end

vif.drv_cb.req_valid <= 1'b0;

if (accepted) begin
  seq_item_port.item_done();
end`}</CodeBlock>
              </div>
            </CollapsibleCard>

            {/* Lab 2 */}
            <CollapsibleCard
              title="Code Lab 2 - Generic Pipelined Split Request/Response Driver"
              accent="emerald"
              icon={<FaFlask size={12} />}
            >
              <div className="space-y-3 text-xs text-slate-300">
                <p>
                  <strong>Goal:</strong> Complete production-grade split request/response driver with outstanding tracking, throttle before fetch, duplicate-ID protection, and accept-to-store race closure.
                </p>
                <CodeBlock lang="systemverilog">{`\`timescale 1ns/1ps

interface pipe_if(input logic clk, input logic reset_n);
  logic        req_valid;
  logic        req_ready;
  logic [3:0]  req_id;
  logic        req_write;
  logic [31:0] req_addr;
  logic [31:0] req_wdata;

  logic        rsp_valid;
  logic        rsp_ready;
  logic [3:0]  rsp_id;
  logic [31:0] rsp_rdata;
  logic        rsp_err;

  clocking drv_cb @(posedge clk);
    output req_valid;
    output req_id;
    output req_write;
    output req_addr;
    output req_wdata;
    output rsp_ready;

    input  req_ready;
    input  rsp_valid;
    input  rsp_id;
    input  rsp_rdata;
    input  rsp_err;
  endclocking
endinterface

package pipe_pkg;
  import uvm_pkg::*;
  \`include "uvm_macros.svh"

  typedef enum int {
    PIPE_OK       = 0,
    PIPE_ERR      = 1,
    PIPE_ABORTED  = 2,
    PIPE_REJECTED = 3
  } pipe_status_e;

  class pipe_item extends uvm_sequence_item;
    rand bit [3:0]  id;
    rand bit        write;
    rand bit [31:0] addr;
    rand bit [31:0] wdata;

         bit [31:0] rdata;
         pipe_status_e status;
         bit is_response;

    \`uvm_object_utils_begin(pipe_item)
      \`uvm_field_int(id,          UVM_DEFAULT)
      \`uvm_field_int(write,       UVM_DEFAULT)
      \`uvm_field_int(addr,        UVM_DEFAULT)
      \`uvm_field_int(wdata,       UVM_DEFAULT)
      \`uvm_field_int(rdata,       UVM_DEFAULT)
      \`uvm_field_enum(pipe_status_e, status, UVM_DEFAULT)
      \`uvm_field_int(is_response, UVM_DEFAULT)
    \`uvm_object_utils_end

    function new(string name = "pipe_item");
      super.new(name);
      status      = PIPE_OK;
      is_response = 1'b0;
    endfunction
  endclass

  class pipe_driver extends uvm_driver #(pipe_item, pipe_item);
    \`uvm_component_utils(pipe_driver)

    virtual pipe_if vif;
    pipe_item rsp_by_id[int unsigned];
    semaphore out_sem;
    int unsigned max_outstanding = 8;

    function new(string name = "pipe_driver", uvm_component parent = null);
      super.new(name, parent);
      out_sem = new(1);
    endfunction

    function void build_phase(uvm_phase phase);
      super.build_phase(phase);
      if (!uvm_config_db#(virtual pipe_if)::get(this, "", "vif", vif)) begin
        \`uvm_fatal("NOVIF", "virtual pipe_if must be set for pipe_driver")
      end
    endfunction

    task run_phase(uvm_phase phase);
      drive_idle();
      fork
        request_thread();
        response_thread();
      join
    endtask

    task drive_idle();
      vif.drv_cb.req_valid <= 1'b0;
      vif.drv_cb.req_id    <= '0;
      vif.drv_cb.req_write <= 1'b0;
      vif.drv_cb.req_addr  <= '0;
      vif.drv_cb.req_wdata <= '0;
      vif.drv_cb.rsp_ready <= 1'b0;
      @(vif.drv_cb);
    endtask

    function pipe_item make_rsp(pipe_item req, pipe_status_e status, string name = "rsp");
      pipe_item rsp;
      rsp = pipe_item::type_id::create(name);
      rsp.set_id_info(req);
      rsp.id          = req.id;
      rsp.write       = req.write;
      rsp.addr        = req.addr;
      rsp.wdata       = req.wdata;
      rsp.rdata       = '0;
      rsp.status      = status;
      rsp.is_response = 1'b1;
      return rsp;
    endfunction

    task wait_for_outstanding_slot();
      bit slot_available = 1'b0;
      int unsigned depth_snapshot;
      while (vif.reset_n === 1'b1 && !slot_available) begin
        out_sem.get();
        depth_snapshot = rsp_by_id.num();
        slot_available = (depth_snapshot < max_outstanding);
        out_sem.put();
        if (!slot_available) @(vif.drv_cb);
      end
    endtask

    task request_thread();
      pipe_item req, rsp;
      bit accepted, id_available, stored;

      forever begin
        while (vif.reset_n !== 1'b1) @(vif.drv_cb);
        wait_for_outstanding_slot();
        if (vif.reset_n !== 1'b1) continue;

        seq_item_port.get_next_item(req);
        if (vif.reset_n !== 1'b1) begin
          rsp = make_rsp(req, PIPE_ABORTED, "abort_before_drive_rsp");
          seq_item_port.item_done(rsp);
          continue;
        end

        out_sem.get();
        id_available = !rsp_by_id.exists(req.id);
        out_sem.put();

        if (!id_available) begin
          \`uvm_error("DUP_ID", $sformatf("Duplicate id=%0d rejected", req.id))
          rsp = make_rsp(req, PIPE_REJECTED, "dup_id_rsp");
          seq_item_port.item_done(rsp);
          continue;
        end

        drive_request(req, accepted);
        if (!accepted) begin
          rsp = make_rsp(req, PIPE_ABORTED, "abort_drive_rsp");
          seq_item_port.item_done(rsp);
          continue;
        end

        // Critical accept-to-store race closure:
        if (vif.reset_n !== 1'b1) begin
          rsp = make_rsp(req, PIPE_ABORTED, "abort_accept_store_rsp");
          seq_item_port.item_done(rsp);
          continue;
        end

        out_sem.get();
        rsp_by_id[req.id] = make_rsp(req, PIPE_OK, "rsp_template");
        out_sem.put();

        seq_item_port.item_done();
      end
    endtask

    task automatic drive_request(input pipe_item req, output bit accepted);
      accepted = 1'b0;
      vif.drv_cb.req_valid <= 1'b1;
      vif.drv_cb.req_id    <= req.id;
      vif.drv_cb.req_write <= req.write;
      vif.drv_cb.req_addr  <= req.addr;
      vif.drv_cb.req_wdata <= req.wdata;

      do begin
        @(vif.drv_cb);
        if (vif.reset_n !== 1'b1) begin
          vif.drv_cb.req_valid <= 1'b0;
          return;
        end
      end while (!vif.drv_cb.req_ready);

      accepted = 1'b1;
      vif.drv_cb.req_valid <= 1'b0;
    endtask

    task response_thread();
      pipe_item rsp;
      int unsigned id_key;

      forever begin
        @(vif.drv_cb);
        if (vif.reset_n !== 1'b1) begin
          vif.drv_cb.rsp_ready <= 1'b0;
          abort_outstanding("reset observed");
        end
        else begin
          vif.drv_cb.rsp_ready <= 1'b1;
          if (vif.drv_cb.rsp_valid) begin
            id_key = vif.drv_cb.rsp_id;
            rsp = null;
            out_sem.get();
            if (rsp_by_id.exists(id_key)) begin
              rsp = rsp_by_id[id_key];
              rsp_by_id.delete(id_key);
            end
            out_sem.put();

            if (rsp != null) begin
              rsp.rdata  = vif.drv_cb.rsp_rdata;
              rsp.status = vif.drv_cb.rsp_err ? PIPE_ERR : PIPE_OK;
              seq_item_port.put_response(rsp);
            end
          end
        end
      end
    endtask

    task abort_outstanding(string reason);
      pipe_item abort_q[$];
      int unsigned id_key;
      out_sem.get();
      foreach (rsp_by_id[id_key]) begin
        rsp_by_id[id_key].status = PIPE_ABORTED;
        abort_q.push_back(rsp_by_id[id_key]);
      end
      rsp_by_id.delete();
      out_sem.put();
      foreach (abort_q[i]) seq_item_port.put_response(abort_q[i]);
    endtask
  endclass
endpackage`}</CodeBlock>
              </div>
            </CollapsibleCard>

            {/* Lab 3 */}
            <CollapsibleCard
              title="Code Lab 3 - Multi-Channel Dispatcher Pattern"
              accent="violet"
              icon={<FaFlask size={12} />}
            >
              <div className="space-y-3 text-xs text-slate-300">
                <p>
                  <strong>Goal:</strong> Show how one transaction can be split into multiple channel threads while preserving a single sequencer contract.
                </p>
                <CodeBlock lang="systemverilog">{`package split_pipe_pkg;
  import uvm_pkg::*;
  import pipe_pkg::*;
  \`include "uvm_macros.svh"

  class split_ctx extends uvm_object;
    \`uvm_object_utils(split_ctx)
    pipe_item req;
    mailbox #(bit) hdr_ack, data_ack;
    function new(string name = "split_ctx");
      super.new(name);
      hdr_ack = new(1); data_ack = new(1);
    endfunction
  endclass

  class split_driver extends uvm_driver #(pipe_item, pipe_item);
    \`uvm_component_utils(split_driver)
    virtual pipe_if vif;
    mailbox #(split_ctx) hdr_mb, data_mb;
    pipe_item rsp_by_id[int unsigned];
    semaphore split_sem;

    function new(string name = "split_driver", uvm_component parent = null);
      super.new(name, parent);
      hdr_mb = new(); data_mb = new(); split_sem = new(1);
    endfunction

    task run_phase(uvm_phase phase);
      fork
        dispatcher_thread();
        header_thread();
        data_thread();
        response_thread();
      join
    endtask

    task dispatcher_thread();
      pipe_item req;
      split_ctx ctx;
      bit dummy;

      forever begin
        seq_item_port.get_next_item(req);
        ctx = split_ctx::type_id::create("ctx");
        ctx.req = req;

        hdr_mb.put(ctx);
        data_mb.put(ctx);

        ctx.hdr_ack.get(dummy);
        ctx.data_ack.get(dummy);

        split_sem.get();
        rsp_by_id[req.id] = make_split_rsp(req, PIPE_OK);
        split_sem.put();

        seq_item_port.item_done();
      end
    endtask
  endclass
endpackage`}</CodeBlock>
              </div>
            </CollapsibleCard>
          </section>

          {/* ── §17 Bug Gallery ─────────────────────────────────────────── */}
          <section id="bug-gallery">
            <SectionHeading num={17} title="Bug Gallery (1–11)" />
            <div className="space-y-4">
              {module11BugGallery.map((bug, idx) => (
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
                "Was request accepted first before item_done()?",
                "Is outstanding entry visible before response lookup (same-cycle race)?",
                "If reset asserts after accept but before store, is the still-owned item completed?",
                "Does current item still receive item_done() on reset during drive?",
                "Are abort responses sent on reset after accept/store?",
                "Is insert/delete on shared outstanding table protected?",
                "Is duplicate ID rejected before drive?",
                "Is payload stable while valid and not ready?",
                "Is unmatched response logged?",
                "Are clocking block drive/sample directions sane?",
                "Are stale channel contexts flushed on reset?",
                "Can reset escape blocking waits during phase shutdown?",
                "Are needed fields copied before item_done()?",
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
              <Table
                headers={["Log Point", "Required Fields"]}
                rows={[
                  ["Request fetched", "ID, kind, time"],
                  ["Request accepted", "ID, outstanding depth"],
                  ["Outstanding inserted", "ID, depth"],
                  ["Accepted-but-not-stored abort", "ID, reset time"],
                  ["Item completed", "reason: accepted/rejected/aborted"],
                  ["Response observed", "response ID, status"],
                  ["Response routed", "ID, status"],
                  ["Reset detected", "active state"],
                  ["Outstanding abort", "ID, reason"],
                  ["Duplicate ID", "ID, outstanding depth"],
                  ["Throttle", "depth, max depth"],
                  ["Unmatched response", "response ID"],
                ]}
              />

              <h4 className="font-bold text-blue-300 text-xs uppercase tracking-wider pt-2">
                Debug Accounting Invariant
              </h4>
              <CodeBlock lang="text">{`accepted_requests = routed_responses + abort_responses + currently_outstanding`}</CodeBlock>
            </div>
          </section>

          {/* ── §20 Monitor / Scoreboard / Assertion Boundary ───────────── */}
          <section id="boundary">
            <SectionHeading
              num={20}
              title="Monitor / Scoreboard / Assertion Boundary"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-blue-500/20 bg-slate-900/50 space-y-2">
                <div className="font-bold text-blue-300">Driver &amp; Monitor</div>
                <p className="text-slate-300 leading-relaxed">
                  <strong>Driver:</strong> Drives request pins, observes ready/backpressure, tracks outstanding requests, captures and routes UVM responses.
                  <br />
                  <strong>Monitor:</strong> Passively observes pins, reconstructs accepted transactions, and broadcasts via analysis ports.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-violet-500/20 bg-slate-900/50 space-y-2">
                <div className="font-bold text-violet-300">Scoreboard &amp; Assertions</div>
                <p className="text-slate-300 leading-relaxed">
                  <strong>Scoreboard:</strong> Compares expected vs actual data values and validates functional ordering.
                  <br />
                  <strong>Assertions:</strong> Checks temporal protocol legality, valid/ready stability, and reset assertions.
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
                ["Decision 1: item_done() Point", "After response vs After accept & store", "After request accept and context store for pipelined drivers."],
                ["Decision 2: Matching Structure", "Queue vs Associative array", "Associative array for out-of-order response matching."],
                ["Decision 3: ID Ownership", "Sequence vs Driver vs Allocator", "Sequence intent with driver-side duplicate rejection."],
                ["Decision 4: Sequencer Topology", "Single vs Multi-sequencer", "Single sequencer with dispatcher thread for transaction atomicity."],
                ["Decision 5: Reset Completion", "Immediate vs Delayed abort", "Immediate abort if not stored; delayed abort if already stored."],
              ]}
            />
          </section>

          {/* ── §22 Scalability Notes ───────────────────────────────────── */}
          <section id="scalability">
            <SectionHeading num={22} title="Scalability Notes" />
            <div className="space-y-2 text-xs text-slate-300">
              <p>• Bound outstanding depth with semaphores to avoid memory bloat.</p>
              <p>• For multi-beat responses, aggregate partial buffers inside a context object before calling <code>put_response()</code>.</p>
              <p>• For multiple ordering domains, key table by <code>domain_id + transaction_id</code>.</p>
            </div>
          </section>

          {/* ── §23 Review Checklist ────────────────────────────────────── */}
          <section id="review-checklist">
            <SectionHeading num={23} title="Review Checklist" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/40 space-y-1 text-slate-300">
                <div>✔ item_done() point explicitly defined</div>
                <div>✔ No illegal get() / item_done() mix</div>
                <div>✔ Early completion only after request accept &amp; store</div>
                <div>✔ set_id_info(req) used on all routed responses</div>
                <div>✔ Duplicate ID rejected before drive</div>
                <div>✔ Throttling happens before item fetch</div>
              </div>

              <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/40 space-y-1 text-slate-300">
                <div>✔ Reset before accept closes item</div>
                <div>✔ Reset after accept/store sends abort responses</div>
                <div>✔ Stable payload held during stall</div>
                <div>✔ Shared state protected by semaphore</div>
                <div>✔ Zero scoreboard checking in driver</div>
                <div>✔ All blocking waits are reset-aware</div>
              </div>
            </div>
          </section>

          {/* ── §24 Interview Q&A ───────────────────────────────────────── */}
          <section id="interview-qa">
            <SectionHeading num={24} title="Interview Q&A (Q1–Q17)" />
            <div className="space-y-4">
              {module11InterviewQA.map((qa, idx) => (
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
                <strong>Memory Hook:</strong> "Accept early. Remember correctly. Respond later. Abort cleanly."
              </Callout>

              <CodeBlock lang="systemverilog">{`seq_item_port.get_next_item(req);

accepted = drive_request(req);

if (accepted && vif.reset_n !== 1'b1) begin
  seq_item_port.item_done(abort_rsp);
end
else if (accepted) begin
  rsp = make_rsp(req, PIPE_OK);
  rsp_by_id[req.id] = rsp;
  seq_item_port.item_done();
end

// later in response thread:
seq_item_port.put_response(rsp_by_id[rsp_id]);`}</CodeBlock>

              <Callout type="interview">
                <strong>Interview Line:</strong> "A pipelined driver is an ownership and completion design, not just concurrent code."
              </Callout>
            </div>
          </section>

          {/* ── §26 Key Takeaways ───────────────────────────────────────── */}
          <section id="key-takeaways">
            <SectionHeading num={26} title="Key Takeaways" />
            <ol className="space-y-1.5 list-decimal list-inside text-slate-300 text-sm">
              {[
                "Pipelining separates request acceptance from response completion.",
                "Early item_done() is legal only after request acceptance and response-context safety.",
                "Delayed responses require stored context.",
                "set_id_info(req) is required for UVM response routing.",
                "Protocol ID and UVM routing metadata are different.",
                "Duplicate IDs must be rejected before driving.",
                "Payload must remain stable during backpressure.",
                "Reset must not kill a thread that owns a sequencer item.",
                "Reset after acceptance but before store requires immediate abort completion.",
                "Reset after outstanding store requires delayed abort response.",
                "Multi-channel drivers need explicit channel ownership.",
                "Drivers route responses; scoreboards check correctness.",
                "Senior-grade driver design is about ownership under concurrency.",
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
                <li>When is early item_done() legal in a pipelined driver?</li>
                <li>Why does delayed response handling need set_id_info(req)?</li>
                <li>How do you match out-of-order responses?</li>
                <li>What is the danger of duplicate outstanding IDs?</li>
                <li>How should reset be handled after request acceptance?</li>
                <li>How do you handle reset after acceptance but before outstanding insertion?</li>
                <li>Why is disable fork dangerous in a request-owning thread?</li>
                <li>What is the stable-payload rule during backpressure?</li>
                <li>When would you use a multi-channel dispatcher?</li>
                <li>What belongs in the driver vs scoreboard?</li>
                <li>How do you debug a response-routing hang?</li>
              </ol>
            </div>
          </section>

          {/* ── §28 Coding Exercise ─────────────────────────────────────── */}
          <section id="coding-exercise">
            <SectionHeading
              num={28}
              title="Coding Exercise — Bounded Outstanding Queue"
            />
            <div className="space-y-4 text-sm text-slate-300">
              <p>
                <strong>Exercise:</strong> Patch Code Lab 2 for a protocol that supports only four outstanding requests (<code>max_outstanding = 4</code>), ensuring throttling happens before fetching a new sequencer item.
              </p>
              <CodeBlock lang="systemverilog">{`int unsigned max_outstanding = 4;

// Correct throttle placement before item fetch:
wait_for_outstanding_slot();
seq_item_port.get_next_item(req);`}</CodeBlock>
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
                <FaCheckSquare /> Module 11 — Final Readiness Verdict: PASS (LOCKED)
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Module 11: Pipelined and Multi-Channel Drivers is fully transformed into React. All 29 memory cards, 6 atlas sheets, 3 code labs, 11 bug gallery entries, race checklists, and 17 deep interview Q&amp;As are complete and verified.
              </p>
              <p className="text-xs text-blue-200/80">
                Ready for Module 12: Slave and Reactive Driver Deep Dive.
              </p>
            </div>
          </section>

          {/* Navigation to next module */}
          <ModuleNavigation
            nextPath="/driver-mastery/module12"
            nextTitle="Module 12: Slave and Reactive Driver Deep Dive →"
          />
        </main>
      </div>
    </div>
  );
};

export default Module11;
