
const addCollector = (name) => ({
    type: 'CREATE_COLLECTOR',
    payload: {
        name: name,
        selected: false,
        characters: []
    }
});

const deleteCollector = (id) => ({
    type: 'DELETE_COLLECTOR',
    payload: {id: id}
});

const selectCollector = (id) => ({
    type: 'SELECT_COLLECTOR',
    payload: {id: id}
});

const addCharacter = (id, character) => ({
    type: 'ADD_CHARACTER',
    payload: {id: id, character: character}
});

const removeCharacter = (id, character) => ({
    type: 'REMOVE_CHARACTER',
    payload: {id: id, character: character}
});

module.exports = {
    addCollector,
    deleteCollector,
    selectCollector,
    addCharacter,
    removeCharacter
};