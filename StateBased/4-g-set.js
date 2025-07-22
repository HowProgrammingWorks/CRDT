'use strict';

class GSet {
  #set;

  constructor(elements = []) {
    this.#set = new Set(elements);
  }

  add(element) {
    this.#set.add(element);
  }

  merge(otherSet) {
    for (const el of otherSet) {
      this.#set.add(el);
    }
  }

  get value() {
    return Array.from(this.#set);
  }

  get set() {
    return this.#set;
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
set0.merge(set1.set);
set1.merge(set0.set);
console.log({ id0: set0.set });
console.log({ id1: set1.set });

console.log('Get value');
console.log({ id0: set0.value });
console.log({ id1: set1.value });
