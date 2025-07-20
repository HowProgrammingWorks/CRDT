'use strict';

class Counter {
  #id;
  #seq = 0;
  #ops = [];
  #applied = new Set();

  constructor(id) {
    this.#id = id;
  }

  inc(x = 1) {
    this.#update(x);
  }

  dec(x = 1) {
    this.#update(-x);
  }

  #update(delta) {
    const id = `${this.#id}:${this.#seq++}`;
    this.#ops.push({ id, delta });
    this.#applied.add(id);
  }

  merge(ops) {
    for (const op of ops) {
      if (!this.#applied.has(op.id)) {
        this.#ops.push(op);
        this.#applied.add(op.opId);
      }
    }
  }

  get value() {
    return this.#ops.reduce((sum, { delta }) => sum + delta, 0);
  }

  get operations() {
    return this.#ops;
  }
}

// Usage

console.log('Replica 0');
const counter0 = new Counter(0);
counter0.inc(4);
counter0.inc();
counter0.dec();
console.log(counter0.operations);

console.log('Replica 1');
const counter1 = new Counter(1);
counter1.dec(5);
counter1.inc();
counter1.inc(3);
console.log(counter1.operations);

console.log('Sync');
counter1.merge(counter0.operations);
counter0.merge(counter1.operations);
console.log(counter0.operations);

console.log('Get value');
console.log(counter0.value);
