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
// DATA — Memory Cards (24 Cards)
// ─────────────────────────────────────────────────────────────────────────────

const module7MemoryCards = [
  {
    title: "Card 1 — Timing Is the Driver’s Real Job [TIMING]",
    accent: "blue",
    hook: "A driver does not only drive values. A driver drives values at legally defined times.",
    concept:
      "A sequence item is timeless. The driver gives it time. Transaction fields have no protocol meaning until the driver decides which cycle drives them, how long they remain stable, when DUT samples them, and when the item completes.",
    code: `seq_item_port.get_next_item(req);
drive_request(req);
wait_for_completion(req);
cleanup_request();
seq_item_port.item_done();`,
    trap: "Treating the driver as a field assignment block (vif.data <= req.data; seq_item_port.item_done();).",
    interview:
      "A UVM driver is a temporal adapter. It converts transaction intent into protocol-timed pin behavior.",
  },
  {
    title: "Card 2 — Same Edge Is Not Automatically Same Meaning [RACE]",
    accent: "rose",
    hook: "Two processes using @(posedge clk) do not necessarily see the same value.",
    concept:
      "Driver, DUT, and monitor can all trigger on the same clock edge. If the driver updates a signal and the monitor samples it on the same edge, event-region ordering determines what the monitor sees.",
    code: `// Driver:
@(vif.drv_cb);
vif.drv_cb.valid <= 1'b1;

// Monitor:
@(vif.mon_cb);
if (vif.mon_cb.valid)
  sample_transfer();`,
    trap: "Assuming 'same posedge' means 'same logical protocol moment.'",
    interview:
      "Same clock edge is not a complete timing specification. The driver must define drive and sample timing.",
  },
  {
    title: "Card 3 — Raw Posedge Driving Is Legal but Fragile [TIMING]",
    accent: "amber",
    hook: "@(posedge clk) is a clock event, not a race policy.",
    concept:
      "Raw posedge driving can work if all components agree on sampling assumptions. It becomes fragile when driver and monitor use the same raw edge, driver drives and samples same-cycle signals, or reset changes near the same edge.",
    code: `// Documented Raw-Edge Policy:
// Driver updates valid/data using NBA after posedge.
// DUT is expected to observe them on a later sampling edge.
@(posedge vif.clk);
vif.valid <= 1'b1;
vif.data  <= req.data;`,
    trap: "Using raw posedge style without documenting whether DUT samples newly driven values in the same cycle or next cycle.",
    interview:
      "Raw posedge driving is acceptable only when the sampling relationship is explicit and reviewable.",
  },
  {
    title: "Card 4 — Clocking Blocks Encode Timing Intent [TIMING]",
    accent: "violet",
    hook: "A clocking block is a timing contract attached to an interface.",
    concept:
      "A clocking block separates when the driver drives outputs, when the driver samples inputs, which pins the driver owns, and which pins the driver only observes.",
    code: `clocking drv_cb @(posedge clk);
  default input #1step output #0;
  output valid;
  output data;
  input  ready;
  input  reset_n;
endclocking`,
    trap: "Declaring a clocking block but bypassing it with raw vif.ready.",
    interview:
      "Clocking blocks reduce races by making drive and sample timing explicit at the interface boundary.",
  },
  {
    title: "Card 5 — Input Skew Protects Sampling [RACE]",
    accent: "emerald",
    hook: "Driver inputs should be sampled as stable observations, not same-edge guesses.",
    concept:
      "With default input #1step output #0;, clocking block inputs are sampled just before the clocking event in the Preponed region. This avoids accidentally observing same-edge updates as if they were stable protocol results.",
    code: `do begin
  @(vif.drv_cb);
end while (!vif.drv_cb.ready);`,
    trap: "Sampling vif.ready directly while driving via vif.drv_cb.",
    interview:
      "Clocking block input skew gives the driver a deterministic sampled view of DUT-owned signals.",
  },
  {
    title: "Card 6 — Output Skew Controls Drive Visibility [TIMING]",
    accent: "blue",
    hook: "Output skew decides when the driver’s pin updates become visible.",
    concept:
      "default input #1step output #0; means the driver uses the clocking block's output timing policy. It does not mean 'magically safe'. Output skew must match the protocol's setup expectation.",
    code: `task drive_idle();
  @(vif.drv_cb);
  vif.drv_cb.valid <= 1'b0;
  vif.drv_cb.data  <= '0;
endtask`,
    trap: "Using output skew to hide an architectural protocol mismatch.",
    interview:
      "Output skew must match the protocol's setup expectation; it is not a universal race cure.",
  },
  {
    title: "Card 7 — Blocking vs Nonblocking Is a Driver Timing Choice [CODE]",
    accent: "violet",
    hook: "Assignment style changes visibility and race behavior.",
    concept:
      "Use blocking assignment (=) for local variables and procedural calculations. Use nonblocking assignment (<=) through a clocking block for interface pins.",
    code: `bit accepted;
accepted = 0; // local variable: blocking is fine

@(vif.drv_cb);
vif.drv_cb.valid <= 1'b1;
vif.drv_cb.data  <= req.data;`,
    trap: "Mixing blocking and nonblocking assignment styles on the same interface pin.",
    interview:
      "In drivers, assignment style is part of the timing contract. I use blocking for local computation and a consistent nonblocking/clocking-block policy for pins.",
  },
  {
    title: "Card 8 — Stable Payload Is a Driver Obligation [DRIVER]",
    accent: "amber",
    hook: "Once valid is high, payload is locked until acceptance.",
    concept:
      "For ready/valid-style protocols, the driver must keep payload strictly stable while valid == 1 and ready == 0.",
    code: `@(vif.drv_cb);
vif.drv_cb.valid <= 1'b1;
vif.drv_cb.data  <= req.data;

do begin
  @(vif.drv_cb);
end while (!vif.drv_cb.ready);

vif.drv_cb.valid <= 1'b0;`,
    trap: "Fetching the next item and updating data before the previous item is accepted.",
    interview:
      "The driver owns payload stability. Assertions may check it, but the driver must obey it.",
  },
  {
    title: "Card 9 — item_done() Must Follow Timing Completion [UVM]",
    accent: "emerald",
    hook: "item_done() releases sequencer ownership.",
    concept:
      "For non-pipelined timing: get item -> drive pins -> wait completion or abort -> cleanup -> item_done.",
    code: `seq_item_port.get_next_item(req);
drive_valid(req);
wait_acceptance();
cleanup_valid();
seq_item_port.item_done();`,
    trap: "Thinking item_done() means 'I received the item' rather than 'I finished driving it.'",
    interview:
      "In a non-pipelined driver, I call item_done() after protocol completion and cleanup decision, not immediately after fetching.",
  },
  {
    title: "Card 10 — Reset Aborts Timing, Not Responsibility [RESET]",
    accent: "rose",
    hook: "Reset can cancel pin activity, but it cannot erase a fetched sequencer item.",
    concept:
      "If the driver already called get_next_item(req) and reset arrives, the driver must still resolve the sequencer contract by calling item_done() with abort status.",
    code: `seq_item_port.get_next_item(req);
aborted = 0;
drive_one_with_reset(req, aborted);
drive_idle();

if (USE_RSP) begin
  rsp = timing_item::type_id::create("rsp");
  rsp.set_id_info(req);
  rsp.aborted = aborted;
  seq_item_port.item_done(rsp);
end else begin
  seq_item_port.item_done();
end`,
    trap: "Returning from a reset branch before calling item_done().",
    interview:
      "Reset aborts the transfer, not the driver's obligation to close the sequencer-driver handshake.",
  },
  {
    title: "Card 11 — Driver Sampling Must Be Justified [BOUNDARY]",
    accent: "blue",
    hook: "A driver samples DUT outputs only when those outputs control driver progress.",
    concept:
      "A driver may sample DUT-owned signals when they determine acceptance, completion, backpressure, retry, error response, reset state, or response object content.",
    code: `do begin
  @(vif.drv_cb);
end while (!vif.drv_cb.ready);`,
    trap: "Using the driver as a convenient place to perform functional scoreboard checks.",
    interview:
      "The driver may sample DUT outputs only to advance the protocol or return protocol response status, not to perform functional checking.",
  },
  {
    title: "Card 12 — Monitor and Driver Must Not Share Timing Assumptions [MONITOR]",
    accent: "violet",
    hook: "The driver drives. The monitor observes. They should not race each other.",
    concept:
      "If driver and monitor both use raw @(posedge clk), the monitor can sample before driver nonblocking assignments update. Separate clocking blocks eliminate same-edge races.",
    code: `clocking drv_cb @(posedge clk);
  default input #1step output #0;
  output valid, data;
  input ready;
endclocking

clocking mon_cb @(posedge clk);
  default input #1step;
  input valid, data, ready;
endclocking`,
    trap: "Letting the monitor read the driver's internal transaction handle directly.",
    interview:
      "A monitor must reconstruct behavior from interface observations, not from driver internals.",
  },
  {
    title: "Card 13 — #0 Is Not a Race Fix [RACE]",
    accent: "rose",
    hook: "#0 moves the bug; it does not define the protocol.",
    concept:
      "A #0 delay shifts execution to a later delta cycle. It may hide a race in one simulator or seed while preserving fundamental timing ambiguity.",
    code: `// Race-safe alternative without #0:
@(vif.drv_cb);
if (vif.drv_cb.ready)
  accepted = 1;`,
    trap: "Adding #0 after failed waveform debug because 'it works now.'",
    interview:
      "I do not use #0 to fix driver races. I define drive/sample timing using clocking blocks or documented edge policy.",
  },
  {
    title: "Card 14 — Arbitrary #1 Delays Are Worse Than They Look [RACE]",
    accent: "amber",
    hook: "A time delay is not a clocking contract.",
    concept:
      "Using #1 after @(posedge clk) depends on timescale, may violate setup time, breaks gate-level simulation, and hides the actual protocol phase.",
    code: `// Clean clocking event drive:
@(vif.drv_cb);
vif.drv_cb.valid <= 1'b1;`,
    trap: "Using #1 because the waveform visually looks cleaner in the viewer.",
    interview:
      "Arbitrary delays are non-portable timing patches. I replace them with clocking-event-based timing.",
  },
  {
    title: "Card 15 — Cleanup Is a Timed Operation [TIMING]",
    accent: "emerald",
    hook: "Cleanup too early corrupts transfer. Cleanup too late creates ghost transfers.",
    concept:
      "Cleanup means returning driven pins to idle or preparing the next legal transfer. It must occur only after protocol completion or abort.",
    code: `wait_acceptance();
@(vif.drv_cb);
vif.drv_cb.valid <= 1'b0;
vif.drv_cb.data  <= '0;`,
    trap: "Dropping valid after one cycle without checking ready.",
    interview:
      "Cleanup is part of the protocol timing contract, not an afterthought.",
  },
  {
    title: "Card 16 — Reset Cleanup Must Drive Known Idle [RESET]",
    accent: "blue",
    hook: "During reset, the driver must stop arguing with the DUT.",
    concept:
      "When reset asserts, the driver should drive protocol-safe idle values for DUT inputs it owns.",
    code: `task drive_idle_no_wait();
  vif.drv_cb.valid <= 1'b0;
  vif.drv_cb.data  <= '0;
endtask`,
    trap: "Leaving old transaction pins active during reset because 'the DUT ignores them.'",
    interview:
      "Reset handling must leave the interface in a known driver-owned idle state.",
  },
  {
    title: "Card 17 — Reset Deassertion Needs a Restart Policy [RESET]",
    accent: "violet",
    hook: "Reset deassertion is not permission to immediately blast the bus.",
    concept:
      "When reset deasserts, the driver must observe at least one clean documented driver timing point before resuming traffic.",
    code: `task wait_reset_released_clean();
  do begin
    @(vif.drv_cb);
    drive_idle_no_wait();
  end while (!vif.drv_cb.reset_n);

  @(vif.drv_cb); // documented clean restart point
endtask`,
    trap: "Fetching and driving an item on the very same clocking event where reset first appears deasserted.",
    interview:
      "I define a reset restart policy so the first post-reset transfer is deterministic.",
  },
  {
    title: "Card 18 — Response Sampling Must Match Completion Timing [TIMING]",
    accent: "emerald",
    hook: "A response sampled one cycle early is just stale data with confidence.",
    concept:
      "If the protocol returns error/status/read data, the driver must sample it only at the legal completion response point.",
    code: `do begin
  @(vif.drv_cb);
end while (!vif.drv_cb.pready);

rsp.err  = vif.drv_cb.pslverr;
rsp.data = vif.drv_cb.prdata;`,
    trap: "Sampling response immediately after asserting request controls.",
    interview:
      "Response fields are valid only at protocol completion, so the driver's response object must be populated at that timing point.",
  },
  {
    title: "Card 19 — Response Return Needs Routing Discipline [UVM]",
    accent: "amber",
    hook: "A response without ID context may reach the wrong sequence.",
    concept:
      "When a response is sent back to the sequence, preserve request identity using rsp.set_id_info(req).",
    code: `rsp = timing_item::type_id::create("rsp");
rsp.set_id_info(req);
rsp.err = sampled_err;
seq_item_port.item_done(rsp);`,
    trap: "Creating a response object but omitting set_id_info(req).",
    interview:
      "When response routing matters, I call set_id_info(req) and ensure the driver's RSP type matches the response object.",
  },
  {
    title: "Card 20 — Forked Watchdogs Create Their Own Races [RACE]",
    accent: "rose",
    hook: "A reset watchdog can save a driver or corrupt it.",
    concept:
      "Forked waits must define a scoped winner, cleanup, response status, item release, and child-thread kill policy.",
    code: `completed = 0;
aborted   = 0;

fork : wait_accept_or_reset
  begin
    wait_acceptance();
    completed = 1;
  end
  begin
    wait_reset_asserted();
    aborted = 1;
  end
join_any
disable wait_accept_or_reset;

drive_idle();`,
    trap: "Using unscoped disable fork which kills parent or sibling processes.",
    interview:
      "Forked timing waits need a scoped winner, cleanup, and sequencer-release policy.",
  },
  {
    title: "Card 21 — A Driver Must Not Have Multiple Owners for One Pin [DRIVER]",
    accent: "blue",
    hook: "One pin, one active driver.",
    concept:
      "Race conditions occur when two procedural blocks drive the same interface signal simultaneously. Reset and traffic paths must serialize pin writes.",
    code: `task drive_valid(bit value);
  vif.drv_cb.valid <= value;
endtask`,
    trap: "Running a separate reset-watcher task that assigns valid concurrently with the main traffic loop.",
    interview:
      "I avoid multiple procedural owners for the same driver-owned pin; reset and traffic paths must serialize pin writes.",
  },
  {
    title: "Card 22 — Clocking Blocks Do Not Replace Protocol Knowledge [TIMING]",
    accent: "violet",
    hook: "A clocking block prevents races; it does not invent legal bus timing.",
    concept:
      "Code can be 100% race-safe under clocking blocks but completely wrong according to protocol if ready handshake is ignored.",
    code: `// Race-safe BUT protocol-wrong if ready was low:
@(vif.drv_cb);
vif.drv_cb.valid <= 1'b1;
@(vif.drv_cb);
vif.drv_cb.valid <= 1'b0;`,
    trap: "Believing that using drv_cb automatically makes the driver's protocol state machine correct.",
    interview:
      "Clocking blocks solve testbench timing races; they do not replace protocol completion logic.",
  },
  {
    title: "Card 23 — Debug Logs Must Include Timing Context [CODE]",
    accent: "emerald",
    hook: "A driver log without cycle context is half a log.",
    concept:
      "Timing bugs require logs that identify transaction count, drive point, sample point, reset state, and handshake condition.",
    code: `\`uvm_info("DRV_ACCEPT",
  $sformatf("txn=%0d id=%0d accepted ready=%0b aborted=%0b",
            local_txn_count, req.get_transaction_id(),
            vif.drv_cb.ready, aborted),
  UVM_MEDIUM)`,
    trap: "Logging only sequence item fields without reporting the sampled handshake condition.",
    interview:
      "For timing debug, I log the protocol decision point, not just the transaction content.",
  },
  {
    title: "Card 24 — Simulator Portability Requires Removing Ordering Assumptions [ARCH]",
    accent: "amber",
    hook: "If correctness depends on process ordering, it is not portable.",
    concept:
      "Portable driver timing avoids raw same-edge dependencies, #0, timescale-dependent #1, mixed raw/clocking access, and undocumented reset release timing.",
    code: `@(vif.drv_cb);
vif.drv_cb.valid <= 1'b1;
vif.drv_cb.data  <= req.data;

do begin
  @(vif.drv_cb);
end while (!vif.drv_cb.ready);

vif.drv_cb.valid <= 1'b0;`,
    trap: "Saying 'it works in my simulator' as proof of correctness.",
    interview:
      "A portable driver defines timing explicitly enough that Questa, VCS, and Xcelium do not need to guess process ordering.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// DATA — Bug Gallery (10 Bugs)
// ─────────────────────────────────────────────────────────────────────────────

const module7BugGallery = [
  {
    title: "Bug 1 — Dropping valid Before Acceptance",
    symptom:
      "Sequence items disappear under ready stalls. Monitor sees fewer transfers than generated.",
    waveform: "Cycle N: valid=1, ready=0 -> Cycle N+1: valid=0, ready=0 -> Cycle N+2: ready=1 (missed).",
    cause:
      "The driver deasserted valid after 1 cycle without waiting for ready===1'b1.",
    bad: `seq_item_port.get_next_item(req);
@(vif.drv_cb);
vif.drv_cb.valid <= 1'b1;
vif.drv_cb.data  <= req.data;

@(vif.drv_cb);
vif.drv_cb.valid <= 1'b0; // BUG: ready was 0!
seq_item_port.item_done();`,
    fix: `seq_item_port.get_next_item(req);
@(vif.drv_cb);
vif.drv_cb.valid <= 1'b1;
vif.drv_cb.data  <= req.data;

do begin
  @(vif.drv_cb);
end while (!vif.drv_cb.ready); // Wait for acceptance

vif.drv_cb.valid <= 1'b0;
vif.drv_cb.data  <= '0;
seq_item_port.item_done();`,
    interview:
      "The bug is early cleanup. The driver released the item without observing protocol acceptance.",
  },
  {
    title: "Bug 2 — Calling item_done() Before Pin Completion",
    symptom:
      "Next item overlaps current pin transfer; transaction fields overwrite active bus operation.",
    waveform: "item_done called at cycle 10; valid remains asserted on bus until cycle 15.",
    cause:
      "item_done() was treated as 'item received' rather than 'item complete under driver contract.'",
    bad: `seq_item_port.get_next_item(req);
seq_item_port.item_done(); // BUG: Handshake released prematurely!

@(vif.drv_cb);
vif.drv_cb.valid <= 1'b1;
vif.drv_cb.data  <= req.data;`,
    fix: `seq_item_port.get_next_item(req);
drive_one_item(req, aborted);
drive_idle_at_cb();
seq_item_port.item_done(); // Safe completion point`,
    interview:
      "In a non-pipelined driver, item_done() belongs after completion or reset-abort cleanup.",
  },
  {
    title: "Bug 3 — Raw Same-Edge Monitor Race",
    symptom:
      "Monitor misses first valid cycle or appears one cycle shifted. Scoreboard mismatches intermittently.",
    waveform: "Driver and monitor both evaluate posedge clk in same delta slot.",
    cause:
      "Driver NBA update occurs after monitor procedural sample in the Active region.",
    bad: `// Driver:
@(posedge vif.clk);
vif.valid <= 1'b1;
vif.data  <= req.data;

// Monitor:
@(posedge vif.clk);
if (vif.valid) collect(vif.data); // BUG: Samples old value!`,
    fix: `// Driver:
@(vif.drv_cb);
vif.drv_cb.valid <= 1'b1;
vif.drv_cb.data  <= req.data;

// Monitor:
@(vif.mon_cb);
if (vif.mon_cb.valid) collect(vif.mon_cb.data); // Sampled at #1step`,
    interview:
      "Same posedge is not enough. Driver and monitor need a defined drive/sample relationship.",
  },
  {
    title: "Bug 4 — #0 Race Patch",
    symptom:
      "Test passes in one simulator and fails in another under different seed configurations.",
    waveform: "Process evaluation order shifts unpredictably across delta iterations.",
    cause:
      "#0 shifts delta-cycle ordering without defining a true protocol timing contract.",
    bad: `@(posedge vif.clk);
#0; // BUG: Delta-cycle race patch
if (vif.ready) begin
  accepted = 1;
end`,
    fix: `@(vif.drv_cb);
if (vif.drv_cb.ready) begin
  accepted = 1;
end`,
    interview:
      "#0 is a delta-cycle hack, not a timing contract.",
  },
  {
    title: "Bug 5 — Arbitrary #1 Delay After Clock Edge",
    symptom:
      "Behavior breaks when clock frequency changes or during gate-level simulation.",
    waveform: "Signals update 1ns after clock regardless of clock period or timescale.",
    cause:
      "Real-time delay replaced protocol clocking event synchronization.",
    bad: `@(posedge vif.clk);
#1; // BUG: Timescale & frequency dependent!
vif.valid = 1'b1;
vif.data  = req.data;`,
    fix: `@(vif.drv_cb);
vif.drv_cb.valid <= 1'b1;
vif.drv_cb.data  <= req.data;`,
    interview:
      "Clocked protocols should be driven by clocking events, not arbitrary time delays.",
  },
  {
    title: "Bug 6 — Reset Branch Returns Without item_done()",
    symptom:
      "Sequence hangs forever after reset assertion; simulation hangs at end of test.",
    waveform: "Reset asserted while driver owns item; driver task returns without calling item_done.",
    cause:
      "Driver fetched an item but exited the loop/task without closing the sequencer handshake.",
    bad: `seq_item_port.get_next_item(req);

if (!vif.drv_cb.reset_n) begin
  drive_idle_no_wait();
  return; // BUG: sequencer item stranded!
end`,
    fix: `seq_item_port.get_next_item(req);
aborted = 0;

@(vif.drv_cb);
if (!vif.drv_cb.reset_n) begin
  aborted = 1;
  drive_idle_no_wait();
end else begin
  drive_one_item(req, aborted);
end

drive_idle_at_cb();
req.aborted = aborted;
seq_item_port.item_done(); // Handshake closed!`,
    interview:
      "Reset can abort pin activity, but it cannot erase a fetched item.",
  },
  {
    title: "Bug 7 — Sampling Response Before Completion",
    symptom:
      "Response error is stale or one cycle shifted; error status does not match DUT behavior.",
    waveform: "err sampled when req asserted, before done/pready asserted by slave.",
    cause:
      "Response fields were sampled before protocol transfer completion.",
    bad: `drive_request_phase(req);

rsp = rsp_item::type_id::create("rsp");
rsp.set_id_info(req);
rsp.err = vif.drv_cb.err; // BUG: Sampled before done!
seq_item_port.item_done(rsp);`,
    fix: `drive_request_phase(req);

do begin
  @(vif.drv_cb);
end while (!vif.drv_cb.done); // Wait for completion

rsp = rsp_item::type_id::create("rsp");
rsp.set_id_info(req);
rsp.err = vif.drv_cb.err; // Sampled at valid completion
seq_item_port.item_done(rsp);`,
    interview:
      "Response objects must be populated at the legal response point.",
  },
  {
    title: "Bug 8 — Missing set_id_info(req)",
    symptom:
      "Response routing fails under multiple concurrent sequences; get_response() hangs.",
    waveform: "Bus activity completes cleanly, but sequence remains blocked waiting for response.",
    cause:
      "Response object created without copying sequence_id and transaction_id from request.",
    bad: `rsp = rsp_item::type_id::create("rsp");
rsp.err = sampled_err;
seq_item_port.item_done(rsp); // BUG: Missing ID metadata`,
    fix: `rsp = rsp_item::type_id::create("rsp");
rsp.set_id_info(req); // Copies sequence ID metadata
rsp.err = sampled_err;
seq_item_port.item_done(rsp);`,
    interview:
      "set_id_info(req) preserves sequence and transaction ID context.",
  },
  {
    title: "Bug 9 — Mixed Raw and Clocking Block Access",
    symptom:
      "Acceptance decision differs from monitor observation near same-edge ready transitions.",
    waveform: "Driver samples raw ready in Active region while driving pins via drv_cb.",
    cause:
      "Driver drove through the clocking block but sampled raw DUT output signal directly.",
    bad: `@(vif.drv_cb);
vif.drv_cb.valid <= 1'b1;
vif.drv_cb.data  <= req.data;

if (vif.ready) begin // BUG: Mixed raw access!
  accepted = 1;
end`,
    fix: `@(vif.drv_cb);
vif.drv_cb.valid <= 1'b1;
vif.drv_cb.data  <= req.data;

if (vif.drv_cb.ready) begin // Clocking block sampled access
  accepted = 1;
end`,
    interview:
      "Once a driver uses a clocking block, it should use that clocking block consistently.",
  },
  {
    title: "Bug 10 — Multiple Procedural Owners for One Pin",
    symptom:
      "valid pin toggles unpredictably during reset tests; contention or race between threads.",
    waveform: "Two procedural blocks assign vif.drv_cb.valid in the same clock cycle.",
    cause:
      "Traffic thread and reset-watcher thread both drive the same interface signal.",
    bad: `// Thread 1 (traffic):
vif.drv_cb.valid <= 1'b1;

// Thread 2 (reset watcher):
if (!vif.drv_cb.reset_n)
  vif.drv_cb.valid <= 1'b0; // BUG: Multiple concurrent writers!`,
    fix: `// Serialized pin ownership:
task drive_pins(rv_item req, bit drive_active);
  if (drive_active) begin
    vif.drv_cb.valid <= 1'b1;
    vif.drv_cb.data  <= req.data;
  end else begin
    vif.drv_cb.valid <= 1'b0;
    vif.drv_cb.data  <= '0;
  end
endtask`,
    interview:
      "Race-safe drivers serialize ownership of each interface pin.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// DATA — Interview Q&A (12 Questions)
// ─────────────────────────────────────────────────────────────────────────────

const module7InterviewQA = [
  {
    q: "Q1. Why is @(posedge clk) not enough to define driver timing?",
    short:
      "Because it defines only the clock event, not drive/sample ordering or signal visibility.",
    deep: "Driver, DUT, and monitor may all execute on the same edge. Depending on assignment type and event-region ordering, the monitor may sample old values while the driver schedules new ones. A robust driver defines drive point, sample point, stable window, completion, cleanup, and item_done() timing.",
    followup: "How do you make this deterministic?",
    answer:
      "Use a clocking block or a strictly documented and reviewed raw-edge policy.",
  },
  {
    q: "Q2. When should a driver use a clocking block?",
    short: "When reusable driver timing must be explicit and race-safe.",
    deep: "Clocking blocks encode which signals are driven and sampled at a clocking event and with what skew. They reduce driver/DUT/monitor races when used consistently. They do not replace protocol logic; the driver must still wait for legal acceptance/completion.",
    followup: null,
    answer: null,
  },
  {
    q: "Q3. Why is #0 a bad race fix?",
    short:
      "It changes delta-cycle ordering but not the protocol timing contract.",
    deep: "#0 may hide a scheduler race in one simulator or seed. It does not define whether a signal should be sampled before or after same-edge updates.",
    followup: null,
    answer: null,
  },
  {
    q: "Q4. Where should item_done() be called in a non-pipelined driver?",
    short: "After protocol completion or reset-abort cleanup.",
    deep: "item_done() releases the sequencer item. If called before the pin-level item completes, the next item can overlap the current transfer.",
    followup: null,
    answer: null,
  },
  {
    q: "Q5. What happens if reset arrives after get_next_item()?",
    short:
      "The driver must abort pin activity but still close the sequencer-driver contract.",
    deep: "A fetched item cannot be abandoned. The driver should drive idle, mark aborted if response/status is used, and call item_done() or item_done(rsp) according to the contract.",
    followup: null,
    answer: null,
  },
  {
    q: "Q6. When may a driver sample DUT outputs?",
    short: "Only when those outputs control driver progress or response status.",
    deep: "The driver may sample ready, completion, retry, error, or response signals because they determine when to proceed. It must not sample arbitrary DUT results for functional checking.",
    followup: null,
    answer: null,
  },
  {
    q: "Q7. What is the stable-payload rule?",
    short: "Payload must not change while valid=1 and transfer is not accepted.",
    deep: "If valid is asserted and ready is low, the DUT has not accepted the transfer. Changing payload during that window creates ambiguous transaction meaning.",
    followup: null,
    answer: null,
  },
  {
    q: "Q8. Why should monitor and driver use different timing views?",
    short: "To avoid same-edge drive/sample races.",
    deep: "The driver drives DUT inputs. The monitor passively observes interface behavior. Separate clocking blocks (drv_cb and mon_cb) make observation timing deterministic.",
    followup: null,
    answer: null,
  },
  {
    q: "Q9. What is wrong with mixing raw interface access and clocking block access?",
    short: "It mixes timing semantics.",
    deep: "Clocking block inputs represent sampled values under the clocking block's skew (#1step). Raw reads bypass that policy.",
    followup: null,
    answer: null,
  },
  {
    q: "Q10. How do you handle responses in UVM 1.2?",
    short:
      "Use a response object of the correct RSP type and preserve routing with set_id_info(req).",
    deep: "If response is ready at completion and the driver's RSP type is compatible, item_done(rsp) is a clean coupled policy. If response is separate, put_response(rsp) may be used under a documented response-queue contract.",
    followup: null,
    answer: null,
  },
  {
    q: "Q11. What is the senior-level driver timing review question?",
    short:
      "'Where exactly are drive, sample, completion, cleanup, reset-abort, and item_done() defined?'",
    deep: "If the author cannot point to those in code or documentation, the driver is timing-ambiguous.",
    followup: null,
    answer: null,
  },
  {
    q: "Q12. What is the worst driver timing bug?",
    short: "A bug that passes in one simulator and fails in another.",
    deep: "That usually means correctness depends on scheduler ordering, delta cycles, arbitrary delays, or mixed timing access.",
    followup: null,
    answer: null,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// DATA — Sections for Sidebar Navigation
// ─────────────────────────────────────────────────────────────────────────────

const module7Sections = [
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
  { id: "memory", label: "Memory Cards (1–24)" },
  { id: "atlas", label: "Atlas Sheets (1–7)" },
  { id: "codelabs", label: "Code Labs (1–3)" },
  { id: "bugs", label: "Bug Gallery (1–10)" },
  { id: "race", label: "Race-Condition Checklist" },
  { id: "logging", label: "Debug Instrumentation & Logs" },
  { id: "verification-boundary", label: "Monitor / Scoreboard Boundary" },
  { id: "decisions", label: "Architectural Decision Points" },
  { id: "scalability", label: "Scalability Notes" },
  { id: "review", label: "Review Checklist" },
  { id: "interview", label: "Interview Q&A (Q1–Q12)" },
  { id: "recall", label: "Final Recall Card" },
  { id: "takeaways", label: "Key Takeaways" },
  { id: "interview-summary", label: "Interview Questions (20 Qs)" },
  { id: "exercise", label: "Coding Exercise" },
  { id: "verdict", label: "Final Readiness Verdict" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT — Module 7
// ═══════════════════════════════════════════════════════════════════════════════

const Module7 = () => {
  return (
    <div className="relative min-h-screen bg-slate-950 text-white font-sans">
      {/* Background glow & grid */}
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-150 h-62.5 bg-linear-to-r from-teal-600/15 to-blue-600/15 blur-[100px] rounded-full" />

      <div className="relative z-10 flex max-w-7xl mx-auto">
        {/* ── Sidebar TOC (desktop) ────────────────────────────────────── */}
        <ModuleSidebar
          moduleNumber="7"
          title="Timing, Clocking Blocks, and Race Conditions"
          sections={module7Sections}
        />

        {/* ── Main Content ─────────────────────────────────────────────── */}
        <main className="flex-1 min-w-0 px-6 py-8 pb-24 max-w-4xl">
          {/* Mobile back */}
          <BackToHomeBtn to="/driver-mastery" />

          {/* Hero */}
          <ModuleHero
            moduleNumber="7"
            title="Timing, Clocking Blocks, and Race Conditions"
            description="Master the temporal mechanics of UVM drivers. Learn to eliminate testbench-DUT race conditions, handle clocking block skews, preserve payload stability, and build deterministic reset/abort lifecycles."
            metadata={[
              ["Module", "7"],
              ["Reference", "UVM 1.2 / IEEE 1800-2017"],
              ["Primary Focus", "Timing Contracts, drv_cb Skew, Race Freedom"],
              ["Roadmap", "After Module 6, before Module 8 (APB Deep Dive)"],
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
                    "Module 6: APB-Style Non-Pipelined Command Driver",
                    "Module 7: Timing, Clocking Blocks, and Race Conditions",
                    "Module 8: APB Master Driver Deep Dive",
                  ],
                ]}
              />

              <h3 className="text-lg font-bold text-teal-300 mt-4">
                Module Thesis
              </h3>
              <p className="text-slate-300 text-sm">
                A UVM driver is not correct because it uses <code>@(posedge clk)</code>.
              </p>
              <blockquote className="border-l-4 border-teal-500 bg-teal-500/10 p-4 rounded-r-xl text-teal-200 text-sm leading-relaxed">
                A UVM driver is correct only when its <strong>drive point</strong>,{" "}
                <strong>sample point</strong>, <strong>stable window</strong>,{" "}
                <strong>completion point</strong>, <strong>cleanup point</strong>,{" "}
                <strong>reset-abort point</strong>, and{" "}
                <strong>sequencer release point</strong> are explicitly defined.
                <br />
                <span className="text-xs text-teal-300/80 mt-1 block">
                  Most "random DUT bugs" in driver bring-up are timing-contract bugs.
                </span>
              </blockquote>
            </div>
          </section>

          {/* ── §2 Learning Objectives ──────────────────────────────────── */}
          <section id="objectives">
            <SectionHeading num={2} title="Learning Objectives" />
            <ol className="space-y-2 list-decimal list-inside text-slate-300 text-sm leading-relaxed">
              {[
                "Explain driver timing as a protocol contract, not a coding style.",
                "Distinguish raw @(posedge clk) driving from clocking-block-based driving.",
                "Explain clocking block input and output skew in driver context.",
                "Decide when a driver may sample DUT outputs.",
                "Choose blocking vs nonblocking assignment style for driver-local variables and interface pins.",
                "Preserve stable-payload rules in ready/valid-style protocols.",
                "Recognize same-edge drive/sample races in waveforms.",
                "Reject #0, #1, and arbitrary-delay hacks as non-portable race fixes.",
                "Handle reset during active driver transactions without hanging the sequencer.",
                "Place item_done() only after the chosen driver contract says the item is complete or safely aborted.",
                "Separate driver timing responsibility from monitor, scoreboard, and assertion responsibility.",
                "Defend driver timing architecture in senior/principal verification interviews.",
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
            <div className="space-y-4 text-sm text-slate-300">
              <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/40">
                <h4 className="font-bold text-teal-300 mb-2">
                  Pass 1 — Timing Contract First
                </h4>
                <p className="text-xs text-slate-400 mb-2">
                  Before reading code, answer these four fundamental questions:
                </p>
                <CodeBlock lang="text">{`At which clocking event does the driver drive?
At which clocking event does the driver sample?
At which point is the item considered complete?
At which point does the driver release the sequencer?`}</CodeBlock>
                <p className="text-xs text-amber-300 mt-2">
                  If those answers are vague, the driver is not review-ready.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/40">
                <h4 className="font-bold text-violet-300 mb-2">
                  Pass 2 — Memory Cards as Interview Flashcards
                </h4>
                <p className="text-xs text-slate-300">
                  For every memory card, identify: What race does this prevent? What
                  waveform symptom exposes it? What code pattern fixes it? Who owns
                  the check?
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/40">
                <h4 className="font-bold text-emerald-300 mb-2">
                  Pass 3 — Study the Code Labs
                </h4>
                <p className="text-xs text-slate-300">
                  Observe how timing policy is turned into reusable, compile-credible
                  UVM driver architecture.
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
                ["[TIMING]", "Clock edge, event region, skew, or assignment-order rule"],
                ["[RACE]", "Race condition pattern or prevention rule"],
                ["[DRIVER]", "Driver-owned behavior"],
                ["[MONITOR]", "Monitor-owned behavior"],
                ["[ASSERTION]", "Assertion-owned temporal/protocol check"],
                ["[SCOREBOARD]", "Scoreboard-owned functional comparison"],
                ["[RESET]", "Reset or abort timing issue"],
                ["[UVM]", "UVM 1.2 sequencer-driver behavior"],
                ["[CODE]", "Implementation rule"],
                ["[INTERVIEW]", "Interview-defense language"],
                ["[BOUNDARY]", "Scope boundary"],
              ]}
            />
          </section>

          {/* ── §5 Module-Specific Acceptance Checklist ─────────────────── */}
          <section id="acceptance">
            <SectionHeading
              num={5}
              title="Module-Specific Acceptance Checklist (M7-01 to M7-24)"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-300">
              {[
                "M7-01: Explains driver timing as a protocol contract.",
                "M7-02: Explains raw @(posedge clk) driving and race risks.",
                "M7-03: Explains clocking block input/output skews in driver context.",
                "M7-04: Explains when the driver may sample DUT outputs.",
                "M7-05: Explains blocking vs nonblocking assignment choices.",
                "M7-06: Covers stable-payload timing for ready/valid-style protocols.",
                "M7-07: Covers setup/access-style timing for APB-like protocols.",
                "M7-08: Defines timing/waveform contract for drive, sample, cleanup.",
                "M7-09: Defines reset/abort policy during an active item.",
                "M7-10: Defines item_done() timing relative to pin-level completion.",
                "M7-11: Covers response sampling when protocol capture is required.",
                "M7-12: Covers driver/DUT, driver/mon, reset, cleanup, delta races.",
                "M7-13: Explains why #0 and arbitrary delays are non-portable fixes.",
                "M7-14: Keeps driver, monitor, scoreboard, and assertion boundaries clean.",
                "M7-15: Includes protocol ownership matrix.",
                "M7-16: Includes cumulative memory cards (1–24).",
                "M7-17: Includes atlas sheets comparing timing styles (1–7).",
                "M7-18: Includes compile-credible UVM 1.2 code labs (1–3).",
                "M7-19: Includes bad-code examples and corrected fixes (1–10).",
                "M7-20: Includes debug/log strategy for timing issues.",
                "M7-21: Includes senior/principal architectural decision points.",
                "M7-22: Includes simulator-portability notes.",
                "M7-23: Avoids generic UVM/SystemVerilog filler.",
                "M7-24: Provides interview Q&A and final recall material.",
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/40 border border-slate-800"
                >
                  <FaCheckSquare className="text-teal-400 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ── §6 Scope and Non-Scope ─────────────────────────────────── */}
          <section id="scope">
            <SectionHeading num={6} title="Scope and Non-Scope" />
            <div className="space-y-4 text-sm">
              <div className="p-4 rounded-xl border border-teal-500/20 bg-teal-500/5">
                <h4 className="font-bold text-teal-300 mb-2">6.1 In Scope</h4>
                <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs">
                  <li>Driver-side timing contracts and raw clock-edge driving</li>
                  <li>Clocking block driving, sampling, and input/output skews</li>
                  <li>Same-edge race patterns and stable-payload behavior</li>
                  <li>Ready/backpressure observation and response/error sampling</li>
                  <li>Cleanup timing, reset timing, and active-item abort</li>
                  <li>item_done() timing and blocking vs NBA assignment choices</li>
                  <li>Race-safe monitor/driver separation and timing debug signatures</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/40">
                <h4 className="font-bold text-slate-300 mb-2">
                  6.2 Non-Scope (Dedicated Modules)
                </h4>
                <Table
                  headers={["Topic", "Reason"]}
                  rows={[
                    ["Full APB master implementation", "Module 8"],
                    ["Full ready/valid streaming driver", "Module 9"],
                    ["Full AXI4-Lite timing", "Module 10"],
                    ["Pipelined outstanding transaction completion", "Module 11"],
                    ["Reactive slave timing", "Module 12"],
                    ["Assertion language deep dive", "Outside driver module scope"],
                    ["Generic SV event-region theory", "Only driver-relevant scheduling covered"],
                  ]}
                />
              </div>

              <Callout type="concept">
                <strong>Boundary Note:</strong> This module teaches only the
                timing rules needed to write deterministic UVM drivers and debug
                driver-induced races.
              </Callout>
            </div>
          </section>

          {/* ── §7 Protocol Mental Model ───────────────────────────────── */}
          <section id="mental-model">
            <SectionHeading num={7} title="Protocol Mental Model" />
            <div className="space-y-6 text-sm text-slate-300">
              <div>
                <h4 className="font-bold text-teal-300 text-base mb-2">
                  7.1 A Driver Converts Transaction Intent Into Timed Pin Activity
                </h4>
                <p className="mb-2">
                  A sequence item says <code>addr = 32'h1000_0040; data = 32'hCAFE_BABE; write = 1;</code>.
                  That is only <strong>intent</strong>. The driver decides:
                </p>
                <Table
                  headers={["Timing Question", "Driver Decision"]}
                  rows={[
                    ["When is address driven?", "Before, at, or after a clocking event depending on protocol"],
                    ["When is data stable?", "Until protocol acceptance or completion"],
                    ["When is valid/control asserted?", "At the defined drive point"],
                    ["When is ready/completion sampled?", "At the defined sample point"],
                    ["When is response captured?", "At protocol-defined response timing"],
                    ["When are pins cleaned up?", "After completion or abort policy"],
                    ["When is item_done() called?", "After the driver contract releases the item"],
                  ]}
                />
              </div>

              <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 text-xs space-y-2">
                <h4 className="font-bold text-rose-300 text-sm">
                  7.2 Why Timing Bugs Are Expensive
                </h4>
                <p className="text-slate-300">
                  Timing bugs cause simulator-dependent pass/fail results, 1-cycle
                  shifted monitor observations, stale <code>ready</code> samples,
                  early valid drops, false protocol assertion fires, and testbench hangs.
                  A bad driver makes a perfectly correct DUT look broken!
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/40">
                <h4 className="font-bold text-teal-300 mb-2">
                  7.3 Driver Timing Must Be Explicit
                </h4>
                <CodeBlock lang="text">{`1. Which edge or clocking event starts the transfer?
2. Which signals are driven before DUT sampling?
3. Which signals must remain stable?
4. Which DUT outputs may the driver sample?
5. Which sample point completes the item?
6. What happens if reset arrives mid-transfer?
7. When are interface pins returned to idle?
8. When is item_done called?`}</CodeBlock>
              </div>
            </div>
          </section>

          {/* ── §8 Timing / Waveform Contract ──────────────────────────── */}
          <section id="timing">
            <SectionHeading num={8} title="Timing / Waveform Contract" />
            <div className="space-y-6 text-sm text-slate-300">
              <div>
                <h4 className="font-bold text-teal-300 text-base mb-2">
                  8.1 Contract Vocabulary
                </h4>
                <Table
                  headers={["Term", "Meaning"]}
                  rows={[
                    ["Drive point", "When driver updates DUT input signals"],
                    ["Sample point", "When driver observes DUT output signals required for progress"],
                    ["Stable window", "Time during which driven payload/control must not change"],
                    ["Acceptance edge", "Edge where protocol says request was accepted"],
                    ["Completion edge", "Edge where transaction is complete"],
                    ["Cleanup point", "When driver deasserts or clears driven signals"],
                    ["Abort point", "When reset cancels active pin-level activity"],
                    ["Sequencer release point", "When driver calls item_done()"],
                  ]}
                />
              </div>

              <div>
                <h4 className="font-bold text-teal-300 text-base mb-2">
                  8.2 Generic Ready/Valid Timing Contract
                </h4>
                <CodeBlock lang="text">{`Driver owns: valid, data
DUT owns:    ready

Transfer accepted when: valid && ready is sampled true at protocol sample point
Payload rule:          data must remain stable while valid=1 until acceptance

Cycle N:             Driver drives valid=1 and data
Cycle N+1, N+2, ...: Driver keeps valid/data stable while ready=0
Cycle K:             valid && ready sampled true -> Transfer accepted
After Cycle K:       Driver cleans up or starts next item`}</CodeBlock>
              </div>

              <div>
                <h4 className="font-bold text-teal-300 text-base mb-2">
                  8.5 Clocking Block Timing Model
                </h4>
                <CodeBlock lang="systemverilog">{`interface rv_if(input logic clk);
  logic reset_n;
  logic valid;
  logic ready;
  logic [31:0] data;

  clocking drv_cb @(posedge clk);
    default input #1step output #0;
    output valid;
    output data;
    input  ready;
    input  reset_n;
  endclocking

  clocking mon_cb @(posedge clk);
    default input #1step;
    input valid;
    input ready;
    input data;
    input reset_n;
  endclocking
endinterface`}</CodeBlock>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs mt-3">
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                    <strong className="text-emerald-300">input #1step:</strong>
                    <p className="mt-1 text-slate-300">
                      Samples signals in the Preponed region before the clock edge,
                      eliminating same-edge race ambiguity.
                    </p>
                  </div>
                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <strong className="text-blue-300">output #0:</strong>
                    <p className="mt-1 text-slate-300">
                      Drives outputs in the Observed / Re-NBA region according to the
                      clocking block output timing schedule.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/50">
                <h4 className="font-bold text-teal-300 mb-2">
                  8.6 Timing Contract Template
                </h4>
                <CodeBlock lang="text">{`Driver Timing Contract:
Clock:      All protocol activity synchronized to rising edge of vif.clk.
Drive:      Driver drives request/control/data through drv_cb outputs.
Sample:     Driver samples ready/response/error through drv_cb inputs.
Stable:     Request payload remains stable while request is outstanding.
Completion: Non-pipelined item completes when acceptance/completion is sampled.
Cleanup:    Driver cleans up driven pins only after completion or abort.
Reset:      If reset asserts mid-item, driver drives idle and marks aborted.
item_done:  Called only after completion, cleanup decision, or abort.`}</CodeBlock>
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
                  9.1 What the Driver Owns
                </h4>
                <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs">
                  <li>Translating sequence item fields into pin activity</li>
                  <li>Driving DUT inputs at the correct time</li>
                  <li>Keeping payload/control stable when protocol requires it</li>
                  <li>Observing required handshake/completion signals</li>
                  <li>Sampling protocol response when needed for progress</li>
                  <li>Cleaning up pins after completion or abort</li>
                  <li>Handling reset abort safely</li>
                  <li>Releasing sequencer item at the correct point</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5">
                <h4 className="font-bold text-rose-300 mb-2">
                  9.2 What Driver Does Not Own
                </h4>
                <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs">
                  <li>End-to-end data correctness checking</li>
                  <li>Predicting DUT output behavior</li>
                  <li>Comparing expected vs actual results</li>
                  <li>Enforcing all protocol assertions</li>
                  <li>Collecting functional coverage</li>
                  <li>Becoming a scoreboard</li>
                  <li>Hiding protocol violations with timing hacks</li>
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
              <h4 className="font-bold text-teal-300 text-base">
                10.1 Non-Pipelined Timing Contract
              </h4>
              <CodeBlock lang="systemverilog">{`seq_item_port.get_next_item(req);
drive_one(req); // drives pins, waits for completion/abort
cleanup_bus();
seq_item_port.item_done();`}</CodeBlock>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-900/60 border border-slate-700/60 rounded-lg">
                  <strong className="text-teal-300">
                    10.2 item_done() Is a Timing Boundary:
                  </strong>
                  <p className="mt-1 text-slate-300">
                    Calling <code>item_done()</code> immediately after{" "}
                    <code>get_next_item()</code> releases the sequencer before pins
                    are driven, corrupting multi-item transactions.
                  </p>
                </div>
                <div className="p-3 bg-slate-900/60 border border-slate-700/60 rounded-lg">
                  <strong className="text-amber-300">
                    10.4 get() Style Distinction:
                  </strong>
                  <p className="mt-1 text-slate-300">
                    <code>seq_item_port.get(req)</code> is self-completing. Never
                    pair <code>get()</code> with <code>item_done()</code>.
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
                <h4 className="font-bold text-teal-300 mb-1">
                  11.3 Reset During Active Item
                </h4>
                <CodeBlock lang="systemverilog">{`seq_item_port.get_next_item(req);

aborted = 0;
drive_one_with_reset_watch(req, aborted);

drive_idle();

if (USE_RSP) begin
  rsp = timing_item::type_id::create("rsp");
  rsp.set_id_info(req);
  rsp.aborted = aborted;
  seq_item_port.item_done(rsp);
end
else begin
  seq_item_port.item_done();
end`}</CodeBlock>
              </div>

              <Callout type="concept">
                <strong>11.4 Reset-Deassertion Stabilization:</strong> Do not drive
                immediately on the exact same clock edge where reset first appears
                high. Wait for one clean, documented driver timing point before
                starting new transactions.
              </Callout>
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
                <strong>12.1 Completion Is Protocol-Defined:</strong> Ready/valid
                completes on <code>valid && ready</code>. APB completes on access
                phase <code>pready===1'b1</code>. Request/response completes when
                response is received.
              </p>
              <p>
                <strong>12.3 Cleanup Must Not Precede Completion:</strong> Deasserting
                valid before ready is sampled high drops the transfer and creates
                phantom data loss.
              </p>
            </div>
          </section>

          {/* ── §13 Protocol Ownership Matrix ──────────────────────────── */}
          <section id="ownership">
            <SectionHeading num={13} title="Protocol Ownership Matrix" />
            <Table
              headers={[
                "Signal / Concept",
                "Driver",
                "DUT",
                "Monitor",
                "Scoreboard",
                "Assertion",
              ]}
              rows={[
                ["Request valid drive", "Owns", "Observes", "Samples", "No", "Checks timing"],
                ["Request payload drive", "Owns", "Observes", "Samples", "May compare", "Checks stability"],
                ["Ready / backpressure", "Samples progress", "Owns", "Samples", "No", "Checks handshake"],
                ["Response / error", "Samples progress", "Owns", "Samples", "May compare", "Checks protocol"],
                ["Functional correctness", "No", "Produces", "Observes", "Owns", "Local properties"],
                ["Payload stability", "Must obey", "Relies on it", "Observes", "No", "Enforces/checks"],
                ["Reset idle drive", "Owns", "Receives", "Observes", "Flushes model", "Checks reset"],
                ["item_done() timing", "Owns", "No", "No", "No", "No"],
                ["Transaction prediction", "No", "No", "No", "Owns", "No"],
                ["Protocol violation reporting", "Defensive only", "No", "Observes", "Reports mismatch", "Owns temporal legality"],
              ]}
            />
          </section>

          {/* ── §14 Memory Cards ────────────────────────────────────────── */}
          <section id="memory">
            <SectionHeading num={14} title="Memory Cards (1–24)" />
            <p className="text-slate-400 text-sm mb-4">
              24 essential memory hooks, core concepts, code anchors, common traps,
              and interview lines:
            </p>
            <div className="space-y-3">
              {module7MemoryCards.map((card, idx) => (
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
              title="Atlas Sheet 1 — Raw Posedge vs Clocking Block Driver Timing"
              accent="blue"
              icon={<FaListAlt size={12} />}
              defaultOpen={true}
            >
              <Table
                headers={["Aspect", "Raw @(posedge clk) Driver", "Clocking Block Driver"]}
                rows={[
                  ["Drive timing", "Procedural block wakes on edge; NBA visibility depends on simulator", "Drive timing encoded by clocking block output skew"],
                  ["Sample timing", "Raw signal read at procedural execution point", "Input sampled according to input skew (#1step) in Preponed region"],
                  ["Race avoidance", "Requires strict manual coding discipline", "Built into interface timing contract when used consistently"],
                  ["Monitor interaction", "Easy to race if monitor also samples raw posedge", "Cleaner when monitor uses independent mon_cb"],
                  ["Portability", "Can be portable if carefully designed", "Usually more reviewable and simulator-independent"],
                  ["Main risk", "Hidden same-edge ordering dependency", "False confidence if protocol timing logic is wrong"],
                ]}
              />
            </CollapsibleCard>

            <CollapsibleCard
              title="Atlas Sheet 2 — Driver Timing Contract Map"
              accent="violet"
              icon={<FaListAlt size={12} />}
            >
              <Table
                headers={["Driver Stage", "Timing Question", "Typical Bug", "Correct Driver Rule"]}
                rows={[
                  ["Fetch item", "Is reset active?", "Fetches item during reset and hangs", "Wait reset-safe state before fetch"],
                  ["Drive request", "When are pins updated?", "DUT samples old values", "Drive according to protocol setup requirement"],
                  ["Hold stable", "What stays unchanged?", "Payload changes under backpressure", "Hold payload/control until acceptance"],
                  ["Sample progress", "What DUT outputs sampled?", "Driver samples arbitrary outputs", "Sample only ready/completion needed for progress"],
                  ["Complete", "What indicates done?", "Drops control early", "Wait protocol completion"],
                  ["Response", "When is response valid?", "Stale response object", "Populate response only at legal completion point"],
                  ["Cleanup", "When return idle?", "Ghost transaction or early deassertion", "Cleanup after completion or abort"],
                  ["Release sequencer", "When call item_done()?", "Next item overlaps previous", "Release after completion/abort cleanup"],
                ]}
              />
            </CollapsibleCard>

            <CollapsibleCard
              title="Atlas Sheet 3 — Event-Ordering Risk Map"
              accent="rose"
              icon={<FaListAlt size={12} />}
            >
              <Table
                headers={["Pattern", "Risk", "Better Pattern"]}
                rows={[
                  ["Driver raw posedge + Monitor raw posedge", "Monitor may sample old value", "Separate drv_cb and mon_cb"],
                  ["Driver raw write + clocking block read", "Mixed timing semantics", "Use drv_cb consistently in driver"],
                  ["#0 before sampling", "Delta-cycle dependency", "Clocking block input skew (#1step)"],
                  ["#1 after edge", "Timescale-dependent behavior", "Protocol-defined clocking event"],
                  ["Blocking write to pin at same edge", "Race with DUT/monitor procedural code", "Consistent NBA or clocking block output policy"],
                  ["Reset thread & drive thread write same pin", "Multiple procedural owners", "Serialized reset/drive ownership"],
                  ["item_done() before cleanup", "Sequencer starts next item too early", "Cleanup before release"],
                ]}
              />
            </CollapsibleCard>

            <CollapsibleCard
              title="Atlas Sheet 4 — Assignment Style Decision Sheet"
              accent="emerald"
              icon={<FaListAlt size={12} />}
            >
              <Table
                headers={["Assignment Target", "Preferred Style", "Reason"]}
                rows={[
                  ["Local variable inside task", "Blocking (=)", "Immediate procedural computation"],
                  ["Temporary sampled flag", "Blocking (=)", "Local decision state"],
                  ["Interface pin through clocking block", "Nonblocking (<=)", "Race-safe scheduled pin update"],
                  ["Raw interface pin in clocked driver", "Usually nonblocking (<=)", "Avoid immediate same-edge procedural race"],
                  ["Combinational helper variable", "Blocking (=)", "Local calculation"],
                  ["Same interface signal from multiple tasks", "Avoid", "Creates ownership race"],
                ]}
              />
            </CollapsibleCard>

            <CollapsibleCard
              title="Atlas Sheet 5 — Reset Timing Decision Sheet"
              accent="amber"
              icon={<FaListAlt size={12} />}
            >
              <Table
                headers={["Reset Timing Case", "Driver Behavior"]}
                rows={[
                  ["Reset active before fetch", "Do not fetch item; drive idle"],
                  ["Reset asserts after fetch before drive", "Mark aborted; drive idle; close sequencer contract"],
                  ["Reset asserts during active valid", "Deassert driver-owned controls; drive idle; mark aborted"],
                  ["Reset asserts while waiting for ready", "Stop wait; drive idle; mark aborted"],
                  ["Reset asserts during response sampling", "Do not sample stale response; mark aborted"],
                  ["Reset deasserts", "Wait clean restart point before new traffic"],
                  ["Reset flaps", "Stay idle until stable policy is satisfied"],
                ]}
              />
            </CollapsibleCard>

            <CollapsibleCard
              title="Atlas Sheet 6 — Responsibility Boundary Sheet"
              accent="blue"
              icon={<FaListAlt size={12} />}
            >
              <Table
                headers={["Question", "Driver", "Monitor", "Scoreboard", "Assertion"]}
                rows={[
                  ["Who drives valid?", "Yes", "No", "No", "No"],
                  ["Who samples pins for observed item?", "No (except progress)", "Yes", "No", "Sometimes"],
                  ["Who decides item acceptance?", "Yes (for progress)", "Observes", "No", "May check"],
                  ["Who checks payload stability?", "Must obey", "Observes", "No", "Best reusable enforcer"],
                  ["Who compares expected/actual data?", "No", "Sends observations", "Yes", "Local property"],
                  ["Who handles item_done()?", "Yes", "No", "No", "No"],
                  ["Who handles reset idle drive?", "Yes", "Observes", "Flushes model", "Checks legality"],
                ]}
              />
            </CollapsibleCard>

            <CollapsibleCard
              title="Atlas Sheet 7 — Plain SV vs UVM vs cocotb Timing Analogy"
              accent="violet"
              icon={<FaListAlt size={12} />}
            >
              <Table
                headers={["Concept", "Plain SystemVerilog Driver", "UVM Driver", "cocotb-Style Analogy"]}
                rows={[
                  ["Transaction source", "Manual task argument", "Sequence item from sequencer", "Python transaction object"],
                  ["Drive point", "@(posedge clk) or clocking block", "Same, inside run_phase task flow", "Clock-edge await + signal assignment"],
                  ["Completion wait", "Manual loop", "Driver loop before item_done()", "Await condition loop"],
                  ["Reset abort", "Manual branch", "Must also close sequencer contract", "Must resolve coroutine state"],
                  ["Response", "Manual output argument", "item_done(rsp) or put_response()", "Queue/event/callback"],
                  ["Race prevention", "Clocking block / scheduling", "Same, plus UVM handshake correctness", "Simulator phase discipline"],
                  ["Main risk", "Event ordering", "Event ordering + sequencer deadlock", "Coroutine phase misuse"],
                ]}
              />
            </CollapsibleCard>
          </section>

          {/* ── §16 Code Labs ───────────────────────────────────────────── */}
          <section id="codelabs">
            <SectionHeading num={16} title="Code Labs (1–3)" />

            {/* Lab 1 */}
            <CollapsibleCard
              title="Code Lab 1 — Race-Safe Ready/Valid Source Driver"
              accent="emerald"
              icon={<FaFlask size={12} />}
              defaultOpen={true}
            >
              <div className="space-y-3 text-xs text-slate-300">
                <p>
                  <strong>Purpose:</strong> Build a non-pipelined ready/valid source
                  driver that drives valid/data, waits for ready, preserves payload
                  stability, handles reset-abort, and calls <code>item_done()</code>.
                </p>

                <div className="font-bold text-teal-300">1A. Interface:</div>
                <CodeBlock lang="systemverilog">{`interface rv_if(input logic clk);
  logic reset_n;
  logic valid;
  logic ready;
  logic [31:0] data;

  clocking drv_cb @(posedge clk);
    default input #1step output #0;
    output valid;
    output data;
    input  ready;
    input  reset_n;
  endclocking

  clocking mon_cb @(posedge clk);
    default input #1step;
    input valid;
    input ready;
    input data;
    input reset_n;
  endclocking

  modport drv_mp(clocking drv_cb, input clk);
  modport mon_mp(clocking mon_cb, input clk);
endinterface`}</CodeBlock>

                <div className="font-bold text-teal-300">1B. Sequence Item:</div>
                <CodeBlock lang="systemverilog">{`class rv_item extends uvm_sequence_item;
  rand bit [31:0] data;
       bit        aborted;

  \`uvm_object_utils_begin(rv_item)
    \`uvm_field_int(data,    UVM_ALL_ON)
    \`uvm_field_int(aborted, UVM_ALL_ON)
  \`uvm_object_utils_end

  function new(string name = "rv_item");
    super.new(name);
  endfunction
endclass`}</CodeBlock>

                <div className="font-bold text-teal-300">
                  1D. Final Solution Driver:
                </div>
                <CodeBlock lang="systemverilog">{`class rv_timing_driver extends uvm_driver #(rv_item);
  \`uvm_component_utils(rv_timing_driver)

  virtual rv_if vif;

  function new(string name = "rv_timing_driver", uvm_component parent = null);
    super.new(name, parent);
  endfunction

  function void build_phase(uvm_phase phase);
    super.build_phase(phase);
    if (!uvm_config_db#(virtual rv_if)::get(this, "", "vif", vif)) begin
      \`uvm_fatal("NOVIF", "virtual interface rv_if not set")
    end
  endfunction

  task run_phase(uvm_phase phase);
    rv_item req;
    bit aborted;

    drive_idle_at_cb();

    forever begin
      wait_reset_released_clean();

      seq_item_port.get_next_item(req);

      aborted = 0;
      drive_one_item(req, aborted);

      drive_idle_at_cb();

      req.aborted = aborted;
      seq_item_port.item_done();
    end
  endtask

  task drive_idle_at_cb();
    @(vif.drv_cb);
    vif.drv_cb.valid <= 1'b0;
    vif.drv_cb.data  <= '0;
  endtask

  task drive_idle_no_wait();
    vif.drv_cb.valid <= 1'b0;
    vif.drv_cb.data  <= '0;
  endtask

  task wait_reset_released_clean();
    do begin
      @(vif.drv_cb);
      drive_idle_no_wait();
    end while (!vif.drv_cb.reset_n);

    @(vif.drv_cb);
    drive_idle_no_wait();
  endtask

  task drive_one_item(rv_item req, output bit aborted);
    aborted = 0;

    @(vif.drv_cb);
    if (!vif.drv_cb.reset_n) begin
      aborted = 1;
      drive_idle_no_wait();
      return;
    end

    vif.drv_cb.valid <= 1'b1;
    vif.drv_cb.data  <= req.data;

    do begin
      @(vif.drv_cb);
      if (!vif.drv_cb.reset_n) begin
        aborted = 1;
        drive_idle_no_wait();
        return;
      end
    end while (!vif.drv_cb.ready);
  endtask
endclass`}</CodeBlock>
              </div>
            </CollapsibleCard>

            {/* Lab 2 */}
            <CollapsibleCard
              title="Code Lab 2 — Response-Coupled Timing Driver Fragment"
              accent="blue"
              icon={<FaFlask size={12} />}
            >
              <div className="space-y-3 text-xs text-slate-300">
                <p>
                  <strong>Purpose:</strong> Show how to sample protocol responses
                  at the exact completion point and route back to sequence using{" "}
                  <code>item_done(rsp)</code> and <code>set_id_info(req)</code>.
                </p>
                <CodeBlock lang="systemverilog">{`task drive_and_capture_response(rsp_timing_item req);
  rsp_timing_item rsp;
  bit sampled_err;
  bit aborted;

  sampled_err = 0;
  aborted     = 0;

  drive_request_phase(req);

  do begin
    @(vif.drv_cb);
    if (!vif.drv_cb.reset_n) begin
      aborted = 1;
      drive_idle_no_wait();
      break;
    end
  end while (!vif.drv_cb.done);

  if (!aborted) begin
    sampled_err = vif.drv_cb.err;
  end

  drive_idle_at_cb();

  rsp = rsp_timing_item::type_id::create("rsp");
  rsp.set_id_info(req);
  rsp.data    = req.data;
  rsp.err     = sampled_err;
  rsp.aborted = aborted;

  seq_item_port.item_done(rsp);
endtask`}</CodeBlock>
              </div>
            </CollapsibleCard>

            {/* Lab 3 */}
            <CollapsibleCard
              title="Code Lab 3 — Raw Posedge Driver Patch Exercise"
              accent="rose"
              icon={<FaFlask size={12} />}
            >
              <div className="space-y-3 text-xs text-slate-300">
                <div className="text-rose-400 font-bold">❌ Bad Driver:</div>
                <CodeBlock lang="systemverilog">{`task drive_bad(rv_item req);
  @(posedge vif.clk);
  vif.valid = 1'b1;
  vif.data  = req.data;

  @(posedge vif.clk);
  if (vif.ready) begin
    vif.valid = 1'b0;
  end

  seq_item_port.item_done();
endtask`}</CodeBlock>

                <div className="text-emerald-400 font-bold">
                  ✅ Corrected Driver Task:
                </div>
                <CodeBlock lang="systemverilog">{`task drive_good(rv_item req, output bit aborted);
  aborted = 0;

  @(vif.drv_cb);
  if (!vif.drv_cb.reset_n) begin
    aborted = 1;
    vif.drv_cb.valid <= 1'b0;
    vif.drv_cb.data  <= '0;
    return;
  end

  vif.drv_cb.valid <= 1'b1;
  vif.drv_cb.data  <= req.data;

  do begin
    @(vif.drv_cb);
    if (!vif.drv_cb.reset_n) begin
      aborted = 1;
      vif.drv_cb.valid <= 1'b0;
      vif.drv_cb.data  <= '0;
      return;
    end
  end while (!vif.drv_cb.ready);

  vif.drv_cb.valid <= 1'b0;
  vif.drv_cb.data  <= '0;
endtask`}</CodeBlock>
              </div>
            </CollapsibleCard>
          </section>

          {/* ── §17 Bug Gallery ─────────────────────────────────────────── */}
          <section id="bugs">
            <SectionHeading num={17} title="Bug Gallery (1–10)" />
            <div className="space-y-4">
              {module7BugGallery.map((bug, idx) => (
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
                "Drive point defined: Every driver-owned signal is driven at documented event or clocking block.",
                "Sample point defined: Every sampled DUT signal uses documented timing (#1step).",
                "No mixed raw/clocking access: Driver does not drive via drv_cb and sample raw pins.",
                "No raw response sampling: Response/status signals are sampled through drv_cb.",
                "No arbitrary #0: No delta-cycle race patches anywhere in the driver.",
                "No arbitrary #1: No timescale-dependent protocol timing delays.",
                "Stable payload: Payload/control held stable until protocol acceptance (valid && ready).",
                "Completion explicit: Driver waits for legal completion before cleanup.",
                "Cleanup explicit: Driver returns pins to legal idle or next legal state.",
                "item_done() placement: Called after completion or reset-abort cleanup.",
                "No item_done() after get(): get() style is not mixed with item_done().",
                "Response timing legal: Response sampled only when valid by protocol.",
                "Response routing legal: set_id_info(req) used when response routing matters.",
                "Reset-before-fetch handled: Driver does not fetch new items during reset.",
                "Reset-after-fetch handled: Driver closes sequencer contract for fetched item.",
                "Reset deassertion handled: Driver waits clean restart timing point.",
                "Forks scoped: disable fork or named block kill does not kill unrelated threads.",
                "One owner per pin: No independent procedural drivers for same pin.",
                "Monitor separate: Monitor reconstructs from pins, not driver internals.",
                "Assertions separate: Temporal legality checking not hidden in driver.",
                "Scoreboard separate: Functional comparison not performed by driver.",
              ].map((check, i) => (
                <li key={i} className="flex items-center gap-2">
                  <FaShieldAlt className="text-teal-400 shrink-0" />
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
              <h4 className="font-bold text-teal-300 text-xs uppercase tracking-wider">
                19.3 Example Driver Debug Hooks
              </h4>
              <CodeBlock lang="systemverilog">{`\`uvm_info("DRV_FETCH",
  $sformatf("txn=%0d id=%0d data=0x%0h",
            local_txn_count, req.get_transaction_id(), req.data),
  UVM_MEDIUM)

\`uvm_info("DRV_DRIVE",
  $sformatf("txn=%0d valid=1 data=0x%0h reset_n=%0b",
            local_txn_count, req.data, vif.drv_cb.reset_n),
  UVM_HIGH)

\`uvm_info("DRV_ACCEPT",
  $sformatf("txn=%0d ready=%0b reset_n=%0b aborted=%0b",
            local_txn_count, vif.drv_cb.ready, vif.drv_cb.reset_n, aborted),
  UVM_MEDIUM)`}</CodeBlock>

              <h4 className="font-bold text-teal-300 text-xs uppercase tracking-wider pt-2">
                19.4 Debug Signature Table
              </h4>
              <Table
                headers={["Symptom", "Likely Driver Timing Cause"]}
                rows={[
                  ["Monitor one cycle late", "Raw same-edge driver/monitor race"],
                  ["Item disappears under stall", "Driver dropped valid before ready"],
                  ["Sequence hang after reset", "Fetched item not released with item_done()"],
                  ["Response stale", "Response sampled before completion"],
                  ["Works in one simulator only", "Scheduler-order dependency, #0, or raw edge race"],
                  ["Duplicate transaction", "Cleanup too late or valid held into next item"],
                  ["First post-reset item corrupt", "No reset restart stabilization"],
                  ["Scoreboard mismatch with clean waveform", "Possible monitor sampling race; compare monitor timing point"],
                  ["Assertion stable-payload failure", "Driver changed data while stalled"],
                  ["Random failure under logging changes", "Delta-cycle or procedural ordering dependency"],
                ]}
              />
            </div>
          </section>

          {/* ── §20 Monitor / Scoreboard / Assertion Boundary ───────────── */}
          <section id="verification-boundary">
            <SectionHeading
              num={20}
              title="Monitor / Scoreboard / Assertion Boundary"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-teal-500/20 bg-slate-900/50 space-y-2">
                <div className="font-bold text-teal-300">
                  20.2 Driver vs Monitor
                </div>
                <p className="text-slate-300 leading-relaxed">
                  <strong>Driver:</strong> Drives DUT inputs via <code>drv_cb</code>,
                  samples progress signals, releases sequencer.
                  <br />
                  <strong>Monitor:</strong> Passively observes interface via{" "}
                  <code>mon_cb</code> and reconstructs transactions for analysis
                  ports without accessing driver internals.
                </p>
              </div>
              <div className="p-4 rounded-xl border border-violet-500/20 bg-slate-900/50 space-y-2">
                <div className="font-bold text-violet-300">
                  20.3 Scoreboard vs 20.4 Assertions
                </div>
                <p className="text-slate-300 leading-relaxed">
                  <strong>Scoreboard:</strong> Compares expected vs observed
                  functional data.
                  <br />
                  <strong>Assertions (SVA):</strong> Best place for temporal rules
                  (payload stability while stalled, reset idle requirements).
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
              headers={["Decision", "Choices", "Module 7 Senior Recommendation"]}
              rows={[
                ["Decision 1: Raw posedge or clocking block?", "Raw @(posedge clk) vs drv_cb", "Clocking block for reusable VIP; eliminates active-region race ambiguity."],
                ["Decision 2: When to fetch relative to reset?", "Post-reset only vs Fetch & abort vs Fetch & hold", "Do not fetch new items during active reset. Model explicit abort for stress."],
                ["Decision 3: Where to put item_done()?", "After fetch vs After accept vs After complete", "After protocol completion or reset-abort cleanup in non-pipelined drivers."],
                ["Decision 4: Response return method?", "item_done() only vs item_done(rsp) vs put_response", "item_done(rsp) with set_id_info(req) when response is ready at completion."],
                ["Decision 5: Reset watchdog architecture?", "Independent thread vs Scoped fork vs Poll", "Scoped named fork : block with join_any and serialized pin ownership."],
              ]}
            />
          </section>

          {/* ── §22 Scalability Notes ───────────────────────────────────── */}
          <section id="scalability">
            <SectionHeading num={22} title="Scalability Notes" />
            <div className="space-y-3 text-sm text-slate-300">
              <p>
                <strong>22.1 Multi-Channel Drivers:</strong> Each channel requires
                its own drive/sample timing contract. Reset handling must serialize
                pin ownership across channels.
              </p>
              <p>
                <strong>22.2 Pipelined Drivers (Forward Ref — Module 11):</strong>{" "}
                In pipelined architectures, <em>request acceptance != transaction
                completion</em>. <code>item_done()</code> may be called upon
                acceptance if response tracking is handled via outstanding queues.
              </p>
              <p>
                <strong>22.4 Simulator Portability:</strong> Avoid <code>#0</code>,
                timescale-sensitive delays, and mixed raw/clocking access so tests
                run identically across Questa, VCS, and Xcelium.
              </p>
            </div>
          </section>

          {/* ── §23 Review Checklist ────────────────────────────────────── */}
          <section id="review">
            <SectionHeading num={23} title="Review Checklist" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/40 space-y-2">
                <h5 className="font-bold text-teal-300">Timing & SV Contract</h5>
                <ul className="space-y-1 text-slate-300">
                  <li>✔ Drive point & sample point documented</li>
                  <li>✔ Stable payload window enforced</li>
                  <li>✔ Cleanup scheduled after completion</li>
                  <li>✔ No arbitrary #0 or #1 delays</li>
                  <li>✔ No mixed raw and clocking access</li>
                  <li>✔ Single procedural owner per pin</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/40 space-y-2">
                <h5 className="font-bold text-violet-300">UVM API & Reset</h5>
                <ul className="space-y-1 text-slate-300">
                  <li>✔ get_next_item() paired with item_done()</li>
                  <li>✔ No get() / item_done() mixing</li>
                  <li>✔ set_id_info(req) on response objects</li>
                  <li>✔ Reset abort releases sequencer handshake</li>
                  <li>✔ Clean restart timing point after reset</li>
                  <li>✔ Zero scoreboard functional checks in driver</li>
                </ul>
              </div>
            </div>
          </section>

          {/* ── §24 Interview Q&A ───────────────────────────────────────── */}
          <section id="interview">
            <SectionHeading num={24} title="Interview Q&A (Q1–Q12)" />
            <div className="space-y-4">
              {module7InterviewQA.map((qa, idx) => (
                <CollapsibleCard
                  key={idx}
                  title={qa.q}
                  accent="teal"
                  icon={<FaQuestionCircle size={12} />}
                  defaultOpen={idx < 2}
                >
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong className="text-emerald-300">Short Answer:</strong>{" "}
                      {qa.short}
                    </p>
                    <p className="text-slate-300 leading-relaxed">
                      <strong className="text-teal-300">Deep Answer:</strong>{" "}
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
              title="Final Recall Card — Timing, Clocking Blocks, & Races"
            />
            <div className="p-5 rounded-xl border border-teal-500/30 bg-linear-to-r from-teal-500/10 to-blue-500/10 space-y-3">
              <Callout type="hook">
                <strong>Memory Hook:</strong> "Drive late, sample wrong, release
                early — that is how drivers lie."
              </Callout>
              <CodeBlock lang="text">{`GET
WAIT RESET SAFE
DRIVE AT DEFINED POINT
HOLD STABLE
SAMPLE PROGRESS AT DEFINED POINT
CAPTURE RESPONSE IF REQUIRED
CLEANUP
ITEM_DONE / RESPONSE RETURN`}</CodeBlock>
              <p className="text-xs text-slate-300">
                <strong>Interview Line:</strong> "A driver is correct only when its
                timing contract is explicit enough that waveform behavior, sequence
                ownership, reset abort, and response completion are all deterministic."
              </p>
            </div>
          </section>

          {/* ── §26 Key Takeaways ───────────────────────────────────────── */}
          <section id="takeaways">
            <SectionHeading num={26} title="Key Takeaways" />
            <ol className="space-y-1.5 list-decimal list-inside text-slate-300 text-sm">
              {[
                "A UVM driver is a temporal adapter, not an assignment script.",
                "Same-edge driver/DUT/monitor code can race even when all code uses @(posedge clk).",
                "Clocking blocks make drive/sample timing explicit, but protocol logic still matters.",
                "Stable payload is a driver obligation.",
                "Cleanup is timed protocol behavior.",
                "item_done() must align with the selected driver contract.",
                "Reset abort must clean pins and close fetched sequencer items.",
                "Response objects must be populated only at legal response timing.",
                "set_id_info(req) is required when response routing matters.",
                "Portable drivers do not rely on #0, arbitrary #1, or simulator process ordering.",
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
                Comprehensive question bank for senior/principal verification rounds:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Why is @(posedge clk) not a sufficient driver timing contract?</li>
                <li>What race can happen between a raw-posedge driver and raw-posedge monitor?</li>
                <li>What does clocking block input #1step solve?</li>
                <li>Why is output #0 not a universal fix?</li>
                <li>When should a driver sample DUT outputs?</li>
                <li>Why must ready/valid payload remain stable while stalled?</li>
                <li>What is wrong with dropping valid after one cycle?</li>
                <li>Why is #0 not a valid race fix?</li>
                <li>Why are arbitrary #1 delays non-portable?</li>
                <li>Where should item_done() be called in a non-pipelined driver?</li>
                <li>What happens if reset arrives after get_next_item()?</li>
                <li>Why must response sampling wait for protocol completion?</li>
                <li>Why use set_id_info(req)?</li>
                <li>What is wrong with mixing raw interface access and clocking-block access?</li>
                <li>How do you prevent reset and traffic threads from fighting over the same pin?</li>
                <li>What belongs in the driver vs monitor vs scoreboard vs assertion?</li>
                <li>How would you debug a one-cycle shifted monitor observation?</li>
                <li>How would you defend clocking-block usage in an interview?</li>
                <li>When is item_done(rsp) cleaner than put_response(rsp)?</li>
                <li>What timing questions must be answered before approving a reusable driver?</li>
              </ol>
            </div>
          </section>

          {/* ── §28 Coding Exercise ─────────────────────────────────────── */}
          <section id="exercise">
            <SectionHeading
              num={28}
              title="Coding Exercise — Repair a Broken Ready/Valid Driver"
            />
            <div className="space-y-4 text-sm text-slate-300">
              <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 space-y-2">
                <div className="font-bold text-rose-300">❌ Broken Driver:</div>
                <CodeBlock lang="systemverilog">{`task run_phase(uvm_phase phase);
  rv_item req;
  forever begin
    seq_item_port.get_next_item(req);
    @(posedge vif.clk);
    vif.valid = 1'b1;
    vif.data  = req.data;
    #0;
    if (vif.ready) begin
      vif.valid = 1'b0;
    end
    seq_item_port.item_done();
  end
endtask`}</CodeBlock>
              </div>

              <CollapsibleCard
                title="Exercise Requirements & Expected Solution"
                accent="teal"
                defaultOpen={true}
              >
                <div className="space-y-2 text-xs text-slate-300">
                  <p className="font-semibold text-teal-300">Required Fixes:</p>
                  <ol className="list-decimal list-inside space-y-0.5">
                    <li>Use clocking block access (drv_cb).</li>
                    <li>Wait for reset deassertion before fetching items.</li>
                    <li>Drive idle during reset.</li>
                    <li>Hold valid/data stable until ready.</li>
                    <li>Handle reset during active transfer.</li>
                    <li>Remove #0 and raw vif.ready.</li>
                    <li>Call item_done() exactly once after completion or abort.</li>
                    <li>Ensure helper tasks use the same timing abstraction.</li>
                  </ol>
                  <p className="pt-2 font-semibold text-emerald-300">
                    Expected Solution Shape:
                  </p>
                  <CodeBlock lang="systemverilog">{`task run_phase(uvm_phase phase);
  rv_item req;
  bit aborted;
  drive_idle_at_cb();

  forever begin
    wait_reset_released_clean();
    seq_item_port.get_next_item(req);

    aborted = 0;
    drive_one_item(req, aborted);

    drive_idle_at_cb();
    req.aborted = aborted;
    seq_item_port.item_done();
  end
endtask`}</CodeBlock>
                </div>
              </CollapsibleCard>
            </div>
          </section>

          {/* ── §29 Final Readiness Verdict ─────────────────────────────── */}
          <section id="verdict">
            <SectionHeading num={29} title="Final Readiness Verdict" />
            <div className="p-6 rounded-2xl border border-teal-500/30 bg-teal-500/10 space-y-3">
              <h3 className="text-lg font-bold text-teal-300 flex items-center gap-2">
                <FaCheckSquare /> Module 7 — Final Readiness Verdict: PASS
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Module 7: Timing, Clocking Blocks, and Race Conditions is fully
                converted into React. All 24 memory cards, 7 atlas sheets, 3 code
                labs, 10 bug gallery entries, race-condition checklists, logging
                strategies, and 12 interview Q&As are complete and verified.
              </p>
              <p className="text-xs text-teal-200/80">
                You are now prepared to advance to Module 8: APB Master Driver Deep
                Dive.
              </p>
            </div>
          </section>

          {/* Navigation to next module */}
          <ModuleNavigation
            nextPath="/driver-mastery/module8"
            nextTitle="Module 8: APB Master Driver Deep Dive →"
          />
        </main>
      </div>
    </div>
  );
};

export default Module7;
