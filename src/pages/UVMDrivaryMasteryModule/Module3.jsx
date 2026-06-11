import { Link } from "react-router-dom";
import {
  FaBook,
  FaBug,
  FaFlask,
  FaQuestionCircle,
  FaListAlt,
  FaArrowLeft,
} from "react-icons/fa";
import Table from "../../components/common/Table";
import Callout from "../../components/ui/Callout";
import SectionHeading from "../../components/common/SectionHeading";
import ModuleSidebar from "../../components/layout/Sidebar";
import ModuleHero from "../../components/ui/ModuleHero";
import ModuleNavigation from "../../components/ui/ModuleNavigation";
import CodeBlock from "../../components/ui/CodeBlock";
import CollapsibleCard from "../../components/ui/CollapsibleCard";

// Module3 data

// Module 3: Bug Gallery

const module3BugGallery = [
  {
    title: "Bug 1 — Early item_done()",
    symptom:
      "Sequence starts the next item too early. Driver may overwrite cmd_data before the previous transfer is accepted.",
    waveform:
      "cmd_valid high, cmd_ready low, cmd_data changes before ready goes high.",
    cause: "item_done() released the sequencer item before protocol handshake.",
    bad: `seq_item_port.get_next_item(req);
vif.drv_cb.cmd_valid <= 1'b1;
vif.drv_cb.cmd_data  <= req.data;
seq_item_port.item_done();

do @(vif.drv_cb);
while (vif.drv_cb.cmd_ready !== 1'b1);`,
    fix: `seq_item_port.get_next_item(req);
drive_until_handshake(req);
cleanup();
seq_item_port.item_done();`,
    interview:
      "In a non-pipelined driver, item_done() must represent safe driver-side completion.",
  },
  {
    title: "Bug 2 — Missing item_done() on Reset Abort",
    symptom: "Test hangs after reset. Sequence never finishes finish_item().",
    waveform:
      "Reset asserted during active transfer; driver returns idle; sequencer never advances.",
    cause: "Driver accepted item but never closed the contract.",
    bad: `seq_item_port.get_next_item(req);
while (vif.drv_cb.cmd_ready !== 1'b1) begin
  @(vif.drv_cb);
  if (vif.drv_cb.rst_n !== 1'b1) begin
    drive_idle();
    return;
  end
end`,
    fix: `seq_item_port.get_next_item(req);
aborted = drive_with_reset_abort(req);
seq_item_port.item_done();`,
    interview:
      "Reset cleanup must include sequencer cleanup, not only pin cleanup.",
  },
  {
    title: "Bug 3 — Pairing get() with item_done()",
    symptom: "Sequencer-driver protocol error.",
    waveform: "Waveform may look fine while control flow breaks.",
    cause: "get() and get_next_item() are different contracts.",
    bad: `seq_item_port.get(req);
drive_item(req);
seq_item_port.item_done();`,
    fix: `seq_item_port.get(req);
drive_item(req);
// no item_done()`,
    interview: "get_next_item() opens an item_done obligation; get() does not.",
  },
  {
    title: "Bug 5 — Leaving valid High After Completion",
    symptom: "DUT accepts same command multiple times.",
    waveform: "cmd_valid remains high across multiple ready pulses.",
    cause: "Cleanup step is missing.",
    bad: `do @(vif.drv_cb);
while (vif.drv_cb.cmd_ready !== 1'b1);

seq_item_port.item_done();`,
    fix: `wait_handshake();

vif.drv_cb.cmd_valid <= 1'b0;
vif.drv_cb.cmd_data  <= '0;

@(vif.drv_cb);

seq_item_port.item_done();`,
    interview:
      "Cleanup is not cosmetic. It prevents duplicate protocol activity.",
  },
];

// Module 3: Memory Cards

const module3MemoryCards = [
  {
    title: "Card 1 — The Driver Is a Translator, Not a Checker",
    accent: "violet",
    hook: "Driver translates intent into pins.",
    concept:
      "A sequence item is abstract intent. A driver turns it into timed DUT input activity. It must not become the scoreboard.",
    code: `seq_item_port.get_next_item(req);
drive_item(req);
seq_item_port.item_done();`,
    trap: "Putting functional comparisons inside the driver because the driver can 'see' response signals.",
    interview:
      "A driver owns legal stimulus timing. It does not own end-to-end functional correctness.",
  },
  {
    title: "Card 2 — The Universal Recipe",
    accent: "blue",
    hook: "GET → DECODE → RESET → IDLE → DRIVE → HANDSHAKE → RESPONSE → CLEANUP → DONE",
    concept:
      "Most driver bugs happen because one recipe step is missing or in the wrong position.",
    code: `get_item();
decode_item();
wait_reset_inactive();
wait_bus_idle();
drive_request();
wait_handshake();
sample_response();
cleanup_bus();
finish_item();`,
    trap: "Calling item_done() after drive_request() but before wait_handshake().",
    interview:
      "I structure drivers around protocol completion, not around when assignment statements finish.",
  },
  {
    title: "Card 3 — GET Means You Own an Open Sequencer Contract",
    accent: "violet",
    hook: "After GET, you owe DONE.",
    concept:
      "Once get_next_item(req) returns, the driver must eventually call item_done() exactly once.",
    code: `seq_item_port.get_next_item(req);
// must eventually happen:
seq_item_port.item_done();`,
    trap: "Reset occurs after get_next_item() and the driver waits forever without calling item_done().",
    interview:
      "After get_next_item(), reset handling must close or explicitly abort the item contract.",
  },
  {
    title: "Card 11 — ITEM_DONE Belongs After Safe Completion",
    accent: "amber",
    hook: "Done means safe to release.",
    concept:
      "For non-pipelined drivers, item_done() normally belongs after drive, handshake, response sampling, and cleanup decision.",
    code: `drive_to_completion(req);
cleanup();
seq_item_port.item_done();`,
    trap: "Calling item_done() immediately after get_next_item() to improve throughput.",
    interview:
      "In a non-pipelined driver, early item_done() lies to the sequence.",
  },
];

// Module 3: Interview QA

const module3InterviewQA = [
  {
    q: "What is the universal driver recipe?",
    short:
      "GET → DECODE → WAIT RESET → WAIT IDLE → DRIVE → HANDSHAKE → SAMPLE RESPONSE → CLEANUP → ITEM_DONE",
    deep: "The driver accepts a sequence item, converts it into protocol intent, waits for legal conditions, drives pins, waits for completion, captures response, cleans the interface, and releases the item.",
    followup: "Why not call item_done() immediately after driving?",
    answer:
      "Because driving pins is not protocol completion. Completion occurs after acceptance.",
  },
  {
    q: "What does get_next_item() mean?",
    short: "The driver accepts the next item and must later call item_done().",
    deep: "get_next_item() opens a sequencer-driver contract.",
    followup: "What happens if reset occurs after get_next_item()?",
    answer: "The driver must clean pins and close or abort the item contract.",
  },
  {
    q: "What is the most common beginner driver bug?",
    short: "Calling item_done() too early.",
    deep: "Assignment completion is not protocol completion.",
    followup: null,
    answer: null,
  },
  {
    q: "What belongs in driver vs monitor vs scoreboard?",
    short: "Driver creates stimulus, monitor observes, scoreboard checks.",
    deep: "A reusable driver should not contain test-specific functional prediction.",
    followup: null,
    answer: null,
  },
];

// Module 3: Sections

const module3Sections = [
  { id: "objectives", label: "Learning Objectives" },
  { id: "recipe", label: "Protocol Mental Model" },
  { id: "timing", label: "Timing / Waveform Contract" },
  { id: "boundary", label: "Driver Responsibility Boundary" },
  { id: "contract", label: "Seq-Sequencer-Driver Contract" },
  { id: "reset", label: "Reset / Abort Policy" },
  { id: "response", label: "Response / Completion Policy" },
  { id: "memory", label: "Memory Cards" },
  { id: "atlas", label: "Atlas Sheets" },
  { id: "codelabs", label: "Code Labs" },
  { id: "bugs", label: "Bug Gallery" },
  { id: "race", label: "Race-Condition Checklist" },
  { id: "interview", label: "Interview Q&A" },
  { id: "takeaways", label: "Key Takeaways" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
const Module3 = () => {
  return (
    <div className="relative min-h-screen bg-slate-950 text-white font-sans">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-150 h-62.5 bg-linear-to-r from-violet-600/15 to-indigo-600/15 blur-[100px] rounded-full" />

      <div className="relative z-10 flex max-w-7xl mx-auto">
        {/* ── Sidebar TOC (desktop) ────────────────────────────────────── */}
        <ModuleSidebar
          moduleNumber="3"
          title="Universal Driver Recipe"
          sections={module3Sections}
        />

        {/* ── Main Content ─────────────────────────────────────────────── */}
        <main className="flex-1 min-w-0 px-6 py-8 pb-24 max-w-4xl">
          {/* Mobile back */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-violet-400 transition-colors mb-6 lg:hidden"
          >
            <FaArrowLeft size={10} /> Back to Home
          </Link>

          {/* Hero */}
          <ModuleHero
            moduleNumber="3"
            title="Universal Driver Recipe"
            description="Master the 9-step UVM driver skeleton — from GET to ITEM_DONE — covering timing contracts, reset policies, response handling, and boundary discipline."
            metadata={[
              ["Module", "3"],
              ["Reference", "UVM 1.2"],
              ["Level", "Beginner → Senior/Principal"],
              ["Pattern", "GET → … → ITEM_DONE"],
            ]}
          />

          {/* ── §1 Learning Objectives ──────────────────────────────────── */}
          <section id="objectives">
            <SectionHeading num={1} title="Learning Objectives" />
            <ol className="space-y-2 list-decimal list-inside text-slate-300 text-sm leading-relaxed">
              {[
                "Write a reusable UVM driver flow for most non-pipelined command-style protocols.",
                "Explain why item_done() must not be called too early.",
                "Separate transaction intent from pin-level protocol behavior.",
                "Decide where reset, idle, cleanup, response, and error handling belong.",
                "Defend the difference between driver and monitor/scoreboard/assertion responsibility.",
                "Recognize common driver bugs from waveform symptoms.",
                "Explain the driver recipe in interviews without sounding like you memorised UVM syntax only.",
                "Build a driver skeleton that can evolve into APB, AXI-lite, slave, or pipelined drivers.",
              ].map((o, i) => (
                <li key={i} className="pl-2">
                  {o}
                </li>
              ))}
            </ol>
          </section>

          {/* ── §6 Protocol Mental Model ────────────────────────────────── */}
          <section id="recipe">
            <SectionHeading num={6} title="Protocol Mental Model" />
            <p className="text-slate-400 text-sm mb-4">
              A UVM driver's real job is converting{" "}
              <span className="text-violet-300 font-mono">
                transaction intent → legal timed DUT input behavior
              </span>
              . The 9-step recipe is the universal structure that makes that
              safe.
            </p>
            <CodeBlock lang="text">{`1. GET              Obtain next sequence item.
2. DECODE           Interpret item fields into protocol-level intent.
3. WAIT RESET       Ensure reset is inactive, or handle reset abort.
4. WAIT IDLE        Ensure interface is ready for a new transfer.
5. DRIVE            Put request fields onto DUT inputs.
6. HANDSHAKE        Wait for protocol acceptance/completion.
7. SAMPLE RESPONSE  Capture protocol-required DUT response if any.
8. CLEANUP          Return driven outputs to safe idle.
9. ITEM_DONE        Release sequencer item after safe completion.`}</CodeBlock>
            <Callout type="interview">
              <strong>Interview line:</strong> "I structure drivers around
              protocol completion, not around when the assignment statements
              finish."
            </Callout>
          </section>

          {/* ── §7 Timing / Waveform Contract ───────────────────────────── */}
          <section id="timing">
            <SectionHeading num={7} title="Timing / Waveform Contract" />
            <p className="text-slate-400 text-sm mb-2">
              For a simple non-pipelined valid/ready command:
            </p>
            <CodeBlock lang="text">{`Cycle N:     driver drives cmd_valid=1 and cmd_data
Cycle N+k:   DUT asserts cmd_ready=1
Same edge:   handshake occurs if valid && ready
After edge:  driver may sample cmd_err
Next cycle:  driver cleans cmd_valid=0 and cmd_data idle
Then:        item_done()`}</CodeBlock>
            <Callout type="trap">
              <strong>Bad completion point:</strong> Calling item_done() right
              after driving pins, before the handshake completes — the sequence
              can corrupt the in-flight transfer.
            </Callout>
          </section>

          {/* ── §8 Driver Responsibility Boundary ───────────────────────── */}
          <section id="boundary">
            <SectionHeading num={8} title="Driver Responsibility Boundary" />
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-emerald-400 font-semibold mb-2">
                  Driver Owns
                </p>
                <Table
                  headers={["Responsibility", "?"]}
                  rows={[
                    ["Drive DUT inputs", "✓"],
                    ["Obey protocol timing", "✓"],
                    ["Wait for legal acceptance", "✓"],
                    ["Observe ready/backpressure", "✓"],
                    ["Sample response if needed", "✓"],
                    ["Cleanup driven pins", "✓"],
                    ["Handle reset/abort policy", "✓"],
                  ]}
                />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-rose-400 font-semibold mb-2">
                  Driver Does NOT Own
                </p>
                <Table
                  headers={["Responsibility", "Owner"]}
                  rows={[
                    ["Functional correctness check", "Scoreboard"],
                    ["Passive protocol observation", "Monitor"],
                    ["Temporal property checking", "Assertions"],
                    ["Coverage sampling", "Monitor/coverage"],
                    ["Predict final DUT state", "Scoreboard"],
                  ]}
                />
              </div>
            </div>
          </section>

          {/* ── §9 Sequencer-Driver Contract ────────────────────────────── */}
          <section id="contract">
            <SectionHeading
              num={9}
              title="Sequence-Sequencer-Driver Contract"
            />
            <CollapsibleCard
              title="Blocking Pull Contract — get_next_item() + item_done()"
              accent="violet"
            >
              <Callout type="concept">
                Every successful get_next_item() must eventually be followed by
                exactly one item_done(). Not zero. Not two. Not early.
              </Callout>
              <CodeBlock lang="systemverilog">{`seq_item_port.get_next_item(req);
// drive item to completion
seq_item_port.item_done();`}</CodeBlock>
            </CollapsibleCard>
            <CollapsibleCard
              title="get() Contract — no item_done()"
              accent="blue"
            >
              <Callout type="trap">
                <strong>Bad:</strong> Pairing get() with item_done() is a
                contract violation.
              </Callout>
              <CodeBlock lang="systemverilog">{`seq_item_port.get(req);
// drive item
// NO item_done() here`}</CodeBlock>
            </CollapsibleCard>
            <CollapsibleCard
              title="try_next_item() Contract — null handling required"
              accent="amber"
            >
              <CodeBlock lang="systemverilog">{`seq_item_port.try_next_item(req);
if (req == null) begin
  @(vif.drv_cb);
  return;
end
drive_item(req);
seq_item_port.item_done();`}</CodeBlock>
              <Callout type="trap">
                <strong>Null dereference:</strong> Calling drive_item(req)
                without checking null will fatally crash the simulation.
              </Callout>
            </CollapsibleCard>
          </section>

          {/* ── §10 Reset / Abort Policy ────────────────────────────────── */}
          <section id="reset">
            <SectionHeading num={10} title="Reset / Abort Policy" />
            <p className="text-slate-400 text-sm mb-3">
              A driver must define behavior when reset occurs at 6 possible
              moments: before fetch, after fetch, during drive, during
              handshake, during response, and during cleanup.
            </p>
            <CollapsibleCard
              title="Conservative Non-Pipelined Baseline"
              accent="rose"
              icon={<FaBug size={12} />}
            >
              <CodeBlock lang="text">{`If reset asserted before fetch:
  wait for reset deassertion before fetching.

If reset asserted after fetch but before completion:
  drive idle values immediately.
  call item_done() exactly once to close the open contract.
  optionally mark response status as ABORTED.`}</CodeBlock>
              <Callout type="interview">
                <strong>Interview line:</strong> "A reset-aware driver must not
                leave the sequencer handshake open. It must either complete or
                abort the item, then call item_done()."
              </Callout>
            </CollapsibleCard>
          </section>

          {/* ── §11 Response / Completion Policy ────────────────────────── */}
          <section id="response">
            <SectionHeading num={11} title="Response / Completion Policy" />
            <CollapsibleCard title="No Response Required" accent="emerald">
              <p className="text-slate-400">
                Use when the sequence only needs to know the item was driven —
                no per-item result needed.
              </p>
              <CodeBlock lang="systemverilog">{`seq_item_port.get_next_item(req);
drive_to_completion(req);
seq_item_port.item_done();`}</CodeBlock>
            </CollapsibleCard>
            <CollapsibleCard title="Response Required" accent="violet">
              <p className="text-slate-400">
                Use when DUT returns read data, error status, or the sequence
                needs completion status.
              </p>
              <CodeBlock lang="systemverilog">{`seq_item_port.get_next_item(req);
drive_to_completion(req);

rsp = simple_rsp::type_id::create("rsp");
rsp.set_id_info(req);   // <-- always required for routing
rsp.status = status;

seq_item_port.item_done();
seq_item_port.put_response(rsp);`}</CodeBlock>
              <Callout type="trap">
                Do NOT also call item_done(rsp) if you already used item_done()
                + put_response(). Never mix both styles for the same item.
              </Callout>
            </CollapsibleCard>
          </section>

          {/* ── §13 Memory Cards ────────────────────────────────────────── */}
          <section id="memory">
            <SectionHeading num={13} title="Memory Cards" />

            {module3MemoryCards.map((card) => (
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

          {/* ── §14 Atlas Sheets ────────────────────────────────────────── */}
          <section id="atlas">
            <SectionHeading num={14} title="Atlas Sheets" />
            <CollapsibleCard
              title="Atlas Sheet 1 — Recipe Step Map"
              accent="blue"
              icon={<FaListAlt size={12} />}
            >
              <Table
                headers={[
                  "Step",
                  "Protocol Meaning",
                  "UVM Meaning",
                  "Bug If Missing",
                ]}
                rows={[
                  [
                    "GET",
                    "Accept abstract request",
                    "get_next_item(req)",
                    "No stimulus",
                  ],
                  [
                    "DECODE",
                    "Map fields to bus behavior",
                    "local variables",
                    "Illegal pins",
                  ],
                  [
                    "WAIT RESET",
                    "Avoid driving during reset",
                    "reset guard",
                    "X/corrupt transfer",
                  ],
                  [
                    "WAIT IDLE",
                    "Avoid overlap",
                    "driver state check",
                    "Accidental pipelining",
                  ],
                  [
                    "DRIVE",
                    "Present request",
                    "interface assignment",
                    "No DUT stimulus",
                  ],
                  [
                    "HANDSHAKE",
                    "Wait acceptance",
                    "blocking wait",
                    "Early completion",
                  ],
                  [
                    "SAMPLE RESPONSE",
                    "Capture status/data",
                    "fill rsp",
                    "Lost response",
                  ],
                  [
                    "CLEANUP",
                    "Safe idle",
                    "drive idle task",
                    "Repeated transfer",
                  ],
                  [
                    "ITEM_DONE",
                    "Release sequencer item",
                    "item_done()",
                    "Sequence hang/early item",
                  ],
                ]}
              />
            </CollapsibleCard>
            <CollapsibleCard
              title="Atlas Sheet 2 — API Contract Map"
              accent="violet"
            >
              <Table
                headers={[
                  "API Style",
                  "Fetch Call",
                  "Completion Call",
                  "Typical Use",
                ]}
                rows={[
                  [
                    "Blocking pull",
                    "get_next_item(req)",
                    "item_done()",
                    "Canonical non-pipelined",
                  ],
                  [
                    "FIFO-like get",
                    "get(req)",
                    "none",
                    "Simpler consumer style",
                  ],
                  [
                    "Nonblocking try",
                    "try_next_item(req)",
                    "item_done() if non-null",
                    "Opportunistic driver",
                  ],
                  [
                    "Response-producing",
                    "get_next_item(req)",
                    "item_done()+put_response()",
                    "Reads/status/error",
                  ],
                ]}
              />
            </CollapsibleCard>
          </section>

          {/* ── §15 Code Labs ───────────────────────────────────────────── */}
          <section id="codelabs">
            <SectionHeading num={15} title="Code Labs" />
            <CollapsibleCard
              title="Code Lab 1 — Universal Non-Pipelined Driver Skeleton"
              accent="emerald"
              icon={<FaFlask size={12} />}
            >
              <p className="text-slate-400 text-xs mb-2">
                Generic command interface: cmd_valid/cmd_data driven by driver;
                cmd_ready/cmd_err by DUT. Transfer completes on valid && ready.
              </p>
              <CodeBlock lang="systemverilog">{`task drive_one_item(simple_cmd_item req, output cmd_status_e status);
  bit [31:0] decoded_data;
  status = CMD_OK;

  // DECODE
  decoded_data = req.data;

  // WAIT RESET
  if (vif.drv_cb.rst_n !== 1'b1) wait_reset_inactive();

  // WAIT IDLE
  while (vif.cmd_valid !== 1'b0) begin
    @(vif.drv_cb);
    if (vif.drv_cb.rst_n !== 1'b1) begin
      drive_idle(); status = CMD_ABORTED; return;
    end
  end

  // DRIVE
  vif.drv_cb.cmd_data  <= decoded_data;
  vif.drv_cb.cmd_valid <= 1'b1;

  // HANDSHAKE
  do begin
    @(vif.drv_cb);
    if (vif.drv_cb.rst_n !== 1'b1) begin
      drive_idle(); status = CMD_ABORTED; return;
    end
  end while (vif.drv_cb.cmd_ready !== 1'b1);

  // SAMPLE RESPONSE
  status = vif.drv_cb.cmd_err ? CMD_ERR : CMD_OK;

  // CLEANUP
  drive_idle();
  @(vif.drv_cb);
endtask`}</CodeBlock>
            </CollapsibleCard>
            <CollapsibleCard
              title="Code Lab 2 — try_next_item() Idle Polling Driver"
              accent="blue"
              icon={<FaFlask size={12} />}
            >
              <Callout type="concept">
                Key point: try_next_item() may return null. item_done() is
                called only after a non-null item was accepted.
              </Callout>
              <CodeBlock lang="systemverilog">{`task run_phase(uvm_phase phase);
  simple_cmd_item req;
  vif.drv_cb.cmd_valid <= 1'b0;
  vif.drv_cb.cmd_data  <= '0;

  forever begin
    if (vif.drv_cb.rst_n !== 1'b1) begin
      vif.drv_cb.cmd_valid <= 1'b0;
      vif.drv_cb.cmd_data  <= '0;
      @(vif.drv_cb); continue;
    end

    seq_item_port.try_next_item(req);
    if (req == null) begin
      vif.drv_cb.cmd_valid <= 1'b0;
      @(vif.drv_cb); continue;
    end

    vif.drv_cb.cmd_data  <= req.data;
    vif.drv_cb.cmd_valid <= 1'b1;

    do begin
      @(vif.drv_cb);
      if (vif.drv_cb.rst_n !== 1'b1) begin
        vif.drv_cb.cmd_valid <= 1'b0; break;
      end
    end while (vif.drv_cb.cmd_ready !== 1'b1);

    vif.drv_cb.cmd_valid <= 1'b0;
    @(vif.drv_cb);
    seq_item_port.item_done();
  end
endtask`}</CodeBlock>
            </CollapsibleCard>
          </section>

          {/* ── §16 Bug Gallery ─────────────────────────────────────────── */}
          <section id="bugs">
            <SectionHeading num={16} title="Bug Gallery" />

            {module3BugGallery.map((bug) => (
              <CollapsibleCard
                key={bug.title}
                title={bug.title}
                accent="rose"
                icon={<FaBug size={12} />}
              >
                <CodeBlock lang="systemverilog">{bug.bad}</CodeBlock>

                <Callout type="trap">
                  <strong>Symptom:</strong> {bug.symptom}
                </Callout>

                <p className="text-xs text-slate-400">
                  <strong>Waveform:</strong> {bug.waveform}
                </p>

                <p className="text-xs text-slate-400">
                  <strong>Cause:</strong> {bug.cause}
                </p>

                <CodeBlock lang="systemverilog">{bug.fix}</CodeBlock>

                <Callout type="interview">{bug.interview}</Callout>
              </CollapsibleCard>
            ))}
          </section>

          {/* ── §17 Race-Condition Checklist ────────────────────────────── */}
          <section id="race">
            <SectionHeading num={17} title="Race-Condition Checklist" />
            <Table
              headers={["Question", "Correct Bias"]}
              rows={[
                ["DUT inputs driven through clocking block?", "Yes"],
                ["DUT outputs sampled at protocol-defined edges?", "Yes"],
                ["ready sampled only where protocol says it's valid?", "Yes"],
                [
                  "Response sampled before cleanup changes driver outputs?",
                  "Yes",
                ],
                ["Payload stable while valid=1 and ready=0?", "Yes"],
                ["item_done() after stable completion?", "Yes"],
                ["Reset checks synchronised to testbench contract?", "Yes"],
              ]}
            />
            <Callout type="interview">
              <strong>Interview line:</strong> "Clocking blocks are not
              decoration. They define the driver's sampling and driving region."
            </Callout>
          </section>

          {/* ── §23 Interview Q&A ────────────────────────────────────────── */}
          <section id="interview">
            <SectionHeading num={23} title="Interview Q&A" />

            {module3InterviewQA.map((qa) => (
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

          {/* ── §25 Key Takeaways ────────────────────────────────────────── */}
          <section id="takeaways">
            <SectionHeading num={25} title="Key Takeaways" />
            <ol className="space-y-2 list-decimal list-inside text-slate-300 text-sm">
              {[
                "The driver recipe is a sequencing discipline, not a coding ritual.",
                "get_next_item() opens a contract; item_done() closes it.",
                "item_done() must not come before the protocol completion point in a non-pipelined driver.",
                "Cleanup is mandatory — stale driven values can create duplicate transfers.",
                "Reset handling must clean both pins and sequencer-driver state.",
                "Response objects are required only when the sequence needs response data/status.",
                "The driver may sample protocol-required DUT outputs but must not become a scoreboard.",
                "Clocking blocks reduce race ambiguity in driver timing.",
                "try_next_item() requires null handling.",
                "A senior-quality driver has explicit completion, reset, response, and ownership policies.",
              ].map((t, i) => (
                <li key={i} className="pl-2">
                  {t}
                </li>
              ))}
            </ol>

            {/* Final Recall Card */}
            <div className="mt-8 rounded-2xl bg-linear-to-br from-violet-600/10 to-indigo-600/10 border border-violet-500/20 p-6">
              <p className="text-xs uppercase tracking-widest text-violet-400 font-semibold mb-3">
                One-Line Interview Answer
              </p>
              <p className="text-slate-200 text-sm leading-relaxed italic">
                "A good UVM driver is a timing-safe translator from
                sequence-item intent to legal DUT input activity, and
                item_done() must reflect the chosen protocol completion
                contract."
              </p>
            </div>
          </section>

          {/* Navigation to next module */}
          <ModuleNavigation
            nextPath="/module4"
            nextTitle="Module 4: Driver Type Taxonomy →"
          />
        </main>
      </div>
    </div>
  );
};

export default Module3;
