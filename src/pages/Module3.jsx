import { Link } from "react-router-dom";
import {
  FaBook,
  FaBug,
  FaFlask,
  FaQuestionCircle,
  FaListAlt,
  FaArrowLeft,
} from "react-icons/fa";
import CodeBlock from "../components/CodeBlock";
import Table from "../components/Table";
import Callout from "../components/Callout";
import SectionHeading from "../components/SectionHeading";
import ModuleSidebar from "../components/ModuleSidebar";
import ModuleHero from "../components/ModuleHero";
import ModuleNavigation from "../components/ModuleNavigation";
import CollapsibleCard from "../components/CollapsibleCard";
import { module3Sections } from "../data/module3Sections";

import { module3MemoryCards } from "../data/module3MemoryCards";
import { module3BugGallery } from "../data/module3BugGallery";
import { module3InterviewQA } from "../data/module3InterviewQA";

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
const Module3 = () => {
  return (
    <div className="relative min-h-screen bg-slate-950 text-white font-sans">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[250px] bg-gradient-to-r from-violet-600/15 to-indigo-600/15 blur-[100px] rounded-full" />

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
            <div className="mt-8 rounded-2xl bg-gradient-to-br from-violet-600/10 to-indigo-600/10 border border-violet-500/20 p-6">
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
