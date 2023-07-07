import {v4 as uuid} from 'uuid';

const initalState = [
    {
        id: uuid(),
        name: 'Audie',
        selected: true,
        characters: []
    }
];

let copyState = null;
let index = 0;

const collectorReducer = (state = initalState, action) => {
    const {type, payload} = action;

    switch (type) {
        case 'CREATE_COLLECTOR':
            console.log('payload', payload);
            return [...state, {id: uuid(), name: payload.name, selected: false, characters: []}];
        case 'DELETE_COLLECTOR':
            copyState = [...state];
            index = copyState.findIndex((x) => x.id === payload.id);
            if (!copyState[index].selected) {
                copyState.splice(index, 1);
            }
            return [...copyState];
        case 'SELECT_COLLECTOR':
            return state.map((collector) => {
                if (collector.id === payload.id) {
                    return {
                        ...collector,
                        selected: true
                    };
                } else {
                    return {
                        ...collector,
                        selected: false
                    };
                }
            });
        case 'ADD_CHARACTER':
            return state.map((collector) => {
                if (collector && collector.id && collector.id === payload.id && 
                    (!collector.characters || 
                        (collector.characters.length < 10 &&
                            !collector.characters.find((character) => character.id === payload.character.id)))) {
                    
                    return {
                        ...collector,
                        characters: [...collector.characters, payload.character]
                    };
                } else return collector;
            });
        case 'REMOVE_CHARACTER':
            return state.map((collector) => {
                if (collector && collector.id && collector.id === payload.id) {
                    return {
                        ...collector,
                        characters: collector.characters.filter((character) => character.id !== payload.character.id)
                    };
                } else return collector;
            });

        default:
            return state;
    }
};

export default collectorReducer;