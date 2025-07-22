'use strict';

class TwoPhaseSet {
  #added;
  #removed;

  constructor(add = [], remove = []) {
    this.#added = new Set(add);
    this.#removed = new Set(remove);
  }

  add(element) {
    this.#added.add(element);
  }

  remove(element) {
    if (this.#added.has(element)) {
      this.#removed.add(element);
    }
  }

  merge(otherAdded, otherRemoved) {
    for (const el of otherAdded) {
      this.#added.add(el);
    }
    for (const el of otherRemoved) {
      this.#removed.add(el);
    }
  }

  get value() {
    return Array.from(this.#added).filter((val) => !this.#removed.has(val));
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
set0.merge(set1.added, set1.removed);
set1.merge(set0.added, set0.removed);
console.log({ id0: { added: set0.added, removed: set0.removed } });
console.log({ id1: { added: set1.added, removed: set1.removed } });

console.log('Get value');
console.log({ id0: set0.value });
console.log({ id1: set1.value });
