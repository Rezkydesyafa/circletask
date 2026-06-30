import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { canTransitionTaskStatus } from "./state-machine";

describe("task status state machine", () => {
  it("allows assigned member to move todo task to in progress", () => {
    assert.equal(
      canTransitionTaskStatus({ from: "todo", to: "in_progress", actor: "assigned_member" }),
      true
    );
  });

  it("prevents assigned member from setting task directly to done", () => {
    assert.equal(
      canTransitionTaskStatus({ from: "in_progress", to: "done", actor: "assigned_member" }),
      false
    );
  });

  it("allows assigned member to submit review from in progress", () => {
    assert.equal(
      canTransitionTaskStatus({
        from: "in_progress",
        to: "submit_review",
        actor: "assigned_member",
      }),
      true
    );
  });

  it("allows leader to approve or revise submitted task", () => {
    assert.equal(
      canTransitionTaskStatus({ from: "submit_review", to: "approved", actor: "leader" }),
      true
    );
    assert.equal(
      canTransitionTaskStatus({ from: "submit_review", to: "revision", actor: "leader" }),
      true
    );
  });

  it("allows leader to mark approved task as done", () => {
    assert.equal(
      canTransitionTaskStatus({ from: "approved", to: "done", actor: "leader" }),
      true
    );
  });
});

