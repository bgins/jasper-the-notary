import { delegationChains, rootIssuer } from "ucans"
import { SUPERUSER } from "ucans/capability/super-user"

import type { Capability, DelegationSemantics, Ucan } from "ucans"
import type { Ability } from "ucans/capability/ability"
import type { ResourcePointer } from "ucans/capability/resource-pointer"


export interface RoomCapability {
  with: ResourcePointer
  can: Ability
}

export const ENTER_ABILITY: Ability = { namespace: "room", segments: [ "ENTER" ] }

export const ROOM_SEMANTICS: DelegationSemantics = {

  canDelegateResource(parentResource, resource) {
    if (parentResource.scheme !== "room") {
      return false
    }
    if (resource.scheme !== "room") {
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
    return parentAbility.namespace === "room"
      && parentAbility.segments.length === 1
      && parentAbility.segments[0] === "ENTER"
      && ability.namespace === "room"
      && ability.segments.length === 1
      && ability.segments[0] === "ENTER"
  }

}


export function roomResourcePointer(roomName: string): ResourcePointer {
  return { scheme: "room", hierPart: roomName}
}

export function roomCapability(roomName: string): Capability {
  return {
    with: roomResourcePointer(roomName),
    can: ENTER_ABILITY
  }
}

export async function * roomCapabilities(ucan: Ucan): AsyncIterable<{ capability: RoomCapability; rootIssuer: string }> {
  for await (const delegationChain of delegationChains(ROOM_SEMANTICS, ucan)) {
    if (delegationChain instanceof Error || "ownershipDID" in delegationChain) {
      continue
    }
    yield {
      rootIssuer: rootIssuer(delegationChain),
      capability: delegationChain.capability
    }
  }
}
