'use strict';

const crypto = require('node:crypto');

class ORSet {
  #added;
  #removed;

  constructor({ added = {}, removed = {} } = {}) {
    this.#added = { ...added };
    this.#removed = { ...removed };
  }

  add(item, tag = crypto.randomUUID()) {
    if (!this.#added[item]) this.#added[item] = new Set();
    this.#added[item].add(tag);
    return tag;
  }

  remove(item) {
    if (!this.#added[item]) return;
    if (!this.#removed[item]) this.#removed[item] = new Set();
    for (const tag of this.#added[item]) {
      this.#removed[item].add(tag);
    }
  }

  merge(instance) {
    const added = Object.entries(instance.added);
    for (const [item, tags] of added) {
      if (!this.#added[item]) this.#added[item] = new Set();
      for (const tag of tags) {
        this.#added[item].add(tag);
      }
    }
    const removed = Object.entries(instance.removed);
    for (const [item, tags] of removed) {
      if (!this.#removed[item]) this.#removed[item] = new Set();
      for (const tag of tags) {
        this.#removed[item].add(tag);
      }
    }
  }

  get value() {
    const result = [];
    for (const item of Object.keys(this.#added)) {
      const addTags = this.#added[item] || new Set();
      const remTags = this.#removed[item] || new Set();
      for (const tag of addTags) {
        if (!remTags.has(tag)) {
          result.push(item);
          break;
        }
      }
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
const set0 = new ORSet();
set0.add('a');
set0.add('b');
set0.remove('a');
console.log({ id0: set0.value });

console.log('Replica 1');
const set1 = new ORSet();
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
