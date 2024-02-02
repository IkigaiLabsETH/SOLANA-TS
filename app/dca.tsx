import { CloseDCAParams, CreateDCAParamsV2, DCA, DepositParams, WithdrawParams, Network } from 'jup-dca-sdk';
import { Connection, Keypair, PublicKey, sendAndConfirmTransaction } from '@solana/web3.js';
import dotenv from 'dotenv';
dotenv.config();

const connection = new Connection('https://api.devnet.solana.com');

const dca = new DCA(connection, Network.DEVNET);

const user = Keypair.fromSecretKey(new Uint8Array(JSON.parse(process.env.USER_PRIVATE_KEY)));

const USDC_DEVNET = new PublicKey('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr');

const RANDOM_TOKEN = new PublicKey('EJwZgeZrdC8TXTQbQBoL6bfuAnFUUy1PVCMB4DYPzVaS');

async function createDCA() {
  const params: CreateDCAParamsV2 = {
    payer: payer.publicKey, // this is the payer of the tx aka opening on behalf. this can be user as well ie user.publicKey
    user: user.publicKey,
    inAmount: BigInt(5_000_000),
    inAmountPerCycle: BigInt(1_000_000),
    cycleSecondsApart: BigInt(86400),
    inputMint: USDC_DEVNET,
    outputMint: RANDOM_TOKEN,
    minOutAmountPerCycle: null,
    maxOutAmountPerCycle: null,
    startAt: null,
    userInTokenAccount, // optional: Public key of user's input_mint token account. if the user's input_mint token account is an associated token account, feel free to leave this out. if it's not an ATA, then make sure to pass it in.
  };

  const { tx, dcaPubKey } = await dca.createDcaV2(params);
  const txid = await sendAndConfirmTransaction(connection, tx, [user, payer]);

  console.log('Create DCA: ', { txid });

  return dcaPubKey;
}

/*
This is for withdrawing from your DCA account.
By default, output tokens are sent to you account automatically.
Withdraw is useful if you want to partially withdraw the input token but would still like to continue the DCA.
Or if for some reason, the output token was not sent to you automatically, you can use this instruction to withdraw them at anytime.
If you want to stop the DCA completely, use `closeDCA` instead (see below).
*/
async function withdraw(dcaPubKey) {
  // it's possible to withdraw in-tokens only or out-tokens only or both in and out tokens together. See WithdrawParams for more details
  const params: WithdrawParams = {
    user: user.publicKey,
    dca: dcaPubKey,
    inputMint: USDC_DEVNET,
    withdrawInAmount: BigInt(1_000_000),
  };

  const { tx } = await dca.withdraw(params);

  const txid = await sendAndConfirmTransaction(connection, tx, [user]);

  console.log('Withdraw: ', { txid });
}

async function closeDCA(dcaPubKey) {
  const params: CloseDCAParams = {
    user: user.publicKey,
    dca: dcaPubKey,
  };

  const { tx } = await dca.closeDCA(params);

  const txid = await sendAndConfirmTransaction(connection, tx, [user]);

  console.log('Close DCA: ', { txid });
}

async function main() {
  const dcaPubKey = await createDCA();
  console.log('DCA Pub Key: ', { dcaPubKey });

  const dcaAccount = await dca.fetchDCA(dcaPubKey);
  console.log('DCA Account Data: ', { dcaAccount });

  const dcaAccounts = await dca.getCurrentByUser(user.publicKey);
  console.log({ dcaAccounts });

  await dca.getBalancesByAccount(dcaPubKey);

  await withdraw(dcaPubKey);

  await closeDCA(dcaPubKey);
}

main();