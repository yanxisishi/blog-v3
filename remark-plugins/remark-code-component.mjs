import { visit } from 'unist-util-visit'

export default function remarkCodeComponent(components = {}) {
	return (tree) => {
		visit(tree, 'code', (node, index, parent) => {
			const options = components[node.lang ?? '']
			if (!options || !parent || index === undefined)
				return

			parent.children.splice(index, 1, {
				type: 'codeComponent',
				children: [],
				data: {
					hName: options.component,
					hProperties: { [options.prop]: node.value },
				},
			})
		})
	}
}
