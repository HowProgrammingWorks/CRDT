'use strict';

class PNCounter {
  #id;
  #pc;
  #nc;

  constructor(id, options = {}) {
    this.#id = id;
    const { pCounts, nCounts, size = 1 } = options;
    if (id >= size) throw new Error(`Invalid id: ${id}, max: ${size - 1}`);
    this.#pc = pCounts ? structuredClone(pCounts) : new Array(size).fill(0);
    this.#nc = nCounts ? structuredClone(nCounts) : new Array(size).fill(0);
  }

  inc(delta = 1) {
    if (delta < 0) throw new Error('Negative increment is not allowed');
    this.#pc[this.#id] += delta;
  }

  dec(delta = 1) {
    if (delta < 0) throw new Error('Negative decrement is not allowed');
    this.#nc[this.#id] += delta;
  }

  merge({ pCounts, nCounts }) {
    const size = pCounts.length;
    if (size !== nCounts.length) throw new Error('Wrong data size');
    for (let id = 0; id < size; id++) {
      this.#pc[id] = Math.max(this.#pc[id], pCounts[id]);
      this.#nc[id] = Math.max(this.#nc[id], nCounts[id]);
    }
  }

  get value() {
    const pSum = this.#pc.reduce((sum, cur) => sum + cur);
    const nSum = this.#nc.reduce((sum, cur) => sum + cur);
    return pSum - nSum;
  }

  get counts() {
    return { pCounts: this.#pc, nCounts: this.#nc };
  }
}

// Usage

const size = 2;

console.log('Replica 0');
const counter0 = new PNCounter(0, { size });
counter0.inc();
counter0.inc(2);
counter0.dec(5);
console.log({ id0: counter0.counts });

console.log('Replica 1');
const counter1 = new PNCounter(1, { size });
counter1.dec();
counter1.inc(7);
console.log({ id1: counter1.counts });

console.log('Sync');
counter1.merge(counter0.counts);
counter0.merge(counter1.counts);
console.log({ id0: counter0.counts });
console.log({ id1: counter1.counts });

console.log('Get value');
console.log({ id0: counter0.value });
console.log({ id1: counter1.value });
