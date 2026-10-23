// js-cookie is declared in types.d.ts but not installed; this in-memory stub lets utils/cookies.ts be tested.
const store = new Map<string, string>();

const Cookies = {
  get: (name: string) => store.get(name),
  set: (name: string, value: string) => { store.set(name, value); },
  remove: (name: string) => { store.delete(name); },
};

export default Cookies;
