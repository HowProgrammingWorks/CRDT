'use strict';

class PNSet {
  #id;
  #added;
  #removed;

  constructor({ id = 0, added = {}, removed = {} } = {}) {
    this.#id = id;
    this.#added = { ...added };
    this.#removed = { ...removed };
  }

  add(item) {
    const added = this.#added;
    let nodes = added[item];
    if (!nodes) added[item] = nodes = {};
    if (!nodes[this.#id]) nodes[this.#id] = 0;
    nodes[this.#id]++;
  }

  remove(item) {
    const removed = this.#removed;
    let nodes = removed[item];
    if (!nodes) removed[item] = nodes = {};
    if (!nodes[this.#id]) nodes[this.#id] = 0;
    nodes[this.#id]++;
  }

  merge(instance) {
    const added = Object.entries(instance.added);
    for (const [item, nodes] of added) {
      if (!this.#added[item]) this.#added[item] = {};
      for (const [id, count] of Object.entries(nodes)) {
        this.#added[item][id] = Math.max(this.#added[item][id] || 0, count);
      }
    }
    const removed = Object.entries(instance.removed);
    for (const [item, nodes] of removed) {
      if (!this.#removed[item]) this.#removed[item] = {};
      for (const [id, count] of Object.entries(nodes)) {
        this.#removed[item][id] = Math.max(this.#removed[item][id] || 0, count);
      }
    }
  }

  static #sum(nodes = {}) {
    return Object.values(nodes).reduce((a, b) => a + b, 0);
  }

  get value() {
    const result = [];
    for (const item of Object.keys(this.#added)) {
      const p = PNSet.#sum(this.#added);
      const n = PNSet.#sum(this.#removed);
      if (p > n) result.push(item);
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
const set0 = new PNSet(0);
set0.add('a');
set0.add('b');
set0.remove('a');
console.log({ id0: set0.value });

console.log('Replica 1');
const set1 = new PNSet(1);
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
