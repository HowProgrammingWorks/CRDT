'use strict';

const test = require('node:test');
const assert = require('node:assert');
const crdt = require('./crdt.js');

const schema = {
  name: 'string',
  birth: 'number',
  spouse: '?string',
  children: { array: 'string' },
  parents: { father: '?string', mother: '?string' },
  militaryVictories: 'counter',
  campaigns: {
    object: { string: 'counter' },
  },
};

const emperor = crdt(schema);

const marcus = {
  name: 'Marcus Aurelius',
  birth: 121,
  spouse: 'Annia Galeria Faustina',
  children: ['Commodus', 'Annia Cornificia'],
  parents: { father: 'Annius Verus', mother: 'Domitia Lucilla' },
  militaryVictories: 5,
  wars: {
    marcomannic: 12,
  },
};

test('Update/Update on same field', () => {
  const initial = structuredClone(marcus);

  const stateA = structuredClone(initial);
  stateA.birth = 120;
  const stateB = structuredClone(initial);
  stateB.birth = 122;

  const deltaA = emperor.delta(initial, stateA);
  const deltaB = emperor.delta(initial, stateB);

  const stateAfterA = emperor.merge(initial, deltaA);
  const mergedState = emperor.merge(stateAfterA, deltaB);

  assert.strictEqual(mergedState.birth, 122);
});

test('Update/Update on different fields', () => {
  const initial = structuredClone(marcus);

  const stateA = structuredClone(initial);
  stateA.birth = 120;
  const stateB = structuredClone(initial);
  stateB.spouse = 'Faustina the Younger';

  const deltaA = emperor.delta(initial, stateA);
  const deltaB = emperor.delta(initial, stateB);

  const stateAfterA = emperor.merge(initial, deltaA);
  const mergedState = emperor.merge(stateAfterA, deltaB);

  assert.strictEqual(mergedState.birth, 120);
  assert.strictEqual(mergedState.spouse, 'Faustina the Younger');
});

test('Insert/Insert in array (order-insensitive)', () => {
  const initial = structuredClone(marcus);

  const stateA = structuredClone(initial);
  stateA.children.push('Lucilla');
  const stateB = structuredClone(initial);
  stateB.children.push('Vibia Sabina');

  const deltaA = emperor.delta(initial, stateA);
  const deltaB = emperor.delta(initial, stateB);

  const stateAfterA = emperor.merge(initial, deltaA);
  const mergedState = emperor.merge(stateAfterA, deltaB);

  const result = new Set(mergedState.children);
  const expected = new Set([
    'Commodus',
    'Annia Cornificia',
    'Lucilla',
    'Vibia Sabina',
  ]);
  assert.deepStrictEqual(result, expected);
});

test('Insert/Update under same parent', () => {
  const initial = structuredClone(marcus);

  const stateA = structuredClone(initial);

  stateA.wars.sarmatian = 5;
  const stateB = structuredClone(initial);
  stateB.wars.parthian = 3;

  const deltaA = emperor.delta(initial, stateA);
  const deltaB = emperor.delta(initial, stateB);

  const stateAfterA = emperor.merge(initial, deltaA);
  const mergedState = emperor.merge(stateAfterA, deltaB);

  assert.strictEqual(mergedState.wars.marcomannic, 12);
  assert.strictEqual(mergedState.wars.sarmatian, 5);
  assert.strictEqual(mergedState.wars.parthian, 3);
});

test('Delete/Update on same property', () => {
  const initial = structuredClone(marcus);

  const stateA = structuredClone(initial);
  delete stateA.spouse;
  const stateB = structuredClone(initial);
  stateB.spouse = 'Faustina Major';

  const deltaA = emperor.delta(initial, stateA);
  const deltaB = emperor.delta(initial, stateB);

  const stateAfterA = emperor.merge(initial, deltaA);
  const mergedState = emperor.merge(stateAfterA, deltaB);

  assert.strictEqual(mergedState.spouse, 'Faustina Major');
});

test('Delete/Delete idempotent', () => {
  const initial = structuredClone(marcus);

  const stateA = structuredClone(initial);
  delete stateA.birth;
  const stateB = structuredClone(initial);
  delete stateB.birth;

  const deltaA = emperor.delta(initial, stateA);
  const deltaB = emperor.delta(initial, stateB);

  const stateAfterA = emperor.merge(initial, deltaA);
  const mergedState = emperor.merge(stateAfterA, deltaB);

  assert.strictEqual(typeof mergedState.birth, 'undefined');
});

test('Delete then Insert under deleted path', () => {
  const initial = structuredClone(marcus);

  const stateA = structuredClone(initial);
  delete stateA.parents;
  const stateB = structuredClone(initial);
  stateB.parents = { father: 'Marcus Annius Verus' };

  const deltaA = emperor.delta(initial, stateA);
  const deltaB = emperor.delta(initial, stateB);

  const stateAfterA = emperor.merge(initial, deltaA);
  const mergedState = emperor.merge(stateAfterA, deltaB);

  assert.strictEqual(mergedState.parents.father, 'Marcus Annius Verus');
});

test('Concurrent numeric increment', () => {
  const initial = structuredClone(marcus);

  const stateA = structuredClone(initial);
  stateA.militaryVictories = 6;
  const stateB = structuredClone(initial);
  stateB.militaryVictories = 7;

  const deltaA = emperor.delta(initial, stateA);
  const deltaB = emperor.delta(initial, stateB);

  const stateAfterA = emperor.merge(initial, deltaA);
  const mergedState = emperor.merge(stateAfterA, deltaB);

  assert.strictEqual(mergedState.militaryVictories, 8);
});
