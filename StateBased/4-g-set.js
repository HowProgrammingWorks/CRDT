'use strict';

class GSet {
  #items;

  constructor(items = []) {
    this.#items = new Set(items);
  }

  add(item) {
    this.#items.add(item);
  }

  merge(instance) {
    for (const item of instance.set) this.#items.add(item);
  }

  get value() {
    return Array.from(this.#items);
  }

  get set() {
    return this.#items;
  }
}

// Usage

console.log('Replica 0');
const set0 = new GSet();
set0.add('a');
set0.add('b');
console.log({ id0: set0.value });

console.log('Replica 1');
const set1 = new GSet();
set1.add('b');
set1.add('c');
console.log({ id1: set1.value });

console.log('Sync');
set0.merge(set1);
set1.merge(set0);
console.log({ id0: set0.set });
console.log({ id1: set1.set });

console.log('Get value');
console.log({ id0: set0.value });
console.log({ id1: set1.value });
