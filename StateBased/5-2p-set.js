'use strict';

class TwoPhaseSet {
  #added;
  #removed;

  constructor({ added = [], removed = [] } = {}) {
    this.#added = new Set(added);
    this.#removed = new Set(removed);
  }

  add(item) {
    this.#added.add(item);
  }

  remove(item) {
    if (this.#added.has(item)) {
      this.#removed.add(item);
    }
  }

  merge({ added, removed } = {}) {
    for (const item of added) this.#added.add(item);
    for (const item of removed) this.#removed.add(item);
  }

  get value() {
    const keep = (item) => !this.#removed.has(item);
    return Array.from(this.#added).filter(keep);
  }

  get added() {
    return this.#added;
  }

  get removed() {
    return this.#removed;
  }
}

// Usage

console.log('Replica 0');
const set0 = new TwoPhaseSet();
set0.add('a');
set0.add('b');
set0.remove('a');
console.log({ id0: set0.value });

console.log('Replica 1');
const set1 = new TwoPhaseSet();
set1.add('b');
set1.add('c');
set1.remove('b');
console.log({ id1: set1.value });

console.log('Sync');
set0.merge(set1);
set1.merge(set0);
console.log({ id0: { added: set0.added, removed: set0.removed } });
console.log({ id1: { added: set1.added, removed: set1.removed } });

console.log('Get value');
console.log({ id0: set0.value });
console.log({ id1: set1.value });
