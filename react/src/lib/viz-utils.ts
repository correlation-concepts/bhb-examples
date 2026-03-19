import { CompleteDocument, EntityData } from '@/types/bhb';

export function processEntityData(data: CompleteDocument): EntityData {
    const entities = new Map();
    const links = new Set<string>();
    const entityLinks: { source: string; target: string; type: string }[] = [];

    // Extract entities from notes
    data.notes.forEach(note => {
        note.tokens
            .filter(token => token.nameType && token.nameType !== 'UNKNOWN')
            .forEach(token => {
                entities.set(token._id, token);
            });

        // Create links between entities in the same note
        const noteEntities = note.tokens.filter(t => t.nameType && t.nameType !== 'UNKNOWN' && t._id);
        for (let i = 0; i < noteEntities.length; i++) {
            for (let j = i + 1; j < noteEntities.length; j++) {
                const id1 = noteEntities[i]._id;
                const id2 = noteEntities[j]._id;

                // Sort IDs to ensure stable link identifiers
                const [source, target] = id1 < id2 ? [id1, id2] : [id2, id1];
                const linkId = `${source}-${target}`;

                if (!links.has(linkId)) {
                    links.add(linkId);
                    entityLinks.push({
                        source,
                        target,
                        type: 'co-occurrence'
                    });
                }
            }
        }
    });

    return {
        nodes: Array.from(entities.values()).map(token => ({
            id: token._id,
            type: token.nameType.toLowerCase(),
            name: token.spelling
        })),
        links: entityLinks
    };
}
export interface EntityFilterState {
    types: {
        thing: boolean;
        person: boolean;
        place: boolean;
        name: boolean;
        organization: boolean;
        notapplicable: boolean;
    };
    search: string;
    selectedEntity: string | null;
}

export function filterEntityData(data: EntityData, filters: EntityFilterState): EntityData {
    // Filter nodes based on type and search
    const filteredNodes = data.nodes.filter(node =>
        node.name.toLowerCase().includes(filters.search.toLowerCase()) &&
        filters.types[node.type as keyof typeof filters.types]
    );

    const filteredNodeIds = new Set(filteredNodes.map(n => n.id));

    // If there's a selected entity, it should always be visible if it exists in the original data
    if (filters.selectedEntity) {
        // Note: In some implementations we might want to show connections, 
        // but here we follow the basic filter logic
    }

    // Filter links to only include connections between filtered nodes
    const filteredLinks = data.links.filter(link =>
        filteredNodeIds.has(link.source as string) && filteredNodeIds.has(link.target as string)
    );

    return {
        nodes: filteredNodes,
        links: filteredLinks as any
    };
}
