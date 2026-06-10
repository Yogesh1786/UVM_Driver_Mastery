export const module3BugGallery = [
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
