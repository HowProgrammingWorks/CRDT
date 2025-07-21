'use strict';

class Counter {
  #value = 0;
  #delta = 0;

  constructor(value) {
    if (value) this.#value = value;
  }

  inc(delta = 1) {
    this.#value += delta;
    this.#delta += delta;
  }

  dec(delta = 1) {
    this.#value -= delta;
    this.#delta -= delta;
  }

  merge(delta) {
    this.#value += delta;
  }

  get value() {
    return this.#value;
  }

  sync(callback) {
    callback(this.#delta);
    this.#delta = 0;
  }
}

// Usage

console.log('Replica 0');
const counter0 = new Counter();
counter0.inc(4);
counter0.inc();
counter0.dec();
console.log(`Value: ${counter0.value}`);

console.log('Replica 1');
const counter1 = new Counter();
counter1.dec(5);
counter1.inc();
counter1.inc(3);
console.log(`Value: ${counter1.value}`);

console.log('Sync');
counter0.sync((delta) => counter1.merge(delta));
counter1.sync((delta) => counter0.merge(delta));
console.log(`1: ${counter0.value}`);
console.log(`2: ${counter1.value}`);
