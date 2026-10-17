import type { Properties } from 'hast'
import type { MinimarkTree } from 'minimark'

export interface MetaSlotsTree extends MinimarkTree {
	props?: Properties
}

declare module 'vfile' {
	interface DataMap {
		slots?: Record<string, MetaSlotsTree>
	}
}
