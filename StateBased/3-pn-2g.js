'use strict';

class GCounter {
  #id;
  #counts;

  constructor(id, options = {}) {
    this.#id = id;
    const { counts, size = 1 } = options;
    if (id >= size) throw new Error(`Invalid id: ${id}, max: ${size - 1}`);
    this.#counts = counts ? structuredClone(counts) : new Array(size).fill(0);
  }

  inc(delta = 1) {
    if (delta < 0) throw new Error('Negative increment is not allowed');
    this.#counts[this.#id] += delta;
  }

  merge(counts) {
    for (const [id, counter] of counts.entries()) {
      const cur = this.#counts[id];
      if (counter > cur) this.#counts[id] = counter;
    }
  }

  get value() {
    return this.#counts.reduce((sum, cur) => sum + cur, 0);
  }

  get counts() {
    return this.#counts;
  }
}

class PNCounter {
  #id;
  #pc;
  #nc;

  constructor(id, options = {}) {
    this.#id = id;
    const { pCounts, nCounts, size = 1 } = options;
    this.#pc = new GCounter(id, { size, counts: pCounts });
    this.#nc = new GCounter(id, { size, counts: nCounts });
  }

  inc(x) {
    this.#pc.inc(x);
  }

  dec(x) {
    this.#nc.inc(x);
  }

  merge({ pCounts, nCounts }) {
    this.#pc.merge(pCounts);
    this.#nc.merge(nCounts);
  }

  get value() {
    return this.#pc.value - this.#nc.value;
  }

  get counts() {
    return { pCounts: this.#pc.counts, nCounts: this.#nc.counts };
  }

  get id() {
    return this.#id;
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
