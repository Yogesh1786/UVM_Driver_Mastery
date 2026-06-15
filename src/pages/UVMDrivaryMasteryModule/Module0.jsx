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

const module0MemoryCards = [
  {
    title: "Card 1 — Driver Foundation Starts Before the Driver Class",
    accent: "violet",
    hook: "A driver is a timing contract wearing a UVM class.",
    concept:
      "Before writing class my_driver extends uvm_driver, define transaction intent, interface timing, reset behavior, and completion semantics.",
    code: `class my_driver extends uvm_driver #(my_item, my_item);
  \`uvm_component_utils(my_driver)

  virtual my_if vif;

  function new(string name, uvm_component parent);
    super.new(name, parent);
  endfunction
endclass`,
    trap: "Starting with run_phase() before defining what 'done' means.",
    interview:
      "I define the protocol execution contract first, then implement the UVM driver around it.",
  },
  {
    title: "Card 2 — Transaction Is Intent, Not Waveform",
    accent: "blue",
    hook: "The item says what. The driver decides when and how.",
    concept:
      "A sequence item contains abstract stimulus fields. The driver maps those fields to legal signal transitions.",
    code: `class bus_item extends uvm_sequence_item;
  rand bit        write;
  rand bit [31:0] addr;
  rand bit [31:0] wdata;
endclass`,
    trap: "Putting low-level waveform sequencing inside the item.",
    interview:
      "A transaction describes intent. The driver owns waveform execution.",
  },
  {
    title: "Card 3 — SystemVerilog Handles Are References",
    accent: "amber",
    hook: "Two handles can point to one object.",
    concept:
      "The driver receives an object handle. If it modifies req, it may modify the same object visible to the sequence.",
    code: `bus_item a;
bus_item b;

a = bus_item::type_id::create("a");
b = a;
b.wdata = 32'h1234_5678; // a.wdata also changes`,
    trap: "Writing read data or status into request fields without a documented contract.",
    interview:
      "I treat request objects as read-mostly and use response objects for returned data/status when needed.",
  },
  {
    title: "Card 4 — Objects Are Data, Components Are Hierarchy",
    accent: "emerald",
    hook: "Objects move. Components live in the tree.",
    concept:
      "Transactions extend uvm_object or uvm_sequence_item. Drivers extend uvm_component through uvm_driver.",
    code: `class foundation_item extends uvm_sequence_item;
  \`uvm_object_utils(foundation_item)
endclass

class foundation_driver extends uvm_driver #(foundation_item, foundation_item);
  \`uvm_component_utils(foundation_driver)
endclass`,
    trap: "Using a component-style constructor for an object.",
    interview:
      "Sequence items are factory-created data objects; drivers are hierarchical UVM components.",
  },
  {
    title: "Card 5 — uvm_sequence_item Is the Driver's Request Currency",
    accent: "violet",
    hook: "The sequencer trades in sequence items.",
    concept:
      "A driver consumes uvm_sequence_item derivatives. These carry stimulus intent and UVM routing identity.",
    code: `class foundation_item extends uvm_sequence_item;
  rand bit        write;
  rand bit [31:0] addr;
  rand bit [31:0] wdata;
       bit [31:0] rdata;
endclass`,
    trap: "Using a plain SV class as a sequencer item and losing UVM transaction identity.",
    interview:
      "I use uvm_sequence_item because the sequencer-driver mechanism depends on UVM transaction identity.",
  },
  {
    title: "Card 6 — Factory Registration Enables Replacement",
    accent: "blue",
    hook: "No factory visibility, no clean override.",
    concept:
      "Factory macros register object/component types for controlled construction and override.",
    code: `\`uvm_object_utils(foundation_item)
\`uvm_component_utils(foundation_driver)`,
    trap: "Hardcoding new() for everything and later being unable to override types cleanly.",
    interview:
      "Factory registration makes driver and transaction architecture reusable without editing environment source.",
  },
  {
    title: "Card 7 — Virtual Interface Is the Driver's Pin Handle",
    accent: "amber",
    hook: "A class cannot drive wires without a bridge.",
    concept:
      "The driver accesses static HDL signals through a virtual interface.",
    code: `virtual foundation_bus_if vif;`,
    trap: "Declaring vif but never setting it from the testbench.",
    interview:
      "The virtual interface bridges class-based UVM code and static HDL pins.",
  },
  {
    title: "Card 8 — config_db Failure Should Be Fatal",
    accent: "rose",
    hook: "No interface means no legal driver.",
    concept: "A driver without a virtual interface cannot operate. Fail early.",
    code: `if (!uvm_config_db#(virtual foundation_bus_if)::get(this, "", "vif", vif)) begin
  \`uvm_fatal("NOVIF", "foundation_driver requires virtual interface 'vif'")
end`,
    trap: "Letting a null vif fail later in run_phase.",
    interview:
      "I fatal at build time when required driver resources are missing.",
  },
  {
    title: "Card 9 — build_phase Configures; run_phase Drives",
    accent: "emerald",
    hook: "Plumbing first, traffic later.",
    concept:
      "Use build_phase to retrieve static resources. Use run_phase for time-consuming traffic.",
    code: `function void build_phase(uvm_phase phase);
  super.build_phase(phase);
  // get vif here
endfunction

task run_phase(uvm_phase phase);
  // drive traffic here
endtask`,
    trap: "Trying to fetch sequence items in build/connect phase.",
    interview:
      "build_phase prepares the driver. run_phase executes timed protocol behavior.",
  },
  {
    title: "Card 10 — connect_phase Wires Driver to Sequencer",
    accent: "violet",
    hook: "No connection, no items.",
    concept:
      "The driver's seq_item_port must connect to the sequencer's seq_item_export.",
    code: `drv.seq_item_port.connect(sqr.seq_item_export);`,
    trap: "Creating driver and sequencer but forgetting the connection.",
    interview:
      "The sequencer-driver API only works after the pull port/export connection is made.",
  },
  {
    title: "Card 11 — run_phase Is Timed Behavior",
    accent: "blue",
    hook: "Drivers consume simulation time.",
    concept:
      "Pin driving, waits, clocks, handshakes, reset waits, and response sampling belong in tasks.",
    code: `task run_phase(uvm_phase phase);
  forever begin
    wait_for_reset_release();
    seq_item_port.get_next_item(req);
    drive_one_transfer(req);
    seq_item_port.item_done();
  end
endtask`,
    trap: "Putting time-consuming behavior in a function.",
    interview:
      "Driver execution is temporal, so the active driver path belongs in tasks.",
  },
  {
    title: "Card 12 — Clocking Blocks Reduce Race Ambiguity",
    accent: "amber",
    hook: "Drive and sample by contract, not luck.",
    concept:
      "Clocking blocks encode when the testbench drives outputs and samples inputs.",
    code: `@(vif.drv_cb);
vif.drv_cb.valid <= 1'b1;
vif.drv_cb.addr  <= req.addr;`,
    trap: "Raw @(posedge clk) with blocking assignment into DUT inputs.",
    interview:
      "Clocking blocks reduce simulator-scheduling dependence at the driver/DUT boundary.",
  },
  {
    title: "Card 13 — Reset Is a Driver Architecture Problem",
    accent: "rose",
    hook: "Reset can interrupt ownership.",
    concept:
      "A driver must define what happens if reset occurs after it has fetched an item.",
    code: `if (vif.drv_cb.reset_n !== 1'b1) begin
  status = TXN_ABORTED;
  drive_idle();
  return;
end`,
    trap: "Resetting pins but not completing or aborting the sequencer item.",
    interview:
      "Reset must close the driver's ownership contract, not just clear pins.",
  },
  {
    title: "Card 14 — get_next_item() Means the Driver Owes Completion",
    accent: "violet",
    hook: "Fetch creates debt.",
    concept:
      "After get_next_item(req), the driver owns the request until item_done().",
    code: `seq_item_port.get_next_item(req);
drive_one_transfer(req);
seq_item_port.item_done();`,
    trap: "Fetching an item and exiting on reset without item_done().",
    interview:
      "With get_next_item(), the driver must close the handshake with item_done().",
  },
  {
    title: "Card 15 — item_done() Is Not Decorative",
    accent: "blue",
    hook: "item_done() releases the sequencer.",
    concept:
      "For non-pipelined drivers, item_done() usually comes after pin-level completion, required response sampling, and cleanup.",
    code: `drive_request(req);
sample_response_if_needed(req);
cleanup_bus();
seq_item_port.item_done();`,
    trap: "Calling item_done() immediately after fetching the item.",
    interview:
      "I place item_done() where the driver no longer architecturally owns the request.",
  },
  {
    title: "Card 16 — try_next_item() Requires Null Handling",
    accent: "amber",
    hook: "Try means maybe no item.",
    concept:
      "If try_next_item() returns null, the driver did not receive an item and must not call item_done().",
    code: `seq_item_port.try_next_item(req);

if (req == null) begin
  drive_idle_cycle();
end
else begin
  drive_one_transfer(req);
  seq_item_port.item_done();
end`,
    trap: "Calling item_done() after null.",
    interview:
      "try_next_item() supports idle behavior, but null handling is mandatory.",
  },
  {
    title: "Card 17 — get() Is a Different Contract",
    accent: "emerald",
    hook: "Do not complete an item twice.",
    concept:
      "get() retrieves an item using a different sequencer-driver contract. Do not follow it with item_done().",
    code: `seq_item_port.get(req);
drive_one_transfer(req);
// No item_done()`,
    trap: "Mixing get() examples with get_next_item() examples.",
    interview: "get_next_item() pairs with item_done(). get() does not.",
  },
  {
    title: "Card 18 — Immediate Response Can Use item_done(rsp)",
    accent: "violet",
    hook: "Complete and respond together when architecture allows it.",
    concept:
      "For a simple non-pipelined driver, the response may be returned at the same time as request completion.",
    code: `rsp = make_response(req, status, sampled_rdata);
seq_item_port.item_done(rsp);`,
    trap: "Using delayed-response machinery for a simple blocking driver without need.",
    interview:
      "In a non-pipelined driver, item_done(rsp) is valid when request completion and response availability coincide.",
  },
  {
    title: "Card 19 — Delayed Response Needs a Chosen Response Path",
    accent: "blue",
    hook: "If response comes later, route it later and route it once.",
    concept:
      "For pipelined or delayed responses, request completion and response return may be separated. The driver may use seq_item_port.put_response(rsp) or rsp_port.write(rsp).",
    code: `seq_item_port.item_done();
// later, when response is available
seq_item_port.put_response(rsp);

// Alternate response-port style:
// seq_item_port.item_done();
// rsp_port.write(rsp);`,
    trap: "Returning both item_done(rsp) and put_response(rsp) for the same response.",
    interview:
      "I choose one response contract per driver architecture and wire the environment accordingly.",
  },
  {
    title: "Card 20 — Responses Need Routing Identity",
    accent: "rose",
    hook: "A response without ID is mail without an address.",
    concept:
      "When returning a response, copy routing identity from the request.",
    code: `rsp.set_id_info(req);`,
    trap: "Creating a response object without sequence/transaction ID inheritance.",
    interview:
      "If response routing matters, I call set_id_info(req) before returning the response.",
  },
  {
    title: "Card 21 — Driver Samples Only What It Needs",
    accent: "amber",
    hook: "A driver is not a monitor with drive access.",
    concept:
      "The driver samples DUT outputs only when needed for handshake, backpressure, error, response, or reactive behavior.",
    code: `if (vif.drv_cb.ready === 1'b1) begin
  sampled_rdata = vif.drv_cb.rdata;
end`,
    trap: "Adding expected-data checks inside the driver.",
    interview:
      "The driver samples outputs only to complete its active protocol contract.",
  },
  {
    title: "Card 22 — Driver Should Not Own Objections",
    accent: "emerald",
    hook: "Drivers run; tests decide duration.",
    concept:
      "Drivers commonly run forever and should usually not raise/drop phase objections. Tests or sequences control simulation lifetime.",
    code: `task run_phase(uvm_phase phase);
  forever begin
    seq_item_port.get_next_item(req);
    drive_one_transfer(req);
    seq_item_port.item_done();
  end
endtask`,
    trap: "Driver raises an objection and never drops it.",
    interview:
      "I avoid driver-owned objections unless there is a documented architectural reason.",
  },
  {
    title: "Card 23 — Logs Must Mark Ownership Transitions",
    accent: "violet",
    hook: "Log ownership, not noise.",
    concept:
      "Driver logs should identify fetch, drive start, wait, completion, response, cleanup, abort, and item_done.",
    code: `\`uvm_info("DRV_FETCH", req.convert2string(), UVM_MEDIUM)
\`uvm_info("DRV_DONE",  rsp.convert2string(), UVM_MEDIUM)`,
    trap: "Logging only 'done' with no request identity or state.",
    interview: "Good driver logs expose where ownership got stuck.",
  },
  {
    title: "Card 24 — Compile Order Is Part of Foundation Discipline",
    accent: "blue",
    hook: "Types must exist before classes use them.",
    concept:
      "Packages, interfaces, drivers, environment, and top must be compiled in a sane order.",
    code: `// 1. foundation_item_pkg
// 2. foundation_bus_if
// 3. foundation_driver_pkg
// 4. foundation_env_pkg
// 5. top`,
    trap: "Compiling a driver package before the interface type used by its virtual interface declaration is visible.",
    interview:
      "A reusable driver is not just syntactically correct; it must compile in a portable file/package order.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// DATA — Bug Gallery
// ─────────────────────────────────────────────────────────────────────────────

const module0BugGallery = [
  {
    title: "Bug 1 — Missing item_done() After Reset Abort",
    symptom:
      "Sequence hangs after reset. No more items are driven after reset release.",
    waveform:
      "No interface activity after reset deassertion; sequence appears stuck.",
    cause:
      "Driver fetched an item but exited without closing the sequencer contract.",
    bad: `seq_item_port.get_next_item(req);

if (!vif.reset_n) begin
  drive_idle();
  return;
end

drive_one_transfer(req);
seq_item_port.item_done();`,
    fix: `seq_item_port.get_next_item(req);

if (!vif.reset_n) begin
  drive_idle();
  rsp = make_response(req, TXN_ABORTED, '0);
  seq_item_port.item_done(rsp);
end
else begin
  drive_one_transfer(req, status, rdata);
  rsp = make_response(req, status, rdata);
  seq_item_port.item_done(rsp);
end`,
    interview:
      "Reset must be converted into a defined item outcome once the driver has accepted the request.",
  },
  {
    title: "Bug 2 — item_done() After Null try_next_item()",
    symptom: "Sequencer reports completion without an outstanding item.",
    waveform: "Error occurs during idle cycles.",
    cause: "No item was granted — driver called item_done() anyway.",
    bad: `seq_item_port.try_next_item(req);

if (req == null) begin
  drive_idle_cycle();
end

seq_item_port.item_done(); // wrong — always called`,
    fix: `seq_item_port.try_next_item(req);

if (req == null) begin
  drive_idle_cycle();
end
else begin
  drive_one_transfer(req);
  seq_item_port.item_done();
end`,
    interview: "Null means the driver did not receive item ownership.",
  },
  {
    title: "Bug 3 — item_done() After get()",
    symptom: "Sequencer contract error or double-completion behavior.",
    waveform:
      "Pin waveform may look correct, but UVM handshake diagnostics fail.",
    cause: "get() is not paired with item_done().",
    bad: `seq_item_port.get(req);
drive_one_transfer(req);
seq_item_port.item_done(); // wrong`,
    fix: `seq_item_port.get(req);
drive_one_transfer(req);
// No item_done()`,
    interview: "get_next_item() pairs with item_done(). get() does not.",
  },
  {
    title: "Bug 4 — Response Without set_id_info(req)",
    symptom: "Sequence waits for response or receives a mismatched response.",
    waveform:
      "Driver logs response, but sequence does not get the expected response.",
    cause: "Response lacks sequence/transaction routing identity.",
    bad: `rsp = foundation_item::type_id::create("rsp");
rsp.rdata = vif.drv_cb.rdata;
seq_item_port.put_response(rsp); // missing set_id_info`,
    fix: `rsp = foundation_item::type_id::create("rsp");
rsp.set_id_info(req); // required
rsp.rdata = vif.drv_cb.rdata;
seq_item_port.put_response(rsp);`,
    interview: "Response payload is useless if the sequencer cannot route it.",
  },
  {
    title: "Bug 5 — Duplicate Response",
    symptom:
      "Sequence sees duplicate responses or response queue becomes confused.",
    waveform:
      "Only one bus transfer occurs, but two response events are logged.",
    cause: "The same response was returned through two mechanisms.",
    bad: `rsp = make_response(req, status, rdata);

seq_item_port.item_done(rsp);
seq_item_port.put_response(rsp); // double response`,
    fix: `// Immediate non-pipelined:
seq_item_port.item_done(rsp);

// OR delayed response:
seq_item_port.item_done();
// later
seq_item_port.put_response(rsp);`,
    interview: "I choose one response contract per driver architecture.",
  },
  {
    title: "Bug 6 — Driver Mutates Request Object",
    symptom: "Sequence-side request appears changed unexpectedly.",
    waveform:
      "Waveform is correct, but debug logs disagree with the original request.",
    cause:
      "The driver modified the same object handle created by the sequence.",
    bad: `seq_item_port.get_next_item(req);
drive_read(req);
req.rdata = vif.drv_cb.rdata; // mutates original`,
    fix: `rsp = foundation_item::type_id::create("rsp");
rsp.set_id_info(req);
rsp.rdata = vif.drv_cb.rdata;
seq_item_port.item_done(rsp);`,
    interview:
      "I keep request intent stable and return observed data through a response object.",
  },
  {
    title: "Bug 7 — Raw Posedge Race",
    symptom: "DUT sometimes samples old values.",
    waveform:
      "Driver assignment and DUT sampling happen on the same clock edge.",
    cause: "Drive/sample scheduling is not explicitly controlled.",
    bad: `@(posedge vif.clk);
vif.valid = 1'b1;
vif.addr  = req.addr; // race-prone blocking assignment`,
    fix: `@(vif.drv_cb);
vif.drv_cb.valid <= 1'b1;
vif.drv_cb.addr  <= req.addr;`,
    interview:
      "Clocking blocks reduce race dependence on simulator scheduling.",
  },
  {
    title: "Bug 8 — Driver Becomes Scoreboard",
    symptom:
      "Driver and scoreboard report overlapping or inconsistent functional errors.",
    waveform: "Driver emits data mismatch errors after response sampling.",
    cause: "Driver crossed into end-to-end checking.",
    bad: `if (vif.drv_cb.rdata !== expected_model[req.addr]) begin
  \`uvm_error("DRVCHK", "Read data mismatch") // wrong owner
end`,
    fix: `rsp.rdata = vif.drv_cb.rdata;
// Scoreboard checks expected vs actual through monitor path.`,
    interview:
      "A driver may capture response data for sequence flow, but expected-data checking belongs in the scoreboard.",
  },
  {
    title: "Bug 9 — No Cleanup After Transfer",
    symptom: "Next transfer appears duplicated or starts early.",
    waveform: "valid remains asserted after intended completion.",
    cause:
      "The driver released the item without returning the interface to a legal next state.",
    bad: `vif.drv_cb.valid <= 1'b1;
wait (vif.drv_cb.ready);
seq_item_port.item_done(); // no cleanup`,
    fix: `// after clocked ready completion:
drive_idle();
seq_item_port.item_done();`,
    interview:
      "For non-pipelined drivers, cleanup is part of completion unless the protocol explicitly supports back-to-back transfers.",
  },
  {
    title: "Bug 10 — Missing Driver/Sequencer Connection",
    symptom: "Driver waits forever for items.",
    waveform: "No interface activity; sequence may appear started.",
    cause: "seq_item_port is not connected to seq_item_export.",
    bad: `drv = foundation_driver::type_id::create("drv", this);
sqr = foundation_sequencer::type_id::create("sqr", this);
// Missing connect_phase connection`,
    fix: `function void connect_phase(uvm_phase phase);
  super.connect_phase(phase);
  drv.seq_item_port.connect(sqr.seq_item_export);
endfunction`,
    interview:
      "Creating the driver and sequencer is not enough. Their TLM pull interface must be connected.",
  },
  {
    title: "Bug 11 — config_db Path Mismatch",
    symptom:
      "Driver reports NOVIF fatal. No traffic starts; failure at build phase.",
    waveform: "No activity; failure before run_phase.",
    cause: "Set path does not match driver instance path.",
    bad: `// Wrong path used:
uvm_config_db#(virtual foundation_bus_if)::set(
  null,
  "uvm_test_top.env.agent.drv", // incorrect
  "vif",
  bus_if
);`,
    fix: `uvm_config_db#(virtual foundation_bus_if)::set(
  null,
  "uvm_test_top.env.drv", // correct path
  "vif",
  bus_if
);`,
    interview:
      "A null virtual interface is usually a config path/type mismatch, not a driver timing bug.",
  },
  {
    title: "Bug 12 — Driver Owns Objection Forever",
    symptom: "Simulation never ends.",
    waveform: "Traffic may complete, but runtime phase remains active.",
    cause:
      "The driver raises an objection before a forever loop and never drops it.",
    bad: `task run_phase(uvm_phase phase);
  phase.raise_objection(this); // never dropped

  forever begin
    seq_item_port.get_next_item(req);
    drive_one_transfer(req);
    seq_item_port.item_done();
  end

  phase.drop_objection(this); // unreachable
endtask`,
    fix: `task run_phase(uvm_phase phase);
  forever begin
    seq_item_port.get_next_item(req);
    drive_one_transfer(req);
    seq_item_port.item_done();
  end
endtask
// Test or sequence controls objection lifetime.`,
    interview:
      "Drivers usually do not own test duration. They are service components that run while the phase is active.",
  },
  {
    title: "Bug 13 — Sequence Waits for Response From Request-Only Driver",
    symptom: "The sequence hangs after the request completes.",
    waveform:
      "Bus transfer completes and item_done() occurs, but no response reaches the sequence.",
    cause:
      "The sequence expects a response, but the driver contract is request-only.",
    bad: `// Driver:
seq_item_port.item_done(); // no response

// Sequence:
finish_item(req);
get_response(rsp); // blocks forever`,
    fix: `// Option A — remove response wait from sequence:
finish_item(req);
// no get_response()

// Option B — make driver return a response:
rsp = make_response(req, status, rdata);
seq_item_port.item_done(rsp);`,
    interview:
      "Sequence behavior must match the driver response contract. A response wait is only legal if the driver actually sends a response.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// DATA — Interview Q&A
// ─────────────────────────────────────────────────────────────────────────────

const module0InterviewQA = [
  {
    q: "Why do you need Module 0 before writing a UVM driver?",
    short:
      "Because driver correctness depends on object ownership, virtual-interface access, timing, reset, and sequencer completion semantics.",
    deep: "A driver sits between transaction-level intent and pin-level behavior. If you do not understand handles, sequence item identity, clocking blocks, reset interruption, and item_done() semantics, the driver may compile but still deadlock, race, corrupt requests, or misroute responses.",
    followup: "What fails first in weak drivers?",
    answer:
      "Usually: null virtual interface, missing driver/sequencer connection, premature item_done(), missing item_done(), reset hang, raw-edge race, missing set_id_info(req), or sequence waiting for a response the driver never sends.",
  },
  {
    q: "What is the difference between transaction and waveform?",
    short:
      "A transaction describes intent. A waveform is timed signal execution.",
    deep: "The item may contain write, addr, and wdata. It does not define when valid is asserted, how long address stays stable, when ready is sampled, or when cleanup occurs. The driver owns that mapping.",
    followup: "Should transactions contain delay fields?",
    answer:
      "Only if delay is a stimulus attribute. The driver still converts it into legal timing.",
  },
  {
    q: "Why is request mutation dangerous?",
    short: "Because the driver receives an object handle, not a deep copy.",
    deep: "Modifying req can mutate the sequence's original object. That can corrupt debug, response interpretation, and scoreboard correlation.",
    followup: "When is request mutation acceptable?",
    answer:
      "Only when the driver contract explicitly defines the request object as the response carrier.",
  },
  {
    q: "Why does a UVM driver need a virtual interface?",
    short: "Class-based UVM code needs a handle to static HDL pins.",
    deep: "The interface groups DUT signals and timing constructs. The virtual interface gives the driver controlled access to those signals.",
    followup: null,
    answer: null,
  },
  {
    q: "Why prefer clocking blocks?",
    short: "They encode drive/sample timing and reduce race ambiguity.",
    deep: "Raw @(posedge clk) code can drive in the same simulation region where the DUT samples. Clocking blocks make testbench timing intent explicit.",
    followup: null,
    answer: null,
  },
  {
    q: "What is the get_next_item() / item_done() contract?",
    short: "Every successful get_next_item() must be followed by item_done().",
    deep: "get_next_item() gives the driver ownership of a request. item_done() tells the sequencer that ownership has ended.",
    followup: "Where should item_done() be placed?",
    answer:
      "After safe completion — for a non-pipelined driver, this usually means after drive, handshake completion, response/error sampling, and cleanup.",
  },
  {
    q: "How is try_next_item() different?",
    short: "It may return null.",
    deep: "Null means no item was granted. The driver may drive idle behavior, but it must not call item_done().",
    followup: null,
    answer: null,
  },
  {
    q: "Why must get() not be followed by item_done()?",
    short: "Because get() uses a different sequencer-driver contract.",
    deep: "get_next_item() leaves an outstanding request requiring item_done(). get() does not use that same completion mechanism.",
    followup: null,
    answer: null,
  },
  {
    q: "When should a driver return a response?",
    short:
      "When the sequence needs returned data, status, error, or abort information.",
    deep: "Pure stimulus may need no response. Reads, adaptive sequences, error flows, and reset-abort-aware tests often need response objects. The sequence and driver must agree: if the sequence calls get_response(), the driver must actually send a response.",
    followup: null,
    answer: null,
  },
  {
    q: "Why does set_id_info(req) matter?",
    short: "It preserves response routing identity.",
    deep: "The sequencer must know which sequence/request the response belongs to. set_id_info(req) copies the required ID information from request to response.",
    followup: null,
    answer: null,
  },
  {
    q: "Should a driver raise objections?",
    short: "Usually no.",
    deep: "Drivers are service components that often run forever. Tests or sequences normally own phase objections. A driver-owned objection can easily hang simulation.",
    followup: null,
    answer: null,
  },
  {
    q: "What is the difference between item_done(rsp), put_response(rsp), and rsp_port.write(rsp)?",
    short:
      "item_done(rsp) completes the request and returns an immediate response. put_response(rsp) sends a separated response through the sequencer item port. rsp_port.write(rsp) is an alternate response path requiring explicit response-port wiring.",
    deep: "Use item_done(rsp) for simple non-pipelined drivers where response availability coincides with request completion. Use put_response(rsp) or rsp_port.write(rsp) when response return is decoupled from request completion. Do not send the same response through multiple paths.",
    followup: null,
    answer: null,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// DATA — Sections (sidebar TOC)
// ─────────────────────────────────────────────────────────────────────────────

const module0Sections = [
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
  { id: "arch-decisions", label: "Architectural Decision Points" },
  { id: "review", label: "Review Checklist" },
  { id: "interview", label: "Interview Q&A" },
  { id: "takeaways", label: "Key Takeaways" },
  { id: "exercise", label: "Coding Exercise" },
];

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

const Module0 = () => {
  return (
    <div className="relative min-h-screen bg-slate-950 text-white font-sans">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-150 h-62.5 bg-linear-to-r from-violet-600/15 to-indigo-600/15 blur-[100px] rounded-full" />

      <div className="relative z-10 flex max-w-7xl mx-auto">
        {/* ── Sidebar TOC (desktop) ────────────────────────────────────── */}
        <ModuleSidebar
          moduleNumber="0"
          title="SV/UVM Foundation Before Drivers"
          sections={module0Sections}
        />

        {/* ── Main Content ─────────────────────────────────────────────── */}
        <main className="flex-1 min-w-0 px-6 py-8 pb-24 max-w-4xl">
          {/* Mobile back */}
          <BackToHomeBtn to="/driver-mastery" />

          {/* ── Hero ─────────────────────────────────────────────────────── */}
          <ModuleHero
            moduleNumber="0"
            title="SV/UVM Foundation Before Drivers"
            description="Build the minimum SystemVerilog/UVM mental model required to write correct drivers — covering object ownership, virtual interfaces, timing contracts, sequencer handshakes, reset policy, and response routing."
            metadata={[
              ["Module", "0"],
              ["Reference", "UVM 1.2"],
              ["Level", "Beginner → Senior/Principal"],
              ["Pattern", "Foundation → Protocol Driver"],
            ]}
          />

          {/* ── §1 Learning Objectives ──────────────────────────────────── */}
          <section id="objectives">
            <SectionHeading num={1} title="Learning Objectives" />
            <ol className="space-y-2 list-decimal list-inside text-slate-300 text-sm leading-relaxed">
              {[
                "Explain why driver correctness starts before writing run_phase.",
                "Distinguish transaction intent from waveform execution.",
                "Explain how SystemVerilog object handles affect transaction ownership.",
                "Build a driver-suitable uvm_sequence_item.",
                "Distinguish uvm_object, uvm_component, uvm_sequence_item, and uvm_driver.",
                "Explain why drivers use virtual interfaces.",
                "Retrieve a virtual interface using uvm_config_db.",
                "Explain build/connect/run phase responsibilities in a driver context.",
                "Explain why driver timing must be explicit.",
                "Explain why clocking blocks reduce race ambiguity.",
                "Explain the basic sequence/sequencer/driver contract.",
                "Correctly separate get_next_item()/item_done(), try_next_item()/null handling, get()/no item_done(), no-response, immediate-response, and delayed-response driver behavior.",
                "Explain why set_id_info(req) matters for response routing.",
                "Define a reset-abort policy for a fetched item.",
                "Explain why drivers must not become monitors, scoreboards, or assertion engines.",
                "Identify common pre-driver bugs before they become protocol-driver bugs.",
              ].map((o, i) => (
                <li key={i} className="pl-2">
                  {o}
                </li>
              ))}
            </ol>
          </section>

          {/* ── §2 Scope & Non-Scope ────────────────────────────────────── */}
          <section id="scope">
            <SectionHeading num={2} title="Scope & Non-Scope" />
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-emerald-400 font-semibold mb-2">
                  In Scope
                </p>
                <ul className="space-y-1 text-slate-300 text-sm list-disc list-inside">
                  {[
                    "SV classes, objects, and handles (driver perspective)",
                    "Request/response transaction objects",
                    "uvm_object vs uvm_component",
                    "uvm_sequence_item",
                    "uvm_driver #(REQ, RSP)",
                    "Factory registration basics",
                    "Virtual interface access",
                    "uvm_config_db lookup",
                    "Minimal build/connect/run responsibilities",
                    "Clock/reset/timing awareness",
                    "Sequencer-driver handshake contracts",
                    "Basic response routing",
                    "Driver ownership boundary",
                    "Minimal structural UVM hookup",
                  ].map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-rose-400 font-semibold mb-2">
                  Out of Scope
                </p>
                <Table
                  headers={["Topic", "Module"]}
                  rows={[
                    ["APB driver implementation", "6 / 8"],
                    ["Ready/valid streaming driver", "9"],
                    ["AXI4-Lite", "10"],
                    ["Pipelined/multi-channel drivers", "11"],
                    ["Slave/reactive drivers", "12"],
                    ["Driver-monitor-scoreboard boundary", "13"],
                    ["Burst/packet/framing drivers", "14"],
                    ["Serial/open-drain/bidirectional", "15"],
                    ["Credit/retry/replay drivers", "16"],
                    ["Reset-abort/low-power deep handling", "17"],
                    ["RAL/DPI/emulation drivers", "18"],
                    ["Layered/coherent/security-aware", "19"],
                    ["Advanced driver architecture", "20"],
                  ]}
                />
              </div>
            </div>
            <Callout type="concept">
              Module 0 teaches vocabulary, contracts, and the failure model. It
              does not teach a production APB/AXI/streaming driver.
            </Callout>
          </section>

          {/* ── §3 Protocol Mental Model ────────────────────────────────── */}
          <section id="mental-model">
            <SectionHeading num={3} title="Protocol Mental Model" />
            <p className="text-slate-400 text-sm mb-4">
              A UVM driver is not "a class that gets sequence items." A correct
              driver is a{" "}
              <span className="text-violet-300 font-semibold">
                timed ownership machine
              </span>
              .
            </p>
            <CodeBlock lang="text">{`transaction intent
  -> pin-level execution
  -> protocol completion
  -> optional response
  -> sequencer contract closure`}</CodeBlock>
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-2">
                  Transaction Intent (Item)
                </p>
                <CodeBlock lang="systemverilog">{`write = 1;
addr  = 32'h0000_1000;
wdata = 32'hCAFE_BABE;`}</CodeBlock>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-2">
                  Waveform Execution (Driver)
                </p>
                <CodeBlock lang="text">{`cycle N:   place valid/address/data
cycle N+1: hold stable while waiting
cycle N+2: observe ready
cycle N+3: cleanup or move to next`}</CodeBlock>
              </div>
            </div>
            <Callout type="interview">
              <strong>Strong answer:</strong> "A UVM driver owns active
              pin-level execution of transaction intent. It must respect
              protocol timing, reset, completion, cleanup, and response
              semantics while avoiding functional checking that belongs in the
              monitor, scoreboard, or assertions."
            </Callout>
            <p className="text-slate-400 text-sm mt-4 mb-2">
              Before writing a driver, define:
            </p>
            <ol className="list-decimal list-inside text-slate-300 text-sm space-y-1">
              {[
                "Request fields",
                "Optional response fields",
                "Interface pins",
                "Clock/reset timing",
                "Handshake/completion condition",
                "Cleanup rule",
                "Sequencer completion rule",
                "Response rule, if any",
              ].map((item, i) => (
                <li key={i} className="pl-2">
                  {item}
                </li>
              ))}
            </ol>
          </section>

          {/* ── §4 Timing / Waveform Contract ───────────────────────────── */}
          <section id="timing">
            <SectionHeading num={4} title="Timing / Waveform Contract" />
            <p className="text-slate-400 text-sm mb-3">
              A driver must define when it drives, when it samples, and when the
              item is complete.
            </p>
            <CodeBlock lang="text">{`Before transfer:   interface is idle or reset-safe
At transfer start: driver places request signals at agreed timing event
During transfer:   driver holds required request signals stable
At completion:     driver samples protocol-required completion/response info
After completion:  driver cleans up or transitions to next legal transfer
Then:              driver closes the sequencer contract`}</CodeBlock>

            <CollapsibleCard
              title="Clocking Block (Preferred)"
              accent="emerald"
            >
              <CodeBlock lang="systemverilog">{`clocking drv_cb @(posedge clk);
  default input #1step output #0;
  output valid;
  output write;
  output addr;
  output wdata;
  input  ready;
  input  rdata;
  input  error;
  input  reset_n;
endclocking`}</CodeBlock>
              <Callout type="concept">
                Use <code>@(vif.drv_cb)</code> instead of raw{" "}
                <code>@(posedge clk)</code>. Clocking block output skew ensures
                the testbench drives after the DUT has already sampled the
                previous cycle.
              </Callout>
            </CollapsibleCard>

            <CollapsibleCard title="Raw Posedge — Race-Prone" accent="rose">
              <CodeBlock lang="systemverilog">{`@(posedge vif.clk);
vif.valid = 1'b1; // blocking — race with DUT sampler
vif.addr  = req.addr;`}</CodeBlock>
              <Callout type="trap">
                This is race-prone if DUT sampling and TB driving occur on the
                same edge without a defined scheduling contract. A timing bug
                here appears as a one-cycle waveform shift, stale response
                capture, or simulator-dependent pass/fail.
              </Callout>
            </CollapsibleCard>
          </section>

          {/* ── §5 Driver Responsibility Boundary ───────────────────────── */}
          <section id="boundary">
            <SectionHeading num={5} title="Driver Responsibility Boundary" />
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-emerald-400 font-semibold mb-2">
                  Driver Owns
                </p>
                <Table
                  headers={["Responsibility", "Reason"]}
                  rows={[
                    [
                      "Convert item intent into legal pin activity",
                      "Active stimulus role",
                    ],
                    ["Drive DUT inputs", "Driver is active BFM"],
                    [
                      "Observe ready/backpressure if required",
                      "Needed for legal completion",
                    ],
                    [
                      "Capture response/error if required",
                      "Needed for sequence response",
                    ],
                    ["Handle reset-safe driving", "Prevents corrupt stimulus"],
                    ["Cleanup after transfer", "Prevents signal leakage"],
                    ["Close sequencer contract", "Prevents sequence deadlock"],
                    ["Emit ownership logs", "Enables debug"],
                  ]}
                />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-rose-400 font-semibold mb-2">
                  Driver Does NOT Own
                </p>
                <Table
                  headers={["Responsibility", "Correct Owner"]}
                  rows={[
                    ["Passive reconstruction of all bus traffic", "Monitor"],
                    ["End-to-end expected vs actual checking", "Scoreboard"],
                    ["Temporal protocol legality checking", "Assertions"],
                    ["Functional coverage", "Monitor/Coverage Collector"],
                    ["Expected data calculation", "Reference Model/Scoreboard"],
                    [
                      "DUT output checking unrelated to completion",
                      "Monitor/Scoreboard",
                    ],
                  ]}
                />
              </div>
            </div>
            <Callout type="concept">
              A driver <em>may</em> check: virtual interface is configured,
              request handle is non-null, unsupported transaction mode is not
              requested, reset interrupted a transfer, or a local timeout if the
              protocol defines one. A driver must not become a hidden
              scoreboard.
            </Callout>
          </section>

          {/* ── §6 Sequence-Sequencer-Driver Contract ───────────────────── */}
          <section id="contract">
            <SectionHeading
              num={6}
              title="Sequence-Sequencer-Driver Contract"
            />
            <CodeBlock lang="text">{`Sequence:   creates and randomizes item
Sequencer:  arbitrates request
Driver:     fetches request
            executes pin-level behavior
            observes completion/response if required
            closes request
            optionally returns response`}</CodeBlock>

            <CollapsibleCard
              title="get_next_item() / item_done() — Blocking Pull"
              accent="violet"
            >
              <Callout type="concept">
                Every successful <code>get_next_item()</code> must be followed
                by exactly one <code>item_done()</code>.
              </Callout>
              <CodeBlock lang="systemverilog">{`seq_item_port.get_next_item(req);
drive_one_transfer(req);
seq_item_port.item_done();`}</CodeBlock>
            </CollapsibleCard>

            <CollapsibleCard
              title="try_next_item() — Non-Blocking with Null Guard"
              accent="amber"
            >
              <CodeBlock lang="systemverilog">{`seq_item_port.try_next_item(req);

if (req == null) begin
  drive_idle_cycle();
end
else begin
  drive_one_transfer(req);
  seq_item_port.item_done();
end`}</CodeBlock>
              <Callout type="trap">
                If <code>req == null</code>, the driver did not receive item
                ownership and must NOT call <code>item_done()</code>.
              </Callout>
            </CollapsibleCard>

            <CollapsibleCard
              title="get() — Different Contract, No item_done()"
              accent="blue"
            >
              <CodeBlock lang="systemverilog">{`seq_item_port.get(req);
drive_one_transfer(req);
// No item_done()`}</CodeBlock>
              <Callout type="trap">
                <strong>Never</strong> pair <code>get()</code> with{" "}
                <code>item_done()</code>. These are different sequencer-driver
                contracts.
              </Callout>
            </CollapsibleCard>

            <CollapsibleCard
              title="Immediate Response — item_done(rsp)"
              accent="emerald"
            >
              <p className="text-slate-400 text-sm mb-3">
                For non-pipelined drivers where response availability coincides
                with request completion.
              </p>
              <CodeBlock lang="systemverilog">{`rsp = make_response(req, status, sampled_rdata);
seq_item_port.item_done(rsp);`}</CodeBlock>
            </CollapsibleCard>

            <CollapsibleCard
              title="Delayed Response — item_done() + put_response(rsp)"
              accent="blue"
            >
              <p className="text-slate-400 text-sm mb-3">
                Use when response return is separated from request completion
                (pipelined/delayed).
              </p>
              <CodeBlock lang="systemverilog">{`seq_item_port.item_done();
// later, when response is available:
seq_item_port.put_response(rsp);`}</CodeBlock>
              <Callout type="trap">
                Do NOT return both <code>item_done(rsp)</code> and{" "}
                <code>put_response(rsp)</code> for the same item. Pick one
                contract and wire the environment for it.
              </Callout>
            </CollapsibleCard>

            <CollapsibleCard
              title="Alternate Response Port — rsp_port.write(rsp)"
              accent="violet"
            >
              <CodeBlock lang="systemverilog">{`seq_item_port.item_done();
// if rsp_port is connected appropriately:
rsp_port.write(rsp);`}</CodeBlock>
              <Callout type="concept">
                Use only when the environment connects <code>rsp_port</code> to
                the appropriate sequencer response export. Do not mix with{" "}
                <code>put_response()</code>.
              </Callout>
            </CollapsibleCard>
          </section>

          {/* ── §7 Reset / Abort Policy ─────────────────────────────────── */}
          <section id="reset">
            <SectionHeading num={7} title="Reset / Abort Policy" />
            <p className="text-slate-400 text-sm mb-3">
              Reset must be part of the driver contract, not an afterthought.
            </p>
            <Table
              headers={["Situation", "Required Driver Decision"]}
              rows={[
                ["Reset active before item fetch", "Wait and drive idle"],
                [
                  "Reset after fetch but before drive",
                  "Abort item or wait, depending on policy",
                ],
                [
                  "Reset during active transfer",
                  "Stop driving safely and close item contract",
                ],
                [
                  "Reset during response sampling",
                  "Return aborted/error response if response contract exists",
                ],
                ["Reset while idle", "Hold idle"],
                [
                  "Reset release",
                  "Wait for clean clocking event before traffic",
                ],
              ]}
            />
            <Callout type="interview">
              Reset does not erase the sequencer-driver contract. If the driver
              accepted an item, it must complete it, abort it with defined
              semantics, or terminate the phase cleanly.
            </Callout>
            <CollapsibleCard
              title="Module 0 Foundation Abort Policy"
              accent="rose"
            >
              <ol className="list-decimal list-inside text-slate-300 text-sm space-y-1">
                <li className="pl-2">
                  If reset is active before fetching, the driver waits.
                </li>
                <li className="pl-2">
                  If reset occurs after fetching, the driver aborts the physical
                  transfer.
                </li>
                <li className="pl-2">The driver returns TXN_ABORTED status.</li>
                <li className="pl-2">
                  The driver calls item_done(rsp) because it already accepted
                  the item.
                </li>
                <li className="pl-2">
                  The driver does not silently drop the item.
                </li>
                <li className="pl-2">
                  The driver does not retry automatically.
                </li>
              </ol>
              <Callout type="trap">
                Retry after reset is valid for some protocols but requires a
                replay buffer, stable request copy, scoreboard awareness, and
                duplicate-transfer prevention. That belongs to later modules.
              </Callout>
            </CollapsibleCard>
          </section>

          {/* ── §8 Response / Completion Policy ────────────────────────── */}
          <section id="response">
            <SectionHeading num={8} title="Response / Completion Policy" />

            <CollapsibleCard title="Response Strategy Table" accent="violet">
              <Table
                headers={[
                  "Strategy",
                  "Driver API",
                  "Sequence Behavior",
                  "Use Case",
                ]}
                rows={[
                  [
                    "No response",
                    "item_done()",
                    "Do not call get_response()",
                    "Pure stimulus",
                  ],
                  [
                    "Immediate response",
                    "item_done(rsp)",
                    "May call get_response(rsp)",
                    "Non-pipelined read/status",
                  ],
                  [
                    "Delayed response",
                    "item_done() then put_response(rsp)",
                    "May call get_response(rsp) later",
                    "Pipelined/delayed response",
                  ],
                  [
                    "Alternate response port",
                    "rsp_port.write(rsp)",
                    "Requires correct sequencer wiring",
                    "Driver response port architectures",
                  ],
                ]}
              />
            </CollapsibleCard>

            <CollapsibleCard title="Correct Response Routing" accent="emerald">
              <CodeBlock lang="systemverilog">{`rsp = foundation_item::type_id::create("rsp");
rsp.set_id_info(req); // always required for routing
rsp.rdata  = sampled_rdata;
rsp.status = status;
seq_item_port.put_response(rsp);`}</CodeBlock>
              <Callout type="interview">
                Response data is not enough. The response must be routable back
                to the originating sequence.
              </Callout>
            </CollapsibleCard>
          </section>

          {/* ── §9 Protocol Ownership Matrix ────────────────────────────── */}
          <section id="ownership-matrix">
            <SectionHeading num={9} title="Protocol Ownership Matrix" />
            <Table
              headers={["Layer", "Owns", "Does Not Own"]}
              rows={[
                [
                  "Sequence",
                  "Intent generation, constraints, scenario ordering",
                  "Pin timing",
                ],
                [
                  "Sequencer",
                  "Arbitration, request routing, response routing",
                  "Protocol execution",
                ],
                [
                  "Driver",
                  "Active pin-level execution, reset-safe drive, completion, local response capture",
                  "End-to-end checking",
                ],
                [
                  "Interface",
                  "Signal bundle, clocking block, optional modports",
                  "Verification policy",
                ],
                ["Monitor", "Passive sampling and reconstruction", "Driving"],
                ["Scoreboard", "Expected vs actual comparison", "Pin driving"],
                [
                  "Assertions",
                  "Temporal protocol legality",
                  "Scenario generation",
                ],
                ["Coverage", "Observation metrics", "Stimulus execution"],
              ]}
            />
          </section>

          {/* ── §10 Memory Cards ────────────────────────────────────────── */}
          <section id="memory">
            <SectionHeading num={10} title="Memory Cards" />
            {module0MemoryCards.map((card) => (
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
              title="Atlas Sheet 1 — SV/UVM Concepts Mapped to Driver Use"
              accent="blue"
              icon={<FaListAlt size={12} />}
            >
              <Table
                headers={[
                  "Concept",
                  "Driver-Relevant Meaning",
                  "Failure If Misunderstood",
                ]}
                rows={[
                  [
                    "Class",
                    "Encapsulates transaction/driver behavior",
                    "Procedural, non-reusable code",
                  ],
                  [
                    "Object handle",
                    "Reference to heap object",
                    "Accidental request mutation",
                  ],
                  [
                    "uvm_object",
                    "Factory-created data/config object",
                    "Poor override/copy/print behavior",
                  ],
                  [
                    "uvm_sequence_item",
                    "Request/response carrier",
                    "Broken sequencer-driver integration",
                  ],
                  [
                    "uvm_component",
                    "Hierarchical testbench element",
                    "Wrong constructor/phase usage",
                  ],
                  [
                    "uvm_driver",
                    "Active component connected to sequencer",
                    "Broken pull-port contract",
                  ],
                  [
                    "Virtual interface",
                    "Class handle to HDL pins",
                    "Driver cannot access DUT",
                  ],
                  ["uvm_config_db", "Resource/config passing", "Null vif"],
                  [
                    "Clocking block",
                    "Timing contract wrapper",
                    "Race-prone drive/sample",
                  ],
                  ["run_phase", "Active timed execution", "No traffic driven"],
                  [
                    "item_done()",
                    "Request completion",
                    "Sequence hang or premature release",
                  ],
                ]}
              />
            </CollapsibleCard>

            <CollapsibleCard
              title="Atlas Sheet 2 — Transaction Lifecycle"
              accent="violet"
              icon={<FaListAlt size={12} />}
            >
              <CodeBlock lang="text">{`Sequence
  creates item → randomizes item → start_item / finish_item
        |
        v
Sequencer
  arbitrates request → exposes request to driver
        |
        v
Driver
  get_next_item(req)
  drives pins
  waits for completion
  samples response if required
  cleans up
  item_done() or item_done(rsp)
        |
        v
Sequence
  continues or consumes response`}</CodeBlock>
              <CodeBlock lang="text">{`Sequence owns intent.
Sequencer owns arbitration.
Driver owns pin-level execution.
Monitor owns passive observation.
Scoreboard owns checking.
Assertions own temporal legality.`}</CodeBlock>
            </CollapsibleCard>

            <CollapsibleCard
              title="Atlas Sheet 3 — Boundary Ownership Map"
              accent="emerald"
              icon={<FaListAlt size={12} />}
            >
              <Table
                headers={[
                  "Question",
                  "Driver",
                  "Monitor",
                  "Scoreboard",
                  "Assertion",
                ]}
                rows={[
                  ["Who drives DUT inputs?", "Yes", "No", "No", "No"],
                  [
                    "Who waits for ready?",
                    "Yes, if required",
                    "Samples",
                    "No",
                    "May check",
                  ],
                  [
                    "Who captures read response for sequence?",
                    "Yes, if required",
                    "Also observes",
                    "No",
                    "No",
                  ],
                  [
                    "Who reconstructs all bus transfers?",
                    "No",
                    "Yes",
                    "No",
                    "No",
                  ],
                  [
                    "Who checks expected data?",
                    "No",
                    "No",
                    "Yes",
                    "Maybe local",
                  ],
                  [
                    "Who checks signal stability over time?",
                    "Minimal only",
                    "No",
                    "No",
                    "Yes",
                  ],
                  ["Who collects coverage?", "No", "Maybe", "Maybe", "No"],
                  [
                    "Who handles reset-safe stimulus?",
                    "Yes",
                    "Observes",
                    "Flushes model",
                    "Checks properties",
                  ],
                ]}
              />
            </CollapsibleCard>

            <CollapsibleCard
              title="Atlas Sheet 4 — Minimal UVM Structural Wiring"
              accent="blue"
              icon={<FaListAlt size={12} />}
            >
              <CodeBlock lang="text">{`top
  creates interface
  config_db::set(vif)
  run_test()

test
  creates env
  starts sequence

env
  creates sequencer
  creates driver
  connects driver port to sequencer export

sequence
  creates request item

sequencer
  arbitrates item

driver
  gets item
  drives interface
  returns completion/response`}</CodeBlock>
              <Table
                headers={["Missing Piece", "Typical Symptom"]}
                rows={[
                  ["config_db::set", "NOVIF fatal"],
                  [
                    "driver/sequencer connect",
                    "driver blocks forever at get_next_item()",
                  ],
                  ["sequence start", "no traffic"],
                  ["clock/reset", "driver stuck in reset wait"],
                  ["mock DUT response", "driver stuck waiting for completion"],
                  ["response ID", "sequence response wait hangs"],
                  [
                    "driver response promised but not returned",
                    "get_response() blocks",
                  ],
                ]}
              />
            </CollapsibleCard>
          </section>

          {/* ── §12 Code Labs ───────────────────────────────────────────── */}
          <section id="codelabs">
            <SectionHeading num={12} title="Code Labs" />

            <CollapsibleCard
              title="Code Lab 1 — Driver-Oriented Sequence Item"
              accent="emerald"
              icon={<FaFlask size={12} />}
            >
              <p className="text-slate-400 text-sm mb-3">
                A transaction object suitable for a future driver — with factory
                registration, constraints, and convert2string().
              </p>
              <CodeBlock lang="systemverilog">{`package foundation_item_pkg;

  import uvm_pkg::*;
  \`include "uvm_macros.svh"

  typedef enum bit [1:0] {
    TXN_OK,
    TXN_ERROR,
    TXN_ABORTED
  } foundation_status_e;

  class foundation_item extends uvm_sequence_item;

    rand bit        write;
    rand bit [31:0] addr;
    rand bit [31:0] wdata;
    rand int unsigned idle_cycles;

         bit [31:0] rdata;
         foundation_status_e status;

    constraint c_addr_aligned   { addr[1:0] == 2'b00; }
    constraint c_idle_cycles    { idle_cycles inside {[0:3]}; }

    \`uvm_object_utils_begin(foundation_item)
      \`uvm_field_int(write,       UVM_DEFAULT)
      \`uvm_field_int(addr,        UVM_DEFAULT | UVM_HEX)
      \`uvm_field_int(wdata,       UVM_DEFAULT | UVM_HEX)
      \`uvm_field_int(idle_cycles, UVM_DEFAULT | UVM_DEC)
      \`uvm_field_int(rdata,       UVM_DEFAULT | UVM_HEX)
      \`uvm_field_enum(foundation_status_e, status, UVM_DEFAULT)
    \`uvm_object_utils_end

    function new(string name = "foundation_item");
      super.new(name);
      status = TXN_OK;
    endfunction

    function string convert2string();
      return $sformatf(
        "write=%0b addr=0x%08h wdata=0x%08h rdata=0x%08h idle=%0d status=%s",
        write, addr, wdata, rdata, idle_cycles, status.name()
      );
    endfunction

  endclass

endpackage`}</CodeBlock>
            </CollapsibleCard>

            <CollapsibleCard
              title="Code Lab 2 — Interface and Driver Skeleton"
              accent="blue"
              icon={<FaFlask size={12} />}
            >
              <p className="text-slate-400 text-sm mb-3">
                The minimum static interface with clocking block and a UVM
                driver shell with config_db lookup.
              </p>
              <CodeBlock lang="systemverilog">{`interface foundation_bus_if(input logic clk);

  logic        reset_n;
  logic        valid;
  logic        write;
  logic [31:0] addr;
  logic [31:0] wdata;
  logic        ready;
  logic [31:0] rdata;
  logic        error;

  clocking drv_cb @(posedge clk);
    default input #1step output #0;
    output valid, write, addr, wdata;
    input  ready, rdata, error, reset_n;
  endclocking

endinterface


package foundation_driver_pkg;

  import uvm_pkg::*;
  \`include "uvm_macros.svh"
  import foundation_item_pkg::*;

  class foundation_driver extends uvm_driver #(foundation_item, foundation_item);

    \`uvm_component_utils(foundation_driver)

    virtual foundation_bus_if vif;

    function new(string name, uvm_component parent);
      super.new(name, parent);
    endfunction

    function void build_phase(uvm_phase phase);
      super.build_phase(phase);
      if (!uvm_config_db#(virtual foundation_bus_if)::get(this, "", "vif", vif))
        \`uvm_fatal("NOVIF", "foundation_driver requires virtual interface 'vif'")
    endfunction

  endclass

endpackage`}</CodeBlock>
              <Callout type="concept">
                Compile the interface before the driver package. A package/class
                declaring <code>virtual foundation_bus_if</code> requires the
                interface type to be visible at compile time.
              </Callout>
            </CollapsibleCard>

            <CollapsibleCard
              title="Code Lab 3 — Complete Non-Pipelined Driver"
              accent="violet"
              icon={<FaFlask size={12} />}
            >
              <p className="text-slate-400 text-sm mb-3">
                Full teaching driver: reset wait, request fetch, pin drive,
                completion wait, response creation, set_id_info(req),
                item_done(rsp), and cleanup.
              </p>
              <CodeBlock lang="systemverilog">{`task run_phase(uvm_phase phase);
  foundation_item     req;
  foundation_item     rsp;
  foundation_status_e status;
  bit [31:0]          sampled_rdata;

  drive_idle();

  forever begin
    wait_for_reset_release();

    seq_item_port.get_next_item(req);

    if (req == null)
      \`uvm_fatal("NULLREQ", "get_next_item returned null request")

    \`uvm_info("DRV_FETCH", req.convert2string(), UVM_MEDIUM)

    drive_one_transfer(req, status, sampled_rdata);

    rsp = make_response(req, status, sampled_rdata);

    \`uvm_info("DRV_DONE", rsp.convert2string(), UVM_MEDIUM)

    seq_item_port.item_done(rsp);
  end
endtask


task drive_one_transfer(
  foundation_item req,
  output foundation_status_e status,
  output bit [31:0] sampled_rdata
);
  sampled_rdata = '0;
  status        = TXN_OK;

  // Idle insertion
  repeat (req.idle_cycles) begin
    if (vif.drv_cb.reset_n !== 1'b1) begin
      status = TXN_ABORTED; drive_idle(); return;
    end
    drive_idle(); @(vif.drv_cb);
  end

  if (vif.drv_cb.reset_n !== 1'b1) begin
    status = TXN_ABORTED; drive_idle(); return;
  end

  // Drive request
  vif.drv_cb.valid <= 1'b1;
  vif.drv_cb.write <= req.write;
  vif.drv_cb.addr  <= req.addr;
  vif.drv_cb.wdata <= req.wdata;

  // Wait for completion
  do begin
    @(vif.drv_cb);
    if (vif.drv_cb.reset_n !== 1'b1) begin
      status = TXN_ABORTED;
      \`uvm_info("DRV_ABORT", $sformatf("reset during transfer addr=0x%08h", req.addr), UVM_MEDIUM)
      drive_idle(); return;
    end
  end while (vif.drv_cb.ready !== 1'b1);

  // Sample response
  sampled_rdata = vif.drv_cb.rdata;
  status = (vif.drv_cb.error === 1'b1) ? TXN_ERROR : TXN_OK;

  drive_idle(); // cleanup
endtask


function foundation_item make_response(
  foundation_item req,
  foundation_status_e status,
  bit [31:0] sampled_rdata
);
  foundation_item rsp;
  rsp = foundation_item::type_id::create("rsp");
  rsp.set_id_info(req); // routing identity
  rsp.write       = req.write;
  rsp.addr        = req.addr;
  rsp.wdata       = req.wdata;
  rsp.idle_cycles = req.idle_cycles;
  rsp.rdata       = sampled_rdata;
  rsp.status      = status;
  return rsp;
endfunction`}</CodeBlock>
            </CollapsibleCard>

            <CollapsibleCard
              title="Code Lab 4 — Minimal Sequencer / Env / Test / Top Hookup"
              accent="amber"
              icon={<FaFlask size={12} />}
            >
              <p className="text-slate-400 text-sm mb-3">
                Minimum structural UVM wiring for the driver to receive items.
                Compile order: item_pkg → bus_if → driver_pkg → env_pkg → top.
              </p>
              <CodeBlock lang="systemverilog">{`// foundation_env_pkg
class foundation_sequencer extends uvm_sequencer #(foundation_item, foundation_item);
  \`uvm_component_utils(foundation_sequencer)
  function new(string name, uvm_component parent); super.new(name, parent); endfunction
endclass

class foundation_env extends uvm_env;
  \`uvm_component_utils(foundation_env)
  foundation_driver    drv;
  foundation_sequencer sqr;
  function new(string name, uvm_component parent); super.new(name, parent); endfunction

  function void build_phase(uvm_phase phase);
    super.build_phase(phase);
    drv = foundation_driver::type_id::create("drv", this);
    sqr = foundation_sequencer::type_id::create("sqr", this);
  endfunction

  function void connect_phase(uvm_phase phase);
    super.connect_phase(phase);
    drv.seq_item_port.connect(sqr.seq_item_export); // critical
  endfunction
endclass


// Smoke sequence
class foundation_smoke_seq extends uvm_sequence #(foundation_item, foundation_item);
  \`uvm_object_utils(foundation_smoke_seq)
  task body();
    foundation_item req, rsp;
    req = foundation_item::type_id::create("req");
    start_item(req);
    if (!req.randomize() with { write==1'b1; addr==32'h0000_1000; wdata==32'hCAFE_BABE; })
      \`uvm_fatal("RANDFAIL", "randomization failed")
    finish_item(req);
    get_response(rsp); // valid because driver returns item_done(rsp)
    \`uvm_info("SEQ_RSP", rsp.convert2string(), UVM_MEDIUM)
  endtask
endclass


// Top module
module top;
  bit clk;
  always #5 clk = ~clk;

  foundation_bus_if bus_if(clk);

  initial begin
    bus_if.reset_n = 0; bus_if.ready = 0; bus_if.rdata = '0; bus_if.error = 0;
    repeat(3) @(posedge clk);
    bus_if.reset_n = 1;
    forever begin @(posedge clk); bus_if.ready <= 1; bus_if.rdata <= 32'h1234_5678; end
  end

  initial begin
    uvm_config_db#(virtual foundation_bus_if)::set(null, "uvm_test_top.env.drv", "vif", bus_if);
    run_test("foundation_test");
  end
endmodule`}</CodeBlock>
              <Callout type="trap">
                If <code>drv.seq_item_port.connect(sqr.seq_item_export)</code>{" "}
                is missing, the driver blocks forever at{" "}
                <code>get_next_item()</code>.
              </Callout>
            </CollapsibleCard>
          </section>

          {/* ── §13 Bug Gallery ─────────────────────────────────────────── */}
          <section id="bugs">
            <SectionHeading num={13} title="Bug Gallery" />
            {module0BugGallery.map((bug) => (
              <CollapsibleCard
                key={bug.title}
                title={bug.title}
                accent="rose"
                icon={<FaBug size={12} />}
              >
                <Callout type="trap">
                  <strong>Symptom:</strong> {bug.symptom}
                </Callout>
                <p className="text-xs text-slate-400 mb-2">
                  <strong>Waveform:</strong> {bug.waveform}
                </p>
                <p className="text-xs text-slate-400 mb-3">
                  <strong>Root Cause:</strong> {bug.cause}
                </p>
                <p className="text-xs uppercase tracking-widest text-rose-400 font-semibold mb-1">
                  Bad Code
                </p>
                <CodeBlock lang="systemverilog">{bug.bad}</CodeBlock>
                <p className="text-xs uppercase tracking-widest text-emerald-400 font-semibold mb-1 mt-3">
                  Fix
                </p>
                <CodeBlock lang="systemverilog">{bug.fix}</CodeBlock>
                <Callout type="interview">{bug.interview}</Callout>
              </CollapsibleCard>
            ))}
          </section>

          {/* ── §14 Race-Condition Checklist ────────────────────────────── */}
          <section id="race">
            <SectionHeading num={14} title="Race-Condition Checklist" />
            <Table
              headers={["Check", "Required"]}
              rows={[
                ["Drive timing defined?", "Yes"],
                ["Sampling timing defined?", "Yes"],
                ["Clocking block used or raw-edge justified?", "Yes"],
                ["DUT inputs driven through deterministic timing path?", "Yes"],
                [
                  "DUT outputs sampled only after protocol says they are valid?",
                  "Yes",
                ],
                ["Request fields stable while completion is pending?", "Yes"],
                ["Reset sampled consistently?", "Yes"],
                [
                  "Reset release requires clean clocking event before traffic?",
                  "Yes",
                ],
                ["Clocking-block outputs driven consistently?", "Yes"],
                [
                  "Raw blocking assignments avoided at DUT input boundary?",
                  "Yes",
                ],
                ["item_done() after completion, not after mere fetch?", "Yes"],
                [
                  "Response sampled before item completion when required?",
                  "Yes",
                ],
                ["Cleanup before release for non-pipelined operation?", "Yes"],
                [
                  "Driver avoids forever waits without reset/phase behavior?",
                  "Yes",
                ],
                [
                  "Ownership logs at fetch, start, wait, response, cleanup, abort, done?",
                  "Yes",
                ],
              ]}
            />
          </section>

          {/* ── §15 Debug / Log Strategy ────────────────────────────────── */}
          <section id="debug">
            <SectionHeading
              num={15}
              title="Debug Instrumentation / Log Strategy"
            />
            <p className="text-slate-400 text-sm mb-3">
              A driver log should answer: which item was fetched, when did
              driving start, which pins were driven, what completion condition
              was observed, was reset seen, was response created, was
              item_done() called, and did cleanup occur.
            </p>
            <CodeBlock lang="systemverilog">{`\`uvm_info("DRV_FETCH", req.convert2string(), UVM_MEDIUM)
\`uvm_info("DRV_START", $sformatf("addr=0x%08h write=%0b", req.addr, req.write), UVM_HIGH)
\`uvm_info("DRV_WAIT",  "waiting for ready", UVM_HIGH)
\`uvm_info("DRV_ABORT", "reset observed during active transfer", UVM_MEDIUM)
\`uvm_info("DRV_RSP",   rsp.convert2string(), UVM_MEDIUM)
\`uvm_info("DRV_DONE",  "item_done called", UVM_HIGH)`}</CodeBlock>
            <Callout type="trap">
              <strong>Bad logging:</strong>{" "}
              <code>`uvm_info("DRV", "done", UVM_LOW)</code> — does not identify
              item, state, completion, response, or ownership transition.
            </Callout>
            <Callout type="interview">
              Log ownership transitions, not just data values. Good driver logs
              expose where ownership got stuck.
            </Callout>
          </section>

          {/* ── §16 Architectural Decision Points ──────────────────────── */}
          <section id="arch-decisions">
            <SectionHeading num={16} title="Architectural Decision Points" />

            <CollapsibleCard
              title="Decision 1 — uvm_driver #(REQ) or #(REQ, RSP)?"
              accent="violet"
            >
              <Table
                headers={["Option", "Use When", "Risk"]}
                rows={[
                  [
                    "uvm_driver #(REQ)",
                    "Request and response type are same or no explicit response",
                    "Response intent can be unclear",
                  ],
                  [
                    "uvm_driver #(REQ, RSP)",
                    "Response behavior is part of contract",
                    "Slightly more explicit type plumbing",
                  ],
                ]}
              />
              <Callout type="concept">
                Module 0 uses{" "}
                <code>uvm_driver #(foundation_item, foundation_item)</code>{" "}
                because response semantics are taught explicitly.
              </Callout>
            </CollapsibleCard>

            <CollapsibleCard
              title="Decision 2 — Request-Only or Request/Response Driver?"
              accent="blue"
            >
              <Table
                headers={["Option", "Use When", "Cost"]}
                rows={[
                  [
                    "Request-only",
                    "Sequence does not need returned status/data",
                    "Sequence must not wait for response",
                  ],
                  [
                    "item_done(rsp)",
                    "Non-pipelined immediate response",
                    "Requires response object",
                  ],
                  [
                    "put_response(rsp)",
                    "Delayed/pipelined response",
                    "Requires routing discipline",
                  ],
                  [
                    "rsp_port.write(rsp)",
                    "Alternate response-port architecture",
                    "Requires explicit port connection",
                  ],
                ]}
              />
            </CollapsibleCard>

            <CollapsibleCard
              title="Decision 3 — Clocking Block or Raw Signal?"
              accent="amber"
            >
              <Table
                headers={["Option", "Use When", "Risk"]}
                rows={[
                  [
                    "Clocking block",
                    "Reusable UVM driver (recommended)",
                    "More interface setup",
                  ],
                  [
                    "Raw posedge",
                    "Small legacy/local TB with strict discipline",
                    "Race sensitivity",
                  ],
                  [
                    "Modport + clocking block",
                    "Larger VIP interface",
                    "More structure",
                  ],
                ]}
              />
            </CollapsibleCard>

            <CollapsibleCard
              title="Decision 4 — Mutate Request or Create Response?"
              accent="rose"
            >
              <Table
                headers={["Option", "Use When", "Risk"]}
                rows={[
                  [
                    "Mutate request",
                    "Contract explicitly allows it",
                    "Sequence-side corruption",
                  ],
                  [
                    "Create response (recommended)",
                    "Sequence needs observed status/data",
                    "More object management",
                  ],
                  ["No response", "Pure stimulus", "Sequence cannot react"],
                ]}
              />
            </CollapsibleCard>

            <CollapsibleCard
              title="Decision 5 — Reset Abort or Retry?"
              accent="violet"
            >
              <Table
                headers={["Option", "Meaning", "Risk"]}
                rows={[
                  [
                    "Abort and respond (Module 0 policy)",
                    "Clean simple policy",
                    "Sequence must handle abort",
                  ],
                  [
                    "Retry after reset",
                    "Replay same request",
                    "Needs replay policy",
                  ],
                  ["Drop silently", "Bad — avoid", "Lost item or hang"],
                  [
                    "Fatal on reset during item",
                    "Useful in restricted tests",
                    "Not reset-robust",
                  ],
                ]}
              />
            </CollapsibleCard>

            <CollapsibleCard
              title="Decision 6 — Who Owns Objections?"
              accent="blue"
            >
              <Table
                headers={["Option", "Use When", "Risk"]}
                rows={[
                  [
                    "Test owns objection (recommended)",
                    "Normal UVM structure",
                    "Clean",
                  ],
                  [
                    "Sequence owns objection",
                    "Sometimes acceptable",
                    "Sequence lifecycle coupling",
                  ],
                  [
                    "Driver owns objection",
                    "Rare — avoid",
                    "Easy simulation hang",
                  ],
                ]}
              />
            </CollapsibleCard>
          </section>

          {/* ── §17 Review Checklist ────────────────────────────────────── */}
          <section id="review">
            <SectionHeading num={17} title="Review Checklist" />

            {[
              {
                heading: "Structure",
                accent: "violet",
                items: [
                  "Driver extends uvm_driver #(REQ, RSP) when response behavior is explicit.",
                  "REQ and RSP extend uvm_sequence_item.",
                  "Factory macros are present.",
                  "Constructors are legal.",
                  "Virtual interface type is declared.",
                  "Interface type is compiled before packages/classes using virtual interface_type.",
                  "config_db lookup uses matching type and path.",
                  "Missing vif causes fatal.",
                  "Driver and sequencer are connected.",
                ],
              },
              {
                heading: "Timing",
                accent: "amber",
                items: [
                  "Driver timing is defined.",
                  "Clocking block or justified raw-edge policy exists.",
                  "Reset behavior is defined.",
                  "Completion condition is explicit.",
                  "Sampling point is explicit.",
                  "Cleanup rule is explicit.",
                ],
              },
              {
                heading: "Sequencer Contract",
                accent: "blue",
                items: [
                  "get_next_item() paired with item_done().",
                  "try_next_item() handles null.",
                  "get() not paired with item_done().",
                  "item_done(rsp) used only for immediate response.",
                  "put_response(rsp) used only for separated response.",
                  "rsp_port.write(rsp) used only if response port is connected.",
                  "set_id_info(req) used where routing matters.",
                  "Sequence calls get_response() only when driver promises a response.",
                ],
              },
              {
                heading: "Ownership",
                accent: "emerald",
                items: [
                  "Driver does not perform end-to-end checking.",
                  "Driver does not replace monitor.",
                  "Request mutation is avoided or justified.",
                  "Response object is used when sequence needs data/status.",
                  "Driver does not own phase objection without strong reason.",
                ],
              },
              {
                heading: "Debug",
                accent: "rose",
                items: [
                  "Logs show fetch.",
                  "Logs show drive start.",
                  "Logs show wait/completion.",
                  "Logs show reset abort.",
                  "Logs show response.",
                  "Logs show done.",
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

          {/* ── §18 Interview Q&A ────────────────────────────────────────── */}
          <section id="interview">
            <SectionHeading num={18} title="Interview Q&A" />
            {module0InterviewQA.map((qa) => (
              <CollapsibleCard
                key={qa.q}
                title={qa.q}
                accent="violet"
                icon={<FaQuestionCircle size={12} />}
              >
                <Callout type="hook">
                  <strong>Short:</strong> {qa.short}
                </Callout>
                <Callout type="concept">
                  <strong>Deep:</strong> {qa.deep}
                </Callout>
                {qa.followup && (
                  <div className="mt-3 text-sm text-slate-300">
                    <p className="font-semibold">Follow-up: {qa.followup}</p>
                    <p className="mt-1 text-slate-400">{qa.answer}</p>
                  </div>
                )}
              </CollapsibleCard>
            ))}
          </section>

          {/* ── §19 Key Takeaways ────────────────────────────────────────── */}
          <section id="takeaways">
            <SectionHeading num={19} title="Key Takeaways" />
            <ol className="space-y-2 list-decimal list-inside text-slate-300 text-sm">
              {[
                "A transaction is intent; the driver creates waveform behavior.",
                "SV handles make transaction ownership important — treat req as read-mostly.",
                "uvm_sequence_item is the correct basis for sequencer-driven stimulus.",
                "uvm_driver #(REQ, RSP) makes request/response intent explicit.",
                "A virtual interface is mandatory for class-based pin access.",
                "The interface type must be visible before a driver package declares virtual interface_type.",
                "config_db path/type mistakes cause null-interface failures — fatal early.",
                "Driver and sequencer must be connected in connect_phase.",
                "Clocking blocks reduce race ambiguity at the driver/DUT boundary.",
                "get_next_item() must be paired with item_done() — fetch creates debt.",
                "try_next_item() requires null handling — null means no ownership.",
                "get() must not be paired with item_done().",
                "item_done(rsp) is immediate response completion.",
                "put_response(rsp) is for separated response paths.",
                "rsp_port.write(rsp) is an alternate response path requiring explicit wiring.",
                "Responses need set_id_info(req) when routing matters.",
                "A sequence must not call get_response() unless the driver sends a response.",
                "Reset during a fetched item must close or abort the driver contract safely.",
                "Drivers must not become scoreboards.",
                "Drivers usually should not own phase objections.",
                "Debug logs should expose ownership transitions, not just data values.",
              ].map((t, i) => (
                <li key={i} className="pl-2">
                  {t}
                </li>
              ))}
            </ol>

            {/* Final Recall Card */}
            <div className="mt-8 rounded-2xl bg-linear-to-br from-violet-600/10 to-indigo-600/10 border border-violet-500/20 p-6">
              <p className="text-xs uppercase tracking-widest text-violet-400 font-semibold mb-3">
                Final Recall Card
              </p>
              <p className="text-slate-200 text-sm leading-relaxed italic mb-4">
                "Driver quality is decided before the first protocol-specific
                line is written."
              </p>
              <CodeBlock lang="systemverilog">{`task run_phase(uvm_phase phase);
  forever begin
    wait_for_reset_release();
    seq_item_port.get_next_item(req);
    drive_one_transfer(req, status, rdata);
    rsp = make_response(req, status, rdata);
    seq_item_port.item_done(rsp);
  end
endtask`}</CodeBlock>
              <p className="text-slate-300 text-sm leading-relaxed italic mt-4">
                "A correct driver is built around ownership: sequence owns
                intent, sequencer owns arbitration, driver owns pin-level
                execution, monitor owns passive observation, scoreboard owns
                checking, and assertions own temporal legality."
              </p>
            </div>
          </section>

          {/* ── §20 Coding Exercise ─────────────────────────────────────── */}
          <section id="exercise">
            <SectionHeading num={20} title="Coding Exercise" />
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
              <p className="text-slate-200 text-sm font-semibold mb-2">
                Exercise — Add Reset-Aware Abort Logging and Timeout Policy
              </p>
              <p className="text-slate-400 text-sm mb-4">
                Modify Code Lab 3 so the driver reports a timeout if{" "}
                <code className="text-violet-300">ready</code> does not assert
                within <code className="text-violet-300">max_wait_cycles</code>.
              </p>
              <ol className="list-decimal list-inside text-slate-300 text-sm space-y-1 mb-4">
                <li className="pl-2">
                  Add a localparam or configurable integer{" "}
                  <code>max_wait_cycles</code>.
                </li>
                <li className="pl-2">
                  Count clocking-block cycles while waiting for ready.
                </li>
                <li className="pl-2">
                  On timeout: drive idle, set status to TXN_ERROR, create a
                  response, preserve rsp.set_id_info(req), call item_done(rsp).
                </li>
                <li className="pl-2">Do not add scoreboard-style checking.</li>
                <li className="pl-2">Do not mutate req.status.</li>
                <li className="pl-2">Keep code simulator-portable.</li>
                <li className="pl-2">Use UVM_MEDIUM for timeout logs.</li>
              </ol>
              <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-2">
                Expected Pattern
              </p>
              <CodeBlock lang="systemverilog">{`wait_count = 0;

do begin
  @(vif.drv_cb);
  wait_count++;

  if (wait_count > max_wait_cycles) begin
    status = TXN_ERROR;
    \`uvm_info("DRV_TIMEOUT", "ready timeout", UVM_MEDIUM)
    drive_idle();
    return;
  end
end
while (vif.drv_cb.ready !== 1'b1);`}</CodeBlock>
            </div>
          </section>

          {/* Navigation to next module */}
          <ModuleNavigation
            nextPath="/driver-mastery/module1"
            nextTitle="Module 1: APB Driver Foundation →"
          />
        </main>
      </div>
    </div>
  );
};

export default Module0;
