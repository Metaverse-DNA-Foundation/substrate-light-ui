// Copyright 2018-2019 @paritytech/substrate-light-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { RxResult } from '@polkadot/api/rx/types';
import { SubmittableExtrinsic, SubmittableResult } from '@polkadot/api/SubmittableExtrinsic';
import { KeyringPair } from '@polkadot/keyring/types';
import { Balance } from '@polkadot/types';
import BN from 'bn.js';
import React, { createContext, useState } from 'react';
import { Subject } from 'rxjs';

import { logger } from '@polkadot/util';

const l = logger('tx-queue');

const INIT_ERROR = new Error('TxQueueContext called without Provider.');

type Extrinsic = SubmittableExtrinsic<RxResult, RxResult>;

export interface ExtrinsicDetails {
  allFees: BN;
  allTotal: BN;
  amount: Balance;
  recipientAddress: string;
  senderPair: KeyringPair;
}

/**
 * An item from the TxQueue
 */
export interface PendingExtrinsic {
  details: ExtrinsicDetails;
  extrinsic: Extrinsic;
  id: number;
  status: {
    isAskingForConfirm: boolean; // created for light-ui
    isFinalized: boolean; // comes from node
    isDropped: boolean; // comes from node
    isPending: boolean; // created for light-ui
    isUsurped: boolean;  // comes from node
  };
  unsubscribe: () => void;
}

export interface EnqueueParams extends ExtrinsicDetails {
  extrinsic: Extrinsic;
}

interface Props {
  children: React.ReactNode;
}

const successObservable = new Subject();
const errorObservable = new Subject();

export const TxQueueContext = createContext({
  enqueue: (extrinsic: Extrinsic, details: ExtrinsicDetails) => { console.error(INIT_ERROR); },
  txQueue: [] as PendingExtrinsic[],
  submit: (extrinsicId: number) => { console.error(INIT_ERROR); },
  clear: () => { console.error(INIT_ERROR); },
  successObservable,
  errorObservable
});

export function TxQueueContextProvider (props: Props) {

  const [txQueue, setTxQueue] = useState([] as PendingExtrinsic[]);

  const replaceTx = (id: number, newTx: PendingExtrinsic) => {
    setTxQueue((prevTxQueue: PendingExtrinsic[]) => prevTxQueue.map((tx: PendingExtrinsic) => (
      tx.id === id
        ? newTx
        : tx
    )));
  };

  const closeTxSubscription = (extrinsicId: number) => {
    const tx = txQueue.find((tx) => tx.id === extrinsicId);
    if (tx) tx.unsubscribe();
  };

  const [txCounter, setTxCounter] = useState(0);

  const enqueue = (extrinsic: Extrinsic, details: ExtrinsicDetails) => {
    const extrinsicId = txCounter;
    setTxCounter(txCounter + 1);

    l.log(`Queued extrinsic #${extrinsicId} from ${details.senderPair.address()} to ${details.recipientAddress} of amount ${details.amount}`, details);

    setTxQueue(txQueue.concat({
      details,
      extrinsic,
      id: extrinsicId,
      status: {
        isAskingForConfirm: true,
        isFinalized: false,
        isDropped: false,
        isPending: false,
        isUsurped: false
      },
      unsubscribe: () => { /* Do nothing on unsubscribe at this stage */ }
    }));
  };

  const submit = (extrinsicId: number) => {
    const pendingExtrinsic = txQueue.find((tx) => tx.id === extrinsicId);

    if (!pendingExtrinsic) {
      l.error(`There's no extrinsic with id #${extrinsicId}`);
      return;
    }

    const {
      details: { senderPair, amount, recipientAddress },
      extrinsic,
      status
    } = pendingExtrinsic;

    if (!status.isAskingForConfirm) {
      l.error(`Extrinsic #${extrinsicId} is being submitted, but its status is not isAskingForConfirm`);
      return;
    }

    l.log(`Extrinsic #${extrinsicId} is being sent`);

    const subscription = extrinsic
      .signAndSend(senderPair) // send the extrinsic
      .subscribe(
        (txResult: SubmittableResult) => {
          const { status: { isFinalized, isDropped, isUsurped } } = txResult;

          l.log(`Extrinsic #${extrinsicId} has new status:`, txResult);

          replaceTx(extrinsicId, {
            ...pendingExtrinsic, status: {
              isAskingForConfirm: false,
              isDropped,
              isFinalized,
              isPending: false,
              isUsurped
            }
          });

          if (isFinalized) {
            successObservable.next({ amount, recipientAddress, senderPair });
          }

          if (isFinalized || isDropped || isUsurped) {
            closeTxSubscription(extrinsicId);
          }
        },
        (error: Error) => {
          errorObservable.next({ error: error.message });
        },
        () => {
          // Lock pair, as we don't need it anymore
          // In the future, the locking strategy could be done in ui-keyring:
          // https://github.com/polkadot-js/apps/issues/1102
          senderPair.lock();
        }
      );

    replaceTx(extrinsicId, {
      ...pendingExtrinsic,
      status: {
        ...pendingExtrinsic.status,
        isAskingForConfirm: false,
        isPending: true
      },
      unsubscribe: () => { subscription.unsubscribe(); }
    });
  };

  const clear = () => {
    txQueue.forEach(({ unsubscribe }) => { unsubscribe(); });
    setTxQueue([]);
    l.log('Cleared all extrinsics');
  };

  return (
    <TxQueueContext.Provider value={{
      clear,
      enqueue,
      submit,
      txQueue,
      successObservable,
      errorObservable
    }}>
      {props.children}
    </TxQueueContext.Provider>
  );
}