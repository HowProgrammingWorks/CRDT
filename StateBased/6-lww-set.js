'use strict';

class LWWSet {
  #added;
  #removed;

  constructor({ added = {}, removed = {} } = {}) {
    this.#added = { ...added };
    this.#removed = { ...removed };
  }

  add(item, timestamp = Date.now()) {
    const prev = this.#added[item] || 0;
    if (timestamp > prev) this.#added[item] = timestamp;
  }

  remove(item, timestamp = Date.now()) {
    const prev = this.#removed[item] || 0;
    if (timestamp > prev) this.#removed[item] = timestamp;
  }

  merge(instance) {
    const added = Object.entries(instance.added);
    for (const [item, timestamp] of added) {
      const prev = this.#added[item] || 0;
      if (timestamp > prev) this.#added[item] = timestamp;
    }
    const removed = Object.entries(instance.removed);
    for (const [item, timestamp] of removed) {
      const prev = this.#removed[item] || 0;
      if (timestamp > prev) this.#removed[item] = timestamp;
    }
  }

  get value() {
    const result = [];
    for (const item of Object.keys(this.#added)) {
      const addTime = this.#added[item];
      const removeTime = this.#removed[item] || 0;
      if (addTime > removeTime) result.push(item);
    }
    return result;
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
const set0 = new LWWSet();
set0.add('a', 1);
set0.add('b', 2);
set0.remove('a', 3);
console.log({ id0: set0.value });

console.log('Replica 1');
const set1 = new LWWSet();
set1.add('b', 1);
set1.add('c', 2);
set1.remove('b', 3);
console.log({ id1: set1.value });

console.log('Sync');
set0.merge(set1);
set1.merge(set0);
console.log({ id0: { added: set0.added, removed: set0.removed } });
console.log({ id1: { added: set1.added, removed: set1.removed } });

console.log('Get value');
console.log({ id0: set0.value });
console.log({ id1: set1.value });
