import Password from './';
import Text from '../Text';

export const name = 'Password';
export const type = Password;
export const exampleValue = 'password';
export const exampleValue2 = 'password2';
export const supportsUnique = false;
export const fieldName = 'password';
export const readFieldName = 'password_is_set';
export const skipCreateTest = true;
export const skipUpdateTest = true;

export const getTestFields = () => ({ name: { type: Text }, password: { type, minLength: 4 } });

export const initItems = () => {
  return [
    { name: 'person1', password: 'pass1' },
    { name: 'person2', password: '' },
    { name: 'person3', password: 'pass3' },
  ];
};

export const storedValues = [
  { name: 'person1', password_is_set: true },
  { name: 'person2', password_is_set: false },
  { name: 'person3', password_is_set: true },
];

export const supportedFilters = ['is_set'];
