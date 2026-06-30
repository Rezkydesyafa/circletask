import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  calculateTaskContribution,
  getDeadlinePenaltyRate,
  getRevisionPenaltyRate,
} from "./calculate";

const baseTask = {
  id: "task-1",
  title: "Draft laporan",
  assignedTo: "user-1",
  weight: 100,
  deadline: "2026-06-10T00:00:00.000Z",
};

describe("contribution calculation", () => {
  it("does not penalize approved task finished on or before deadline", () => {
    const result = calculateTaskContribution(
      {
        ...baseTask,
        approvedAt: "2026-06-10T00:00:00.000Z",
      },
      0
    );

    assert.equal(result.deadlinePenaltyRate, 0);
    assert.equal(result.revisionPenaltyRate, 0);
    assert.equal(result.finalScore, 100);
  });

  it("applies 10 percent deadline penalty for 1-2 days late", () => {
    assert.equal(
      getDeadlinePenaltyRate("2026-06-10T00:00:00.000Z", "2026-06-12T00:00:00.000Z"),
      0.1
    );
  });

  it("applies 20 percent deadline penalty for more than 2 days late", () => {
    assert.equal(
      getDeadlinePenaltyRate("2026-06-10T00:00:00.000Z", "2026-06-13T00:00:00.000Z"),
      0.2
    );
  });

  it("applies revision penalty only when revisions are more than 2", () => {
    assert.equal(getRevisionPenaltyRate(2), 0);
    assert.equal(getRevisionPenaltyRate(3), 0.1);
  });

  it("combines deadline and revision penalties", () => {
    const result = calculateTaskContribution(
      {
        ...baseTask,
        approvedAt: "2026-06-13T00:00:00.000Z",
      },
      3
    );

    assert.equal(result.deadlinePenaltyRate, 0.2);
    assert.equal(result.revisionPenaltyRate, 0.1);
    assert.equal(result.finalScore, 70);
  });
});

