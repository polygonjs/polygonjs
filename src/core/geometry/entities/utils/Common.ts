import {CoreEntity} from '../../CoreEntity'

type GetRelatedCallback<T extends CoreEntity, E extends CoreEntity> = (entity:T)=>E[]

export function uniqRelatedEntities<T extends CoreEntity, E extends CoreEntity>(entities:T[],callback:GetRelatedCallback<T,E>):E[]{
	
	const entityByIndex:Map<number, E>=new Map()
	for(const entity of entities){
		const relatedEntities = callback(entity)
		for(const relatedEntity of relatedEntities){
			let newEntity = entityByIndex.get(relatedEntity.index())
			if(!newEntity){
				newEntity = relatedEntity
				entityByIndex.set(newEntity.index(), newEntity)
			}
		}
	}
	const uniqPrimitives = Array.from(entityByIndex.values())
	return uniqPrimitives
}