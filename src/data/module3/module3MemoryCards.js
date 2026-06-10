export const module3MemoryCards = [
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
