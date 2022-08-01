const fs = require('fs')

const didTransformers = require('ucans/did/transformers')
const ucans = require('ucans')
const uint8arrays = require('uint8arrays')
const { EdKeypair } = require('ucans/keypair/ed25519')

const main = async () => {
  const keypair = await loadKeypair()

  // console.log("keypair", keypair)
}

const loadKeypair = async (): Promise<typeof EdKeypair> => {
  const keyPath = __dirname + '/SECRET_KEY'
  const didPath = __dirname + '/DID'

  try {
    const secretKey = fs.readFileSync(keyPath).toString()
    const keypair = await EdKeypair.fromSecretKey(secretKey, { format: "base64pad" })
    const did = didTransformers.publicKeyBytesToDid(keypair.publicKey, "ed25519")

    console.log(`👋 Welcome back ${did}`)

    return keypair
  } catch {

    const keypair = await EdKeypair.create({ exportable: true })
    const secretKey = uint8arrays.toString(keypair.secretKey, "base64pad")
    const did = didTransformers.publicKeyBytesToDid(keypair.publicKey, "ed25519")
    fs.writeFileSync(keyPath, secretKey)
    fs.writeFileSync(didPath, did)

    console.log("👋 Welcome adventurer.")
    console.log(`🆔 We will know you as ${did} going forward.`)

    return keypair 
  }
}

main()