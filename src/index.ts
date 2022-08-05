import fs from 'fs'
import path from 'path'
import * as ucans from 'ucans'
import { EdKeypair } from 'ucans/keypair/ed25519'
import type { Ucan } from 'ucans'

import * as commentary from './commentary'
import { RoomCapability, roomCapability, ROOM_SEMANTICS } from './capability'

const main = async () => {
  const args: string[] = process.argv.slice(2);

  const keypair = await loadKeypair()

  if (args.length === 0) {
    const token = await createRegistryUcan(keypair)
    console.log(token)

  } else {
    const proofToken = args[0]

    console.log('proof token', proofToken)

    if (!proofToken) {
      console.log("Hey! I'll need a UCAN for proof. Ask CrasterZM about it.")
      return
    }

    const proof = await ucans.validate(proofToken)
    const roomCap = proof.payload.att[0]

    if (roomCap) {
      const token = await createUcan(keypair, roomCap, proof)

      console.log("open room with", token)
    }



    // check proof

    // comment

    // emit UCAN
  }

  // console.log("keypair", keypair)
}


// KEYS

const loadKeypair = async (): Promise<EdKeypair> => {
  const root = path.resolve(__dirname, '..')
  const keyPath = root + '/SECRET_KEY'
  const didPath = root + '/DID'

  try {
    const secretKey = fs.readFileSync(keyPath).toString()
    const keypair = await EdKeypair.fromSecretKey(secretKey, { format: "base64pad" })
    const did = ucans.publicKeyBytesToDid(keypair.publicKey, "ed25519")

    console.log(`👋 Welcome back ${did}`)

    return keypair
  } catch {

    const keypair = await EdKeypair.create({ exportable: true })
    const secretKey = await keypair.export()
    const did = ucans.publicKeyBytesToDid(keypair.publicKey, "ed25519")
    fs.writeFileSync(keyPath, secretKey)
    fs.writeFileSync(didPath, did)

    console.log("👋 Welcome adventurer.")
    console.log(`🆔 We will know you as ${did} going forward.`)

    return keypair
  }
}


// UCAN

const createRegistryUcan = async (
  keypair: EdKeypair,
  options: {
    notBefore: number,
    expiration: number
  } = {
      notBefore: Math.floor(Date.now() / 1000) - 30,
      expiration: Math.floor(Date.now() / 1000) + 3600000
    }
): Promise<string> => {
  const { expiration, notBefore } = options

  // TODO: Fill in with actual DID
  const CRUSTERMZ_DID = 'did:key:z6MkfpzXqxbQ3BsTfuwuWKC7iqo3GyQus8fHNQczv3pAjznw'
  const cap = roomCapability('registry')

  const registryUcan = await ucans.Builder.create()
    .issuedBy(keypair)
    .toAudience(CRUSTERMZ_DID)
    .withNotBefore(notBefore)
    .withExpiration(expiration)
    .claimCapability(cap)
    .build()

  return ucans.encode(registryUcan)
}


const createUcan = async (
  keypair: EdKeypair,
  capability: RoomCapability,
  proof: Ucan,
  options: {
    notBefore: number,
    expiration: number,
  } = {
      notBefore: Math.floor(Date.now() / 1000) - 30,
      expiration: Math.floor(Date.now() / 1000) + 3600000,
    }
): Promise<string> => {
  const { expiration, notBefore } = options

  // TODO: Fill in with actual DID
  const CRUSTERMZ_DID = 'did:key:z6MkfpzXqxbQ3BsTfuwuWKC7iqo3GyQus8fHNQczv3pAjznw'

  const registryUcan = await ucans.Builder.create()
    .issuedBy(keypair)
    .toAudience(CRUSTERMZ_DID)
    .withNotBefore(notBefore)
    .withExpiration(expiration)
    .delegateCapability(capability, { ucan: proof, capability }, ROOM_SEMANTICS)
    .build()

  return ucans.encode(registryUcan)
}

main()