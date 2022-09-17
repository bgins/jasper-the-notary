import { delegationChains, rootIssuer } from "ucans"
import { SUPERUSER } from "ucans/capability/super-user"

import type { Capability, DelegationSemantics, Ucan } from "ucans"
import type { Ability } from "ucans/capability/ability"
import type { ResourcePointer } from "ucans/capability/resource-pointer"


export interface DoorCapability {
  with: ResourcePointer
  can: Ability
}

export const UNLOCK_ABILITY: Ability = { namespace: "door", segments: [ "OPEN" ] }

export const DOOR_SEMANTICS: DelegationSemantics = {

  canDelegateResource(parentResource, resource) {
    if (parentResource.scheme !== "key") {
      return false
    }
    if (resource.scheme !== "key") {
      return false
    }
    return parentResource.hierPart === resource.hierPart
  },

  canDelegateAbility(parentAbility, ability) {
    if (parentAbility === SUPERUSER) {
      return true
    }
    if (ability === SUPERUSER) {
      return false
    }
    return parentAbility.namespace === "door"
      && parentAbility.segments.length === 1
      && parentAbility.segments[0] === "OPEN"
      && ability.namespace === "door"
      && ability.segments.length === 1
      && ability.segments[0] === "OPEN"
  }

}


export function keyResourcePointer(keyName: string): ResourcePointer {
  return { scheme: "key", hierPart: keyName}
}

export function doorCapability(keyName: string): Capability {
  return {
    with: keyResourcePointer(keyName),
    can: UNLOCK_ABILITY
  }
}

export async function * doorCapabilities(ucan: Ucan): AsyncIterable<{ capability: DoorCapability; rootIssuer: string }> {
  for await (const delegationChain of delegationChains(DOOR_SEMANTICS, ucan)) {
    if (delegationChain instanceof Error || "ownershipDID" in delegationChain) {
      continue
    }
    yield {
      rootIssuer: rootIssuer(delegationChain),
      capability: delegationChain.capability
    }
  }
}
