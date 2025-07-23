'use strict';

const init = () => new Map();

const value = (state) => {
  const values = Array.from(state.values());
  return values.reduce((acc, current) => acc + current, 0);
};

const keysUnion = (state1, state2) => {
  const keys = new Set();
  for (const key of state1.keys()) keys.add(key);
  for (const key of state2.keys()) keys.add(key);
  return keys;
};

const join = (state1, state2) => {
  const result = new Map();
  for (const key of keysUnion(state1, state2)) {
    const value1 = state1.get(key) || 0;
    const value2 = state2.get(key) || 0;
    result.set(key, Math.max(value1, value2));
  }
  return result;
};

const inc = (id, state) => {
  const delta = new Map();
  const value = state.get(id) || 0;
  delta.set(id, value + 1);
  return delta;
};

// Usage

console.log('Replica A');
const stateA = init();
const deltaA1 = inc('A', stateA);
const stateA2 = join(stateA, deltaA1);
const deltaA2 = inc('A', stateA2);
const stateA3 = join(stateA2, deltaA2);
console.log({ deltaA1, stateA2, deltaA2, stateA3 });

console.log('Replica B');
const stateB = init();
const deltaB1 = inc('B', stateB);
const stateB1 = join(stateB, deltaB1);
console.log({ deltaB1, stateB1 });

console.log(`A before join: ${value(stateA3)}`);
console.log(`B before join: ${value(stateB1)}`);

console.log('Exchange deltas');
const stateA4 = join(stateA3, deltaB1);
const stateB2 = join(stateB1, deltaA1);
const stateB3 = join(stateB2, deltaA2);

console.log('State after join');
console.log({ stateA4, stateB3 });
console.log(`A after join: ${value(stateA4)}`);
console.log(`B after join: ${value(stateB3)}`);
