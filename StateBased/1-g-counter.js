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

  inc(x = 1) {
    if (x < 0) throw new Error('Negative increment is not allowed');
    this.#counts[this.#id] += x;
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

// Usage

const size = 2;

console.log('Replica 0');
const counter0 = new GCounter(0, { size });
counter0.inc();
counter0.inc();
console.log({ id0: counter0.counts });

console.log('Replica 1');
const counter1 = new GCounter(1, { size });
counter1.inc();
console.log({ id1: counter1.counts });

console.log('Sync');
counter0.merge(counter1.counts);
counter1.merge(counter0.counts);
console.log({ id0: counter0.counts });
console.log({ id1: counter1.counts });

console.log('Get value');
console.log({ id0: counter0.value });
console.log({ id1: counter1.value });
