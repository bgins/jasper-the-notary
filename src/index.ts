import fs from 'fs'
import path from 'path'
import * as ucans from 'ucans'
import { EdKeypair } from 'ucans/keypair/ed25519'
import type { Ucan } from 'ucans'

import * as commentary from './commentary'
import { GateCapability, gateCapability, GATE_SEMANTICS } from './capability'

const main = async () => {
  const args: string[] = process.argv.slice(2);

  const keypair = await loadKeypair()

  if (args.length === 0) {
    const token = await createRegistryUcan(keypair)
    console.log(token)

  } else {
    const gateName = args[0]
    const proofToken = args[1]

    if (!gateName || !proofToken) {
      console.log("Hey! I'll need a gate name and a UCAN for proof. When you have both of them, ask for my help with\n")
      console.log("  npm run auth <gate-name> <proof-ucan>\n")
      console.log("Ask CrasterZM if you need the UCAN.")
      return
    }

    const proof = await ucans.validate(proofToken)
    const gateCap = proof.payload.att[0]

    if (gateName && gateCap) {
      const token = await createUcan(gateName, gateCap, keypair, proof)

      // commentary

      console.log("Open gate your gate with this token:\n\n", token)
    } else {
      console.error(`Unable to create a token for gate name ${gateName} with capability ${gateCap}`)
    }

  }
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
  const CRUSTERZM_DID = 'did:key:z6MkfwqiTV6J6cDuMJr3Asfyz1MaU1ekpDECPxcAMa7YKLtB'
  const cap = gateCapability('registry')

  const registryUcan = await ucans.Builder.create()
    .issuedBy(keypair)
    .toAudience(CRUSTERZM_DID)
    .withNotBefore(notBefore)
    .withExpiration(expiration)
    .withFact({gate: "registry"})
    .claimCapability(cap)
    .build()

  return ucans.encode(registryUcan)
}


const createUcan = async (
  gateName: String,
  capability: GateCapability,
  keypair: EdKeypair,
  proof: Ucan,
  options: {
    notBefore: number,
    expiration: number,
  } = {
      notBefore: Math.floor(Date.now() / 1000) - 30,
      expiration: Math.floor(Date.now() / 1000) + 3000,
    }
): Promise<string> => {
  const { expiration, notBefore } = options

  // TODO: Fill in with actual DID
  const CRUSTERZM_DID = 'did:key:z6MkwDK3M4PxU1FqcSt4quXghquH1MoWXGzTrNkNWTSy2NLD'

  const registryUcan = await ucans.Builder.create()
    .issuedBy(keypair)
    .toAudience(CRUSTERZM_DID)
    .withNotBefore(notBefore)
    .withExpiration(expiration)
    .withFact({gate: gateName})
    .delegateCapability(capability, { ucan: proof, capability }, GATE_SEMANTICS)
    .build()

  return ucans.encode(registryUcan)
}

main()