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
// DATA — Memory Cards (20 Cards)
// ─────────────────────────────────────────────────────────────────────────────

const module10MemoryCards = [
  {
    title: "Card 1 — AXI4-Lite Is Not APB With More Signals [PROTOCOL]",
    accent: "blue",
    hook: "APB has one request path. AXI4-Lite has five handshake channels.",
    concept:
      "AXI4-Lite separates address, data, and response movement. A write is AW + W + B. A read is AR + R.",
    code: `case (req.kind)
  AXI4L_WRITE: drive_write(req, rsp, aborted);
  AXI4L_READ : drive_read (req, rsp, aborted);
endcase`,
    trap: "Calling item_done() after only address acceptance.",
    interview:
      "An AXI4-Lite write is complete only after both address and data are accepted and the write response is accepted.",
  },
  {
    title: "Card 2 — The Driver Owns Master Outputs Only [PROTOCOL]",
    accent: "rose",
    hook: "Master drives intent. Slave drives backpressure and response.",
    concept:
      "A master driver drives AWVALID/AWADDR/AWPROT, WVALID/WDATA/WSTRB, BREADY, ARVALID/ARADDR/ARPROT, and RREADY. It observes AWREADY/WREADY/BVALID/BRESP/ARREADY/RVALID/RDATA/RRESP.",
    code: `vif.drv_cb.awvalid <= 1'b1;

if (vif.drv_cb.awready) begin
  vif.drv_cb.awvalid <= 1'b0;
end`,
    trap: "Driving AWREADY in a master driver.",
    interview:
      "The AXI4-Lite master driver drives VALID on request channels and READY on response channels; the slave drives READY on request channels and VALID on response channels.",
  },
  {
    title: "Card 3 — AW and W Are Independent [PROTOCOL]",
    accent: "emerald",
    hook: "Address and data are siblings, not parent-child.",
    concept:
      "AXI4-Lite allows write address and write data handshakes to happen independently. A realistic driver should not force one channel to complete before the other.",
    code: `fork
  drive_aw(req, aw_aborted);
  drive_w (req, w_aborted);
join`,
    trap: "Driving WVALID only after AWREADY.",
    interview:
      "I fork AW and W inside one write item so the slave can accept address and data in either order.",
  },
  {
    title: "Card 4 — Write Completion Requires B [UVM]",
    accent: "violet",
    hook: "A write without BRESP is only launched, not completed.",
    concept:
      "AW and W transfer request information. B transfers the write response. The sequence item should not complete before BRESP is captured in a response-returning driver.",
    code: `drive_write(req, rsp, aborted);
seq_item_port.item_done(rsp);`,
    trap: "Calling item_done() after AW and W but before B.",
    interview:
      "AW/W acceptance means the request was accepted. B response means the write completed.",
  },
  {
    title: "Card 5 — Read Completion Requires R [UVM]",
    accent: "amber",
    hook: "AR asks. R answers.",
    concept:
      "AR launches the read request. R returns the read data and response.",
    code: `drive_ar(req, ar_aborted);
wait_r_response(rsp, r_aborted);`,
    trap: "Sampling RDATA during ARREADY.",
    interview:
      "Read data is valid only on the R-channel handshake, not on the AR-channel handshake.",
  },
  {
    title: "Card 6 — VALID Must Hold Payload Stable [WAVEFORM]",
    accent: "blue",
    hook: "VALID is a promise: this payload stays until accepted.",
    concept:
      "Once the driver asserts AWVALID, WVALID, or ARVALID, the associated payload must remain stable until the handshake.",
    code: `vif.drv_cb.wdata  <= req.data;
vif.drv_cb.wstrb  <= req.strb;
vif.drv_cb.wvalid <= 1'b1;

do begin
  @(vif.drv_cb);
end while (vif.ARESETn && vif.drv_cb.wready !== 1'b1);`,
    trap: "Changing WDATA while WVALID=1 and WREADY=0.",
    interview:
      "Backpressure stalls transfer; it does not permit payload mutation.",
  },
  {
    title: "Card 7 — BREADY and RREADY Are Driver Policy Signals [PROTOCOL]",
    accent: "emerald",
    hook: "READY says: I can accept the answer now.",
    concept:
      "The master driver owns BREADY and RREADY. This module asserts them only while waiting for the matching response.",
    code: `vif.drv_cb.bready <= 1'b1;
// wait for BVALID`,
    trap: "Leaving BREADY=0 forever.",
    interview:
      "The response channel also uses valid/ready. The master must assert READY to complete the response transfer.",
  },
  {
    title: "Card 8 — Response Capture Is Driver Work [UVM]",
    accent: "violet",
    hook: "The driver is not a checker, but it must bring the answer back.",
    concept:
      "The driver captures protocol responses because they are part of the bus completion contract. It does not judge functional correctness.",
    code: `rsp.resp = axi4l_resp_e'(vif.drv_cb.bresp);
rsp.set_id_info(req);`,
    trap: "Ignoring BRESP and RRESP.",
    interview:
      "Capturing response is driver responsibility; deciding expected versus unexpected is scoreboard responsibility.",
  },
  {
    title: "Card 9 — item_done() Means UVM Contract Complete [UVM]",
    accent: "rose",
    hook: "item_done() unlocks the sequencer.",
    concept:
      "With get_next_item(), the driver must call item_done() exactly once for each item. In this module, item_done() means full AXI4-Lite transaction completion or reset abort.",
    code: `seq_item_port.get_next_item(req);
drive_one(req, rsp);
seq_item_port.item_done(rsp);`,
    trap: "Calling item_done() before B or R.",
    interview:
      "I define item completion at response completion, not request launch, unless I am explicitly building a pipelined driver.",
  },
  {
    title: "Card 10 — set_id_info(req) Routes Responses [UVM]",
    accent: "amber",
    hook: "A response without ID info has no return address.",
    concept:
      "A response object is separate from the request. It must inherit sequence/transaction routing information.",
    code: `rsp = item_t::type_id::create("rsp");
rsp.copy(req);
rsp.set_id_info(req);`,
    trap: "Creating rsp and calling item_done(rsp) without set_id_info(req).",
    interview:
      "set_id_info(req) lets the sequencer route the response back to the originating sequence.",
  },
  {
    title: "Card 11 — Sequential Driver Is Safe But Lower Throughput [ARCH]",
    accent: "blue",
    hook: "One item in, one full transaction out.",
    concept:
      "A conservative AXI4-Lite driver processes one sequence item at a time. This is common for register access and bring-up.",
    code: `forever begin
  seq_item_port.get_next_item(req);
  drive_one(req, rsp);
  seq_item_port.item_done(rsp);
end`,
    trap: "Calling a one-item-at-a-time driver 'pipelined.'",
    interview:
      "For AXI4-Lite register traffic, a one-item-at-a-time driver is often sufficient, but it must document its concurrency limits.",
  },
  {
    title: "Card 12 — Forked AW/W Is Not Full Pipelining [ARCH]",
    accent: "emerald",
    hook: "Parallel channels inside one item are not multiple outstanding items.",
    concept:
      "Forking AW and W lets the two request channels complete independently for one write item. It does not allow the next item to start before B.",
    code: `fork
  drive_aw(req, aw_aborted);
  drive_w (req, w_aborted);
join

wait_b_response(rsp, b_aborted);`,
    trap: "Confusing channel concurrency with outstanding transaction management.",
    interview:
      "Forking AW/W improves protocol realism without changing the one-item-at-a-time UVM completion model.",
  },
  {
    title: "Card 13 — Reset Must Complete or Abort the UVM Item [RESET]",
    accent: "rose",
    hook: "Reset cannot leave the sequencer hostage.",
    concept:
      "If reset occurs during active driving, the driver must clean pins and complete the UVM-side item contract.",
    code: `rsp.aborted = 1'b1;
seq_item_port.item_done(rsp);`,
    trap: "Returning from the drive task without item_done().",
    interview:
      "A reset policy must handle both pin cleanup and sequencer unblocking.",
  },
  {
    title: "Card 14 — Clocking Blocks Reduce Driver/DUT Races [RACE]",
    accent: "violet",
    hook: "Do not fight the DUT in the active region.",
    concept:
      "Clocking blocks define how the driver samples DUT outputs and drives DUT inputs relative to the clocking event.",
    code: `clocking drv_cb @(posedge ACLK);
  default input #1step output #0;
  output awvalid, awaddr, awprot;
  input  awready;
endclocking`,
    trap: "Driving and sampling raw signals at @(posedge clk) with simulator-order dependence.",
    interview:
      "I use clocking blocks to make sampling and driving timing explicit and reduce simulator race risk.",
  },
  {
    title: "Card 15 — Do Not Turn Driver Into Scoreboard [BOUNDARY]",
    accent: "amber",
    hook: "The driver transports. The scoreboard judges.",
    concept:
      "The driver captures RDATA, but it must not decide whether the value is correct.",
    code: `rsp.rdata = vif.drv_cb.rdata; // capture only`,
    trap: "Hardcoding expected register values inside the driver.",
    interview:
      "Protocol response capture belongs in the driver; functional correctness belongs in the scoreboard or register model.",
  },
  {
    title: "Card 16 — WSTRB Is Part of Write Intent [PROTOCOL]",
    accent: "blue",
    hook: "Data says what. Strobe says which bytes.",
    concept:
      "WSTRB must be driven with WDATA and held stable while stalled.",
    code: `vif.drv_cb.wdata <= req.data;
vif.drv_cb.wstrb <= req.strb;`,
    trap: "Always forcing all strobes high and hiding byte-write bugs.",
    interview:
      "An AXI4-Lite write driver must preserve byte-lane intent through WSTRB.",
  },
  {
    title: "Card 17 — Reserved/Error Responses Are Observations [PROTOCOL]",
    accent: "emerald",
    hook: "A non-OKAY response is not automatically a driver failure.",
    concept:
      "The driver captures all 2-bit response values. Whether a response is legal for a transaction is checked elsewhere.",
    code: `rsp.resp = axi4l_resp_e'(vif.drv_cb.rresp);`,
    trap: "Calling uvm_fatal inside the driver on every SLVERR.",
    interview:
      "The driver reports response values; the scoreboard or test intent decides whether they are expected.",
  },
  {
    title: "Card 18 — Timeout Is Verification Policy [ARCH]",
    accent: "rose",
    hook: "AXI handshakes can stall; your environment may choose not to wait forever.",
    concept:
      "AXI4-Lite itself does not define a universal timeout. A driver may implement a configurable watchdog to prevent infinite simulation hangs.",
    code: `if (cfg.max_wait_cycles > 0 && wait_count > cfg.max_wait_cycles) begin
  \`uvm_error("AXI4L_TIMEOUT", "AWREADY timeout by TB policy")
end`,
    trap: "Describing every long wait as an AXI protocol violation.",
    interview:
      "Timeouts are verification-environment policy, not inherent AXI4-Lite protocol rules.",
  },
  {
    title: "Card 19 — Read and Write Can Be Concurrent at Interface Level [PROTOCOL]",
    accent: "violet",
    hook: "The protocol is more concurrent than a simple driver.",
    concept:
      "AXI4-Lite read and write channels are independent. This module's driver serializes sequence items, but that is a driver contract, not a protocol limit.",
    code: `// Module 10 contract:
drive_one_item_at_a_time();`,
    trap: "Claiming AXI4-Lite cannot overlap read and write because your driver does not.",
    interview:
      "My driver contract may serialize accesses, but the protocol has independent read and write paths.",
  },
  {
    title: "Card 20 — Document Simplified Driver Limits [ARCH]",
    accent: "amber",
    hook: "A limited driver is acceptable. An undocumented limited driver is dangerous.",
    concept:
      "A serialized AXI4-Lite driver is useful for register access. It is not sufficient to fully stress concurrent read/write behavior.",
    code: `// Contract: one outstanding sequence item at a time.`,
    trap: "Using a serialized driver to claim full AXI4-Lite concurrency coverage.",
    interview:
      "I document whether the driver is protocol-realistic, serialized, or intended only for RAL/register access.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// DATA — Bug Gallery (10 Bugs)
// ─────────────────────────────────────────────────────────────────────────────

const module10BugGallery = [
  {
    title: "Bug 1 — item_done() After AW Only",
    symptom:
      "The sequence sends the next item while current write data and response are still pending on the bus.",
    waveform:
      "AWVALID/AWREADY handshakes, then next AWVALID appears before previous W and B complete.",
    cause: "The driver confused address acceptance with write transaction completion.",
    bad: `seq_item_port.get_next_item(req);
drive_aw(req, aborted);
seq_item_port.item_done(); // BUG: Completed after AW only!`,
    fix: `drive_write(req, rsp, aborted);
seq_item_port.item_done(rsp); // Completed after AW + W + B`,
    interview:
      "AW only transfers address. A write is incomplete until W and B complete.",
  },
  {
    title: "Bug 2 — Ignoring BRESP",
    symptom:
      "Negative tests pass falsely even when the DUT returns SLVERR or DECERR.",
    waveform: "BVALID=1, BRESP=2'b10 (SLVERR), but sequence receives no response information.",
    cause: "Driver failed to capture protocol response into the response item.",
    bad: `wait(vif.drv_cb.bvalid);
seq_item_port.item_done(); // BUG: BRESP dropped!`,
    fix: `rsp.resp = axi4l_resp_e'(vif.drv_cb.bresp);
seq_item_port.item_done(rsp);`,
    interview:
      "The driver must capture response fields; the scoreboard decides whether the response was expected.",
  },
  {
    title: "Bug 3 — Sampling RDATA on AR Handshake",
    symptom: "Read data is stale, X, or from a previous transaction.",
    waveform: "ARVALID/ARREADY occurs several cycles before RVALID.",
    cause: "The driver sampled read data before the read data channel handshake.",
    bad: `if (vif.drv_cb.arready) begin
  rsp.rdata = vif.drv_cb.rdata; // BUG: Sampled on AR, not R!
end`,
    fix: `wait_r_response(rsp, aborted); // Samples RDATA on RVALID && RREADY`,
    interview:
      "AR is the request. R is the response. Read data is valid only on R handshake.",
  },
  {
    title: "Bug 4 — Changing Payload While Stalled",
    symptom: "Slave receives unexpected or corrupted write data.",
    waveform: "WVALID=1, WREADY=0, WDATA changes every clock cycle.",
    cause: "Violation of valid/ready payload stability rule.",
    bad: `while (!vif.drv_cb.wready) begin
  vif.drv_cb.wdata <= $urandom(); // BUG: Mutating payload during stall!
  @(vif.drv_cb);
end`,
    fix: `vif.drv_cb.wdata  <= req.data;
vif.drv_cb.wstrb  <= req.strb;
vif.drv_cb.wvalid <= 1'b1;

do begin
  @(vif.drv_cb);
end while (vif.drv_cb.wready !== 1'b1);`,
    interview:
      "VALID freezes payload until READY accepts it.",
  },
  {
    title: "Bug 5 — No set_id_info(req)",
    symptom:
      "Bus waveform is correct, but sequence response handling is broken or uncorrelated.",
    waveform: "No bus-level clue. The failure is in UVM response routing.",
    cause: "Response object lacks request sequence/transaction routing information.",
    bad: `rsp = item_t::type_id::create("rsp");
rsp.resp = AXI4L_RESP_OKAY;
seq_item_port.item_done(rsp); // BUG: Missing set_id_info(req)!`,
    fix: `rsp.set_id_info(req);
seq_item_port.item_done(rsp);`,
    interview:
      "The bus can be correct while UVM response routing is broken.",
  },
  {
    title: "Bug 6 — Reset Drops Active Item Without Completion",
    symptom: "Simulation hangs after reset.",
    waveform: "Bus goes idle, but the sequence never advances.",
    cause: "Driver abandoned the active item without calling item_done().",
    bad: `if (!vif.ARESETn) begin
  reset_outputs();
  return; // BUG: item_done skipped!
end`,
    fix: `rsp.aborted = 1'b1;
seq_item_port.item_done(rsp); // Releases sequencer cleanly`,
    interview:
      "Reset cleanup must include UVM-side item completion or explicit sequence termination.",
  },
  {
    title: "Bug 7 — Driver Drives AWREADY",
    symptom:
      "Multiple-driver conflict, X propagation, or DUT output masked.",
    waveform: "AWREADY does not match DUT logic or becomes X.",
    cause: "Master driver drove a slave-owned signal.",
    bad: `vif.awready = 1'b1; // BUG: Illegal master-driver ownership!`,
    fix: `if (vif.drv_cb.awready) begin
  // accepted - observe only
end`,
    interview:
      "A master driver never drives slave READY on request channels.",
  },
  {
    title: "Bug 8 — Permanent BREADY=0",
    symptom: "DUT holds BVALID; write transaction never completes.",
    waveform: "BVALID=1 forever, BREADY=0 forever.",
    cause: "Driver waited for write response but never asserted ready to accept it.",
    bad: `vif.drv_cb.bready <= 1'b0;
wait(vif.drv_cb.bvalid); // BUG: BREADY never asserted!`,
    fix: `vif.drv_cb.bready <= 1'b1;

do begin
  @(vif.drv_cb);
end while (vif.drv_cb.bvalid !== 1'b1);`,
    interview:
      "The response channel is also valid/ready. The master must assert READY to complete it.",
  },
  {
    title: "Bug 9 — Treating Timeout as Protocol Failure",
    symptom: "False test failures on legal slow or heavily backpressured slaves.",
    waveform: "AWVALID remains stable; AWREADY is delayed beyond an arbitrary count.",
    cause: "Driver confused testbench watchdog policy with AXI4-Lite protocol.",
    bad: `repeat (10) @(vif.drv_cb);

if (!vif.drv_cb.awready) begin
  \`uvm_fatal("AXI", "Protocol violation") // BUG: Slave latency is legal!
end`,
    fix: `if (cfg.max_wait_cycles > 0 && wait_count > cfg.max_wait_cycles) begin
  \`uvm_error("AXI4L_TIMEOUT", "AWREADY timeout by verification policy")
end`,
    interview:
      "AXI4-Lite does not define a universal timeout. The verification environment may add one.",
  },
  {
    title: "Bug 10 — Masking X/Z Response Values With 2-State Enum",
    symptom:
      "The DUT or interface produces X/Z on BRESP or RRESP, but the sequence receives a legal-looking response value.",
    waveform: "BVALID && BREADY or RVALID && RREADY is true, but response bits contain X/Z.",
    cause: "The driver cast a 4-state bus signal into a 2-state enum, masking unknowns.",
    bad: `typedef enum bit [1:0] {
  AXI4L_RESP_OKAY   = 2'b00,
  AXI4L_RESP_SLVERR = 2'b10
} axi4l_resp_e;

rsp.resp = axi4l_resp_e'(vif.drv_cb.bresp); // BUG: X converts to 0!`,
    fix: `typedef enum logic [1:0] {
  AXI4L_RESP_OKAY        = 2'b00,
  AXI4L_RESP_RESERVED_01 = 2'b01,
  AXI4L_RESP_SLVERR      = 2'b10,
  AXI4L_RESP_DECERR      = 2'b11
} axi4l_resp_e;

if ($isunknown(vif.drv_cb.bresp)) begin
  \`uvm_error("AXI4L_BRESP_X", "B response contains X/Z")
  rsp.aborted = 1'b1;
end
else begin
  rsp.resp = axi4l_resp_e'(vif.drv_cb.bresp);
end`,
    interview:
      "In verification code, response fields should not silently collapse X/Z into legal 2-state values. I either preserve 4-state information or explicitly flag unknown protocol responses at the sampling point.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// DATA — Interview Q&A (13 Questions)
// ─────────────────────────────────────────────────────────────────────────────

const module10InterviewQA = [
  {
    q: "Q1. What makes AXI4-Lite harder than APB for driver design?",
    short:
      "AXI4-Lite has independent valid/ready channels. APB has a simpler setup/access flow.",
    deep: "An AXI4-Lite write is split across AW, W, and B. AW and W can handshake independently, and B completes the write. A driver that treats AXI4-Lite like APB forces artificial ordering and misses protocol corner cases.",
    followup: "Can AW and W complete in either order?",
    answer: "Yes. A realistic driver should not assume fixed ordering.",
    code: `fork
  drive_aw(req, aw_aborted);
  drive_w (req, w_aborted);
join`,
  },
  {
    q: "Q2. When should item_done() be called for an AXI4-Lite write?",
    short: "After AW handshake, W handshake, and B response handshake.",
    deep: "item_done() tells the sequencer the request is complete. In a non-pipelined response-returning driver, the write is not complete until BRESP is captured.",
    followup: "What if I call it after AW/W?",
    answer:
      "The sequence may issue the next item before write response status is known, leading to race conditions.",
    code: null,
  },
  {
    q: "Q3. When should item_done() be called for an AXI4-Lite read?",
    short: "After R handshake and after capturing RDATA/RRESP.",
    deep: "AR launches the read request. R returns the data and response. Completing before R means the sequence cannot safely consume the read result.",
    followup: null,
    answer: null,
    code: null,
  },
  {
    q: "Q4. Why does the driver need set_id_info(req)?",
    short: "To route the response back to the originating sequence.",
    deep: "The response is a new object. It must inherit sequence and transaction identity from the request so UVM response routing works.",
    followup: null,
    answer: null,
    code: `rsp.set_id_info(req);`,
  },
  {
    q: "Q5. Should the AXI4-Lite driver check read data correctness?",
    short: "No.",
    deep: "The driver captures RDATA. The scoreboard or register model checks whether the value is correct.",
    followup: null,
    answer: null,
    code: null,
  },
  {
    q: "Q6. What should the driver do with SLVERR?",
    short: "Capture it and return it in rsp.",
    deep: "SLVERR may be expected in negative tests. The driver should not fatal by default. The scoreboard/test decides whether the response is legal.",
    followup: null,
    answer: null,
    code: null,
  },
  {
    q: "Q7. Why use clocking blocks?",
    short: "To reduce races between driver activity and DUT sampling.",
    deep: "Clocking blocks define input and output timing relative to the clock event. They reduce active-region ordering dependence.",
    followup: null,
    answer: null,
    code: null,
  },
  {
    q: "Q8. Is a sequential AXI4-Lite driver wrong?",
    short: "No, if documented.",
    deep: "A one-item-at-a-time driver is acceptable for register access and bring-up. It is weak for concurrency stress. The limitation must be explicit.",
    followup: null,
    answer: null,
    code: null,
  },
  {
    q: "Q9. Why fork AW and W?",
    short: "Because they are independent channels.",
    deep: "Forking allows address and data to be presented independently and accepted in either order. It improves protocol realism without requiring full outstanding tracking.",
    followup: null,
    answer: null,
    code: null,
  },
  {
    q: "Q10. What happens if reset occurs during an active item?",
    short:
      "The driver cleans pins, marks the response aborted, and calls item_done(rsp).",
    deep: "The driver must avoid both bus corruption and sequencer deadlock. Reset policy must handle the active UVM item.",
    followup: null,
    answer: null,
    code: null,
  },
  {
    q: "Q11. Can the driver keep BREADY and RREADY high all the time?",
    short: "Yes, if the architecture safely maps responses.",
    deep: "For a simple one-item-at-a-time driver, asserting ready only while waiting for the response is easier. Always-ready response channels are useful in more aggressive drivers but require careful response ownership.",
    followup: null,
    answer: null,
    code: null,
  },
  {
    q: "Q12. What is the biggest AXI4-Lite driver interview trap?",
    short: "Calling item_done() too early.",
    deep: "Many candidates complete the item after address acceptance. That shows they do not understand request acceptance versus transaction completion.",
    followup: null,
    answer: null,
    code: null,
  },
  {
    q: "Q13. Why should AXI response enums avoid 2-state masking?",
    short:
      "Because X/Z response values can be silently converted into legal-looking 2-state values.",
    deep: "BRESP and RRESP are interface signals. During reset bugs, X propagation, uninitialized DUT logic, or interface contention, those signals may contain unknowns. If the driver casts them into a bit [1:0] enum, the unknown information can be lost. A verification driver should either preserve 4-state response information or explicitly check $isunknown() before casting.",
    followup: "Should the driver fatal on X response?",
    answer:
      "Not by default. It should report an error, mark the response aborted or invalid according to environment policy, and avoid pretending the response was clean.",
    code: `if ($isunknown(vif.drv_cb.rresp)) begin
  \`uvm_error("AXI4L_RRESP_X", "R response contains X/Z")
  rsp.aborted = 1'b1;
end
else begin
  rsp.resp = axi4l_resp_e'(vif.drv_cb.rresp);
end`,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// DATA — Sections for Sidebar Navigation
// ─────────────────────────────────────────────────────────────────────────────

const module10Sections = [
  { id: "identity", label: "Module Identity" },
  { id: "learning-objectives", label: "1. Learning Objectives" },
  { id: "how-to-use", label: "2. How to Use This Module" },
  { id: "visual-tag-legend", label: "3. Visual Tag Legend" },
  { id: "acceptance-checklist", label: "4. Acceptance Checklist" },
  { id: "scope", label: "5. Scope and Non-Scope" },
  { id: "protocol-mental-model", label: "6. Protocol Mental Model" },
  { id: "timing-waveform", label: "7. Timing / Waveform Contract" },
  { id: "driver-boundary", label: "8. Driver Responsibility Boundary" },
  { id: "ssd-contract", label: "9. Sequence-Sequencer-Driver Contract" },
  { id: "reset-abort", label: "10. Reset / Abort Policy" },
  { id: "response-policy", label: "11. Response / Completion Policy" },
  { id: "ownership-matrix", label: "12. Protocol Ownership Matrix" },
  { id: "memory-cards", label: "13. Memory Cards (1–20)" },
  { id: "atlas-sheets", label: "14. Atlas Sheets (1–5)" },
  { id: "code-labs", label: "15. Code Labs (1–3)" },
  { id: "bug-gallery", label: "16. Bug Gallery (1–10)" },
  { id: "race-checklist", label: "17. Race-Condition Checklist" },
  { id: "debug-strategy", label: "18. Debug Instrumentation & Log Strategy" },
  { id: "boundary", label: "19. Monitor / Scoreboard Boundary" },
  { id: "architecture", label: "20. Architectural Decision Points" },
  { id: "scalability", label: "21. Scalability Notes" },
  { id: "review-checklist", label: "22. Review Checklist" },
  { id: "interview-qa", label: "23. Interview Q&A (Q1–Q13)" },
  { id: "final-recall", label: "24. Final Recall Card" },
  { id: "key-takeaways", label: "25. Key Takeaways" },
  { id: "interview-questions", label: "26. Interview Questions" },
  { id: "coding-exercise", label: "27. Coding Exercise" },
  { id: "final-verdict", label: "28. Final Readiness Verdict" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT — Module 10
// ═══════════════════════════════════════════════════════════════════════════════

const Module10 = () => {
  return (
    <div className="relative min-h-screen bg-slate-950 text-white font-sans">
      {/* Background glow & grid */}
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-150 h-62.5 bg-linear-to-r from-blue-600/15 to-indigo-600/15 blur-[100px] rounded-full" />

      <div className="relative z-10 flex max-w-7xl mx-auto">
        {/* ── Sidebar TOC (desktop) ────────────────────────────────────── */}
        <ModuleSidebar
          moduleNumber="10"
          title="AXI4-Lite Driver Deep Dive"
          sections={module10Sections}
        />

        {/* ── Main Content ─────────────────────────────────────────────── */}
        <main className="flex-1 min-w-0 px-6 py-8 pb-24 max-w-4xl">
          {/* Mobile back */}
          <BackToHomeBtn to="/driver-mastery" />

          {/* Hero */}
          <ModuleHero
            moduleNumber="10"
            title="AXI4-Lite Driver Deep Dive"
            description="Master AXI4-Lite master driver implementation, five-channel valid/ready timing, forked AW/W request handling, response capture (BRESP/RRESP/RDATA), reset/abort policy, and UVM sequencer-driver completion semantics."
            metadata={[
              ["Module", "10"],
              ["Reference", "UVM 1.2 / AXI4-Lite"],
              ["Pattern", "Five-Channel Valid/Ready Master Driver"],
              ["Roadmap", "After Module 9 (Streaming), before Module 11 (Multi-Channel/Pipelined)"],
            ]}
          />

          {/* ── Identity ────────────────────────────────────────────────── */}
          <section id="identity">
            <SectionHeading num={null} title="Module Identity" />
            <div className="rounded-xl border border-slate-700/60 bg-slate-900/50 p-5 space-y-3 mb-6">
              <Table
                headers={["Field", "Value"]}
                rows={[
                  ["Module Number", "10"],
                  ["Module Title", "AXI4-Lite Driver Deep Dive"],
                  ["Course Track", "UVM Driver Mastery"],
                  ["Primary Skill", "Building a correct AXI4-Lite master driver"],
                  ["Reference Style", "UVM 1.2"],
                  ["Difficulty", "Intermediate → Senior"],
                  [
                    "Core Pattern",
                    "Transaction intent → AXI4-Lite five-channel timing → response capture → sequencer completion",
                  ],
                ]}
              />
            </div>
          </section>

          {/* ── §1 Learning Objectives ──────────────────────────────────── */}
          <section id="learning-objectives">
            <SectionHeading num={1} title="Learning Objectives" />
            <ol className="space-y-2 list-decimal list-inside text-slate-300 text-sm leading-relaxed">
              {[
                "Explain AXI4-Lite as a five-channel valid/ready protocol.",
                "Implement a UVM AXI4-Lite master driver for AW, W, B, AR, and R channels.",
                "Correctly separate request launch, channel acceptance, response completion, and sequence item completion.",
                "Build a conservative one-item-at-a-time AXI4-Lite master driver.",
                "Allow AW and W to handshake independently inside one write item.",
                "Capture BRESP, RRESP, and RDATA into response objects.",
                "Use get_next_item() and item_done() correctly.",
                "Use set_id_info(req) when returning responses.",
                "Handle reset during an active transaction without deadlocking the sequence.",
                "Debug common AXI4-Lite driver failures from waveform signatures.",
              ].map((obj, i) => (
                <li key={i} className="pl-2">
                  {obj}
                </li>
              ))}
            </ol>
          </section>

          {/* ── §2 How to Use This Module ───────────────────────────────── */}
          <section id="how-to-use">
            <SectionHeading num={2} title="How to Use This Module" />
            <div className="space-y-4 text-sm text-slate-300">
              <ol className="list-decimal list-inside space-y-1.5 text-xs">
                <li>Protocol mental model — understand the five channels.</li>
                <li>Timing contract — understand valid/ready stability and sampling.</li>
                <li>Driver contract — define when the driver may call item_done().</li>
                <li>Memory cards — revise one technical unit at a time.</li>
                <li>Code labs — implement the interface, item, and driver.</li>
                <li>Bug gallery — memorize real failure signatures.</li>
                <li>Interview Q&amp;A — practice senior-level explanations.</li>
              </ol>

              <Callout type="warning">
                <strong>Core warning:</strong> Do not jump directly to code. AXI4-Lite driver bugs usually come from wrong completion policy, wrong signal ownership, or fake APB-style assumptions.
              </Callout>
            </div>
          </section>

          {/* ── §3 Visual Tag Legend ───────────────────────────────────── */}
          <section id="visual-tag-legend">
            <SectionHeading num={3} title="Visual Tag Legend" />
            <Table
              headers={["Tag", "Meaning"]}
              rows={[
                ["[PROTOCOL]", "AXI4-Lite bus behavior"],
                ["[WAVEFORM]", "Cycle-level timing rule"],
                ["[UVM]", "UVM driver/sequencer mechanics"],
                ["[RESET]", "Reset/abort behavior"],
                ["[RACE]", "Simulator race or sampling issue"],
                ["[BUG]", "Common bad implementation"],
                ["[INTERVIEW]", "Interview-ready explanation"],
                ["[BOUNDARY]", "What belongs outside the driver"],
                ["[ARCH]", "Senior/principal architecture decision"],
              ]}
            />
          </section>

          {/* ── §4 Module-Specific Acceptance Checklist ─────────────────── */}
          <section id="acceptance-checklist">
            <SectionHeading
              num={4}
              title="Module-Specific Acceptance Checklist"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-300">
              {[
                "AXI4-Lite is taught as a five-channel valid/ready protocol.",
                "The module does not collapse AXI4-Lite into APB-style sequencing.",
                "AW and W may complete in either order.",
                "Write completion is not declared until B response is accepted.",
                "Read completion is not declared until R data/response is accepted.",
                "BRESP and RRESP are captured by the driver.",
                "RDATA is captured only on R-channel handshake.",
                "Driver drives DUT inputs only.",
                "Driver observes DUT outputs only where the protocol requires it.",
                "get_next_item() is paired with exactly one item_done().",
                "get() is not mixed with item_done().",
                "Response objects use set_id_info(req).",
                "Reset during transaction has a deterministic cleanup policy.",
                "Code examples use UVM 1.2-compatible style.",
                "No non-standard UVM APIs are used.",
                "Driver does not become scoreboard, monitor, or assertion engine.",
                "Race-condition risks are explicitly covered.",
                "Debug logs expose request launch, channel acceptance, response completion, reset abort, and timeout policy.",
                "Architectural tradeoffs are explained.",
                "Simplified-driver limitations are documented.",
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

          {/* ── §5 Scope and Non-Scope ─────────────────────────────────── */}
          <section id="scope">
            <SectionHeading num={5} title="Scope and Non-Scope" />
            <div className="space-y-4 text-sm">
              <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5">
                <h4 className="font-bold text-blue-300 mb-2">5.1 In Scope</h4>
                <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs">
                  <li>AXI4-Lite master driver behavior</li>
                  <li>Single-beat read/write transactions</li>
                  <li>Five independent valid/ready channels</li>
                  <li>Conservative one-item-at-a-time driver architecture</li>
                  <li>Forked AW/W handling inside a write transaction</li>
                  <li>BRESP, RRESP, and RDATA capture</li>
                  <li>Reset cleanup and UVM item abortion</li>
                  <li>Driver/sequencer completion contract</li>
                  <li>Common implementation bugs</li>
                  <li>Senior-level architecture tradeoffs</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/40">
                <h4 className="font-bold text-slate-300 mb-2">
                  5.2 Non-Scope
                </h4>
                <Table
                  headers={["Topic", "Reason"]}
                  rows={[
                    ["AXI4 bursts", "Full AXI4 topic, not AXI4-Lite"],
                    ["AXI IDs", "AXI4-Lite has no ID signals"],
                    ["Out-of-order completion", "Later pipelined/multi-channel module"],
                    ["AXI Stream", "Different protocol family"],
                    ["AXI slave responder", "Later slave/reactive driver module"],
                    ["Full outstanding transaction manager", "Module 11 territory"],
                    ["Full assertion library", "Boundary explained only"],
                    ["Scoreboard prediction model", "Boundary explained only"],
                    ["RAL frontdoor adapter implementation", "Later RAL module"],
                  ]}
                />
              </div>

              <Callout type="concept">
                <strong>Boundary Note:</strong> AXI4-Lite is often used for register access, but it is not APB. A driver that forces APB-like timing hides real channel-ordering bugs.
              </Callout>
            </div>
          </section>

          {/* ── §6 Protocol Mental Model ───────────────────────────────── */}
          <section id="protocol-mental-model">
            <SectionHeading num={6} title="Protocol Mental Model" />
            <div className="space-y-4 text-sm text-slate-300">
              <p>AXI4-Lite has five logical channels:</p>
              <Table
                headers={["Channel", "Direction", "Driver Role"]}
                rows={[
                  ["AW", "Master → Slave", "Drive write address/control"],
                  ["W", "Master → Slave", "Drive write data/strobes"],
                  ["B", "Slave → Master", "Accept write response"],
                  ["AR", "Master → Slave", "Drive read address/control"],
                  ["R", "Slave → Master", "Accept read data/response"],
                ]}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/40">
                  <h5 className="font-bold text-emerald-300 text-xs mb-1">
                    Write Transaction Formula
                  </h5>
                  <CodeBlock lang="text">{`WRITE = AW accepted + W accepted + B response accepted`}</CodeBlock>
                </div>
                <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/40">
                  <h5 className="font-bold text-blue-300 text-xs mb-1">
                    Read Transaction Formula
                  </h5>
                  <CodeBlock lang="text">{`READ = AR accepted + R response accepted`}</CodeBlock>
                </div>
              </div>

              <p className="text-xs text-slate-300">
                AXI4-Lite is single-beat. There is no burst loop, no WLAST, no AWLEN, no ARLEN, and no ID matching in the basic AXI4-Lite interface.
              </p>

              <div className="p-4 rounded-xl border border-violet-500/20 bg-violet-500/5 text-xs space-y-2">
                <h5 className="font-bold text-violet-300">Correct Channel Independence Model</h5>
                <p>
                  The driver must not assume AW always completes before W or W always completes before AW. AW and W are independent channels. The write transaction completes only after both request channels complete and the B response is accepted.
                </p>
              </div>
            </div>
          </section>

          {/* ── §7 Timing / Waveform Contract ──────────────────────────── */}
          <section id="timing-waveform">
            <SectionHeading num={7} title="Timing / Waveform Contract" />
            <div className="space-y-4 text-sm text-slate-300">
              <h4 className="font-bold text-blue-300 text-base">
                7.1 Valid/Ready Acceptance Rule
              </h4>
              <p className="text-xs">
                A channel transfer is accepted on a rising clock edge when <code>VALID &amp;&amp; READY</code> is true.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-900/60 border border-slate-700/60 rounded-lg space-y-1">
                  <strong className="text-emerald-300">7.2 AW Channel:</strong>
                  <p>AWADDR/AWPROT must remain stable while AWVALID=1 and AWREADY=0. AW handshake occurs when AWVALID &amp;&amp; AWREADY is sampled true.</p>
                </div>
                <div className="p-3 bg-slate-900/60 border border-slate-700/60 rounded-lg space-y-1">
                  <strong className="text-emerald-300">7.3 W Channel:</strong>
                  <p>WDATA/WSTRB must remain stable while WVALID=1 and WREADY=0. W handshake occurs when WVALID &amp;&amp; WREADY is sampled true.</p>
                </div>
                <div className="p-3 bg-slate-900/60 border border-slate-700/60 rounded-lg space-y-1">
                  <strong className="text-violet-300">7.4 B Response Channel:</strong>
                  <p>B response is accepted when BVALID &amp;&amp; BREADY is sampled true. Driver samples BRESP on that handshake.</p>
                </div>
                <div className="p-3 bg-slate-900/60 border border-slate-700/60 rounded-lg space-y-1">
                  <strong className="text-blue-300">7.5 AR Channel:</strong>
                  <p>ARADDR/ARPROT must remain stable while ARVALID=1 and ARREADY=0. AR handshake occurs when ARVALID &amp;&amp; ARREADY is sampled true.</p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/40 text-xs space-y-2">
                <h5 className="font-bold text-amber-300">
                  7.7 Conservative Clocking-Block Timing
                </h5>
                <CodeBlock lang="systemverilog">{`clocking drv_cb @(posedge ACLK);
  default input #1step output #0;
  // ...
endclocking`}</CodeBlock>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  <li>DUT outputs are sampled just before the clocking event.</li>
                  <li>Driver outputs are driven at the clocking event through clocking-block semantics.</li>
                  <li>The gain is race reduction and simulator portability across tools.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* ── §8 Driver Responsibility Boundary ───────────────────────── */}
          <section id="driver-boundary">
            <SectionHeading
              num={8}
              title="Driver Responsibility Boundary"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
              <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                <h4 className="font-bold text-emerald-300 mb-2">Driver Owns</h4>
                <Table
                  headers={["Item", "Driver Responsibility"]}
                  rows={[
                    ["AWVALID", "Assert until AWREADY handshake"],
                    ["AWADDR / AWPROT", "Hold stable while stalled"],
                    ["WVALID", "Assert until WREADY handshake"],
                    ["WDATA / WSTRB", "Hold stable while stalled"],
                    ["BREADY", "Assert when ready to accept write response"],
                    ["ARVALID / ARADDR", "Assert & hold until ARREADY handshake"],
                    ["RREADY", "Assert when ready to accept read response"],
                    ["Response capture", "Capture BRESP, RRESP, RDATA"],
                    ["UVM completion", "Call item_done() only after transaction complete/abort"],
                  ]}
                />
              </div>

              <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/40">
                <h4 className="font-bold text-slate-300 mb-2">
                  Driver Does Not Own
                </h4>
                <Table
                  headers={["Item", "Owner"]}
                  rows={[
                    ["Functional correctness of read data", "Scoreboard / register model"],
                    ["Expected response legality", "Scoreboard / test intent"],
                    ["Register prediction", "RAL predictor / scoreboard"],
                    ["Passive bus reconstruction", "Monitor"],
                    ["Temporal protocol legality", "Assertions"],
                    ["Coverage", "Monitor / subscriber"],
                    ["Slave response generation", "DUT or slave responder"],
                  ]}
                />
              </div>
            </div>
          </section>

          {/* ── §9 Sequence-Sequencer-Driver Contract ──────────────────── */}
          <section id="ssd-contract">
            <SectionHeading
              num={9}
              title="Sequence-Sequencer-Driver Contract"
            />
            <div className="space-y-4 text-sm text-slate-300">
              <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 text-xs space-y-2">
                <h5 className="font-bold text-blue-300">Default Contract Used in This Module</h5>
                <CodeBlock lang="text">{`Driver gets one item.
Driver completes the full AXI4-Lite read/write transaction.
Driver captures response.
Driver calls item_done(rsp).
Driver gets the next item.`}</CodeBlock>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-900/60 border border-slate-700/60 rounded-lg">
                  <strong className="text-emerald-300">Write Completion:</strong>
                  <p className="mt-1">
                    <code>item_done(rsp)</code> after <strong>AW handshake + W handshake + B handshake</strong>.
                  </p>
                </div>
                <div className="p-3 bg-slate-900/60 border border-slate-700/60 rounded-lg">
                  <strong className="text-emerald-300">Read Completion:</strong>
                  <p className="mt-1">
                    <code>item_done(rsp)</code> after <strong>AR handshake + R handshake</strong>.
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="font-bold text-slate-300">Response Routing Rule:</div>
                <CodeBlock lang="systemverilog">{`rsp.set_id_info(req); // Preserves sequence/transaction routing info`}</CodeBlock>
              </div>
            </div>
          </section>

          {/* ── §10 Reset / Abort Policy ───────────────────────────────── */}
          <section id="reset-abort">
            <SectionHeading num={10} title="Reset / Abort Policy" />
            <div className="space-y-4 text-sm text-slate-300">
              <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/40 text-xs space-y-2">
                <h5 className="font-bold text-rose-300">Driver Reset Duties</h5>
                <p>
                  On reset assertion, the driver drives all master outputs inactive:
                </p>
                <CodeBlock lang="text">{`AWVALID = 0
WVALID  = 0
BREADY  = 0
ARVALID = 0
RREADY  = 0
address/data/control = known idle values`}</CodeBlock>
                <p>
                  If reset asserts during an active item: abort active pin activity, set <code>rsp.aborted = 1</code>, and call <code>item_done(rsp)</code>.
                </p>
              </div>

              <Callout type="warning">
                <strong>Reset Warning:</strong> Dropping the item without <code>item_done()</code> leaves the sequence blocked forever. That is not reset handling; that is a UVM deadlock.
              </Callout>
            </div>
          </section>

          {/* ── §11 Response / Completion Policy ────────────────────────── */}
          <section id="response-policy">
            <SectionHeading
              num={11}
              title="Response / Completion Policy"
            />
            <div className="space-y-3 text-sm text-slate-300">
              <p className="text-xs">
                <strong>Write Response:</strong> Valid after AW handshake + W handshake + B handshake observed; captures <code>BRESP</code>.
              </p>
              <p className="text-xs">
                <strong>Read Response:</strong> Valid after AR handshake + R handshake observed; captures <code>RDATA</code> and <code>RRESP</code>.
              </p>
              <p className="text-xs">
                <strong>Error Responses:</strong> The driver captures error responses (such as <code>SLVERR</code> or <code>DECERR</code>) and returns them in <code>rsp</code>. It does not decide whether they are expected; scoreboard or test intent evaluates validity.
              </p>
            </div>
          </section>

          {/* ── §12 Protocol Ownership Matrix ──────────────────────────── */}
          <section id="ownership-matrix">
            <SectionHeading num={12} title="Protocol Ownership Matrix" />
            <Table
              headers={[
                "Signal / Behavior",
                "Driver",
                "DUT",
                "Monitor",
                "Scoreboard",
                "Assertion",
              ]}
              rows={[
                ["Drive AWADDR/AWPROT/AWVALID", "Yes", "No", "Observe", "No", "Check stability"],
                ["Drive AWREADY", "No", "Yes", "Observe", "No", "Check legality"],
                ["Drive WDATA/WSTRB/WVALID", "Yes", "No", "Observe", "No", "Check stability"],
                ["Drive WREADY", "No", "Yes", "Observe", "No", "Check legality"],
                ["Drive BVALID/BRESP", "No", "Yes", "Observe", "Compare expected response", "Check stability"],
                ["Drive BREADY", "Yes", "No", "Observe", "No", "Check legality"],
                ["Drive ARADDR/ARPROT/ARVALID", "Yes", "No", "Observe", "No", "Check stability"],
                ["Drive ARREADY", "No", "Yes", "Observe", "No", "Check legality"],
                ["Drive RVALID/RDATA/RRESP", "No", "Yes", "Observe", "Compare read result", "Check stability"],
                ["Drive RREADY", "Yes", "No", "Observe", "No", "Check legality"],
                ["Predict register effects", "No", "No", "No", "Yes", "No"],
                ["Functional pass/fail", "No", "No", "No", "Yes", "Sometimes property-specific"],
                ["Temporal protocol checks", "Minimal defensive only", "No", "Observe", "No", "Yes"],
              ]}
            />
          </section>

          {/* ── §13 Memory Cards ────────────────────────────────────────── */}
          <section id="memory-cards">
            <SectionHeading num={13} title="Memory Cards (1–20)" />
            <p className="text-slate-400 text-sm mb-4">
              20 comprehensive memory cards for AXI4-Lite Master Driver Deep Dive:
            </p>
            <div className="space-y-3">
              {module10MemoryCards.map((card, idx) => (
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

          {/* ── §14 Atlas Sheets ────────────────────────────────────────── */}
          <section id="atlas-sheets">
            <SectionHeading num={14} title="Atlas Sheets (1–5)" />

            <CollapsibleCard
              title="Atlas Sheet 1 — AXI4-Lite Write Flow"
              accent="blue"
              icon={<FaListAlt size={12} />}
              defaultOpen={true}
            >
              <Table
                headers={["Step", "Channel", "Driver Action", "DUT Action", "Completion Condition"]}
                rows={[
                  ["1", "AW", "Drive AWADDR/AWPROT/AWVALID", "Drive AWREADY", "AWVALID && AWREADY"],
                  ["2", "W", "Drive WDATA/WSTRB/WVALID", "Drive WREADY", "WVALID && WREADY"],
                  ["3", "B", "Drive BREADY", "Drive BVALID/BRESP", "BVALID && BREADY"],
                  ["4", "UVM", "Capture response", "—", "rsp.resp = BRESP"],
                  ["5", "UVM", "Complete item", "—", "item_done(rsp)"],
                ]}
              />
            </CollapsibleCard>

            <CollapsibleCard
              title="Atlas Sheet 2 — AXI4-Lite Read Flow"
              accent="violet"
              icon={<FaListAlt size={12} />}
            >
              <Table
                headers={["Step", "Channel", "Driver Action", "DUT Action", "Completion Condition"]}
                rows={[
                  ["1", "AR", "Drive ARADDR/ARPROT/ARVALID", "Drive ARREADY", "ARVALID && ARREADY"],
                  ["2", "R", "Drive RREADY", "Drive RVALID/RDATA/RRESP", "RVALID && RREADY"],
                  ["3", "UVM", "Capture response", "—", "rsp.rdata = RDATA, rsp.resp = RRESP"],
                  ["4", "UVM", "Complete item", "—", "item_done(rsp)"],
                ]}
              />
            </CollapsibleCard>

            <CollapsibleCard
              title="Atlas Sheet 3 — Plain SV vs UVM AXI4-Lite Driver"
              accent="emerald"
              icon={<FaListAlt size={12} />}
            >
              <Table
                headers={["Concern", "Plain SV Task", "UVM Driver"]}
                rows={[
                  ["Transaction source", "Task arguments", "Sequence item"],
                  ["Bus driving", "Direct signal assignment", "Virtual interface"],
                  ["Backpressure wait", "while (!ready)", "Channel task"],
                  ["Response return", "Output arguments", "Response item"],
                  ["Sequencing", "Test code order", "Sequencer arbitration"],
                  ["Completion", "Task return", "item_done()"],
                  ["Reset policy", "Manual", "Driver-owned cleanup"],
                  ["Debug", "$display", "uvm_info/error"],
                ]}
              />
            </CollapsibleCard>

            <CollapsibleCard
              title="Atlas Sheet 4 — Sequential vs Forked Write Driver"
              accent="amber"
              icon={<FaListAlt size={12} />}
            >
              <Table
                headers={["Feature", "AW Then W", "Forked AW/W"]}
                rows={[
                  ["Easier to code", "Yes", "Medium"],
                  ["Protocol realism", "Weak", "Better"],
                  ["Allows W before AW", "No", "Yes"],
                  ["Allows AW before W", "Yes", "Yes"],
                  ["Allows same-cycle AW/W acceptance", "No", "Yes"],
                  ["Still one sequence item at a time", "Yes", "Yes"],
                  ["Recommended final pattern", "No", "Yes"],
                ]}
              />
            </CollapsibleCard>

            <CollapsibleCard
              title="Atlas Sheet 5 — Completion Policy Comparison"
              accent="rose"
              icon={<FaListAlt size={12} />}
            >
              <Table
                headers={["Policy", "item_done() Timing", "Pros", "Cons"]}
                rows={[
                  ["After request launch", "After AW/W or AR", "Higher throughput possible", "Wrong for simple response-returning driver"],
                  ["After response completion", "After B or R", "Safe, response available", "Lower throughput"],
                  ["After internal queueing", "After enqueue", "Pipelined architecture", "Requires outstanding tracking"],
                  ["After reset abort", "After aborted response", "Avoids deadlock", "Sequence must handle abort"],
                ]}
              />
            </CollapsibleCard>
          </section>

          {/* ── §15 Code Labs ───────────────────────────────────────────── */}
          <section id="code-labs">
            <SectionHeading num={15} title="Code Labs (1–3)" />

            {/* Lab 1 */}
            <CollapsibleCard
              title="Code Lab 1 — AXI4-Lite Package, Item, and Interface"
              accent="blue"
              icon={<FaFlask size={12} />}
              defaultOpen={true}
            >
              <div className="space-y-3 text-xs text-slate-300">
                <p>
                  <strong>Objective:</strong> Create a portable AXI4-Lite transaction and interface for a UVM master driver.
                </p>
                <CodeBlock lang="systemverilog">{`package axi4lite_pkg;
  import uvm_pkg::*;
  \`include "uvm_macros.svh"

  typedef enum bit {
    AXI4L_READ  = 1'b0,
    AXI4L_WRITE = 1'b1
  } axi4l_kind_e;

  typedef enum logic [1:0] {
    AXI4L_RESP_OKAY        = 2'b00,
    AXI4L_RESP_RESERVED_01 = 2'b01,
    AXI4L_RESP_SLVERR      = 2'b10,
    AXI4L_RESP_DECERR      = 2'b11
  } axi4l_resp_e;

  class axi4lite_item #(int ADDR_WIDTH = 32,
                        int DATA_WIDTH = 32) extends uvm_sequence_item;

    localparam int STRB_WIDTH = DATA_WIDTH / 8;

    rand axi4l_kind_e         kind;
    rand bit [ADDR_WIDTH-1:0] addr;
    rand bit [DATA_WIDTH-1:0] data;
    rand bit [STRB_WIDTH-1:0] strb;
    rand bit [2:0]            prot;

    bit [DATA_WIDTH-1:0]      rdata;
    axi4l_resp_e              resp;
    bit                       aborted;

    \`uvm_object_param_utils(axi4lite_item #(ADDR_WIDTH, DATA_WIDTH))

    function new(string name = "axi4lite_item");
      super.new(name);
      kind    = AXI4L_READ;
      addr    = '0;
      data    = '0;
      strb    = '0;
      prot    = '0;
      rdata   = '0;
      resp    = AXI4L_RESP_OKAY;
      aborted = 1'b0;
    endfunction

    virtual function void do_copy(uvm_object rhs);
      axi4lite_item #(ADDR_WIDTH, DATA_WIDTH) rhs_;

      if (!$cast(rhs_, rhs)) begin
        \`uvm_fatal("AXI4L_COPY", "do_copy cast failed")
      end

      super.do_copy(rhs);

      kind    = rhs_.kind;
      addr    = rhs_.addr;
      data    = rhs_.data;
      strb    = rhs_.strb;
      prot    = rhs_.prot;
      rdata   = rhs_.rdata;
      resp    = rhs_.resp;
      aborted = rhs_.aborted;
    endfunction

    virtual function string convert2string();
      return $sformatf("kind=%s addr=0x%0h data=0x%0h strb=0x%0h prot=0x%0h rdata=0x%0h resp=%s aborted=%0b",
                       kind.name(), addr, data, strb, prot, rdata, resp.name(), aborted);
    endfunction

  endclass

endpackage


interface axi4lite_if #(int ADDR_WIDTH = 32,
                        int DATA_WIDTH = 32)
(
  input logic ACLK,
  input logic ARESETn
);

  localparam int STRB_WIDTH = DATA_WIDTH / 8;

  logic [ADDR_WIDTH-1:0] awaddr;
  logic [2:0]            awprot;
  logic                  awvalid;
  logic                  awready;

  logic [DATA_WIDTH-1:0] wdata;
  logic [STRB_WIDTH-1:0] wstrb;
  logic                  wvalid;
  logic                  wready;

  logic [1:0]            bresp;
  logic                  bvalid;
  logic                  bready;

  logic [ADDR_WIDTH-1:0] araddr;
  logic [2:0]            arprot;
  logic                  arvalid;
  logic                  arready;

  logic [DATA_WIDTH-1:0] rdata;
  logic [1:0]            rresp;
  logic                  rvalid;
  logic                  rready;

  clocking drv_cb @(posedge ACLK);
    default input #1step output #0;

    output awaddr;
    output awprot;
    output awvalid;
    input  awready;

    output wdata;
    output wstrb;
    output wvalid;
    input  wready;

    input  bresp;
    input  bvalid;
    output bready;

    output araddr;
    output arprot;
    output arvalid;
    input  arready;

    input  rdata;
    input  rresp;
    input  rvalid;
    output rready;
  endclocking

  modport DRV (
    clocking drv_cb,
    input ACLK,
    input ARESETn
  );

endinterface`}</CodeBlock>
                <div className="p-3 bg-slate-900/60 rounded-lg space-y-1 text-slate-400">
                  <div className="font-bold text-slate-300">Compile-Readiness Notes:</div>
                  <p>• <code>axi4l_resp_e</code> uses 4-state <code>logic [1:0]</code> base so unknowns (X/Z) are preserved during testing.</p>
                  <p>• <code>uvm_object_param_utils</code> handles parameterized sequence items.</p>
                </div>
              </div>
            </CollapsibleCard>

            {/* Lab 2 */}
            <CollapsibleCard
              title="Code Lab 2 — Conservative AXI4-Lite Master Driver"
              accent="emerald"
              icon={<FaFlask size={12} />}
            >
              <div className="space-y-3 text-xs text-slate-300">
                <p>
                  <strong>Objective:</strong> Implement a production-grade one-item-at-a-time AXI4-Lite master driver.
                </p>
                <CodeBlock lang="systemverilog">{`import uvm_pkg::*;
\`include "uvm_macros.svh"
import axi4lite_pkg::*;

class axi4lite_master_driver #(int ADDR_WIDTH = 32,
                               int DATA_WIDTH = 32)
  extends uvm_driver #(axi4lite_item #(ADDR_WIDTH, DATA_WIDTH),
                       axi4lite_item #(ADDR_WIDTH, DATA_WIDTH));

  typedef axi4lite_item #(ADDR_WIDTH, DATA_WIDTH) item_t;

  \`uvm_component_param_utils(axi4lite_master_driver #(ADDR_WIDTH, DATA_WIDTH))

  virtual axi4lite_if #(ADDR_WIDTH, DATA_WIDTH) vif;

  function new(string name = "axi4lite_master_driver",
               uvm_component parent = null);
    super.new(name, parent);
  endfunction

  virtual function void build_phase(uvm_phase phase);
    super.build_phase(phase);

    if (!uvm_config_db#(virtual axi4lite_if #(ADDR_WIDTH, DATA_WIDTH))::get(this, "", "vif", vif)) begin
      \`uvm_fatal("AXI4L_NOVIF", "virtual interface not found in config_db")
    end
  endfunction

  virtual task run_phase(uvm_phase phase);
    item_t req;
    item_t rsp;

    reset_outputs();

    forever begin
      wait_reset_deasserted();

      seq_item_port.get_next_item(req);

      rsp = item_t::type_id::create("rsp");
      rsp.copy(req);
      rsp.set_id_info(req);
      rsp.aborted = 1'b0;
      rsp.resp    = AXI4L_RESP_OKAY;
      rsp.rdata   = '0;

      drive_one(req, rsp);

      seq_item_port.item_done(rsp);
    end
  endtask

  virtual task reset_outputs();
    vif.drv_cb.awaddr  <= '0;
    vif.drv_cb.awprot  <= '0;
    vif.drv_cb.awvalid <= 1'b0;

    vif.drv_cb.wdata   <= '0;
    vif.drv_cb.wstrb   <= '0;
    vif.drv_cb.wvalid  <= 1'b0;

    vif.drv_cb.bready  <= 1'b0;

    vif.drv_cb.araddr  <= '0;
    vif.drv_cb.arprot  <= '0;
    vif.drv_cb.arvalid <= 1'b0;

    vif.drv_cb.rready  <= 1'b0;
  endtask

  virtual task wait_reset_deasserted();
    while (vif.ARESETn !== 1'b1) begin
      reset_outputs();
      @(vif.drv_cb);
    end
  endtask

  virtual task drive_one(input item_t req,
                         input item_t rsp);
    bit aborted;

    aborted = 1'b0;

    \`uvm_info("AXI4L_DRV",
              $sformatf("START %s", req.convert2string()),
              UVM_MEDIUM)

    case (req.kind)
      AXI4L_WRITE: drive_write(req, rsp, aborted);
      AXI4L_READ : drive_read (req, rsp, aborted);
      default: begin
        \`uvm_error("AXI4L_KIND", "Unknown AXI4-Lite item kind")
        aborted = 1'b1;
      end
    endcase

    if (aborted) begin
      rsp.aborted = 1'b1;
      reset_outputs();
      \`uvm_warning("AXI4L_ABORT", "AXI4-Lite transaction aborted")
    end

    \`uvm_info("AXI4L_DRV",
              $sformatf("DONE %s", rsp.convert2string()),
              UVM_MEDIUM)
  endtask

  virtual task drive_write(input item_t req,
                           input item_t rsp,
                           output bit aborted);
    bit aw_aborted;
    bit w_aborted;
    bit b_aborted;

    aw_aborted = 1'b0;
    w_aborted  = 1'b0;
    b_aborted  = 1'b0;
    aborted    = 1'b0;

    fork
      drive_aw(req, aw_aborted);
      drive_w (req, w_aborted);
    join

    if (aw_aborted || w_aborted) begin
      aborted = 1'b1;
      return;
    end

    wait_b_response(rsp, b_aborted);

    if (b_aborted) begin
      aborted = 1'b1;
    end
  endtask

  virtual task drive_read(input item_t req,
                          input item_t rsp,
                          output bit aborted);
    bit ar_aborted;
    bit r_aborted;

    ar_aborted = 1'b0;
    r_aborted  = 1'b0;
    aborted    = 1'b0;

    drive_ar(req, ar_aborted);

    if (ar_aborted) begin
      aborted = 1'b1;
      return;
    end

    wait_r_response(rsp, r_aborted);

    if (r_aborted) begin
      aborted = 1'b1;
    end
  endtask

  virtual task drive_aw(input item_t req,
                        output bit aborted);
    aborted = 1'b0;

    @(vif.drv_cb);
    if (vif.ARESETn !== 1'b1) begin
      aborted = 1'b1;
      return;
    end

    vif.drv_cb.awaddr  <= req.addr;
    vif.drv_cb.awprot  <= req.prot;
    vif.drv_cb.awvalid <= 1'b1;

    do begin
      @(vif.drv_cb);

      if (vif.ARESETn !== 1'b1) begin
        aborted = 1'b1;
        vif.drv_cb.awvalid <= 1'b0;
        vif.drv_cb.awaddr  <= '0;
        vif.drv_cb.awprot  <= '0;
        return;
      end
    end while (vif.drv_cb.awready !== 1'b1);

    vif.drv_cb.awvalid <= 1'b0;
    vif.drv_cb.awaddr  <= '0;
    vif.drv_cb.awprot  <= '0;

    \`uvm_info("AXI4L_AW",
              $sformatf("AW accepted addr=0x%0h prot=0x%0h", req.addr, req.prot),
              UVM_HIGH)
  endtask

  virtual task drive_w(input item_t req,
                       output bit aborted);
    aborted = 1'b0;

    @(vif.drv_cb);
    if (vif.ARESETn !== 1'b1) begin
      aborted = 1'b1;
      return;
    end

    vif.drv_cb.wdata  <= req.data;
    vif.drv_cb.wstrb  <= req.strb;
    vif.drv_cb.wvalid <= 1'b1;

    do begin
      @(vif.drv_cb);

      if (vif.ARESETn !== 1'b1) begin
        aborted = 1'b1;
        vif.drv_cb.wvalid <= 1'b0;
        vif.drv_cb.wdata  <= '0;
        vif.drv_cb.wstrb  <= '0;
        return;
      end
    end while (vif.drv_cb.wready !== 1'b1);

    vif.drv_cb.wvalid <= 1'b0;
    vif.drv_cb.wdata  <= '0;
    vif.drv_cb.wstrb  <= '0;

    \`uvm_info("AXI4L_W",
              $sformatf("W accepted data=0x%0h strb=0x%0h", req.data, req.strb),
              UVM_HIGH)
  endtask

  virtual task wait_b_response(input item_t rsp,
                               output bit aborted);
    aborted = 1'b0;

    @(vif.drv_cb);
    if (vif.ARESETn !== 1'b1) begin
      aborted = 1'b1;
      return;
    end

    vif.drv_cb.bready <= 1'b1;

    do begin
      @(vif.drv_cb);

      if (vif.ARESETn !== 1'b1) begin
        aborted = 1'b1;
        vif.drv_cb.bready <= 1'b0;
        return;
      end
    end while (vif.drv_cb.bvalid !== 1'b1);

    if ($isunknown(vif.drv_cb.bresp)) begin
      \`uvm_error("AXI4L_BRESP_X",
                 "B response contains X/Z")
      rsp.aborted = 1'b1;
    end
    else begin
      rsp.resp = axi4l_resp_e'(vif.drv_cb.bresp);
    end

    vif.drv_cb.bready <= 1'b0;

    \`uvm_info("AXI4L_B",
              $sformatf("B accepted resp=%s aborted=%0b",
                        rsp.resp.name(), rsp.aborted),
              UVM_HIGH)
  endtask

  virtual task drive_ar(input item_t req,
                        output bit aborted);
    aborted = 1'b0;

    @(vif.drv_cb);
    if (vif.ARESETn !== 1'b1) begin
      aborted = 1'b1;
      return;
    end

    vif.drv_cb.araddr  <= req.addr;
    vif.drv_cb.arprot  <= req.prot;
    vif.drv_cb.arvalid <= 1'b1;

    do begin
      @(vif.drv_cb);

      if (vif.ARESETn !== 1'b1) begin
        aborted = 1'b1;
        vif.drv_cb.arvalid <= 1'b0;
        vif.drv_cb.araddr  <= '0;
        vif.drv_cb.arprot  <= '0;
        return;
      end
    end while (vif.drv_cb.arready !== 1'b1);

    vif.drv_cb.arvalid <= 1'b0;
    vif.drv_cb.araddr  <= '0;
    vif.drv_cb.arprot  <= '0;

    \`uvm_info("AXI4L_AR",
              $sformatf("AR accepted addr=0x%0h prot=0x%0h", req.addr, req.prot),
              UVM_HIGH)
  endtask

  virtual task wait_r_response(input item_t rsp,
                               output bit aborted);
    aborted = 1'b0;

    @(vif.drv_cb);
    if (vif.ARESETn !== 1'b1) begin
      aborted = 1'b1;
      return;
    end

    vif.drv_cb.rready <= 1'b1;

    do begin
      @(vif.drv_cb);

      if (vif.ARESETn !== 1'b1) begin
        aborted = 1'b1;
        vif.drv_cb.rready <= 1'b0;
        return;
      end
    end while (vif.drv_cb.rvalid !== 1'b1);

    rsp.rdata = vif.drv_cb.rdata;

    if ($isunknown(vif.drv_cb.rresp)) begin
      \`uvm_error("AXI4L_RRESP_X",
                 "R response contains X/Z")
      rsp.aborted = 1'b1;
    end
    else begin
      rsp.resp = axi4l_resp_e'(vif.drv_cb.rresp);
    end

    vif.drv_cb.rready <= 1'b0;

    \`uvm_info("AXI4L_R",
              $sformatf("R accepted data=0x%0h resp=%s aborted=%0b",
                        rsp.rdata, rsp.resp.name(), rsp.aborted),
              UVM_HIGH)
  endtask

endclass`}</CodeBlock>
              </div>
            </CollapsibleCard>

            {/* Lab 3 */}
            <CollapsibleCard
              title="Code Lab 3 — Bad Sequential vs Corrected Forked Write Driver"
              accent="violet"
              icon={<FaFlask size={12} />}
            >
              <div className="space-y-3 text-xs text-slate-300">
                <p>
                  <strong>Objective:</strong> Expose why forcing AW before W is weak for AXI4-Lite protocol stress.
                </p>

                <div className="text-rose-400 font-bold">❌ Bad Sequential Implementation:</div>
                <CodeBlock lang="systemverilog">{`virtual task bad_drive_write(input item_t req,
                             input item_t rsp);
  bit aborted;

  aborted = 1'b0;

  // BAD: forces AW to complete before W is even presented.
  drive_aw(req, aborted);

  if (aborted) begin
    rsp.aborted = 1'b1;
    return;
  end

  drive_w(req, aborted);

  if (aborted) begin
    rsp.aborted = 1'b1;
    return;
  end

  wait_b_response(rsp, aborted);
endtask`}</CodeBlock>

                <div className="text-emerald-400 font-bold">✅ Correct Forked Implementation:</div>
                <CodeBlock lang="systemverilog">{`virtual task better_drive_write(input item_t req,
                                input item_t rsp,
                                output bit aborted);
  bit aw_aborted;
  bit w_aborted;
  bit b_aborted;

  aw_aborted = 1'b0;
  w_aborted  = 1'b0;
  b_aborted  = 1'b0;
  aborted    = 1'b0;

  fork
    drive_aw(req, aw_aborted);
    drive_w (req, w_aborted);
  join

  if (aw_aborted || w_aborted) begin
    aborted = 1'b1;
    return;
  end

  wait_b_response(rsp, b_aborted);

  if (b_aborted) begin
    aborted = 1'b1;
  end
endtask`}</CodeBlock>

                <Callout type="interview">
                  <strong>Interview Line:</strong> "A sequential AW-then-W driver is a valid limited component if documented, but it is weak for protocol stress. A better AXI4-Lite master driver lets AW and W handshake independently, then waits for B."
                </Callout>
              </div>
            </CollapsibleCard>
          </section>

          {/* ── §16 Bug Gallery ─────────────────────────────────────────── */}
          <section id="bug-gallery">
            <SectionHeading num={16} title="Bug Gallery (1–10)" />
            <div className="space-y-4">
              {module10BugGallery.map((bug, idx) => (
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

          {/* ── §17 Race-Condition Checklist ────────────────────────────── */}
          <section id="race-checklist">
            <SectionHeading num={17} title="Race-Condition Checklist" />
            <ul className="space-y-1.5 text-xs text-slate-300">
              {[
                "Are driver outputs driven through a clocking block or documented raw-edge scheme?",
                "Are DUT outputs sampled through the clocking block input view?",
                "Does the driver hold payload stable while valid is asserted and ready is low?",
                "Does the driver avoid reading its own clocking-block outputs as proof of DUT sampling?",
                "Does reset cleanup happen on a controlled clock boundary?",
                "Can reset occur while one forked write channel has completed and the other has not?",
                "Are AWVALID and WVALID controlled by only one thread each?",
                "Are BREADY and RREADY deasserted after response handshake?",
                "Does the monitor sample the same protocol edge as the driver?",
                "Are timeout counters incremented per clock, not per delta cycle?",
              ].map((check, i) => (
                <li key={i} className="flex items-center gap-2">
                  <FaShieldAlt className="text-blue-400 shrink-0" />
                  <span>{check}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* ── §18 Debug Instrumentation / Log Strategy ────────────────── */}
          <section id="debug-strategy">
            <SectionHeading
              num={18}
              title="Debug Instrumentation & Log Strategy"
            />
            <div className="space-y-4 text-sm text-slate-300">
              <Table
                headers={["Event", "Verbosity"]}
                rows={[
                  ["Transaction start", "UVM_MEDIUM"],
                  ["Transaction completion", "UVM_MEDIUM"],
                  ["AW accepted", "UVM_HIGH"],
                  ["W accepted", "UVM_HIGH"],
                  ["B response accepted", "UVM_HIGH"],
                  ["AR accepted", "UVM_HIGH"],
                  ["R response accepted", "UVM_HIGH"],
                  ["Reset abort", "UVM_WARNING"],
                  ["Timeout", "UVM_ERROR"],
                ]}
              />

              <div className="space-y-2 text-xs">
                <div className="font-bold text-slate-300">Recommended START Log:</div>
                <CodeBlock lang="systemverilog">{`\`uvm_info("AXI4L_DRV",
          $sformatf("START %s", req.convert2string()),
          UVM_MEDIUM)`}</CodeBlock>

                <div className="font-bold text-slate-300">Recommended Read Response Log:</div>
                <CodeBlock lang="systemverilog">{`\`uvm_info("AXI4L_R",
          $sformatf("R data=0x%0h resp=%s", rsp.rdata, rsp.resp.name()),
          UVM_HIGH)`}</CodeBlock>
              </div>
            </div>
          </section>

          {/* ── §19 Monitor / Scoreboard / Assertion Boundary ───────────── */}
          <section id="boundary">
            <SectionHeading
              num={19}
              title="Monitor / Scoreboard / Assertion Boundary"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-blue-500/20 bg-slate-900/50 space-y-2">
                <div className="font-bold text-blue-300">Driver &amp; Monitor</div>
                <p className="text-slate-300 leading-relaxed">
                  <strong>Driver:</strong> Drives master outputs, waits for protocol handshakes, captures responses, returns response objects, and handles reset cleanup.
                  <br />
                  <strong>Monitor:</strong> Passively observes all channels, reconstructs read/write transactions, and exports observed transactions through analysis ports.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-violet-500/20 bg-slate-900/50 space-y-2">
                <div className="font-bold text-violet-300">Scoreboard &amp; Assertions</div>
                <p className="text-slate-300 leading-relaxed">
                  <strong>Scoreboard:</strong> Compares expected vs actual register behavior, checks read data correctness, and determines if error responses (SLVERR/DECERR) were expected.
                  <br />
                  <strong>Assertions:</strong> Checks payload/response stability during stalls, valid/ready legality, reset behavior, and absence of X on control lines.
                </p>
              </div>
            </div>

            <Callout type="concept">
              <strong>Boundary Note:</strong> A driver may include defensive local checks, but deep temporal protocol checking belongs in assertions and functional correctness belongs in the scoreboard.
            </Callout>
          </section>

          {/* ── §20 Architectural Decision Points ───────────────────────── */}
          <section id="architecture">
            <SectionHeading
              num={20}
              title="Architectural Decision Points"
            />
            <Table
              headers={["Decision", "Options", "Module 10 Senior Recommendation"]}
              rows={[
                [
                  "Decision 1: One Item at a Time or Concurrent?",
                  "One item vs Queued channels",
                  "One item at a time for register access / bring-up. (Module 11 introduces pipelined multi-channel drivers).",
                ],
                [
                  "Decision 2: AW/W Sequential or Forked?",
                  "AW then W vs Forked",
                  "Fork AW and W inside one write transaction for protocol realism.",
                ],
                [
                  "Decision 3: Return Response for Every Item?",
                  "No rsp vs On error vs Always",
                  "Return rsp for every read/write item for uniform sequence inspection.",
                ],
                [
                  "Decision 4: Reset Abort or Sequence Kill?",
                  "Abort response vs Kill vs Hang",
                  "Abort active item and return rsp.aborted = 1.",
                ],
                [
                  "Decision 5: Always-Ready Response Channels?",
                  "Always ready vs When waiting",
                  "Assert BREADY/RREADY only while waiting for the matching response.",
                ],
              ]}
            />
          </section>

          {/* ── §21 Scalability Notes ───────────────────────────────────── */}
          <section id="scalability">
            <SectionHeading num={21} title="Scalability Notes" />
            <ol className="space-y-1 list-decimal list-inside text-xs text-slate-300">
              <li>Add a configuration object: max wait cycles, idle insertion, response-ready policy, reset policy.</li>
              <li>Add randomized channel delay.</li>
              <li>Add independent read/write item queues.</li>
              <li>Add request acceptance versus response completion separation.</li>
              <li>Add outstanding counters if the architecture allows more than one active transaction.</li>
              <li>Add RAL frontdoor adapter integration.</li>
              <li>Add protocol assertions.</li>
              <li>Add stress modes: delayed AW, delayed W, W before AW, same-cycle AW/W, delayed B, delayed R, randomized BREADY, randomized RREADY.</li>
              <li>Add coverage: AW before W, W before AW, same-cycle AW/W, response error values, reset abort phase.</li>
            </ol>
          </section>

          {/* ── §22 Review Checklist ────────────────────────────────────── */}
          <section id="review-checklist">
            <SectionHeading num={22} title="Review Checklist" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/40 space-y-2">
                <h5 className="font-bold text-blue-300">Protocol &amp; Timing Review</h5>
                <ul className="space-y-1 text-slate-300">
                  <li>✔ AW and W are independent</li>
                  <li>✔ B captured after write request channels complete</li>
                  <li>✔ RDATA captured only on R handshake</li>
                  <li>✔ Valid payloads stable during stalls</li>
                  <li>✔ Slave-owned outputs never driven by master driver</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/40 space-y-2">
                <h5 className="font-bold text-violet-300">UVM &amp; Reset Review</h5>
                <ul className="space-y-1 text-slate-300">
                  <li>✔ Documented completion policy</li>
                  <li>✔ get_next_item() leads to exactly one item_done()</li>
                  <li>✔ Response objects routed with set_id_info(req)</li>
                  <li>✔ Deterministic reset cleanup without sequencer hang</li>
                  <li>✔ Functional checking strictly outside the driver</li>
                </ul>
              </div>
            </div>
          </section>

          {/* ── §23 Interview Q&A ───────────────────────────────────────── */}
          <section id="interview-qa">
            <SectionHeading num={23} title="Interview Q&A (Q1–Q13)" />
            <div className="space-y-4">
              {module10InterviewQA.map((qa, idx) => (
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
                    {qa.code && (
                      <CodeBlock lang="systemverilog">{qa.code}</CodeBlock>
                    )}
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

          {/* ── §24 Final Recall Card ───────────────────────────────────── */}
          <section id="final-recall">
            <SectionHeading num={24} title="Final Recall Card" />
            <div className="p-5 rounded-xl border border-blue-500/30 bg-linear-to-r from-blue-500/10 to-indigo-500/10 space-y-3">
              <CodeBlock lang="text">{`WRITE = AW + W + B
READ  = AR + R
item_done = after response or abort`}</CodeBlock>

              <h4 className="font-bold text-blue-300 text-sm">Core Concept</h4>
              <p className="text-xs text-slate-300">
                A correct AXI4-Lite master driver drives master-side valid/ready intent, waits for slave handshakes, captures protocol responses, and completes the UVM item only when the transaction is complete or aborted.
              </p>

              <CodeBlock lang="systemverilog">{`seq_item_port.get_next_item(req);

rsp = item_t::type_id::create("rsp");
rsp.copy(req);
rsp.set_id_info(req);

drive_one(req, rsp);

seq_item_port.item_done(rsp);`}</CodeBlock>

              <Callout type="interview">
                <strong>Interview Line:</strong> "My AXI4-Lite driver separates request acceptance from transaction completion: AW/W or AR launch the request, B/R completes it, and only then do I call item_done with a routed response object."
              </Callout>
            </div>
          </section>

          {/* ── §25 Key Takeaways ───────────────────────────────────────── */}
          <section id="key-takeaways">
            <SectionHeading num={25} title="Key Takeaways" />
            <ol className="space-y-1.5 list-decimal list-inside text-slate-300 text-sm">
              {[
                "AXI4-Lite is not APB.",
                "A write completes after AW, W, and B.",
                "A read completes after AR and R.",
                "AW and W must not be artificially ordered unless documented.",
                "BRESP, RRESP, and RDATA are driver-captured response information.",
                "item_done() must match the driver completion contract.",
                "In this module, item_done() means full transaction completion or abort.",
                "Use set_id_info(req) for response routing.",
                "Reset must clean pins and unblock the sequencer.",
                "The driver captures protocol results; the scoreboard checks functional correctness.",
              ].map((takeaway, i) => (
                <li key={i} className="pl-1">
                  {takeaway}
                </li>
              ))}
            </ol>
          </section>

          {/* ── §26 Interview Questions ─────────────────────────────────── */}
          <section id="interview-questions">
            <SectionHeading num={26} title="Interview Questions" />
            <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/40 text-sm text-slate-300 space-y-2">
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Explain the five AXI4-Lite channels and their direction.</li>
                <li>Why is AXI4-Lite not equivalent to APB?</li>
                <li>What completes an AXI4-Lite write?</li>
                <li>What completes an AXI4-Lite read?</li>
                <li>Can W handshake before AW?</li>
                <li>Why should AW and W often be forked in the driver?</li>
                <li>When should item_done() be called for a write?</li>
                <li>When should item_done() be called for a read?</li>
                <li>Why does the driver capture BRESP?</li>
                <li>Why does the driver capture RRESP and RDATA?</li>
                <li>What does set_id_info(req) do?</li>
                <li>What happens if reset occurs during a transaction?</li>
                <li>Should the driver check expected read data?</li>
                <li>What are the risks of an always-ready response policy?</li>
                <li>How do clocking blocks reduce races?</li>
                <li>What limitations does a one-item-at-a-time AXI4-Lite driver have?</li>
                <li>Why should a verification driver avoid 2-state response masking?</li>
              </ol>
            </div>
          </section>

          {/* ── §27 Coding Exercise ─────────────────────────────────────── */}
          <section id="coding-exercise">
            <SectionHeading
              num={27}
              title="Coding Exercise — Add Configurable Timeouts"
            />
            <div className="space-y-4 text-sm text-slate-300">
              <p>
                <strong>Exercise:</strong> Modify the Code Lab 2 driver to add configurable timeout counters for <code>AWREADY</code>, <code>WREADY</code>, <code>BVALID</code>, <code>ARREADY</code>, and <code>RVALID</code>.
              </p>
              <CollapsibleCard
                title="Exercise Requirements & Review Constraints"
                accent="blue"
                defaultOpen={true}
              >
                <div className="space-y-2 text-xs text-slate-300">
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Timeout is disabled when <code>max_wait_cycles == 0</code>.</li>
                    <li>Timeout reports <code>\`uvm_error</code>, not <code>\`uvm_fatal</code>.</li>
                    <li>Timeout marks <code>rsp.aborted = 1</code>.</li>
                    <li>Timeout cleans all driver outputs.</li>
                    <li>Timeout still leads to exactly one <code>item_done(rsp)</code>.</li>
                    <li>Timeout must be described as verification policy, not inherent AXI4-Lite protocol behavior.</li>
                  </ol>
                </div>
              </CollapsibleCard>

              <Callout type="interview">
                <strong>Expected Interview Defense:</strong> "I treat timeout as a verification environment policy. AXI4-Lite valid/ready does not define a universal timeout. The driver watchdog prevents infinite simulation hangs and returns an aborted response so the sequence can continue or fail cleanly."
              </Callout>
            </div>
          </section>

          {/* ── §28 Final Readiness Verdict ──────────────────────────────── */}
          <section id="final-verdict">
            <SectionHeading
              num={28}
              title="Final Readiness Verdict"
            />
            <div className="p-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 space-y-3">
              <h3 className="text-lg font-bold text-emerald-300 flex items-center gap-2">
                <FaCheckSquare /> Module 10 — Final Readiness Verdict: PASS (LOCKED)
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Module 10: AXI4-Lite Driver Deep Dive is fully transformed into React. All 20 memory cards, 5 atlas sheets, 3 code labs, 10 bug gallery entries, race checklists, architectural decision tables, and 13 deep interview Q&amp;As are complete and verified.
              </p>
              <p className="text-xs text-emerald-200/80">
                Ready for Module 11: Multi-Channel and Pipelined Driver Deep Dive.
              </p>
            </div>
          </section>

          {/* Navigation to next module */}
          <ModuleNavigation
            nextPath="/driver-mastery/module11"
            nextTitle="Module 11: Multi-Channel and Pipelined Driver Deep Dive →"
          />
        </main>
      </div>
    </div>
  );
};

export default Module10;
