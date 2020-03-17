// Copyright 2018-2020 @paritytech/Nomidot authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { boolean, object, text, withKnobs } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';
import React from 'react';

import { TableAccounts } from '../src/TableAccounts';
import { RowAccount, RowHeader } from '../src/TableRowsAccount';
import { withTheme } from './customDecorators';

storiesOf('TableAccounts', module)
  .addDecorator(withKnobs)
  .addDecorator(withTheme)
  .add('TableRowAccount', () => {
    const wrapClass = text('wrapClass', 'ph6 pv3');
    const className = text('className', '');
    const isExpanded = boolean('isExpanded', true);
    const rowProps = object('RowAccountProps', [
      {
        address: 'GSveuiyCpFG1maA4SrSBPjdc4F6Rz9VjRCep2bqjnute7Aw',
        name: 'Account Name',
        shortAddress: 'shrtAddrs2',
        fundsTotal: '1234',
        fundsTransferable: '1',
        fundsLocked: '2',
        fundsReserved: '3',
        fundsBonded: '4',
        nTx: '7',
      },
      {
        address: 'DGRpKycTNWHdJEScAB6NymW28gAH3MWez94x5a8uGJgQ3So',
        name: 'Main Stash',
        shortAddress: 'shrtAddrs2',
        fundsTotal: '894723.37',
        fundsTransferable: '391',
        fundsLocked: '348927',
        fundsReserved: '4328',
        fundsBonded: '4321',
        nTx: '22',
      },
      {
        address: 'EMiNiseJPawZP6u6NuPKjnrf9Gvw7nSBSne87wSjFGhVg14',
        name: 'Secret_1',
        shortAddress: 'shrtAddrs2',
        fundsTotal: '2921',
        fundsTransferable: '1.329816',
        fundsLocked: '2.32891',
        fundsReserved: '372',
        fundsBonded: '3281',
        nTx: '832719',
      },
      {
        address: 'EzbCNVZUKi7bbqfXBzmxxtnrmLqbRfPiELy2UZ59scSJdz7',
        name: 'Secret_2',
        shortAddress: 'shrtAddrs2',
        fundsTotal: '824',
        fundsTransferable: '123',
        fundsLocked: '22',
        fundsReserved: '31',
        fundsBonded: '43',
        nTx: '323',
      },
      {
        address: 'CkuoVYVVSF2ChsBwiKCvG5zikAr7yk5n4E8AkPEHvQfAhMv',
        name: 'Polkassembly Persona',
        shortAddress: 'shrtAddrs2',
        fundsTotal: '1000',
        fundsTransferable: '0',
        fundsLocked: '1000',
        fundsReserved: '0',
        fundsBonded: '0',
        nTx: '1',
      },
      {
        address: 'E2gMvExoiEJ64fyzBNZZQjvnRXx3hbZLjnsAqaDjnr4Tc4v',
        name: 'tmp',
        shortAddress: 'shrtAddrs2',
        fundsTotal: '809.287',
        fundsTransferable: '809.287',
        fundsLocked: '0',
        fundsReserved: '0',
        fundsBonded: '0',
        nTx: '7',
      },
    ]);
    return (
      <TableAccounts wrapClass={wrapClass} className={className}>
        <RowHeader isExpanded={isExpanded} />
        <TableAccounts.Body>
          {rowProps.map((r, i) => {
            return <RowAccount key={i} {...r} isExpanded={isExpanded} />;
          })}
        </TableAccounts.Body>
      </TableAccounts>
    );
  });
