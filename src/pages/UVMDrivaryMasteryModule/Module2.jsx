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

const sections = [
  {
    id: "learning-objectives",
    label: "Learning Objectives",
  },
  {
    id: "visual-tag-legend",
    label: "Visual Tag Legend",
  },
  {
    id: "acceptance-checklist",
    label: "Acceptance Checklist",
  },
  {
    id: "scope",
    label: "Scope & Non Scope",
  },
  {
    id: "protocol-mental-model",
    label: "Protocol Mental Model",
  },
  {
    id: "timing-contract",
    label: "Timing Contract",
  },
  {
    id: "driver-boundary",
    label: "Driver Boundary",
  },
  {
    id: "sequence-driver-contract",
    label: "Sequence Driver Contract",
  },
  {
    id: "reset-policy",
    label: "Reset Policy",
  },
  {
    id: "response-policy",
    label: "Response Policy",
  },
  {
    id: "ownership-matrix",
    label: "Ownership Matrix",
  },
  {
    id: "memory-cards",
    label: "Memory Cards",
  },
  {
    id: "atlas-sheets",
    label: "Atlas Sheets",
  },
  {
    id: "code-labs",
    label: "Code Labs",
  },
  {
    id: "bug-gallery",
    label: "Bug Gallery",
  },
  {
    id: "race-checklist",
    label: "Race Checklist",
  },
  {
    id: "interview-qa",
    label: "Interview Q&A",
  },
  {
    id: "architectural-decisions",
    label: "Architectural Decisions",
  },
  {
    id: "review-checklist",
    label: "Review Checklist",
  },
  {
    id: "final-recall-card",
    label: "Final Recall Card",
  },
  {
    id: "key-takeaways",
    label: "Key Takeaways",
  },
  {
    id: "final-readiness-verdict",
    label: "Final Readiness Verdict",
  },
];

const learningObjectives = [
  "Identify every major structural part of a basic UVM driver.",
  "Explain transaction type and virtual interface usage.",
  "Understand factory registration.",
  "Implement constructor and build_phase correctly.",
  "Retrieve virtual interface using uvm_config_db.",
  "Write a legal UVM 1.2 driver skeleton.",
  "Use get_next_item() correctly.",
  "Use item_done() correctly.",
  "Understand response handling.",
  "Implement reset-aware drivers.",
  "Avoid race conditions.",
  "Debug common driver bugs.",
];

const tagLegend = [
  ["[BEHAVIOR]", "Protocol behavior"],
  ["[WAVEFORM]", "Pin-level timing"],
  ["[UVM]", "Framework semantics"],
  ["[BOUNDARY]", "Responsibility split"],
  ["[RESET]", "Reset and abort handling"],
  ["[BUG]", "Common implementation bug"],
  ["[INTERVIEW]", "Interview answer"],
  ["[SENIOR]", "Architecture concern"],
  ["[CODE]", "Implementation details"],
];

const acceptanceChecklist = [
  "Driver skeleton compiles.",
  "Virtual interface is configured.",
  "Factory registration exists.",
  "build_phase retrieves configuration.",
  "run_phase owns time.",
  "Driver retrieves transactions correctly.",
  "item_done() usage is correct.",
  "Reset policy is documented.",
  "Response handling is implemented.",
  "Signal ownership is respected.",
  "Race conditions are avoided.",
  "Driver boundaries are preserved.",
];

const scopeRows = [
  ["Basic UVM Driver Structure", "Pipelined Drivers"],
  ["Virtual Interfaces", "AXI Drivers"],
  ["Factory Registration", "Reactive Drivers"],
  ["build_phase", "Multi-channel Drivers"],
  ["run_phase", "Out-of-order Responses"],
  ["Reset Handling", "Advanced VIP"],
  ["Response Routing", "Protocol-specific Optimization"],
];

const module2MemoryCards = [
  {
    title: "Card 1 — Driver Anatomy Is a Contract, Not Boilerplate",
    hook: "A driver is a contract adapter.",
    concept:
      "A UVM driver converts sequence intent into legal protocol execution.",
    code: `sequence item intent
        ↓
driver timing policy
        ↓
pin-level activity`,
    trap: "Treating the driver as just a forever loop.",
    interview: "A driver is the protocol execution boundary of a UVM agent.",
  },

  {
    title: "Card 2 — Transaction Describes Intent, Not Timing",
    hook: "Transactions answer WHAT, not WHEN.",
    concept:
      "The sequence item carries intent while the driver defines timing.",
    code: `req.addr = 'h1000;
req.data = 'hA5;`,
    trap: "Encoding timing into the transaction.",
    interview:
      "Timing belongs to the protocol implementation inside the driver.",
  },

  {
    title: "Card 3 — The Interface Defines the Physical Protocol Surface",
    hook: "Interfaces define wires, not behavior.",
    concept:
      "The SystemVerilog interface exposes the DUT communication surface.",
    code: `interface simple_if(input logic clk);`,
    trap: "Hardcoding DUT paths inside the driver.",
    interview: "Interfaces decouple protocol implementation from hierarchy.",
  },

  {
    title: "Card 4 — The Virtual Interface Is the Driver's Physical Handle",
    hook: "No virtual interface, no driver.",
    concept: "Drivers use virtual interfaces to access DUT signals.",
    code: `virtual simple_if vif;`,
    trap: "Using a null virtual interface.",
    interview: "Missing VIF binding is a fatal infrastructure error.",
  },

  {
    title: "Card 5 — build_phase Configures; It Does Not Drive",
    hook: "Configuration is not execution.",
    concept: "build_phase retrieves configuration and resources.",
    code: `uvm_config_db#(virtual simple_if)::get(...)`,
    trap: "Driving pins inside build_phase.",
    interview: "build_phase constructs infrastructure; run_phase owns time.",
  },

  {
    title: "Card 6 — run_phase Owns Time",
    hook: "Time exists only in task phases.",
    concept: "All protocol execution occurs in run_phase.",
    code: `task run_phase(uvm_phase phase);`,
    trap: "Using delays inside functions.",
    interview: "run_phase is responsible for temporal behavior.",
  },

  {
    title: "Card 7 — Reset Outputs Before Driving Anything",
    hook: "Reset establishes legal state.",
    concept: "The driver must ensure outputs begin from idle values.",
    code: `vif.valid <= 1'b0;`,
    trap: "Driving transactions before reset completion.",
    interview: "Reset policy is part of driver ownership.",
  },

  {
    title: "Card 8 — Fetch Only When Progress Is Possible",
    hook: "Do not take an item you cannot finish.",
    concept: "Drivers should only accept items when they can make progress.",
    code: `seq_item_port.get_next_item(req);`,
    trap: "Accepting items during reset.",
    interview: "Accepted items must eventually complete.",
  },

  {
    title: "Card 9 — get_next_item() Grants a Live Item",
    hook: "Ownership begins here.",
    concept: "The sequence remains blocked until item_done().",
    code: `seq_item_port.get_next_item(req);`,
    trap: "Forgetting item_done().",
    interview: "get_next_item() establishes ownership semantics.",
  },

  {
    title: "Card 10 — Decode Before Drive",
    hook: "Understand the request first.",
    concept: "Decode transaction fields before driving signals.",
    code: `case(req.kind) ... endcase`,
    trap: "Driving before validating the request.",
    interview: "Decoding separates policy from signal driving.",
  },

  {
    title: "Card 11 — The Drive Task Owns Pin Choreography",
    hook: "Driving is choreography.",
    concept: "The drive task sequences protocol signals.",
    code: `drive_transfer(req);`,
    trap: "Scattering protocol logic everywhere.",
    interview: "A dedicated drive task improves reuse and readability.",
  },

  {
    title: "Card 12 — Hold Payload Stable Until Acceptance",
    hook: "Stable payloads prevent corruption.",
    concept: "Signals must remain stable under backpressure.",
    code: `wait(vif.ready);`,
    trap: "Changing payload while valid is high.",
    interview: "Payload stability is a protocol contract.",
  },

  {
    title: "Card 13 — item_done() Releases Ownership",
    hook: "Ownership ends here.",
    concept:
      "item_done() tells the sequencer that the driver has completed ownership of the request.",
    code: `seq_item_port.item_done();`,
    trap: "Calling item_done() before protocol completion.",
    interview:
      "item_done() marks the completion boundary of the driver contract.",
  },

  {
    title: "Card 14 — Cleanup Is Part of Completion",
    hook: "A transfer ends only after cleanup.",
    concept:
      "After completion, the driver must return signals to legal idle values.",
    code: `vif.valid <= 1'b0;
vif.data  <= '0;`,
    trap: "Leaving valid asserted after completion.",
    interview: "Cleanup is part of the protocol contract.",
  },

  {
    title: "Card 15 — Responses Are Optional",
    hook: "Not every transfer needs a reply.",
    concept:
      "Responses are only required when the sequence expects returned information.",
    code: `seq_item_port.put_response(rsp);`,
    trap: "Creating unnecessary response traffic.",
    interview: "Response creation depends on sequence requirements.",
  },

  {
    title: "Card 16 — set_id_info() Preserves Routing",
    hook: "Responses need an address.",
    concept:
      "set_id_info(req) preserves sequence identity for response routing.",
    code: `rsp.set_id_info(req);`,
    trap: "Sending un-routable responses.",
    interview: "Response routing depends on sequence identity preservation.",
  },

  {
    title: "Card 17 — Drivers Observe, Not Judge",
    hook: "Observe enough to proceed.",
    concept:
      "Drivers may observe handshake signals but must not perform scoreboarding.",
    code: `if(vif.ready) begin
  accepted = 1;
end`,
    trap: "Comparing expected and actual values inside the driver.",
    interview: "Scoreboards own correctness checking.",
  },

  {
    title: "Card 18 — Reset Must Never Deadlock",
    hook: "Accepted items must finish.",
    concept: "Reset cannot leave sequencer items stranded forever.",
    code: `if(reset) begin
  cleanup();
  seq_item_port.item_done();
end`,
    trap: "Waiting forever during reset.",
    interview: "Every accepted item must eventually terminate.",
  },

  {
    title: "Card 19 — Clocking Blocks Define Timing",
    hook: "Edges alone are insufficient.",
    concept: "Clocking blocks reduce race conditions and define timing intent.",
    code: `@(vif.drv_cb);
vif.drv_cb.valid <= 1'b1;`,
    trap: "Using raw posedge logic everywhere.",
    interview: "Clocking blocks improve scheduling determinism.",
  },

  {
    title: "Card 20 — Assignment Style Has Meaning",
    hook: "Blocking and nonblocking express intent.",
    concept:
      "Local variables often use blocking assignment while interface drives use scheduled assignments.",
    code: `accepted = 0;
vif.valid <= 1'b1;`,
    trap: "Using blocking assignments on interface signals carelessly.",
    interview: "Assignment style reflects scheduling semantics.",
  },

  {
    title: "Card 21 — Driver Logs Should Explain Behavior",
    hook: "Logs are executable documentation.",
    concept: "Driver logs should align with protocol milestones.",
    code: `\`uvm_info("DRV",
$sformatf("Driving addr=%0h", req.addr),
UVM_MEDIUM)`,
    trap: "Logging too little or too much.",
    interview: "Useful logs reconstruct protocol execution.",
  },

  {
    title: "Card 22 — Virtual Interface Is Mandatory",
    hook: "No VIF, no driver.",
    concept: "Drivers require a valid virtual interface binding.",
    code: `if(!uvm_config_db#(
virtual simple_if)::get(...))
  \`uvm_fatal("NOVIF","Missing VIF")`,
    trap: "Continuing simulation with null VIF.",
    interview: "Missing infrastructure should fail fast.",
  },

  {
    title: "Card 23 — Request Handles Are References",
    hook: "Handles are not copies.",
    concept:
      "After item_done(), drivers should not rely on the request object.",
    code: `data_copy = req.data;
seq_item_port.item_done();`,
    trap: "Using req after ownership is released.",
    interview: "item_done() ends request ownership.",
  },

  {
    title: "Card 24 — Clean Boundaries Scale VIP",
    hook: "Architecture beats shortcuts.",
    concept: "Reusable VIP depends on strict ownership boundaries.",
    code: `Driver -> Stimulus
Monitor -> Observation
Scoreboard -> Checking`,
    trap: "Putting everything into the driver.",
    interview: "Good boundaries create scalable verification environments.",
  },
];

const module2AtlasSheets = [
  {
    title: "Atlas Sheet 1 — Minimal UVM Driver Skeleton",
    description: "The smallest structurally correct UVM driver.",
    code: `class simple_driver extends uvm_driver #(simple_item);

  \`uvm_component_utils(simple_driver)

  virtual simple_if vif;

  function new(string name, uvm_component parent);
    super.new(name, parent);
  endfunction

  task run_phase(uvm_phase phase);
    forever begin
      seq_item_port.get_next_item(req);

      drive_transfer(req);

      seq_item_port.item_done();
    end
  endtask

endclass`,
  },

  {
    title: "Atlas Sheet 2 — Factory Registration",
    description:
      "Every reusable UVM component should register with the factory.",
    code: `\`uvm_component_utils(simple_driver)`,
  },

  {
    title: "Atlas Sheet 3 — Virtual Interface Declaration",
    description: "The driver needs a physical handle to DUT signals.",
    code: `virtual simple_if vif;`,
  },

  {
    title: "Atlas Sheet 4 — Constructor Pattern",
    description: "Constructors should delegate initialization to the parent.",
    code: `function new(
  string name,
  uvm_component parent
);
  super.new(name, parent);
endfunction`,
  },

  {
    title: "Atlas Sheet 5 — build_phase VIF Retrieval",
    description: "Retrieve infrastructure during build_phase.",
    code: `function void build_phase(
  uvm_phase phase
);
  super.build_phase(phase);

  if (!uvm_config_db#(
      virtual simple_if
    )::get(
      this,
      "",
      "vif",
      vif
    )) begin
    \`uvm_fatal(
      "NOVIF",
      "Virtual interface missing"
    );
  end
endfunction`,
  },

  {
    title: "Atlas Sheet 6 — Basic run_phase",
    description: "run_phase owns protocol execution.",
    code: `task run_phase(
  uvm_phase phase
);
  forever begin
    seq_item_port.get_next_item(req);

    drive_transfer(req);

    seq_item_port.item_done();
  end
endtask`,
  },

  {
    title: "Atlas Sheet 7 — Response Routing",
    description: "Responses should preserve request identity.",
    code: `rsp.set_id_info(req);

seq_item_port.put_response(rsp);`,
  },

  {
    title: "Atlas Sheet 8 — Reset Cleanup",
    description: "Always return outputs to legal idle values.",
    code: `vif.valid <= 1'b0;
vif.data  <= '0;
vif.last  <= 1'b0;`,
  },
];

const module2CodeLabs = [
  {
    title: "Code Lab 1 — Complete the Driver Skeleton",
    objective: "Fill in the missing pieces of a basic UVM driver.",

    starter: `class simple_driver extends uvm_driver #(simple_item);

  \`uvm_component_utils(simple_driver)

  virtual simple_if vif;

  function new(string name, uvm_component parent);
    super.new(name, parent);
  endfunction

  // TODO:
  // Add build_phase()

  // TODO:
  // Add run_phase()

endclass`,

    solution: `class simple_driver extends uvm_driver #(simple_item);

  \`uvm_component_utils(simple_driver)

  virtual simple_if vif;

  function new(string name, uvm_component parent);
    super.new(name, parent);
  endfunction

  function void build_phase(uvm_phase phase);
    super.build_phase(phase);

    if (!uvm_config_db#(
        virtual simple_if
      )::get(
        this,
        "",
        "vif",
        vif
      ))
      \`uvm_fatal("NOVIF","Missing VIF");
  endfunction

  task run_phase(uvm_phase phase);
    forever begin
      seq_item_port.get_next_item(req);

      drive_transfer(req);

      seq_item_port.item_done();
    end
  endtask

endclass`,
  },

  {
    title: "Code Lab 2 — build_phase VIF Retrieval",
    objective: "Retrieve a virtual interface safely.",

    starter: `function void build_phase(
  uvm_phase phase
);
  super.build_phase(phase);

  // TODO:
endfunction`,

    solution: `if (!uvm_config_db#(
      virtual simple_if
    )::get(
      this,
      "",
      "vif",
      vif
    ))
  \`uvm_fatal(
    "NOVIF",
    "Virtual Interface Missing"
  );`,
  },

  {
    title: "Code Lab 3 — Basic run_phase",
    objective: "Implement the sequence-driver contract.",

    starter: `task run_phase(
  uvm_phase phase
);

  forever begin
    // TODO
  end

endtask`,

    solution: `task run_phase(
  uvm_phase phase
);

  forever begin
    seq_item_port.get_next_item(req);

    drive_transfer(req);

    seq_item_port.item_done();
  end

endtask`,
  },

  {
    title: "Code Lab 4 — Response Routing",
    objective: "Preserve request identity when returning responses.",

    starter: `rsp = simple_rsp::type_id::create("rsp");

// TODO

seq_item_port.put_response(rsp);`,

    solution: `rsp = simple_rsp::type_id::create("rsp");

rsp.set_id_info(req);

seq_item_port.put_response(rsp);`,
  },

  {
    title: "Code Lab 5 — Reset Cleanup",
    objective: "Return signals to legal idle values.",

    starter: `task reset_outputs();

  // TODO

endtask`,

    solution: `task reset_outputs();

  vif.valid <= 1'b0;
  vif.data  <= '0;
  vif.last  <= 1'b0;

endtask`,
  },
];

const module2BugGallery = [
  {
    title: "Bug 1 — Missing Virtual Interface",
    symptom:
      "Simulation crashes with null handle access when driving DUT signals.",

    cause: "The virtual interface was never retrieved from uvm_config_db.",

    bad: `task run_phase(uvm_phase phase);
  vif.valid <= 1'b1;
endtask`,

    fix: `if (!uvm_config_db#(
      virtual simple_if
    )::get(
      this,
      "",
      "vif",
      vif
    ))
  \`uvm_fatal(
    "NOVIF",
    "Virtual Interface Missing"
  );`,

    interview: "Missing infrastructure errors should fail immediately.",
  },

  {
    title: "Bug 2 — Forgetting item_done()",
    symptom: "The sequence hangs forever and no new items are issued.",

    cause: "The driver accepted ownership but never released it.",

    bad: `seq_item_port.get_next_item(req);

drive_transfer(req);

// Missing item_done();`,

    fix: `seq_item_port.get_next_item(req);

drive_transfer(req);

seq_item_port.item_done();`,

    interview:
      "Every successful get_next_item() requires an eventual item_done().",
  },

  {
    title: "Bug 3 — item_done() Called Too Early",
    symptom:
      "Protocol corruption occurs because the next transaction starts too early.",

    cause: "Ownership was released before handshake completion.",

    bad: `seq_item_port.get_next_item(req);

vif.valid <= 1'b1;

seq_item_port.item_done();

wait(vif.ready);`,

    fix: `seq_item_port.get_next_item(req);

drive_until_ready(req);

cleanup();

seq_item_port.item_done();`,

    interview: "item_done() marks completion, not transfer start.",
  },

  {
    title: "Bug 4 — Driver Becomes Scoreboard",
    symptom: "Duplicate DUT checks appear in both driver and scoreboard.",

    cause: "Functional checking was added to the driver.",

    bad: `if (vif.rdata != expected)
  \`uvm_error(
    "BAD",
    "Mismatch"
  );`,

    fix: `// Driver captures response.
rsp.rdata = vif.rdata;

// Scoreboard checks correctness.`,

    interview: "Drivers generate stimulus; scoreboards judge behavior.",
  },

  {
    title: "Bug 5 — No Reset Escape",
    symptom: "Simulation hangs forever while waiting for ready.",

    cause: "Reset was ignored inside blocking waits.",

    bad: `wait(vif.ready);`,

    fix: `while (!vif.ready) begin
  @(vif.drv_cb);

  if (!vif.reset_n)
    return;
end`,

    interview: "Every blocking wait must have a reset escape path.",
  },

  {
    title: "Bug 6 — Response Without ID Routing",
    symptom: "The sequence never receives the response.",

    cause: "set_id_info(req) was forgotten.",

    bad: `rsp = simple_rsp::type_id::create("rsp");

seq_item_port.put_response(rsp);`,

    fix: `rsp = simple_rsp::type_id::create("rsp");

rsp.set_id_info(req);

seq_item_port.put_response(rsp);`,

    interview: "Responses require identity preservation.",
  },

  {
    title: "Bug 7 — Driving DUT-Owned Signals",
    symptom: "Backpressure logic never works correctly.",

    cause: "The driver illegally drove DUT outputs.",

    bad: `vif.ready <= 1'b1;`,

    fix: `if (vif.ready)
  transfer_done = 1'b1;`,

    interview: "Drivers should only drive driver-owned signals.",
  },

  {
    title: "Bug 8 — Race Condition on Clock Edge",
    symptom: "The test passes in one simulator and fails in another.",

    cause: "Raw posedge sampling introduced scheduling races.",

    bad: `@(posedge clk);
vif.valid = 1'b1;`,

    fix: `@(vif.drv_cb);
vif.drv_cb.valid <= 1'b1;`,

    interview: "Clocking blocks define scheduling intent.",
  },
];

const module2InterviewQA = [
  {
    q: "What is the role of a UVM driver?",
    a: "A UVM driver converts transaction intent into legal pin-level protocol activity.",
  },
  {
    q: "Why is a virtual interface required?",
    a: "The virtual interface provides the driver with access to DUT signals while decoupling hierarchy.",
  },
  {
    q: "What happens if item_done() is forgotten?",
    a: "The sequencer remains blocked and the sequence hangs indefinitely.",
  },
  {
    q: "Why should drivers avoid scoreboarding?",
    a: "Functional checking belongs to monitor, scoreboard, and assertions.",
  },
  {
    q: "Why use clocking blocks?",
    a: "Clocking blocks define scheduling intent and reduce race conditions.",
  },
  {
    q: "When should responses be sent?",
    a: "Only when the sequence expects returned information.",
  },
  {
    q: "What is the purpose of set_id_info(req)?",
    a: "It preserves request identity for response routing.",
  },
  {
    q: "What is the difference between build_phase and run_phase?",
    a: "build_phase configures infrastructure; run_phase executes protocol behavior.",
  },
];

const Module2 = () => {
  return (
    <div className="relative min-h-screen bg-slate-950 text-white font-sans">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-150 h-62.5 bg-linear-to-r from-violet-600/15 to-indigo-600/15 blur-[100px] rounded-full" />

      <div className="relative z-10 flex max-w-7xl mx-auto">
        <ModuleSidebar
          moduleNumber="2"
          title="Anatomy of a Basic UVM Driver"
          sections={sections}
        />

        <main className="flex-1 min-w-0 px-6 py-8 pb-24 max-w-4xl">
          <BackToHomeBtn to={-1} />

          <ModuleHero
            moduleNumber="2"
            title="Anatomy of a Basic UVM Driver"
            subtitle="Build structurally correct, reset-aware UVM drivers."
          />

          <div className="rounded-2xl bg-linear-to-br from-violet-600/10 to-indigo-600/10 border border-violet-500/20 p-6 mb-8">
            <p className="text-xs uppercase tracking-widest text-violet-400 font-semibold mb-3">
              Module Thesis
            </p>

            <p className="text-slate-300 text-sm leading-relaxed">
              A UVM driver is not simply a forever loop. It is the protocol
              execution boundary between transaction intent and pin-level
              activity.
            </p>
          </div>

          <section id="learning-objectives" className="mt-16 scroll-mt-24">
            <SectionHeading
              number="2"
              title="Learning Objectives"
              icon={<FaBook />}
            />

            <div className="space-y-3">
              {learningObjectives.map((item, idx) => (
                <Callout key={idx} type="concept">
                  {item}
                </Callout>
              ))}
            </div>
          </section>

          <section id="visual-tag-legend" className="mt-16 scroll-mt-24">
            <SectionHeading
              number="4"
              title="Visual Tag Legend"
              icon={<FaListAlt />}
            />

            <Table headers={["Tag", "Meaning"]} rows={tagLegend} />
          </section>

          <section id="acceptance-checklist" className="mt-16 scroll-mt-24">
            <SectionHeading
              number="5"
              title="Acceptance Checklist"
              icon={<FaCheckSquare />}
            />

            <div className="space-y-3">
              {acceptanceChecklist.map((item, idx) => (
                <Callout key={idx} type="success">
                  ✓ {item}
                </Callout>
              ))}
            </div>
          </section>

          <section id="scope" className="mt-16 scroll-mt-24">
            <SectionHeading
              number="6"
              title="Scope & Non Scope"
              icon={<FaListAlt />}
            />

            <Table headers={["In Scope", "Out of Scope"]} rows={scopeRows} />
          </section>

          <section id="protocol-mental-model" className="mt-16 scroll-mt-24">
            <SectionHeading
              number="7"
              title="Protocol Mental Model"
              icon={<FaBook />}
            />

            <Callout type="concept">
              A basic UVM driver is not merely a class with a forever loop.
            </Callout>

            <Callout type="success">
              A driver is a contract adapter between sequence intent and
              protocol execution.
            </Callout>

            <CodeBlock
              language="text"
              code={`sequence item intent
        ↓
sequencer-driver API contract
        ↓
driver decode and timing policy
        ↓
pin-level DUT input activity
        ↓
completion / response policy`}
            />

            <Callout type="warning">
              Most driver bugs are contract bugs rather than syntax bugs.
            </Callout>
          </section>

          <section id="timing-contract" className="mt-16 scroll-mt-24">
            <SectionHeading
              number="8"
              title="Timing / Waveform Contract"
              icon={<FaFlask />}
            />

            <Callout type="concept">
              Transactions describe intent; protocols define timing.
            </Callout>

            <CodeBlock
              language="systemverilog"
              code={`@(vif.drv_cb);

vif.drv_cb.valid <= 1'b1;
vif.drv_cb.data  <= req.data;

wait(vif.drv_cb.ready);

vif.drv_cb.valid <= 1'b0;`}
            />

            <Callout type="warning">
              Payload must remain stable while waiting for acceptance.
            </Callout>
          </section>

          <section id="driver-boundary" className="mt-16 scroll-mt-24">
            <SectionHeading
              number="9"
              title="Driver Responsibility Boundary"
              icon={<FaListAlt />}
            />

            <Table
              headers={["Component", "Responsibility"]}
              rows={[
                ["Sequence", "Creates transaction intent"],
                ["Sequencer", "Arbitrates requests"],
                ["Driver", "Executes protocol"],
                ["Monitor", "Observes behavior"],
                ["Scoreboard", "Checks correctness"],
                ["Assertions", "Verify timing rules"],
              ]}
            />

            <Callout type="success">
              Drivers generate stimulus. They do not judge correctness.
            </Callout>
          </section>

          <section id="sequence-driver-contract" className="mt-16 scroll-mt-24">
            <SectionHeading
              number="10"
              title="Sequence–Sequencer–Driver Contract"
              icon={<FaBook />}
            />

            <CodeBlock
              language="systemverilog"
              code={`seq_item_port.get_next_item(req);

drive_transfer(req);

seq_item_port.item_done();`}
            />

            <Callout type="concept">
              get_next_item() transfers ownership of the request.
            </Callout>

            <Callout type="warning">
              item_done() releases ownership back to the sequencer.
            </Callout>

            <Callout type="danger">
              Missing item_done() can deadlock the sequence.
            </Callout>
          </section>

          <section id="reset-policy" className="mt-16 scroll-mt-24">
            <SectionHeading
              number="11"
              title="Reset / Abort Policy"
              icon={<FaBug />}
            />

            <Callout type="warning">
              Reset is an ownership problem, not only a signal problem.
            </Callout>

            <CodeBlock
              language="systemverilog"
              code={`if (!vif.reset_n) begin
  reset_outputs();

  aborted = 1'b1;

  seq_item_port.item_done();
end`}
            />

            <Callout type="success">
              Every accepted item must eventually complete or abort cleanly.
            </Callout>
          </section>

          <section id="response-policy" className="mt-16 scroll-mt-24">
            <SectionHeading
              number="12"
              title="Response / Completion Policy"
              icon={<FaCheckSquare />}
            />

            <Callout type="concept">
              Responses are optional and exist only when the sequence expects
              them.
            </Callout>

            <CodeBlock
              language="systemverilog"
              code={`rsp = simple_rsp::type_id::create("rsp");

rsp.set_id_info(req);

seq_item_port.put_response(rsp);`}
            />

            <Callout type="warning">
              Missing set_id_info(req) breaks response routing.
            </Callout>

            <Callout type="danger">
              Never send responses that cannot be routed back to the originating
              sequence.
            </Callout>
          </section>

          <section id="ownership-matrix" className="mt-16 scroll-mt-24">
            <SectionHeading
              number="13"
              title="Protocol Ownership Matrix"
              icon={<FaListAlt />}
            />

            <Table
              headers={["Responsibility", "Owner"]}
              rows={[
                ["Transaction Creation", "Sequence"],
                ["Request Arbitration", "Sequencer"],
                ["Pin Driving", "Driver"],
                ["Transaction Observation", "Monitor"],
                ["Functional Checking", "Scoreboard"],
                ["Temporal Verification", "Assertions"],
              ]}
            />

            <Callout type="success">
              Strong ownership boundaries create reusable VIP.
            </Callout>
          </section>

          <section id="memory-cards" className="mt-16 scroll-mt-24">
            <SectionHeading
              number="14"
              title="Memory Cards"
              icon={<FaBook />}
            />

            {module2MemoryCards.map((card, idx) => (
              <CollapsibleCard
                key={idx}
                title={card.title}
                defaultOpen={idx === 0}
              >
                <div className="space-y-4">
                  <Callout type="concept">
                    <strong>Hook:</strong> {card.hook}
                  </Callout>

                  <Callout type="info">
                    <strong>Concept:</strong> {card.concept}
                  </Callout>

                  <CodeBlock language="systemverilog" code={card.code} />

                  <Callout type="warning">
                    <strong>Common Trap:</strong> {card.trap}
                  </Callout>

                  <Callout type="success">
                    <strong>Interview:</strong> {card.interview}
                  </Callout>
                </div>
              </CollapsibleCard>
            ))}
          </section>

          <section id="atlas-sheets" className="mt-16 scroll-mt-24">
            <SectionHeading
              number="15"
              title="Atlas Sheets"
              icon={<FaBook />}
            />

            <div className="space-y-4">
              {module2AtlasSheets.map((sheet, idx) => (
                <CollapsibleCard key={idx} title={sheet.title}>
                  <div className="space-y-4">
                    <Callout type="concept">{sheet.description}</Callout>

                    <CodeBlock language="systemverilog" code={sheet.code} />
                  </div>
                </CollapsibleCard>
              ))}
            </div>
          </section>

          <section id="driver-anatomy" className="mt-16 scroll-mt-24">
            <SectionHeading
              number="16"
              title="Driver Anatomy Summary"
              icon={<FaFlask />}
            />

            <Table
              headers={["Driver Element", "Purpose"]}
              rows={[
                ["Factory Registration", "Factory override support"],
                ["Virtual Interface", "Physical DUT access"],
                ["Constructor", "Initialize component"],
                ["build_phase", "Retrieve configuration"],
                ["run_phase", "Own protocol execution"],
                ["Drive Task", "Implement waveform logic"],
                ["Response Logic", "Return information"],
                ["Reset Logic", "Handle abort and cleanup"],
              ]}
            />

            <Callout type="success">
              A driver is infrastructure + protocol + ownership.
            </Callout>
          </section>

          <section id="code-labs" className="mt-16 scroll-mt-24">
            <SectionHeading number="17" title="Code Labs" icon={<FaFlask />} />

            <div className="space-y-6">
              {module2CodeLabs.map((lab, idx) => (
                <CollapsibleCard key={idx} title={lab.title}>
                  <div className="space-y-4">
                    <Callout type="concept">
                      <strong>Objective:</strong> {lab.objective}
                    </Callout>

                    <div>
                      <h4 className="mb-2 font-semibold text-slate-300">
                        Starter Code
                      </h4>

                      <CodeBlock language="systemverilog" code={lab.starter} />
                    </div>

                    <div>
                      <h4 className="mb-2 font-semibold text-emerald-400">
                        Solution
                      </h4>

                      <CodeBlock language="systemverilog" code={lab.solution} />
                    </div>
                  </div>
                </CollapsibleCard>
              ))}
            </div>
          </section>

          <section id="coding-exercise" className="mt-16 scroll-mt-24">
            <SectionHeading
              number="18"
              title="Coding Exercise"
              icon={<FaFlask />}
            />

            <Callout type="warning">
              Implement a complete non-pipelined driver using:
            </Callout>

            <ul className="list-disc ml-6 mt-4 space-y-2 text-slate-300">
              <li>Factory registration</li>
              <li>Virtual interface retrieval</li>
              <li>build_phase()</li>
              <li>run_phase()</li>
              <li>get_next_item()</li>
              <li>item_done()</li>
              <li>Reset handling</li>
              <li>Response routing</li>
            </ul>

            <Callout type="success" className="mt-4">
              Bonus: Add protocol-specific cleanup logic.
            </Callout>
          </section>

          <section id="bug-gallery" className="mt-16 scroll-mt-24">
            <SectionHeading number="19" title="Bug Gallery" icon={<FaBug />} />

            <div className="space-y-6">
              {module2BugGallery.map((bug, idx) => (
                <CollapsibleCard key={idx} title={bug.title}>
                  <div className="space-y-4">
                    <Callout type="warning">
                      <strong>Symptom:</strong> {bug.symptom}
                    </Callout>

                    <Callout type="danger">
                      <strong>Cause:</strong> {bug.cause}
                    </Callout>

                    <div>
                      <h4 className="mb-2 font-semibold text-rose-400">
                        Buggy Code
                      </h4>

                      <CodeBlock language="systemverilog" code={bug.bad} />
                    </div>

                    <div>
                      <h4 className="mb-2 font-semibold text-emerald-400">
                        Fixed Code
                      </h4>

                      <CodeBlock language="systemverilog" code={bug.fix} />
                    </div>

                    <Callout type="success">
                      <strong>Interview:</strong> {bug.interview}
                    </Callout>
                  </div>
                </CollapsibleCard>
              ))}
            </div>
          </section>

          <section id="race-checklist" className="mt-16 scroll-mt-24">
            <SectionHeading
              number="20"
              title="Race Condition Checklist"
              icon={<FaBug />}
            />

            <div className="space-y-3">
              {[
                "Use clocking blocks for drive/sample separation.",
                "Avoid raw @(posedge clk) when timing matters.",
                "Keep payload stable during valid/ready handshakes.",
                "Use nonblocking assignments for interface signals.",
                "Document sampling regions explicitly.",
              ].map((item, idx) => (
                <Callout key={idx} type="warning">
                  ✓ {item}
                </Callout>
              ))}
            </div>
          </section>

          <section id="interview-qa" className="mt-16 scroll-mt-24">
            <SectionHeading
              number="21"
              title="Interview Q&A"
              icon={<FaQuestionCircle />}
            />

            <div className="space-y-4">
              {module2InterviewQA.map((item, idx) => (
                <CollapsibleCard key={idx} title={item.q}>
                  <Callout type="success">{item.a}</Callout>
                </CollapsibleCard>
              ))}
            </div>
          </section>

          <section id="architectural-decisions" className="mt-16 scroll-mt-24">
            <SectionHeading
              number="22"
              title="Architectural Decisions"
              icon={<FaListAlt />}
            />

            <Table
              headers={["Decision", "Recommended Choice"]}
              rows={[
                ["Signal ownership", "Driver drives only driver-owned signals"],
                ["Reset handling", "Abort or cleanup accepted items"],
                ["Response routing", "Use set_id_info(req)"],
                ["Timing", "Use clocking blocks"],
                ["Correctness checking", "Use scoreboard/assertions"],
                ["Infrastructure failure", "Fail fast using uvm_fatal"],
              ]}
            />

            <Callout type="concept">
              Good architecture scales from toy drivers to reusable VIP.
            </Callout>
          </section>

          <section id="review-checklist" className="mt-16 scroll-mt-24">
            <SectionHeading
              number="23"
              title="Review Checklist"
              icon={<FaCheckSquare />}
            />

            <div className="space-y-3">
              {[
                "Driver compiles successfully.",
                "Virtual interface retrieved correctly.",
                "Factory registration exists.",
                "Reset handling implemented.",
                "get_next_item() paired with item_done().",
                "Response routing preserved.",
                "Race conditions minimized.",
                "Signal ownership documented.",
                "Driver boundaries respected.",
              ].map((item, idx) => (
                <Callout key={idx} type="success">
                  ✓ {item}
                </Callout>
              ))}
            </div>
          </section>

          <section id="final-recall-card" className="mt-16 scroll-mt-24">
            <SectionHeading
              number="24"
              title="Final Recall Card"
              icon={<FaBook />}
            />

            <Callout type="concept">
              Driver = Infrastructure + Protocol + Ownership
            </Callout>

            <CodeBlock
              language="text"
              code={`Sequence -> Sequencer -> Driver -> DUT
                 |
              Monitor
                 |
            Scoreboard`}
            />
          </section>

          <section id="key-takeaways" className="mt-16 scroll-mt-24">
            <SectionHeading
              number="25"
              title="Key Takeaways"
              icon={<FaBook />}
            />

            <div className="space-y-3">
              <Callout type="success">
                Drivers convert transactions into pin-level behavior.
              </Callout>

              <Callout type="success">
                build_phase configures infrastructure.
              </Callout>

              <Callout type="success">
                run_phase owns time and protocol execution.
              </Callout>

              <Callout type="success">
                Ownership boundaries create reusable VIP.
              </Callout>
            </div>
          </section>

          <section
            id="final-readiness-verdict"
            className="mt-16 scroll-mt-24 mb-12"
          >
            <SectionHeading
              number="26"
              title="Final Readiness Verdict"
              icon={<FaCheckSquare />}
            />

            <Callout type="success">
              You are ready for Module 3 if you can:
            </Callout>

            <ul className="list-disc ml-6 mt-4 space-y-2 text-slate-300">
              <li>Implement a complete driver skeleton.</li>
              <li>Retrieve virtual interfaces safely.</li>
              <li>Write build_phase and run_phase.</li>
              <li>Handle reset and cleanup.</li>
              <li>Use get_next_item() and item_done() correctly.</li>
              <li>Implement response routing.</li>
              <li>Avoid race conditions.</li>
            </ul>
          </section>

          <ModuleNavigation
            prevModule={{
              title: "Module 1 — Core Mental Model",
              path: "/driver-mastery/module1",
            }}
            nextModule={{
              title: "Module 3 — Universal Driver Recipe",
              path: "/driver-mastery/module3",
            }}
          />
        </main>
      </div>
    </div>
  );
};

export default Module2;
