import {useState} from 'react';
import {useDispatch} from 'react-redux';
import actions from '../actions';

function AddCollector() {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({name:''});

  const handleChange = (e) => {
    setFormData((prev) => ({...prev, [e.target.name]: e.target.value}));
  };
  const addCollector = () => {
    dispatch(actions.addCollector(formData.name));
    document.getElementById('name').value = '';
  };
  console.log(formData);
  return (
      <div className='collector-form'>
        <label>
          Name:
          <input
            onChange={(e) => handleChange(e)}
            id='name'
            name='name'
            placeholder='Name...'
          />
        </label>
        <button className='card-button' onClick={addCollector}>Add Collector</button>
      </div>
  );
}

export default AddCollector;
