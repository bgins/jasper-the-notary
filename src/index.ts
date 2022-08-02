import fs from 'fs'
import path from 'path'
import * as ucans from 'ucans'
import { EdKeypair } from 'ucans/keypair/ed25519'

import * as commentary from './commentary'
import { roomCapability } from './capability'

const main = async () => {
  const args: string[] = process.argv.slice(2);

  const keypair = await loadKeypair()

  if (args.length === 0) {
    const token = await createUcan(keypair, 'registry')
    console.log(token)

  } else {
    const route = args[0]
    const proof = args[1]

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

const createUcan = async (
  keypair: EdKeypair,
  room: string,
  options: {
    notBefore: number,
    expiration: number
  } = {
      notBefore: Math.floor(Date.now() / 1000) - 30,
      expiration: Math.floor(Date.now() / 1000) + 3600
    }
): Promise<string> => {
  const { expiration, notBefore } = options

  // TODO: Fill in with actual DID
  const CRUSTERMZ_DID = 'did:key:z6MkfpzXqxbQ3BsTfuwuWKC7iqo3GyQus8fHNQczv3pAjznw'
  const cap = roomCapability(room)

  const registryUcan = await ucans.Builder.create()
    .issuedBy(keypair)
    .toAudience(CRUSTERMZ_DID)
    .withNotBefore(notBefore)
    .withExpiration(expiration)
    .claimCapability(cap)
    .build()

  return ucans.encode(registryUcan)
}

main()