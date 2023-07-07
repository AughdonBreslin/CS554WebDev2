import {useState} from 'react';
import {useSelector} from 'react-redux';
import AddCollector from './AddCollector';
import Collector from './Collector';


function Collectors() {
    const [addBtnToggle, setBtnToggle] = useState(false);
    const allCollectors = useSelector((state) => state.collectors);
    console.log('allCollectors', allCollectors);
    return (
        <div className='todo-wrapper'>
            <h2>Collectors</h2>
            <button className='collector-button' onClick={() => setBtnToggle(!addBtnToggle)}>Add A Collector</button>
            <br />
            <br />
            <br />
            {addBtnToggle && <AddCollector />}
            <br />
            {allCollectors.map((collector) => {
                console.log(collector);
                return <Collector key={collector.id} collector={collector} />;
            }
            )}
        </div>
    );
}

export default Collectors;