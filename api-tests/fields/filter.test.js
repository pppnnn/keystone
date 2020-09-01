const globby = require('globby');
const path = require('path');
const { multiAdapterRunners, setupServer } = require('@keystonejs/test-utils');
import { createItem, getItems } from '@keystonejs/server-side-graphql-client';

const testModules = globby.sync(`packages/**/src/**/test-fixtures.js`, {
  absolute: true,
});
testModules.push(path.resolve('packages/fields/tests/test-fixtures.js'));

multiAdapterRunners('knex').map(({ runner, adapterName }) =>
  describe(`${adapterName} adapter`, () => {
    testModules
      .map(require)
      .filter(
        ({ skipCrudTest, unSupportedAdapterList = [] }) =>
          !skipCrudTest && !unSupportedAdapterList.includes(adapterName)
      )
      // .filter(({ name }) => name === 'Password')
      .filter(
        ({ name }) =>
          !['Unsplash', 'Select', 'Uuid', 'OEmbed', 'AutoIncrement', 'File'].includes(
            name
          )
      )
      .forEach(mod => {
        const listKey = 'Test';
        const withKeystone = (testFn = () => {}) =>
          runner(
            () => {
              const createLists = keystone => {
                // Create a list with all the fields required for testing
                keystone.createList(listKey, { fields: mod.getTestFields() });
              };
              return setupServer({ adapterName, createLists });
            },
            async ({ keystone, ...rest }) => {
              // Populate the database before running the tests
              // Note: this seeding has to be in an order defined by the array returned by `mod.initItems()`
              for (const item of mod.initItems()) {
                await createItem({ keystone, listKey, item });
              }
              return testFn({ keystone, listKey, adapterName, ...rest });
            }
          );

        // if (mod.filterTests) {
        //   describe(`${mod.name} - Filtering`, () => {
        //     mod.filterTests(withKeystone);
        //   });
        // }
        describe(`${mod.name} - Filtering 2`, () => {
          const { readFieldName, fieldName, subfieldName, storedValues } = mod;
          const returnFields = readFieldName
            ? `name ${readFieldName}`
            : subfieldName
            ? `name ${fieldName} { ${subfieldName} }`
            : `name ${fieldName}`;

          const match = async (keystone, where, expected, sortBy = 'name_ASC') =>
            expect(await getItems({ keystone, listKey, where, returnFields, sortBy })).toEqual(
              expected
            );

          test(
            `No Filter`,
            withKeystone(({ keystone }) => match(keystone, undefined, storedValues))
          );

          test(
            `Empty Filter`,
            withKeystone(({ keystone }) => match(keystone, {}, storedValues))
          );
          if (mod.supportedFilters.includes('null_equality')) {
            test(
              'Equals null',
              withKeystone(({ keystone }) =>
                match(keystone, { [`${fieldName}`]: null }, [storedValues[5], storedValues[6]])
              )
            );
            test(
              'Not Equals null',
              withKeystone(({ keystone }) =>
                match(keystone, { [`${fieldName}_not`]: null }, [
                  storedValues[0],
                  storedValues[1],
                  storedValues[2],
                  storedValues[3],
                  storedValues[4],
                ])
              )
            );
          }
          if (mod.supportedFilters.includes('equality')) {
            test(
              'Equals',
              withKeystone(({ keystone }) =>
                match(keystone, { [`${fieldName}`]: storedValues[3][fieldName] }, [storedValues[3]])
              )
            );
            test(
              'Not Equals',
              withKeystone(({ keystone }) =>
                match(keystone, { [`${fieldName}_not`]: storedValues[3][fieldName] }, [
                  storedValues[0],
                  storedValues[1],
                  storedValues[2],
                  storedValues[4],
                  storedValues[5],
                  storedValues[6],
                ])
              )
            );
          }
          if (mod.supportedFilters.includes('equality_case_insensitive')) {
            test(
              `Equals - Case Insensitive`,
              withKeystone(({ keystone }) =>
                match(keystone, { [`${fieldName}_i`]: storedValues[3][fieldName] }, [
                  storedValues[2],
                  storedValues[3],
                  storedValues[4],
                ])
              )
            );

            test(
              `Not Equals - Case Insensitive`,
              withKeystone(({ keystone }) =>
                match(keystone, { [`${fieldName}_not_i`]: storedValues[3][fieldName] }, [
                  storedValues[0],
                  storedValues[1],
                  storedValues[5],
                  storedValues[6],
                ])
              )
            );
          }
          if (mod.supportedFilters.includes('string')) {
            test(
              `Contains`,
              withKeystone(({ keystone }) =>
                match(keystone, { [`${fieldName}_contains`]: 'oo' }, [
                  storedValues[3],
                  storedValues[4],
                ])
              )
            );
            test(
              `Not Contains`,
              withKeystone(({ keystone }) =>
                match(keystone, { [`${fieldName}_not_contains`]: 'oo' }, [
                  storedValues[0],
                  storedValues[1],
                  storedValues[2],
                  storedValues[5],
                  storedValues[6],
                ])
              )
            );
            test(
              `Starts With`,
              withKeystone(({ keystone }) =>
                match(keystone, { [`${fieldName}_starts_with`]: 'foo' }, [
                  storedValues[3],
                  storedValues[4],
                ])
              )
            );
            test(
              `Not Starts With`,
              withKeystone(({ keystone }) =>
                match(keystone, { [`${fieldName}_not_starts_with`]: 'foo' }, [
                  storedValues[0],
                  storedValues[1],
                  storedValues[2],
                  storedValues[5],
                  storedValues[6],
                ])
              )
            );
            test(
              `Ends With`,
              withKeystone(({ keystone }) =>
                match(keystone, { [`${fieldName}_ends_with`]: 'BAR' }, [
                  storedValues[2],
                  storedValues[3],
                ])
              )
            );
            test(
              `Not Ends With`,
              withKeystone(({ keystone }) =>
                match(keystone, { [`${fieldName}_not_ends_with`]: 'BAR' }, [
                  storedValues[0],
                  storedValues[1],
                  storedValues[4],
                  storedValues[5],
                  storedValues[6],
                ])
              )
            );
          }
          if (mod.supportedFilters.includes('string_case_insensitive')) {
            test(
              `Contains - Case Insensitive`,
              withKeystone(({ keystone }) =>
                match(keystone, { [`${fieldName}_contains_i`]: 'oo' }, [
                  storedValues[2],
                  storedValues[3],
                  storedValues[4],
                ])
              )
            );

            test(
              `Not Contains - Case Insensitive`,
              withKeystone(({ keystone }) =>
                match(keystone, { [`${fieldName}_not_contains_i`]: 'oo' }, [
                  storedValues[0],
                  storedValues[1],
                  storedValues[5],
                  storedValues[6],
                ])
              )
            );

            test(
              `Starts With - Case Insensitive`,
              withKeystone(({ keystone }) =>
                match(keystone, { [`${fieldName}_starts_with_i`]: 'foo' }, [
                  storedValues[2],
                  storedValues[3],
                  storedValues[4],
                ])
              )
            );

            test(
              `Not Starts With - Case Insensitive`,
              withKeystone(({ keystone }) =>
                match(keystone, { [`${fieldName}_not_starts_with_i`]: 'foo' }, [
                  storedValues[0],
                  storedValues[1],
                  storedValues[5],
                  storedValues[6],
                ])
              )
            );

            test(
              `Ends With - Case Insensitive`,
              withKeystone(({ keystone }) =>
                match(keystone, { [`${fieldName}_ends_with_i`]: 'BAR' }, [
                  storedValues[2],
                  storedValues[3],
                  storedValues[4],
                ])
              )
            );

            test(
              `Not Ends With - Case Insensitive`,
              withKeystone(({ keystone }) =>
                match(keystone, { [`${fieldName}_not_ends_with_i`]: 'BAR' }, [
                  storedValues[0],
                  storedValues[1],
                  storedValues[5],
                  storedValues[6],
                ])
              )
            );
          }
          if (mod.supportedFilters.includes('ordering')) {
            test(
              'Less than',
              withKeystone(({ keystone }) =>
                match(keystone, { [`${fieldName}_lt`]: storedValues[2][fieldName] }, [
                  storedValues[0],
                  storedValues[1],
                ])
              )
            );
            test(
              'Less than or equal',
              withKeystone(({ keystone }) =>
                match(keystone, { [`${fieldName}_lte`]: storedValues[2][fieldName] }, [
                  storedValues[0],
                  storedValues[1],
                  storedValues[2],
                ])
              )
            );
            test(
              'Greater than',
              withKeystone(({ keystone }) =>
                match(keystone, { [`${fieldName}_gt`]: storedValues[2][fieldName] }, [
                  storedValues[3],
                  storedValues[4],
                ])
              )
            );
            test(
              'Greater than or equal',
              withKeystone(({ keystone }) =>
                match(keystone, { [`${fieldName}_gte`]: storedValues[2][fieldName] }, [
                  storedValues[2],
                  storedValues[3],
                  storedValues[4],
                ])
              )
            );
          }
          if (mod.supportedFilters.includes('in_empty_null')) {
            test(
              'In - Empty List',
              withKeystone(({ keystone }) => match(keystone, { [`${fieldName}_in`]: [] }, []))
            );

            test(
              'Not In - Empty List',
              withKeystone(({ keystone }) =>
                match(keystone, { [`${fieldName}_not_in`]: [] }, storedValues)
              )
            );

            test(
              'In - null',
              withKeystone(({ keystone }) =>
                match(keystone, { [`${fieldName}_in`]: [null] }, [storedValues[5], storedValues[6]])
              )
            );

            test(
              'Not In - null',
              withKeystone(({ keystone }) =>
                match(keystone, { [`${fieldName}_not_in`]: [null] }, [
                  storedValues[0],
                  storedValues[1],
                  storedValues[2],
                  storedValues[3],
                  storedValues[4],
                ])
              )
            );
          }
          if (mod.supportedFilters.includes('in_equal')) {
            test(
              'In - values',
              withKeystone(({ keystone }) =>
                match(
                  keystone,
                  {
                    [`${fieldName}_in`]: [
                      storedValues[0][fieldName],
                      storedValues[2][fieldName],
                      storedValues[4][fieldName],
                    ],
                  },
                  [storedValues[0], storedValues[2], storedValues[4]]
                )
              )
            );

            test(
              'Not In - values',
              withKeystone(({ keystone }) =>
                match(
                  keystone,
                  {
                    [`${fieldName}_not_in`]: [
                      storedValues[0][fieldName],
                      storedValues[2][fieldName],
                      storedValues[4][fieldName],
                    ],
                  },
                  [storedValues[1], storedValues[3], storedValues[5], storedValues[6]]
                )
              )
            );
          }
          if (mod.supportedFilters.includes('is_set')) {
            test(
              'Is Set - true',
              withKeystone(({ keystone }) =>
                match(keystone, { [`${fieldName}_is_set`]: true }, [
                  storedValues[0],
                  storedValues[2],
                ])
              )
            );

            test(
              'Is Set - false',
              withKeystone(({ keystone }) =>
                match(keystone, { [`${fieldName}_is_set`]: false }, [storedValues[1]])
              )
            );
          }
        });
      });
  })
);
