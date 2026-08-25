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

const module8MemoryCards = [
  {
    title: "Card 1 — APB Driver Starts From States, Not UVM Calls [PROTOCOL]",
    accent: "blue",
    hook: "IDLE -> SETUP -> ACCESS -> COMPLETE -> CLEANUP",
    concept:
      "An APB master driver is a state executor. The UVM item tells the driver what transfer is needed. APB timing tells the driver when each pin can change. A correct driver starts with: What APB state am I entering? What signals must be stable? What output am I allowed to sample? When is the item truly complete?",
    code: `typedef enum {APB_IDLE, APB_SETUP, APB_ACCESS} apb_phase_e;
apb_phase_e phase;
phase = APB_SETUP;
drive_setup(req);
phase = APB_ACCESS;
drive_access_and_sample(req);
phase = APB_IDLE;
drive_idle();`,
    trap: "Treating APB like ready/valid (if (pready) drive_next_transfer();). PREADY is not a global ready signal; it is meaningful only during APB access.",
    interview:
      "I implement an APB driver as a phase machine. UVM fetches the transaction, but APB phase rules determine when I drive, wait, sample, and complete the item.",
  },
  {
    title: "Card 2 — Setup Is One Cycle, Not “Until Ready” [WAVEFORM]",
    accent: "violet",
    hook: "Setup prepares. Access completes.",
    concept:
      "In APB setup: PSEL=1, PENABLE=0, and address/control/write data are valid. Setup does not wait for PREADY. PREADY is an access-phase completion signal. The driver must move from setup to access on the next APB clock.",
    code: `task drive_setup(apb_item req);
  vif.master_cb.psel    <= 1'b1;
  vif.master_cb.penable <= 1'b0;
  vif.master_cb.paddr   <= req.addr;
  vif.master_cb.pwrite  <= req.is_write();
  vif.master_cb.pwdata  <= req.wdata;
  vif.master_cb.pstrb   <= req.is_write() ? req.strb : '0;
  vif.master_cb.pprot   <= req.prot;
  @(vif.master_cb); // exactly one setup cycle
endtask`,
    trap: "while (!vif.master_cb.pready) @(vif.master_cb); in setup. That waits on PREADY before the access phase exists.",
    interview:
      "I never wait for PREADY in setup. APB setup is a one-cycle address/control phase; PREADY matters after PENABLE is asserted.",
  },
  {
    title: "Card 3 — Access Begins When PENABLE Goes High [WAVEFORM]",
    accent: "emerald",
    hook: "PENABLE turns request into access.",
    concept:
      "The access phase is where the APB completer/slave can complete or extend the transfer. In access: PSEL=1, PENABLE=1, and PREADY controls completion. The driver asserts PENABLE, then waits for PREADY.",
    code: `task drive_access_and_sample(apb_item req);
  int unsigned wait_count = 0;
  vif.master_cb.penable <= 1'b1;
  do begin
    @(vif.master_cb);
    if (reset_active()) return;
    if (!vif.master_cb.pready) wait_count++;
  end while (!vif.master_cb.pready);
  req.wait_cycles = wait_count;
endtask`,
    trap: "Asserting PSEL and PENABLE in the same cycle for a new transfer. That skips setup and violates APB timing.",
    interview:
      "PENABLE must be low during setup and high during access. A new APB transfer cannot start with PSEL and PENABLE asserted together.",
  },
  {
    title: "Card 4 — Stable Means Stable Until Completion [WAVEFORM]",
    accent: "amber",
    hook: "If PREADY=0, freeze the request.",
    concept:
      "During wait states, the APB master must hold transfer signals stable: address, write direction, select, enable, write data, strobe, and protection fields.",
    code: `// During access wait, do not update these:
vif.master_cb.paddr
vif.master_cb.pwrite
vif.master_cb.pwdata
vif.master_cb.pstrb
vif.master_cb.pprot
vif.master_cb.psel
vif.master_cb.penable`,
    trap: "Fetching and applying the next item while current access is still waiting on pready.",
    interview:
      "While PREADY is low in APB access, the master must not modify the active transfer. I do not fetch or prepare the next item in a way that can corrupt active pins.",
  },
  {
    title: "Card 5 — PRDATA Is Completion Data, Not Access-Start Data [PROTOCOL]",
    accent: "rose",
    hook: "Read data is valid at the finish line.",
    concept:
      "For APB reads, PRDATA is sampled only when the transfer completes: PSEL && PENABLE && PREADY && !PWRITE.",
    code: `if (!req.is_write()) begin
  req.rdata = vif.master_cb.prdata;
end
// This code belongs strictly after observing PREADY.`,
    trap: "Sampling PRDATA immediately after asserting PENABLE. That passes only with zero-wait slaves.",
    interview:
      "I sample APB read data only in the completion cycle. Any earlier value is not architecturally valid for the transaction.",
  },
  {
    title: "Card 6 — PSLVERR Is Not an Always-Valid Error Pin [PROTOCOL]",
    accent: "rose",
    hook: "Error is valid only with completion.",
    concept:
      "PSLVERR is valid only in the final cycle of an APB transfer (PSEL && PENABLE && PREADY). The driver may capture it for response reporting, but it must not interpret random idle/setup/wait values.",
    code: `req.slverr = vif.master_cb.pslverr;
// Belongs strictly after completion, not before.`,
    trap: "Polling PSLVERR during wait states and reporting false errors.",
    interview:
      "I treat PSLVERR as a response sampled at APB completion, not as an asynchronous error signal.",
  },
  {
    title: "Card 7 — item_done() Means APB Terminal State [UVM]",
    accent: "violet",
    hook: "No done before terminal.",
    concept:
      "In a blocking APB driver, an item reaches terminal state when one of these happens: APB completion with PREADY, reset abort, or configured timeout abort. Only then should the driver call item_done().",
    code: `seq_item_port.get_next_item(req);
drive_one_transfer(req); // completes, aborts, or times out
seq_item_port.item_done();`,
    trap: "Calling item_done() immediately after fetch. That silently changes the contract from blocking to early-release.",
    interview:
      "For a non-pipelined APB driver, item_done() follows bus terminal state because the sequence item semantically represents the full APB transfer, not just request acceptance.",
  },
  {
    title: "Card 8 — get() and get_next_item() Are Different Contracts [UVM]",
    accent: "blue",
    hook: "get() auto-completes. get_next_item() needs done.",
    concept:
      "With get_next_item(): get_next_item(req) is paired with item_done(). With get(): get(req) already completes the sequencer handshake. Never call item_done() after get().",
    code: `seq_item_port.get_next_item(req);
drive_apb_transfer(req);
seq_item_port.item_done();`,
    trap: "seq_item_port.get(req); drive_apb_transfer(req); seq_item_port.item_done(); (double completion error).",
    interview:
      "I do not mix pull-port contracts. get_next_item() pairs with item_done(). get() does not.",
  },
  {
    title: "Card 9 — Response Object Is Optional, Response Semantics Are Not [UVM]",
    accent: "emerald",
    hook: "No response object? Still define response behavior.",
    concept:
      "An APB read has response data. An APB write has at least completion/error status. The driver must decide where that response is stored: directly in req, in a separate rsp, or in monitor-only observation.",
    code: `// Style A - Request mutation:
req.rdata  = sampled_rdata;
req.slverr = sampled_pslverr;
seq_item_port.item_done();

// Style B - Explicit response:
rsp = apb_item::type_id::create("rsp");
rsp.copy(req);
rsp.set_id_info(req);
seq_item_port.item_done();
seq_item_port.put_response(rsp);`,
    trap: "Creating rsp but forgetting rsp.set_id_info(req). Then get_response() in the sequence may hang.",
    interview:
      "I use explicit responses when sequences need response routing. In that case, I call set_id_info(req) before put_response().",
  },
  {
    title: "Card 10 — Reset Abort Is Not PSLVERR [RESET]",
    accent: "rose",
    hook: "Reset kills the transfer; APB error completes it.",
    concept:
      "A transfer aborted by reset did not legally complete through APB. Therefore reset abort != PSLVERR. Use separate transaction fields: bit slverr, bit aborted, bit timeout.",
    code: `if (reset_active()) begin
  req.aborted = 1'b1;
  req.timeout = 1'b0;
  req.slverr  = 1'b0; // do not invent APB error
  drive_idle();
  return;
end`,
    trap: "Setting slverr=1 whenever reset interrupts a transfer. That lies about what happened on APB.",
    interview:
      "I separate APB error response from environment abort causes. PSLVERR is sampled only on legal APB completion; reset abort is a different terminal state.",
  },
  {
    title: "Card 11 — Timeout Is Environment Policy, Not APB Law [ARCH]",
    accent: "amber",
    hook: "Timeout prevents simulation hang; it is not protocol truth.",
    concept:
      "APB permits wait states. A project may impose a maximum wait count for verification progress or design requirements. The driver may implement timeout as a configurable guard.",
    code: `if (cfg.enable_timeout && wait_count > cfg.max_wait_cycles) begin
  req.timeout = 1'b1;
  \`uvm_error("APB_TIMEOUT",
    $sformatf("PREADY timeout addr=0x%0h wait_count=%0d",
              req.addr, wait_count))
  drive_idle();
  return;
end`,
    trap: "Hardcoding repeat (16) @(posedge clk); without configuration. This becomes a hidden protocol bug.",
    interview:
      "I can add an APB timeout in the driver for regression safety, but I document it as environment policy unless the project spec defines a bounded wait requirement.",
  },
  {
    title: "Card 12 — Clocking Block Prevents Most Driver Races [RACE]",
    accent: "violet",
    hook: "Drive through clocking block; sample through clocking block.",
    concept:
      "APB is synchronous. The driver should avoid racing the DUT and monitor by driving in a controlled region and sampling consistently with #1step skew in Preponed region.",
    code: `clocking master_cb @(posedge pclk);
  default input #1step output #0;
  output paddr, pwrite, pwdata, pstrb, pprot, psel, penable;
  input  prdata, pready, pslverr;
endclocking

vif.master_cb.paddr <= req.addr;
@(vif.master_cb);`,
    trap: "Mixing raw posedge drives and clocking block reads inconsistently.",
    interview:
      "I prefer a driver clocking block so outputs are driven in a controlled region and inputs are sampled consistently, reducing DUT/driver/monitor races.",
  },
  {
    title: "Card 13 — PREADY Is Sampled Only in Access [PROTOCOL]",
    accent: "emerald",
    hook: "Ready only matters after enable.",
    concept:
      "PREADY is not a general 'APB bus is ready' flag. It controls exit from the APB access phase. SETUP ignores PREADY; ACCESS waits until PREADY==1.",
    code: `vif.master_cb.penable <= 1'b1;
do begin
  @(vif.master_cb);
end while (!vif.master_cb.pready);`,
    trap: "Sampling PREADY during setup to shorten or skip the setup cycle.",
    interview:
      "PREADY qualifies completion only in the access phase. I never use it to shorten or skip the setup phase.",
  },
  {
    title: "Card 14 — PSTRB Is Write-Only Meaningful [PROTOCOL]",
    accent: "blue",
    hook: "Strobes describe write bytes, not read bytes.",
    concept:
      "In APB4-style transfers, PSTRB indicates active byte lanes for write transfers. For reads, PWRITE=0 and PSTRB is driven to 0 or default.",
    code: `if (req.is_write())
  vif.master_cb.pstrb <= req.strb;
else
  vif.master_cb.pstrb <= '0;`,
    trap: "Using PSTRB to mask read data inside the driver (req.rdata = vif.master_cb.prdata & strb_mask). Read interpretation belongs in scoreboard.",
    interview:
      "My APB driver drives PSTRB for writes. It does not use PSTRB to judge read-data correctness.",
  },
  {
    title: "Card 15 — PPROT Is Metadata, Not Timing Control [PROTOCOL]",
    accent: "violet",
    hook: "Protection travels with the transfer.",
    concept:
      "PPROT carries protection attributes (normal/privileged, secure/non-secure, data/instruction). The APB driver drives it stably from setup through completion.",
    code: `vif.master_cb.pprot <= req.prot;`,
    trap: "Driver blocking a transfer because PPROT looks wrong, turning the driver into a policy checker.",
    interview:
      "I treat PPROT as APB transfer metadata. The driver drives it legally and stably; policy checking belongs outside the driver unless explicitly configured as stimulus sanitization.",
  },
  {
    title: "Card 16 — Cleanup Must Be Deliberate [TIMING]",
    accent: "amber",
    hook: "A completed transfer still needs bus cleanup.",
    concept:
      "After APB completion, the driver returns the bus to idle or directly begins the next setup. Default implementation uses cleanup-to-idle (PSEL=0, PENABLE=0).",
    code: `task drive_idle();
  vif.master_cb.psel    <= 1'b0;
  vif.master_cb.penable <= 1'b0;
  vif.master_cb.pwrite  <= 1'b0;
  vif.master_cb.paddr   <= '0;
  vif.master_cb.pwdata  <= '0;
  vif.master_cb.pstrb   <= '0;
  vif.master_cb.pprot   <= '0;
endtask`,
    trap: "Leaving PSEL=1 after completion unintentionally, creating ghost transfers.",
    interview:
      "I make cleanup explicit. Either I deassert PSEL for idle, or I intentionally drive the next setup. I do not leave the APB bus in an accidental half-state.",
  },
  {
    title: "Card 17 — Back-to-Back Is Legal but Must Be Architected [ARCH]",
    accent: "blue",
    hook: "Fast APB still has setup.",
    concept:
      "APB can transition directly from ACCESS completion into the next SETUP. But PENABLE must drop to 0 for the next setup phase.",
    code: `// Back-to-back transition after completion of transfer N:
vif.master_cb.penable <= 1'b0;      // next setup
vif.master_cb.psel    <= 1'b1;
vif.master_cb.paddr   <= next_req.addr;`,
    trap: "Driving next transfer with PENABLE still high, corrupting the transfer.",
    interview:
      "Back-to-back APB is not pipelining. It is access completion followed by the next setup. PENABLE must drop for the next setup phase.",
  },
  {
    title: "Card 18 — APB Driver Should Not Predict Register Values [BOUNDARY]",
    accent: "emerald",
    hook: "Driver returns what happened; scoreboard decides if it is right.",
    concept:
      "For reads, the driver captures PRDATA and returns it to the sequence. It must not compare the value against expected register contents.",
    code: `if (!req.is_write())
  req.rdata = vif.master_cb.prdata;
req.slverr = vif.master_cb.pslverr;
// Zero register model comparison in driver!`,
    trap: "Embedding a register reference model inside the driver.",
    interview:
      "My APB driver reports the observed bus response. The scoreboard or RAL predictor decides whether the observed response matches architectural expectation.",
  },
  {
    title: "Card 19 — Idle Delay Belongs Before Setup, Not Inside Access [TIMING]",
    accent: "amber",
    hook: "Randomize gaps, not protocol phases.",
    concept:
      "A master driver may insert idle cycles between transfers to vary traffic shape. Random idle belongs before setup, never between setup and access.",
    code: `repeat (req.idle_cycles) begin
  drive_idle();
  @(vif.master_cb);
end
drive_setup(req);
drive_access_and_sample(req);`,
    trap: "Inserting idle delays between setup and access, extending setup into multiple illegal cycles.",
    interview:
      "I randomize idle gaps before APB setup. I do not randomize the setup length because APB setup is a one-cycle phase.",
  },
  {
    title: "Card 20 — Blocking APB Driver Is Usually the Right Default [ARCH]",
    accent: "violet",
    hook: "APB has one outstanding transfer. Match the driver contract.",
    concept:
      "A blocking APB driver naturally matches APB: one sequence item -> one bus transfer -> one completion -> then item_done.",
    code: `seq_item_port.get_next_item(req);
drive_one_transfer(req);
seq_item_port.item_done();`,
    trap: "Over-engineering APB with AXI-style out-of-order queues and ID tables.",
    interview:
      "APB is non-pipelined, so I default to a blocking driver. I only split request and response if the environment has a specific reason, such as unusual sequence scheduling.",
  },
  {
    title: "Card 21 — Reset Must Release the Sequencer [RESET]",
    accent: "rose",
    hook: "No item may die silently in reset.",
    concept:
      "If reset interrupts after the driver has accepted an item, the driver still owes the sequencer an item_done() call with aborted=1.",
    code: `seq_item_port.get_next_item(req);
drive_one_transfer(req); // may set req.aborted=1
seq_item_port.item_done();`,
    trap: "Skipping item_done() when reset is active, hanging the sequencer permanently.",
    interview:
      "Once I accept an item with get_next_item(), I must eventually complete that sequencer handshake. Reset changes the item status; it does not erase the obligation to call item_done().",
  },
  {
    title: "Card 22 — try_next_item() Is Rarely Needed for Basic APB [UVM]",
    accent: "blue",
    hook: "Polling the sequencer is not throughput.",
    concept:
      "try_next_item() is useful when the driver must opportunistically fetch work without blocking. A basic APB master driver normally does not need it. If used, null handling is mandatory.",
    code: `apb_item req;
seq_item_port.try_next_item(req);
if (req == null) begin
  drive_idle();
  @(vif.master_cb);
end else begin
  drive_one_transfer(req);
  seq_item_port.item_done();
end`,
    trap: "Calling drive_one_transfer(req) without checking if req == null.",
    interview:
      "I avoid try_next_item() in a simple APB master unless I need nonblocking sequencer polling. If I use it, null handling and item_done() pairing are non-negotiable.",
  },
  {
    title: "Card 23 — Logs Must Name the APB Phase [CODE]",
    accent: "emerald",
    hook: "Bad logs hide phase bugs.",
    concept:
      "APB debug logs should expose: item id, address, write/read, setup entry, access entry, wait count, completion, PRDATA, PSLVERR, reset abort, timeout.",
    code: `\`uvm_info("APB_ACCESS_WAIT",
  $sformatf("addr=0x%0h write=%0b wait=%0d",
            req.addr, req.is_write(), wait_count),
  UVM_HIGH)`,
    trap: "Logging only at item start and item end, hiding wait-state and phase bugs.",
    interview:
      "My APB driver logs phase transitions because most APB bugs are phase bugs: early enable, stale read sampling, unstable control, or missing cleanup.",
  },
  {
    title: "Card 24 — The Driver Should Be Reviewable From the Waveform [INTERVIEW]",
    accent: "amber",
    hook: "If waveform and code disagree, code is wrong.",
    concept:
      "A senior-quality APB driver has a 1-to-1 mapping between code tasks and waveform phases: drive_idle -> IDLE, drive_setup -> SETUP, drive_access_and_sample -> ACCESS, cleanup -> IDLE/SETUP.",
    code: `drive_setup(req);
drive_access_and_sample(req);
drive_idle();`,
    trap: "Writing one giant monolithic run_phase() with all signal toggles inlined.",
    interview:
      "I structure the APB driver so every task corresponds to a visible waveform phase. That makes code review and waveform debug deterministic.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// DATA — Bug Gallery (12 Bugs)
// ─────────────────────────────────────────────────────────────────────────────

const module8BugGallery = [
  {
    title: "Bug 1 — PSEL and PENABLE Asserted Together",
    symptom:
      "Slave ignores transfer; monitor reports malformed APB transfer; protocol assertion fires for missing setup phase.",
    waveform: "Cycle N: PSEL=1, PENABLE=1, PADDR=A. No prior cycle with PSEL=1, PENABLE=0.",
    cause: "The driver skipped the 1-cycle APB setup phase.",
    bad: `vif.master_cb.psel    <= 1'b1;
vif.master_cb.penable <= 1'b1; // BUG: Skipped setup phase!
vif.master_cb.paddr   <= req.addr;`,
    fix: `vif.master_cb.psel    <= 1'b1;
vif.master_cb.penable <= 1'b0; // 1 cycle SETUP
vif.master_cb.paddr   <= req.addr;
@(vif.master_cb);
vif.master_cb.penable <= 1'b1; // ACCESS phase`,
    interview:
      "APB requires a setup phase before access. I assert PSEL first with PENABLE=0, then assert PENABLE in the following cycle.",
  },
  {
    title: "Bug 2 — Sampling PRDATA Before PREADY",
    symptom:
      "Reads pass with zero-wait slave; reads fail randomly with wait-state slaves. Scoreboard sees stale or X read data.",
    waveform: "PENABLE=1, PREADY=0, PRDATA=X -> driver captures PRDATA immediately.",
    cause: "The driver assumed access completes one cycle after PENABLE.",
    bad: `vif.master_cb.penable <= 1'b1;
@(vif.master_cb);
req.rdata = vif.master_cb.prdata; // BUG: Sampled while PREADY=0!`,
    fix: `vif.master_cb.penable <= 1'b1;
do begin
  @(vif.master_cb);
end while (!vif.master_cb.pready);
if (!req.is_write())
  req.rdata = vif.master_cb.prdata; // Sampled at valid completion`,
    interview:
      "PRDATA is a completion response. I sample it only when PSEL && PENABLE && PREADY is true.",
  },
  {
    title: "Bug 3 — Sampling PSLVERR During Wait States",
    symptom:
      "False error reports; error appears before transfer completion; slave waveform shows PSLVERR is unstable during wait.",
    waveform: "PENABLE=1, PREADY=0, PSLVERR=1 -> driver records error prematurely.",
    cause: "The driver treated PSLVERR as valid before the APB completion cycle.",
    bad: `while (!vif.master_cb.pready) begin
  if (vif.master_cb.pslverr) // BUG: Sampled before completion!
    req.slverr = 1'b1;
  @(vif.master_cb);
end`,
    fix: `do begin
  @(vif.master_cb);
end while (!vif.master_cb.pready);
req.slverr = vif.master_cb.pslverr; // Sampled at completion`,
    interview:
      "PSLVERR is sampled as a transfer response at completion, not polled as an asynchronous error.",
  },
  {
    title: "Bug 4 — Early item_done()",
    symptom:
      "Sequence issues dependent transfer too early; read-after-write test fails; transaction logs show completion before bus activity.",
    waveform: "UVM item done at T=100; APB setup starts at T=110; dependent sequence starts at T=101.",
    cause: "The driver released the sequencer before completing the APB transaction.",
    bad: `seq_item_port.get_next_item(req);
seq_item_port.item_done(); // BUG: Handshake released before driving!
drive_one_transfer(req);`,
    fix: `seq_item_port.get_next_item(req);
drive_one_transfer(req);
seq_item_port.item_done(); // Released after APB terminal state`,
    interview:
      "In a blocking APB master driver, item_done() means the APB transfer has reached terminal state: completed, reset-aborted, or timeout-aborted.",
  },
  {
    title: "Bug 5 — Missing item_done() on Reset",
    symptom:
      "Sequence hangs; simulation stops making progress after reset; sequencer remains blocked.",
    waveform: "get_next_item occurred, reset asserted, driver returns to idle without item_done.",
    cause: "The driver accepted an item but skipped sequencer completion after reset.",
    bad: `seq_item_port.get_next_item(req);
if (reset_active()) begin
  drive_idle();
  continue; // BUG: item_done skipped!
end`,
    fix: `seq_item_port.get_next_item(req);
if (reset_active()) begin
  req.aborted = 1'b1;
  drive_idle();
  seq_item_port.item_done(); // Handshake released!
  continue;
end`,
    interview:
      "Reset does not erase the sequencer handshake. Once the driver accepts an item with get_next_item(), it must eventually call item_done().",
  },
  {
    title: "Bug 6 — get() Followed by item_done()",
    symptom:
      "Sequencer-driver protocol error; double-completion complaints in simulation.",
    waveform: "UVM control flow throws runtime fatal or warning on port handshake.",
    cause: "get() already indicates completion. Calling item_done() is a contract violation.",
    bad: `seq_item_port.get(req);
drive_one_transfer(req);
seq_item_port.item_done(); // BUG: Illegal double completion`,
    fix: `// Preferred blocking pattern:
seq_item_port.get_next_item(req);
drive_one_transfer(req);
seq_item_port.item_done();`,
    interview:
      "I do not mix sequencer-driver pull contracts. get_next_item() pairs with item_done(). get() does not.",
  },
  {
    title: "Bug 7 — try_next_item() Null Dereference",
    symptom:
      "Null object access; driver crashes during idle periods when no item is pending.",
    waveform: "No APB setup appears before runtime fatal crash.",
    cause: "try_next_item() returned null, but the driver immediately accessed req.addr.",
    bad: `seq_item_port.try_next_item(req);
drive_one_transfer(req); // BUG: req may be null!
seq_item_port.item_done();`,
    fix: `seq_item_port.try_next_item(req);
if (req == null) begin
  drive_idle();
  @(vif.master_cb);
end else begin
  drive_one_transfer(req);
  seq_item_port.item_done();
end`,
    interview:
      "try_next_item() is nonblocking. Null handling is mandatory, and non-null items still require item_done().",
  },
  {
    title: "Bug 8 — Missing set_id_info(req) on Response",
    symptom:
      "Sequence waits forever in get_response(); response queue routing fails under multi-sequence tests.",
    waveform: "APB waveform is correct, but sequence remains blocked waiting for response.",
    cause: "Response object created without copying sequence_id and transaction_id from request.",
    bad: `rsp = apb_item::type_id::create("rsp");
rsp.copy(req);
seq_item_port.put_response(rsp); // BUG: Missing ID metadata`,
    fix: `rsp = apb_item::type_id::create("rsp");
rsp.copy(req);
rsp.set_id_info(req); // Preserves sequence & transaction IDs
seq_item_port.put_response(rsp);`,
    interview:
      "When I send explicit responses, I copy request identity into the response using set_id_info(req) so the sequencer can route it correctly.",
  },
  {
    title: "Bug 9 — Changing Address During Wait State",
    symptom:
      "Slave completes wrong address; monitor sees unstable APB access; register read/write hits unexpected location.",
    waveform: "PSEL=1, PENABLE=1, PREADY=0 -> PADDR changes from 0x1000 to 0x2000.",
    cause: "The driver fetched and applied the next transfer fields before completion.",
    bad: `while (!vif.master_cb.pready) begin
  if (next_req_available)
    vif.master_cb.paddr <= next_req.addr; // BUG: Mutating active access!
  @(vif.master_cb);
end`,
    fix: `do begin
  @(vif.master_cb); // Hold PADDR/PWDATA/PSTRB stable!
end while (!vif.master_cb.pready);`,
    interview:
      "While APB access is waiting, address/control/write fields must remain stable. I only prepare the next setup after the current access completes.",
  },
  {
    title: "Bug 10 — Treating Reset Abort as PSLVERR",
    symptom:
      "Scoreboard reports slave error that never happened; reset tests confuse aborts with APB errors.",
    waveform: "Reset asserted before PREADY completion; driver reports slverr=1.",
    cause: "The driver fabricated APB error status during reset.",
    bad: `if (reset_active()) begin
  req.slverr = 1'b1; // BUG: Reset is not PSLVERR!
  drive_idle();
  return;
end`,
    fix: `if (reset_active()) begin
  req.aborted = 1'b1;
  req.slverr  = 1'b0; // Clean separation
  drive_idle();
  return;
end`,
    interview:
      "PSLVERR is an APB completion response. Reset abort is a different terminal condition and must be represented separately.",
  },
  {
    title: "Bug 11 — Hidden Hardcoded Timeout",
    symptom:
      "Valid slow slaves fail; timeout limit cannot be adjusted per regression test.",
    waveform: "PREADY remains low for 17 cycles -> driver fatal fires, though spec allows 32 wait cycles.",
    cause: "Timeout was hardcoded as a static loop count rather than a configurable parameter.",
    bad: `repeat (16) @(vif.master_cb);
if (!vif.master_cb.pready)
  \`uvm_fatal("APB_TIMEOUT", "PREADY timeout") // BUG: Hardcoded!`,
    fix: `if (cfg.enable_timeout && wait_count > cfg.max_wait_cycles) begin
  req.timeout = 1'b1;
  \`uvm_error("APB_TIMEOUT", "Configured timeout reached")
  return;
end`,
    interview:
      "Timeout is a verification-environment policy unless the project protocol profile defines a maximum wait bound.",
  },
  {
    title: "Bug 12 — Driver Checks Expected Register Data",
    symptom:
      "Driver becomes non-reusable; duplicate mismatches reported by driver and scoreboard.",
    waveform: "APB transfer is perfectly legal on pins, but driver reports functional mismatch.",
    cause: "The driver crossed into scoreboard and reference model territory.",
    bad: `if (!req.is_write()) begin
  req.rdata = vif.master_cb.prdata;
  if (req.rdata != expected_reg_model[req.addr]) // BUG: Scoreboard in driver!
    \`uvm_error("APB_MISMATCH", "Read mismatch")
end`,
    fix: `if (!req.is_write())
  req.rdata = vif.master_cb.prdata;
// Scoreboard / RAL predictor owns functional checking!`,
    interview:
      "The driver reports observed bus response. It does not decide whether the design returned architecturally correct data.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// DATA — Interview Q&A (12 Questions)
// ─────────────────────────────────────────────────────────────────────────────

const module8InterviewQA = [
  {
    q: "Q1. Where should item_done() be placed in a blocking APB master driver?",
    short:
      "After the APB transfer reaches terminal state: normal completion, reset abort, or timeout abort.",
    deep: "APB is non-pipelined and has no separate response channel. In a blocking driver contract, the sequence item represents the full APB operation. Therefore, item_done() should not occur at request acceptance or setup. It should occur after the driver has completed access, sampled response fields, and performed terminal handling.",
    followup: "Can item_done() happen before bus completion?",
    answer:
      "Only if the driver explicitly implements a split-phase contract and the sequence is designed for that. That is not the default APB driver model.",
  },
  {
    q: "Q2. Why is sampling PRDATA immediately after PENABLE wrong?",
    short:
      "Because the slave may hold PREADY=0; read data is valid at transfer completion, not access entry.",
    deep: "PENABLE starts the access phase. It does not guarantee completion. The driver must wait until PREADY==1 in access, then sample PRDATA.",
    followup: "Why does the bug pass in some smoke tests?",
    answer:
      "Because a zero-wait slave makes access entry and completion appear adjacent in simple waveforms.",
  },
  {
    q: "Q3. Should the APB driver check expected read data?",
    short: "No.",
    deep: "The driver may capture and return read data. It must not decide whether the data is architecturally correct. That belongs in the scoreboard, predictor, RAL model, or directed sequence check.",
    followup: null,
    answer: null,
  },
  {
    q: "Q4. What is the difference between PSLVERR and reset abort?",
    short:
      "PSLVERR is an APB completion response. Reset abort is an environment terminal condition without legal APB completion.",
    deep: "If reset occurs before completion, the driver cannot claim it observed a valid APB error response. It should mark aborted, not slverr.",
    followup: null,
    answer: null,
  },
  {
    q: "Q5. Why use a clocking block in an APB driver?",
    short:
      "To control drive and sample timing and reduce race-dependent behavior.",
    deep: "The driver drives APB outputs and samples APB inputs at clock boundaries. A clocking block makes that timing explicit and reviewable. It also reduces accidental races between driver, DUT, and monitor.",
    followup: null,
    answer: null,
  },
  {
    q: "Q6. How do you handle APB wait states?",
    short: "Keep access active and hold request fields stable until PREADY==1.",
    deep: "Once PENABLE is asserted, the driver is in access. If PREADY=0, the transfer is extended. The driver must not change PADDR, PWRITE, PWDATA, PSTRB, PPROT, PSEL, or PENABLE.",
    followup: null,
    answer: null,
  },
  {
    q: "Q7. What is the legal APB back-to-back transfer pattern?",
    short: "Completed access of transfer N followed by setup of transfer N+1.",
    deep: "Back-to-back does not mean keeping PENABLE high and changing address. The next transfer still requires setup with PENABLE=0.",
    followup: null,
    answer: null,
  },
  {
    q: "Q8. When do you need explicit response objects?",
    short:
      "When the sequence expects response routing through get_response() or multiple sequences need clean response association.",
    deep: "For simple blocking flows, mutating req before item_done() can be enough. For reusable VIP, explicit responses are cleaner. The response must copy ID information from the request using set_id_info(req).",
    followup: null,
    answer: null,
  },
  {
    q: "Q9. What belongs in an APB driver timeout?",
    short: "A configurable maximum wait policy, not a hardcoded APB rule.",
    deep: "APB allows wait states. A verification environment can impose a max wait to prevent regression hangs or enforce project-specific latency. That limit belongs in config.",
    followup: null,
    answer: null,
  },
  {
    q: "Q10. What is the cleanest APB driver task decomposition?",
    short:
      "drive_idle, drive_setup, drive_access_and_sample, drive_one_transfer.",
    deep: "Each task maps to a waveform phase. That makes code review, debug, and interview explanation straightforward.",
    followup: null,
    answer: null,
  },
  {
    q: "Q11. Why must reset release the sequencer item?",
    short: "Because the driver already accepted ownership of the item.",
    deep: "With get_next_item(), the sequencer waits for item_done(). If reset interrupts the transfer and the driver skips item_done(), the sequence can hang forever.",
    followup: null,
    answer: null,
  },
  {
    q: "Q12. Should the APB driver deeply validate PSTRB legality?",
    short:
      "Only as configurable stimulus sanity, not as hardcoded protocol policy.",
    deep: "PSTRB behavior depends on APB version and project profile. A reusable driver drives it from the transaction and may warn on suspicious stimulus, but architectural byte-lane correctness belongs outside the driver.",
    followup: null,
    answer: null,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// DATA — Sections for Sidebar Navigation
// ─────────────────────────────────────────────────────────────────────────────

const module8Sections = [
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
  { id: "atlas", label: "Atlas Sheets (1–6)" },
  { id: "codelabs", label: "Code Labs (1–5)" },
  { id: "bugs", label: "Bug Gallery (1–12)" },
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
  { id: "verdict", label: "Final Readiness Verdict & Audit" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT — Module 8
// ═══════════════════════════════════════════════════════════════════════════════

const Module8 = () => {
  return (
    <div className="relative min-h-screen bg-slate-950 text-white font-sans">
      {/* Background glow & grid */}
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-150 h-62.5 bg-linear-to-r from-blue-600/15 to-indigo-600/15 blur-[100px] rounded-full" />

      <div className="relative z-10 flex max-w-7xl mx-auto">
        {/* ── Sidebar TOC (desktop) ────────────────────────────────────── */}
        <ModuleSidebar
          moduleNumber="8"
          title="APB Master Driver Deep Dive"
          sections={module8Sections}
        />

        {/* ── Main Content ─────────────────────────────────────────────── */}
        <main className="flex-1 min-w-0 px-6 py-8 pb-24 max-w-4xl">
          {/* Mobile back */}
          <BackToHomeBtn to="/driver-mastery" />

          {/* Hero */}
          <ModuleHero
            moduleNumber="8"
            title="APB Master Driver Deep Dive"
            description="Build, review, debug, and defend a production-grade UVM APB master driver. Master 1-cycle setup, access wait-states, PRDATA/PSLVERR completion capture, clean reset aborts, and response routing."
            metadata={[
              ["Module", "8"],
              ["Reference", "APB3 / APB4 / UVM 1.2"],
              ["Pattern", "Blocking Non-Pipelined Phase Driver"],
              ["Roadmap", "After Module 7, before Module 9 (Streaming / Ready-Valid)"],
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
                    "Module 7: Timing, Clocking Blocks, and Race Conditions",
                    "Module 8: APB Master Driver Deep Dive",
                    "Module 9: Ready/Valid and Streaming Driver Deep Dive",
                  ],
                ]}
              />

              <h3 className="text-lg font-bold text-blue-300 mt-4">
                Module Contract
              </h3>
              <p className="text-slate-300 text-sm">
                This module teaches how to build, review, debug, and defend a real
                UVM APB master driver. The focus is:
              </p>
              <blockquote className="border-l-4 border-blue-500 bg-blue-500/10 p-4 rounded-r-xl text-blue-200 text-sm leading-relaxed">
                How an APB transaction becomes legal pin-level APB activity, and
                where the UVM driver must complete, respond, wait, abort, or clean
                up.
              </blockquote>
            </div>
          </section>

          {/* ── §2 Learning Objectives ──────────────────────────────────── */}
          <section id="objectives">
            <SectionHeading num={2} title="Learning Objectives" />
            <ol className="space-y-2 list-decimal list-inside text-slate-300 text-sm leading-relaxed">
              {[
                "Explain the APB master driver’s responsibility without drifting into monitor, scoreboard, or slave-driver behavior.",
                "Model APB transactions correctly for read, write, strobe, protection, error, abort, timeout, and response behavior.",
                "Implement legal APB setup and access phases with correct PSEL/PENABLE sequencing.",
                "Hold address, control, and write data stable across APB wait states.",
                "Sample PRDATA and PSLVERR only at the legal APB completion point.",
                "Place item_done() correctly for a non-pipelined blocking APB master driver.",
                "Decide when request mutation is sufficient and when explicit response objects are required.",
                "Use set_id_info(req) correctly when routing responses.",
                "Handle reset before, during, and after APB transfer execution.",
                "Avoid race bugs using a consistent clocking-block or raw-posedge methodology.",
                "Add debug logs that expose APB phase, wait count, address, direction, response, timeout, and reset-abort cause.",
                "Defend APB driver architectural choices in senior/principal interviews.",
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
                <strong className="text-blue-300">Pass 1 — Protocol Pass:</strong>
                <p>
                  Read Sections 7 and 8 first. Build the APB timing contract: IDLE &rarr;
                  SETUP (PSEL=1, PENABLE=0) &rarr; ACCESS (PENABLE=1, wait PREADY) &rarr;
                  COMPLETE &rarr; CLEANUP.
                </p>
              </div>
              <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/40 space-y-1">
                <strong className="text-violet-300">Pass 2 — Driver Contract Pass:</strong>
                <p>
                  Read Sections 9–13. Know exactly what the APB master driver owns
                  and what it must not own.
                </p>
              </div>
              <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/40 space-y-1">
                <strong className="text-emerald-300">Pass 3 — Implementation Pass:</strong>
                <p>
                  Use Memory Cards and Code Labs to convert the timing contract into
                  compile-credible UVM 1.2 code.
                </p>
              </div>
              <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/40 space-y-1">
                <strong className="text-amber-300">Pass 4 — Debug & Interview Pass:</strong>
                <p>
                  Use Bug Gallery (1–12), Race Checklist, and Interview Q&A to defend
                  architectural decisions.
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
                ["[PROTOCOL]", "APB behavior or timing rule"],
                ["[WAVEFORM]", "Cycle-level signal relationship"],
                ["[UVM]", "UVM 1.2 sequencer-driver / API behavior"],
                ["[CODE]", "Implementation detail"],
                ["[RESET]", "Reset / abort behavior"],
                ["[RACE]", "Scheduling, sampling, or drive race issue"],
                ["[BOUNDARY]", "Driver vs monitor vs scoreboard vs assertion ownership"],
                ["[DEBUG]", "Log, waveform, or triage strategy"],
                ["[INTERVIEW]", "Senior / principal explanation line"],
                ["[TRAP]", "Common incorrect implementation"],
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
                "APB setup phase is modeled as exactly one cycle.",
                "APB access phase starts only after PENABLE assertion.",
                "PSEL remains asserted through setup and access.",
                "PENABLE is low in setup and high in access.",
                "PREADY is sampled only in access phase.",
                "Wait states keep address/control/write data stable.",
                "Read data is captured only at legal completion.",
                "PSLVERR is captured only at legal completion.",
                "Cleanup-to-idle is implemented cleanly.",
                "Back-to-back transfer policy is explicitly architected.",
                "Transaction contains addr, dir, wdata, rdata, strb, prot, abort, timeout.",
                "Driver extends uvm_driver #(REQ) or #(REQ,RSP) correctly.",
                "get_next_item(req) is paired with item_done().",
                "Reset abort policy releases sequencer without deadlocks.",
                "Driver does not become scoreboard or register predictor.",
                "Clocking block timing is used consistently without region races.",
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
                  <li>APB master/requester pin driving and virtual interface</li>
                  <li>APB transaction class design with strobe and protection</li>
                  <li>PSEL/PENABLE sequencing and wait-state handling with PREADY</li>
                  <li>Read data and error response capture</li>
                  <li>Non-pipelined blocking item completion and explicit response variant</li>
                  <li>Reset-aware abort and timeout guard</li>
                  <li>Clocking block implementation and debug logs</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/40">
                <h4 className="font-bold text-slate-300 mb-2">
                  6.2 Non-Scope (Dedicated Modules)
                </h4>
                <Table
                  headers={["Topic", "Destination Module"]}
                  rows={[
                    ["APB slave/responder driver", "Module 12"],
                    ["Full RAL adapter design", "Module 18"],
                    ["AXI-to-APB bridge verification", "Bridge/SoC-level topic"],
                    ["Pipelined multi-channel drivers", "Modules 10-11"],
                    ["Full assertion package implementation", "Boundary topic only"],
                    ["Scoreboard prediction implementation", "Scoreboard module"],
                    ["APB5 parity/user/wakeup deep dive", "Optional extensions"],
                  ]}
                />
              </div>

              <Callout type="concept">
                <strong>Boundary Note:</strong> This module uses "APB master
                driver" as common in UVM testbenches. Arm terminology may use
                requester/completer. The verification responsibility is identical:
                the driver initiates APB transfers and observes APB completion.
              </Callout>
            </div>
          </section>

          {/* ── §7 Protocol Mental Model ───────────────────────────────── */}
          <section id="mental-model">
            <SectionHeading num={7} title="Protocol Mental Model" />
            <div className="space-y-6 text-sm text-slate-300">
              <div>
                <h4 className="font-bold text-blue-300 text-base mb-2">
                  7.1 APB Is Command-Then-Complete, Not Streaming
                </h4>
                <p className="mb-2">
                  APB is not a streaming protocol. An APB master driver executes a
                  structured transfer sequence:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-xs text-slate-300">
                  <li>Put address, control, and write data on bus.</li>
                  <li>Assert select (PSEL=1).</li>
                  <li>Hold one setup cycle (PENABLE=0).</li>
                  <li>Assert enable (PENABLE=1).</li>
                  <li>Wait until slave completes using PREADY===1'b1.</li>
                  <li>Capture response (PRDATA / PSLVERR).</li>
                  <li>Return bus to idle or begin next setup.</li>
                </ol>
              </div>

              <div>
                <h4 className="font-bold text-blue-300 text-base mb-2">
                  7.2 Three Driver-Visible States
                </h4>
                <CodeBlock lang="text">{`IDLE:
  PSEL    = 0
  PENABLE = 0
SETUP:
  PSEL    = 1
  PENABLE = 0
  PADDR / PWRITE / PWDATA / PSTRB / PPROT valid
ACCESS:
  PSEL    = 1
  PENABLE = 1
  PREADY controls completion`}</CodeBlock>
              </div>

              <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/40 text-xs">
                <h4 className="font-bold text-emerald-300 text-sm mb-1">
                  7.3 APB Completion Point
                </h4>
                <p className="text-slate-300">
                  A transfer completes when <code>psel && penable && pready</code> is
                  true. At that point, write transfer is accepted, read transfer
                  returns valid PRDATA, PSLVERR is valid, and the driver completes the
                  UVM item under a blocking contract.
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
                    8.1 Basic Write Transfer
                  </h5>
                  <CodeBlock lang="text">{`Cycle:   IDLE   SETUP   ACCESS   IDLE
PSEL:      0      1       1       0
PENABLE:   0      0       1       0
PWRITE:   0/X     1       1      0/X
PADDR:     X      A       A       X
PWDATA:    X      D       D       X
PREADY:    X      X       1       X
PSLVERR:   X      X     valid     X`}</CodeBlock>
                </div>

                <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/50">
                  <h5 className="font-bold text-blue-300 mb-2">
                    8.2 Basic Read Transfer
                  </h5>
                  <CodeBlock lang="text">{`Cycle:   IDLE   SETUP   ACCESS   IDLE
PSEL:      0      1       1       0
PENABLE:   0      0       1       0
PWRITE:   0/X     0       0      0/X
PADDR:     X      A       A       X
PREADY:    X      X       1       X
PRDATA:    X      X     valid     X
PSLVERR:   X      X     valid     X`}</CodeBlock>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/40">
                <h5 className="font-bold text-amber-300 mb-2">
                  8.3 & 8.4 Transfers With Wait States
                </h5>
                <CodeBlock lang="text">{`Cycle:    SETUP   ACCESS   ACCESS   ACCESS   IDLE
PSEL:       1       1        1        1       0
PENABLE:    0       1        1        1       0
PREADY:     X       0        0        1       X
PRDATA:     X       X        X      valid     X
PSLVERR:    X       X        X      valid     X

Driver Rule: While waiting for PREADY, hold PADDR, PWRITE, PWDATA, PSTRB,
PPROT, PSEL, and PENABLE strictly stable.`}</CodeBlock>
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
                  9.1 Driver Owns
                </h4>
                <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs">
                  <li>Driving PADDR, PWRITE, PWDATA, PSTRB, PPROT</li>
                  <li>Sequencing PSEL and PENABLE phases</li>
                  <li>Observing PREADY for completion</li>
                  <li>Capturing PRDATA and PSLVERR at completion</li>
                  <li>Bus cleanup to idle or next setup</li>
                  <li>Reset abort and timeout guard handling</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5">
                <h4 className="font-bold text-rose-300 mb-2">
                  9.2 Driver Does Not Own
                </h4>
                <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs">
                  <li>Comparing actual PRDATA against expected model</li>
                  <li>Register prediction / RAL model updates</li>
                  <li>Functional coverage collection</li>
                  <li>Temporal protocol checking (owned by SVA)</li>
                  <li>Slave response generation</li>
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
                10.2 Correct Blocking get_next_item() Contract
              </h4>
              <CodeBlock lang="systemverilog">{`forever begin
  apb_item req;
  seq_item_port.get_next_item(req);
  drive_apb_transfer(req); // executes SETUP, ACCESS, waits PREADY, samples response
  seq_item_port.item_done();
end`}</CodeBlock>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-900/60 border border-slate-700/60 rounded-lg">
                  <strong className="text-emerald-300">
                    Style A — Request Mutation:
                  </strong>
                  <p className="mt-1 text-slate-300">
                    Driver writes <code>req.rdata</code> and <code>req.slverr</code>{" "}
                    directly before <code>item_done()</code>. Good for simple blocking
                    sequences.
                  </p>
                </div>
                <div className="p-3 bg-slate-900/60 border border-slate-700/60 rounded-lg">
                  <strong className="text-violet-300">
                    Style B — Explicit Response:
                  </strong>
                  <p className="mt-1 text-slate-300">
                    Driver creates <code>rsp</code>, calls <code>rsp.copy(req)</code>{" "}
                    and <code>rsp.set_id_info(req)</code>, then calls{" "}
                    <code>put_response(rsp)</code>.
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
                <h4 className="font-bold text-blue-300 mb-1">
                  11.6 Default Reset Completion Policy
                </h4>
                <p className="text-xs text-slate-300 mb-2">
                  If reset aborts an in-flight item: mark <code>req.aborted = 1</code>,
                  do not mark <code>req.slverr</code>, call <code>item_done()</code> to
                  release sequencer, and drive bus to idle.
                </p>
                <CodeBlock lang="systemverilog">{`if (reset_active()) begin
  req.aborted = 1'b1;
  req.timeout = 1'b0;
  req.slverr  = 1'b0; // Reset is NOT an APB PSLVERR!
  drive_idle();
  return;
end`}</CodeBlock>
              </div>

              <Callout type="concept">
                <strong>11.4 Reset Abort vs PSLVERR:</strong> A transfer aborted by
                reset did not legally complete through APB. Never mark{" "}
                <code>slverr=1</code> on reset abort.
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
                <strong>12.1 APB Completion Is Pin-Level Completion:</strong>{" "}
                <code>completion = psel && penable && pready</code>. The transfer is
                not complete at setup or access entry; it is complete only when
                PREADY is observed high.
              </p>
              <p>
                <strong>12.4 Configurable Timeout Guard:</strong> APB permits wait
                states. Verification environments may impose a maximum wait limit
                (<code>max_wait_cycles</code>) to prevent simulation deadlocks.
              </p>
            </div>
          </section>

          {/* ── §13 Protocol Ownership Matrix ──────────────────────────── */}
          <section id="ownership">
            <SectionHeading num={13} title="Protocol Ownership Matrix" />
            <Table
              headers={[
                "Behavior",
                "APB Master Driver",
                "Monitor",
                "Scoreboard / Predictor",
                "Assertion",
              ]}
              rows={[
                ["Drive PADDR", "Owns", "Observes", "No", "Can check stability"],
                ["Drive PWRITE", "Owns", "Observes", "No", "Can check legal timing"],
                ["Drive PWDATA", "Owns for writes", "Observes", "No", "Can check stability"],
                ["Drive PSTRB", "Owns if APB4 enabled", "Observes", "Interprets byte lanes", "Can check timing/stability"],
                ["Drive PPROT", "Owns if enabled", "Observes", "Usually no", "Can check stability"],
                ["Drive PSEL / PENABLE", "Owns", "Observes", "No", "Checks 1-cycle setup"],
                ["Observe PREADY", "Uses for completion", "Observes", "No", "Checks valid timing"],
                ["Capture PRDATA", "For response return", "Passive observation", "Owns compare/predict", "Optional X-checks"],
                ["Capture PSLVERR", "For response return", "Observes", "Owns expected error check", "Checks valid timing"],
                ["Check read data value", "No", "No", "Owns", "No"],
                ["Check protocol legality", "Minimal sanity", "Observes", "No", "Owns temporal rules"],
                ["Functional coverage", "No", "Publishes", "Subscriber owns", "No"],
                ["Timeout policy", "Optional env guard", "Optional", "Missing txn flag", "Bounded liveness if spec'd"],
                ["Reset abort classification", "Owns item cleanup", "Observes reset effect", "Interprets aborted txn", "Checks idle under reset"],
              ]}
            />
          </section>

          {/* ── §14 Memory Cards ────────────────────────────────────────── */}
          <section id="memory">
            <SectionHeading num={14} title="Memory Cards (1–24)" />
            <p className="text-slate-400 text-sm mb-4">
              24 comprehensive memory cards for APB master driver architecture:
            </p>
            <div className="space-y-3">
              {module8MemoryCards.map((card, idx) => (
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
              title="Atlas Sheet 1 — APB Phase Atlas"
              accent="blue"
              icon={<FaListAlt size={12} />}
              defaultOpen={true}
            >
              <Table
                headers={[
                  "Phase",
                  "PSEL",
                  "PENABLE",
                  "Master Drives",
                  "Master Samples",
                  "Exit Condition",
                ]}
                rows={[
                  ["IDLE", "0", "0", "idle / defaults", "nothing", "sequence item available"],
                  ["SETUP", "1", "0", "address, direction, wdata, strb, prot", "normally nothing", "next clock edge"],
                  ["ACCESS wait", "1", "1", "stable request signals", "PREADY", "PREADY===1'b1"],
                  ["ACCESS complete", "1", "1", "stable request signals", "PREADY, PRDATA, PSLVERR", "completion"],
                  ["CLEANUP", "0 or 1", "0", "idle or next setup", "nothing", "next transfer policy"],
                ]}
              />
            </CollapsibleCard>

            <CollapsibleCard
              title="Atlas Sheet 2 — UVM API Contract Atlas"
              accent="violet"
              icon={<FaListAlt size={12} />}
            >
              <Table
                headers={["Driver Pull Style", "Legal Completion", "Use Case", "Trap"]}
                rows={[
                  ["get_next_item(req)", "later item_done()", "Standard blocking driver", "Forgetting item_done()"],
                  ["try_next_item(req)", "if non-null, later item_done()", "Nonblocking polling driver", "Null dereference"],
                  ["get(req)", "Completion already indicated by get()", "Simple pull style", "Illegal extra item_done()"],
                  ["put_response(rsp)", "Response object with ID mapping", "Explicit response flow", "Missing set_id_info(req)"],
                  ["item_done(rsp)", "Completes item with response", "Compact response flow", "Wrong ID mapping"],
                ]}
              />
            </CollapsibleCard>

            <CollapsibleCard
              title="Atlas Sheet 3 — Driver vs Monitor vs Scoreboard vs Assertion"
              accent="emerald"
              icon={<FaListAlt size={12} />}
            >
              <Table
                headers={["Question", "Driver", "Monitor", "Scoreboard", "Assertion"]}
                rows={[
                  ["Who drives PADDR?", "Yes", "No", "No", "No"],
                  ["Who observes complete transfer?", "Partial (for response)", "Yes", "Via monitor", "Maybe"],
                  ["Who checks expected read data?", "No", "No", "Yes", "Rarely"],
                  ["Who checks PENABLE follows setup?", "Minimal local structure", "Observes", "No", "Yes"],
                  ["Who reports timeout?", "Optional env guard", "Optional", "Missing txn flag", "If bounded property exists"],
                  ["Who collects coverage?", "No", "Publishes", "Subscriber", "No"],
                  ["Who handles sequence response?", "Yes", "No", "No", "No"],
                ]}
              />
            </CollapsibleCard>

            <CollapsibleCard
              title="Atlas Sheet 4 — Reset Outcome Atlas"
              accent="rose"
              icon={<FaListAlt size={12} />}
            >
              <Table
                headers={[
                  "Reset Timing",
                  "Bus Completion?",
                  "PSLVERR Valid?",
                  "Driver Item Status",
                  "Required Sequencer Action",
                ]}
                rows={[
                  ["Reset before fetch", "No", "No", "No item accepted", "No item_done()"],
                  ["Reset after fetch before setup", "No", "No", "aborted=1", "call item_done()"],
                  ["Reset during setup", "No", "No", "aborted=1", "call item_done()"],
                  ["Reset during access before PREADY", "No", "No", "aborted=1", "call item_done()"],
                  ["Reset after legal completion", "Yes", "Yes, if sampled", "completed", "call item_done()"],
                  ["Timeout during access", "No legal completion", "No", "timeout=1", "call item_done()"],
                ]}
              />
            </CollapsibleCard>

            <CollapsibleCard
              title="Atlas Sheet 5 — APB4 Optional Signal Policy"
              accent="amber"
              icon={<FaListAlt size={12} />}
            >
              <Table
                headers={["Signal", "Present In", "Driver Default Policy", "Common Mistake"]}
                rows={[
                  ["PSTRB", "APB4 write strobes", "Drive for writes, 0 for reads", "Using it to mask read data"],
                  ["PPROT", "APB protection attributes", "Drive from transaction, hold stable", "Enforcing security policy in driver"],
                  ["PSLVERR", "Optional error response", "Sample only at completion", "Sampling during wait / idle"],
                  ["PREADY", "Wait-state completion", "Wait only in access phase", "Using it in setup"],
                  ["User / Parity", "APB5 / Extensions", "Configurable extension", "Hardcoding into base driver"],
                ]}
              />
            </CollapsibleCard>

            <CollapsibleCard
              title="Atlas Sheet 6 — Waveform Debug Atlas"
              accent="blue"
              icon={<FaListAlt size={12} />}
            >
              <Table
                headers={["Symptom", "Likely Driver Bug", "Waveform Clue"]}
                rows={[
                  ["Slave ignores transfer", "PENABLE asserted same cycle as PSEL", "No 1-cycle setup"],
                  ["Read data randomly wrong", "Sampled PRDATA before PREADY", "PRDATA captured while PREADY=0"],
                  ["Dependent sequence races", "Early item_done()", "Sequence starts next item before APB completion"],
                  ["Regression hangs", "Reset path skipped item_done()", "Item fetched, reset asserted, no completion"],
                  ["Stale transfer after reset", "No drive_idle() under reset", "PSEL/PENABLE remain high"],
                  ["Byte-write mismatch", "Wrong PSTRB width/default", "Strobe not DATA_WIDTH/8"],
                  ["False APB error", "Sampled PSLVERR outside completion", "PSLVERR read in idle/setup/wait"],
                  ["Accidental back-to-back", "Cleanup forgot PSEL=0", "PSEL remains high after completion"],
                ]}
              />
            </CollapsibleCard>
          </section>

          {/* ── §16 Code Labs ───────────────────────────────────────────── */}
          <section id="codelabs">
            <SectionHeading num={16} title="Code Labs (1–5)" />

            {/* Lab 1 */}
            <CollapsibleCard
              title="Code Lab 1 — APB Interface and Transaction Model"
              accent="blue"
              icon={<FaFlask size={12} />}
              defaultOpen={true}
            >
              <div className="space-y-3 text-xs text-slate-300">
                <p>
                  <strong>Goal:</strong> Build <code>apb_if.sv</code> with master and
                  monitor clocking blocks, plus <code>apb_pkg.sv</code> with{" "}
                  <code>apb_item</code> and <code>apb_cfg</code>.
                </p>
                <CodeBlock lang="systemverilog">{`// File: apb_if.sv
interface apb_if #(
  parameter int ADDR_WIDTH = 32,
  parameter int DATA_WIDTH = 32
)(
  input logic pclk,
  input logic preset_n
);
  localparam int STRB_WIDTH = DATA_WIDTH / 8;
  logic [ADDR_WIDTH-1:0] paddr;
  logic                  pwrite;
  logic [DATA_WIDTH-1:0] pwdata;
  logic [STRB_WIDTH-1:0] pstrb;
  logic [2:0]            pprot;
  logic                  psel;
  logic                  penable;
  logic [DATA_WIDTH-1:0] prdata;
  logic                  pready;
  logic                  pslverr;

  clocking master_cb @(posedge pclk);
    default input #1step output #0;
    output paddr, pwrite, pwdata, pstrb, pprot, psel, penable;
    input  prdata, pready, pslverr;
  endclocking

  clocking mon_cb @(posedge pclk);
    default input #1step output #0;
    input paddr, pwrite, pwdata, pstrb, pprot, psel, penable;
    input prdata, pready, pslverr;
  endclocking

  modport master_mp  (clocking master_cb, input pclk, input preset_n);
  modport monitor_mp (clocking mon_cb,    input pclk, input preset_n);
endinterface`}</CodeBlock>

                <CodeBlock lang="systemverilog">{`// File: apb_pkg.sv
package apb_pkg;
  import uvm_pkg::*;
  \`include "uvm_macros.svh"

  typedef enum bit { APB_READ = 1'b0, APB_WRITE = 1'b1 } apb_dir_e;

  class apb_item extends uvm_sequence_item;
    rand bit [31:0] addr;
    rand apb_dir_e  dir;
    rand bit [31:0] wdata;
    rand bit [3:0]  strb;
    rand bit [2:0]  prot;
    rand int unsigned idle_cycles;

    bit [31:0]      rdata;
    bit             slverr;
    bit             aborted;
    bit             timeout;
    int unsigned    wait_cycles;

    constraint c_idle_cycles_reasonable { idle_cycles inside {[0:8]}; }

    \`uvm_object_utils_begin(apb_item)
      \`uvm_field_int(addr,        UVM_ALL_ON | UVM_HEX)
      \`uvm_field_enum(apb_dir_e, dir, UVM_ALL_ON)
      \`uvm_field_int(wdata,       UVM_ALL_ON | UVM_HEX)
      \`uvm_field_int(strb,        UVM_ALL_ON | UVM_BIN)
      \`uvm_field_int(prot,        UVM_ALL_ON | UVM_BIN)
      \`uvm_field_int(idle_cycles, UVM_ALL_ON | UVM_DEC)
      \`uvm_field_int(rdata,       UVM_ALL_ON | UVM_HEX)
      \`uvm_field_int(slverr,      UVM_ALL_ON | UVM_BIN)
      \`uvm_field_int(aborted,     UVM_ALL_ON | UVM_BIN)
      \`uvm_field_int(timeout,     UVM_ALL_ON | UVM_BIN)
      \`uvm_field_int(wait_cycles, UVM_ALL_ON | UVM_DEC)
    \`uvm_object_utils_end

    function new(string name = "apb_item");
      super.new(name);
    endfunction

    function bit is_write(); return (dir == APB_WRITE); endfunction

    function string convert2string();
      return $sformatf("addr=0x%08h dir=%s wdata=0x%08h strb=0b%04b rdata=0x%08h slverr=%0b aborted=%0b wait=%0d",
        addr, (dir == APB_WRITE) ? "WRITE" : "READ", wdata, strb, rdata, slverr, aborted, wait_cycles);
    endfunction
  endclass

  class apb_cfg extends uvm_object;
    bit          enable_timeout = 1'b1;
    int unsigned max_wait_cycles = 100;
    bit          enable_pstrb = 1'b1;
    bit          enable_pprot = 1'b1;
    bit [31:0]   idle_addr = '0;
    bit [31:0]   idle_wdata = '0;
    bit [3:0]    idle_strb = '0;
    bit [2:0]    idle_prot = '0;
    bit          idle_write = 1'b0;

    \`uvm_object_utils_begin(apb_cfg)
      \`uvm_field_int(enable_timeout, UVM_ALL_ON)
      \`uvm_field_int(max_wait_cycles, UVM_ALL_ON)
      \`uvm_field_int(enable_pstrb,    UVM_ALL_ON)
      \`uvm_field_int(enable_pprot,    UVM_ALL_ON)
    \`uvm_object_utils_end

    function new(string name = "apb_cfg"); super.new(name); endfunction
  endclass
endpackage`}</CodeBlock>
              </div>
            </CollapsibleCard>

            {/* Lab 2 */}
            <CollapsibleCard
              title="Code Lab 2 — Complete Blocking APB Master Driver"
              accent="emerald"
              icon={<FaFlask size={12} />}
            >
              <div className="space-y-3 text-xs text-slate-300">
                <p>
                  <strong>Goal:</strong> Complete production driver with setup,
                  access, wait-state loop, timeout guard, reset abort, and cleanup.
                </p>
                <CodeBlock lang="systemverilog">{`import uvm_pkg::*;
\`include "uvm_macros.svh"
import apb_pkg::*;

class apb_master_driver extends uvm_driver #(apb_item);
  \`uvm_component_utils(apb_master_driver)

  virtual apb_if.master_mp vif;
  apb_cfg cfg;

  function new(string name = "apb_master_driver", uvm_component parent = null);
    super.new(name, parent);
  endfunction

  function void build_phase(uvm_phase phase);
    super.build_phase(phase);
    if (!uvm_config_db#(virtual apb_if.master_mp)::get(this, "", "vif", vif)) begin
      \`uvm_fatal("APB_NO_VIF", "virtual apb_if.master_mp must be set for apb_master_driver")
    end
    if (!uvm_config_db#(apb_cfg)::get(this, "", "cfg", cfg)) begin
      cfg = apb_cfg::type_id::create("cfg");
    end
  endfunction

  task run_phase(uvm_phase phase);
    apb_item req;
    drive_idle();

    forever begin
      wait_reset_deasserted();
      seq_item_port.get_next_item(req);
      drive_one_transfer(req);
      seq_item_port.item_done();
    end
  endtask

  task wait_reset_deasserted();
    while (reset_active()) begin
      drive_idle();
      @(vif.master_cb);
    end
  endtask

  function bit reset_active();
    return (vif.preset_n !== 1'b1);
  endfunction

  task drive_idle();
    vif.master_cb.psel    <= 1'b0;
    vif.master_cb.penable <= 1'b0;
    vif.master_cb.pwrite  <= cfg.idle_write;
    vif.master_cb.paddr   <= cfg.idle_addr;
    vif.master_cb.pwdata  <= cfg.idle_wdata;
    vif.master_cb.pstrb   <= cfg.enable_pstrb ? cfg.idle_strb : '0;
    vif.master_cb.pprot   <= cfg.enable_pprot ? cfg.idle_prot : '0;
  endtask

  task apply_idle_gap(apb_item req);
    repeat (req.idle_cycles) begin
      if (reset_active()) begin
        req.aborted = 1'b1;
        drive_idle();
        return;
      end
      drive_idle();
      @(vif.master_cb);
    end
  endtask

  task drive_setup(apb_item req);
    vif.master_cb.psel    <= 1'b1;
    vif.master_cb.penable <= 1'b0;
    vif.master_cb.paddr   <= req.addr;
    vif.master_cb.pwrite  <= req.is_write();
    vif.master_cb.pwdata  <= req.wdata;
    vif.master_cb.pstrb   <= (cfg.enable_pstrb && req.is_write()) ? req.strb : '0;
    vif.master_cb.pprot   <= cfg.enable_pprot ? req.prot : '0;
    @(vif.master_cb); // Exactly one setup cycle
  endtask

  task drive_access_and_sample(apb_item req);
    int unsigned wait_count = 0;
    vif.master_cb.penable <= 1'b1;

    forever begin
      @(vif.master_cb);
      if (reset_active()) begin
        req.aborted = 1'b1;
        drive_idle();
        return;
      end
      if (vif.master_cb.pready) begin
        req.wait_cycles = wait_count;
        if (!req.is_write()) req.rdata = vif.master_cb.prdata;
        req.slverr = vif.master_cb.pslverr;
        return;
      end
      wait_count++;
      if (cfg.enable_timeout && (wait_count > cfg.max_wait_cycles)) begin
        req.timeout = 1'b1;
        drive_idle();
        \`uvm_error("APB_TIMEOUT", $sformatf("PREADY timeout addr=0x%08h", req.addr))
        return;
      end
    end
  endtask

  task drive_one_transfer(apb_item req);
    req.rdata       = '0;
    req.slverr      = 1'b0;
    req.aborted     = 1'b0;
    req.timeout     = 1'b0;
    req.wait_cycles = 0;

    apply_idle_gap(req);
    if (req.aborted || reset_active()) begin
      req.aborted = 1'b1;
      drive_idle();
      return;
    end

    drive_setup(req);
    if (reset_active()) begin
      req.aborted = 1'b1;
      drive_idle();
      return;
    end

    drive_access_and_sample(req);
    drive_idle();
    @(vif.master_cb);
  endtask
endclass`}</CodeBlock>
              </div>
            </CollapsibleCard>

            {/* Lab 3 */}
            <CollapsibleCard
              title="Code Lab 3 — Explicit Response Object Variant"
              accent="violet"
              icon={<FaFlask size={12} />}
            >
              <div className="space-y-3 text-xs text-slate-300">
                <p>
                  <strong>Goal:</strong> Send an explicit response object back to
                  the sequence with preserved sequence and transaction ID routing.
                </p>
                <CodeBlock lang="systemverilog">{`class apb_master_driver_rsp extends apb_master_driver;
  \`uvm_component_utils(apb_master_driver_rsp)

  function new(string name = "apb_master_driver_rsp", uvm_component parent = null);
    super.new(name, parent);
  endfunction

  task run_phase(uvm_phase phase);
    apb_item req;
    apb_item rsp;
    drive_idle();

    forever begin
      wait_reset_deasserted();
      seq_item_port.get_next_item(req);
      drive_one_transfer(req);

      rsp = apb_item::type_id::create("rsp");
      rsp.copy(req);
      rsp.set_id_info(req); // Mandatory for response routing!

      seq_item_port.item_done();
      seq_item_port.put_response(rsp);
    end
  endtask
endclass`}</CodeBlock>
              </div>
            </CollapsibleCard>

            {/* Lab 4 */}
            <CollapsibleCard
              title="Code Lab 4 — Simple APB Smoke Sequences"
              accent="amber"
              icon={<FaFlask size={12} />}
            >
              <div className="space-y-3 text-xs text-slate-300">
                <div className="font-bold text-amber-300">
                  4B. Request-Mutation Smoke Sequence:
                </div>
                <CodeBlock lang="systemverilog">{`class apb_smoke_seq extends uvm_sequence #(apb_item);
  \`uvm_object_utils(apb_smoke_seq)
  function new(string name = "apb_smoke_seq"); super.new(name); endfunction

  task body();
    apb_item req;
    // Write
    req = apb_item::type_id::create("write_req");
    start_item(req);
    req.addr = 32'h0000_1000; req.dir = APB_WRITE; req.wdata = 32'hCAFE_BABE;
    req.strb = 4'b1111; req.prot = 3'b000; req.idle_cycles = 0;
    finish_item(req);

    // Read
    req = apb_item::type_id::create("read_req");
    start_item(req);
    req.addr = 32'h0000_1000; req.dir = APB_READ; req.idle_cycles = 1;
    finish_item(req);
    \`uvm_info("APB_SEQ", {"Read completed: ", req.convert2string()}, UVM_MEDIUM)
  endtask
endclass`}</CodeBlock>

                <div className="font-bold text-blue-300">
                  4C. Explicit-Response Smoke Sequence:
                </div>
                <CodeBlock lang="systemverilog">{`class apb_smoke_rsp_seq extends uvm_sequence #(apb_item);
  \`uvm_object_utils(apb_smoke_rsp_seq)
  function new(string name = "apb_smoke_rsp_seq"); super.new(name); endfunction

  task body();
    apb_item req, rsp;
    req = apb_item::type_id::create("read_req");
    start_item(req);
    req.addr = 32'h0000_1000; req.dir = APB_READ;
    finish_item(req);
    get_response(rsp);
    \`uvm_info("APB_SEQ_RSP", {"Read response: ", rsp.convert2string()}, UVM_MEDIUM)
  endtask
endclass`}</CodeBlock>
              </div>
            </CollapsibleCard>

            {/* Lab 5 */}
            <CollapsibleCard
              title="Code Lab 5 — Bad Code Review and Fix"
              accent="rose"
              icon={<FaFlask size={12} />}
            >
              <div className="space-y-3 text-xs text-slate-300">
                <div className="text-rose-400 font-bold">
                  ❌ Broken Driver Fragment:
                </div>
                <CodeBlock lang="systemverilog">{`task broken_drive(apb_item req);
  seq_item_port.item_done();  // BUG 1: Early item_done
  vif.psel    <= 1'b1;
  vif.penable <= 1'b1;         // BUG 2: Skipped setup phase
  vif.paddr   <= req.addr;
  vif.pwrite  <= req.is_write();
  vif.pwdata  <= req.wdata;
  @(posedge vif.pclk);
  if (!req.is_write()) req.rdata = vif.prdata; // BUG 3: Ignored PREADY!
  if (vif.pslverr) \`uvm_error("APB_ERR", "Slave error") // BUG 4: Misinterpreted PSLVERR
  vif.penable <= 1'b0;
endtask`}</CodeBlock>

                <div className="text-emerald-400 font-bold">
                  ✅ Corrected Fragment:
                </div>
                <CodeBlock lang="systemverilog">{`task fixed_drive(apb_item req);
  req.rdata       = '0;
  req.slverr      = 1'b0;
  req.aborted     = 1'b0;
  req.timeout     = 1'b0;
  req.wait_cycles = 0;

  if (reset_active()) begin
    req.aborted = 1'b1;
    drive_idle();
    return;
  end

  drive_setup(req);
  if (reset_active()) begin
    req.aborted = 1'b1;
    drive_idle();
    return;
  end

  drive_access_and_sample(req);
  drive_idle();
  @(vif.master_cb);
endtask`}</CodeBlock>
              </div>
            </CollapsibleCard>
          </section>

          {/* ── §17 Bug Gallery ─────────────────────────────────────────── */}
          <section id="bugs">
            <SectionHeading num={17} title="Bug Gallery (1–12)" />
            <div className="space-y-4">
              {module8BugGallery.map((bug, idx) => (
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
                "Clocking block consistency: Driver uses master_cb consistently.",
                "Setup drive timing: PADDR, PWRITE, PWDATA, PSTRB, PPROT, and PSEL driven before setup is observed by DUT.",
                "Access transition: PENABLE is asserted only after exactly one setup cycle.",
                "Input sampling: PREADY, PRDATA, and PSLVERR are sampled through master_cb (#1step).",
                "Read sampling: PRDATA sampled only after PREADY===1'b1 in access.",
                "Error sampling: PSLVERR sampled only after PREADY===1'b1 in access.",
                "Wait stability: Driver does not modify request fields while PREADY==0 in access.",
                "Reset sampling: Reset detection is consistent with project reset synchrony.",
                "Cleanup timing: Driver does not deassert/overwrite active fields before sampling response.",
                "Monitor race: Monitor samples passively via mon_cb and does not influence driver state.",
                "No mixed access: No uncontrolled mix of @(posedge clk) and @(vif.master_cb).",
                "NBA confusion: Driver assignments do not rely on accidental active-region execution.",
                "Back-to-back transfer: If enabled, PENABLE drops to 0 for next setup.",
                "Phase exit: Forever loop has reset handling and does not hold stale transfers forever.",
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
                19.2 Recommended Log Macros
              </h4>
              <CodeBlock lang="systemverilog">{`\`uvm_info("APB_SETUP",
  $sformatf("addr=0x%08h write=%0b wdata=0x%08h strb=0b%04b prot=0b%03b",
            req.addr, req.is_write(), req.wdata, req.strb, req.prot),
  UVM_HIGH)

\`uvm_info("APB_COMPLETE",
  $sformatf("addr=0x%08h write=%0b rdata=0x%08h slverr=%0b wait=%0d",
            req.addr, req.is_write(), req.rdata, req.slverr, req.wait_cycles),
  UVM_MEDIUM)

\`uvm_warning("APB_RESET_ABORT",
  $sformatf("addr=0x%08h write=%0b", req.addr, req.is_write()))`}</CodeBlock>

              <h4 className="font-bold text-blue-300 text-xs uppercase tracking-wider pt-2">
                19.5 10-Step Debug Triage Flow
              </h4>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Did sequence item start?</li>
                <li>Did APB setup appear?</li>
                <li>Was setup exactly one cycle?</li>
                <li>Did access assert PENABLE?</li>
                <li>Did PREADY eventually assert?</li>
                <li>Were PRDATA / PSLVERR sampled only at completion?</li>
                <li>Did cleanup happen?</li>
                <li>Did item_done occur after terminal state?</li>
                <li>Did response route to the right sequence?</li>
                <li>Did monitor observe the same transfer?</li>
              </ol>
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
                  20.1 Driver vs 20.2 Monitor
                </div>
                <p className="text-slate-300 leading-relaxed">
                  <strong>Driver:</strong> Drives APB request pins, observes PREADY
                  for progress, samples PRDATA/PSLVERR for response return.
                  <br />
                  <strong>Monitor:</strong> Passively reconstructs full APB
                  transfers from pins and broadcasts to analysis ports.
                </p>
              </div>
              <div className="p-4 rounded-xl border border-violet-500/20 bg-slate-900/50 space-y-2">
                <div className="font-bold text-violet-300">
                  20.3 Scoreboard vs 20.4 Assertions
                </div>
                <p className="text-slate-300 leading-relaxed">
                  <strong>Scoreboard:</strong> Compares observed read data against
                  reference model prediction and checks register side-effects.
                  <br />
                  <strong>Assertions (SVA):</strong> Enforces temporal protocol
                  rules (1-cycle setup, stability during wait states, legal PENABLE).
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
              headers={["Decision", "Choices", "Module 8 Senior Recommendation"]}
              rows={[
                ["Decision 1: Blocking vs Split-Phase driver?", "Blocking vs Split-Phase vs Pipelined", "Blocking driver by default; matches APB non-pipelined semantics."],
                ["Decision 2: Request mutation vs Explicit response?", "Mutate req vs item_done(rsp) vs put_response", "Explicit response (put_response) for scalable VIP with ID routing."],
                ["Decision 3: Cleanup-to-idle vs Back-to-back?", "Idle by default vs Back-to-back", "Cleanup-to-idle by default; back-to-back as documented optimization."],
                ["Decision 4: Timeout location?", "Driver vs Assertion vs TB Watchdog", "Configurable driver timeout for regressions + SVA bounded liveness."],
                ["Decision 5: Clocking block vs Raw posedge?", "master_cb vs @(posedge clk)", "Clocking block for reusable VIP-style driver."],
                ["Decision 6: APB4 Optional signals (PSTRB/PPROT)?", "Always in interface vs Config-gated", "Include in interface; gate driving behavior via apb_cfg."],
              ]}
            />
          </section>

          {/* ── §22 Scalability Notes ───────────────────────────────────── */}
          <section id="scalability">
            <SectionHeading num={22} title="Scalability Notes" />
            <div className="space-y-3 text-sm text-slate-300">
              <p>
                <strong>22.1 Width Parameterization:</strong> Parameterize address
                width, data width, and strobe width (<code>DATA_WIDTH/8</code>) in
                production VIP.
              </p>
              <p>
                <strong>22.2 Multi-Slave APB Selection:</strong> Decide whether to
                use decoded single <code>psel</code> per agent or a vector{" "}
                <code>psel[N]</code> one-hot selection at fabric level.
              </p>
              <p>
                <strong>22.6 Avoid False Generality:</strong> Do not turn APB into
                AXI. APB does not need out-of-order response tables, burst-beat
                schedulers, or reorder buffers.
              </p>
            </div>
          </section>

          {/* ── §23 Review Checklist ────────────────────────────────────── */}
          <section id="review">
            <SectionHeading num={23} title="Review Checklist" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/40 space-y-2">
                <h5 className="font-bold text-blue-300">Protocol & Timing Review</h5>
                <ul className="space-y-1 text-slate-300">
                  <li>✔ Setup phase is exactly one cycle (PSEL=1, PENABLE=0)</li>
                  <li>✔ Access phase asserts PENABLE=1</li>
                  <li>✔ PREADY is sampled only in access</li>
                  <li>✔ Request fields held stable during wait states</li>
                  <li>✔ PRDATA & PSLVERR sampled only at completion</li>
                  <li>✔ Cleanup-to-idle is explicit</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/40 space-y-2">
                <h5 className="font-bold text-violet-300">UVM & Boundary Review</h5>
                <ul className="space-y-1 text-slate-300">
                  <li>✔ get_next_item() paired with item_done()</li>
                  <li>✔ No get() / item_done() mixing</li>
                  <li>✔ rsp.set_id_info(req) used on explicit responses</li>
                  <li>✔ Reset abort releases sequencer handshake</li>
                  <li>✔ Zero scoreboard checking in driver</li>
                  <li>✔ Monitor independently observes bus transfers</li>
                </ul>
              </div>
            </div>
          </section>

          {/* ── §24 Interview Q&A ───────────────────────────────────────── */}
          <section id="interview">
            <SectionHeading num={24} title="Interview Q&A (Q1–Q12)" />
            <div className="space-y-4">
              {module8InterviewQA.map((qa, idx) => (
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
              title="Final Recall Card — APB Master Driver Deep Dive"
            />
            <div className="p-5 rounded-xl border border-blue-500/30 bg-linear-to-r from-blue-500/10 to-indigo-500/10 space-y-3">
              <Callout type="hook">
                <strong>Memory Hook:</strong> "APB Driver = Phase Machine +
                Sequencer Contract"
              </Callout>
              <CodeBlock lang="systemverilog">{`forever begin
  wait_reset_deasserted();
  seq_item_port.get_next_item(req);
  drive_one_transfer(req); // complete, reset-abort, or timeout-abort
  seq_item_port.item_done();
end`}</CodeBlock>
              <p className="text-xs text-slate-300">
                <strong>Interview Line:</strong> "My APB master driver is a
                blocking phase machine. It converts one transaction into one legal
                APB transfer, samples response only at completion, handles
                reset/timeout as terminal outcomes, and keeps checking responsibility
                outside the driver."
              </p>
            </div>
          </section>

          {/* ── §26 Key Takeaways ───────────────────────────────────────── */}
          <section id="takeaways">
            <SectionHeading num={26} title="Key Takeaways" />
            <ol className="space-y-1.5 list-decimal list-inside text-slate-300 text-sm">
              {[
                "APB setup is one cycle. Do not wait for PREADY in setup.",
                "APB access begins with PENABLE=1. PREADY matters only there.",
                "Hold request fields stable during wait states.",
                "Sample PRDATA only at completion.",
                "Sample PSLVERR only at completion.",
                "For blocking APB drivers, call item_done() after terminal state.",
                "Do not mix get() with item_done().",
                "If using explicit responses, call rsp.set_id_info(req).",
                "Reset abort is not APB error.",
                "Timeout is environment policy unless project spec defines a bound.",
                "The driver is response-aware, not scoreboard-aware.",
                "Clocking blocks make driver timing reviewable.",
                "Cleanup is a design choice: idle by default, back-to-back by enhancement.",
                "Senior-quality APB drivers are easy to map from code to waveform.",
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
                Senior & Principal Interview Question Bank:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Where exactly should item_done() be placed in a blocking APB master driver?</li>
                <li>Why is PREADY ignored during setup?</li>
                <li>What happens if PSEL and PENABLE are asserted together for a new transfer?</li>
                <li>When is PRDATA valid for driver capture?</li>
                <li>When is PSLVERR valid for driver capture?</li>
                <li>How do you handle reset after get_next_item() but before APB completion?</li>
                <li>Why is reset abort not the same as PSLVERR?</li>
                <li>What is the difference between get() and get_next_item() in a driver?</li>
                <li>When do you use try_next_item() in an APB driver?</li>
                <li>Why does try_next_item() require null handling?</li>
                <li>When do you need an explicit response object?</li>
                <li>Why is set_id_info(req) required for response routing?</li>
                <li>Should the APB driver compare expected read data?</li>
                <li>What belongs in monitor vs driver for APB?</li>
                <li>What protocol properties should be asserted rather than coded into the driver?</li>
                <li>How do you implement APB wait-state handling?</li>
                <li>How do you support APB back-to-back transfers legally?</li>
                <li>Where should random idle insertion happen?</li>
                <li>How do you debug a read that only fails when wait states are inserted?</li>
                <li>What makes an APB driver senior/principal quality rather than demo quality?</li>
              </ol>
            </div>
          </section>

          {/* ── §28 Coding Exercise ─────────────────────────────────────── */}
          <section id="exercise">
            <SectionHeading
              num={28}
              title="Coding Exercise — Optional Back-to-Back APB Transfers"
            />
            <div className="space-y-4 text-sm text-slate-300">
              <p>
                <strong>Task:</strong> Modify the Code Lab 2 driver to support{" "}
                <code>cfg.enable_back_to_back</code>.
              </p>
              <CollapsibleCard
                title="Exercise Requirements & Review Constraints"
                accent="blue"
                defaultOpen={true}
              >
                <div className="space-y-2 text-xs text-slate-300">
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Preserve 1-cycle setup phase for every transfer.</li>
                    <li>Never keep PENABLE=1 into the next transfer's setup.</li>
                    <li>Do not change active transfer fields while PREADY=0.</li>
                    <li>Handle reset between transfers cleanly.</li>
                    <li>Call item_done() exactly once for every accepted item.</li>
                  </ol>
                  <p className="pt-2 text-blue-300">
                    <strong>Starter Hint:</strong> After access completion of
                    transfer N, immediately schedule <code>penable &lt;= 1'b0</code>,{" "}
                    <code>psel &lt;= 1'b1</code>, and next request fields for
                    transfer N+1.
                  </p>
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
                <FaCheckSquare /> Module 8 — Final Readiness Verdict: PASS (LOCKED)
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Module 8: APB Master Driver Deep Dive is fully converted into
                React. All 24 memory cards, 6 atlas sheets, 5 code labs, 12 bug
                gallery entries, race-condition checklists, logging strategies, and
                12 interview Q&As are complete and verified.
              </p>
              <p className="text-xs text-blue-200/80">
                You are now prepared to advance to Module 9: Ready/Valid and
                Streaming Driver Deep Dive.
              </p>
            </div>
          </section>

          {/* Navigation to next module */}
          <ModuleNavigation
            nextPath="/driver-mastery/module9"
            nextTitle="Module 9: Ready/Valid and Streaming Driver Deep Dive →"
          />
        </main>
      </div>
    </div>
  );
};

export default Module8;
