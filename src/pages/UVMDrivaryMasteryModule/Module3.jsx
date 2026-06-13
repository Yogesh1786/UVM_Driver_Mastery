import {
  FaBook,
  FaBug,
  FaFlask,
  FaQuestionCircle,
  FaListAlt,
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
          <BackToHomeBtn />

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
          {/* ── §2 How to Use This Module ───────────────────────────── */}
          <section id="how-to-use">
            <SectionHeading num={2} title="How to Use This Module" />

            <p className="text-slate-400 text-sm mb-6">
              Read this module in three passes:
            </p>

            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-bold text-slate-200 mb-3">
                  Pass 1 — Behavior
                </h3>

                <p className="text-slate-400 mb-2">
                  Focus on what the driver must do at the protocol level.
                </p>

                <p className="text-slate-400 mb-2">
                  Do not start with UVM code.
                </p>

                <p className="text-slate-400">
                  The driver exists to convert a transaction request into legal
                  DUT input activity.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-200 mb-3">
                  Pass 2 — Timing
                </h3>

                <p className="text-slate-400 mb-2">
                  Study when the driver drives, when it samples, when it waits,
                  and when it cleans up.
                </p>

                <p className="text-slate-400">
                  A driver bug is usually a timing-contract bug, not a syntax
                  bug.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-200 mb-3">
                  Pass 3 — UVM Implementation
                </h3>

                <p className="text-slate-400 mb-4">
                  Only after behavior and timing are clear, map the recipe into:
                </p>

                <CodeBlock lang="systemverilog">{`seq_item_port.get_next_item(req);
...
seq_item_port.item_done();`}</CodeBlock>

                <p className="text-slate-400 mt-4 mb-4">
                  or into a response-producing contract using:
                </p>

                <CodeBlock lang="systemverilog">{`rsp.set_id_info(req);
seq_item_port.put_response(rsp);`}</CodeBlock>
              </div>
            </div>
          </section>
          {/* ── §3 Visual Tag Legend ───────────────────────────── */}
          <section id="legend">
            <SectionHeading num={3} title="Visual Tag Legend" />

            <Table
              headers={["Tag", "Meaning"]}
              rows={[
                ["[PROTOCOL]", "Pin-level or bus-level behavior"],
                ["[WAVEFORM]", "Cycle/timing rule"],
                ["[UVM]", "UVM implementation detail"],
                ["[RESET]", "Reset/abort handling"],
                ["[RACE]", "Race-condition warning"],
                [
                  "[BOUNDARY]",
                  "Driver versus monitor/scoreboard/assertion responsibility",
                ],
                ["[INTERVIEW]", "Interview-ready phrasing"],
                ["[BUG]", "Known failure mode"],
                ["[SENIOR]", "Senior/principal-level design judgment"],
              ]}
            />
          </section>
          {/* ── §4 Module-Specific Acceptance Checklist ───────────────────────────── */}
          <section id="acceptance">
            <SectionHeading
              num={4}
              title="Module-Specific Acceptance Checklist"
            />

            <p className="text-slate-400 text-sm mb-5">
              A correct Module 3 output must prove the following:
            </p>

            <ol className="space-y-2 list-decimal list-inside text-slate-300 text-sm leading-relaxed">
              <li>The universal driver recipe is explained step-by-step.</li>

              <li>
                Each step has a reason, failure mode, and code consequence.
              </li>

              <li>
                get_next_item() and item_done() are used as a paired blocking
                pull contract.
              </li>

              <li>
                get() is treated as a different sequencer-driver API contract.
              </li>

              <li>try_next_item() null handling is explained.</li>

              <li>
                item_done() timing is tied to driver completion semantics.
              </li>

              <li>
                Reset handling is explained before fetch, during execution, and
                during cleanup.
              </li>

              <li>
                Cleanup-to-idle is treated as part of the protocol contract.
              </li>

              <li>Response object creation is explained only when required.</li>

              <li>set_id_info(req) is used when response routing matters.</li>

              <li>Driver does not become a scoreboard.</li>

              <li>Functional checking is kept outside the driver.</li>

              <li>Minimal protocol safety checks are allowed but bounded.</li>

              <li>
                Race conditions are tied to clocking, sampling, and assignment
                choices.
              </li>

              <li>Code labs are compile-oriented and UVM 1.2 compatible.</li>

              <li>Bug gallery includes realistic debug symptoms.</li>

              <li>
                Interview answers defend architectural choices, not only syntax.
              </li>
            </ol>
          </section>
          {/* ── §5 Scope and Non-Scope ───────────────────────────── */}
          <section id="scope">
            <SectionHeading num={5} title="Scope and Non-Scope" />

            <h3 className="text-xl font-bold text-slate-200 mb-3">In Scope</h3>

            <p className="text-slate-400 mb-4">
              This module covers the generic driver execution skeleton:
            </p>

            <CodeBlock lang="text">{`GET
DECODE
WAIT RESET
WAIT IDLE
DRIVE
HANDSHAKE
SAMPLE RESPONSE
CLEANUP
ITEM_DONE`}</CodeBlock>

            <p className="text-slate-400 mt-6 mb-3">
              It explains how this skeleton applies to:
            </p>

            <ul className="list-disc list-inside space-y-2 text-slate-300 text-sm">
              <li>simple command drivers</li>
              <li>single-request single-completion drivers</li>
              <li>ready/valid-style examples at a generic level</li>
              <li>response-producing drivers</li>
              <li>reset-aware non-pipelined drivers</li>
            </ul>

            <h3 className="text-xl font-bold text-slate-200 mt-10 mb-3">
              Non-Scope
            </h3>

            <p className="text-slate-400 mb-4">
              This module does <strong>not</strong> deeply teach:
            </p>

            <Table
              headers={["Topic", "Reason"]}
              rows={[
                [
                  "APB timing details",
                  "Forward Reference: Module 6 and Module 8",
                ],
                ["Ready/valid streaming depth", "Forward Reference: Module 9"],
                [
                  "AXI4-Lite independent channels",
                  "Forward Reference: Module 10",
                ],
                [
                  "Pipelined/outstanding drivers",
                  "Forward Reference: Module 11",
                ],
                ["Slave/reactive drivers", "Forward Reference: Module 12"],
                ["Clocking-block race theory", "Forward Reference: Module 7"],
                ["Scoreboard design", "Not driver scope"],
                ["Assertion architecture", "Only boundary is covered here"],
              ]}
            />
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

          {/* ── §12 Protocol Ownership Matrix ──────────────────────────────────── */}
          <section id="ownership">
            <SectionHeading num={12} title="Protocol Ownership Matrix" />

            <p className="text-slate-400 mb-5">
              The table below defines ownership boundaries between major UVM
              verification components. Understanding these responsibilities is
              essential for building reusable drivers.
            </p>

            <Table
              headers={[
                "Recipe Step",
                "Driver",
                "Sequencer",
                "Sequence",
                "Monitor",
                "Scoreboard",
                "Assertions",
              ]}
              rows={[
                [
                  "Generate transaction intent",
                  "No",
                  "Arbitrates",
                  "Yes",
                  "No",
                  "No",
                  "No",
                ],
                [
                  "Select next item",
                  "Requests",
                  "Yes",
                  "Supplies",
                  "No",
                  "No",
                  "No",
                ],
                [
                  "Decode fields for driving",
                  "Yes",
                  "No",
                  "No",
                  "No",
                  "No",
                  "No",
                ],
                ["Drive DUT inputs", "Yes", "No", "No", "No", "No", "No"],
                [
                  "Observe ready/backpressure",
                  "Yes",
                  "No",
                  "No",
                  "Passive duplicate",
                  "No",
                  "May check",
                ],
                [
                  "Sample protocol response for rsp",
                  "Yes",
                  "No",
                  "No",
                  "Passive duplicate",
                  "No",
                  "May check",
                ],
                [
                  "Observe all bus activity",
                  "No",
                  "No",
                  "No",
                  "Yes",
                  "No",
                  "May check",
                ],
                [
                  "Predict expected behavior",
                  "No",
                  "No",
                  "Maybe",
                  "No",
                  "Yes",
                  "No",
                ],
                [
                  "Compare expected vs actual",
                  "No",
                  "No",
                  "No",
                  "No",
                  "Yes",
                  "No",
                ],
                [
                  "Check temporal protocol rules",
                  "Minimal safety only",
                  "No",
                  "No",
                  "No",
                  "No",
                  "Yes",
                ],
                ["Cleanup driven outputs", "Yes", "No", "No", "No", "No", "No"],
                [
                  "Mark sequence item complete",
                  "Yes",
                  "Receives",
                  "Waits",
                  "No",
                  "No",
                  "No",
                ],
              ]}
            />

            <Callout type="concept">
              <strong>Design Principle:</strong> Every verification component
              should own exactly one responsibility. A driver should generate
              legal DUT stimulus, not perform prediction or functional checking.
            </Callout>

            <Callout type="interview">
              <strong>Interview Tip:</strong> If a driver starts comparing
              expected and actual data, it is taking over the scoreboard's
              responsibility and becomes difficult to reuse across projects.
            </Callout>
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

          {/* ── §18 Debug Instrumentation / Log Strategy ─────────────────────── */}
          <section id="debug">
            <SectionHeading
              num={18}
              title="Debug Instrumentation / Log Strategy"
            />

            <p className="text-slate-400 mb-5">
              A production-quality UVM driver should generate meaningful debug
              logs that help correlate waveform activity, protocol timing, and
              sequence execution.
            </p>

            <Table
              headers={["Event", "Recommended Verbosity", "Required Fields"]}
              rows={[
                ["Item fetched", "UVM_MEDIUM", "transaction id, fields"],
                ["Decoded item", "UVM_HIGH", "decoded controls"],
                ["Drive start", "UVM_MEDIUM", "data/control"],
                ["Handshake wait", "UVM_HIGH", "wait count"],
                ["Handshake complete", "UVM_MEDIUM", "cycle count/status"],
                ["Response sampled", "UVM_MEDIUM", "response fields"],
                ["Reset abort", "UVM_LOW or warning", "item id/data/status"],
                ["Cleanup", "UVM_HIGH", "final driven values"],
                ["Item done", "UVM_HIGH", "transaction id"],
              ]}
            />

            <h3 className="text-xl font-bold mt-8 mb-3 text-slate-100">
              Good Log
            </h3>

            <CodeBlock lang="systemverilog">
              {`uvm_info(get_type_name(),
  $sformatf("HANDSHAKE tr_id=%0d data=0x%08h wait_cycles=%0d err=%0b",
            req.get_transaction_id(),
            req.data,
            wait_cycles,
            vif.drv_cb.cmd_err),
  UVM_MEDIUM);`}
            </CodeBlock>

            <h3 className="text-xl font-bold mt-8 mb-3 text-slate-100">
              Bad Log
            </h3>

            <CodeBlock lang="systemverilog">
              {`uvm_info(get_type_name(), "done", UVM_LOW);`}
            </CodeBlock>

            <Callout type="concept">
              <strong>Why is this bad?</strong> A message like{" "}
              <code>"done"</code> tells you almost nothing during debug. It
              contains no transaction ID, payload, protocol state, wait cycles,
              or timing information.
            </Callout>

            <Callout type="hook">
              <strong>Good Debug Logs Answer:</strong>

              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Which transaction?</li>
                <li>What data was driven?</li>
                <li>How many wait cycles occurred?</li>
                <li>Was there an error?</li>
                <li>When did it happen?</li>
              </ul>
            </Callout>

            <Callout type="interview">
              <strong>Interview Tip:</strong> Senior verification engineers
              don't judge a driver only by whether it works—they judge whether
              it can be debugged at 2 AM using only logs and waveforms.
            </Callout>
          </section>

          {/* ── §19 Monitor / Scoreboard / Assertion Boundary ───────────────────── */}
          <section id="boundary-components">
            <SectionHeading
              num={19}
              title="Monitor / Scoreboard / Assertion Boundary"
            />

            <Callout type="concept">
              A professional UVM environment works because every component owns
              a single responsibility. Mixing responsibilities produces
              non-reusable, difficult to debug verification environments.
            </Callout>

            {/* Driver */}

            <h3 className="text-2xl font-bold mt-8 mb-2">Driver</h3>

            <p className="text-slate-400 mb-3">Active component.</p>

            <CodeBlock lang="text">
              {`Drives legal stimulus.
Captures only protocol-required response.
Handles sequencer contract.`}
            </CodeBlock>

            <Callout type="hook">
              Driver converts transaction intent into DUT pin activity.
            </Callout>

            {/* Monitor */}

            <h3 className="text-2xl font-bold mt-8 mb-2">Monitor</h3>

            <p className="text-slate-400 mb-3">Passive component.</p>

            <CodeBlock lang="text">
              {`Observes actual interface activity.
Builds observed transactions.
Does not influence DUT.`}
            </CodeBlock>

            <Callout type="concept">
              A monitor never drives interface signals. It only observes and
              reconstructs protocol transactions.
            </Callout>

            {/* Scoreboard */}

            <h3 className="text-2xl font-bold mt-8 mb-2">Scoreboard</h3>

            <p className="text-slate-400 mb-3">Functional checker.</p>

            <CodeBlock lang="text">
              {`Compares expected versus actual.
Owns prediction and data integrity checking.`}
            </CodeBlock>

            <Callout type="interview">
              Functional correctness belongs to the scoreboard—not the driver.
            </Callout>

            {/* Assertions */}

            <h3 className="text-2xl font-bold mt-8 mb-2">Assertions</h3>

            <p className="text-slate-400 mb-3">Temporal / protocol checker.</p>

            <CodeBlock lang="text">
              {`Checks stable payload,
handshake rules,
no X,
valid/ready timing,
reset properties.`}
            </CodeBlock>

            <Callout type="concept">
              Assertions verify protocol timing and legal signal behavior. They
              are not responsible for predicting functional outputs.
            </Callout>

            {/* Boundary Example */}

            <h3 className="text-2xl font-bold mt-10 mb-3">Boundary Example</h3>

            <p className="text-slate-400 mb-3">
              Stable payload while backpressured:
            </p>

            <CodeBlock lang="text">
              {`Driver:
  should not change payload.

Monitor:
  can observe payload.

Assertion:
  should check payload stability.

Scoreboard:
  usually not responsible for cycle-level stability.`}
            </CodeBlock>

            <Callout type="trap">
              <strong>Common Beginner Mistake:</strong> Comparing expected and
              actual data inside the driver because the driver can "see" the
              response signals. Keep protocol generation and functional checking
              separated.
            </Callout>

            <Callout type="interview">
              <strong>Interview Answer:</strong> Driver generates stimulus,
              Monitor observes, Scoreboard predicts & compares, Assertions
              verify protocol timing.
            </Callout>
          </section>

          {/* ── §20 Architectural Decision Points ─────────────────────────────── */}
          <section id="architecture">
            <SectionHeading num={20} title="Architectural Decision Points" />

            <p className="text-slate-400 mb-6">
              Every reusable driver is the result of a series of architectural
              decisions. Understanding <strong>why</strong> a particular
              implementation was chosen is more valuable than memorizing the
              implementation itself.
            </p>

            {/* ---------------------------------------------------------------- */}
            {/* Decision 1 */}
            {/* ---------------------------------------------------------------- */}

            <h3 className="text-2xl font-bold text-slate-100 mt-8 mb-4">
              Decision 1 — When should <code>item_done()</code> be called?
            </h3>

            <Table
              headers={["Option", "Result"]}
              rows={[
                [
                  "Immediately after get_next_item()",
                  "❌ Wrong. Item released before protocol completion.",
                ],
                [
                  "Immediately after driving pins",
                  "⚠ Sometimes wrong. Handshake may not have completed.",
                ],
                [
                  "After protocol completion",
                  "✅ Correct for non-pipelined drivers.",
                ],
              ]}
            />

            <Callout type="concept">
              <strong>Decision:</strong> Release the sequence item only when the
              driver has finished everything required by the protocol.
            </Callout>

            {/* ---------------------------------------------------------------- */}
            {/* Decision 2 */}
            {/* ---------------------------------------------------------------- */}

            <h3 className="text-2xl font-bold text-slate-100 mt-10 mb-4">
              Decision 2 — Should the driver perform functional checking?
            </h3>

            <Table
              headers={["Option", "Result"]}
              rows={[
                [
                  "Predict expected DUT output",
                  "❌ Scoreboard responsibility.",
                ],
                ["Compare expected vs actual", "❌ Scoreboard responsibility."],
                [
                  "Check protocol legality",
                  "✅ Allowed when required for safe driving.",
                ],
              ]}
            />

            <Callout type="hook">
              Driver owns <strong>protocol legality</strong>, not{" "}
              <strong>functional correctness</strong>.
            </Callout>

            {/* ---------------------------------------------------------------- */}
            {/* Decision 3 */}
            {/* ---------------------------------------------------------------- */}

            <h3 className="text-2xl font-bold text-slate-100 mt-10 mb-4">
              Decision 3 — Should the driver observe DUT outputs?
            </h3>

            <Table
              headers={["Case", "Allowed?"]}
              rows={[
                ["Handshake / ready signal", "✅ Yes"],
                ["Response channel", "✅ Yes"],
                ["Functional prediction", "❌ No"],
                ["Monitor replacement", "❌ Never"],
              ]}
            />

            <Callout type="concept">
              Drivers may sample DUT signals only when required to complete the
              protocol transaction—not to become passive observers.
            </Callout>

            {/* ---------------------------------------------------------------- */}
            {/* Decision 4 */}
            {/* ---------------------------------------------------------------- */}

            <h3 className="text-2xl font-bold text-slate-100 mt-10 mb-4">
              Decision 4 — Reset Recovery
            </h3>

            <Table
              headers={["Reset Timing", "Driver Action"]}
              rows={[
                ["Before get_next_item()", "Wait until reset deasserts."],
                [
                  "During handshake",
                  "Abort safely, clean interface, close contract.",
                ],
                ["After completion", "Normal cleanup."],
              ]}
            />

            <Callout type="interview">
              During interviews, explain <strong>why</strong> your driver
              behaves a certain way. Senior engineers evaluate design decisions
              more than API knowledge.
            </Callout>

            <Callout type="trap">
              <strong>Common Mistake:</strong> Writing a driver that "works"
              without understanding the architectural reason behind each
              decision. Such drivers are difficult to reuse across protocols.
            </Callout>
          </section>

          {/* ── §21 Scalability Notes ───────────────────────────────────────────── */}
          <section id="scalability">
            <SectionHeading num={21} title="Scalability Notes" />

            <p className="text-slate-400 mb-6">
              The universal driver recipe presented in this module is
              intentionally protocol-agnostic. As interfaces become more
              sophisticated, the same high-level execution flow remains valid
              while individual implementation stages evolve.
            </p>

            <Callout type="concept">
              <strong>Key Principle:</strong> Mature driver architectures evolve
              by extending the behavior of each stage—not by abandoning the
              universal recipe.
            </Callout>

            {/* ---------------------------------------------------------------- */}
            {/* Driver Evolution Table */}
            {/* ---------------------------------------------------------------- */}

            <h3 className="text-2xl font-bold text-slate-100 mt-10 mb-4">
              Driver Evolution
            </h3>

            <Table
              headers={[
                "Driver Type",
                "Additional Responsibility",
                "Recipe Changes",
              ]}
              rows={[
                ["Simple Register Driver", "Single request", "Base recipe"],
                ["APB Driver", "Setup + Access phases", "Extended DRIVE stage"],
                [
                  "AXI-Lite Driver",
                  "Independent channels",
                  "Multiple handshake stages",
                ],
                [
                  "Streaming Driver",
                  "Continuous transfers",
                  "Loop around handshake",
                ],
                [
                  "Pipelined Driver",
                  "Outstanding requests",
                  "Separate completion tracking",
                ],
                [
                  "Reactive Driver",
                  "Respond to DUT activity",
                  "Additional WAIT states",
                ],
              ]}
            />

            {/* ---------------------------------------------------------------- */}
            {/* Recipe Stability */}
            {/* ---------------------------------------------------------------- */}

            <h3 className="text-2xl font-bold text-slate-100 mt-10 mb-4">
              What Never Changes?
            </h3>

            <CodeBlock lang="text">
              {`GET
↓
DECODE
↓
WAIT
↓
DRIVE
↓
HANDSHAKE
↓
OPTIONAL RESPONSE
↓
CLEANUP
↓
ITEM_DONE`}
            </CodeBlock>

            <p className="text-slate-400 mt-5">
              Whether you are writing a simple APB driver or a complex AXI
              driver, these logical stages remain identical. Only the
              implementation of each stage becomes more sophisticated.
            </p>

            {/* ---------------------------------------------------------------- */}
            {/* Scaling Decisions */}
            {/* ---------------------------------------------------------------- */}

            <h3 className="text-2xl font-bold text-slate-100 mt-10 mb-4">
              Typical Scaling Decisions
            </h3>

            <Table
              headers={["Problem", "Simple Driver", "Advanced Driver"]}
              rows={[
                [
                  "Outstanding transactions",
                  "One item at a time",
                  "Track multiple active items",
                ],
                [
                  "Backpressure",
                  "Single wait loop",
                  "Independent channel control",
                ],
                ["Response handling", "Optional", "Transaction database"],
                ["Reset", "Abort current item", "Recover entire pipeline"],
                ["Debug", "Simple logs", "Transaction-level tracing"],
              ]}
            />

            {/* ---------------------------------------------------------------- */}
            {/* Senior Design Advice */}
            {/* ---------------------------------------------------------------- */}

            <Callout type="hook">
              <strong>Senior Design Rule:</strong> Never redesign the driver
              because the protocol becomes larger. Extend the implementation
              while preserving the execution model.
            </Callout>

            <Callout type="interview">
              <strong>Interview Question:</strong> How would you extend a
              non-pipelined driver to support outstanding transactions?
              <div className="mt-3 text-slate-300">
                Answer by explaining which stages change (tracking, completion,
                response) while emphasizing that the overall driver recipe
                remains unchanged.
              </div>
            </Callout>

            <Callout type="trap">
              <strong>Common Mistake:</strong> Developers often duplicate entire
              drivers for new protocols. A better approach is to preserve the
              universal recipe and customize only the protocol-specific stages.
            </Callout>

            {/* ---------------------------------------------------------------- */}
            {/* Final Takeaway */}
            {/* ---------------------------------------------------------------- */}

            <div className="mt-8 rounded-xl border border-violet-500/20 bg-violet-500/5 p-5">
              <h4 className="text-lg font-semibold text-violet-300 mb-3">
                Final Takeaway
              </h4>

              <p className="text-slate-300 leading-7">
                Scalability comes from designing reusable execution stages—not
                from rewriting the driver for every protocol. The universal
                recipe scales naturally from APB to AXI, from single-command
                interfaces to highly pipelined protocols, because the underlying
                execution model remains constant.
              </p>
            </div>
          </section>

          {/* ── §22 Module Review Checklist ───────────────────────────────────── */}
          <section id="review">
            <SectionHeading num={22} title="Module Review Checklist" />

            <p className="text-slate-400 mb-6">
              Before moving to the next module, verify that you can confidently
              explain every topic below without referring to your notes.
            </p>

            <div className="space-y-4">
              <CollapsibleCard
                title="Core Driver Architecture"
                accent="violet"
                defaultOpen={true}
              >
                <ul className="space-y-2 list-disc ml-5 text-slate-300">
                  <li>Understand the Universal Driver Recipe.</li>
                  <li>Know the responsibility of every stage.</li>
                  <li>Explain why the order of execution matters.</li>
                  <li>
                    Differentiate protocol completion from assignment
                    completion.
                  </li>
                </ul>
              </CollapsibleCard>

              <CollapsibleCard
                title="Sequencer Contract"
                accent="blue"
                defaultOpen={false}
              >
                <ul className="space-y-2 list-disc ml-5 text-slate-300">
                  <li>Know when get_next_item() should be used.</li>
                  <li>Know when get() should be used.</li>
                  <li>
                    Understand why item_done() is mandatory after
                    get_next_item().
                  </li>
                  <li>Understand response handling using put_response().</li>
                </ul>
              </CollapsibleCard>

              <CollapsibleCard
                title="Protocol Timing"
                accent="emerald"
                defaultOpen={false}
              >
                <ul className="space-y-2 list-disc ml-5 text-slate-300">
                  <li>Handshake completion.</li>
                  <li>Ready / Valid synchronization.</li>
                  <li>Cleanup before releasing the item.</li>
                  <li>Reset recovery behavior.</li>
                </ul>
              </CollapsibleCard>

              <CollapsibleCard
                title="Driver Responsibilities"
                accent="amber"
                defaultOpen={false}
              >
                <ul className="space-y-2 list-disc ml-5 text-slate-300">
                  <li>Generate legal protocol stimulus.</li>
                  <li>Never become a scoreboard.</li>
                  <li>Never predict functional outputs.</li>
                  <li>Keep implementation reusable.</li>
                </ul>
              </CollapsibleCard>

              <CollapsibleCard
                title="Debugging"
                accent="rose"
                defaultOpen={false}
              >
                <ul className="space-y-2 list-disc ml-5 text-slate-300">
                  <li>Read waveform together with UVM logs.</li>
                  <li>Correlate transaction IDs.</li>
                  <li>Identify protocol violations.</li>
                  <li>Debug reset corner cases.</li>
                </ul>
              </CollapsibleCard>
            </div>

            <Callout type="hook">
              If you cannot explain one checklist item in your own words,
              revisit that section before moving to Module 4.
            </Callout>

            <Callout type="interview">
              <strong>Interview Advice:</strong> Interviewers rarely ask you to
              recite APIs. They usually ask why the driver behaves the way it
              does. Being able to explain the checklist above is a strong
              indicator that you've understood the module rather than memorized
              it.
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

          {/* ── §24 Final Recall Card ─────────────────────────────────────────── */}
          <section id="recall">
            <SectionHeading num={24} title="Final Recall Card" />

            <p className="text-slate-400 mb-8">
              Before leaving this module, try to recall every concept below
              without looking at previous sections. If you can explain each
              point in your own words, you're ready for the next module.
            </p>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-5">
                <h3 className="text-lg font-semibold text-violet-300 mb-4">
                  Universal Driver Recipe
                </h3>

                <CodeBlock lang="text">
                  {`GET
↓
DECODE
↓
WAIT RESET
↓
WAIT IDLE
↓
DRIVE
↓
HANDSHAKE
↓
OPTIONAL RESPONSE
↓
CLEANUP
↓
ITEM_DONE`}
                </CodeBlock>
              </div>

              <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-5">
                <h3 className="text-lg font-semibold text-blue-300 mb-4">
                  Remember These Rules
                </h3>

                <ul className="space-y-3 text-slate-300 text-sm leading-relaxed">
                  <li>✓ Driver generates legal protocol stimulus.</li>

                  <li>✓ Driver is NOT a scoreboard.</li>

                  <li>✓ Driver is NOT a monitor.</li>

                  <li>✓ Driver owns protocol timing.</li>

                  <li>✓ Driver must cleanup before releasing the item.</li>

                  <li>✓ item_done() means protocol completion.</li>
                </ul>
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-3 mt-8">
              <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-5">
                <h4 className="font-semibold text-slate-100 mb-3">
                  Sequencer Contract
                </h4>

                <ul className="space-y-2 text-sm text-slate-300">
                  <li>• get_next_item() opens a contract.</li>
                  <li>• item_done() closes it.</li>
                  <li>• One GET → One DONE.</li>
                  <li>• Never call DONE twice.</li>
                </ul>
              </div>

              <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-5">
                <h4 className="font-semibold text-slate-100 mb-3">
                  Protocol Rules
                </h4>

                <ul className="space-y-2 text-sm text-slate-300">
                  <li>• Wait for legal conditions.</li>
                  <li>• Respect handshake.</li>
                  <li>• Sample response correctly.</li>
                  <li>• Return interface to idle.</li>
                </ul>
              </div>

              <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-5">
                <h4 className="font-semibold text-slate-100 mb-3">
                  Component Boundary
                </h4>

                <ul className="space-y-2 text-sm text-slate-300">
                  <li>Driver → Stimulus</li>
                  <li>Monitor → Observe</li>
                  <li>Scoreboard → Compare</li>
                  <li>Assertions → Protocol timing</li>
                </ul>
              </div>
            </div>

            <Callout type="hook">
              <strong>30 Second Revision:</strong>

              <div className="mt-3 text-slate-300 leading-7">
                Driver gets a transaction from the sequencer, converts it into
                legal DUT activity, waits until the protocol completes,
                optionally captures the response, cleans up the interface, and
                finally releases the sequence item.
              </div>
            </Callout>

            <Callout type="interview">
              <strong>Interview Summary:</strong>

              <div className="mt-3 text-slate-300 leading-7">
                If an interviewer asks <em>"Explain how a UVM driver works"</em>
                , you should be able to explain this entire page without looking
                at any notes.
              </div>
            </Callout>

            <div className="mt-8 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6">
              <h3 className="text-xl font-bold text-emerald-300 mb-4">
                One-Line Mental Model
              </h3>

              <p className="text-lg text-slate-200 leading-8">
                <strong>
                  A UVM Driver is a protocol translator that converts abstract
                  transactions into legal DUT pin activity while maintaining the
                  sequencer contract.
                </strong>
              </p>
            </div>
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

          {/* ── §26 Interview Questions ───────────────────────────────────── */}
          <section id="interview">
            <SectionHeading num={26} title="Interview Questions" />

            <p className="text-slate-400 mb-8">
              Test your understanding before moving to the next module. Try
              answering each question yourself before expanding the solution.
            </p>

            {[
              {
                q: "Explain the Universal UVM Driver Recipe.",
                a: "The universal driver recipe is: GET → DECODE → WAIT RESET → WAIT IDLE → DRIVE → HANDSHAKE → SAMPLE RESPONSE → CLEANUP → ITEM_DONE. Every reusable driver follows these logical stages regardless of protocol.",
              },
              {
                q: "Why is item_done() dangerous if called too early?",
                a: "Calling item_done() early tells the sequencer that the transaction has completed even though the protocol may still be active. This can corrupt transactions and violate timing.",
              },
              {
                q: "What is the difference between get_next_item() and get()?",
                a: "get_next_item() requires exactly one matching item_done(). get() automatically removes the item from the sequencer and therefore must NOT be paired with item_done().",
              },
              {
                q: "How should a driver handle reset after accepting an item?",
                a: "The driver should safely abort the transaction, drive the interface back to idle, clean up protocol state, and close the sequencer contract before continuing.",
              },
              {
                q: "When should a driver create a response object?",
                a: "Only when the sequence actually requires information back, such as read data, status information, or error codes.",
              },
              {
                q: "Why is set_id_info(req) needed?",
                a: "It copies the sequence information from the request into the response so the sequencer can correctly match responses to requests.",
              },
              {
                q: "What does cleanup mean in a valid/ready driver?",
                a: "Cleanup means returning all driven outputs to their idle values after protocol completion so duplicate transfers cannot occur.",
              },
              {
                q: "What outputs may a driver legally sample?",
                a: "Only protocol-defined response signals such as READY, ERROR, STATUS, or READ DATA. The driver should never perform functional checking.",
              },
              {
                q: "What belongs in driver versus monitor versus scoreboard?",
                a: "Driver generates stimulus. Monitor observes DUT activity. Scoreboard predicts and compares expected versus actual behavior.",
              },
              {
                q: "How do you avoid race conditions in driver code?",
                a: "Use clocking blocks whenever possible, sample and drive on well-defined clock events, and avoid mixing blocking assignments with asynchronous sampling.",
              },
              {
                q: "What is the difference between request acceptance and response completion?",
                a: "Acceptance means the DUT has accepted the request. Response completion means the operation has finished and optional response information is available.",
              },
              {
                q: "How would this recipe change for a pipelined driver?",
                a: "Multiple requests may be outstanding simultaneously, so item_done() may represent request acceptance instead of final response completion.",
              },
            ].map((item, index) => (
              <CollapsibleCard
                key={index}
                title={`${index + 1}. ${item.q}`}
                accent="emerald"
                defaultOpen={false}
              >
                <p>{item.a}</p>
              </CollapsibleCard>
            ))}
          </section>

          {/* ── §27 Coding Exercise / Mini Assignment ─────────────────────────── */}
          <section id="coding-exercise">
            <SectionHeading
              num={27}
              title="Coding Exercise / Mini Assignment"
            />

            <p className="text-slate-400 mb-6">
              This assignment is designed to reinforce the concepts covered in
              this module. Try to complete every task without referring to
              previous sections. Focus on understanding the driver architecture
              rather than simply writing syntax.
            </p>

            <Callout type="hook">
              Treat this exercise as if you're implementing a production-quality
              driver for a real verification environment.
            </Callout>

            {/* ---------------------------------------------------------------- */}
            {/* Assignment */}
            {/* ---------------------------------------------------------------- */}

            <CollapsibleCard
              title="Assignment 1 — Build a Universal Driver Skeleton"
              accent="violet"
              defaultOpen={true}
            >
              <p className="text-slate-300 mb-4">
                Write a UVM driver skeleton implementing the complete execution
                flow.
              </p>

              <CodeBlock lang="text">
                {`Required Flow

GET
↓
DECODE
↓
WAIT RESET
↓
WAIT IDLE
↓
DRIVE
↓
HANDSHAKE
↓
OPTIONAL RESPONSE
↓
CLEANUP
↓
ITEM_DONE`}
              </CodeBlock>

              <p className="mt-4 text-slate-400">
                Do not implement protocol-specific logic yet. Concentrate only
                on the driver architecture.
              </p>
            </CollapsibleCard>

            {/* ---------------------------------------------------------------- */}

            <CollapsibleCard
              title="Assignment 2 — Reset Handling"
              accent="blue"
              defaultOpen={false}
            >
              <p className="text-slate-300 mb-4">
                Extend your driver so that reset can occur at any point during
                execution.
              </p>

              <ul className="list-disc ml-6 space-y-2 text-slate-300">
                <li>Handle reset before GET.</li>
                <li>Handle reset during handshake.</li>
                <li>Return interface to idle.</li>
                <li>Close the sequencer contract correctly.</li>
              </ul>
            </CollapsibleCard>

            {/* ---------------------------------------------------------------- */}

            <CollapsibleCard
              title="Assignment 3 — Response Support"
              accent="emerald"
              defaultOpen={false}
            >
              <p className="text-slate-300 mb-4">
                Modify your driver to support response transactions.
              </p>

              <ul className="list-disc ml-6 space-y-2 text-slate-300">
                <li>Create a response object.</li>
                <li>Copy transaction ID using set_id_info().</li>
                <li>Populate response fields.</li>
                <li>Send the response through put_response().</li>
              </ul>
            </CollapsibleCard>

            {/* ---------------------------------------------------------------- */}

            <CollapsibleCard
              title="Assignment 4 — Debug Instrumentation"
              accent="amber"
              defaultOpen={false}
            >
              <p className="text-slate-300 mb-4">
                Add professional-quality logging to every stage of the driver.
              </p>

              <CodeBlock lang="systemverilog">
                {`GET
DRIVE
HANDSHAKE
RESPONSE
RESET
CLEANUP
ITEM_DONE`}
              </CodeBlock>

              <p className="mt-4 text-slate-400">
                Every log should contain transaction ID, protocol state, and
                useful debugging information.
              </p>
            </CollapsibleCard>

            {/* ---------------------------------------------------------------- */}

            <h3 className="text-2xl font-bold text-slate-100 mt-10 mb-5">
              Evaluation Checklist
            </h3>

            <Table
              headers={["Requirement", "Completed"]}
              rows={[
                ["Universal recipe implemented", "☐"],
                ["Correct use of get_next_item()", "☐"],
                ["Correct placement of item_done()", "☐"],
                ["Reset handling implemented", "☐"],
                ["Cleanup before release", "☐"],
                ["Driver does not perform checking", "☐"],
                ["Response handling supported", "☐"],
                ["Professional debug logs", "☐"],
                ["Readable architecture", "☐"],
                ["Reusable implementation", "☐"],
              ]}
            />

            {/* ---------------------------------------------------------------- */}

            <Callout type="concept">
              <strong>Goal:</strong> This assignment is not about writing
              hundreds of lines of code. It is about demonstrating that you
              understand the execution model of a reusable UVM driver.
            </Callout>

            <Callout type="trap">
              <strong>Common Mistakes</strong>

              <ul className="list-disc ml-6 mt-3 space-y-2">
                <li>Calling item_done() before protocol completion.</li>
                <li>Leaving interface signals asserted after completion.</li>
                <li>Ignoring reset corner cases.</li>
                <li>Mixing scoreboard logic into the driver.</li>
                <li>Writing logs that contain no useful information.</li>
              </ul>
            </Callout>

            <Callout type="interview">
              <strong>Interview Challenge:</strong>

              <p className="mt-3">
                After finishing this assignment, explain your driver
                architecture on a whiteboard without looking at the code. If you
                can explain every stage, every transition, and every design
                decision confidently, you have truly understood this module.
              </p>
            </Callout>

            <div className="mt-8 rounded-2xl border border-violet-500/20 bg-linear-to-r from-violet-500/10 to-indigo-500/10 p-6">
              <h3 className="text-xl font-bold text-violet-300 mb-4">
                ⭐ Bonus Challenge
              </h3>

              <p className="text-slate-300 leading-7">
                Convert your driver into a reusable base driver class and make
                the protocol-specific behavior configurable using virtual
                methods. This is a common design pattern used in enterprise
                verification environments and is an excellent exercise for
                mastering driver scalability.
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
