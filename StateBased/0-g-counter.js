'use strict';

const init = (size) => new Array(size).fill(0);

const inc = (state, id, delta = 1) => {
  if (id < 0 || id >= state.length) throw new Error(`Invalid id: ${id}`);
  state[id] += delta;
  return state;
};

const merge = (state1, state2) => {
  const size = state1.length;
  if (size !== state2.length) throw new Error('Wrong data size');
  for (let i = 0; i < size; i++) {
    const value1 = state1[i] || 0;
    const value2 = state2[i] || 0;
    state1[i] = Math.max(value1, value2);
  }
};

const value = (state) => state.reduce((sum, cur) => sum + cur, 0);

// Usage

const size = 2;

console.log('Replica 0');
const id0 = 0;
const counter0 = init(size);
inc(counter0, id0);
inc(counter0, id0);
console.log({ id0: counter0 });

console.log('Replica 1');
const id1 = 1;
const counter1 = init(size);
inc(counter1, id1);
console.log({ id1: counter1 });

console.log('Sync');
merge(counter0, counter1);
merge(counter1, counter0);
console.log({ counter0, counter1 });

console.log('Get value');
console.log({ 0: value(counter0), 1: value(counter1) });
