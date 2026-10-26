import { toSelectOptions } from './Select';

describe('toSelectOptions', () => {
  it('maps entities through valueField/labelField', () => {
    expect(toSelectOptions([{ id: 1, name: 'Kg' }], 'id', 'name')).toEqual([{ value: 1, label: 'Kg' }]);
  });

  it('accepts Mantine-like direct data', () => {
    expect(toSelectOptions(['a', { value: 'b', label: 'B' }])).toEqual([{ value: 'a', label: 'a' }, { value: 'b', label: 'B' }]);
  });
});
