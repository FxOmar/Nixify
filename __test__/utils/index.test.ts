import { has } from "../../src/utils";

test("should return false if key doesn't exist", () => {
  const value = has({ age: 23 }, "name");

  expect(value).toBe(false);
});
