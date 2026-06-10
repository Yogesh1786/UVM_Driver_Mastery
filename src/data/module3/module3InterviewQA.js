export const module3InterviewQA = [
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
