'use strict';

const delta = (schema) => (initial, modified) => {
  const result = {};
  for (const key in modified) {
    const next = modified[key];
    const prev = initial[key];
    if (typeof next === 'object' && !Array.isArray(next)) {
      const def = schema[key] || {};
      result[key] = delta(def)(prev || {}, next);
    } else if (Array.isArray(next)) {
      const add = next.filter((v) => !prev?.includes(v));
      if (add.length > 0) result[key] = { add };
    } else if (schema[key] === 'counter') {
      result[key] = next - prev;
    } else if (prev !== next) {
      result[key] = next;
    }
  }
  for (const key in initial) {
    if (!(key in modified)) result[key] = { deleted: true };
  }
  return result;
};

const merge = (schema) => (state, delta) => {
  const result = structuredClone(state);
  for (const key in delta) {
    const value = delta[key];
    const res = result[key];
    if (value?.deleted) {
      delete result[key];
    } else if (value?.add) {
      const prev = res || [];
      result[key] = Array.from(new Set([...prev, ...value.add]));
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      const def = schema[key] || {};
      result[key] = merge(def)(res || {}, value);
    } else if (schema[key] === 'counter') {
      result[key] = value + (res || 0);
    } else {
      result[key] = value;
    }
  }
  return result;
};

const crdt = (schema) => ({
  delta: delta(schema),
  merge: merge(schema),
});

module.exports = crdt;
