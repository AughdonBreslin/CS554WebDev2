import {useDispatch} from 'react-redux';
import actions from '../actions';
import {Link} from 'react-router-dom';

function Collector(props) {
    const dispatch = useDispatch();
    
    const deleteCollector = () => {
        dispatch(actions.deleteCollector(props.collector.id));
    };
    
    const selectCollector = () => {
        dispatch(actions.selectCollector(props.collector.id));
    }
    return (
        <div className='collector-wrapper'>
        <table className='collector-table'>
            <tbody className='collector-body'>
                <tr>
                    <thead className='card-title'>{props.collector.name}</thead>
                    <td>Selected: {props.collector.selected ? 'Yes' : 'No'}</td>
                </tr>
                <tr>
                    <td>Characters:</td>
                    <td>{props.collector.characters && props.collector.characters.map((character) => {
                        return <Link className='collector-link' to={`/marvel-characters/${character.id}`}>{character.name}</Link>;
                    })}</td>
                </tr>
                <tr>
                    <td>
                        <button className='card-button' onClick={selectCollector}>Select Collector</button>
                    </td>
                    <td>
                        <button className='card-button' onClick={deleteCollector}>Delete Collector</button>
                    </td>
                </tr>
            </tbody>
        </table>
        </div>
    );
}

export default Collector;