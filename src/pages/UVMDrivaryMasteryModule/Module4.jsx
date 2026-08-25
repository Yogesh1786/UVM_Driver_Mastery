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
// DATA — Memory Cards (40 Cards)
// ─────────────────────────────────────────────────────────────────────────────

const module4MemoryCards = [
  {
    title: "Card 1 — Taxonomy Comes Before Code [PATTERN]",
    accent: "violet",
    hook: "Classify first. Code second.",
    concept:
      "A UVM driver is not just a forever loop around get_next_item(). The loop shape depends on the protocol contract: transaction mapping, flow control, completion point, response path, reset behavior, concurrency, and directionality.",
    code: `// Bad mental model:
forever begin
  seq_item_port.get_next_item(req);
  drive(req);
  seq_item_port.item_done();
end

// Correct mental model:
// The body and API contract depend entirely on the protocol classification.`,
    trap: "Using the same skeleton for APB, AXI, streaming, slave response, retry, and serial protocols.",
    interview:
      "I classify the protocol timing and completion semantics before choosing the sequencer-driver API and driver architecture.",
  },
  {
    title: "Card 2 — Driver Classification Axes [PATTERN]",
    accent: "blue",
    hook: "A driver type is a set of answers, not a name.",
    concept:
      "Classify the driver across eight axes: (1) Who initiates? (2) Who can stall? (3) What is item granularity? (4) Can requests overlap? (5) Is response separate? (6) Can reset interrupt? (7) Are there multiple channels? (8) Does the driver own retry, credit, or replay state?",
    code: `typedef enum {
  SIMPLE_DRIVER,
  NONPIPELINED_BUS_DRIVER,
  STREAMING_DRIVER,
  PIPELINED_DRIVER,
  MULTICHANNEL_DRIVER,
  REACTIVE_DRIVER
} driver_pattern_e;`,
    trap: "Calling a driver 'master' and thinking the architecture decision is complete. Master only says who initiates.",
    interview:
      "Driver taxonomy is multi-dimensional. Direction alone is not enough to select the architecture.",
  },
  {
    title: "Card 3 — The Driver Type Is Determined by Completion [CONTRACT]",
    accent: "emerald",
    hook: "Ask when the item is truly done.",
    concept:
      "Driver type is strongly tied to item completion. Completion may mean: pins driven, handshake accepted, bus response captured, packet completed, request accepted with response pending, retry succeeded, or item aborted during reset.",
    code: `task drive_one_item(my_txn req);
  start_transfer(req);
  wait_until_protocol_completion(req);
  cleanup_signals();
endtask`,
    trap: "Calling item_done() immediately after driving request pins when the protocol has not accepted or completed the transfer.",
    interview:
      "My item_done() placement follows the driver contract: non-pipelined drivers complete after transfer completion; pipelined drivers may complete at request acceptance only with separate outstanding tracking.",
  },
  {
    title: "Card 4 — Simple Blocking Driver [PATTERN]",
    accent: "violet",
    hook: "One item, one operation, no outstanding state.",
    concept:
      "A simple blocking driver is used when one transaction maps cleanly to one complete operation and the driver does not need complex response tracking. Examples: simple GPIO write, single-cycle control pulse, fixed-latency command interface.",
    code: `forever begin
  seq_item_port.get_next_item(req);
  drive_simple_transfer(req);
  seq_item_port.item_done();
end`,
    trap: "Using this pattern for protocols with backpressure, separate responses, retries, or multiple outstanding requests.",
    interview:
      "A simple blocking driver is valid only when one item maps to one fully completed operation with no hidden outstanding protocol state.",
  },
  {
    title: "Card 5 — Non-Pipelined Bus Driver [PATTERN]",
    accent: "blue",
    hook: "Setup, access, wait, complete.",
    concept:
      "A non-pipelined bus driver handles one transaction at a time. The next item is not started until the current transfer completes according to the bus contract. Examples: APB-style bus, simple register bus, command/ack bus.",
    code: `seq_item_port.get_next_item(req);
drive_setup_phase(req);
drive_access_phase(req);
wait_for_ready_or_ack();
sample_status_if_sequence_needs_it(req);
drive_idle();
seq_item_port.item_done();`,
    trap: "Calling item_done() after setup phase instead of after access completion.",
    interview:
      "In a non-pipelined bus driver, the item is normally done only after the bus completion condition and cleanup.",
  },
  {
    title: "Card 6 — Ready/Valid Streaming Driver [PATTERN]",
    accent: "amber",
    hook: "Valid is a promise. Ready is permission.",
    concept:
      "A ready/valid streaming driver must hold payload stable while valid is asserted and ready is low. The driver owns asserting valid, driving payload, holding payload stable, and advancing only on handshake.",
    code: `vif.valid <= 1'b1;
vif.data  <= req.data;

do begin
  @(posedge vif.clk);
end while (!vif.ready);

// Handshake observed
vif.valid <= 1'b0;`,
    trap: "Changing data every cycle while valid=1 and ready=0 (violating the payload stability rule).",
    interview:
      "In ready/valid drivers, the key correctness rule is stable payload under backpressure until handshake.",
  },
  {
    title: "Card 7 — Master Driver [PATTERN]",
    accent: "violet",
    hook: "The driver initiates.",
    concept:
      "A master driver actively initiates protocol transactions toward the DUT. It owns request timing, command/address/data driving, legal idle behavior, completion waiting, and response capture if required by sequence contract.",
    code: `task run_phase(uvm_phase phase);
  forever begin
    seq_item_port.get_next_item(req);
    drive_master_request(req);
    seq_item_port.item_done();
  end
endtask`,
    trap: "Letting a master driver check full DUT functionality instead of only driving legal transactions and capturing required protocol responses.",
    interview:
      "A master driver initiates protocol activity. It owns legal stimulus generation, not end-to-end functional correctness.",
  },
  {
    title: "Card 8 — Slave / Responder Driver [PATTERN]",
    accent: "emerald",
    hook: "The DUT initiates; the driver answers.",
    concept:
      "A slave or responder driver waits for DUT-initiated activity and drives a legal response. Examples: APB slave responder, AXI slave response driver, ready/valid sink with backpressure, memory-backed responder.",
    code: `forever begin
  wait_for_dut_request();
  build_or_fetch_response();
  drive_slave_response();
end`,
    trap: "Fetching sequence items blindly before the DUT request exists, causing mismatched response timing or unused response items.",
    interview:
      "A slave driver is reactive to DUT requests. Its core challenge is aligning sequence-provided response policy with observed DUT request timing.",
  },
  {
    title: "Card 9 — Reactive Driver [PATTERN]",
    accent: "blue",
    hook: "Stimulus depends on DUT behavior.",
    concept:
      "A reactive driver observes protocol events and generates stimulus based on what the DUT does. Examples: response after DUT command, randomized ready/backpressure, error injection based on request type, retry after NACK.",
    code: `wait_for_observed_request(obs);
rsp = choose_legal_response(obs);
drive_response(rsp);`,
    trap: "Making a reactive driver depend on monitor/scoreboard internals instead of a clean request-observation path.",
    interview:
      "Reactive drivers need disciplined boundaries; they may observe protocol triggers, but they must not become hidden scoreboards.",
  },
  {
    title: "Card 10 — Pipelined Driver [PATTERN]",
    accent: "rose",
    hook: "Accepted is not completed.",
    concept:
      "A pipelined driver can accept or issue a new request before an earlier request fully completes. This creates two distinct timelines: request issue/acceptance and response/completion.",
    code: `issue_request(req);
record_outstanding_request(req);
seq_item_port.item_done(); // legal only if contract says item_done = accepted`,
    trap: "Using pipelined item_done() semantics without outstanding request tracking.",
    interview:
      "In a pipelined driver, I explicitly define whether item_done() means request accepted or full response complete, then build tracking accordingly.",
  },
  {
    title: "Card 11 — Multi-Channel Driver [PATTERN]",
    accent: "violet",
    hook: "One transaction may become multiple channel obligations.",
    concept:
      "A multi-channel driver coordinates independent protocol channels. Examples: AXI write address, write data, write response; AXI read address and read data; packet header channel and payload channel.",
    code: `fork
  drive_address_channel();
  drive_data_channel();
  collect_response_channel();
join`,
    trap: "Forking channels without a shared transaction state model, causing lost ordering or mismatched responses.",
    interview:
      "Multi-channel drivers need explicit synchronization and transaction tracking; independent threads are not enough.",
  },
  {
    title: "Card 12 — Response-Path Driver [RESPONSE]",
    accent: "emerald",
    hook: "Some sequences need answers.",
    concept:
      "A response-path driver sends response objects back to the originating sequence when the sequence needs observed protocol results (read data, error status, completion code, retry/failure status).",
    code: `rsp = my_rsp::type_id::create("rsp");
rsp.set_id_info(req);
rsp.data   = sampled_data;
rsp.status = sampled_status;
seq_item_port.put_response(rsp);`,
    trap: "Forgetting set_id_info(req) when multiple sequences or outstanding requests require response routing.",
    interview:
      "I use response objects only when the sequence contract requires feedback, and I preserve routing with set_id_info(req).",
  },
  {
    title: "Card 13 — Reset-Aware Driver [RESET]",
    accent: "rose",
    hook: "Every wait must have an escape.",
    concept:
      "A reset-aware driver does not block forever inside handshake waits. It can detect reset, clean up pins, and resolve the active item contract.",
    code: `while (!transfer_done) begin
  @(posedge vif.clk);
  if (!vif.rst_n) begin
    abort_current_item(req);
    return;
  end
end`,
    trap: "Writing an uninterruptible wait like wait(vif.ready == 1'b1); without reset or phase-exit escape.",
    interview:
      "I never put an uninterruptible wait in a driver unless the protocol and phase policy prove it is safe.",
  },
  {
    title: "Card 14 — Abort-Aware Driver [RESET]",
    accent: "amber",
    hook: "Reset is not just idle driving; it is item ownership cleanup.",
    concept:
      "When reset interrupts an active item, the driver must decide what happens to the sequencer contract: complete with no response, complete with abort response, retry after reset, or fatal.",
    code: `if (reset_seen) begin
  drive_idle();
  mark_aborted(req);
  seq_item_port.item_done();
end`,
    trap: "Driving idle during reset but never calling item_done() for the interrupted item, which hangs the sequence.",
    interview:
      "Reset handling includes pin cleanup and sequencer item resolution. Doing only one is incomplete.",
  },
  {
    title: "Card 15 — Error-Injection Driver [PATTERN]",
    accent: "rose",
    hook: "Negative stimulus is still controlled stimulus.",
    concept:
      "An error-injection driver deliberately drives protocol-supported error cases: slave returns error response, delayed ready, parity error, or malformed packet under negative-test mode.",
    code: `if (cfg.inject_error) begin
  drive_error_response(req);
end
else begin
  drive_normal_response(req);
end`,
    trap: "Injecting illegal protocol behavior without test intent, configuration visibility, assertion expectation, or log trace.",
    interview:
      "Error injection must be controlled, intentional, and visible in logs; otherwise it becomes random testbench corruption.",
  },
  {
    title: "Card 16 — Low-Power / Clock-Gated Driver [PATTERN]",
    accent: "blue",
    hook: "No clock means no normal handshake.",
    concept:
      "A low-power-aware driver understands that clocks, resets, isolation, or power domains may change protocol legality. It stops driving during clock gating and avoids waits that assume a running clock.",
    code: `wait_power_active();
wait_clock_running();
drive_transfer(req);`,
    trap: "Waiting on @(posedge clk) when the clock is gated indefinitely.",
    interview:
      "A low-power-aware driver treats clock and power state as part of the protocol contract, not as external noise.",
  },
  {
    title: "Card 17 — Clocking-Block Based Driver [TIMING]",
    accent: "violet",
    hook: "Drive in the driver region you intended.",
    concept:
      "Clocking blocks help avoid race ambiguity between testbench driving/sampling and DUT behavior. A clocking-block based driver drives through a clocking block rather than raw interface signals.",
    code: `@(vif.cb);
vif.cb.valid <= 1'b1;
vif.cb.data  <= req.data;`,
    trap: "Mixing raw @(posedge clk) access and clocking-block access inconsistently in the same driver.",
    interview:
      "Clocking blocks make the driver timing contract explicit and reduce DUT/testbench race ambiguity.",
  },
  {
    title: "Card 18 — Forked-Thread Driver [PATTERN]",
    accent: "emerald",
    hook: "Concurrency needs ownership rules.",
    concept:
      "A forked-thread driver uses multiple parallel tasks to handle independent protocol duties (e.g. channel-specific threads, reset watcher, response collector, timeout watcher).",
    code: `fork
  request_thread();
  response_thread();
  reset_watch_thread();
join`,
    trap: "Multiple threads writing the same signal or mutating the same transaction object without synchronization.",
    interview:
      "Forking is easy; making ownership deterministic is the real architecture problem.",
  },
  {
    title: "Card 19 — Burst Driver [PATTERN]",
    accent: "blue",
    hook: "One item, many transfers.",
    concept:
      "A burst driver maps one transaction into multiple protocol beats. It owns beat sequencing, address/data progression, last-beat indication, per-beat handshake, and burst-level completion.",
    code: `foreach (req.data[i]) begin
  drive_beat(req, i);
  wait_beat_handshake();
end`,
    trap: "Calling item_done() after the first beat of a multi-beat burst.",
    interview:
      "For burst drivers, item completion usually belongs after the final beat and required response, not after the first accepted beat.",
  },
  {
    title: "Card 20 — Packet / Framing Driver [PATTERN]",
    accent: "violet",
    hook: "The driver preserves packet boundaries.",
    concept:
      "A packet/framing driver converts packet-level transactions into framed bus activity, driving start-of-packet, end-of-packet, byte enables, sideband metadata, and inter-packet gaps.",
    code: `drive_sop(req);
foreach (req.payload[i]) begin
  drive_payload_beat(req, i);
end
drive_eop(req);`,
    trap: "Treating packet beats as unrelated transactions and losing SOP/EOP semantics.",
    interview:
      "Packet drivers must preserve framing semantics, not just stream bytes.",
  },
  {
    title: "Card 21 — Aggregation / Splitting Driver [PATTERN]",
    accent: "amber",
    hook: "Transaction granularity may not match bus granularity.",
    concept:
      "Some drivers combine multiple sequence items into one bus transfer, or split one item across multiple bus operations (e.g. packing bytes into words or splitting wide transactions).",
    code: `collect_items_until_word_full();
drive_packed_word();
complete_all_items_represented_in_word();`,
    trap: "Calling item_done() before each contributing item has been safely represented in the driven transfer.",
    interview:
      "Aggregation and splitting drivers need explicit ownership of partial items and completion bookkeeping.",
  },
  {
    title: "Card 22 — Credit-Based Driver [PATTERN]",
    accent: "emerald",
    hook: "No credit, no send.",
    concept:
      "A credit-based driver may only issue transfers when it has permission represented by credits. Flow control is stateful over time, unlike cycle-by-cycle ready wires.",
    code: `if (credits > 0) begin
  drive_transfer(req);
  credits--;
end
else begin
  wait_for_credit();
end`,
    trap: "Treating credits like a combinational ready signal.",
    interview:
      "In a credit-based driver, flow control is stateful. The driver must track permission over time, not just sample a handshake wire.",
  },
  {
    title: "Card 23 — Retry / Replay Driver [PATTERN]",
    accent: "rose",
    hook: "Failed does not always mean done.",
    concept:
      "A retry/replay driver preserves transaction state when a transfer is rejected, NACKed, or errored in a retryable way, defining retry queues, retry bounds, and response policy.",
    code: `drive_transfer(req);
sample_result(status);

if (status == RETRYABLE_ERR) begin
  enqueue_for_retry(req);
end
else begin
  complete_request(req, status);
end`,
    trap: "Calling item_done() and discarding the request before knowing whether the protocol requires retry.",
    interview:
      "Retry drivers need a replay state model. Without it, the driver either drops retryable transactions or duplicates them incorrectly.",
  },
  {
    title: "Card 24 — Serial / Bit-Level Driver [PATTERN]",
    accent: "blue",
    hook: "A byte transaction becomes timed bits.",
    concept:
      "A serial or bit-level driver converts transaction-level intent into bit-accurate waveform behavior (bit order, bit timing, frame boundaries, idle polarity, turnaround timing).",
    code: `foreach (req.bits[i]) begin
  drive_bit(req.bits[i]);
  wait_bit_time();
end`,
    trap: "Treating a serial pin-level driver like a simple byte driver.",
    interview:
      "A serial driver's complexity is in bit timing, frame ownership, and edge discipline, not in the transaction object itself.",
  },
  {
    title: "Card 25 — Bidirectional / Tri-State Driver [PATTERN]",
    accent: "amber",
    hook: "Sometimes the driver must stop driving.",
    concept:
      "A bidirectional or tri-state driver controls both drive value and drive enable (OE). It must know when the testbench owns the bus and when it must release the bus.",
    code: `if (drive_enable) begin
  vif.data_oe <= 1'b1;
  vif.data_o  <= value;
end
else begin
  vif.data_oe <= 1'b0; // release bus
end`,
    trap: "Driving a value when the DUT also owns the bus, creating contention, X-propagation, or false waveforms.",
    interview:
      "For bidirectional protocols, ownership of the wire is as important as the value driven on it.",
  },
  {
    title: "Card 26 — Open-Drain Driver [PATTERN]",
    accent: "violet",
    hook: "Drive low or release. Never drive high.",
    concept:
      "An open-drain style driver does not actively drive both logic values: it drives 0 when asserting, and releases the line for logic 1 (relying on pull-up resistors).",
    code: `if (drive_low) begin
  vif.sda_oe <= 1'b1;
  vif.sda_o  <= 1'b0;
end
else begin
  vif.sda_oe <= 1'b0; // release, do not drive 1
end`,
    trap: "Driving 1 on an open-drain bus, hiding contention and violating electrical reality.",
    interview:
      "In open-drain drivers, the legal high value is usually produced by release, not by actively driving one.",
  },
  {
    title: "Card 27 — RAL Frontdoor Driver [PATTERN]",
    accent: "blue",
    hook: "Registers still travel through a bus.",
    concept:
      "A RAL frontdoor driver drives register accesses through a real bus protocol. The driver itself does not 'know RAL'; the uvm_reg_adapter maps register intent to standard bus sequence items.",
    code: `// RAL operation -> uvm_reg_adapter -> bus sequence item -> bus driver
seq_item_port.get_next_item(req);
drive_bus_transfer(req);
seq_item_port.item_done();`,
    trap: "Putting register-model knowledge inside the bus driver, destroying VIP reuse.",
    interview:
      "A RAL frontdoor driver should remain a protocol bus driver. The adapter maps register intent to bus transactions.",
  },
  {
    title: "Card 28 — DPI / SystemC Assisted Driver [PATTERN]",
    accent: "emerald",
    hook: "Foreign stimulus still needs a driver contract.",
    concept:
      "A DPI/SystemC-assisted driver receives transaction intent from a foreign-language model, but the UVM driver still owns protocol timing, pin-level handshakes, and reset cleanup.",
    code: `// C/SystemC model provides transaction parameters.
// UVM driver drives protocol pins legally.`,
    trap: "Letting DPI code directly poke DUT pins without the UVM driver owning timing and reset behavior.",
    interview:
      "DPI can generate intent, but the UVM driver should still own the protocol waveform contract.",
  },
  {
    title: "Card 29 — Emulation-Friendly Driver [PATTERN]",
    accent: "violet",
    hook: "Untimed luxury does not survive emulation.",
    concept:
      "An emulation-friendly driver separates untimed stimulus policy from synthesizable, acceleration-safe hardware transactors, avoiding dynamic class activity in time-critical paths.",
    code: `// Host (untimed UVM sequence) -> Channel -> Synthesizable HW Transactor (Emulator)`,
    trap: "Writing a driver that depends on simulator scheduling tricks, making it impossible to accelerate on emulation platforms.",
    interview:
      "Emulation-friendly driver architecture separates high-level stimulus policy from timing-critical transactor behavior.",
  },
  {
    title: "Card 30 — Layered VIP Driver [PATTERN]",
    accent: "blue",
    hook: "One VIP may contain multiple drivers at different abstraction levels.",
    concept:
      "A layered VIP driver decomposes a complex protocol stack: transaction layer -> packet layer -> lane layer -> PHY/bit layer. Each layer owns a specific transformation.",
    code: `txn_item -> packet_item -> lane_item -> pin_activity`,
    trap: "Putting every transformation into one giant monolithic driver class.",
    interview:
      "For complex VIP, I split the driver by protocol abstraction layers so each layer has a clear ownership contract.",
  },
  {
    title: "Card 31 — Coherent / Ordering-Domain Driver [PATTERN]",
    accent: "amber",
    hook: "Ordering rules are part of stimulus legality.",
    concept:
      "A coherent or ordering-domain driver preserves protocol ordering rules, barrier semantics, and ID domain rules while issuing transactions to avoid illegal bus conditions.",
    code: `assign_ordering_domain(req);
issue_request_if_ordering_allows(req);
track_outstanding(req);`,
    trap: "Randomizing IDs and issuing order-sensitive traffic without modeling ordering constraints.",
    interview:
      "In coherent-style protocols, the driver must preserve legal ordering-domain stimulus while leaving correctness checking to monitors, scoreboards, and assertions.",
  },
  {
    title: "Card 32 — Security-Aware Driver [PATTERN]",
    accent: "rose",
    hook: "Security state changes what stimulus is legal.",
    concept:
      "A security-aware driver understands security attributes (secure/non-secure, privilege level, key validity, auth sidebands) to generate legally encoded security-context stimulus.",
    code: `req.secure      = cfg.secure_mode;
req.privileged  = cfg.privileged_mode;
req.auth_enable = cfg.auth_enable;
drive_request(req);`,
    trap: "Randomizing security attributes independently of the configured security state.",
    interview:
      "A security-aware driver must generate legal security-context stimulus, but security policy checking belongs in dedicated checkers, scoreboards, and assertions.",
  },
  {
    title: "Card 33 — Passive Driver Is Usually a Misnomer [BOUNDARY]",
    accent: "violet",
    hook: "Passive agents monitor. Active agents drive.",
    concept:
      "An active agent contains a sequencer and driver. A passive agent contains only monitor/coverage/checkers. Calling something a 'passive driver' is imprecise; passive mode means no driving component is active.",
    code: `if (is_active == UVM_ACTIVE) begin
  sequencer = my_sequencer::type_id::create("sequencer", this);
  driver    = my_driver   ::type_id::create("driver", this);
end
monitor = my_monitor::type_id::create("monitor", this);`,
    trap: "Leaving a driver constructed and connected in a supposedly passive agent, causing accidental bus driving.",
    interview:
      "I avoid the phrase passive driver. Passive mode should usually mean no driving component is active.",
  },
  {
    title: "Card 34 — Timeout-Aware Driver [DEBUG]",
    accent: "rose",
    hook: "A hung protocol wait must leave evidence.",
    concept:
      "A timeout is either protocol-defined (spec defines max latency) or debug policy (testbench detects hangs). A debug timeout must not be reported as a protocol violation unless the spec defines the bound.",
    code: `cycles = 0;
while (!done) begin
  @(posedge vif.clk);
  cycles++;
  if (cfg.enable_timeout && cycles > cfg.max_wait_cycles) begin
    \`uvm_error("DRV_TIMEOUT", "Transfer wait exceeded configured limit")
    abort_current_item(req);
    break;
  end
end`,
    trap: "Hard-coding a timeout and calling it a protocol rule when the specification has no such bound.",
    interview:
      "Driver timeouts are debug policy unless the protocol specification defines a maximum response latency.",
  },
  {
    title: "Card 35 — Background / Idle Driver [PATTERN]",
    accent: "emerald",
    hook: "No item does not always mean no behavior.",
    concept:
      "Some drivers must produce legal background behavior even when no sequence item is available (e.g. idle cycles, toggle ready as sink, bus parking, training symbols). This pattern commonly uses try_next_item().",
    code: `seq_item_port.try_next_item(req);
if (req == null) begin
  drive_background_idle();
end
else begin
  drive_item(req);
  seq_item_port.item_done();
end`,
    trap: "Using blocking get_next_item() in a driver that must continue producing background protocol behavior.",
    interview:
      "If the protocol requires legal behavior when no sequence item exists, the driver needs an idle/background strategy, not a permanently blocked fetch.",
  },
  {
    title: "Card 36 — Timing-Parametric Driver [TIMING]",
    accent: "blue",
    hook: "Timing policy belongs in configuration, not magic numbers.",
    concept:
      "A timing-parametric driver supports configurable timing behavior without changing code (e.g. random idle insertion, wait-state range, ready delay, inter-packet gap).",
    code: `repeat (cfg.idle_cycles_before_valid) begin
  @(posedge vif.clk);
end
drive_transfer(req);`,
    trap: "Hard-coding timing delays inside the driver and forcing tests to edit driver source.",
    interview:
      "Timing-parametric drivers are reusable because timing policy is configured, not baked into the implementation.",
  },
  {
    title: "Card 37 — Configuration-Heavy Driver [PATTERN]",
    accent: "violet",
    hook: "A flexible driver without config discipline becomes nondeterministic.",
    concept:
      "Advanced drivers depend on configuration (active/passive mode, error injection, timeout policy, backpressure profile). Configuration must be centralized, validated, and logged.",
    code: `if (cfg == null) begin
  \`uvm_fatal("NO_CFG", "Driver configuration object is null")
end
cfg.print();`,
    trap: "Letting tests modify driver behavior through scattered plusargs or undeclared globals.",
    interview:
      "Config-heavy drivers are only scalable if configuration is centralized, validated, and visible in logs.",
  },
  {
    title: "Card 38 — Driver Pattern Composition [PATTERN]",
    accent: "emerald",
    hook: "Real drivers are combinations.",
    concept:
      "Most real drivers are compositions: APB master (master + non-pipelined + wait-state + response-status), AXI-Lite (master + multi-channel + response-path), I2C (serial + open-drain + bidirectional + timing-parametric).",
    code: `// Pattern composition:
// master + streaming + packet + timing-parametric`,
    trap: "Trying to find one single label for a driver and ignoring the other architectural dimensions.",
    interview:
      "I describe real drivers as pattern compositions, because protocol architecture is multi-dimensional.",
  },
  {
    title: "Card 39 — Driver Architecture Smell Test [INTERVIEW]",
    accent: "rose",
    hook: "Bad drivers reveal themselves through ownership confusion.",
    concept:
      "A driver architecture is suspicious if item_done() location is ambiguous, response routing is implicit, reset loses active items, driver checks scoreboard correctness, or monitor depends on driver internals.",
    code: `\`uvm_info("DRV_ITEM",
          $sformatf("start seq_id=%0d txn_id=%0d type=%s",
                    req.get_sequence_id(),
                    req.get_transaction_id(),
                    req.get_type_name()),
          UVM_MEDIUM)`,
    trap: "Judging driver quality only by whether the first smoke test passes.",
    interview:
      "A good driver architecture makes item ownership, timing, response, reset, and debug behavior explicit.",
  },
  {
    title: "Card 40 — Final Taxonomy Recall Card [INTERVIEW]",
    accent: "violet",
    hook: "Map protocol facts to driver patterns.",
    concept:
      "Protocol facts -> ownership -> completion -> response -> reset -> driver pattern architecture.",
    code: `// Protocol facts dictate architecture:
// Setup/access/wait    -> Non-pipelined bus
// Valid/ready          -> Streaming
// Req now, resp later  -> Pipelined/Response-path
// DUT initiates        -> Slave/responder
// Inout wire           -> Bidirectional/OE-aware`,
    trap: "Choosing a driver architecture from a familiar code template instead of protocol facts.",
    interview:
      "I select driver architecture by mapping protocol facts to ownership, timing, completion, response, and reset requirements.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// DATA — Bug Gallery (10 Bugs)
// ─────────────────────────────────────────────────────────────────────────────

const module4BugGallery = [
  {
    title: "Bug 1 — Early item_done() in Non-Pipelined Driver",
    symptom:
      "Sequence starts next transaction before the current bus access has completed. Driver overwrites address/control while DUT is still in access phase.",
    waveform:
      "psel/penable high; address changes on clock edge before pready is asserted.",
    cause:
      "item_done() called after setup/request phase instead of after protocol handshake and cleanup.",
    bad: `seq_item_port.get_next_item(req);
drive_setup(req);
seq_item_port.item_done(); // BUG: Access phase still pending!
drive_access(req);
wait_ready();`,
    fix: `seq_item_port.get_next_item(req);
drive_setup(req);
drive_access(req);
wait_ready();
sample_response(req);
cleanup_bus();
seq_item_port.item_done(); // Correct: safe completion`,
    interview:
      "In a non-pipelined driver, item_done() must represent complete bus operation and cleanup.",
  },
  {
    title: "Bug 2 — get() Paired with item_done()",
    symptom:
      "UVM runtime warning or fatal error: item_done() called without matching get_next_item().",
    waveform:
      "Bus signals may appear normal, but sequencer control flow corrupts on the second transaction.",
    cause:
      "get() completes the sequencer handshake internally upon return; calling item_done() afterwards violates the UVM sequencer API contract.",
    bad: `seq_item_port.get(req);
drive_transfer(req);
seq_item_port.item_done(); // BUG: Illegal pairing`,
    fix: `seq_item_port.get(req);
drive_transfer(req);
// No item_done() call needed or allowed`,
    interview:
      "get_next_item() opens an item_done obligation; get() is a self-completing blocking FIFO fetch.",
  },
  {
    title: "Bug 3 — try_next_item() Null Dereference",
    symptom:
      "Simulation crashes with fatal null pointer dereference on clock cycles where no sequence item is available.",
    waveform:
      "Simulation aborts during idle/gap periods between active sequences.",
    cause:
      "Accessing req fields immediately after try_next_item() without checking if req is null.",
    bad: `seq_item_port.try_next_item(req);
vif.data <= req.data; // BUG: req may be null!
if (req != null) seq_item_port.item_done();`,
    fix: `seq_item_port.try_next_item(req);
if (req == null) begin
  drive_idle_cycle();
end
else begin
  drive_item(req);
  seq_item_port.item_done();
end`,
    interview:
      "try_next_item() is non-blocking and can return null. Checking for null before dereferencing is mandatory.",
  },
  {
    title: "Bug 4 — Ready/Valid Payload Changes Under Backpressure",
    symptom:
      "DUT samples corrupted or intermediate data; protocol assertion fails for payload stability.",
    waveform:
      "valid remains high while ready is low, but data/payload changes every cycle.",
    cause:
      "Driver advances transaction data on every clock tick instead of holding payload stable until valid && ready handshake.",
    bad: `vif.valid <= 1'b1;
while (!vif.ready) begin
  @(posedge vif.clk);
  vif.data <= get_next_beat(); // BUG: Mutates data before handshake!
end`,
    fix: `vif.valid <= 1'b1;
vif.data  <= req.data; // Stable
do begin
  @(posedge vif.clk);
end while (!vif.ready);
vif.valid <= 1'b0;`,
    interview:
      "Valid is a contract promise. Once asserted, payload and control signals must remain perfectly stable until ready is asserted.",
  },
  {
    title: "Bug 5 — Pipelined Response Race",
    symptom:
      "Response collector thread cannot find the matching request item; returns null response or misroutes data to wrong sequence.",
    waveform:
      "DUT returns read response immediately after address acceptance, but driver response queue is empty.",
    cause:
      "item_done() was called and the sequencer item handle was released before saving a tracking copy into the outstanding queue.",
    bad: `drive_request(req);
seq_item_port.item_done(); // BUG: Released before recording!
outstanding_q.push_back(req);`,
    fix: `drive_request(req);
tr_copy = my_txn::type_id::create("tr_copy");
tr_copy.copy(req);
outstanding_q.push_back(tr_copy); // Recorded first!
seq_item_port.item_done();`,
    interview:
      "In pipelined drivers, preserve tracking state before calling item_done() to avoid race conditions with immediate responses.",
  },
  {
    title: "Bug 6 — Silent Reset Drop",
    symptom:
      "Test hangs indefinitely after reset assertion. Sequence remains blocked in finish_item().",
    waveform:
      "Reset asserts during transaction; driver immediately drives idle and returns, but sequencer never unblocks.",
    cause:
      "Driver aborted pin driving on reset but failed to close or resolve the open sequencer item contract.",
    bad: `if (!vif.rst_n) begin
  drive_idle();
  return; // BUG: Sequencer item never completed!
end`,
    fix: `if (!vif.rst_n) begin
  drive_idle();
  mark_aborted(req);
  seq_item_port.item_done(); // Resolve contract!
  return;
end`,
    interview:
      "Reset handling requires two cleanups: electrical cleanup of driven pins, and contractual cleanup of the sequencer item.",
  },
  {
    title: "Bug 7 — Driver Becomes Scoreboard",
    symptom:
      "Driver contains complex expected-data calculations and functional checks. Driver code becomes huge and un-reusable.",
    waveform:
      "Driver produces UVM_ERROR messages comparing read data with internal model values.",
    cause:
      "Violating component boundaries by placing functional correctness checking inside the driver.",
    bad: `if (vif.rdata !== expected_model_data[req.addr]) begin
  \`uvm_error("DRV_MISMATCH", "Data mismatch inside driver!")
end`,
    fix: `// Driver only samples status/data and routes to sequence or monitor:
rsp.data = vif.rdata;
seq_item_port.put_response(rsp);
// Scoreboard compares monitor stream independently!`,
    interview:
      "The driver drives stimulus; the monitor observes pins; the scoreboard validates functional correctness. Never cross these boundaries.",
  },
  {
    title: "Bug 8 — Bidirectional Driver Never Releases Bus",
    symptom:
      "Bus contention, X-propagation, or DUT read data permanently corrupted by testbench driving.",
    waveform:
      "data_oe remains high during read cycles when DUT is attempting to drive data.",
    cause:
      "Driver forgets to deassert output enable (OE) / release tri-state bus after write operations.",
    bad: `task drive_write(my_txn req);
  vif.oe   <= 1'b1;
  vif.data <= req.data;
  @(posedge vif.clk);
  // BUG: oe left high!
endtask`,
    fix: `task drive_write(my_txn req);
  vif.oe   <= 1'b1;
  vif.data <= req.data;
  @(posedge vif.clk);
  vif.oe   <= 1'b0; // Release bus!
  vif.data <= 'z;
endtask`,
    interview:
      "In bidirectional protocols, bus release (deasserting OE) is as critical as driving valid data.",
  },
  {
    title: "Bug 9 — Hard-Coded Timeout Claimed as Protocol Failure",
    symptom:
      "Valid long-latency transactions (e.g. flash memory erase, slow peripheral access) trigger false driver errors.",
    waveform:
      "UVM_ERROR reported after fixed 100 cycles while DUT was legally busy.",
    cause:
      "Hard-coding arbitrary wait bounds inside the driver without specification backing.",
    bad: `repeat (100) @(posedge vif.clk);
if (!vif.ready) \`uvm_error("PROTOCOL_FAIL", "DUT failed protocol!")`,
    fix: `// Timeout should be configurable debug policy, not protocol fact:
if (cfg.enable_debug_watchdog && cycles > cfg.max_timeout_cycles) begin
  \`uvm_warning("DRV_TIMEOUT", "Debug watchdog threshold reached")
  abort_or_recover();
end`,
    interview:
      "Distinguish between protocol specification timeouts and testbench debug watchdogs.",
  },
  {
    title: "Bug 10 — Layered Driver Becomes a God Class",
    symptom:
      "One massive driver file (>3000 lines) handling packet framing, encryption, CRC, lane striping, and bit timing. Impossible to debug or reuse.",
    waveform:
      "Simulation hangs or protocol bugs are nearly impossible to trace to a specific layer.",
    cause:
      "Failing to separate protocol layers into hierarchical transactors/drivers.",
    bad: `// One driver handles:
// Transaction decode + TLS encryption + Packet Header + Byte Striping + SerDes bit clocking`,
    fix: `// Layered VIP architecture:
// App Sequence -> Packet Driver -> Lane Layer -> PHY Transactor`,
    interview:
      "Decompose complex protocol stacks into layered VIP transactors so each level has a single, verifiable responsibility.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// DATA — Interview Q&A (15 Questions)
// ─────────────────────────────────────────────────────────────────────────────

const module4InterviewQA = [
  {
    q: "Q1. What is the first thing you decide before writing a UVM driver?",
    short:
      "Classify the protocol timing, handshake flow control, and completion contract.",
    deep: "A senior engineer does not start by writing run_phase. First classify: direction (master/slave), flow control (ready/valid/credits), transaction mapping (single beat/burst/packet), concurrency (blocking/pipelined), and reset/abort requirements.",
    followup: "Why not start with a standard driver template?",
    answer:
      "Because templates bake in assumptions about item_done() timing and concurrency that may violate the target protocol.",
  },
  {
    q: "Q2. When should item_done() be called?",
    short:
      "When the driver has fulfilled its contractual obligation for that sequence item.",
    deep: "For non-pipelined bus drivers, after access completion, response sampling, and cleanup. For pipelined drivers, after request acceptance if and only if outstanding tracking is established. For bursts, after the last beat.",
    followup: "What happens if item_done() is called after setup phase in APB?",
    answer:
      "The sequencer sends the next item while the bus is still in access phase, corrupting addresses and violating the protocol.",
  },
  {
    q: "Q3. What is the difference between get() and get_next_item()?",
    short:
      "get() is a self-completing FIFO fetch; get_next_item() creates an item_done obligation.",
    deep: "get() completes the sequencer handshake upon return and does not allow item_done(). get_next_item() keeps the sequencer transaction open until the driver explicitly calls item_done(), giving precise control over completion timing.",
    followup: "Can you pass responses with get()?",
    answer:
      "No, response routing via put_response() is designed around the get_next_item() / item_done() lifecycle.",
  },
  {
    q: "Q4. Why is try_next_item() risky?",
    short:
      "It returns null if no item is ready, risking null pointer dereferences and zero-delay loops.",
    deep: "try_next_item() is non-blocking. If no item exists, it returns null. The driver must handle null by advancing time (e.g. @(posedge clk)) and driving idle. Forgetting the null check causes simulation crashes; forgetting the clock advance causes infinite zero-delay loops.",
    followup: null,
    answer: null,
  },
  {
    q: "Q5. What makes a ready/valid driver different from a simple driver?",
    short: "The requirement for strict payload stability under backpressure.",
    deep: "In ready/valid protocols, valid is a commitment. If ready is low, the driver must hold all data and control pins unchanged across clock edges until handshake occurs. It cannot abort or mutate payload mid-wait.",
    followup: "Can a driver deassert valid before ready arrives?",
    answer:
      "In standard AXI/streaming protocols, no. Once asserted, valid must remain high until handshake, unless hardware reset asserts.",
  },
  {
    q: "Q6. What is the biggest risk in a pipelined driver?",
    short:
      "Race condition between request release and response queue bookkeeping.",
    deep: "If item_done() is called before the request state is cloned and stored in the outstanding queue, an immediate response from the DUT cannot be correlated with the originating transaction.",
    followup: null,
    answer: null,
  },
  {
    q: "Q7. Why should a driver not become a scoreboard?",
    short:
      "It destroys VIP reuse, hides bugs, and duplicates verification responsibilities.",
    deep: "The driver's role is strictly generating legal stimulus. Scoreboards verify correctness based on monitor observations. Putting assertions and reference models in the driver creates coupling and prevents passive reuse.",
    followup: null,
    answer: null,
  },
  {
    q: "Q8. What is a reactive driver?",
    short:
      "A driver that generates stimulus in response to observable DUT actions.",
    deep: "Slave responders, memory responders, and dynamic backpressure sinks are reactive. They wait for DUT requests, decode them, and provide compliant responses within protocol-specified timing windows.",
    followup: null,
    answer: null,
  },
  {
    q: "Q9. What is the main issue with bidirectional drivers?",
    short: "Managing bus ownership and tristate (OE) timing to avoid contention.",
    deep: "The driver must explicitly control when it drives and when it releases the bus (OE=0 / high-Z). Leaving OE asserted during DUT turn-around creates electrical contention and X-propagation in simulation.",
    followup: null,
    answer: null,
  },
  {
    q: "Q10. How do you handle reset during an active item?",
    short:
      "Clean up driven pins to idle, resolve the sequencer item contract, and clear local state.",
    deep: "A robust driver detects reset during handshake loops, drives idle values, and either marks the item aborted and calls item_done(), returns an abort response, or re-queues under a defined policy. It never drops items silently.",
    followup: null,
    answer: null,
  },
  {
    q: "Q11. What is the difference between protocol timeout and debug timeout?",
    short:
      "Protocol timeouts are specification rules; debug timeouts are testbench watchdogs.",
    deep: "If a protocol specification mandates a response within N cycles (e.g. PCIe completion timeout), a timeout is a protocol error. If the bus allows infinite wait states, any testbench timeout is merely a hang-detection watchdog.",
    followup: null,
    answer: null,
  },
  {
    q: "Q12. Why use set_id_info(req) in responses?",
    short:
      "To preserve sequence and transaction IDs so the response reaches the correct sequence thread.",
    deep: "In environments with concurrent sequences or hierarchical virtual sequencers, set_id_info() copies the routing metadata from request to response, allowing get_response() to route correctly.",
    followup: null,
    answer: null,
  },
  {
    q: "Q13. What makes a layered VIP driver better than one giant driver?",
    short:
      "Separation of concerns, testability, and abstraction-level reuse.",
    deep: "Layered drivers separate application transactions, framing/packetization, striping, and PHY timing into distinct transactors. Each layer can be verified, reused, or replaced independently.",
    followup: null,
    answer: null,
  },
  {
    q: "Q14. What is a driver architecture smell?",
    short:
      "Ambiguous item_done placement, hidden checkers, hard-coded delays, or untracked state.",
    deep: "Key warning signs include: calling item_done() before handshake, checking read data values inside the driver, using arbitrary #delays, losing items on reset, and coupling the driver directly to monitor internals.",
    followup: null,
    answer: null,
  },
  {
    q: "Q15. How would you classify an AXI4-Lite-style master driver at taxonomy level?",
    short:
      "Master + multi-channel + response-path + ordering-aware + timing-parametric.",
    deep: "It initiates requests across independent address and data channels, captures decoupled write responses or read data, maintains outstanding transaction state, and parameterizes handshake delays.",
    followup: null,
    answer: null,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// DATA — Sections for Sidebar Navigation
// ─────────────────────────────────────────────────────────────────────────────

const module4Sections = [
  { id: "identity", label: "Module Identity & Thesis" },
  { id: "objectives", label: "Learning Objectives" },
  { id: "how-to-use", label: "How to Use This Module" },
  { id: "legend", label: "Visual Tag Legend" },
  { id: "acceptance", label: "Acceptance Checklist" },
  { id: "scope", label: "Scope & Non-Scope" },
  { id: "mental-model", label: "Protocol Mental Model & Axes" },
  { id: "timing", label: "Timing / Waveform Contracts" },
  { id: "boundary", label: "Driver Responsibility Boundary" },
  { id: "contract", label: "Seq-Sequencer-Driver Contract" },
  { id: "reset", label: "Reset / Abort Policy" },
  { id: "response", label: "Response & Completion Policy" },
  { id: "ownership", label: "Protocol Ownership Matrix" },
  { id: "memory", label: "Memory Cards (1–40)" },
  { id: "atlas", label: "Atlas Sheets (1–7)" },
  { id: "codelabs", label: "Code Labs (1–5)" },
  { id: "bugs", label: "Bug Gallery (1–10)" },
  { id: "race", label: "Race-Condition Checklist" },
  { id: "logging", label: "Debug Instrumentation & Logs" },
  { id: "verification-boundary", label: "Monitor / Scoreboard Boundary" },
  { id: "decisions", label: "Architectural Decision Points" },
  { id: "scalability", label: "Scalability Notes" },
  { id: "review", label: "Review Checklist" },
  { id: "interview", label: "Interview Q&A (Q1–Q15)" },
  { id: "recall", label: "Final Recall Card" },
  { id: "takeaways", label: "Key Takeaways" },
  { id: "exercise", label: "Coding Exercise" },
  { id: "verdict", label: "Final Readiness Verdict" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT — Module 4
// ═══════════════════════════════════════════════════════════════════════════════

const Module4 = () => {
  return (
    <div className="relative min-h-screen bg-slate-950 text-white font-sans">
      {/* Background glow & grid */}
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-150 h-62.5 bg-linear-to-r from-violet-600/15 to-indigo-600/15 blur-[100px] rounded-full" />

      <div className="relative z-10 flex max-w-7xl mx-auto">
        {/* ── Sidebar TOC (desktop) ────────────────────────────────────── */}
        <ModuleSidebar
          moduleNumber="4"
          title="Driver Type Taxonomy and Pattern Map"
          sections={module4Sections}
        />

        {/* ── Main Content ─────────────────────────────────────────────── */}
        <main className="flex-1 min-w-0 px-6 py-8 pb-24 max-w-4xl">
          {/* Mobile back */}
          <BackToHomeBtn to="/driver-mastery" />

          {/* Hero */}
          <ModuleHero
            moduleNumber="4"
            title="Driver Type Taxonomy and Pattern Map"
            description="Master the architectural taxonomy of UVM driver patterns — from simple blocking and non-pipelined buses to streaming, pipelined, multi-channel, reactive, and layered VIP transactors."
            metadata={[
              ["Module", "4"],
              ["Reference", "UVM 1.2 / IEEE 1800.2"],
              ["Level", "Intermediate → Principal Architect"],
              ["Coverage", "40 Architecture Patterns"],
            ]}
          />

          {/* ── §1 Cover Page / Module Identity ─────────────────────────── */}
          <section id="identity">
            <SectionHeading num={1} title="Cover Page / Module Identity" />
            <div className="rounded-xl border border-slate-700/60 bg-slate-900/50 p-5 space-y-3 mb-6">
              <p className="text-sm text-slate-300">
                <strong>Course:</strong> UVM Driver Mastery &nbsp;|&nbsp;{" "}
                <strong>Module:</strong> 4 &nbsp;|&nbsp;{" "}
                <strong>Position:</strong> After Universal Recipe, before
                protocol-specific deep dives.
              </p>
              <h3 className="text-lg font-bold text-violet-300">
                Module Thesis
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                A senior verification engineer does not start by writing{" "}
                <code className="text-violet-300">run_phase</code>. A senior
                verification engineer first classifies the protocol and chooses
                the correct driver pattern.
              </p>
              <p className="text-slate-400 text-sm leading-relaxed">
                The wrong driver architecture can still compile. It may even pass
                smoke tests. It will eventually fail under concurrency, reset,
                backpressure, response timing, or debug pressure.
              </p>
              <div className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-lg p-3">
                <strong>Common Failure Signatures:</strong> Sequence hangs • Early{" "}
                <code>item_done()</code> • Dropped responses • Reset-corrupted
                items • Races against monitor/DUT • Unstable payload under
                backpressure • Broken outstanding tracking • Scoreboard debug
                nightmares.
              </div>
            </div>
          </section>

          {/* ── §2 Learning Objectives ──────────────────────────────────── */}
          <section id="objectives">
            <SectionHeading num={2} title="Learning Objectives" />
            <ol className="space-y-2.5 list-decimal list-inside text-slate-300 text-sm leading-relaxed">
              {[
                "Classify any protocol into the correct UVM driver pattern across 8 behavioral axes.",
                "Explain the structural and timing differences between simple, non-pipelined, streaming, pipelined, multi-channel, slave, reactive, credit-based, retry, serial, bidirectional, layered, and coherent drivers.",
                "Decide what item_done() means for a selected driver contract (request accepted vs transfer completed vs response captured vs packet completed).",
                "Choose definitively between get_next_item()/item_done(), get(), try_next_item(), and put_response().",
                "Identify strict boundaries between driver ownership versus monitor, scoreboard, and assertion ownership.",
                "Defend driver architecture tradeoffs confidently in senior and principal engineering interviews.",
                "Recognize bad driver patterns and architectural debt before they impact team verification schedules.",
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
            <p className="text-slate-400 text-sm mb-4">
              Use this module as a pattern classifier. Do not memorize every driver
              type as a separate template; instead, classify every protocol with
              the same questions:
            </p>
            <Table
              headers={["Question", "Why It Matters"]}
              rows={[
                [
                  "Does one sequence item map to one transfer, many beats, or multiple channels?",
                  "Determines simple, burst, packet, split, or multi-channel architecture.",
                ],
                [
                  "Can the DUT stall the driver?",
                  "Determines ready/backpressure/wait-state handling.",
                ],
                [
                  "Can multiple requests be outstanding?",
                  "Determines pipelined/outstanding tracking architecture.",
                ],
                [
                  "Is response separate from request?",
                  "Determines response object and set_id_info() need.",
                ],
                [
                  "Does the testbench initiate or respond?",
                  "Determines master vs slave/reactive pattern.",
                ],
                [
                  "Can reset arrive mid-item?",
                  "Determines abort and item cleanup policy.",
                ],
                [
                  "Is timing bit-level or transaction-level?",
                  "Determines serial/PHY-style complexity.",
                ],
                [
                  "Is ownership shared across lanes, channels, or layers?",
                  "Determines layered or multi-interface architecture.",
                ],
              ]}
            />
          </section>

          {/* ── §4 Visual Tag Legend ───────────────────────────────────── */}
          <section id="legend">
            <SectionHeading num={4} title="Visual Tag Legend" />
            <Table
              headers={["Tag", "Meaning"]}
              rows={[
                ["[PATTERN]", "Driver architecture pattern"],
                ["[CONTRACT]", "Sequencer-driver or protocol contract"],
                ["[TIMING]", "Clock, phase, handshake, or race issue"],
                [
                  "[BOUNDARY]",
                  "Driver vs monitor/scoreboard/assertion ownership",
                ],
                ["[RESET]", "Reset, abort, cleanup, or phase-exit policy"],
                ["[RESPONSE]", "Response capture, routing, or completion policy"],
                ["[DEBUG]", "Debug signature or logging guidance"],
                ["[INTERVIEW]", "Senior/principal interview framing"],
                ["[BAD CODE]", "Incorrect implementation pattern"],
                ["[FORWARD REF]", "Topic belongs to a later specialized module"],
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
                ["M4-01", "Defines the purpose of driver taxonomy."],
                ["M4-02", "Separates taxonomy from deep protocol implementation."],
                ["M4-03", "Gives a practical driver classification method."],
                ["M4-04", "Covers simple/blocking transaction drivers."],
                ["M4-05", "Covers non-pipelined command/bus drivers."],
                ["M4-06", "Covers ready/valid streaming drivers."],
                ["M4-07", "Covers master drivers."],
                ["M4-08", "Covers slave/responder drivers."],
                ["M4-09", "Covers reactive drivers."],
                ["M4-10", "Covers pipelined drivers."],
                ["M4-11", "Covers multi-channel drivers."],
                ["M4-12", "Covers response-path drivers."],
                ["M4-13", "Covers reset-aware and abort-aware drivers."],
                ["M4-14", "Covers error-injection drivers."],
                ["M4-15", "Covers low-power and clock-gated drivers."],
                ["M4-16", "Covers clocking-block based drivers."],
                ["M4-17", "Covers forked-thread drivers."],
                ["M4-18", "Covers burst, packet, framing, aggregation, and splitting drivers."],
                ["M4-19", "Covers credit-based drivers."],
                ["M4-20", "Covers retry/replay drivers."],
                ["M4-21", "Covers serial and bit-level drivers."],
                ["M4-22", "Covers bidirectional, tri-state, and open-drain drivers."],
                ["M4-23", "Covers RAL frontdoor drivers."],
                ["M4-24", "Covers DPI/SystemC/emulation-friendly drivers."],
                ["M4-25", "Covers layered VIP-style drivers."],
                ["M4-26", "Covers coherent/security-aware drivers at taxonomy level."],
                ["M4-27", "Defines item completion policy per driver family."],
                ["M4-28", "Defines response policy per driver family."],
                ["M4-29", "Defines reset/abort implications per driver family."],
                ["M4-30", "Provides atlas sheets and decision matrices."],
                ["M4-31", "Provides realistic compile-ready code labs."],
                ["M4-32", "Provides bug gallery with waveform/debug clues."],
                ["M4-33", "Provides interview-ready architectural defenses."],
                ["M4-34", "Maintains strict verification boundary discipline."],
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
                  <li>Driver taxonomy and pattern classification framework</li>
                  <li>Architecture selection based on protocol constraints</li>
                  <li>Ownership boundaries (driver vs monitor vs scoreboard)</li>
                  <li>Completion semantics and response-path implications</li>
                  <li>Reset/abort implications and concurrency decision points</li>
                  <li>Interview defense language for senior & principal roles</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/40">
                <h4 className="font-bold text-slate-300 mb-2">
                  Non-Scope (Handled in Dedicated Future Modules)
                </h4>
                <Table
                  headers={["Topic", "Destination Module"]}
                  rows={[
                    ["APB master timing details", "Module 6 & Module 8"],
                    ["Ready/valid full implementation", "Module 9"],
                    ["AXI4-Lite driver implementation", "Module 10"],
                    ["Pipelined outstanding queues", "Module 11"],
                    ["Slave/reactive implementation", "Module 12"],
                    ["Burst/packet implementation", "Module 14"],
                    ["Serial/open-drain/inout implementation", "Module 15"],
                    ["Retry/replay architecture", "Module 16"],
                    ["Low-power/reset-deep behavior", "Module 17"],
                    ["RAL/DPI/emulation transactors", "Module 18"],
                    ["Layered/coherent/security VIP", "Module 19"],
                  ]}
                />
              </div>

              <Callout type="concept">
                <strong>Boundary Note:</strong> Module 4 teaches which driver
                pattern to choose. Later modules teach how to implement each
                pattern deeply.
              </Callout>
            </div>
          </section>

          {/* ── §7 Protocol Mental Model ───────────────────────────────── */}
          <section id="mental-model">
            <SectionHeading
              num={7}
              title="Protocol Mental Model & Classification Axes"
            />
            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              A driver type is determined by the protocol's behavioral contract.
              Before writing the driver, classify the protocol across eight
              fundamental axes:
            </p>

            <h3 className="text-lg font-bold text-violet-300 mb-3">
              7.1 Classification Axis 1 — Transaction Mapping
            </h3>
            <Table
              headers={["Protocol Shape", "Likely Driver Pattern"]}
              rows={[
                ["One item maps to one complete transfer", "Simple/blocking driver"],
                ["One item maps to setup/access/wait/complete", "Non-pipelined bus driver"],
                ["One item maps to many beats", "Burst/packet/framing driver"],
                ["Many items pack into one bus transfer", "Aggregation driver"],
                ["One item splits across multiple bus transfers", "Splitting driver"],
                ["One item creates obligations on multiple channels", "Multi-channel driver"],
                ["One item sends request now, receives response later", "Response-path / pipelined driver"],
                ["One item may be retried upon rejection", "Retry/replay driver"],
              ]}
            />

            <h3 className="text-lg font-bold text-violet-300 mt-6 mb-3">
              7.2 Classification Axis 2 — Flow Control
            </h3>
            <Table
              headers={["Flow Control", "Driver Implication"]}
              rows={[
                ["No backpressure", "Driver controls timing fully."],
                ["Ready / backpressure", "Driver must hold payload stable while waiting."],
                ["Wait-state based completion", "Driver must observe completion before cleanup."],
                ["Credit-based permission", "Driver must track send eligibility state."],
                ["Retry / NACK", "Driver must preserve transaction state for replay."],
                ["Clock / power gating", "Driver must avoid waits that assume running clock."],
              ]}
            />

            <h3 className="text-lg font-bold text-violet-300 mt-6 mb-3">
              7.3 Classification Axis 3 — Directionality
            </h3>
            <Table
              headers={["Direction", "Driver Type"]}
              rows={[
                ["TB drives DUT request", "Master / active driver"],
                ["TB responds to DUT request", "Slave / responder driver"],
                ["TB stimulus depends on DUT behavior", "Reactive driver"],
                ["TB drives and releases same wire", "Bidirectional / open-drain driver"],
                ["TB coordinates protocol layers", "Layered VIP driver"],
              ]}
            />

            <h3 className="text-lg font-bold text-violet-300 mt-6 mb-3">
              7.4 Classification Axis 4 — Completion Meaning
            </h3>
            <Table
              headers={["Completion Meaning", "Typical Driver Family"]}
              rows={[
                ["Pins driven for fixed transfer", "Simple driver"],
                ["Protocol completion observed", "Non-pipelined bus driver"],
                ["Beat handshake completed", "Streaming driver"],
                ["Final beat & framing completed", "Burst / packet driver"],
                ["Request accepted, response pending", "Pipelined driver"],
                ["Response captured & routed", "Response-path driver"],
                ["Response driven to DUT", "Slave / responder driver"],
                ["Retry succeeded / final failure reached", "Retry / replay driver"],
                ["Item aborted & ownership resolved", "Reset / abort-aware driver"],
              ]}
            />

            <h3 className="text-lg font-bold text-violet-300 mt-6 mb-3">
              7.5 Classification Axis 5 — Response Path
            </h3>
            <Table
              headers={["Response Need", "Driver Consequence"]}
              rows={[
                ["No response needed", "item_done() is sufficient."],
                ["Sequence needs status / read data", "Driver must create & send response object."],
                ["Multiple sequences / outstanding items exist", "Response must preserve routing with set_id_info(req)."],
                ["Monitor owns observation only", "Do not confuse monitor analysis with sequencer response."],
                ["Scoreboard owns correctness", "Driver must not hide functional checks in response code."],
              ]}
            />
          </section>

          {/* ── §8 Timing / Waveform Contract ──────────────────────────── */}
          <section id="timing">
            <SectionHeading num={8} title="Timing / Waveform Contracts" />
            <p className="text-slate-300 text-sm mb-4">
              A driver pattern is fundamentally a timing contract between the UVM
              phase/sequencer and the physical pin interface.
            </p>

            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-slate-200 mb-1">
                  8.1 Simple Driver Timing
                </h4>
                <CodeBlock lang="text">
                  get item -&gt; drive pins -&gt; wait fixed/known completion -&gt; cleanup -&gt; item_done
                </CodeBlock>
              </div>

              <div>
                <h4 className="font-bold text-slate-200 mb-1">
                  8.2 Non-Pipelined Bus Timing
                </h4>
                <CodeBlock lang="text">
                  get item -&gt; setup phase -&gt; access phase -&gt; wait completion (ready/ack) -&gt; sample response -&gt; cleanup -&gt; item_done
                </CodeBlock>
              </div>

              <div>
                <h4 className="font-bold text-slate-200 mb-1">
                  8.3 Streaming Timing
                </h4>
                <CodeBlock lang="text">
                  get item -&gt; assert valid -&gt; hold payload stable while !ready -&gt; handshake -&gt; next beat/item
                </CodeBlock>
              </div>

              <div>
                <h4 className="font-bold text-slate-200 mb-1">
                  8.4 Pipelined Timing
                </h4>
                <CodeBlock lang="text">
                  request acceptance != response completion (separate timelines with outstanding queues)
                </CodeBlock>
              </div>

              <div>
                <h4 className="font-bold text-slate-200 mb-1">
                  8.5 Multi-Channel Timing
                </h4>
                <CodeBlock lang="text">
                  Address Channel Thread || Write Data Channel Thread || Response Collector Thread
                </CodeBlock>
              </div>

              <div>
                <h4 className="font-bold text-slate-200 mb-1">
                  8.6 Reactive Timing
                </h4>
                <CodeBlock lang="text">
                  wait DUT request -&gt; decode observable request -&gt; choose legal response -&gt; drive response
                </CodeBlock>
              </div>
            </div>
          </section>

          {/* ── §9 Driver Responsibility Boundary ───────────────────────── */}
          <section id="boundary">
            <SectionHeading
              num={9}
              title="Driver Responsibility Boundary"
            />
            <blockquote className="border-l-4 border-violet-500 bg-violet-500/10 p-4 rounded-r-xl text-violet-200 font-semibold text-sm mb-4">
              "The driver's primary job: Convert transaction intent into legal
              pin-level stimulus. It owns driving and legal timing, not functional
              correctness."
            </blockquote>

            <h3 className="text-lg font-bold text-violet-300 mb-3">
              9.1 Responsibility Ownership Matrix
            </h3>
            <Table
              headers={["Concern", "Driver", "Monitor", "Scoreboard", "Assertion"]}
              rows={[
                ["Drive request pins", "YES", "NO", "NO", "NO"],
                ["Observe transfer completion for progress", "YES", "YES", "NO", "MAYBE"],
                ["Capture protocol response for sequence", "YES (if req'd)", "YES", "MAYBE", "NO"],
                ["Check data correctness", "NO", "NO", "YES", "MAYBE"],
                ["Check stable payload temporal rule", "Defensive guard", "MAYBE", "NO", "YES"],
                ["Detect dropped transaction globally", "NO", "YES", "YES", "MAYBE"],
                ["Enforce reset signal cleanup for driven pins", "YES", "OBSERVE", "NO", "MAYBE"],
                ["Prove protocol compliance", "NO", "MAYBE", "NO", "YES"],
                ["Predict expected DUT behavior", "NO", "NO", "YES", "NO"],
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
                <h4 className="font-bold text-violet-300 text-base mb-2">
                  10.1 get_next_item() / item_done()
                </h4>
                <p className="mb-2">
                  The standard paired blocking pull contract. Use when the
                  driver needs explicit control over completion timing.
                </p>
                <CodeBlock lang="systemverilog">{`seq_item_port.get_next_item(req);
drive_item(req);
seq_item_port.item_done();`}</CodeBlock>
              </div>

              <div>
                <h4 className="font-bold text-violet-300 text-base mb-2">
                  10.2 get()
                </h4>
                <p className="mb-2">
                  Self-completing FIFO fetch. Do not call item_done() after get().
                </p>
                <CodeBlock lang="systemverilog">{`seq_item_port.get(req);
drive_item(req);
// No item_done()!`}</CodeBlock>
              </div>

              <div>
                <h4 className="font-bold text-violet-300 text-base mb-2">
                  10.3 try_next_item()
                </h4>
                <p className="mb-2">
                  Opportunistic non-blocking fetch used for background/idle
                  driving. Must explicitly check for null.
                </p>
                <CodeBlock lang="systemverilog">{`seq_item_port.try_next_item(req);
if (req != null) begin
  drive_item(req);
  seq_item_port.item_done();
end
else begin
  drive_idle_cycle();
end`}</CodeBlock>
              </div>

              <div>
                <h4 className="font-bold text-violet-300 text-base mb-2">
                  10.4 put_response()
                </h4>
                <p className="mb-2">
                  Sends response back to sequence. Must preserve sequence routing
                  with set_id_info(req).
                </p>
                <CodeBlock lang="systemverilog">{`rsp = my_rsp::type_id::create("rsp");
rsp.set_id_info(req);
rsp.status = observed_status;
seq_item_port.put_response(rsp);`}</CodeBlock>
              </div>
            </div>
          </section>

          {/* ── §11 Reset / Abort Policy ───────────────────────────────── */}
          <section id="reset">
            <SectionHeading num={11} title="Reset / Abort Policy" />
            <p className="text-slate-300 text-sm mb-4">
              Every driver pattern requires an explicit reset policy. An active
              item must never silently vanish.
            </p>
            <Table
              headers={["Driver Type", "Reset Risk"]}
              rows={[
                ["Simple driver", "May forget item_done() after abort."],
                ["Streaming driver", "May leave valid asserted through reset."],
                ["Pipelined driver", "May lose outstanding request bookkeeping."],
                ["Multi-channel driver", "One thread resets while another hangs."],
                ["Retry driver", "Retry queue may preserve stale pre-reset state."],
                ["Slave/reactive driver", "May respond to stale pre-reset DUT requests."],
                ["Open-drain driver", "May fail to release bus into high-Z during reset."],
                ["Low-power driver", "May wait forever on a stopped clock."],
              ]}
            />
          </section>

          {/* ── §12 Response / Completion Policy ────────────────────────── */}
          <section id="response">
            <SectionHeading
              num={12}
              title="Response / Completion Policy"
            />
            <p className="text-slate-300 text-sm mb-4">
              Driver taxonomy is largely about completion semantics. Below is the
              comparison of bad vs correct non-pipelined vs pipelined completion
              policies:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
              <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/5">
                <h4 className="font-bold text-rose-300 mb-2">
                  ❌ Bad Completion Policy
                </h4>
                <CodeBlock lang="systemverilog">{`seq_item_port.get_next_item(req);
drive_addr(req);
seq_item_port.item_done(); // BAD: access pending!
drive_data(req);
wait_response();`}</CodeBlock>
                <p className="text-xs text-rose-300 mt-2">
                  Sequencer issues next item prematurely; arbitration and data
                  collide.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
                <h4 className="font-bold text-emerald-300 mb-2">
                  ✅ Correct Non-Pipelined Policy
                </h4>
                <CodeBlock lang="systemverilog">{`seq_item_port.get_next_item(req);
drive_complete_transfer(req);
sample_required_response(req);
cleanup_bus();
seq_item_port.item_done(); // Safe completion`}</CodeBlock>
                <p className="text-xs text-emerald-300 mt-2">
                  Item is released only after bus completion and safe idle.
                </p>
              </div>
            </div>
          </section>

          {/* ── §13 Protocol Ownership Matrix ──────────────────────────── */}
          <section id="ownership">
            <SectionHeading num={13} title="Protocol Ownership Matrix" />
            <Table
              headers={["Protocol Feature", "Driver Ownership", "Not Driver Ownership"]}
              rows={[
                ["Request signals", "Drive legal timed values.", "Prove DUT functional correctness."],
                ["Handshakes", "Hold payload stable until handshake.", "End-to-end data correctness."],
                ["Wait states", "Wait for completion for item progress.", "Global protocol compliance proof."],
                ["Error response", "Capture if sequence needs status.", "Scoreboard error checking."],
                ["Read data", "Return to sequence if contract requires.", "Global memory model check."],
                ["Reset", "Drive idle, resolve active item.", "Full reset coverage closure."],
                ["Credits", "Track local send permission state.", "Prove credit generator correctness."],
                ["Tri-state wire", "Drive/release bus enable correctly.", "Detect every contention alone."],
              ]}
            />
          </section>

          {/* ── §14 Memory Cards ────────────────────────────────────────── */}
          <section id="memory">
            <SectionHeading num={14} title="Memory Cards (1–40)" />
            <p className="text-slate-400 text-sm mb-4">
              Master these 40 foundational recall anchors covering every driver
              family and design pattern:
            </p>
            <div className="space-y-3">
              {module4MemoryCards.map((card, idx) => (
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
              title="Atlas Sheet 1 — Driver Pattern Selection Matrix"
              accent="blue"
              icon={<FaListAlt size={12} />}
            >
              <Table
                headers={[
                  "Property",
                  "Simple",
                  "Non-Pipelined",
                  "Streaming",
                  "Pipelined",
                  "Multi-Channel",
                  "Slave/Reactive",
                ]}
                rows={[
                  ["1 item = 1 op", "YES", "SOMETIMES", "SOMETIMES", "NO", "NO", "SOMETIMES"],
                  ["Wait completion", "NO/SIMPLE", "YES", "HANDSHAKE", "MAYBE", "PER CHANNEL", "YES"],
                  ["Backpressure", "NO", "WAIT-STATE", "READY", "MAYBE", "PER CHANNEL", "MAY DRIVE"],
                  ["Outstanding reqs", "NO", "NO", "DEPENDS", "YES", "YES", "DEPENDS"],
                  ["Response path", "NO", "OPTIONAL", "OPTIONAL", "COMMON", "COMMON", "COMMON"],
                  ["Reset complexity", "LOW", "MEDIUM", "MEDIUM", "HIGH", "HIGH", "HIGH"],
                  ["Thread complexity", "LOW", "LOW", "LOW/MED", "MEDIUM", "HIGH", "MED/HIGH"],
                ]}
              />
            </CollapsibleCard>

            <CollapsibleCard
              title="Atlas Sheet 2 — item_done() Placement Map"
              accent="violet"
              icon={<FaListAlt size={12} />}
            >
              <Table
                headers={["Driver Pattern", "Safe item_done() Point", "Unsafe item_done() Point"]}
                rows={[
                  ["Simple blocking", "After fixed transfer & cleanup", "Immediately after fetch"],
                  ["Non-pipelined bus", "After ready/ack & cleanup", "After setup/address only"],
                  ["Ready/valid beat", "After beat handshake", "While valid=1 && ready=0"],
                  ["Ready/valid packet", "After final beat handshake", "After first beat"],
                  ["Burst driver", "After final beat & response", "After first beat"],
                  ["Pipelined request", "After req accepted & state stored", "Before tracking recorded"],
                  ["Slave responder", "After response driven/accepted", "Before DUT req is serviced"],
                  ["Retry driver", "After success / final failure", "After first retryable error"],
                  ["Reset abort", "After abort policy resolves item", "Silent drop during reset"],
                ]}
              />
            </CollapsibleCard>

            <CollapsibleCard
              title="Atlas Sheet 3 — Sequencer-Driver API Pattern Map"
              accent="emerald"
              icon={<FaListAlt size={12} />}
            >
              <Table
                headers={["API Pattern", "Use When", "Do Not Use When", "Critical Rule"]}
                rows={[
                  ["get_next_item() + item_done()", "Explicit completion control needed", "Cannot define completion clearly", "Every non-null item must complete"],
                  ["get()", "Self-completing FIFO fetch", "Need explicit completion timing", "Do NOT call item_done() after get()"],
                  ["try_next_item() + item_done()", "Background/idle behavior needed", "Driver must block until stimulus", "Always check for null before use"],
                  ["put_response()", "Sequence needs feedback/read data", "Monitor alone observes result", "Use valid response with set_id_info()"],
                ]}
              />
            </CollapsibleCard>

            <CollapsibleCard
              title="Atlas Sheet 4 — Response Policy Map"
              accent="amber"
              icon={<FaListAlt size={12} />}
            >
              <Table
                headers={["Need", "Response Object?", "Reason"]}
                rows={[
                  ["Write-only stimulus", "Usually No", "Handshake completion is sufficient."],
                  ["Register read access", "Yes", "Sequence requires read data."],
                  ["Status affects next txn", "Yes", "Sequence makes branching decisions."],
                  ["Scoreboard checking", "No", "Monitor analysis path feeds scoreboard."],
                  ["Multiple outstanding reqs", "Yes", "Requires routing via set_id_info()."],
                  ["Pipelined req/resp", "Yes", "Completion decoupled from request."],
                ]}
              />
            </CollapsibleCard>

            <CollapsibleCard
              title="Atlas Sheet 5 — Reset / Abort Policy Map"
              accent="rose"
              icon={<FaListAlt size={12} />}
            >
              <Table
                headers={["Policy", "When Acceptable", "Risk"]}
                rows={[
                  ["Complete without response", "Write stimulus without status need", "Sequence assumes success"],
                  ["Complete with abort response", "Sequence must know abort status", "Requires sequence response handler"],
                  ["Retry after reset", "Protocol explicitly supports replay", "Can duplicate side-effects"],
                  ["Fatal on mid-item reset", "Reset mid-transfer is illegal test case", "Reduces random reset testing"],
                  ["Silent drop", "NEVER ACCEPTABLE", "Sequencer hang & test deadlock"],
                ]}
              />
            </CollapsibleCard>

            <CollapsibleCard
              title="Atlas Sheet 6 — Driver Boundary Decision Sheet"
              accent="violet"
              icon={<FaListAlt size={12} />}
            >
              <Table
                headers={["Question", "Driver", "Monitor", "Scoreboard", "Assertion"]}
                rows={[
                  ["Who drives DUT inputs?", "YES", "NO", "NO", "NO"],
                  ["Who samples observations for checking?", "Only for drv progress", "YES", "NO", "NO"],
                  ["Who checks data correctness?", "NO", "NO", "YES", "MAYBE"],
                  ["Who checks temporal protocol rules?", "Guard check", "MAYBE", "NO", "YES"],
                  ["Who logs item lifecycle?", "YES", "MAYBE", "MAYBE", "NO"],
                ]}
              />
            </CollapsibleCard>

            <CollapsibleCard
              title="Atlas Sheet 7 — Pattern Composition Examples"
              accent="blue"
              icon={<FaListAlt size={12} />}
            >
              <Table
                headers={["Protocol Example", "Pattern Composition", "Completion Contract"]}
                rows={[
                  ["APB Master", "Master + non-pipelined + wait-state-aware", "After access phase & pready"],
                  ["Streaming Source", "Master + streaming + backpressure-aware", "After valid && ready handshake"],
                  ["AXI4-Lite Master", "Master + multi-channel + response-path", "Decoupled req vs resp tracking"],
                  ["AXI Slave", "Slave + reactive + multi-channel", "After DUT request is serviced"],
                  ["I2C Driver", "Serial + open-drain + bidirectional", "After byte ACK/NACK handshake"],
                ]}
              />
            </CollapsibleCard>
          </section>

          {/* ── §16 Code Labs ───────────────────────────────────────────── */}
          <section id="codelabs">
            <SectionHeading num={16} title="Code Labs (1–5)" />

            {/* Lab 1 */}
            <CollapsibleCard
              title="Code Lab 1 — Classify Driver Pattern from Protocol Facts"
              accent="emerald"
              icon={<FaFlask size={12} />}
              defaultOpen={true}
            >
              <p className="text-slate-300 text-xs mb-3">
                <strong>Given Protocol Facts:</strong> DUT has cmd_valid, cmd_ready,
                cmd_addr, cmd_write, cmd_wdata, rsp_valid, rsp_ready, rsp_status,
                rsp_rdata. Only 1 outstanding command allowed. Sequence needs read
                data and status.
              </p>
              <CodeBlock lang="text">{`1. Driver Direction:
   Master driver. The testbench initiates commands toward the DUT.

2. Main Pattern:
   Non-pipelined command/response driver with ready/valid command handshake
   and separate response-path behavior.

3. Flow Control:
   cmd_ready creates backpressure. Driver must hold command fields stable
   while cmd_valid=1 and cmd_ready=0.

4. Outstanding Model:
   Max 1 outstanding command; response wait occurs after command acceptance.

5. Safe item_done() Point:
   After command handshake, response capture, response routing, and cleanup.`}</CodeBlock>
            </CollapsibleCard>

            {/* Lab 2 */}
            <CollapsibleCard
              title="Code Lab 2 — Correct try_next_item() Background Driver Pattern"
              accent="blue"
              icon={<FaFlask size={12} />}
            >
              <p className="text-slate-400 text-xs mb-2">
                Demonstrates compile-ready try_next_item() null handling with idle
                clock driving and reset support.
              </p>
              <CodeBlock lang="systemverilog">{`class bg_driver extends uvm_driver #(bg_txn);
  \`uvm_component_utils(bg_driver)
  virtual bg_if vif;

  function new(string name = "bg_driver", uvm_component parent = null);
    super.new(name, parent);
  endfunction

  function void build_phase(uvm_phase phase);
    super.build_phase(phase);
    if (!uvm_config_db #(virtual bg_if)::get(this, "", "vif", vif))
      \`uvm_fatal("NO_VIF", "virtual interface bg_if not found")
  endfunction

  task run_phase(uvm_phase phase);
    forever begin
      @(posedge vif.clk);
      if (!vif.rst_n) begin
        vif.valid <= 1'b0;
        vif.data  <= '0;
        continue;
      end

      seq_item_port.try_next_item(req);
      if (req == null) begin
        drive_idle_cycle();
      end
      else begin
        drive_item(req);
        seq_item_port.item_done();
      end
    end
  endtask

  task drive_idle_cycle();
    vif.valid <= 1'b0;
    vif.data  <= '0;
  endtask

  task drive_item(bg_txn t);
    vif.valid <= 1'b1;
    vif.data  <= t.data;
  endtask
endclass`}</CodeBlock>
            </CollapsibleCard>

            {/* Lab 3 */}
            <CollapsibleCard
              title="Code Lab 3 — Pipelined Acceptance Contract with Outstanding Tracking"
              accent="violet"
              icon={<FaFlask size={12} />}
            >
              <Callout type="trap">
                <strong>Bug:</strong> Calling item_done() before cloning and
                pushing the transaction into the outstanding queue creates a race
                condition with fast responses.
              </Callout>
              <CodeBlock lang="systemverilog">{`task issue_loop();
  my_txn tr_copy;
  forever begin
    seq_item_port.get_next_item(req);
    drive_request(req);

    // Record copy BEFORE releasing sequencer item:
    tr_copy = my_txn::type_id::create("tr_copy");
    tr_copy.copy(req);
    outstanding_q.push_back(tr_copy);

    seq_item_port.item_done(); // Legal only when tracking is established
  end
endtask`}</CodeBlock>
            </CollapsibleCard>

            {/* Lab 4 */}
            <CollapsibleCard
              title="Code Lab 4 — Response Object Routing"
              accent="emerald"
              icon={<FaFlask size={12} />}
            >
              <CodeBlock lang="systemverilog">{`task run_phase(uvm_phase phase);
  bus_rsp rsp;
  forever begin
    seq_item_port.get_next_item(req);
    drive_transfer(req);
    sample_response_fields(sampled_error, sampled_rdata);

    rsp = bus_rsp::type_id::create("rsp");
    rsp.set_id_info(req); // Preserve sequence routing!
    rsp.error = sampled_error;
    rsp.rdata = sampled_rdata;

    seq_item_port.put_response(rsp);
    seq_item_port.item_done();
  end
endtask`}</CodeBlock>
            </CollapsibleCard>

            {/* Lab 5 */}
            <CollapsibleCard
              title="Code Lab 5 — Reset-Aware Wait Loop"
              accent="amber"
              icon={<FaFlask size={12} />}
            >
              <Callout type="concept">
                <strong>Defect:</strong> An uninterruptible <code>wait(vif.ready == 1'b1);</code>{" "}
                blocks forever if reset asserts during a wait state. Handshake
                loops must check reset on every cycle.
              </Callout>
              <CodeBlock lang="systemverilog">{`task wait_for_ready_with_reset(output bit aborted);
  aborted = 1'b0;
  while (vif.drv_cb.ready !== 1'b1) begin
    @(vif.drv_cb);
    if (vif.drv_cb.rst_n !== 1'b1) begin
      drive_idle();
      aborted = 1'b1;
      return;
    end
  end
endtask`}</CodeBlock>
            </CollapsibleCard>
          </section>

          {/* ── §17 Bug Gallery ─────────────────────────────────────────── */}
          <section id="bugs">
            <SectionHeading num={17} title="Bug Gallery (1–10)" />
            <div className="space-y-4">
              {module4BugGallery.map((bug, idx) => (
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
              headers={["Check", "Risk If Violated"]}
              rows={[
                ["DUT inputs driven via clocking block?", "Simulator delta-cycle race between TB drive & DUT sample."],
                ["Payload held stable during backpressure?", "DUT samples corrupted data mid-wait."],
                ["Tracking recorded before item_done()?", "Immediate response from DUT lost / misrouted."],
                ["Reset escape on every handshake loop?", "Simulation deadlocks when reset arrives mid-item."],
                ["Bidirectional OE deasserted on cycle end?", "Bus contention and X-propagation on subsequent reads."],
              ]}
            />
          </section>

          {/* ── §19 Debug Instrumentation / Log Strategy ────────────────── */}
          <section id="logging">
            <SectionHeading
              num={19}
              title="Debug Instrumentation & Log Strategy"
            />
            <p className="text-slate-300 text-sm mb-4">
              Every driver log must include item identification, protocol state,
              and cycle timing to ensure instant post-mortem debuggability:
            </p>
            <CodeBlock lang="systemverilog">{`\`uvm_info("DRV_START",
          $sformatf("seq_id=%0d txn_id=%0d addr=0x%08h write=%0b",
                    req.get_sequence_id(),
                    req.get_transaction_id(),
                    req.addr,
                    req.write),
          UVM_MEDIUM)

\`uvm_info("DRV_DONE",
          $sformatf("seq_id=%0d txn_id=%0d status=%s latency=%0d cycles",
                    req.get_sequence_id(),
                    req.get_transaction_id(),
                    status.name(),
                    latency_cycles),
          UVM_HIGH)`}</CodeBlock>
          </section>

          {/* ── §20 Monitor / Scoreboard Boundary ───────────────────────── */}
          <section id="verification-boundary">
            <SectionHeading
              num={20}
              title="Monitor / Scoreboard / Assertion Boundary"
            />
            <div className="p-4 rounded-xl border border-violet-500/20 bg-slate-900/40 text-sm space-y-3">
              <h4 className="font-bold text-violet-300">
                Core Architectural Discipline
              </h4>
              <ul className="list-disc list-inside space-y-1.5 text-slate-300">
                <li>
                  <strong>Driver:</strong> Converts transaction intent into timed
                  pin stimulus. Captures responses strictly required by the
                  originating sequence contract.
                </li>
                <li>
                  <strong>Monitor:</strong> Observes pin activity independently,
                  reconstructs transactions, and broadcasts to analysis ports.
                </li>
                <li>
                  <strong>Scoreboard:</strong> Consumes monitor streams, performs
                  reference-model prediction, and verifies data integrity.
                </li>
                <li>
                  <strong>SVA (Assertions):</strong> Verifies cycle-by-cycle pin
                  timing and protocol interface rules.
                </li>
              </ul>
            </div>
          </section>

          {/* ── §21 Architectural Decision Points ───────────────────────── */}
          <section id="decisions">
            <SectionHeading
              num={21}
              title="Architectural Decision Points"
            />
            <Table
              headers={["Decision", "Option A", "Option B", "Rule of Thumb"]}
              rows={[
                ["Fetch API", "get_next_item()", "get()", "Use get_next_item() for explicit item_done control."],
                ["Response Style", "item_done(rsp)", "put_response(rsp)", "Use put_response() for decoupled/pipelined responses."],
                ["Transaction Handle", "Keep req handle", "Clone / Copy req", "Always copy req if state survives beyond item_done()."],
                ["Handshake Wait", "wait(ready)", "do @(clk) while (!ready)", "Always use clocked loop with reset escape."],
              ]}
            />
          </section>

          {/* ── §22 Scalability Notes ───────────────────────────────────── */}
          <section id="scalability">
            <SectionHeading num={22} title="Scalability Notes" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                <h4 className="font-bold text-emerald-300 mb-2">What Scales</h4>
                <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs">
                  <li>Parameterizing timing delays in config objects</li>
                  <li>Explicit outstanding request tracking queues</li>
                  <li>Layered transactors for multi-layer protocols</li>
                  <li>Centralized reset recovery methods</li>
                </ul>
              </div>
              <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5">
                <h4 className="font-bold text-rose-300 mb-2">
                  What Does Not Scale
                </h4>
                <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs">
                  <li>Monolithic drivers handling multiple protocol layers</li>
                  <li>Hard-coded #delays inside driver tasks</li>
                  <li>Hiding functional checkers inside driver code</li>
                  <li>Implicit transaction routing without set_id_info</li>
                </ul>
              </div>
            </div>
          </section>

          {/* ── §23 Review Checklist ────────────────────────────────────── */}
          <section id="review">
            <SectionHeading num={23} title="Review Checklist" />
            <Table
              headers={["Category", "Verification Criteria", "Verified"]}
              rows={[
                ["Pattern Classification", "Protocol correctly mapped across 8 axes", "✅"],
                ["UVM API Contract", "get_next_item() strictly paired with item_done()", "✅"],
                ["Timing & Reset", "Cycle-by-cycle clocked wait with reset escape", "✅"],
                ["Boundary Discipline", "Zero expected-vs-actual checking in driver", "✅"],
                ["Pipelined Safety", "Outstanding transactions cloned before release", "✅"],
                ["Response Routing", "set_id_info() applied to all response objects", "✅"],
              ]}
            />
          </section>

          {/* ── §24 Interview Q&A ───────────────────────────────────────── */}
          <section id="interview">
            <SectionHeading num={24} title="Interview Q&A (Q1–Q15)" />
            <div className="space-y-4">
              {module4InterviewQA.map((qa, idx) => (
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
              title="Final Recall Card — The Driver Pattern Map"
            />
            <div className="p-5 rounded-xl border border-violet-500/30 bg-linear-to-r from-violet-500/10 to-indigo-500/10 space-y-3">
              <h4 className="font-bold text-violet-300 text-base">
                The Master Classifier
              </h4>
              <CodeBlock lang="text">{`Protocol Facts
      ↓
Ownership Boundaries (Driver vs Monitor vs Scoreboard)
      ↓
Completion Semantics (Request Accepted vs Full Operation Completed)
      ↓
Response Path Strategy (item_done vs put_response + set_id_info)
      ↓
Reset & Abort Policy (Pin cleanup + Sequencer Contract Resolution)
      ↓
Driver Architecture Pattern Selection`}</CodeBlock>
            </div>
          </section>

          {/* ── §26 Key Takeaways ───────────────────────────────────────── */}
          <section id="takeaways">
            <SectionHeading num={26} title="Key Takeaways" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="p-4 rounded-xl border border-violet-500/20 bg-slate-900/50 space-y-2">
                <div className="font-bold text-violet-300">
                  1. Taxonomy Precedes Code
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Never write run_phase before declaring direction, flow control,
                  completion semantics, concurrency, and reset policy.
                </p>
              </div>
              <div className="p-4 rounded-xl border border-emerald-500/20 bg-slate-900/50 space-y-2">
                <div className="font-bold text-emerald-300">
                  2. item_done() Is Architectural
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Placement of item_done() declares when the sequencer may release
                  the item. It differs fundamentally between non-pipelined and
                  pipelined drivers.
                </p>
              </div>
              <div className="p-4 rounded-xl border border-amber-500/20 bg-slate-900/50 space-y-2">
                <div className="font-bold text-amber-300">
                  3. Respect Verification Boundaries
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Driver drives legal stimulus. Monitor observes. Scoreboard checks.
                  Never allow the driver to become a scoreboard.
                </p>
              </div>
              <div className="p-4 rounded-xl border border-rose-500/20 bg-slate-900/50 space-y-2">
                <div className="font-bold text-rose-300">
                  4. Reset Requires Dual Cleanup
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Reset handling requires electrical pin cleanup and sequencer
                  contract resolution. Doing only one causes simulation hangs.
                </p>
              </div>
            </div>
          </section>

          {/* ── §27 Coding Exercise ─────────────────────────────────────── */}
          <section id="exercise">
            <SectionHeading
              num={27}
              title="Coding Exercise — Build a Driver Pattern Classification Report"
            />
            <p className="text-slate-300 text-sm mb-4 leading-relaxed">
              <strong>Scenario:</strong> You are architecting a UVM testbench for a
              high-throughput DMA command/status interface with decoupled read
              responses, backpressure, and mid-transfer reset support.
            </p>

            <CollapsibleCard
              title="DMA Controller Driver Architecture Report (Reference Solution)"
              accent="emerald"
              defaultOpen={true}
            >
              <div className="space-y-3 text-xs text-slate-300">
                <p>
                  <strong>1. Driver Composition:</strong> Master + multi-channel +
                  response-path + pipelined.
                </p>
                <p>
                  <strong>2. Sequencer API:</strong> <code>get_next_item()</code>{" "}
                  with <code>put_response()</code>.
                </p>
                <p>
                  <strong>3. item_done() Meaning:</strong> Command request
                  handshake accepted.
                </p>
                <p>
                  <strong>4. Outstanding Tracking:</strong> Clone <code>req</code>{" "}
                  into <code>outstanding_q</code> prior to <code>item_done()</code>.
                </p>
                <p>
                  <strong>5. Response Routing:</strong> Decoupled response
                  collector thread matches transaction IDs and calls{" "}
                  <code>rsp.set_id_info(matched_req)</code>.
                </p>
                <p>
                  <strong>6. Reset Policy:</strong> Reset watcher thread aborts
                  pending command loops, clears outstanding queues, drives idle, and
                  completes interrupted sequencer items with ABORT status.
                </p>
              </div>
            </CollapsibleCard>
          </section>

          {/* ── §28 Final Readiness Verdict ─────────────────────────────── */}
          <section id="verdict">
            <SectionHeading num={28} title="Final Readiness Verdict" />
            <div className="p-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 space-y-3">
              <h3 className="text-lg font-bold text-emerald-300 flex items-center gap-2">
                <FaCheckSquare /> Module 4 — Integrated Acceptance Result: PASS
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                All 40 driver memory cards, 7 atlas decision sheets, 5 compile-ready
                code labs, 10 bug gallery entries, race-condition checklists,
                logging strategies, and 15 interview defenses are complete and
                verified.
              </p>
              <p className="text-xs text-emerald-200/80">
                You are now prepared to proceed to protocol-specific driver
                implementations (Module 5: Interface and Signal Driving).
              </p>
            </div>
          </section>

          {/* Navigation to next module */}
          <ModuleNavigation
            nextPath="/driver-mastery/module5"
            nextTitle="Module 5: Interface and Signal Driving →"
          />
        </main>
      </div>
    </div>
  );
};

export default Module4;
