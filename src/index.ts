import fs from 'fs'
import path from 'path'
import * as ucans from 'ucans'
import { EdKeypair } from 'ucans/keypair/ed25519'
import type { Ucan } from 'ucans'

import { DoorCapability, doorCapability, DOOR_SEMANTICS } from './capability'
import { exit } from 'process'
import { getComment } from './commentary'

const main = async () => {
  const args: string[] = process.argv.slice(2);

  const serverDid = loadServerDid()
  const keypair = await loadKeypair()

  if (args.length === 0) {
    const token = await createRegistryUcan(keypair, serverDid)
    console.log('\n', token)

  } else {
    const doorName = args[0]
    const proofToken = args[1]

    if (!doorName || !proofToken) {
      console.log("\nHey! I'll need a door name and a UCAN for proof. When you have both of them, ask for my help with\n")
      console.log("  npm run auth <door-name> <proof-ucan>\n")
      console.log("Ask BLINKERTON_LKM if you need a UCAN.")
      return
    }

    const proof = await ucans.validate(proofToken)
    const doorCap = proof.payload.att[0]

    if (doorName && doorCap) {
      const token = await createUcan(doorName, doorCap, keypair, serverDid, proof)

      // commentary

      console.log(getComment(), '\n')
      console.log(`If it exists, you'll be able to open the /${doorName} door with this token:\n\n`, token)
    } else {
      console.error(`\nUnable to create a token for door name ${doorName} with capability ${doorCap}`)
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

    console.log("👋 Great! Let's get you ready for registration.")
    console.log(`🆔 Your DID is ${did}`)
    console.log("📁 I've created a DID and a SECRET_KEY for you. Keep the SECRET_KEY between us, we don\'t want that getting out.")
    console.log("🎫 Here's your UCAN for the /registry:")

    return keypair
  }
}

const loadServerDid = (): string => {
  try {
    const root = path.resolve(__dirname, '..')
    const serverDidPath = root + '/BLINKERTON_LKM'
    const serverDid = fs.readFileSync(serverDidPath).toString().trim()

    return serverDid
  } catch {
    console.log("🙈 Where is BLINKERTON_LKM? We'll need that file to get started.")

    exit(1)
  }
}

// UCAN

const createRegistryUcan = async (
  keypair: EdKeypair,
  serverDid: string
): Promise<string> => {
  const notBefore =  Math.floor(Date.now() / 1000) - 30
  const expiration = Math.floor(Date.now() / 1000) + 600
  const cap = doorCapability('registry')

  const registryUcan = await ucans.Builder.create()
    .issuedBy(keypair)
    .toAudience(serverDid)
    .withNotBefore(notBefore)
    .withExpiration(expiration)
    .withFact({door: "registry"})
    .claimCapability(cap)
    .build()

  return ucans.encode(registryUcan)
}


const createUcan = async (
  doorName: String,
  capability: DoorCapability,
  keypair: EdKeypair,
  serverDid: string,
  proof: Ucan
): Promise<string> => {
  const notBefore =  Math.floor(Date.now() / 1000) - 30
  const expiration = Math.floor(Date.now() / 1000) + 600

  const registryUcan = await ucans.Builder.create()
    .issuedBy(keypair)
    .toAudience(serverDid)
    .withNotBefore(notBefore)
    .withExpiration(expiration)
    .withFact({door: doorName})
    .delegateCapability(capability, { ucan: proof, capability }, DOOR_SEMANTICS)
    .build()

  return ucans.encode(registryUcan)
}

main()